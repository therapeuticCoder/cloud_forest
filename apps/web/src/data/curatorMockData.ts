import type {
  CuratorGuild,
  CuratorMockData,
  CuratorNeighborhood,
  CuratorPerson,
  CuratorSignal,
} from "@/types/curator";

const tribeFirstNames = [
  "Ari",
  "Bea",
  "Cleo",
  "Dara",
  "Eli",
  "Faye",
  "Gio",
  "Hana",
  "Ira",
  "Jules",
  "Kira",
  "Len",
  "Mara",
  "Nico",
  "Ola",
  "Pax",
  "Quin",
  "Rhea",
  "Sage",
  "Tavi",
  "Uma",
  "Vale",
  "Wren",
  "Xan",
  "Yara",
  "Zed",
  "Nell",
  "Orin",
  "Pia",
  "Remy",
];

const neighborhoodSeeds = [
  {
    id: "nearby-family",
    name: "Nearby Family",
    description: "Extended family and long-running household-adjacent ties.",
    suffix: "Vale",
  },
  {
    id: "old-friends",
    name: "Old Friends",
    description: "People with shared history who do not need constant contact.",
    suffix: "Lane",
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Collaborators, peers, and people from making contexts.",
    suffix: "Forge",
  },
  {
    id: "neighbors",
    name: "Neighbors",
    description: "Local, civic, and place-based familiar faces.",
    suffix: "Row",
  },
  {
    id: "loose-orbit",
    name: "Loose Orbit",
    description: "Warm acquaintances and lightweight recurring connections.",
    suffix: "Field",
  },
];

function createInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function createTribePeople(neighborhoodId: string, suffix: string) {
  return tribeFirstNames.slice(0, 20).map((firstName, index): CuratorPerson => {
    const displayName = `${firstName} ${suffix}`;

    return {
      id: `${neighborhoodId}-${index + 1}`,
      displayName,
      initials: createInitials(displayName),
      relationshipTitle: "Tribe connection",
      relationshipNote: "Tribe",
      recentStatus:
        index % 3 === 0
          ? "Quiet lately"
          : index % 3 === 1
            ? "Light check-in"
            : "Recent overlap",
    };
  });
}

export const curatorPartyPeople: CuratorPerson[] = [
  {
    id: "mira",
    displayName: "Mira Vale",
    initials: "MV",
    relationshipTitle: "my calm in the storm",
    relationshipNote: "Daily life",
    recentStatus: "Shared dinner plan",
  },
  {
    id: "sol",
    displayName: "Sol Arden",
    initials: "SA",
    relationshipTitle: "always in my corner",
    relationshipNote: "Closest friend",
    recentStatus: "Sent a voice note",
  },
  {
    id: "anya",
    displayName: "Anya Reed",
    initials: "AR",
    relationshipTitle: "keeps me grounded",
    relationshipNote: "Sibling",
    recentStatus: "Birthday thread active",
  },
  {
    id: "dev",
    displayName: "Dev Rowan",
    initials: "DR",
    relationshipTitle: "my steady place",
    relationshipNote: "Partner",
    recentStatus: "Weekend logistics",
  },
  {
    id: "ren",
    displayName: "Ren Ellis",
    initials: "RE",
    relationshipTitle: "always makes me laugh",
    relationshipNote: "Oldest friend",
    recentStatus: "Needs a reply",
  },
];

export const curatorUser: CuratorPerson = {
  id: "you",
  displayName: "You",
  initials: "YOU",
  relationshipTitle: "your place in the forest",
  relationshipNote: "Your profile",
  recentStatus: "Your place in the forest",
};

export const curatorTribeNeighborhoods: CuratorNeighborhood[] =
  neighborhoodSeeds.map((neighborhood) => ({
    id: neighborhood.id,
    name: neighborhood.name,
    description: neighborhood.description,
    people: createTribePeople(neighborhood.id, neighborhood.suffix),
  }));

export const curatorGuilds: CuratorGuild[] = [
  {
    id: "mutual-care",
    name: "Mutual Care Circle",
    description: "A small group organized around practical help and check-ins.",
    memberCount: 18,
    recentActivity: "Two people coordinated meal support.",
  },
  {
    id: "studio-night",
    name: "Studio Night",
    description: "A recurring creative workspace for slow, shared making.",
    memberCount: 34,
    recentActivity: "Next open table was posted.",
  },
  {
    id: "local-builders",
    name: "Local Builders",
    description:
      "People trading notes on tools, repairs, and neighborhood projects.",
    memberCount: 52,
    recentActivity: "A repair thread picked up new replies.",
  },
  {
    id: "reading-room",
    name: "Reading Room",
    description: "A low-pressure learning group for essays, books, and talks.",
    memberCount: 27,
    recentActivity: "Three links were collected for Sunday.",
  },
  {
    id: "civic-table",
    name: "Civic Table",
    description: "A place-based group for local meetings and mutual awareness.",
    memberCount: 41,
    recentActivity: "New agenda notes landed quietly.",
  },
];

export const curatorSignals: CuratorSignal[] = [
  {
    id: "city-budget",
    name: "City Budget Watch",
    domain: "Local government",
    category: "local-civic",
    description:
      "Ambient civic context that may affect neighborhood priorities.",
    recentActivity: "Public hearing dates were updated.",
  },
  {
    id: "independent-radio",
    name: "Independent Radio",
    domain: "Music",
    category: "music",
    description:
      "A low-volume cultural signal for new releases and local shows.",
    recentActivity: "A weekend playlist was published.",
  },
  {
    id: "small-screen-notes",
    name: "Small Screen Notes",
    domain: "Film",
    category: "film",
    description: "Film and documentary notes that can stay in the outer layer.",
    recentActivity: "A review roundup mentioned three quiet releases.",
  },
  {
    id: "public-tech",
    name: "Public Technology",
    domain: "Technology",
    category: "technology",
    description: "Broader technology changes worth noticing without urgency.",
    recentActivity: "A standards discussion reached draft status.",
  },
  {
    id: "climate-lab",
    name: "Climate Lab",
    domain: "Science",
    category: "science",
    description:
      "Research and environmental updates held as ambient awareness.",
    recentActivity: "A field report summarized seasonal measurements.",
  },
  {
    id: "statehouse-brief",
    name: "Statehouse Brief",
    domain: "Public affairs",
    category: "politics",
    description: "Selected state policy updates without the churn of a feed.",
    recentActivity: "A committee calendar was published.",
  },
  {
    id: "community-arts-calendar",
    name: "Community Arts Calendar",
    domain: "Arts",
    category: "art",
    description: "Nearby exhibitions, performances, and public art events.",
    recentActivity: "Three neighborhood events were added.",
  },
  {
    id: "open-source-ledger",
    name: "Open Source Ledger",
    domain: "Technology",
    category: "technology",
    description: "Measured updates from public-interest software projects.",
    recentActivity: "A long-term support release shipped.",
  },
  {
    id: "public-health-notes",
    name: "Public Health Notes",
    domain: "Science",
    category: "science",
    description: "Plain-language public health research and local guidance.",
    recentActivity: "Seasonal guidance was refreshed.",
  },
  {
    id: "independent-book-review",
    name: "Independent Book Review",
    domain: "Books",
    category: "art",
    description: "Thoughtful criticism and reading suggestions from afar.",
    recentActivity: "The monthly reading list was posted.",
  },
];

export const curatorMockData: CuratorMockData = {
  user: curatorUser,
  partyPeople: curatorPartyPeople,
  tribeNeighborhoods: curatorTribeNeighborhoods,
  guilds: curatorGuilds,
  signals: curatorSignals,
};
