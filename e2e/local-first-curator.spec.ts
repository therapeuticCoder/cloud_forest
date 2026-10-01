import { expect, test, type Page } from "@playwright/test";
import type { GetCuratedPersonsResponse } from "@cloud-forest/api-client";

const owner = "curator-device-tester";
const timestamp = "2026-10-01T12:00:00.000Z";
const portrait =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR3sAAAAASUVORK5CYII=";
const upload = Buffer.concat([
  Buffer.from(portrait.split(",")[1], "base64"),
  Buffer.from("fictional-portrait"),
]);
const editedPortrait = `data:image/png;base64,${upload.toString("base64")}`;
const character: GetCuratedPersonsResponse["data"]["people"][number] = {
  id: "private-character",
  firstName: "Casey",
  lastName: "Tester",
  nickname: "Casey",
  relationshipShape: "Friend",
  privateDescription: "Original fictional note",
  placement: "party",
  portraitUrl: portrait,
  linkedUserId: null,
  linkedPersonId: null,
  relationshipState: "character",
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
};

async function stored(page: Page, store: string, key: string) {
  return page.evaluate(
    async ({ store, key }) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("cloud-forest-device");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        if (!db.objectStoreNames.contains(store)) return undefined;
        return await new Promise<unknown>((resolve, reject) => {
          const request = db.transaction(store).objectStore(store).get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } finally {
        db.close();
      }
    },
    { store, key },
  );
}
async function fixture(page: Page, deviceStorageAvailable = true) {
  const state = {
    unreachable: false,
    expired: false,
    owner,
    people: [structuredClone(character)],
    writes: [] as Record<string, unknown>[],
    loseAcknowledgement: false,
    rejectMove: false,
    staleWrites: false,
  };
  const receipts = new Map<string, string | null>();
  await page.route("**/api/**", async (route) => {
    if (state.unreachable) return route.abort("failed");
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (state.expired)
      return route.fulfill({
        status: 401,
        json: {
          apiVersion: "v1",
          error: { code: "UNAUTHENTICATED", message: "Sign in again." },
        },
      });
    if (path === "/api/v1/session")
      return route.fulfill({
        json: {
          apiVersion: "v1",
          data: {
            currentPersonId: state.owner,
            displayName: "Device Tester",
            role: "user",
          },
        },
      });
    if (path.startsWith("/api/v1/curated-persons")) {
      let changedPersonId: string | null = null;
      if (method !== "GET") {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        state.writes.push(body);
        const id = String(body.mutationId);
        if (receipts.has(id)) changedPersonId = receipts.get(id)!;
        else {
          if (state.staleWrites && path.endsWith("/private-character"))
            return route.fulfill({
              status: 409,
              json: {
                apiVersion: "v1",
                error: {
                  code: "STALE_WRITE_CONFLICT",
                  message: "This Character changed on another device.",
                },
              },
            });
          if (state.rejectMove && body.placement === "tribe")
            return route.fulfill({
              status: 409,
              json: {
                apiVersion: "v1",
                error: {
                  code: "TRIBE_FULL",
                  message: "Tribe is full. Choose another layer.",
                },
              },
            });
          if (method === "POST") {
            changedPersonId = `server-character-${receipts.size}`;
            state.people.push({
              ...character,
              ...body,
              id: changedPersonId,
            } as typeof character);
          } else {
            changedPersonId = path.split("/").at(-1)!;
            const current = state.people.find(
              (person) => person.id === changedPersonId,
            )!;
            if (method === "DELETE")
              state.people = state.people.filter(
                (person) => person.id !== changedPersonId,
              );
            else Object.assign(current, body, { version: current.version + 1 });
          }
          receipts.set(id, changedPersonId);
          if (state.loseAcknowledgement) {
            state.loseAcknowledgement = false;
            state.unreachable = true;
            return route.abort("failed");
          }
        }
      }
      // Request metadata never becomes part of a Character response.
      const people = state.people.map((person) => {
        const record = { ...person } as typeof character & {
          mutationId?: unknown;
          expectedVersion?: unknown;
        };
        delete record.mutationId;
        delete record.expectedVersion;
        return record;
      });
      return route.fulfill({
        json: { apiVersion: "v1", data: { people, changedPersonId } },
      });
    }
    if (path === "/api/v1/cares")
      return route.fulfill({ json: { apiVersion: "v1", data: { cares: [] } } });
    return route.fulfill({
      json: { apiVersion: "v1", data: { timelineItems: [] } },
    });
  });
  await page.goto("/");
  if (deviceStorageAvailable)
    await expect
      .poll(() => stored(page, "reads", `${owner}:curator`))
      .toMatchObject({ value: [character] });
  await page.getByRole("button", { name: "Go to Curator" }).click();
  return state;
}
async function openCharacter(page: Page) {
  await page.getByRole("button", { name: "Open Casey", exact: true }).click();
}
async function refresh(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
}

test("private edits and portraits survive restart; replay merges only edited fields and retries lost acknowledgements", async ({
  page,
}) => {
  const state = await fixture(page);
  state.unreachable = true;
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await openCharacter(page);
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Saved privately while offline");
  await page.getByLabel("Portrait", { exact: true }).setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: upload,
  });
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      {
        fields: { privateDescription: "Saved privately while offline" },
        status: "pending",
      },
    ]);
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await openCharacter(page);
  await expect(
    page.getByRole("textbox", { name: "Private note", exact: true }),
  ).toHaveValue("Saved privately while offline");
  await expect(page.locator(".curator-detail-view img")).toHaveAttribute(
    "src",
    editedPortrait,
  );
  state.people[0].lastName = "Updated on another device";
  state.people[0].relationshipState = "connected";
  state.people[0].linkedUserId = "neighbor";
  state.people[0].version = 2;
  state.unreachable = false;
  state.loseAcknowledgement = true;
  await refresh(page);
  await expect.poll(() => state.writes.length).toBe(1);
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      {
        request: {
          body: {
            lastName: "Updated on another device",
            privateDescription: "Saved privately while offline",
            expectedVersion: 2,
          },
        },
      },
    ]);
  await page.reload();
  state.unreachable = false;
  await refresh(page);
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(state.writes[1]).toEqual(state.writes[0]);
  expect(state.people[0].version).toBe(3);
  expect(state.people[0].lastName).toBe("Updated on another device");
  expect(state.people[0].relationshipState).toBe("connected");
});

test("rejected moves remain visible and correctable; deleted server records are never recreated", async ({
  page,
}) => {
  const state = await fixture(page);
  await openCharacter(page);
  state.rejectMove = true;
  await page.getByRole("button", { name: "Tribe", exact: true }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ status: "rejected", fields: { placement: "tribe" } }]);
  await page.getByRole("button", { name: "Holding", exact: true }).click();
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(state.people[0].placement).toBe("holding");
  state.unreachable = true;
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Pending edit to a deleted Character");
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ status: "pending" }]);
  state.people = [];
  state.unreachable = false;
  await refresh(page);
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      {
        status: "rejected",
        error: expect.stringContaining("deleted on the server"),
      },
    ]);
  expect(state.writes).toHaveLength(2);
  expect(state.people).toEqual([]);
});

test("expiry clears saved reads while retaining private edits behind the same-account sign-in boundary", async ({
  page,
}) => {
  const state = await fixture(page);
  state.unreachable = true;
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await openCharacter(page);
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Private pending edit");
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ status: "pending" }]);
  state.unreachable = false;
  state.expired = true;
  await refresh(page);
  await expect(
    page.getByText("Private Character", { exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() => stored(page, "reads", `${owner}:curator`))
    .toBeUndefined();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      { fields: { privateDescription: "Private pending edit" } },
    ]);
  state.expired = false;
  state.owner = "another-device-tester";
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await openCharacter(page);
  await expect(
    page.getByRole("textbox", { name: "Private note", exact: true }),
  ).toHaveValue(character.privateDescription);
  expect(state.writes).toHaveLength(0);
  state.owner = owner;
  await page.reload();
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(state.people[0].privateDescription).toBe("Private pending edit");
});

test("creates offline, resolves its server identity, and saves and deletes from the open editor", async ({
  page,
}) => {
  const state = await fixture(page);
  state.unreachable = true;
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await page
    .getByRole("button", { name: "Add a Party member in slot 2" })
    .click();
  await page.getByPlaceholder("First name").fill("New");
  await page.getByPlaceholder("Last name").fill("Tester");
  await page.getByPlaceholder("Nickname").fill("New Tester");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await page.getByRole("button", { name: "Friend", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByPlaceholder("They are...").fill("Fictional offline creation");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Add to Party", exact: true }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ kind: "create", fields: { nickname: "New Tester" } }]);
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await page
    .getByRole("button", { name: "Open New Tester", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Connect with a Cloud Forest user" }),
  ).toBeDisabled();
  state.unreachable = false;
  state.loseAcknowledgement = true;
  await refresh(page);
  await expect.poll(() => state.writes.length).toBe(1);
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ request: { body: { nickname: "New Tester" } } }]);
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Edited before creation acknowledgement");
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      { kind: "create" },
      {
        kind: "update",
        fields: {
          privateDescription: "Edited before creation acknowledgement",
        },
      },
    ]);
  state.unreachable = false;
  await refresh(page);
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(
    state.people.find((person) => person.nickname === "New Tester")
      ?.privateDescription,
  ).toBe("Edited before creation acknowledgement");
  expect(
    state.people.filter((person) => person.nickname === "New Tester"),
  ).toHaveLength(1);
  expect(state.writes[1]).toEqual(state.writes[0]);
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Edited after creation acknowledgement");
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect
    .poll(
      () =>
        state.people.find((person) => person.nickname === "New Tester")
          ?.privateDescription,
    )
    .toBe("Edited after creation acknowledgement");
  state.unreachable = true;
  await page
    .getByRole("button", { name: "Delete Character", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete Character", exact: true })
    .click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ kind: "delete" }]);
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await expect(
    page.getByRole("button", { name: "Open New Tester", exact: true }),
  ).toHaveCount(0);
  state.unreachable = false;
  await refresh(page);
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(
    state.people.filter((person) => person.nickname === "New Tester"),
  ).toHaveLength(0);
});

test("an open editor preserves its draft while untouched server fields and Connection state refresh", async ({
  page,
}) => {
  const state = await fixture(page);
  await openCharacter(page);
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Unsaved private note");
  state.people[0].lastName = "Changed elsewhere";
  state.people[0].placement = "tribe";
  state.people[0].relationshipState = "connected";
  state.people[0].linkedUserId = "neighbor";
  state.people[0].version = 2;
  await refresh(page);
  await expect(
    page.getByRole("textbox", { name: "Last name", exact: true }),
  ).toHaveValue("Changed elsewhere");
  await expect(
    page.getByRole("textbox", { name: "Private note", exact: true }),
  ).toHaveValue("Unsaved private note");
  await expect(
    page.getByText("Tribe Connection", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete Character", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  await expect
    .poll(() => state.people[0].privateDescription)
    .toBe("Unsaved private note");
  expect(state.writes[0]).toMatchObject({
    lastName: "Changed elsewhere",
    placement: "tribe",
    expectedVersion: 2,
  });
});

test("a storage failure aborts the projection and queue without reporting success or sending a write", async ({
  page,
}) => {
  const state = await fixture(page);
  await openCharacter(page);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === "curator-outbox")
        throw new DOMException("Storage is full", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  await page
    .getByRole("textbox", { name: "Private note", exact: true })
    .fill("Cannot be stored");
  await page.getByRole("button", { name: "Save private details" }).click();
  await expect(
    page.getByText("Storage is full", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => stored(page, "reads", `${owner}:curator`))
    .toMatchObject({
      value: [{ privateDescription: character.privateDescription }],
    });
  await expect.poll(() => stored(page, "curator-outbox", owner)).toEqual([]);
  expect(state.writes).toEqual([]);
});

for (const rejection of [
  "connected deletion",
  "missing record",
  "stale writes",
]) {
  test(`replay advances past a rejected ${rejection} and continues after restart`, async ({
    page,
  }) => {
    const state = await fixture(page);
    const second = { ...character, id: "second-character", nickname: "Robin" };
    state.people.push(second);
    if (rejection === "connected deletion")
      state.people[0].relationshipState = "connected";
    else if (rejection === "missing record") state.people.shift();
    else state.staleWrites = true;
    // Seed two durable offline edits before the next authenticated replay.
    await page.evaluate(
      async ({ owner, rejection }) => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("cloud-forest-device");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        try {
          await new Promise<void>((resolve, reject) => {
            const tx = db.transaction("curator-outbox", "readwrite");
            tx.objectStore("curator-outbox").put(
              [
                {
                  id: "rejected-change",
                  personId: "private-character",
                  kind:
                    rejection === "connected deletion" ? "delete" : "update",
                  fields: { privateDescription: "Rejected private edit" },
                  label: "Casey",
                  status: "pending",
                },
                {
                  id: "later-change",
                  personId: "second-character",
                  kind: "update",
                  fields: { privateDescription: "Later edit synchronizes" },
                  label: "Robin",
                  status: "pending",
                },
              ],
              owner,
            );
            tx.oncomplete = () => resolve();
            tx.onabort = tx.onerror = () => reject(tx.error);
          });
        } finally {
          db.close();
        }
      },
      { owner, rejection },
    );
    await refresh(page);
    await expect
      .poll(() => stored(page, "curator-outbox", owner))
      .toMatchObject([{ id: "rejected-change", status: "rejected" }]);
    expect(second.privateDescription).toBe("Later edit synchronizes");
    expect(state.writes).toHaveLength(rejection === "stale writes" ? 4 : 1);
    await page.reload();
    await page.getByRole("button", { name: "Go to Curator" }).click();
    await page.getByRole("button", { name: "Open Robin", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Private note", exact: true })
      .fill("Another edit after restart");
    await page.getByRole("button", { name: "Save private details" }).click();
    await expect
      .poll(() => second.privateDescription)
      .toBe("Another edit after restart");
    await expect
      .poll(() => stored(page, "curator-outbox", owner))
      .toMatchObject([{ id: "rejected-change", status: "rejected" }]);
  });
}

test("storage failures explain disabled editing and retry restores it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let fail = true;
    window.addEventListener("restore-curator-storage", () => {
      fail = false;
    });
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (fail && this.name === "curator-outbox")
        throw new DOMException("Storage is full", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  const state = await fixture(page, false);
  const explanation = page
    .getByRole("alert")
    .filter({ hasText: "Editing is unavailable" });
  await expect(explanation).toContainText(
    "Free some device storage or allow site storage",
  );
  await expect(
    page.getByRole("button", { name: "Add a Party member in slot 2" }),
  ).toBeDisabled();
  await openCharacter(page);
  await expect(explanation).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save private details" }),
  ).toBeDisabled();
  await page.evaluate(() =>
    window.dispatchEvent(new Event("restore-curator-storage")),
  );
  await page.getByRole("button", { name: "Retry device storage" }).click();
  await expect(explanation).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Save private details" }),
  ).toBeEnabled();
  expect(state.writes).toEqual([]);
});

test("a queued deletion cannot remove a Character that became connected before replay", async ({
  page,
}) => {
  const state = await fixture(page);
  state.unreachable = true;
  await page.reload();
  await page.getByRole("button", { name: "Go to Curator" }).click();
  await openCharacter(page);
  await page
    .getByRole("button", { name: "Delete Character", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete Character", exact: true })
    .click();
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([{ kind: "delete" }]);
  state.people[0].relationshipState = "connected";
  state.people[0].linkedUserId = "neighbor";
  state.unreachable = false;
  await refresh(page);
  await expect
    .poll(() => stored(page, "curator-outbox", owner))
    .toMatchObject([
      { status: "rejected", error: expect.stringContaining("now connected") },
    ]);
  await expect(
    page.getByRole("button", { name: "Open Casey", exact: true }),
  ).toBeVisible();
  expect(state.writes).toEqual([]);
});
