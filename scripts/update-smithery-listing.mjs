import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function updateSmitheryListing({ apiKey, request = fetch }) {
  if (!apiKey) throw new Error('SMITHERY_API_KEY is required.');
  const listing = JSON.parse(await readFile(new URL('../directory-listing.json', import.meta.url), 'utf8'));
  const url = 'https://api.smithery.ai/servers/tubealfred%2Fyoutube';
  async function call(method, body) {
    const response = await request(url, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Smithery metadata ${method} failed (HTTP ${response.status}).`);
    return response.json();
  }
  const before = await call('GET');
  assert.equal(before.qualifiedName, 'tubealfred/youtube');
  const result = await call('PATCH', {
    displayName: listing.title,
    description: listing.description,
    homepage: listing.homepage,
    repositoryUrl: listing.repositoryUrl,
  });
  assert.equal(result.success, true);
  const after = await call('GET');
  assert.equal(after.qualifiedName, 'tubealfred/youtube');
  assert.equal(after.displayName, listing.title);
  assert.equal(after.description, listing.description);
  assert.deepEqual(after.connections, before.connections);
  return { qualifiedName: after.qualifiedName, displayName: after.displayName, verified: true };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateSmitheryListing({ apiKey: process.env.SMITHERY_API_KEY })
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
