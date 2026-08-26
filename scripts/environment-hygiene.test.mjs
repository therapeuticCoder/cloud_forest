import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  cleanGeneratedArtifacts,
  listGeneratedArtifacts,
} from "./clean-generated.mjs";
import {
  listNodeModulesDirectories,
  removeNodeModules,
} from "./repair-dependencies.mjs";

async function withFixture(run) {
  const fixtureRoot = await mkdtemp(
    path.join(os.tmpdir(), "cloud-forest-hygiene-"),
  );
  try {
    await run(fixtureRoot);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

async function createFixtureFile(root, relativePath, contents = "fixture") {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

test("generated cleanup dry-run lists targets without deleting protected state", async () => {
  await withFixture(async (root) => {
    await createFixtureFile(root, "dist/app.js");
    await createFixtureFile(root, "apps/web/coverage/report.json");
    await createFixtureFile(root, "apps/web/cache.tsbuildinfo");
    await createFixtureFile(root, "src/index.ts", "source");
    await createFixtureFile(root, ".env", "secret");
    await createFixtureFile(root, "backups/database.sql", "backup");
    await createFixtureFile(root, "node_modules/package/dist/index.js");

    const targets = await cleanGeneratedArtifacts(root, { dryRun: true });

    assert.deepEqual(
      targets.map((target) =>
        path.relative(root, target).replaceAll("\\", "/"),
      ),
      ["apps/web/cache.tsbuildinfo", "apps/web/coverage", "dist"],
    );
    assert.equal(
      await readFile(path.join(root, "dist/app.js"), "utf8"),
      "fixture",
    );
    assert.equal(await readFile(path.join(root, ".env"), "utf8"), "secret");
  });
});

test("generated cleanup removes only disposable artifacts and is idempotent", async () => {
  await withFixture(async (root) => {
    await createFixtureFile(root, "dist/app.js");
    await createFixtureFile(root, "src/index.ts", "source");
    await createFixtureFile(root, "backups/database.sql", "backup");

    assert.equal((await cleanGeneratedArtifacts(root)).length, 1);
    assert.deepEqual(await listGeneratedArtifacts(root), []);
    assert.deepEqual(await cleanGeneratedArtifacts(root), []);
    assert.equal(
      await readFile(path.join(root, "src/index.ts"), "utf8"),
      "source",
    );
    assert.equal(
      await readFile(path.join(root, "backups/database.sql"), "utf8"),
      "backup",
    );
  });
});

test("dependency repair targets only node_modules and removal is idempotent after relisting", async () => {
  await withFixture(async (root) => {
    await createFixtureFile(root, "node_modules/root-package/index.js");
    await createFixtureFile(root, "apps/web/node_modules/web-package/index.js");
    await createFixtureFile(root, ".pnpm-store/index/state.json", "store");
    await createFixtureFile(root, "backups/database.sql", "backup");

    const targets = await listNodeModulesDirectories(root);
    assert.deepEqual(
      targets.map((target) =>
        path.relative(root, target).replaceAll("\\", "/"),
      ),
      ["apps/web/node_modules", "node_modules"],
    );

    await removeNodeModules(root, targets);
    assert.deepEqual(await listNodeModulesDirectories(root), []);
    await removeNodeModules(root, []);
    assert.equal(
      await readFile(path.join(root, ".pnpm-store/index/state.json"), "utf8"),
      "store",
    );
    assert.equal(
      await readFile(path.join(root, "backups/database.sql"), "utf8"),
      "backup",
    );
  });
});
