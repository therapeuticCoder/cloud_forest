import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function signInAsFictionalPartyOwner(page: Page) {
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: "river@example.test",
      password: "cloud-forest-local-password",
    },
  });
  expect(signIn.ok()).toBe(true);
  await page.goto("/");
}

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

async function expectMyCarePreservesTimelineScroll(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 500));
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(0);

  await page
    .getByRole("button", { name: "Open My Care" })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole("region", { name: "My Care" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(
    page.getByRole("region", { name: "Timeline view" }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollY);
}

test("database-backed Timeline and private Character path", async ({
  page,
}, testInfo: TestInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAndExpectDevelopmentPwaCleanup(page);
  const browserFailures = collectBrowserFailures(page);
  await signInAsFictionalPartyOwner(page);
  await expect(page).toHaveTitle("Cloud Forest");
  await expect(
    page.getByRole("region", { name: "Timeline view" }),
  ).toBeVisible();
  const timeline = await page.request.get("/api/v1/timeline-items");
  expect(timeline.status()).toBe(200);
  expect((await timeline.json()).apiVersion).toBe("v1");
  await expectNoHorizontalOverflow(page);

  // These fixture entries are private Characters, not connected Care authors.
  // Shared Care is created through two actual sessions in care-conversations.spec.ts.
  await page
    .getByRole("button", { name: "Go to Curator", exact: true })
    .filter({ visible: true })
    .click();
  for (const name of ["Anya Reed", "Mira Vale", "Sol Arden"]) {
    const tile = page.getByRole("button", {
      name: `Open ${name}`,
      exact: true,
    });
    await tile.click();
    await expect(
      page.getByRole("region", { name: `${name} details` }),
    ).toBeVisible();
    await expect(
      page.getByRole("article", { name: `${name} shared food Care` }),
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await page
      .getByRole("button", { name: "Back to Curator", exact: true })
      .click();
    await expect(tile).toBeFocused();
  }
  await testInfo.attach("curator", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  const niaTile = page.getByRole("button", { name: "Open Nia", exact: true });
  if ((await niaTile.count()) === 0) {
    await page
      .getByRole("button", { name: /Add a Party member in slot \d+/ })
      .first()
      .click();
    await page.getByPlaceholder("First name", { exact: true }).fill("Nia");
    await page.getByPlaceholder("Last name", { exact: true }).fill("Tester");
    await page.getByPlaceholder("Nickname", { exact: true }).fill("Nia");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByRole("button", { name: "Skip for now", exact: true })
      .click();
    await page.getByRole("button", { name: "Relative", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByPlaceholder("They are...").fill("my bright spot");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByRole("button", { name: "Add to Party", exact: true })
      .click();
  }
  await expect(niaTile).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Go to Curator", exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Curator view" }),
  ).toBeVisible();
  await expect(niaTile).toBeVisible();

  // Real posts give the scroll and keyboard-navigation checks actual content.
  for (let index = 0; index < 8; index++) {
    const post = await page.request.post("/api/v1/timeline-items", {
      data: {
        content: `Browser fixture ${testInfo.project.name} ${index}: A quiet update from the forest.`,
        audience: "party",
      },
    });
    expect(post.ok(), await post.text()).toBe(true);
  }
  await page
    .getByRole("button", { name: "Go to Timeline", exact: true })
    .filter({ visible: true })
    .click();
  await page.reload();
  await expect(
    page.getByText(
      `Browser fixture ${testInfo.project.name} 7: A quiet update from the forest.`,
      { exact: true },
    ),
  ).toBeVisible();
  await expectMyCarePreservesTimelineScroll(page);
  await expectHiddenChromeRecoversFromKeyboard(page);
  await expectNoHorizontalOverflow(page);
  await testInfo.attach("timeline", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  expect(browserFailures, browserFailures.join("\n")).toEqual([]);
});
