import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { corsHeaders } from "./cors.js";
import { createClimateNetMcpServer, createServer } from "./mcp.js";

export { createClimateNetMcpServer, createServer };

export const app = express();
app.use((_req, res, next) => {
  Object.entries(corsHeaders).forEach(([name, value]) => {
    res.setHeader(name, value);
  });
  next();
});
app.use(express.json({ limit: "2mb" }));

app.options(/.*/, (_req, res) => {
  res.status(204).end();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "climatenet-mcp" });
});

app.post("/mcp", (req, res) => {
  void handleMcpRequest(req, res);
});

export async function handleMcpRequest(req: express.Request, res: express.Response): Promise<void> {
  const server = createClimateNetMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    void transport.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        id: req.body?.id ?? null,
      });
    }
  }
}

const port = Number(process.env.PORT ?? 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`ClimateNet MCP server listening on http://localhost:${port}/mcp`);
  });
}
