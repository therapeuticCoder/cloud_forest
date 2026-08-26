import { spawnSync } from "node:child_process";
import { lstat, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const skippedDirectoryNames = new Set([".git", ".pnpm-store", "backups"]);

export async function listNodeModulesDirectories(repositoryRoot) {
  const root = path.resolve(repositoryRoot);
  const targets = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) {
        continue;
      }

      const entryPath = path.join(directory, entry.name);
      if (entry.name === "node_modules") {
        targets.push(entryPath);
        continue;
      }

      if (!skippedDirectoryNames.has(entry.name)) {
        await visit(entryPath);
      }
    }
  }

  await visit(root);
  return targets.sort((left, right) => left.localeCompare(right));
}

export async function removeNodeModules(repositoryRoot, targets) {
  const root = path.resolve(repositoryRoot);

  for (const target of targets) {
    const relativePath = path.relative(root, target);
    if (
      relativePath === "" ||
      relativePath.startsWith(`..${path.sep}`) ||
      relativePath === ".." ||
      path.basename(target) !== "node_modules"
    ) {
      throw new Error(
        `Refusing to remove an unsafe dependency path: ${target}`,
      );
    }

    const targetStats = await lstat(target);
    if (targetStats.isSymbolicLink()) {
      throw new Error(`Refusing to remove a symbolic link: ${target}`);
    }

    await rm(target, { recursive: true, force: false });
  }
}

function installFromFrozenLockfile(repositoryRoot) {
  const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(pnpmCommand, ["install", "--frozen-lockfile"], {
    cwd: repositoryRoot,
    env: { ...process.env, CI: process.env.CI ?? "true" },
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(`${pnpmCommand} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(
      `${pnpmCommand} install --frozen-lockfile exited with code ${result.status}`,
    );
  }
}

async function main() {
  const unsupportedArguments = process.argv
    .slice(2)
    .filter((argument) => argument !== "--" && argument !== "--confirm");
  if (unsupportedArguments.length > 0) {
    console.error(`Unsupported argument: ${unsupportedArguments[0]}`);
    process.exitCode = 1;
    return;
  }

  const repositoryRoot = process.cwd();
  const targets = await listNodeModulesDirectories(repositoryRoot);

  if (!process.argv.includes("--confirm")) {
    console.log("Dependency repair preview. No files were removed.");
    for (const target of targets) {
      console.log(`Would remove: ${path.relative(repositoryRoot, target)}`);
    }
    console.log(
      'Run "pnpm deps:repair -- --confirm" to remove these node_modules directories and reinstall from pnpm-lock.yaml.',
    );
    return;
  }

  await removeNodeModules(repositoryRoot, targets);
  installFromFrozenLockfile(repositoryRoot);
  console.log("Dependencies were rebuilt from the frozen pnpm lockfile.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(`Dependency repair failed: ${error.message}`);
    process.exitCode = 1;
  });
}
