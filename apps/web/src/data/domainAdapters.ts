import {
  createParty,
  createPartyPosition,
  createPersonId,
  PARTY_CAPACITY,
  type PartyValidationResult,
  type Person,
} from "@cloud-forest/domain";

import type { CloudForestActor } from "@/types/cloudForest";
import type { CuratorPerson } from "@/types/curator";

export function curatorPersonToDomainPerson(person: CuratorPerson): Person {
  return {
    id: createPersonId(person.id),
    profile: { displayName: person.displayName },
  };
}

export function curatorPartyToDomainParty(
  owner: CuratorPerson,
  members: readonly CuratorPerson[],
): PartyValidationResult {
  if (members.length > PARTY_CAPACITY) {
    return { ok: false, error: "party-capacity-exceeded" };
  }

  const ownerPersonId = createPersonId(owner.id);

  return createParty(
    ownerPersonId,
    members.map((member, index) => ({
      ownerPersonId,
      memberPersonId: createPersonId(member.id),
      position: createPartyPosition(index),
      relationshipLabel: member.relationshipNote,
      privateNote: member.relationshipTitle,
    })),
  );
}

export function activityActorToDomainPerson(
  actor: CloudForestActor,
): Person | null {
  if (actor.sourceType !== "person") {
    return null;
  }

  return {
    id: createPersonId(actor.id),
    profile: { displayName: actor.displayName },
  };
}
