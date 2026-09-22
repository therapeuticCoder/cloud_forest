import assert from "node:assert/strict";
import test from "node:test";
import { careRole, isActiveCareStatus } from "./care.ts";

test("Care direction assigns opposite roles to its two participants", () => {
  assert.equal(careRole("give", "a", "b", "a"), "give");
  assert.equal(careRole("give", "a", "b", "b"), "receive");
  assert.equal(careRole("receive", "a", "b", "a"), "receive");
  assert.equal(careRole("receive", "a", "b", "b"), "give");
  assert.equal(careRole("receive", "a", "b", "outsider"), undefined);
  assert.equal(careRole("give", "a", null, "b"), undefined);
});

test("only open and claimed Care belong in active surfaces", () => {
  assert.equal(isActiveCareStatus("open"), true);
  assert.equal(isActiveCareStatus("claimed"), true);
  for (const status of ["completed", "not_completed", "expired", "orphaned"]) {
    assert.equal(isActiveCareStatus(status), false);
  }
});
