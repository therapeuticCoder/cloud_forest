import { Building2, HeartHandshake, Network, RadioTower } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CloudForestActor, CloudForestLayer } from "@/types/cloudForest";

type TimelineLayer = Exclude<CloudForestLayer, "self">;

export type TimelineCardItem = {
  id: string;
  actor: Pick<
    CloudForestActor,
    "id" | "displayName" | "sourceType" | "layer" | "initials" | "avatarUrl"
  >;
  content: string;
  publishedAt: string;
};

type TimelineCardProps = {
  item: TimelineCardItem;
  time: string;
};

const layerStyles: Record<TimelineLayer, string> = {
  party: "timeline-card--party",
  tribe: "timeline-card--tribe",
  guild: "timeline-card--guild",
  signal: "timeline-card--signal",
};

const layerIcons: Record<TimelineLayer, typeof HeartHandshake> = {
  party: HeartHandshake,
  tribe: Network,
  guild: Building2,
  signal: RadioTower,
};

const portraitPositions: Record<string, string> = {
  mira: "0% 0%",
  ren: "100% 0%",
  care: "0% 100%",
  anya: "0% 100%",
  soil: "100% 100%",
  "work-jordan": "100% 100%",
};

function getTimelineLayer(actor: TimelineCardItem["actor"]): TimelineLayer {
  return actor.layer === "self" ? "party" : actor.layer;
}

function TimelineIdentity({ actor }: { actor: TimelineCardItem["actor"] }) {
  const layer = getTimelineLayer(actor);
  const LayerIcon = layerIcons[layer];
  const portraitPosition = portraitPositions[actor.id];

  if (actor.sourceType === "person") {
    return portraitPosition ? (
      <span
        aria-hidden="true"
        className="timeline-portrait"
        style={{ backgroundPosition: portraitPosition }}
      />
    ) : (
      <span aria-hidden="true" className="timeline-initials">
        {actor.initials ?? actor.displayName.slice(0, 2)}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className="timeline-source-mark">
      <LayerIcon />
    </span>
  );
}

export function TimelineCard({ item, time }: TimelineCardProps) {
  const { actor } = item;
  const layer = getTimelineLayer(actor);
  const LayerIcon = layerIcons[layer];
  const isSignal = layer === "signal";

  return (
    <article className={cn("timeline-card", layerStyles[layer])}>
      <TimelineIdentity actor={actor} />
      <div
        className={cn(
          "timeline-card__body",
          isSignal && "timeline-card__body--signal",
        )}
      >
        {isSignal ? (
          <span className="timeline-card__kind">Signal · Public source</span>
        ) : null}
        <h3>{actor.displayName}</h3>
        <time dateTime={item.publishedAt}>{time}</time>
        {isSignal ? (
          <details className="timeline-signal-content">
            <summary>Reveal public post</summary>
            <p>{item.content}</p>
          </details>
        ) : (
          <p>{item.content}</p>
        )}
      </div>
      <span aria-hidden="true" className="timeline-layer-mark">
        <LayerIcon />
      </span>
    </article>
  );
}
