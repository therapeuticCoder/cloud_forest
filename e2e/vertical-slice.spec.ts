import { expect, test, type Page, type TestInfo } from "@playwright/test";

const miraContent =
  "hey, saw your face on the call. want me to drop soup off and not make it a whole thing?";
const miraEndpoint = "/api/v1/timeline-items/timeline-item-mira-soup-001";

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console.error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith("http://127.0.0.1:5173/api/")) {
      failures.push(
        `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown failure"}`,
      );
    }
  });

  return failures;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function seedAndExpectDevelopmentPwaCleanup(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register(
      "/e2e-stale-service-worker.js",
      { scope: "/" },
    );
    await navigator.serviceWorker.ready;
    if (!registration.active) {
      await new Promise<void>((resolve) => {
        registration.addEventListener("updatefound", () => {
          registration.installing?.addEventListener("statechange", () => {
            if (registration.active) resolve();
          });
        });
      });
    }
  });

  await expect
    .poll(() =>
      page.evaluate(async () =>
        navigator.serviceWorker
          ? (await navigator.serviceWorker.getRegistrations()).length
          : 0,
      ),
    )
    .toBe(1);

  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(async () =>
        navigator.serviceWorker
          ? (await navigator.serviceWorker.getRegistrations()).length
          : 0,
      ),
    )
    .toBe(0);

  await page.reload();
  const state = await page.evaluate(async () => ({
    controlled: Boolean(navigator.serviceWorker?.controller),
    registrations: navigator.serviceWorker
      ? (await navigator.serviceWorker.getRegistrations()).length
      : 0,
  }));

  expect(state).toEqual({ controlled: false, registrations: 0 });
}

async function expectHiddenChromeRecoversFromKeyboard(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 700));
  const hiddenChrome = page.locator(".timeline-chrome[data-hidden='true']");
  await expect(hiddenChrome.first()).toBeAttached();

  await page.locator("body").focus();
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Tab");
    const focusIsInChrome = await page.evaluate(() =>
      Boolean(document.activeElement?.closest(".timeline-chrome")),
    );
    if (focusIsInChrome) break;
  }

  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(document.activeElement?.closest(".timeline-chrome")),
      ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.activeElement?.closest(".timeline-chrome")?.dataset.hidden,
    ),
  ).toBe("false");
}

test("database-backed Timeline and prototype regression path", async ({
  page,
}, testInfo: TestInfo) => {
  const browserFailures = collectBrowserFailures(page);
  await seedAndExpectDevelopmentPwaCleanup(page);
  await page.waitForLoadState("networkidle");
  const miraResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith(miraEndpoint) &&
      response.request().method() === "GET",
  );

  await page.reload();
  await expect(page).toHaveTitle("Cloud Forest");
  await expect(
    page.getByRole("region", { name: "Timeline view" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Timeline", exact: true }),
  ).toBeVisible();

  const miraResponse = await miraResponsePromise;
  expect(miraResponse.status()).toBe(200);
  expect(await miraResponse.json()).toEqual({
    apiVersion: "v1",
    data: {
      timelineItem: {
        id: "timeline-item-mira-soup-001",
        actor: {
          id: "mira",
          displayName: "Mira",
          layer: "party",
          initials: "M",
        },
        content: miraContent,
        publishedAt: "2026-05-30T17:00:00.000Z",
      },
    },
  });

  const miraCard = page.locator("article").filter({ hasText: miraContent });
  await expect(miraCard).toContainText("Mira");
  await expect(miraCard).toContainText(miraContent);
  await expect(page.getByText("Ren", { exact: true })).toBeVisible();
  await expect(page.getByText("Yesterday", { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Receive", exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "timeline.png",
  );

  await page
    .getByRole("button", { name: "Go to Curator", exact: true })
    .filter({ visible: true })
    .click();
  const anyaTile = page.getByRole("button", { name: "Open Anya Reed" });
  await anyaTile.click();
  const anyaProfileRequest = page.getByRole("article", {
    name: "Incoming meal care request from Anya Reed",
  });
  await expect(anyaProfileRequest).toBeVisible();
  await expect(
    anyaProfileRequest.getByRole("button", { name: "I can help" }),
  ).toBeVisible();
  await expect(
    anyaProfileRequest.getByRole("button", { name: "Pass this time" }),
  ).toBeVisible();
  await expect(page.getByText("Private history")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "curator-anya-care-profile.png",
  );
  await anyaProfileRequest.getByRole("button", { name: "I can help" }).click();
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(
    anyaProfileRequest.getByRole("button", { name: "I can help" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Back to Curator" }).click();
  await expect(anyaTile).toBeFocused();
  await page.getByRole("button", { name: "Go to Timeline" }).click();

  const fullCareRequest = page.getByRole("article", {
    name: "Incoming meal care request from Anya Reed",
  });
  await fullCareRequest.getByRole("button", { name: "I’ve seen this" }).click();
  const minimizedCareRequest = page.getByRole("article", {
    name: "Incoming meal care request from Anya Reed, minimized",
  });
  await expect(minimizedCareRequest).toBeVisible();
  await expect(minimizedCareRequest).not.toContainText("Nothing spicy");
  await expect(
    minimizedCareRequest.getByRole("button", { name: "Show details" }),
  ).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "timeline-care-minimized.png",
  );

  await page.reload();
  await expect(minimizedCareRequest).toBeVisible();
  await minimizedCareRequest
    .getByRole("button", { name: "Show details" })
    .click();
  await expect(fullCareRequest).toContainText("Nothing spicy");
  await expect(
    fullCareRequest.getByRole("button", { name: "I’ve seen this" }),
  ).toBeFocused();

  await fullCareRequest.getByRole("button", { name: "Pass this time" }).click();
  await expect(fullCareRequest).toHaveCount(0);
  await expect(
    page.getByText(
      "You passed on Anya’s request this time. Other Party members can still respond.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Filter to Receive requests" }),
  ).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "timeline-care-passed.png",
  );

  await page.reload();
  await expect(fullCareRequest).toHaveCount(0);

  const perspective = page.getByLabel("Reviewing as");
  for (const partyViewer of ["mira", "sol", "dev"]) {
    await perspective.selectOption(partyViewer);
    await expect(fullCareRequest).toBeVisible();
    await fullCareRequest
      .getByRole("button", { name: "Pass this time" })
      .click();
  }
  await expect(
    page.getByText(
      "Your Party passed on Anya’s request. It is now shared with the original Tribe audience.",
    ),
  ).toBeVisible();
  await perspective.selectOption("nearby-family-1");
  await expect(fullCareRequest).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "timeline-care-demoted.png",
  );

  await fullCareRequest.getByRole("button", { name: "I can help" }).click();
  await page.getByRole("button", { name: "I’ll help with this" }).click();
  await expect(page.getByText("You’re helping Anya.")).toBeFocused();
  await perspective.selectOption("anya");
  const requesterClaimedRequest = page.getByRole("article", {
    name: "Claimed meal care request",
  });
  await expect(requesterClaimedRequest).toContainText(
    "Someone is helping with this request.",
  );
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("main.cloud-forest-app")).toHaveScreenshot(
    "timeline-care-claimed-requester.png",
  );

  await perspective.selectOption("mira");
  await expect(requesterClaimedRequest).toHaveCount(0);
  await expect(fullCareRequest).toHaveCount(0);
  await perspective.selectOption("nearby-family-1");
  await expect(page.getByText("You’re helping Anya.")).toBeVisible();

  await expectHiddenChromeRecoversFromKeyboard(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page
    .getByRole("button", { name: "Go to Curator", exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Curator view" }),
  ).toBeVisible();
  const miraTile = page.getByRole("button", { name: "Open Mira Vale" });
  await expect(miraTile).toBeVisible();
  await miraTile.click();
  await expect(
    page.getByRole("region", { name: "Mira Vale details" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Curator view" }),
  ).toBeVisible();
  await expect(miraTile).toBeFocused();
  await expectNoHorizontalOverflow(page);

  expect(
    browserFailures,
    `Browser health failures in ${testInfo.project.name}:\n${browserFailures.join("\n")}`,
  ).toEqual([]);
});
