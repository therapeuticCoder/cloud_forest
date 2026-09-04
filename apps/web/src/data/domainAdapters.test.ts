import { describe, expect, it } from "vitest";

import {
  activityActors,
  curatorPartyPeople,
  curatorUser,
} from "@/data/cloudForest";

import {
  activityActorToDomainPerson,
  curatorPartyToDomainParty,
  curatorPersonToDomainPerson,
} from "./domainAdapters";

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

  it("adapts only person activity sources to canonical people", () => {
    const personActor = activityActors.find(
      (actor) => actor.sourceType === "person",
    );
    const signalActor = activityActors.find(
      (actor) => actor.sourceType === "institution",
    );

    expect(personActor).toBeDefined();
    expect(signalActor).toBeDefined();
    if (!personActor || !signalActor) {
      throw new Error("Expected person and institution fixtures");
    }

    expect(activityActorToDomainPerson(personActor)).toMatchObject({
      id: personActor.id,
    });
    expect(activityActorToDomainPerson(signalActor)).toBeNull();
  });
});
