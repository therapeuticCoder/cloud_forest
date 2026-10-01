import { expect, test, type Page } from "@playwright/test";

const ownerId = "offline-tester";
const timestamp = "2026-09-30T12:00:00.000Z";
const portrait =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR3sAAAAASUVORK5CYII=";
const person = {
  id: "private-character",
  firstName: "Casey",
  lastName: "Tester",
  nickname: "Casey Tester",
  relationshipShape: "Friend",
  privateDescription: "A fictional private note",
  placement: "party",
  portraitUrl: portrait,
  linkedUserId: null,
  linkedPersonId: null,
  relationshipState: "character",
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const post = {
  id: "saved-post",
  content: "A fictional saved Timeline update",
  publishedAt: timestamp,
  actor: { id: "neighbor", displayName: "Neighbor Tester", layer: "party" },
};
const care = {
  id: "completed-care",
  direction: "give",
  category: "food",
  subtype: "A warm meal",
  days: ["wednesday"],
  times: ["evening"],
  timeNote: "Flexible",
  location: "A fictional meeting place",
  requirements: "",
  sensitivities: "",
  audience: "Party",
  status: "completed",
  createdAt: timestamp,
  claimedAt: timestamp,
  completedAt: timestamp,
  originatorCompletedAt: timestamp,
  participantCompletedAt: timestamp,
  originator: { personId: ownerId, displayName: "Offline Tester" },
  participant: { personId: "neighbor", displayName: "Neighbor Tester" },
};

async function savedCollection(page: Page, collection: string) {
  return page.evaluate(
    async ({ owner, collectionName }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("cloud-forest-device");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        if (!database.objectStoreNames.contains("reads")) return null;
        return await new Promise<unknown>((resolve, reject) => {
          const request = database
            .transaction("reads")
            .objectStore("reads")
            .get(`${encodeURIComponent(owner)}:${collectionName}`);
          request.onsuccess = () => resolve(request.result?.value ?? null);
          request.onerror = () => reject(request.error);
        });
      } finally {
        database.close();
      }
    },
    { owner: ownerId, collectionName: collection },
  );
}

test("saves unopened collections and reopens Timeline, portraits, and Care history without the API", async ({
  page,
}) => {
  let unreachable = false;
  await page.route("**/api/**", async (route) => {
    if (unreachable) return route.abort("failed");
    const path = new URL(route.request().url()).pathname;
    const data =
      path === "/api/v1/session"
        ? {
            currentPersonId: ownerId,
            displayName: "Offline Tester",
            role: "user",
          }
        : path === "/api/v1/curated-persons"
          ? { people: [person], changedPersonId: null }
          : path === "/api/v1/cares"
            ? { cares: [care] }
            : { timelineItems: [post] };
    await route.fulfill({ json: { apiVersion: "v1", data } });
  });
  await page.goto("/");
  await expect(page.getByText(post.content)).toBeVisible();
  await expect.poll(() => savedCollection(page, "curator")).toEqual([person]);
  await expect.poll(() => savedCollection(page, "care")).toEqual([care]);
  await expect.poll(() => savedCollection(page, "timeline")).toEqual([post]);

  unreachable = true;
  await page.reload();
  await expect(page.getByText(post.content)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open My Care (offline)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await expect(
    page.locator('[data-curator-tile="party-private-character"] img'),
  ).toHaveAttribute("src", portrait);
  await page.getByRole("button", { name: "Open My Care (offline)" }).click();
  await page.getByRole("tab", { name: "History" }).click();
  await expect(page.getByText("You offered Care")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark done" })).toHaveCount(0);
});

test("migrates legacy portraits only after durable storage succeeds", async ({
  page,
}) => {
  const legacyKey = `cloud-forest:curated-people:v1:${ownerId}`;
  await page.addInitScript(
    ({ person, owner, legacyKey }) => {
      if (!localStorage.getItem("cloud-forest:session:v1")) {
        localStorage.setItem(
          "cloud-forest:session:v1",
          JSON.stringify({
            currentPersonId: owner,
            displayName: "Offline Tester",
            role: "user",
          }),
        );
        localStorage.setItem(
          legacyKey,
          JSON.stringify({ version: 1, ownerId: owner, people: [person] }),
        );
      }
    },
    { person, owner: ownerId, legacyKey },
  );
  await page.route("**/api/**", (route) => route.abort("failed"));
  await page.goto("/");
  await expect.poll(() => savedCollection(page, "curator")).toEqual([person]);
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), legacyKey))
    .toBeNull();
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await expect(
    page.locator('[data-curator-tile="party-private-character"] img'),
  ).toHaveAttribute("src", portrait);
});

test("keeps the legacy snapshot if IndexedDB cannot be opened", async ({
  page,
}) => {
  const legacyKey = `cloud-forest:curated-people:v1:${ownerId}`;
  await page.addInitScript(
    ({ person, owner, legacyKey }) => {
      Object.defineProperty(window, "indexedDB", { value: undefined });
      localStorage.setItem(
        "cloud-forest:session:v1",
        JSON.stringify({
          currentPersonId: owner,
          displayName: "Offline Tester",
          role: "user",
        }),
      );
      localStorage.setItem(
        legacyKey,
        JSON.stringify({ version: 1, ownerId: owner, people: [person] }),
      );
    },
    { person, owner: ownerId, legacyKey },
  );
  await page.route("**/api/**", (route) => route.abort("failed"));
  await page.goto("/");
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await expect(
    page.locator('[data-curator-tile="party-private-character"] img'),
  ).toHaveAttribute("src", portrait);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), legacyKey),
  ).not.toBeNull();
});

test("clears saved reads after an authoritative session rejection", async ({
  page,
}) => {
  let expired = false;
  await page.route("**/api/**", async (route) => {
    if (expired) return route.fulfill({ status: 401, body: "not JSON" });
    const path = new URL(route.request().url()).pathname;
    const data =
      path === "/api/v1/session"
        ? {
            currentPersonId: ownerId,
            displayName: "Offline Tester",
            role: "user",
          }
        : path === "/api/v1/curated-persons"
          ? { people: [person], changedPersonId: null }
          : path === "/api/v1/cares"
            ? { cares: [care] }
            : { timelineItems: [post] };
    await route.fulfill({ json: { apiVersion: "v1", data } });
  });
  await page.goto("/");
  await expect.poll(() => savedCollection(page, "care")).toEqual([care]);
  expired = true;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Enter Cloud Forest" }),
  ).toBeVisible();
  for (const collection of ["curator", "timeline", "care"]) {
    await expect.poll(() => savedCollection(page, collection)).toBeNull();
  }
});
