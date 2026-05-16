# Development

## Setup

```sh
pnpm install
```

Requirements:

- Node.js 20+
- `pnpm` 10+

## Commands

```sh
pnpm format
pnpm lint
pnpm test
pnpm build
```

For local docs development:

```sh
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

For MCP smoke checks:

```sh
pnpm smoke
pnpm smoke:edge
```

Set `MCP_ENDPOINT` to test a non-default endpoint:

```sh
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke
```

## Project Shape

- `src/mcp.ts`: shared MCP server and tool registration
- `src/server.ts`: local Express Streamable HTTP adapter
- `src/worker.ts`: Cloudflare Worker adapter
- `src/climatenet.ts`: ClimateNet API client and normalization helpers
- `tests/`: Vitest unit and integration tests
- `docs/`: VitePress documentation site

## Hooks

This repo uses Husky and lint-staged. The pre-commit hook runs `oxfmt` on staged files.

## Project Documents

- [Contributing](https://github.com/taugr/climatenet-mcp/blob/main/CONTRIBUTING.md)
- [Security](https://github.com/taugr/climatenet-mcp/blob/main/SECURITY.md)
- [License](https://github.com/taugr/climatenet-mcp/blob/main/LICENSE)
