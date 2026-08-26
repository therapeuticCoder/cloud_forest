import assert from "node:assert/strict";
import test from "node:test";

import { getDatabaseUrl, getTestDatabaseUrl } from "../src/config.ts";

test("normal configuration defaults to the existing local PostgreSQL service", () => {
  assert.equal(
    getDatabaseUrl({}),
    "postgresql://cloud_forest:cloud_forest_local@localhost:5432/cloud_forest",
  );
});

test("database configuration rejects non-local services", () => {
  assert.throws(
    () =>
      getDatabaseUrl({
        DATABASE_URL: "postgresql://user:password@database.example.com/app",
      }),
    /existing local PostgreSQL service/,
  );
});

test("test configuration requires a distinct, explicitly named test database", () => {
  assert.throws(() => getTestDatabaseUrl({}), /TEST_DATABASE_URL is required/);
  assert.throws(
    () =>
      getTestDatabaseUrl({
        DATABASE_URL:
          "postgresql://cloud_forest:cloud_forest_local@localhost:5432/cloud_forest",
        TEST_DATABASE_URL:
          "postgresql://cloud_forest:cloud_forest_local@localhost:5432/cloud_forest",
      }),
    /separate local database containing 'test'/,
  );
});
