import type { PersonId } from "./identity.js";

export const relationshipLayers = [
  "party",
  "tribe",
  "guild",
  "signal",
] as const;

export type RelationshipLayer = (typeof relationshipLayers)[number];

export const PARTY_CAPACITY = 5;

declare const partyPositionBrand: unique symbol;

export type PartyPosition = number & {
  readonly [partyPositionBrand]: "PartyPosition";
};

export function createPartyPosition(value: number): PartyPosition {
  if (!Number.isInteger(value) || value < 0 || value >= PARTY_CAPACITY) {
    throw new RangeError(
      `PartyPosition must be an integer from 0 to ${PARTY_CAPACITY - 1}`,
    );
  }

  return value as PartyPosition;
}

export type PartyMembership = {
  readonly ownerPersonId: PersonId;
  readonly memberPersonId: PersonId;
  readonly position: PartyPosition;
  readonly relationshipLabel: string;
  readonly privateNote: string;
};

export type Party = {
  readonly ownerPersonId: PersonId;
  readonly memberships: readonly PartyMembership[];
};

export type PartyValidationError =
  | "party-capacity-exceeded"
  | "party-owner-mismatch"
  | "party-self-membership"
  | "party-duplicate-member"
  | "party-invalid-position"
  | "party-duplicate-position"
  | "party-noncontiguous-order";

export type PartyValidationResult =
  | { readonly ok: true; readonly party: Party }
  | { readonly ok: false; readonly error: PartyValidationError };

export function createParty(
  ownerPersonId: PersonId,
  memberships: readonly PartyMembership[],
): PartyValidationResult {
  if (memberships.length > PARTY_CAPACITY) {
    return { ok: false, error: "party-capacity-exceeded" };
  }

  const memberIds = new Set<PersonId>();
  const positions = new Set<number>();

  for (const membership of memberships) {
    if (membership.ownerPersonId !== ownerPersonId) {
      return { ok: false, error: "party-owner-mismatch" };
    }

    if (membership.memberPersonId === ownerPersonId) {
      return { ok: false, error: "party-self-membership" };
    }

    if (memberIds.has(membership.memberPersonId)) {
      return { ok: false, error: "party-duplicate-member" };
    }
    memberIds.add(membership.memberPersonId);

    if (
      !Number.isInteger(membership.position) ||
      membership.position < 0 ||
      membership.position >= PARTY_CAPACITY
    ) {
      return { ok: false, error: "party-invalid-position" };
    }

    if (positions.has(membership.position)) {
      return { ok: false, error: "party-duplicate-position" };
    }
    positions.add(membership.position);
  }

  const orderedMemberships = [...memberships].sort(
    (left, right) => left.position - right.position,
  );

  if (
    orderedMemberships.some(
      (membership, index) => membership.position !== index,
    )
  ) {
    return { ok: false, error: "party-noncontiguous-order" };
  }

  return {
    ok: true,
    party: {
      ownerPersonId,
      memberships: orderedMemberships,
    },
  };
}
