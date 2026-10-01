import { expect, test, type Page } from "@playwright/test";

const password = "cloud-forest-local-password";
const conversationHeaders = { "x-cloud-forest-care-conversations": "1" };

async function signIn(page: Page, account: "river" | "empty") {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email: `${account}@example.test`, password },
  });
  expect(response.ok()).toBe(true);
}

async function character(page: Page, name: string) {
  const list = await page.request.get("/api/v1/curated-persons");
  const existing = (await list.json()).data.people.find(
    (person: { nickname: string }) => person.nickname === name,
  );
  if (existing) return existing.id as string;
  const created = await page.request.post("/api/v1/curated-persons", {
    data: {
      firstName: name.split(" ")[0],
      lastName: "Tester",
      nickname: name,
      relationshipShape: "Friend",
      privateDescription: "",
      placement: "party",
    },
  });
  expect(created.ok(), await created.text()).toBe(true);
  return (await created.json()).data.changedPersonId as string;
}

async function connect(river: Page, empty: Page) {
  const riverCharacter = await character(river, "Empty Tester");
  const emptyCharacter = await character(empty, "River Tester");
  const pairing = await river.request.post("/api/v1/connection-pairings", {
    data: { curatedPersonId: riverCharacter },
  });
  expect(pairing.ok(), await pairing.text()).toBe(true);
  const data = (await pairing.json()).data;
  if (data.state === "already-connected") return;
  const path = `/api/v1/connection-pairings/${data.token}`;
  const resolved = await empty.request.post(`${path}/resolve`, {
    data: { curatedPersonId: emptyCharacter },
  });
  expect(resolved.ok(), await resolved.text()).toBe(true);
  for (const participant of [river, empty]) {
    const confirmed = await participant.request.post(`${path}/confirm`);
    expect(confirmed.ok(), await confirmed.text()).toBe(true);
  }
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const dialog = page.getByRole("dialog", { name: "Care conversation" });
  const box = await dialog.boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.width).toBe(page.viewportSize()?.width);
  await expect(
    dialog.getByRole("button", { name: "Send", exact: true }),
  ).toBeInViewport();
}

async function openConversation(page: Page, careId: string) {
  await page.locator(`[data-care-conversation-action="${careId}"]`).click();
  const dialog = page.getByRole("dialog", { name: "Care conversation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Loading messages…")).toHaveCount(0);
  await noOverflow(page);
  return dialog;
}

for (const originatingAccount of ["empty", "river"] as const) {
  for (const direction of ["give", "receive"] as const) {
    test(`${originatingAccount} originates ${direction}: both participants use every conversation entry and terminal closure`, async ({
      page: river,
      browser,
      baseURL,
    }, testInfo) => {
      test.setTimeout(90_000);
      const otherContext = await browser.newContext({
        baseURL,
        viewport: river.viewportSize()!,
        isMobile: Boolean(testInfo.project.use.isMobile),
        hasTouch: Boolean(testInfo.project.use.hasTouch),
      });
      const empty = await otherContext.newPage();
      const errors: string[] = [];
      for (const participant of [river, empty]) {
        participant.on("pageerror", (error) => errors.push(error.message));
        participant.on("console", (message) => {
          if (message.type() === "error" && !message.text().includes("404"))
            errors.push(message.text());
        });
      }
      try {
        await signIn(river, "river");
        await signIn(empty, "empty");
        await connect(river, empty);
        const originator = originatingAccount === "river" ? river : empty;
        const claimant = originatingAccount === "river" ? empty : river;
        const created = await originator.request.post("/api/v1/cares", {
          headers: conversationHeaders,
          data: {
            direction,
            category: "food",
            subtype: "",
            location: "Conversation test",
            requirements: "A shared meal",
            audience: "Party",
            expiresIn: "1w",
          },
        });
        expect(created.ok(), await created.text()).toBe(true);
        const careId = (await created.json()).data.cares.find(
          (care: { status: string }) => care.status === "open",
        ).id as string;
        const claimed = await claimant.request.post(
          `/api/v1/cares/${careId}/claim`,
          { headers: conversationHeaders },
        );
        expect(claimed.ok(), await claimed.text()).toBe(true);
        for (const participant of [river, empty]) {
          await participant.bringToFront();
          const response = await participant.request.get("/api/v1/cares", {
            headers: conversationHeaders,
          });
          expect(
            (await response.json()).data.cares.find(
              (care: { id: string }) => care.id === careId,
            ).conversationAvailable,
          ).toBe(true);
          await participant.goto("/");
          await expect(participant).toHaveTitle("Cloud Forest");
          await expect(
            participant.getByRole("region", { name: "Timeline view" }),
          ).toBeVisible();
          await expect(participant.locator("vite-error-overlay")).toHaveCount(
            0,
          );

          // Timeline detail -> conversation -> the same detail and focused entry.
          await participant
            .locator(`[data-care-detail-action="${careId}"]`)
            .click();
          let dialog = await openConversation(participant, careId);
          await expect(dialog).not.toContainText("A shared meal");
          await dialog
            .getByRole("button", { name: "Back", exact: true })
            .click();
          await expect(
            participant.getByRole("region", { name: "Care details" }),
          ).toBeVisible();
          await expect(
            participant.locator(`[data-care-conversation-action="${careId}"]`),
          ).toBeFocused();
          await participant
            .getByRole("button", { name: "Back to Timeline" })
            .click();

          // My Care preserves the selected role tab when Back closes conversation.
          await participant
            .getByRole("button", { name: "Open My Care" })
            .click();
          const giver = (participant === originator) === (direction === "give");
          const tab = participant.getByRole("tab", {
            name: giver ? "Give" : "Receive",
            exact: true,
          });
          await tab.click();
          dialog = await openConversation(participant, careId);
          await dialog
            .getByRole("button", { name: "Back", exact: true })
            .click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await participant
            .getByRole("button", { name: "Back", exact: true })
            .click();

          // Party member detail has the same entry, including for the claimant.
          await participant
            .getByRole("button", { name: "Go to Curator", exact: true })
            .filter({ visible: true })
            .click();
          const partnerName =
            participant === river ? "Empty Tester" : "River Tester";
          await participant
            .getByRole("button", { name: `Open ${partnerName}`, exact: true })
            .click();
          dialog = await openConversation(participant, careId);
          await dialog
            .getByRole("textbox", { name: "Message", exact: true })
            .fill(`Hello from ${participant === river ? "River" : "Empty"}`);
          await dialog
            .getByRole("button", { name: "Send", exact: true })
            .click();
          await expect(
            dialog.getByRole("textbox", { name: "Message", exact: true }),
          ).toHaveValue("");
          await expect(
            dialog.getByText(
              `Hello from ${participant === river ? "River" : "Empty"}`,
              { exact: true },
            ),
          ).toBeVisible();
          await noOverflow(participant);
          if (originatingAccount === "empty" && direction === "give") {
            await testInfo.attach(
              `${participant === river ? "river" : "empty"}-conversation`,
              {
                body: await participant.screenshot(),
                contentType: "image/png",
              },
            );
          }
        }

        // Two independent sessions exchange messages through the real server.
        await river.bringToFront();
        await expect(
          river.getByText("Hello from Empty", { exact: true }),
        ).toBeVisible({ timeout: 15_000 });
        await empty.bringToFront();
        await expect(
          empty.getByText("Hello from River", { exact: true }),
        ).toBeVisible({ timeout: 15_000 });
        await expect
          .poll(async () => {
            const response = await empty.request.get("/api/v1/cares/unread");
            return (await response.json()).data.conversations.find(
              (care: { careId: string }) => care.careId === careId,
            )?.unreadCount;
          })
          .toBe(0);

        const partial = await originator.request.post(
          `/api/v1/cares/${careId}/complete`,
        );
        expect(partial.ok()).toBe(true);
        const stillOpen = await claimant.request.get(
          `/api/v1/cares/${careId}/messages`,
        );
        expect(stillOpen.status()).toBe(200);
        await claimant
          .getByRole("dialog")
          .getByRole("button", { name: "Back", exact: true })
          .click();
        await expect(
          claimant.locator(`[data-care-conversation-action="${careId}"]`),
        ).toBeVisible();
        await openConversation(claimant, careId);

        const closed = await claimant.request.post(
          `/api/v1/cares/${careId}/complete`,
        );
        expect(closed.ok()).toBe(true);
        for (const participant of [river, empty]) {
          await participant.bringToFront();
          await participant.evaluate(() =>
            window.dispatchEvent(new Event("focus")),
          );
          await expect(
            participant.getByRole("dialog", { name: "Care conversation" }),
          ).toHaveCount(0, { timeout: 15_000 });
          await expect(
            participant.locator(`[data-care-conversation-action="${careId}"]`),
          ).toHaveCount(0);
          await expect(
            participant.getByRole("region", {
              name: `${participant === river ? "Empty Tester" : "River Tester"} details`,
            }),
          ).toBeVisible();
          const messages = await participant.request.get(
            `/api/v1/cares/${careId}/messages`,
          );
          expect(messages.status()).toBe(404);
        }
        expect(errors).toEqual([]);
      } finally {
        await otherContext.close();
      }
    });
  }
}
