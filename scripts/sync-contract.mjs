#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_SOURCE = "https://tubealfred.com/.well-known/tubealfred-youtube-operations.v1.json";
const CONTRACT_PATH = resolve("contracts/tubealfred-youtube-operations.v1.json");
const MCPB_MANIFEST_PATH = resolve("mcpb/manifest.json");
const README_PATH = resolve("README.md");
const args = process.argv.slice(2);
const check = args.includes("--check");
const sourceIndex = args.indexOf("--source");
const source = sourceIndex >= 0 ? args[sourceIndex + 1] : DEFAULT_SOURCE;

if (!source) throw new Error("--source requires a file path or URL");
const sourceText = source.startsWith("http://") || source.startsWith("https://")
  ? await fetch(source).then(async (response) => {
      if (!response.ok) throw new Error(`contract fetch failed with HTTP ${response.status}`);
      return response.text();
    })
  : await readFile(resolve(source), "utf8");
const contract = JSON.parse(sourceText);

if (contract.schema_version !== 1 || contract.manifest_version !== "1.1.0") {
  throw new Error("unsupported TubeAlfred operation manifest version");
}
if (!Array.isArray(contract.operations) || contract.operation_count !== contract.operations.length) {
  throw new Error("invalid TubeAlfred operation manifest");
}

const publicTools = contract.operations
  .filter((operation) => operation.mcp.public)
  .map((operation) => operation.mcp.name);
const finalTool = publicTools.at(-1);
const toolList = publicTools.length < 2
  ? (finalTool ?? "")
  : `${publicTools.slice(0, -1).join(", ")}, and ${finalTool}`;
const manifest = JSON.parse(await readFile(MCPB_MANIFEST_PATH, "utf8"));
manifest.long_description = `TubeAlfred exposes ${publicTools.length} read-only YouTube research tools through one hosted MCP server: ${toolList}. Install this extension, paste your API key, and the tools appear in Claude Desktop's tool list.\n\nCredits: 1 per call for most endpoints. Empty transcripts and comment results are free. Batch calls charge per resolved item; non-empty comment responses meter at 1 credit per 20 comments with a 100-comment minimum.`;

const readme = await readFile(README_PATH, "utf8");
const startMarker = "<!-- public-tools:start -->";
const endMarker = "<!-- public-tools:end -->";
if (readme.split(startMarker).length !== 2 || readme.split(endMarker).length !== 2
  || readme.indexOf(startMarker) >= readme.indexOf(endMarker)) {
  throw new Error("README must contain exactly one ordered public-tool marker pair");
}
const table = [
  "| Tool | What it does |",
  "| --- | --- |",
  ...contract.operations.filter((operation) => operation.mcp.public).map((operation) =>
    `| \`${operation.mcp.name}\` | ${operation.summary.replace(/\\|/g, "\\\\|").replace(/[\\r\\n]+/g, " ")} |`),
].join("\n");
const generatedReadme = readme.slice(0, readme.indexOf(startMarker))
  + `${startMarker}\n${table}\n${endMarker}`
  + readme.slice(readme.indexOf(endMarker) + endMarker.length);

const outputs = [
  [CONTRACT_PATH, `${JSON.stringify(contract, null, 2)}\n`],
  [MCPB_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
  [README_PATH, generatedReadme],
];

if (check) {
  const stale = [];
  for (const [path, expected] of outputs) {
    const actual = await readFile(path, "utf8").catch(() => "");
    if (actual !== expected) stale.push(path);
  }
  if (stale.length) throw new Error(`generated contract files are stale: ${stale.join(", ")}`);
  process.stdout.write(`MCP metadata contract ${contract.manifest_version} is current.\n`);
} else {
  for (const [path, value] of outputs) await writeFile(path, value, "utf8");
  process.stdout.write(`Generated MCP metadata for ${publicTools.length} public tools.\n`);
}
