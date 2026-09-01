import {
  Gift,
  HandHeart,
  Leaf,
  Sprout,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import communityPortraits from "@/assets/timeline/community-portraits.png";
import solArdenPortrait from "@/assets/curator/sol-arden.png";
import type { CuratorPerson, CuratorSelection } from "@/types/curator";

type PartyLayerProps = {
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

const partyPhrases: Record<string, string> = {
  mira: "my calm in the storm",
  sol: "always in my corner",
  anya: "keeps me grounded",
  dev: "my steady place",
  ren: "always makes me laugh",
};

function Portrait({
  personId,
  small = false,
}: {
  personId: string;
  small?: boolean;
}) {
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
        <Portrait personId={person.id} />
        <span className="party-card__name">
          {person.displayName.split(" ")[0]}
        </span>
      </span>
      <span className="party-card__nameplate">
        <span className="party-card__note">
          {partyPhrases[person.id] ?? person.recentStatus}
        </span>
      </span>
    </button>
  );
}

function PartyAction({
  children,
  icon: Icon,
  tone,
}: {
  children: string;
  icon: typeof Gift;
  tone: "primary" | "quiet";
}) {
  return (
    <button className={`party-action party-action--${tone}`} type="button">
      <Icon aria-hidden="true" strokeWidth={1.7} />
      <span>{children}</span>
    </button>
  );
}

export function PartyLayer({ onSelect, people, user }: PartyLayerProps) {
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
          <Portrait personId="mira" small />
        </button>
        <h1>Party</h1>
        <div aria-label="Cloud Forest" className="party-wordmark">
          Cloud Forest <Leaf aria-hidden="true" strokeWidth={1.5} />
        </div>
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
      </div>

      <div aria-hidden="true" className="party-ornament party-ornament--left">
        <Sprout strokeWidth={1.3} />
      </div>
      <div aria-hidden="true" className="party-ornament party-ornament--right">
        <Sprout strokeWidth={1.3} />
      </div>

      <div aria-label="Party actions" className="party-actions">
        <PartyAction icon={UserRoundPlus} tone="primary">
          Add
        </PartyAction>
        <PartyAction icon={Gift} tone="quiet">
          Give
        </PartyAction>
        <PartyAction icon={HandHeart} tone="quiet">
          Receive
        </PartyAction>
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
