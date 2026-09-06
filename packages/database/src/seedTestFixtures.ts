import { createDatabaseClient } from "./client.ts";
import { getTestDatabaseUrl } from "./config.ts";
import { seedFictionalPartyFixture } from "./partyFixtures.ts";

const { database, pool } = createDatabaseClient(
  getTestDatabaseUrl(process.env),
);

try {
  await seedFictionalPartyFixture(database);
  console.log("Seeded deterministic fictional Party fixture.");
} finally {
  await pool.end();
}
