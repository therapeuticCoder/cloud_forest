import { describe, expect, it } from "vitest";

import { curatorPartyPeople, curatorUser } from "@/data/cloudForest";
import type { CloudForestActor } from "@/types/cloudForest";

import {
  activityActorToDomainPerson,
  curatorPartyToDomainParty,
  curatorPersonToDomainPerson,
} from "./domainAdapters";

const personActor: CloudForestActor = {
  id: "mira",
  displayName: "Mira",
  handle: "@mira@fixture.test",
  sourceType: "person",
  platform: "mock",
  layer: "party",
};
const signalActor: CloudForestActor = {
  id: "city-signal",
  displayName: "City Signal",
  handle: "@city-signal@fixture.test",
  sourceType: "institution",
  platform: "mock",
  layer: "signal",
};

describe("domain adapters", () => {
  it("projects a Curator person without moving presentation fields into the domain", () => {
    expect(curatorPersonToDomainPerson(curatorPartyPeople[0])).toEqual({
      id: "mira",
      profile: { displayName: "Mira Vale" },
    });
  });

  it("projects the five fixture relationships as an owned ordered Party", () => {
    const result = curatorPartyToDomainParty(curatorUser, curatorPartyPeople);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.party.ownerPersonId).toBe("you");
      expect(result.party.memberships).toHaveLength(5);
      expect(result.party.memberships[0]).toMatchObject({
        memberPersonId: "mira",
        position: 0,
        relationshipLabel: "Daily life",
        privateNote: "my calm in the storm",
      });
    }
  });

  it("requires an explicit source mapping for person activity actors", () => {
    const canonicalPerson = curatorPersonToDomainPerson(curatorPartyPeople[0]);
    const mappings = [
      {
        sourceActorId: personActor.id,
        sourcePlatform: personActor.platform,
        person: canonicalPerson,
      },
    ];

    expect(activityActorToDomainPerson(personActor, [])).toBeNull();
    expect(activityActorToDomainPerson(personActor, mappings)).toEqual({
      id: "mira",
      profile: { displayName: "Mira Vale" },
    });
    expect(activityActorToDomainPerson(signalActor, mappings)).toBeNull();
  });

  it("does not match a reused source actor ID from another platform", () => {
    expect(
      activityActorToDomainPerson(personActor, [
        {
          sourceActorId: personActor.id,
          sourcePlatform: "activitypub",
          person: curatorPersonToDomainPerson(curatorPartyPeople[0]),
        },
      ]),
    ).toBeNull();
  });
});
