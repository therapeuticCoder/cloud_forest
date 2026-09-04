export const mealGratitudeStatements = [
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

export function getMealGratitudeStatement(statementId: string) {
  return mealGratitudeStatements.find(
    (statement) => statement.id === statementId,
  );
}
