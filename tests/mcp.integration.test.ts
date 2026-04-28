import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "node:http";
import { installClimateNetFetchMock } from "./test-utils.js";

describe("ClimateNet MCP HTTP integration", () => {
  let server: Server;
  let endpoint: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    installClimateNetFetchMock();
    const { app } = await import("../src/server.js");

    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (!address || typeof address === "string") throw new Error("Expected TCP server address");
        endpoint = `http://127.0.0.1:${address.port}/mcp`;
        resolve();
      });
    });
  });

  beforeEach(() => {
    installClimateNetFetchMock();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  it("lists the expected tool surface", async () => {
    await withClient(async (client) => {
      const response = await client.listTools();

      expect(response.tools.map((tool) => tool.name).sort()).toEqual([
        "compare_devices",
        "get_device",
        "get_device_graph",
        "get_device_readings",
        "get_latest_reading",
        "list_devices",
      ]);
    });
  });

  it("handles browser CORS preflight requests", async () => {
    const response = await fetch(endpoint, {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,mcp-session-id",
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
    expect(response.headers.get("access-control-allow-headers")?.toLowerCase()).toContain(
      "mcp-session-id",
    );
    expect(response.headers.get("access-control-expose-headers")).toContain("Mcp-Session-Id");
  });

  it("calls representative tools through MCP", async () => {
    await withClient(async (client) => {
      const devices = await callJson(client, "list_devices", { region: "Yerevan" });
      expect(devices[0]).toMatchObject({ generated_id: 8, parent_name_en: "Yerevan" });

      const readings = await callJson(client, "get_device_readings", {
        device_id: 8,
        start_date: "2026-04-27",
        end_date: "2026-04-28",
      });
      expect(readings).toHaveLength(2);
      expect(readings[0]).toMatchObject({ timestamp: "2026-04-27 00:00:00" });

      const comparison = await callJson(client, "compare_devices", {
        device_ids: [8],
        start_date: "2026-04-27",
        end_date: "2026-04-28",
        metric: "temperature",
      });
      expect(comparison[0]).toMatchObject({
        device_id: 8,
        metric: "temperature",
        points: [
          { time: "2026-04-27T00:00:00", value: 13.38 },
          { time: "2026-04-27T00:15:00", value: 13.94 },
        ],
      });
    });
  });

  it("returns tool errors without hanging", async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: "get_device",
        arguments: { device_id: 999999 },
      });

      expect(result.isError).toBe(true);
      expect(textFromResult(result)).toContain("Device 999999 was not found");
    });
  });

  async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client({ name: "vitest-client", version: "0.1.0" });
    const transport = new StreamableHTTPClientTransport(new URL(endpoint));

    await client.connect(transport);
    try {
      return await fn(client);
    } finally {
      await client.close();
    }
  }
});

async function callJson(client: Client, name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  expect(result.isError).not.toBe(true);
  return JSON.parse(textFromResult(result));
}

function textFromResult(result: Awaited<ReturnType<Client["callTool"]>>): string {
  const content = result.content as TextContent[] | undefined;
  const firstContent = content?.[0];
  if (!firstContent || firstContent.type !== "text") {
    throw new Error("Expected text content");
  }
  return firstContent.text;
}
