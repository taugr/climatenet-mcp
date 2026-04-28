import { createMcpHandler } from "agents/mcp";
import { createClimateNetMcpServer } from "./mcp.js";

type Env = Record<string, unknown>;

type McpWorkerHandler = ReturnType<typeof createMcpHandler>;
type McpWorkerRequest = Parameters<McpWorkerHandler>[0];
type McpWorkerContext = Parameters<McpWorkerHandler>[2];
type McpWorkerResponse = Awaited<ReturnType<McpWorkerHandler>>;

export default {
  async fetch(
    request: McpWorkerRequest,
    env: Env,
    ctx: McpWorkerContext,
  ): Promise<McpWorkerResponse> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ ok: true, name: "climatenet-mcp" });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("ClimateNet MCP server. Use /mcp with an MCP client.", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const server = createClimateNetMcpServer();
    return createMcpHandler(server, { route: "/mcp" })(request, env, ctx);
  },
};
