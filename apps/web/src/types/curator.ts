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
  linkedPersonId?: string | null;
  version?: number;
};

export function hasActiveConnection(person: CuratorPerson) {
  return (
    person.relationshipState === "connected" ||
    (person.relationshipState === undefined && person.linkedUserId != null)
  );
}

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

export type CuratorSelection =
  | { layer: "party"; item: CuratorPerson }
  | { layer: "tribe"; item: CuratorPerson }
  | { layer: "holding"; item: CuratorPerson }
  | { layer: "guild"; item: CuratorGuild }
  | { layer: "signal"; item: CuratorSignal };

export type CharacterDraft = {
  firstName: string;
  lastName: string;
  nickname: string;
  portraitUrl?: string;
  relationshipNote: string;
  relationshipTitle: string;
};

export type CharacterUpdate = {
  firstName: string;
  lastName: string;
  nickname: string;
  placement: "holding" | "party" | "tribe";
  privateDescription: string;
  portraitUrl?: string;
  relationshipShape: string;
};
