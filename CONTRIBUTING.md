# Contributing to climatenet-mcp

Thanks for contributing.

## Setup

Requirements:

- Node.js 20+
- `pnpm` 10+

Clone the repo and install dependencies:

```bash
git clone https://github.com/taugr/climatenet-mcp.git
cd climatenet-mcp
pnpm install
```

This repo is a small MCP server package:

- the MCP HTTP server lives at `src/server.ts`
- ClimateNet API access and normalization live at `src/climatenet.ts`
- fallback device metadata lives at `src/fallback-devices.ts`
- tests live under `tests/`

## Common Commands

```bash
pnpm run test
pnpm run lint
pnpm run format
pnpm run build
```

Useful variants:

```bash
pnpm run lint:fix
pnpm run format:fix
pnpm run test:watch
```

For live MCP smoke checks, start the server and run:

```bash
pnpm run dev
MCP_ENDPOINT=http://localhost:3000/mcp pnpm run smoke
```

## Workflow

1. Make changes under `src/` and add or update focused tests under `tests/`.
2. Keep upstream ClimateNet calls mocked in unit/integration tests; use smoke scripts for live endpoint checks.
3. Run the narrowest relevant test first, then `pnpm run test`.
4. Run `pnpm run lint`, `pnpm run format`, and `pnpm run build` before opening a PR.
5. Update `README.md` when tools, installation, or workflows change.

## Testing

Tests live under `tests/`.

Run the full suite:

```bash
pnpm run test
```

## Pull Requests

- Keep changes focused.
- Add tests for behavior changes.
- Prefer updating documentation in the same PR when user-facing behavior changes.
- Keep smoke scripts aligned with the public MCP tool surface.

## Questions

Open an issue at [github.com/taugr/climatenet-mcp/issues](https://github.com/taugr/climatenet-mcp/issues).
