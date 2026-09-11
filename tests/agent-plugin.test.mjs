import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('publishes a conforming Agent Plugins manifest', async () => {
  const manifest = await readJson(new URL('../plugin.json', import.meta.url));
  const packageJson = await readJson(new URL('../package.json', import.meta.url));

  assert.deepEqual(manifest, {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: 'tubealfred-youtube',
    version: packageJson.version,
    description: 'Read-only YouTube research for agents through TubeAlfred MCP, with focused video, audience, and discovery skills.',
    author: {
      name: 'TubeAlfred',
      email: 'contact@tubealfred.com',
      url: 'https://tubealfred.com',
    },
    homepage: 'https://tubealfred.com/mcp',
    repository: 'https://github.com/tubealfred/mcp',
    license: 'MIT',
    keywords: ['youtube', 'mcp', 'agents', 'transcripts', 'comments', 'research'],
  });
});

test('includes the Agent Plugin bundle in the npm package', async () => {
  const packageJson = await readJson(new URL('../package.json', import.meta.url));

  assert.deepEqual(packageJson.files, [
    'dist',
    'README.md',
    'LICENSE',
    'AGENTS.md',
    'plugin.json',
    'mcp.json',
    'skills',
  ]);
});

test('configures the hosted streamable HTTP MCP server', async () => {
  const config = await readJson(new URL('../mcp.json', import.meta.url));

  assert.deepEqual(config, {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: {
      'tubealfred-youtube': {
        type: 'streamable-http',
        url: 'https://mcp.tubealfred.com/',
      },
    },
  });
});

test('bundles focused Agent Skills with complete metadata', async () => {
  const skillsRoot = new URL('../skills/', import.meta.url);
  const directories = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(directories, [
    'youtube-audience-research',
    'youtube-discovery-research',
    'youtube-video-research',
  ]);

  for (const directory of directories) {
    const skill = await readFile(new URL(`${directory}/SKILL.md`, skillsRoot), 'utf8');

    assert.match(skill, /^---\nname: [a-z0-9-]+\ndescription: .+\n---\n/);
    assert.match(skill, /https:\/\/mcp\.tubealfred\.com\//);
    assert.match(skill, /read-only/i);
    assert.match(skill, /credits?/i);
    assert.ok(skill.length > 1200, `${directory} should provide substantive workflow guidance`);
  }
});

test('publishes coding-agent rules and links plugin installation from the readme', async () => {
  const [agents, readme] = await Promise.all([
    readFile(new URL('../AGENTS.md', import.meta.url), 'utf8'),
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
  ]);

  assert.match(agents, /pnpm test/);
  assert.match(agents, /read-only/i);
  assert.match(agents, /https:\/\/tubealfred\.com\/openapi\.json/);
  assert.match(readme, /Agent Plugin/);
  assert.match(readme, /plugin\.json/);
  assert.match(readme, /AGENTS\.md/);
});
