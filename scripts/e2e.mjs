import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const preparationCommands = [
  "db:test:prepare",
  "db:migrate:test",
  "db:status:test",
  "db:fixtures:seed",
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
const e2eMagicLinkFile = path.resolve(
  repositoryRoot,
  "test-results",
  "e2e-magic-link.json",
);

export function ensurePlaywrightChromiumInstalled() {
  const executablePath = chromium.executablePath();
  if (existsSync(executablePath)) return executablePath;

  throw new Error(
    [
      "Playwright Chromium is not installed for this workspace.",
      `Expected executable: ${executablePath}`,
      "Install it with:",
      "  pnpm.cmd e2e:install",
    ].join("\n"),
  );
}

function e2eServiceDefinitions(environment) {
  const nodeCommand = JSON.stringify(process.execPath);
  return [
    {
      name: "API",
      command: `${nodeCommand} --env-file-if-exists=.env --experimental-strip-types apps/api/src/main.ts`,
      environment: {
        ...environment,
        DATABASE_URL: environment.TEST_DATABASE_URL,
        API_HOST: "127.0.0.1",
        API_PORT: "3001",
        E2E_MAGIC_LINK_FILE: e2eMagicLinkFile,
      },
      url: "http://127.0.0.1:3001/api/v1/health",
    },
    {
      name: "Web",
      command: `${nodeCommand} apps/web/node_modules/vite/bin/vite.js apps/web --mode e2e --host 127.0.0.1 --port 5173 --strictPort`,
      environment,
      url: "http://127.0.0.1:5173/",
    },
  ];
}

async function waitForService(url, timeoutMilliseconds = 20_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) return;
    } catch {
      // The service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for E2E service at ${url}.`);
}

async function startE2eServices(environment = process.env) {
  const services = [];
  try {
    for (const definition of e2eServiceDefinitions(environment)) {
      console.log(`Starting E2E ${definition.name} service.`);
      const service = spawn(definition.command, {
        cwd: repositoryRoot,
        env: definition.environment,
        shell: true,
        stdio: "inherit",
        windowsHide: true,
      });
      services.push(service);
      await waitForService(definition.url);
    }
    return services;
  } catch (error) {
    await stopE2eServices(services);
    throw error;
  }
}

async function stopE2eServices(services) {
  await Promise.all(
    services.map(async (service) => {
      if (!service.pid) return;
      terminateProcessTree(service, "SIGTERM");
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 10_000);
        service.once("close", () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }),
  );
}

export function runBrowserSuite({
  arguments_: browserArguments = [],
  browserTimeoutMilliseconds = 330_000,
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
  if (options.runCommand || options.browserSuiteOptions?.spawnProcess) {
    await runBrowserSuite(options.browserSuiteOptions);
    return;
  }

  const services = await startE2eServices();
  try {
    const browserSuiteOptions = options.browserSuiteOptions ?? {};
    await runBrowserSuite({
      ...browserSuiteOptions,
      environment: {
        ...process.env,
        ...browserSuiteOptions.environment,
        E2E_EXTERNAL_SERVICES: "1",
      },
    });
  } finally {
    await stopE2eServices(services);
  }
}

async function main() {
  try {
    ensurePlaywrightChromiumInstalled();
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
