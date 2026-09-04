import assert from "node:assert/strict";
import test from "node:test";

import { createPersonId } from "./identity.ts";
import {
  createParty,
  createPartyPosition,
  PARTY_CAPACITY,
  relationshipLayers,
} from "./relationships.ts";

const ownerPersonId = createPersonId("owner");

function membership(memberNumber, position = memberNumber - 1) {
  return {
    ownerPersonId,
    memberPersonId: createPersonId(`member-${memberNumber}`),
    position: createPartyPosition(position),
    relationshipLabel: "Friend",
    privateNote: "A steady person",
  };
}

test("relationship layers exclude the separate self presentation", () => {
  assert.deepEqual(relationshipLayers, ["party", "tribe", "guild", "signal"]);
});

test("a Party accepts exactly five relationships", () => {
  const memberships = Array.from({ length: PARTY_CAPACITY }, (_, index) =>
    membership(index + 1),
  );

  assert.deepEqual(createParty(ownerPersonId, memberships), {
    ok: true,
    party: { ownerPersonId, memberships },
  });
});

test("a Party rejects a sixth relationship", () => {
  const memberships = Array.from(
    { length: PARTY_CAPACITY + 1 },
    (_, index) => ({
      ...membership((index % PARTY_CAPACITY) + 1),
      memberPersonId: createPersonId(`member-${index + 1}`),
    }),
  );

  assert.deepEqual(createParty(ownerPersonId, memberships), {
    ok: false,
    error: "party-capacity-exceeded",
  });
});

test("a Party rejects membership owned by another person", () => {
  const memberships = [
    {
      ...membership(1),
      ownerPersonId: createPersonId("another-owner"),
    },
  ];

  assert.deepEqual(createParty(ownerPersonId, memberships), {
    ok: false,
    error: "party-owner-mismatch",
  });
});

test("the owner cannot consume a Party relationship slot", () => {
  const memberships = [{ ...membership(1), memberPersonId: ownerPersonId }];

  assert.deepEqual(createParty(ownerPersonId, memberships), {
    ok: false,
    error: "party-self-membership",
  });
});

test("a person can occupy only one Party relationship slot", () => {
  const firstMembership = membership(1);
  const memberships = [
    firstMembership,
    { ...membership(2), memberPersonId: firstMembership.memberPersonId },
  ];

  assert.deepEqual(createParty(ownerPersonId, memberships), {
    ok: false,
    error: "party-duplicate-member",
  });
});

test("Party ordering uses unique contiguous positions", () => {
  assert.deepEqual(
    createParty(ownerPersonId, [membership(1, 0), membership(2, 0)]),
    { ok: false, error: "party-duplicate-position" },
  );

  assert.deepEqual(
    createParty(ownerPersonId, [membership(1, 0), membership(2, 2)]),
    { ok: false, error: "party-noncontiguous-order" },
  );
});

test("a Party returns memberships in canonical position order", () => {
  const second = membership(2, 1);
  const first = membership(1, 0);
  const result = createParty(ownerPersonId, [second, first]);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.party.memberships, [first, second]);
  }
});

test("Party positions stay within the five available slots", () => {
  assert.throws(() => createPartyPosition(-1), RangeError);
  assert.throws(() => createPartyPosition(PARTY_CAPACITY), RangeError);
  assert.throws(() => createPartyPosition(1.5), RangeError);
});
