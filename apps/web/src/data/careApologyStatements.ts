export const mealApologyStatements = [
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

export function getMealApologyStatement(statementId: string) {
  return mealApologyStatements.find(
    (statement) => statement.id === statementId,
  );
}
