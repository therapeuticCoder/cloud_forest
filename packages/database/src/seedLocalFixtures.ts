import { createDatabaseClient } from "./client.ts";
import { getDatabaseUrl } from "./config.ts";
import { seedFictionalPartyFixture } from "./partyFixtures.ts";

const { database, pool } = createDatabaseClient(getDatabaseUrl(process.env));

try {
  await seedFictionalPartyFixture(database);
  console.log("Seeded the local invited Cloud Forest account fixture.");
} finally {
  await pool.end();
}
