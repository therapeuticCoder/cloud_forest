import { spawnSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

const preparationCommands = [
  "db:test:prepare",
  "db:migrate:test",
  "db:status:test",
  "db:inspect:test",
];

export function runRootCommand(scriptName) {
  const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(pnpmCommand, [scriptName], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw new Error(
      `${pnpmCommand} ${scriptName} could not start: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `${pnpmCommand} ${scriptName} exited with code ${result.status ?? "unknown"}.`,
    );
  }
}

export function prepareE2eBoundary(runCommand = runRootCommand) {
  console.log(
    "Preparing the isolated E2E database boundary. Local PostgreSQL must be running and TEST_DATABASE_URL must name a distinct local test database.",
  );

  for (const command of preparationCommands) {
    console.log(`Running pnpm.cmd ${command}`);
    runCommand(command);
  }

  console.log(
    "E2E database boundary is ready. No product E2E suite is registered yet; T-018K will add the browser runner and first product test.",
  );
}

function main() {
  try {
    prepareE2eBoundary();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`E2E boundary preparation failed: ${message}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
