import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { updateGeneratedArtifact } from "./generated-artifact.mjs";

test("generated-artifact checks fail explicitly when committed output drifts", async (t) => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "cloud-forest-generated-artifact-"),
  );
  t.after(() => rm(temporaryDirectory, { recursive: true, force: true }));

  const artifactPath = path.join(temporaryDirectory, "artifact.txt");
  await writeFile(artifactPath, "stale\n", "utf8");

  await assert.rejects(
    updateGeneratedArtifact({
      artifactPath,
      contents: "current\n",
      check: true,
    }),
    /Generated artifact is stale/,
  );
});
