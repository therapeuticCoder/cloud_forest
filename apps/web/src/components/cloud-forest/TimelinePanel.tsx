import { Building2, RadioTower, Sprout, UsersRound } from "lucide-react";

import {
  activityActors,
  cloudForestActivities,
  mockNowIso,
} from "@/data/cloudForestMockData";
import type { CloudForestActivity } from "@/types/cloudForest";

import { TimelineCard } from "./TimelineCard";

const actorsById = new Map(activityActors.map((actor) => [actor.id, actor]));
const visibleActivityIds = ["p1", "p2", "g1", "s1", "t2", "p4", "g2", "s2"];
const visibleActivities = visibleActivityIds
  .map((id) => cloudForestActivities.find((activity) => activity.id === id))
  .filter(
    (activity): activity is CloudForestActivity => activity !== undefined,
  );

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

function formatActivityTime(publishedAt: string) {
  return formatter.format(new Date(publishedAt)).replace(",", " ·");
}

function isToday(publishedAt: string) {
  const current = new Date(mockNowIso);
  const published = new Date(publishedAt);

  return (
    current.getUTCFullYear() === published.getUTCFullYear() &&
    current.getUTCMonth() === published.getUTCMonth() &&
    current.getUTCDate() === published.getUTCDate()
  );
}

function ActivityList({ activities }: { activities: CloudForestActivity[] }) {
  return activities.map((activity) => {
    const actor = actorsById.get(activity.actorId);
    if (!actor) return null;

    return (
      <TimelineCard
        key={activity.id}
        activity={activity}
        actor={actor}
        dateTime={activity.publishedAt}
        time={formatActivityTime(activity.publishedAt)}
      />
    );
  });
}

export function TimelinePanel() {
  const todayActivities = visibleActivities.filter((activity) =>
    isToday(activity.publishedAt),
  );
  const yesterdayActivities = visibleActivities.filter(
    (activity) => !isToday(activity.publishedAt),
  );

  return (
    <div className="timeline-feed">
      <header className="timeline-heading">
        <h1>Whole Forest</h1>
      </header>
      <div aria-label="Relationship layers" className="timeline-layer-key">
        <span className="timeline-key--party">
          <UsersRound />
        </span>
        <span className="timeline-key--tribe">
          <Sprout />
        </span>
        <span className="timeline-key--guild">
          <Building2 />
        </span>
        <span className="timeline-key--signal">
          <RadioTower />
        </span>
      </div>
      <div className="timeline-list">
        <ActivityList activities={todayActivities} />
        <div className="timeline-day-divider" role="separator">
          <span>Yesterday</span>
        </div>
        <ActivityList activities={yesterdayActivities} />
      </div>
    </div>
  );
}
