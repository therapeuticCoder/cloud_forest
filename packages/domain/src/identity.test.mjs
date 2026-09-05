import assert from "node:assert/strict";
import test from "node:test";

import { createAccountId, createPersonId } from "./identity.ts";

test("account and person identifiers preserve valid opaque values", () => {
  assert.equal(createAccountId("account-1"), "account-1");
  assert.equal(createPersonId("person-1"), "person-1");
});

test("identity identifiers reject empty or untrimmed values", () => {
  assert.throws(() => createAccountId(""), TypeError);
  assert.throws(() => createPersonId(" person-1"), TypeError);
  assert.throws(() => createPersonId("person-1 "), TypeError);
});
