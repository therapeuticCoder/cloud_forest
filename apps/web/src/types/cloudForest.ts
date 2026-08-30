export type CloudForestLayer = "self" | "party" | "tribe" | "guild" | "signal";

export type CloudForestSourceType =
  | "person"
  | "group"
  | "institution"
  | "brand"
  | "publicFigure"
  | "topic"
  | "system";

export type CloudForestPlatform =
  | "activitypub"
  | "bluesky"
  | "discord"
  | "mock";

export type CloudForestActor = {
  id: string;
  displayName: string;
  handle: string;
  sourceType: CloudForestSourceType;
  platform: CloudForestPlatform;
  layer: CloudForestLayer;
  avatarUrl?: string;
  initials?: string;
  relationshipLabel?: string;
  notes?: string;
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

export type CloudForestActivity = {
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
  sourcePlatform: CloudForestPlatform;
  sourceUrl?: string;
};

export type AppConfig = {
  partyMaxNumber: number;
  tribeMaxNumber: number;
  guildMaxNumber: number;
  signalMaxNumber: number;
};
