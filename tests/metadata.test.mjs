import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readText = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const packageJson = JSON.parse(readText("../package.json"));
const manifest = JSON.parse(readText("../mcpb/manifest.json"));
const contract = JSON.parse(readText("../contracts/tubealfred-youtube-operations.v1.json"));
const readme = readText("../README.md");
const publicTools = contract.operations
  .filter((operation) => operation.mcp.public)
  .map((operation) => operation.mcp.name);

assert.equal(packageJson.name, "@tubealfred/mcp");
assert.equal(packageJson.version, manifest.version);
assert.equal(contract.manifest_version, "1.1.0");
assert.equal(publicTools.length, 34);
assert.match(manifest.long_description, /34 read-only YouTube research tools/);
assert.match(readme, /versioned operation manifest/);
assert.match(manifest.long_description, /resets to 50 each month on your signup anniversary/);
assert.match(manifest.long_description, /unused free credits do not roll over/);
assert.doesNotMatch(manifest.long_description, /youtube_video_transcript_full/);

for (const tool of publicTools) {
  assert.match(
    manifest.long_description,
    new RegExp(`\\b${tool}\\b`),
    `MCPB manifest should mention ${tool}`,
  );
}
