import { lstat, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const disposableDirectoryNames = new Set([
  ".vite",
  "coverage",
  "dist",
  "dist-ssr",
]);
const protectedDirectoryNames = new Set([
  ".git",
  ".pnpm-store",
  "backups",
  "node_modules",
]);

function isInsideRepository(repositoryRoot, candidatePath) {
  const relativePath = path.relative(repositoryRoot, candidatePath);
  return (
    relativePath !== "" &&
    !relativePath.startsWith(`..${path.sep}`) &&
    relativePath !== ".."
  );
}

export async function listGeneratedArtifacts(repositoryRoot) {
  const root = path.resolve(repositoryRoot);
  const targets = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        if (protectedDirectoryNames.has(entry.name)) {
          continue;
        }

        if (disposableDirectoryNames.has(entry.name)) {
          targets.push(entryPath);
          continue;
        }

        await visit(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".tsbuildinfo")) {
        targets.push(entryPath);
      }
    }
  }

  await visit(root);
  return targets.sort((left, right) => left.localeCompare(right));
}

export async function cleanGeneratedArtifacts(
  repositoryRoot,
  { dryRun = false } = {},
) {
  const root = path.resolve(repositoryRoot);
  const targets = await listGeneratedArtifacts(root);

  for (const target of targets) {
    if (!isInsideRepository(root, target)) {
      throw new Error(
        `Refusing to remove a path outside the repository: ${target}`,
      );
    }

    if (!dryRun) {
      const targetStats = await lstat(target);
      if (targetStats.isSymbolicLink()) {
        throw new Error(`Refusing to remove a symbolic link: ${target}`);
      }
      await rm(target, { recursive: targetStats.isDirectory(), force: false });
    }
  }

  return targets;
}

async function main() {
  const unsupportedArguments = process.argv
    .slice(2)
    .filter((argument) => argument !== "--" && argument !== "--dry-run");
  if (unsupportedArguments.length > 0) {
    console.error(`Unsupported argument: ${unsupportedArguments[0]}`);
    process.exitCode = 1;
    return;
  }

  const dryRun = process.argv.includes("--dry-run");
  const targets = await cleanGeneratedArtifacts(process.cwd(), { dryRun });
  const action = dryRun ? "Would remove" : "Removed";

  if (targets.length === 0) {
    console.log("No disposable generated artifacts found.");
    return;
  }

  for (const target of targets) {
    console.log(`${action}: ${path.relative(process.cwd(), target)}`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(`Generated-artifact cleanup failed: ${error.message}`);
    process.exitCode = 1;
  });
}
