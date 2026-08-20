export type HumanForestLayer = "self" | "party" | "tribe" | "guild" | "signal";

export type HumanForestSourceType =
  | "person"
  | "group"
  | "institution"
  | "brand"
  | "publicFigure"
  | "topic"
  | "system";

export type HumanForestPlatform =
  | "activitypub"
  | "bluesky"
  | "discord"
  | "mock";

export type HumanForestPosition = {
  x: number;
  y: number;
};

export type HumanForestSize = {
  width: number;
  height: number;
};

export type HumanForestActor = {
  id: string;
  displayName: string;
  handle: string;
  sourceType: HumanForestSourceType;
  platform: HumanForestPlatform;
  layer: HumanForestLayer;
  avatarUrl?: string;
  initials?: string;
  position: HumanForestPosition;
  relationshipLabel?: string;
  notes?: string;
};

export type HumanForestGuildType =
  | "care"
  | "builder"
  | "learning"
  | "civic"
  | "creative"
  | "other";

export type HumanForestGuild = {
  id: string;
  name: string;
  description?: string;
  guildType: HumanForestGuildType;
  position: HumanForestPosition;
  size: HumanForestSize;
  rotation?: number;
  memberActorIds: string[];
};

export type HumanForestConnectionType =
  | "close"
  | "known"
  | "guild"
  | "inferred"
  | "signal";

export type HumanForestConnection = {
  id: string;
  fromActorId: string;
  toActorId: string;
  connectionType: HumanForestConnectionType;
  strength: number;
};

export type ActivityPubObjectType =
  | "Note"
  | "Article"
  | "Event"
  | "Image"
  | "Link";

export type ActivityPubActivityType =
  | "Create"
  | "Announce"
  | "Like"
  | "Follow"
  | "Update";

export type HumanForestActivity = {
  id: string;
  activityType: ActivityPubActivityType;
  objectType: ActivityPubObjectType;
  actorId: string;
  targetActorId?: string;
  guildId?: string;
  publishedAt: string;
  title: string;
  content: string;
  url?: string;
  tags?: string[];
  sourcePlatform: HumanForestPlatform;
  sourceUrl?: string;
};

export type AppConfig = {
  partyMaxNumber: number;
  tribeMaxNumber: number;
  guildMaxNumber: number;
  signalMaxNumber: number;
};
