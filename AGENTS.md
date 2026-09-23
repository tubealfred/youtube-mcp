# TubeAlfred MCP contributor instructions

This public repository contains the TubeAlfred stdio bridge, MCPB package, Agent Plugin manifest, and focused YouTube research skills. The hosted product server is `https://mcp.tubealfred.com/`; the canonical API specification is `https://tubealfred.com/openapi.json`.

## Safety and product boundaries

- Every advertised TubeAlfred YouTube operation is read-only. Do not add posting, editing, deleting, liking, subscribing, or private YouTube Studio behavior to generated metadata.
- Use official TubeAlfred REST or MCP surfaces. Do not add direct YouTube scraping to this bridge.
- Never commit TubeAlfred API keys, OAuth tokens, customer data, generated credentials, or `.env` files.
- Preserve OAuth for browser-capable hosted MCP clients and API-key support for the stdio bridge.
- Treat validation, authentication, permission, rate-limit, unavailable-data, and upstream failures as operational outcomes. Credits cannot resolve those errors.
- Keep the deprecated full-transcript alias callable for compatibility, but do not include it in public tool counts or discovery.

## Authoritative contracts

- OpenAPI: <https://tubealfred.com/openapi.json>
- Operation manifest: <https://tubealfred.com/.well-known/tubealfred-youtube-operations.v1.json>
- MCP server card: <https://mcp.tubealfred.com/.well-known/mcp/server-card.json>
- Authentication: <https://tubealfred.com/auth.md>
- Pricing and limits: <https://tubealfred.com/pricing.md>

Generated operation metadata in `contracts/` must stay synchronized with the authoritative operation manifest. Update generated files through `pnpm contract:sync`; do not hand-edit generated operation lists.

## Development workflow

Use Node.js 18 or newer and pnpm 10.

```bash
pnpm install
pnpm contract:check
pnpm build
pnpm test
```

Run `pnpm build:mcpb` when changing MCPB metadata or packaged files. Tests must pass before a release. Do not publish npm packages, GitHub releases, MCPB artifacts, or registry entries without explicit maintainer authorization.

## Agent Plugin layout

- `plugin.json` is the Agent Plugins 1.0 manifest.
- `mcp.json` declares the hosted Streamable HTTP MCP server.
- `.cursor-plugin/plugin.json` is the Cursor Marketplace manifest; keep its version in step with `package.json`.
- `skills/*/SKILL.md` contains focused, read-only workflow instructions.
- `src/` contains the stdio bridge implementation.

When changing a skill, keep its tool names aligned with the server card and operation manifest. Prefer small, auditable workflows that fetch only the data needed for the user's question.
