import {
  Gift,
  HandHeart,
  List,
  PenLine,
  Sprout,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import communityPortraits from "@/assets/timeline/community-portraits.png";
import solArdenPortrait from "@/assets/curator/sol-arden.png";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

type PartyLayerProps = {
  onAdd: () => void;
  onNavigateToTimeline: () => void;
  onSelect: (selection: CuratorSelection, trigger: HTMLButtonElement) => void;
  people: CuratorPerson[];
  user: CuratorPerson;
};

type PortraitPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const portraitPositions: Record<string, PortraitPosition> = {
  mira: "top-left",
  anya: "bottom-left",
  dev: "bottom-right",
  ren: "top-right",
};

const portraitPositionStyles: Record<PortraitPosition, string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
};

export function Portrait({
  initials,
  personId,
  portraitUrl,
  small = false,
}: {
  initials?: string;
  personId: string;
  portraitUrl?: string;
  small?: boolean;
}) {
  if (portraitUrl) {
    return (
      <img
        alt=""
        className={
          small
            ? "party-self-portrait"
            : "party-portrait party-portrait--single"
        }
        src={portraitUrl}
      />
    );
  }

  if (personId === "sol") {
    return (
      <img
        alt=""
        className={
          small
            ? "party-self-portrait"
            : "party-portrait party-portrait--single"
        }
        src={solArdenPortrait}
      />
    );
  }

  if (personId === "you") {
    return (
      <span
        aria-hidden="true"
        className={
          small
            ? "party-self-portrait party-self-portrait--fallback"
            : "party-portrait party-portrait--fallback"
        }
      >
        Y
      </span>
    );
  }

  if (!portraitPositions[personId] && initials) {
    return (
      <span
        aria-hidden="true"
        className={
          small
            ? "party-self-portrait party-self-portrait--fallback"
            : "party-portrait party-portrait--fallback"
        }
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={
        small
          ? "party-self-portrait party-self-portrait--sheet"
          : "party-portrait"
      }
      style={{
        backgroundImage: `url(${communityPortraits})`,
        backgroundPosition:
          portraitPositionStyles[portraitPositions[personId] ?? "top-left"],
      }}
    />
  );
}

function PartyCard({
  onSelect,
  person,
}: {
  onSelect: (trigger: HTMLButtonElement) => void;
  person: CuratorPerson;
}) {
  return (
    <button
      aria-label={`Open ${person.displayName}`}
      className={`party-card party-card--${person.id}`}
      data-curator-tile={`party-${person.id}`}
      onClick={(event) => onSelect(event.currentTarget)}
      type="button"
    >
      <span className="party-card__portrait">
        <Portrait
          initials={person.initials}
          personId={person.id}
          portraitUrl={person.portraitUrl}
        />
        <span className="party-card__name">
          {person.displayName.split(" ")[0]}
        </span>
      </span>
      <span className="party-card__nameplate">
        <span className="party-card__note">{person.relationshipTitle}</span>
      </span>
    </button>
  );
}

export function PartyAction({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  tone,
  className,
}: {
  children: string;
  className?: string;
  disabled?: boolean;
  icon: typeof Gift;
  onClick?: () => void;
  tone: "primary" | "quiet";
}) {
  return (
    <button
      className={`party-action party-action--${tone}${className ? ` ${className}` : ""}`}
      data-party-action={children.toLowerCase()}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" strokeWidth={1.7} />
      <span>{children}</span>
    </button>
  );
}

export function PartyActions({
  activeView,
  onAdd,
  onReceive,
  partyIsFull,
}: {
  activeView: "timeline" | "curator";
  onAdd?: () => void;
  onReceive?: () => void;
  partyIsFull?: boolean;
}) {
  return (
    <div aria-label="Party actions" className="party-actions">
      <PartyAction
        icon={activeView === "timeline" ? PenLine : UserRoundPlus}
        onClick={activeView === "curator" ? onAdd : undefined}
        disabled={activeView === "curator" && partyIsFull}
        tone="primary"
      >
        {activeView === "timeline" ? "Write" : "Add"}
      </PartyAction>
      <PartyAction icon={Gift} tone="quiet">
        Give
      </PartyAction>
      <PartyAction icon={HandHeart} onClick={onReceive} tone="quiet">
        Receive
      </PartyAction>
    </div>
  );
}

export function PartyLayer({
  onNavigateToTimeline,
  onAdd,
  onSelect,
  people,
  user,
}: PartyLayerProps) {
  return (
    <div aria-label="Party people" className="party-layer">
      <header className="party-header">
        <button
          aria-label={`Open ${user.displayName}`}
          className="party-self"
          data-curator-tile={`party-${user.id}`}
          onClick={(event) =>
            onSelect({ layer: "party", item: user }, event.currentTarget)
          }
          type="button"
        >
          <Portrait personId={user.id} small />
        </button>
        <h1>Party</h1>
        <button
          aria-label="Go to Timeline"
          className="party-wordmark"
          onClick={onNavigateToTimeline}
          type="button"
        >
          Timeline <List aria-hidden="true" strokeWidth={1.5} />
        </button>
      </header>

      <div className="party-grid">
        {people.map((person) => (
          <PartyCard
            key={person.id}
            onSelect={(trigger) =>
              onSelect({ layer: "party", item: person }, trigger)
            }
            person={person}
          />
        ))}
        {people.length < 5 ? (
          <button
            aria-label="Add a Party member"
            className="party-card party-card--empty"
            data-curator-tile="party-add"
            onClick={onAdd}
            type="button"
          >
            <span className="party-card__portrait party-card__portrait--empty">
              <UserRoundPlus aria-hidden="true" strokeWidth={1.4} />
            </span>
          </button>
        ) : null}
      </div>

      <div aria-hidden="true" className="party-ornament party-ornament--left">
        <Sprout strokeWidth={1.3} />
      </div>
      <div aria-hidden="true" className="party-ornament party-ornament--right">
        <Sprout strokeWidth={1.3} />
      </div>

      <div aria-label="Continue to Tribe" className="party-continuation">
        <span />
        <UsersRound aria-hidden="true" strokeWidth={1.5} />
        <strong>Tribe</strong>
        <span />
      </div>
    </div>
  );
}
