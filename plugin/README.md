# ClimateNet Plugin

Query ClimateNet environmental monitoring data from Armenia directly in Claude.

## What it does

This plugin connects Claude to the [ClimateNet MCP server](https://climatenet-mcp.tomauger.am), giving it access to read-only tools for discovering monitoring devices, checking sensor status, and retrieving environmental readings across Armenia.

## Components

| Component  | Name               | Purpose                                                      |
| ---------- | ------------------ | ------------------------------------------------------------ |
| MCP Server | `climatenet`       | Connects to `https://climatenet-mcp.tomauger.am/mcp`         |
| Skill      | `climatenet-query` | Guides Claude on querying devices, readings, and comparisons |

## Setup

No API key or authentication required. The MCP server is publicly accessible.

## Usage

Just ask naturally:

- "What are the current air quality readings in Yerevan?"
- "List all active ClimateNet devices in the Aragatsotn region"
- "Show me PM2.5 trends for device 42 over the last week"
- "Compare PM10 levels across these three stations: 12, 17, 34"
- "Which ClimateNet sensors are currently reporting issues?"

## Available MCP Tools

| Tool                  | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `list_devices`        | Discover devices with optional status, region, issue, and sensor filters |
| `get_device`          | Fetch metadata for one device                                            |
| `get_latest_reading`  | Most recent sensor values for a device                                   |
| `get_device_readings` | Historical readings normalized into objects                              |
| `get_device_graph`    | 15-minute graph data for a device and optional metric                    |
| `compare_devices`     | Aligned timeseries for multiple devices on one metric                    |

## About ClimateNet

[ClimateNet](https://climatenet.am/en) is an Armenian environmental monitoring network that publishes data from monitoring devices across the country. This plugin is an independent project and is not affiliated with or endorsed by ClimateNet.
