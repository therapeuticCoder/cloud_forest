import { fileURLToPath } from "node:url";

export const migrationsFolder = fileURLToPath(
  new URL("../drizzle", import.meta.url),
);

export const migrationsSchema = "drizzle";
export const migrationsTable = "__drizzle_migrations";
