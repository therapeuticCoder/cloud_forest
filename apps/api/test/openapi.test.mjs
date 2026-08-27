import assert from "node:assert/strict";
import test from "node:test";

import { generateOpenApiDocument } from "../scripts/openapi.mjs";

test("OpenAPI is generated from the registered versioned routes", async () => {
  const document = await generateOpenApiDocument();

  assert.equal(document.openapi, "3.0.3");
  assert.equal(document.paths["/api/v1/health"].get.operationId, "getHealthV1");
  assert.equal(
    document.paths["/api/v1/timeline-items/{timelineItemId}"].get.operationId,
    "getTimelineItemV1",
  );
  assert.deepEqual(
    Object.keys(
      document.paths["/api/v1/timeline-items/{timelineItemId}"].get.responses,
    ).sort(),
    ["200", "400", "404"],
  );
});
