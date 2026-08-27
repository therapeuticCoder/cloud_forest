import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function updateGeneratedArtifact({
  artifactPath,
  contents,
  check,
}) {
  if (!check) {
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, contents, "utf8");
    console.log(`Generated ${path.relative(process.cwd(), artifactPath)}`);
    return;
  }

  let committedContents;
  try {
    committedContents = await readFile(artifactPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        `Generated artifact is missing: ${path.relative(process.cwd(), artifactPath)}`,
        { cause: error },
      );
    }
    throw error;
  }

  if (committedContents !== contents) {
    throw new Error(
      `Generated artifact is stale: ${path.relative(process.cwd(), artifactPath)}`,
    );
  }

  console.log(
    `Generated artifact is current: ${path.relative(process.cwd(), artifactPath)}`,
  );
}
