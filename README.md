# ClimateNet MCP

MCP server exposing ClimateNet environmental monitoring data.

## Quickstart

The hosted Streamable HTTP MCP endpoint is:

```text
https://climatenet-mcp.tomauger.am/mcp
```

### Codex

Install the server:

```bash
codex mcp add climatenet --url https://climatenet-mcp.tomauger.am/mcp
```

Verify it:

```bash
codex mcp get climatenet
codex mcp list
```

This writes a config equivalent to:

```toml
[mcp_servers.climatenet]
url = "https://climatenet-mcp.tomauger.am/mcp"
enabled = true
```

Restart Codex after adding the server.

### Claude Code

Install the server:

```bash
claude mcp add --transport http --scope user climatenet https://climatenet-mcp.tomauger.am/mcp
```

Verify it:

```bash
claude mcp get climatenet
claude mcp list
```

### Claude Desktop

Claude Desktop does not currently have the same CLI install command. Add a custom
remote connector in Claude's Connectors settings with this URL:

```text
https://climatenet-mcp.tomauger.am/mcp
```

Alternatively, bridge it through `mcp-remote` in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "climatenet": {
      "command": "npx",
      "args": ["mcp-remote", "https://climatenet-mcp.tomauger.am/mcp"]
    }
  }
}
```

Restart Claude Desktop after updating the config.

## Tools

- `list_devices` - list ClimateNet devices with optional status, region, issue, and sensor filters.
- `get_device` - fetch metadata for one device.
- `get_latest_reading` - fetch the latest environmental reading for one device.
- `get_device_readings` - fetch documented API readings, normalized from `keys` plus row arrays into objects.
- `get_device_graph` - fetch 15-minute graph data for one device and optionally one metric.
- `compare_devices` - fetch aligned graph series for multiple devices for one metric.

## Local Development

```bash
pnpm install
pnpm dev
```

The local Express Streamable HTTP endpoint is:

```text
http://localhost:3000/mcp
```

If port 3000 is already in use, choose another port:

```bash
PORT=3030 pnpm dev
```

Useful checks:

```bash
pnpm build
pnpm smoke
pnpm smoke:edge
```

## Cloudflare Workers

The Worker entrypoint exposes the same MCP tools through Cloudflare's Streamable HTTP
handler at `/mcp`.

Run the Worker locally:

```bash
pnpm dev:worker
```

The local Worker endpoint is:

```text
http://localhost:8788/mcp
```

Deploy with:

```bash
pnpm deploy:worker
```

The deployed endpoint will be:

```text
https://climatenet-mcp.<account>.workers.dev/mcp
```
