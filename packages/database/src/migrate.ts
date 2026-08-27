import { migrate } from "drizzle-orm/node-postgres/migrator";

import { createDatabaseClient } from "./client.ts";
import {
  getDatabaseUrl,
  getTestDatabaseUrl,
  isTestDatabaseRequest,
} from "./config.ts";
import {
  migrationsFolder,
  migrationsSchema,
  migrationsTable,
} from "./migrationConfig.ts";

const useTestDatabase = isTestDatabaseRequest(process.argv.slice(2));
const connectionString = useTestDatabase
  ? getTestDatabaseUrl(process.env)
  : getDatabaseUrl(process.env);
const targetVariable = useTestDatabase ? "TEST_DATABASE_URL" : "DATABASE_URL";
const { database, pool } = createDatabaseClient(connectionString);

try {
  console.log(
    `Migration target: ${targetVariable} (${new URL(connectionString).pathname.slice(1)}).`,
  );
  await migrate(database, {
    migrationsFolder,
    migrationsSchema,
    migrationsTable,
  });
  console.log(
    `Migrations are current for ${new URL(connectionString).pathname.slice(1)}.`,
  );
} finally {
  await pool.end();
}
