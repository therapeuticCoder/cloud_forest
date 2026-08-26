export const timelineItemLayers = [
  "party",
  "tribe",
  "guild",
  "signal",
] as const;

export type TimelineItemLayer = (typeof timelineItemLayers)[number];

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
