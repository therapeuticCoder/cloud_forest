import { Sprout } from "lucide-react";

import {
  humanForestActors,
  humanForestConnections,
  humanForestGuilds,
} from "@/data/humanForestMockData";

import { FieldNode, type FieldMapActor } from "./FieldNode";
import { FieldControlBar } from "./FieldControlBar";
import { GuildPlane } from "./GuildPlane";

function isFieldMapActor(
  actor: (typeof humanForestActors)[number],
): actor is FieldMapActor {
  return actor.layer !== "guild";
}

const fieldMapActors = humanForestActors.filter(isFieldMapActor);
const actorsById = new Map(fieldMapActors.map((actor) => [actor.id, actor]));

const ambientFilaments = [
  "M 6 18 C 18 23, 24 31, 37 35 S 57 34, 68 25 S 85 17, 96 26",
  "M 4 48 C 15 42, 25 45, 34 53 S 49 71, 63 66 S 80 54, 96 60",
  "M 12 78 C 23 70, 32 72, 43 80 S 61 92, 74 82 S 85 69, 95 76",
  "M 22 10 C 29 24, 28 37, 39 46 S 59 52, 68 64 S 78 77, 88 90",
  "M 10 66 C 20 62, 26 55, 35 57 S 49 65, 57 58 S 68 42, 80 40",
  "M 33 18 C 39 27, 42 38, 51 42 S 66 42, 75 33 S 84 24, 93 31",
];

export function RelationshipField() {
  return (
    <section
      aria-label="Relationship field"
      className="relative h-full min-h-[38rem] overflow-hidden rounded-lg border border-white/10 bg-slate-950/45 p-5 shadow-[inset_0_0_110px_rgba(20,184,166,0.08)] lg:min-h-0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(20,184,166,0.24),transparent_28%),radial-gradient(circle_at_20%_18%,rgba(132,204,22,0.16),transparent_20%),radial-gradient(circle_at_84%_76%,rgba(251,191,36,0.12),transparent_18%)]" />
      <div className="human-forest-stars absolute inset-0 opacity-65" />

      <div className="relative z-30">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-white">Human Forest</p>
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-200/10 text-emerald-100 shadow-[0_0_34px_rgba(16,185,129,0.25)]">
            <Sprout aria-hidden="true" className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-semibold text-white">
            Not everything matters the same.
          </h1>
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <filter id="filament-glow">
            <feGaussianBlur stdDeviation="0.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ambient-filament-glow">
            <feGaussianBlur stdDeviation="0.32" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#ambient-filament-glow)" opacity="0.42">
          {ambientFilaments.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="rgb(153 246 228)"
              strokeDasharray="0.45 2.2"
              strokeLinecap="round"
              strokeWidth="0.11"
            />
          ))}
          <path
            d="M 28 64 C 37 55, 44 50, 50 50 S 61 45, 72 36"
            fill="none"
            stroke="rgb(253 230 138)"
            strokeLinecap="round"
            strokeWidth="0.13"
          />
        </g>
        {humanForestConnections.map((connection) => {
          const from = actorsById.get(connection.fromActorId);
          const to = actorsById.get(connection.toActorId);

          if (!from || !to) {
            return null;
          }

          const isPrimaryConnection =
            connection.connectionType === "close" ||
            connection.strength >= 0.75;
          const isPartyConnection =
            from.layer === "party" ||
            to.layer === "party" ||
            from.layer === "self" ||
            to.layer === "self";

          return (
            <line
              key={connection.id}
              filter="url(#filament-glow)"
              opacity={isPrimaryConnection ? 0.72 : 0.23}
              stroke={
                isPartyConnection && isPrimaryConnection
                  ? "rgb(253 230 138)"
                  : isPrimaryConnection
                    ? "rgb(167 243 208)"
                    : "rgb(125 211 252)"
              }
              strokeDasharray={isPrimaryConnection ? "0" : "1 2.8"}
              strokeLinecap="round"
              strokeWidth={isPrimaryConnection ? 0.38 : 0.18}
              x1={from.position.x}
              x2={to.position.x}
              y1={from.position.y}
              y2={to.position.y}
            />
          );
        })}
      </svg>

      {humanForestGuilds.map((guild) => (
        <GuildPlane key={guild.id} guild={guild} />
      ))}

      {fieldMapActors.map((node) => (
        <FieldNode key={node.id} node={node} />
      ))}

      <FieldControlBar viewControl="timeline" />
    </section>
  );
}
