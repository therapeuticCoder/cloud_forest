const defaultLocalDatabaseUrl =
  "postgresql://cloud_forest:cloud_forest_local@localhost:5432/cloud_forest";

const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function parseLocalPostgresUrl(rawUrl: string, variableName: string): URL {
  let databaseUrl: URL;

  try {
    databaseUrl = new URL(rawUrl);
  } catch {
    throw new Error(`${variableName} must be a valid PostgreSQL URL.`);
  }

  if (
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !localDatabaseHosts.has(databaseUrl.hostname)
  ) {
    throw new Error(
      `${variableName} must target the existing local PostgreSQL service.`,
    );
  }

  if (databaseUrl.pathname.length <= 1) {
    throw new Error(`${variableName} must include a database name.`);
  }

  return databaseUrl;
}

export function getDatabaseUrl(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  return parseLocalPostgresUrl(
    environment.DATABASE_URL ?? defaultLocalDatabaseUrl,
    "DATABASE_URL",
  ).toString();
}

export function getTestDatabaseUrl(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const rawTestUrl = environment.TEST_DATABASE_URL;
  if (!rawTestUrl) {
    throw new Error(
      "TEST_DATABASE_URL is required for database tests and migrations.",
    );
  }

  const testUrl = parseLocalPostgresUrl(rawTestUrl, "TEST_DATABASE_URL");
  const normalUrl = new URL(getDatabaseUrl(environment));
  const testDatabaseName = testUrl.pathname.slice(1);

  if (
    testUrl.toString() === normalUrl.toString() ||
    testDatabaseName === normalUrl.pathname.slice(1) ||
    !/(?:^|[_-])test(?:$|[_-])/.test(testDatabaseName)
  ) {
    throw new Error(
      "TEST_DATABASE_URL must name a separate local database containing 'test'.",
    );
  }

  return testUrl.toString();
}

export function isTestDatabaseRequest(arguments_: readonly string[]): boolean {
  return arguments_.includes("--test");
}
