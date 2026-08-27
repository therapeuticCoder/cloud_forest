import { readMigrationFiles } from "drizzle-orm/migrator";
import { Pool } from "pg";

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

type AppliedMigration = { hash: string; created_at: string };

const useTestDatabase = isTestDatabaseRequest(process.argv.slice(2));
const connectionString = useTestDatabase
  ? getTestDatabaseUrl(process.env)
  : getDatabaseUrl(process.env);
const targetVariable = useTestDatabase ? "TEST_DATABASE_URL" : "DATABASE_URL";
const localMigrations = readMigrationFiles({ migrationsFolder });
const pool = new Pool({ connectionString });

try {
  const tableName = `${migrationsSchema}.${migrationsTable}`;
  const tableResult = await pool.query<{ exists: string | null }>(
    "select to_regclass($1) as exists",
    [tableName],
  );
  const appliedMigrations = tableResult.rows[0]?.exists
    ? (
        await pool.query<AppliedMigration>(
          `select hash, created_at::text from ${migrationsSchema}.${migrationsTable} order by created_at`,
        )
      ).rows
    : [];

  const appliedCount = appliedMigrations.length;
  const pendingCount = Math.max(localMigrations.length - appliedCount, 0);
  const divergent =
    appliedCount > localMigrations.length ||
    appliedMigrations.some(
      (migration, index) => localMigrations[index]?.hash !== migration.hash,
    );

  console.log(
    `Target: ${targetVariable} (${new URL(connectionString).pathname.slice(1)})`,
  );
  console.log(`Applied: ${appliedCount}`);
  console.log(`Pending: ${pendingCount}`);
  console.log(`Divergent: ${divergent ? "yes" : "no"}`);

  if (divergent) process.exitCode = 1;
} finally {
  await pool.end();
}
