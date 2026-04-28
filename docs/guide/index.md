# What Is `climatenet-mcp`?

`climatenet-mcp` is a Model Context Protocol server for querying ClimateNet environmental monitoring data from Armenia.

It exposes read-only MCP tools for discovering devices, inspecting metadata, reading recent measurements, fetching chart-ready time series, and comparing devices over a shared date range.

> `climatenet-mcp` is an independent project and is not affiliated with, endorsed by, or maintained by ClimateNet.

## The Mental Model

ClimateNet devices report environmental data such as temperature, humidity, pressure, particulate matter, UV, light, wind, and rain.

`climatenet-mcp` gives agents a small set of structured tools:

- discover device IDs before querying readings
- inspect one device's metadata and sensor health
- fetch readings from the documented public API
- return graph-ready time series for one metric
- compare one metric across multiple devices

The goal is to make ClimateNet data easy to inspect from MCP clients without requiring agents to scrape pages or guess API parameters.

## Recommended Flow

Start by listing devices:

```text
list_devices({ "region": "Yerevan" })
```

Inspect a device:

```text
get_device({ "device_id": 8 })
```

Fetch readings or graph data:

```text
get_device_readings({
  "device_id": 8,
  "start_date": "2026-04-27",
  "end_date": "2026-04-28"
})

get_device_graph({
  "device_id": 8,
  "start_date": "2026-04-27",
  "end_date": "2026-04-28",
  "metric": "temperature"
})
```

Continue to [Getting Started](/guide/getting-started) to connect an MCP client.
