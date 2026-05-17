const realFetch = globalThis.fetch;

export const SAMPLE_PUBLIC_RESPONSE = {
  keys: [
    'id',
    'timestamp',
    'uv',
    'lux',
    'temperature',
    'pressure',
    'humidity',
    'pm1',
    'pm2_5',
    'pm10',
    'wind speed',
    'rain',
    'wind direction',
  ],
  data: [
    [
      101,
      '2026-04-27 00:00:00',
      0,
      4.89,
      13.38,
      867,
      56,
      14,
      15,
      15,
      0.13,
      0,
      'E',
    ],
    [
      102,
      '2026-04-27 00:15:00',
      0,
      5,
      13.94,
      867,
      54,
      15,
      16,
      16,
      0.1,
      0,
      'NE',
    ],
  ],
};

export function installClimateNetFetchMock() {
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (
        url.startsWith('http://127.0.0.1:') ||
        url.startsWith('http://localhost:')
      ) {
        return realFetch(input, init);
      }

      if (url.includes('climatenet.am/device_inner/list/')) {
        throw new Error('site device list unavailable');
      }

      if (url.includes('execute-api.us-east-1.amazonaws.com/getData')) {
        return jsonResponse(SAMPLE_PUBLIC_RESPONSE);
      }

      return new Response('not found', { status: 404 });
    },
  );

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
