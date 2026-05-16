# Deployment

`climatenet-mcp` has two runtime adapters over the same MCP tools:

- local Express server for development
- Cloudflare Worker for hosted remote MCP access

Both expose a Streamable HTTP MCP endpoint at `/mcp`.

## Production Endpoint

The hosted MCP server is:

```text
https://climatenet-mcp.tomauger.am/mcp
```

Use this URL in remote MCP clients.

## Local Express Server

Run the Express server:

```sh
pnpm dev
```

The default endpoint is:

```text
http://localhost:3000/mcp
```

If port 3000 is already in use, choose another port:

```sh
PORT=3030 pnpm dev
```

Then point smoke checks at that port:

```sh
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke:edge
```

## Local Cloudflare Worker

Run the Worker locally:

```sh
pnpm dev:worker
```

The local Worker endpoint is:

```text
http://localhost:8788/mcp
```

Validate with:

```sh
MCP_ENDPOINT=http://localhost:8788/mcp pnpm smoke
MCP_ENDPOINT=http://localhost:8788/mcp pnpm smoke:edge
```

## Deploy To Cloudflare

Deploy with Wrangler:

```sh
pnpm deploy:worker
```

The Worker config lives in `wrangler.jsonc` and uses the Cloudflare `agents/mcp` Streamable HTTP handler. The current Worker requires the `nodejs_compat` compatibility flag because the Cloudflare `agents` package imports Node built-ins.

## GitHub Pages Docs

The documentation site is configured for GitHub Pages at:

```text
https://taugr.github.io/climatenet-mcp/
```

The VitePress base path is:

```text
/climatenet-mcp/
```
