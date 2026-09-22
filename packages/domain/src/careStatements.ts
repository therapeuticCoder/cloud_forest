// Statement IDs are persisted; their meal prefixes remain stable for existing histories.
export const careGratitudeStatements = [
  {
    id: "meal-fed-when-needed",
    text: "Thank you for feeding me when I needed it.",
  },
  {
    id: "meal-care-felt-easy",
    text: "Thank you for making care feel easy.",
  },
  {
    id: "meal-seen-and-supported",
    text: "Thank you for seeing what I needed and showing up.",
  },
] as const;

export function getCareGratitudeStatement(statementId: string) {
  return careGratitudeStatements.find(
    (statement) => statement.id === statementId,
  );
}

export const careApologyStatements = [
  {
    id: "meal-sorry-cant-follow-through",
    text: "I’m sorry, I can’t follow through.",
  },
  {
    id: "meal-something-changed",
    text: "Something changed and I need to step back.",
  },
  {
    id: "meal-sorry-committed",
    text: "I’m sorry I committed and can’t complete this.",
  },
] as const;

export function getCareApologyStatement(statementId: string) {
  return careApologyStatements.find(
    (statement) => statement.id === statementId,
  );
}

export type CareGratitudeStatementId =
  (typeof careGratitudeStatements)[number]["id"];
export type CareWithdrawalStatementId =
  (typeof careApologyStatements)[number]["id"];
