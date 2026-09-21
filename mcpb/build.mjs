import { createWriteStream, existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import archiver from "archiver";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const stdioDist = resolve(repoRoot, "dist", "index.js");
const staging = resolve(here, "staging");
const distDir = resolve(here, "dist");
const outputFile = resolve(distDir, "tubealfred-youtube.mcpb");
const updatesFile = resolve(distDir, "updates.json");

async function ensureCleanDir(path) {
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true });
}

async function copyIfExists(source, target) {
  if (!existsSync(source)) {
    return false;
  }

  await copyFile(source, target);

  return true;
}

async function main() {
  if (!existsSync(stdioDist)) {
    throw new Error(`Missing build output: ${stdioDist}\nRun \`pnpm build\` first.`);
  }

  await ensureCleanDir(staging);
  await ensureCleanDir(distDir);

  await mkdir(resolve(staging, "server"), { recursive: true });
  await copyFile(stdioDist, resolve(staging, "server", "index.js"));

  const packageJson = JSON.parse(await readFile(resolve(repoRoot, "package.json"), "utf8"));
  const manifest = JSON.parse(await readFile(resolve(here, "manifest.json"), "utf8"));
  manifest.version = packageJson.version;

  await writeFile(resolve(staging, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  await copyIfExists(resolve(here, "icon.png"), resolve(staging, "icon.png"));

  await new Promise((resolvePromise, rejectPromise) => {
    const output = createWriteStream(outputFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolvePromise);
    output.on("error", rejectPromise);
    archive.on("error", rejectPromise);
    archive.pipe(output);
    archive.directory(staging, false);
    archive.finalize();
  });

  process.stdout.write(`Built ${outputFile}\n`);

  await writeFile(updatesFile, `${JSON.stringify({
    latest_version: packageJson.version,
    download_url: `https://github.com/tubealfred/youtube-mcp/releases/download/v${packageJson.version}/tubealfred-youtube.mcpb`,
    release_notes: `https://github.com/tubealfred/youtube-mcp/releases/tag/v${packageJson.version}`,
  }, null, 2)}\n`);
  process.stdout.write(`Built ${updatesFile}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
