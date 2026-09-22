export function createInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
