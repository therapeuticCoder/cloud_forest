import { Pool } from "pg";

import {
  getDatabaseUrl,
  getTestDatabaseUrl,
  isTestDatabaseRequest,
} from "./config.ts";

const useTestDatabase = isTestDatabaseRequest(process.argv.slice(2));
const connectionString = useTestDatabase
  ? getTestDatabaseUrl(process.env)
  : getDatabaseUrl(process.env);
const pool = new Pool({ connectionString });

try {
  const columns = await pool.query(
    `select column_name, data_type, character_maximum_length, is_nullable
       from information_schema.columns
      where table_schema = 'public' and table_name = 'timeline_items'
      order by ordinal_position`,
  );
  const constraints = await pool.query(
    `select conname as constraint_name, pg_get_constraintdef(oid) as definition
       from pg_constraint
      where conrelid = 'public.timeline_items'::regclass
      order by conname`,
  );

  console.log(
    JSON.stringify(
      { columns: columns.rows, constraints: constraints.rows },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
