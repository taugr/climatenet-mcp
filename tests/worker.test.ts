vi.mock("agents/mcp", () => ({
  createMcpHandler: () => async () => new Response("mcp handler"),
}));

describe("Cloudflare Worker entrypoint", () => {
  let worker: typeof import("../src/worker.js").default;

  beforeAll(async () => {
    worker = (await import("../src/worker.js")).default;
  });

  it("serves health checks outside the MCP route", async () => {
    const response = await worker.fetch(
      new Request("http://localhost/health"),
      {},
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    await expect(response.json()).resolves.toEqual({ ok: true, name: "climatenet-mcp" });
  });

  it("points plain browser requests to the MCP route", async () => {
    const response = await worker.fetch(
      new Request("http://localhost/"),
      {},
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    await expect(response.text()).resolves.toContain("Use /mcp with an MCP client");
  });
});

function createExecutionContext(): Parameters<typeof import("../src/worker.js").default.fetch>[2] {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}
