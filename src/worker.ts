import { createMcpHandler } from "agents/mcp";
import { corsHeaders } from "./cors.js";
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
      return Response.json({ ok: true, name: "climatenet-mcp" }, { headers: corsHeaders });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("ClimateNet MCP server. Use /mcp with an MCP client.", {
        headers: { ...corsHeaders, "content-type": "text/plain; charset=utf-8" },
      });
    }

    const server = createClimateNetMcpServer();
    return createMcpHandler(server, {
      route: "/mcp",
      corsOptions: {
        origin: corsHeaders["Access-Control-Allow-Origin"],
        methods: corsHeaders["Access-Control-Allow-Methods"],
        headers: corsHeaders["Access-Control-Allow-Headers"],
        exposeHeaders: corsHeaders["Access-Control-Expose-Headers"],
      },
    })(request, env, ctx);
  },
};
