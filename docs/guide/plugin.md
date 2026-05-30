# Plugin

For Claude Code and Cowork users, this project also ships as an installable plugin that bundles the MCP server connection with a skill that teaches Claude how to chain the tools effectively.

## What's bundled

| Component                  | Purpose                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| MCP Server (`climatenet`)  | HTTP connection to `https://climatenet-mcp.tomauger.am/mcp`                                         |
| Skill (`climatenet-query`) | Guides Claude through device discovery, latest readings, historical trends, and station comparisons |

The plugin is read-only and requires no API key.

## Claude Code

Install from the public marketplace:

```sh
/plugin marketplace add taugr/claude-marketplace
/plugin install climatenet@taugr
```

Verify with `/plugin list` and `/mcp`.

## Cowork

Cowork lives inside the Claude Desktop app under the **Cowork** tab.

1. Download `climatenet.plugin` from the [latest release](https://github.com/taugr/climatenet-mcp/releases/latest)
2. Open Claude Desktop and switch to the **Cowork** tab
3. In the left sidebar, click **Customize**
4. Click **Browse plugins**, then choose **upload a custom plugin file**
5. Select the `climatenet.plugin` file you downloaded

The plugin saves locally to your machine. The skill and MCP server become available immediately.

## Try it

Once installed, ask naturally:

> List active ClimateNet devices in Yerevan and show me the latest PM2.5 reading from one of them.

> Compare PM10 levels between three monitoring stations over the past 24 hours.

> Which ClimateNet sensors are currently reporting issues?

The `climatenet-query` skill activates on questions about ClimateNet, Armenia air quality, environmental monitoring, sensor readings, and similar phrases. See the [Tool Reference](/guide/tools) for the full set of tools the skill calls.

## Without the plugin

If you only want the MCP server (no skill), see [Getting Started](/guide/getting-started) for the raw connector setup that works with Codex, Claude Desktop, and any other Streamable HTTP MCP client.
