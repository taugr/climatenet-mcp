# Getting Started

The hosted Streamable HTTP MCP endpoint is:

```text
https://climatenet-mcp.tomauger.am/mcp
```

Use this URL directly in clients that support remote Streamable HTTP MCP servers.

## Codex

Install the server:

```sh
codex mcp add climatenet --url https://climatenet-mcp.tomauger.am/mcp
```

Verify it:

```sh
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

## Claude Code

Install the server:

```sh
claude mcp add --transport http --scope user climatenet https://climatenet-mcp.tomauger.am/mcp
```

Verify it:

```sh
claude mcp get climatenet
claude mcp list
```

## Claude Desktop

Claude Desktop can connect to remote MCP servers through custom connectors. Add a custom remote connector in Claude's Connectors settings with this URL:

```text
https://climatenet-mcp.tomauger.am/mcp
```

If you need a local stdio bridge, use `mcp-remote` in `claude_desktop_config.json`:

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

## First Query

After connecting, ask your MCP client to list ClimateNet devices:

```text
List online ClimateNet devices in Yerevan.
```

Then query one device:

```text
Get the latest ClimateNet reading for device 8.
```

Use the [Tool Reference](/guide/tools) for exact tool names, parameters, and result shapes.
