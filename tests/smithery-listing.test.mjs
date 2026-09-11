import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { updateSmitheryListing } from '../scripts/update-smithery-listing.mjs';

const listing = JSON.parse(await readFile(new URL('../directory-listing.json', import.meta.url), 'utf8'));

test('updates only the owned Smithery listing metadata and verifies it', async () => {
  let server = { qualifiedName: 'tubealfred/youtube', displayName: 'Old', description: 'Old', connections: [{ type: 'http', deploymentUrl: 'https://mcp.tubealfred.com/' }] };
  const calls = [];
  const result = await updateSmitheryListing({ apiKey: 'test-not-a-credential', request: async (url, options) => {
    assert.equal(url, 'https://api.smithery.ai/servers/tubealfred%2Fyoutube');
    assert.equal(options.redirect, 'error');
    calls.push(options.method);
    if (options.method === 'PATCH') {
      const body = JSON.parse(options.body);
      assert.deepEqual(Object.keys(body).sort(), ['description', 'displayName', 'homepage', 'repositoryUrl']);
      assert.equal(body.displayName, listing.title);
      server = { ...server, ...body };
      return Response.json({ success: true });
    }
    return Response.json(server);
  } });
  assert.equal(result.verified, true);
  assert.deepEqual(calls, ['GET', 'PATCH', 'GET']);
});

test('does not write to an unexpected Smithery identity', async () => {
  let calls = 0;
  await assert.rejects(updateSmitheryListing({ apiKey: 'test-not-a-credential', request: async () => {
    calls++;
    return Response.json({ qualifiedName: 'someone/else' });
  } }));
  assert.equal(calls, 1);
});

test('stops on permission denial without exposing the provider response', async () => {
  await assert.rejects(updateSmitheryListing({ apiKey: 'test-not-a-credential', request: async () =>
    new Response('private provider response', { status: 403 }) }),
  { message: 'Smithery metadata GET failed (HTTP 403).' });
});
