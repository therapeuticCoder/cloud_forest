import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
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

  console.log("E2E database boundary is ready.");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const playwrightCli = path.join(
  repositoryRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

export function runBrowserSuite({
  arguments_: browserArguments = [],
  browserTimeoutMilliseconds = 135_000,
  environment = process.env,
  platform = process.platform,
  spawnProcess = spawn,
  signals = process,
  terminateTree = (child, signal) =>
    terminateProcessTree(child, signal, spawnSync, platform),
} = {}) {
  const normalizedArguments =
    browserArguments[0] === "--" ? browserArguments.slice(1) : browserArguments;

  return new Promise((resolve, reject) => {
    const child = spawnProcess(
      process.execPath,
      [playwrightCli, "test", ...normalizedArguments],
      {
        cwd: repositoryRoot,
        env: environment,
        stdio: "inherit",
        shell: false,
        detached: platform !== "win32",
      },
    );

    let forwardedSignal;
    const timeout = setTimeout(() => {
      console.error(
        `Browser test runner exceeded ${browserTimeoutMilliseconds}ms; terminating its process tree.`,
      );
      terminateTree(child, "SIGKILL");
    }, browserTimeoutMilliseconds);

    const forwardSignal = (signal) => {
      if (forwardedSignal) {
        terminateTree(child, "SIGKILL");
        return;
      }

      forwardedSignal = signal;
      console.error(`Handling ${signal} for the browser test runner.`);
      terminateTree(child, signal);
    };

    const handleSigint = () => forwardSignal("SIGINT");
    const handleSigterm = () => forwardSignal("SIGTERM");

    signals.once("SIGINT", handleSigint);
    signals.once("SIGTERM", handleSigterm);

    const removeSignalHandlers = () => {
      clearTimeout(timeout);
      signals.off("SIGINT", handleSigint);
      signals.off("SIGTERM", handleSigterm);
    };

    child.once("error", (error) => {
      removeSignalHandlers();
      reject(
        new Error(`Browser test runner could not start: ${error.message}`),
      );
    });

    child.once("exit", (code, signal) => {
      removeSignalHandlers();

      if (code === 0) {
        resolve();
        return;
      }

      const outcome = signal ? `signal ${signal}` : `code ${code ?? "unknown"}`;
      reject(new Error(`Browser test runner exited with ${outcome}.`));
    });
  });
}

export function terminateProcessTree(
  child,
  signal,
  runSync = spawnSync,
  platform = process.platform,
  killProcess = process.kill,
) {
  if (platform === "win32" && child.pid) {
    runSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "inherit",
      windowsHide: true,
    });
    return;
  }

  if (child.pid) {
    killProcess(-child.pid, signal);
    return;
  }

  child.kill(signal);
}

export async function runE2e(options = {}) {
  prepareE2eBoundary(options.runCommand);
  await runBrowserSuite(options.browserSuiteOptions);
}

async function main() {
  try {
    await runE2e({
      browserSuiteOptions: { arguments_: process.argv.slice(2) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`E2E failed: ${message}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
