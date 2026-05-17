---
name: climatenet-query
description: >
  This skill should be used when the user asks about "ClimateNet", "air quality in Armenia",
  "environmental monitoring", "sensor readings", "device readings", or wants to "find devices",
  "check pollution levels", "compare stations", or "get historical data" from ClimateNet.
  Also triggers on queries like "what's the PM2.5 in Yerevan", "which ClimateNet sensors are
  offline", or "show me graph data for a device".
metadata:
  version: '0.1.0'
---

# ClimateNet Query

ClimateNet is an Armenian environmental monitoring network. The `climatenet` MCP server exposes read-only tools to discover devices, inspect their status, and retrieve sensor readings.

## Available Tools

| Tool                  | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `list_devices`        | Discover devices, with optional filters                         |
| `get_device`          | Fetch metadata for a single device                              |
| `get_latest_reading`  | Most recent sensor values for a device                          |
| `get_device_readings` | Historical readings (normalized from ClimateNet's keyed format) |
| `get_device_graph`    | 15-minute interval graph data for a device and optional metric  |
| `compare_devices`     | Aligned graph series for multiple devices on one metric         |

## Workflow Patterns

### Discover and read

When the user asks about conditions in a city or region without specifying a device:

1. Call `list_devices` with a `region` or no filter to find relevant devices
2. Call `get_latest_reading` on the most relevant device(s)
3. Present values with units and timestamps

### Filter for problems

When the user asks about offline, broken, or problematic devices:

1. Call `list_devices` with `status` and/or `issue` filters
2. Summarize what's found — device names, regions, reported issues

### Historical trends

When the user asks about trends over time:

1. Use `get_device_readings` for documented API readings over a date range
2. Or use `get_device_graph` for 15-minute resolution graph data
3. Highlight min, max, average, and any anomalies

### Comparisons

When the user wants to compare locations or stations:

1. Use `list_devices` to identify the devices to compare
2. Call `compare_devices` with the device IDs and the metric of interest
3. Present as a table or narrative comparison

## Tips

- Device IDs are integers; use `list_devices` to find them when only a name or region is given.
- `get_device_graph` returns 15-minute granularity — best for recent trends within a day.
- `compare_devices` aligns timeseries across devices — useful for side-by-side station comparisons.
- All tools are read-only. No writes or mutations are possible.
- See `references/tools.md` for parameter details on each tool.
