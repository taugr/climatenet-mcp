# ClimateNet MCP

MCP server exposing ClimateNet environmental monitoring data.

## Local Development

```bash
pnpm install
pnpm dev
```

The local streamable HTTP endpoint is:

```text
http://localhost:3000/mcp
```

Useful checks:

```bash
pnpm build
pnpm smoke
```

## Tools

- `list_devices` - list ClimateNet devices with optional status, region, issue, and sensor filters.
- `get_device` - fetch metadata for one device.
- `get_latest_reading` - fetch the latest environmental reading for one device.
- `get_device_readings` - fetch documented API readings, normalized from `keys` plus row arrays into objects.
- `get_device_graph` - fetch 15-minute graph data for one device and optionally one metric.
- `compare_devices` - fetch aligned graph series for multiple devices for one metric.
