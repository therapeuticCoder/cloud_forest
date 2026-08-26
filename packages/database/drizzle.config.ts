import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl } from "./src/config.ts";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getDatabaseUrl(process.env),
  },
  migrations: {
    schema: "drizzle",
    table: "__drizzle_migrations",
  },
  strict: true,
  verbose: true,
});
