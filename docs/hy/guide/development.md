# Մշակում

## Setup

```sh
pnpm install
```

Պահանջներ՝

- Node.js 20+
- `pnpm` 10+

## Հրամաններ

```sh
pnpm format
pnpm lint
pnpm test
pnpm build
```

Local docs development-ի համար՝

```sh
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

MCP smoke check-երի համար՝

```sh
pnpm smoke
pnpm smoke:edge
```

Սահմանեք `MCP_ENDPOINT`, եթե պետք է ստուգել ոչ լռելյայն endpoint՝

```sh
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke
```

## Նախագծի կառուցվածքը

- `src/mcp.ts`: shared MCP server և գործիքների registration
- `src/server.ts`: local Express Streamable HTTP adapter
- `src/worker.ts`: Cloudflare Worker adapter
- `src/climatenet.ts`: ClimateNet API client և normalization helpers
- `tests/`: Vitest unit և integration tests
- `docs/`: VitePress փաստաթղթերի կայք

## Hooks

Այս repo-ն օգտագործում է Husky և lint-staged։ Pre-commit hook-ը staged ֆայլերի վրա գործարկում է `oxfmt`։

## Նախագծի փաստաթղթեր

- [Contributing](https://github.com/taugr/climatenet-mcp/blob/main/CONTRIBUTING.md)
- [Security](https://github.com/taugr/climatenet-mcp/blob/main/SECURITY.md)
- [License](https://github.com/taugr/climatenet-mcp/blob/main/LICENSE)
