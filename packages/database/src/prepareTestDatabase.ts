import { Pool } from "pg";

import { getTestDatabaseUrl } from "./config.ts";

const testUrl = new URL(getTestDatabaseUrl(process.env));
const testDatabaseName = decodeURIComponent(testUrl.pathname.slice(1));
const administrationUrl = new URL(testUrl);
administrationUrl.pathname = "/postgres";
const pool = new Pool({ connectionString: administrationUrl.toString() });

try {
  const existingDatabase = await pool.query<{ exists: boolean }>(
    "select exists(select 1 from pg_database where datname = $1) as exists",
    [testDatabaseName],
  );

  if (existingDatabase.rows[0]?.exists) {
    console.log(`Disposable test database ${testDatabaseName} already exists.`);
  } else {
    const quotedDatabaseName = `"${testDatabaseName.replaceAll('"', '""')}"`;
    await pool.query(`create database ${quotedDatabaseName}`);
    console.log(`Created disposable test database ${testDatabaseName}.`);
  }
} finally {
  await pool.end();
}
