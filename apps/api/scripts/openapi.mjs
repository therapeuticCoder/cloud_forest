import path from "node:path";
import { fileURLToPath } from "node:url";

import { updateGeneratedArtifact } from "../../../scripts/generated-artifact.mjs";
import { buildApi } from "../src/app.ts";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const artifactPath = path.resolve(scriptDirectory, "../openapi/openapi.json");

function sortJsonValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, sortJsonValue(entryValue)]),
    );
  }

  return value;
}

export async function generateOpenApiDocument() {
  const server = buildApi();

  try {
    await server.ready();
    return sortJsonValue(server.swagger());
  } finally {
    await server.close();
  }
}

export async function generateOpenApiArtifact({ check = false } = {}) {
  const document = await generateOpenApiDocument();
  const contents = `${JSON.stringify(document, null, 2)}\n`;
  await updateGeneratedArtifact({ artifactPath, contents, check });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateOpenApiArtifact({ check: process.argv.includes("--check") });
}
