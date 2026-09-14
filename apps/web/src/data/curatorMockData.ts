import type { CuratorMockData, CuratorPerson } from "@/types/curator";

export function createInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
  displayName: "River Tester",
  initials: "RT",
  relationshipTitle: "your place in the forest",
  relationshipNote: "Your profile",
  recentStatus: "Your place in the forest",
};

export const curatorMockData: CuratorMockData = {
  user: curatorUser,
  partyPeople: curatorPartyPeople,
};
