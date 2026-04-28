import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";

const endpoint = process.env.MCP_ENDPOINT ?? "http://localhost:3000/mcp";

const client = new Client({
  name: "climatenet-smoke",
  version: "0.1.0",
});

const transport = new StreamableHTTPClientTransport(new URL(endpoint));

interface DeviceSummary {
  generated_id: number;
}

interface LatestReading {
  time: string;
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name).sort();
  console.log(`tools: ${names.join(", ")}`);

  const devices = await callJson("list_devices", { status: "online" });
  assert(Array.isArray(devices), "list_devices should return an array");
  assert(devices.length > 0, "list_devices should return at least one device");

  const deviceId = (devices[0] as DeviceSummary).generated_id;
  assert(typeof deviceId === "number", "device generated_id should be numeric");

  const device = (await callJson("get_device", { device_id: deviceId })) as DeviceSummary;
  assert(device.generated_id === deviceId, "get_device should return the requested device");

  const latest = (await callJson("get_latest_reading", {
    device_id: deviceId,
  })) as LatestReading | null;
  assert(
    latest === null || typeof latest.time === "string",
    "get_latest_reading should return a reading or null",
  );

  const graph = await callJson("get_device_graph", {
    device_id: deviceId,
    start_date: "2026-04-27",
    end_date: "2026-04-28",
    metric: "temperature",
  });
  assert(Array.isArray(graph), "get_device_graph should return an array");
  assert(graph.length > 0, "get_device_graph should return points");
  assert(
    "time" in graph[0] && "value" in graph[0],
    "metric graph points should have time and value",
  );

  const readings = await callJson("get_device_readings", {
    device_id: deviceId,
    start_date: "2026-04-27",
    end_date: "2026-04-28",
  });
  assert(Array.isArray(readings), "get_device_readings should return an array");
  assert(readings.length > 0, "get_device_readings should return readings");
  assert("timestamp" in readings[0], "normalized public API reading should include timestamp");

  const comparison = await callJson("compare_devices", {
    device_ids: [deviceId],
    start_date: "2026-04-27",
    end_date: "2026-04-28",
    metric: "temperature",
  });
  assert(Array.isArray(comparison), "compare_devices should return an array");
  assert(comparison[0].device_id === deviceId, "compare_devices should include requested device");

  console.log("smoke ok");
} finally {
  await client.close();
}

async function callJson(name: string, args: Record<string, unknown>): Promise<unknown> {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as TextContent[] | undefined;
  const firstContent = content?.[0];
  if (!firstContent || firstContent.type !== "text") {
    throw new Error(`${name} did not return text content`);
  }

  return JSON.parse(firstContent.text) as unknown;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
