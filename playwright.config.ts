import { defineConfig } from "@playwright/test";
import path from "node:path";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const e2eMagicLinkFile = path.resolve("test-results/e2e-magic-link.json");
const externallyManagedServices = process.env.E2E_EXTERNAL_SERVICES === "1";

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required before the browser services can start.",
  );
}

const serviceEnvironment = Object.entries(process.env).reduce<
  Record<string, string>
>((environment, [name, value]) => {
  if (value !== undefined) environment[name] = value;
  return environment;
}, {});
const nodeCommand = JSON.stringify(process.execPath);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  globalTimeout: 300_000,
  reporter: "line",
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    timezoneId: "America/Chicago",
    trace: "retain-on-failure",
    video: "off",
  },
  snapshotPathTemplate: "{testDir}/snapshots/{arg}-{projectName}{ext}",
  webServer: [
    {
      name: "API",
      command: `${nodeCommand} --env-file-if-exists=.env --experimental-strip-types apps/api/src/main.ts`,
      url: "http://127.0.0.1:3001/api/v1/health",
      timeout: 20_000,
      reuseExistingServer: externallyManagedServices,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...serviceEnvironment,
        API_HOST: "127.0.0.1",
        API_PORT: "3001",
        DATABASE_URL: testDatabaseUrl,
        E2E_MAGIC_LINK_FILE: e2eMagicLinkFile,
      },
      gracefulShutdown:
        process.platform === "win32"
          ? undefined
          : { signal: "SIGTERM", timeout: 5_000 },
    },
    {
      name: "Web",
      command: `${nodeCommand} apps/web/node_modules/vite/bin/vite.js apps/web --mode e2e --host 127.0.0.1 --port 5173 --strictPort`,
      url: "http://127.0.0.1:5173",
      timeout: 20_000,
      reuseExistingServer: externallyManagedServices,
      stdout: "pipe",
      stderr: "pipe",
      env: serviceEnvironment,
      gracefulShutdown:
        process.platform === "win32"
          ? undefined
          : { signal: "SIGTERM", timeout: 5_000 },
    },
  ],
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
