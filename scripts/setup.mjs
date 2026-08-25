import { spawnSync } from "node:child_process";

const requiredNodeVersion = "22.23.2";
const requiredPnpmVersion = "11.1.2";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const requiresCommandShell = process.platform === "win32";

function fail(message) {
  console.error(`Environment setup failed: ${message}`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CI: process.env.CI ?? "true",
    },
    stdio: "inherit",
    shell: requiresCommandShell,
  });

  if (result.error) {
    fail(`${command} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited with code ${result.status}`);
  }
}

if (process.version !== `v${requiredNodeVersion}`) {
  fail(
    `Node ${requiredNodeVersion} is required, but ${process.version.slice(1)} is active. Run "nvm use ${requiredNodeVersion}".`,
  );
}

const pnpmVersion = spawnSync(pnpmCommand, ["--version"], {
  encoding: "utf8",
  shell: requiresCommandShell,
});

if (pnpmVersion.error || pnpmVersion.status !== 0) {
  fail("pnpm is unavailable. Enable Corepack and prepare pnpm 11.1.2.");
}

if (pnpmVersion.stdout.trim() !== requiredPnpmVersion) {
  fail(
    `pnpm ${requiredPnpmVersion} is required, but ${pnpmVersion.stdout.trim()} is active.`,
  );
}

run(pnpmCommand, ["install", "--frozen-lockfile"]);
run(pnpmCommand, ["check"]);

console.log("Cloud Forest environment setup completed successfully.");
