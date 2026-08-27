import assert from "node:assert/strict";
import test from "node:test";

import { prepareE2eBoundary } from "./e2e.mjs";

test("E2E preparation calls only the guarded test database commands", () => {
  const commands = [];

  prepareE2eBoundary((command) => commands.push(command));

  assert.deepEqual(commands, [
    "db:test:prepare",
    "db:migrate:test",
    "db:status:test",
    "db:inspect:test",
  ]);
});

test("E2E preparation stops immediately when a child command fails", () => {
  const commands = [];

  assert.throws(
    () =>
      prepareE2eBoundary((command) => {
        commands.push(command);
        if (command === "db:migrate:test") {
          throw new Error("fictional migration failure");
        }
      }),
    /fictional migration failure/,
  );

  assert.deepEqual(commands, ["db:test:prepare", "db:migrate:test"]);
});
