import { Building2, RadioTower, Sprout, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  CloudForestActivity,
  CloudForestActor,
  CloudForestLayer,
} from "@/types/cloudForest";

type TimelineLayer = Exclude<CloudForestLayer, "self">;

type TimelineCardProps = {
  activity: CloudForestActivity;
  actor: CloudForestActor;
  dateTime: string;
  time: string;
};

const layerStyles: Record<TimelineLayer, string> = {
  party: "timeline-card--party",
  tribe: "timeline-card--tribe",
  guild: "timeline-card--guild",
  signal: "timeline-card--signal",
};

const layerIcons: Record<TimelineLayer, typeof UsersRound> = {
  party: UsersRound,
  tribe: Sprout,
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

function getTimelineLayer(actor: CloudForestActor): TimelineLayer {
  return actor.layer === "self" ? "party" : actor.layer;
}

function TimelineIdentity({ actor }: { actor: CloudForestActor }) {
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

export function TimelineCard({
  activity,
  actor,
  dateTime,
  time,
}: TimelineCardProps) {
  const layer = getTimelineLayer(actor);
  const LayerIcon = layerIcons[layer];

  return (
    <article className={cn("timeline-card", layerStyles[layer])}>
      <TimelineIdentity actor={actor} />
      <div className="timeline-card__body">
        <h3>{actor.displayName}</h3>
        <p>{activity.content}</p>
        <time dateTime={dateTime}>{time}</time>
      </div>
      <span aria-hidden="true" className="timeline-layer-mark">
        <LayerIcon />
      </span>
    </article>
  );
}
