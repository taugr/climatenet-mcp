import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  compareDevices,
  getDevice,
  getDeviceGraph,
  getDeviceReadings,
  getLatestReading,
  isMetric,
  listDevices,
  supportedMetrics,
} from "./climatenet.js";

const sensorNameSchema = z.enum(["LTR390", "BME280", "PMS5003", "Wind", "Rainfall"]);
const sensorStatusSchema = z.enum(["valid", "invalid", "nodata"]);
const deviceStatusSchema = z.enum(["online", "offline"]);
const metricSchema = z.enum([
  "uv",
  "lux",
  "temperature",
  "pressure",
  "humidity",
  "pm1",
  "pm2_5",
  "pm10",
  "speed",
  "rain",
]);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");

export function createClimateNetMcpServer(): McpServer {
  const server = new McpServer(
    { name: "climatenet", version: "0.1.0" },
    {
      instructions:
        "Use list_devices to discover ClimateNet generated device IDs before requesting readings. All tools are read-only and return JSON.",
    },
  );

  server.registerTool(
    "list_devices",
    {
      description:
        "List ClimateNet environmental monitoring devices. Filter by region, online/offline status, issue presence, or sensor health.",
      inputSchema: {
        region: z
          .string()
          .optional()
          .describe("Region or province name, for example Yerevan or Shirak."),
        status: deviceStatusSchema.optional().describe("Device status filter."),
        has_issues: z
          .boolean()
          .optional()
          .describe(
            "When true, only devices with reported issues. When false, only devices without issues.",
          ),
        sensor: sensorNameSchema
          .optional()
          .describe(
            "Sensor to filter by. Without sensor_status this returns devices where the sensor is valid.",
          ),
        sensor_status: sensorStatusSchema
          .optional()
          .describe("Sensor status to match when sensor is provided."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ region, status, has_issues, sensor, sensor_status }) =>
      jsonContent(
        await listDevices({
          region,
          status,
          hasIssues: has_issues,
          sensor,
          sensorStatus: sensor_status,
        }),
      ),
  );

  server.registerTool(
    "get_device",
    {
      description:
        "Get metadata, coordinates, sensor health, current status, and reported issues for one ClimateNet device.",
      inputSchema: {
        device_id: z
          .number()
          .int()
          .positive()
          .describe("ClimateNet generated_id from list_devices."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ device_id }) => jsonContent(await getDevice(device_id)),
  );

  server.registerTool(
    "get_latest_reading",
    {
      description:
        "Get the latest available reading for one ClimateNet device, including temperature, humidity, particulate matter, wind, rain, UV, and light.",
      inputSchema: {
        device_id: z
          .number()
          .int()
          .positive()
          .describe("ClimateNet generated_id from list_devices."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ device_id }) => jsonContent(await getLatestReading(device_id)),
  );

  server.registerTool(
    "get_device_readings",
    {
      description:
        "Get ClimateNet readings from the documented public API. Without dates it returns roughly the latest 24 hours. With dates, provide both start_date and end_date.",
      inputSchema: {
        device_id: z
          .number()
          .int()
          .positive()
          .describe("ClimateNet generated_id from list_devices."),
        start_date: dateSchema
          .optional()
          .describe("Start date in YYYY-MM-DD format. Must be paired with end_date."),
        end_date: dateSchema
          .optional()
          .describe("End date in YYYY-MM-DD format. Must be paired with start_date."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ device_id, start_date, end_date }) =>
      jsonContent(
        await getDeviceReadings({
          deviceId: device_id,
          startDate: start_date,
          endDate: end_date,
        }),
      ),
  );

  server.registerTool(
    "get_device_graph",
    {
      description:
        "Get chart-ready 15-minute ClimateNet time-series data for one device and date range. Optionally reduce output to one metric.",
      inputSchema: {
        device_id: z
          .number()
          .int()
          .positive()
          .describe("ClimateNet generated_id from list_devices."),
        start_date: dateSchema.describe("Start date in YYYY-MM-DD format."),
        end_date: dateSchema.describe("End date in YYYY-MM-DD format."),
        metric: metricSchema
          .optional()
          .describe(`Optional metric. Supported: ${supportedMetrics().join(", ")}.`),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ device_id, start_date, end_date, metric }) => {
      if (metric && !isMetric(metric)) throw new Error(`Unsupported metric: ${metric}`);
      return jsonContent(
        await getDeviceGraph({
          deviceId: device_id,
          startDate: start_date,
          endDate: end_date,
          metric,
        }),
      );
    },
  );

  server.registerTool(
    "compare_devices",
    {
      description:
        "Compare one metric across multiple ClimateNet devices over the same date range. Returns aligned chart series per device.",
      inputSchema: {
        device_ids: z
          .array(z.number().int().positive())
          .min(1)
          .max(10)
          .describe("ClimateNet generated_id values from list_devices."),
        start_date: dateSchema.describe("Start date in YYYY-MM-DD format."),
        end_date: dateSchema.describe("End date in YYYY-MM-DD format."),
        metric: metricSchema.describe(
          `Metric to compare. Supported: ${supportedMetrics().join(", ")}.`,
        ),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ device_ids, start_date, end_date, metric }) =>
      jsonContent(
        await compareDevices({
          deviceIds: device_ids,
          startDate: start_date,
          endDate: end_date,
          metric,
        }),
      ),
  );

  return server;
}

export { createClimateNetMcpServer as createServer };

function jsonContent(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
