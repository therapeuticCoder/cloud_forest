import type { RelationshipLayer } from "./relationships.js";

export const timelineAudiences = ["party", "tribe"] as const;
export type TimelineAudience = (typeof timelineAudiences)[number];

export const timelineItemLayers = [
  "party",
  "tribe",
  "guild",
  "signal",
] as const satisfies readonly RelationshipLayer[];

export type TimelineItemLayer = RelationshipLayer;

export type TimelineItemActor = {
  id: string;
  displayName: string;
  layer: TimelineItemLayer;
  initials?: string;
  avatarUrl?: string;
};

export type TimelineItem = {
  id: string;
  actor: TimelineItemActor;
  content: string;
  publishedAt: string;
};
