export type CuratorPerson = {
  id: string;
  displayName: string;
  firstName?: string;
  initials: string;
  lastName?: string;
  nickname?: string;
  relationshipTitle: string;
  relationshipNote: string;
  recentStatus: string;
  placement?: "party" | "tribe" | "guild" | "signal" | "holding";
  portraitUrl?: string;
  privateDescription?: string;
  relationshipShape?: string;
  relationshipState?: "character" | "connected" | "blocked";
  blockedUserId?: string;
  linkedUserId?: string | null;
  version?: number;
};

export function hasActiveConnection(person: CuratorPerson) {
  return (
    person.relationshipState === "connected" ||
    (person.relationshipState === undefined && person.linkedUserId != null)
  );
}

export type CuratorNeighborhood = {
  id: string;
  name: string;
  description: string;
  people: CuratorPerson[];
};

export type CuratorGuild = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  recentActivity: string;
};

export type CuratorSignalCategory =
  | "politics"
  | "music"
  | "film"
  | "local-civic"
  | "technology"
  | "art"
  | "science";

export type CuratorSignal = {
  id: string;
  name: string;
  domain: string;
  category: CuratorSignalCategory;
  description: string;
  recentActivity: string;
};

export type CuratorMockData = {
  user: CuratorPerson;
  partyPeople: CuratorPerson[];
};

export type CuratorSelection =
  | { layer: "party"; item: CuratorPerson }
  | { layer: "tribe"; item: CuratorPerson }
  | { layer: "holding"; item: CuratorPerson }
  | { layer: "guild"; item: CuratorGuild }
  | { layer: "signal"; item: CuratorSignal };
