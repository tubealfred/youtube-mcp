import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import { test } from "node:test";

const execute = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

function zipEntries(buffer) {
  const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(end >= 0, "MCPB must contain a ZIP directory");
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  const entries = new Map();

  for (let index = 0; index < count; index++) {
    assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
    const method = buffer.readUInt16LE(offset + 10);
    const size = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const compressed = buffer.subarray(start, start + size);

    assert.ok(method === 0 || method === 8);
    entries.set(name, method === 8 ? inflateRawSync(compressed) : compressed);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

test("MCPB launches its extracted ESM entrypoint outside the repository package", async (t) => {
  await execute(process.execPath, [resolve(root, "mcpb/build.mjs")], { cwd: root });
  const archive = zipEntries(await readFile(resolve(root, "mcpb/dist/tubealfred-youtube.mcpb")));
  const standalone = await mkdtemp(join(tmpdir(), "tubealfred-mcpb-launch-"));
  t.after(() => rm(standalone, { recursive: true, force: true }));

  // An explicit CommonJS parent prevents newer Node versions from masking missing ESM metadata.
  await writeFile(join(standalone, "package.json"), '{"type":"commonjs"}\n');
  for (const [name, contents] of archive) {
    if (!name.startsWith("server/") || name.endsWith("/")) continue;
    const target = resolve(standalone, name);
    assert.ok(target.startsWith(`${join(standalone, "server")}${sep}`));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }

  const outcome = await new Promise((complete) => {
    execFile(process.execPath, [join(standalone, "server/index.js")], {
      cwd: standalone,
      env: { PATH: process.env.PATH, TUBEALFRED_MCP_URL: "http://127.0.0.1:1/" },
      timeout: 5000,
    }, (error, stdout, stderr) => complete({ error, stdout, stderr }));
  });

  assert.equal(outcome.error?.code, 1);
  assert.equal(outcome.stdout, "");
  assert.match(outcome.stderr, /Missing TUBEALFRED_API_KEY/);
  assert.doesNotMatch(outcome.stderr, /SyntaxError|ERR_MODULE_NOT_FOUND/);
});
