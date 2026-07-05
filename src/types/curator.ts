export type CuratorPerson = {
  id: string;
  displayName: string;
  initials: string;
  relationshipNote: string;
  recentStatus: string;
};

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
  partyPeople: CuratorPerson[];
  tribeNeighborhoods: CuratorNeighborhood[];
  guilds: CuratorGuild[];
  signals: CuratorSignal[];
};
