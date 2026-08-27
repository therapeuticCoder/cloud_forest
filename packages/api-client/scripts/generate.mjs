import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

import { updateGeneratedArtifact } from "../../../scripts/generated-artifact.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const openApiPath = path.resolve(
  scriptDirectory,
  "../../../apps/api/openapi/openapi.json",
);
const artifactPath = path.resolve(
  scriptDirectory,
  "../src/generated/openapi.ts",
);

export async function generateClientTypes({ check = false } = {}) {
  const source = await readFile(openApiPath, "utf8");
  const ast = await openapiTS(JSON.parse(source), {
    alphabetize: true,
    immutable: true,
  });
  const contents = astToString(ast);

  await updateGeneratedArtifact({ artifactPath, contents, check });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateClientTypes({ check: process.argv.includes("--check") });
}
