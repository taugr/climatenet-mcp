import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { TextContent } from '@modelcontextprotocol/sdk/types.js';

const endpoint = process.env.MCP_ENDPOINT ?? 'http://localhost:3030/mcp';

const client = new Client({
  name: 'climatenet-edge-smoke',
  version: '0.1.0',
});

const transport = new StreamableHTTPClientTransport(new URL(endpoint));

interface DeviceSummary {
  parent_name_en: string;
  Status: string;
  PMS5003: string;
}

try {
  await client.connect(transport);

  const shirakOnline = await callJson('list_devices', {
    region: 'Shirak',
    status: 'online',
    sensor: 'PMS5003',
    sensor_status: 'invalid',
  });
  assert(
    Array.isArray(shirakOnline),
    'filtered list_devices should return an array',
  );
  const devices = shirakOnline as DeviceSummary[];
  assert(
    devices.every((device) => device.parent_name_en === 'Shirak'),
    'region filter should apply',
  );
  assert(
    devices.every((device) => device.Status === 'online'),
    'status filter should apply',
  );
  assert(
    devices.every((device) => device.PMS5003 === 'invalid'),
    'sensor filter should apply',
  );

  await expectToolError('get_device', { device_id: 99999 }, 'not found');
  await expectToolError('get_device_graph', {
    device_id: 8,
    start_date: '2026-4-27',
    end_date: '2026-04-28',
  });
  await expectToolError(
    'get_device_readings',
    {
      device_id: 8,
      start_date: '2026-04-27',
    },
    'supplied together',
  );

  const metricGraph = await callJson('get_device_graph', {
    device_id: 8,
    start_date: '2026-04-27',
    end_date: '2026-04-28',
    metric: 'rain',
  });
  assert(Array.isArray(metricGraph), 'metric graph should be an array');
  assert(metricGraph.length > 0, 'metric graph should have points');
  assert(
    Object.keys(metricGraph[0]).join(',') === 'time,value',
    'metric graph should reduce to time/value points',
  );

  console.log('edge smoke ok');
} finally {
  await client.close();
}

async function callJson(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as TextContent[] | undefined;
  const firstContent = content?.[0];
  if (!firstContent || firstContent.type !== 'text') {
    throw new Error(`${name} did not return text content`);
  }

  return JSON.parse(firstContent.text) as unknown;
}

async function expectToolError(
  name: string,
  args: Record<string, unknown>,
  expectedMessagePart?: string,
): Promise<void> {
  const result = await client.callTool({ name, arguments: args });
  assert(result.isError, `${name} should return an MCP tool error`);
  const content = result.content as TextContent[] | undefined;
  const text = content?.[0]?.text ?? '';
  if (expectedMessagePart) {
    assert(
      text.toLowerCase().includes(expectedMessagePart.toLowerCase()),
      `${name} error should mention ${expectedMessagePart}; got ${text}`,
    );
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
