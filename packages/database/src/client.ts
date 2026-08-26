import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema.ts";

export function createDatabaseClient(connectionString: string) {
  const pool = new Pool({ connectionString });
  const database = drizzle({ client: pool, schema });

  return { database, pool };
}

export type DatabaseClient = ReturnType<
  typeof createDatabaseClient
>["database"];
