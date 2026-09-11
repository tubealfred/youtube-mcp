import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const json = async (path) => JSON.parse(await read(path));

test('keeps directory and package copy aligned without implying anonymous access', async () => {
  const listing = await json('../directory-listing.json');
  const pkg = await json('../package.json');
  const readme = await read('../README.md');
  assert.equal(pkg.description, listing.tagline);
  assert.equal(pkg.homepage, listing.homepage);
  assert.deepEqual(pkg.keywords, listing.keywords);
  assert.match(listing.title, /Transcripts/);
  assert.match(listing.description, /No YouTube Data API quota to manage/);
  assert.match(listing.description, /Most successful tool calls cost 1 credit/);
  assert.doesNotMatch(listing.description, /No API key|no quota|any YouTube video|every transcript|no JSON config/i);
  assert.match(readme, /stdio.*TubeAlfred API key/);
  assert.ok(readme.indexOf('https://mcp.tubealfred.com/') < readme.indexOf('## '));
});

test('documents every public tool and excludes the deprecated alias from the tool table', async () => {
  const contract = await json('../contracts/tubealfred-youtube-operations.v1.json');
  const readme = await read('../README.md');
  const table = readme.split('<!-- public-tools:start -->')[1].split('<!-- public-tools:end -->')[0];
  const names = [...table.matchAll(/\| `(\w+)` \|/g)].map((match) => match[1]);
  assert.deepEqual(names, contract.operations.filter((op) => op.mcp.public).map((op) => op.mcp.name));
  assert.equal(names.length, 34);
  assert.ok(!names.includes('youtube_video_transcript_full'));
});
