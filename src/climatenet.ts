import { FALLBACK_DEVICES } from "./fallback-devices.js";

export const CLIMATENET_BASE_URL = "https://climatenet.am";
export const CLIMATENET_PUBLIC_API_URL =
  "https://emvnh9buoh.execute-api.us-east-1.amazonaws.com/getData";

const METRICS = [
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
] as const;

const PUBLIC_API_KEY_MAP = {
  id: "id",
  timestamp: "timestamp",
  uv: "uv",
  lux: "lux",
  temperature: "temperature",
  pressure: "pressure",
  humidity: "humidity",
  pm1: "pm1",
  pm2_5: "pm2_5",
  pm10: "pm10",
  "wind speed": "speed",
  rain: "rain",
  "wind direction": "direction",
} as const;

let deviceListCache: Device[] | null = null;

export type Metric = (typeof METRICS)[number];

export type SensorName = "LTR390" | "BME280" | "PMS5003" | "Wind" | "Rainfall";
export type SensorStatus = "valid" | "invalid" | "nodata";
export type DeviceStatus = "online" | "offline";

export interface DeviceIssue {
  id: number;
  name: string;
  name_en: string;
  name_hy: string;
}

export interface Device {
  id: number;
  generated_id: number;
  name: string;
  name_en: string;
  name_hy: string;
  parent_name: string;
  parent_name_en: string;
  parent_name_hy: string;
  latitude: string;
  longitude: string;
  LTR390: SensorStatus;
  BME280: SensorStatus;
  PMS5003: SensorStatus;
  Wind: SensorStatus;
  Rainfall: SensorStatus;
  Status: DeviceStatus;
  last_updated: string;
  created_at: string;
  issues: DeviceIssue[];
}

export interface LatestReading {
  id: number;
  time: string;
  uv: number | null;
  lux: number | null;
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
  pm1: number | null;
  pm2_5: number | null;
  pm10: number | null;
  speed: number | null;
  rain: number | null;
  direction: string | null;
}

export interface GraphReading {
  time_interval: string;
  uv: number | null;
  lux: number | null;
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
  pm1: number | null;
  pm2_5: number | null;
  pm10: number | null;
  speed: number | null;
  rain: number | null;
}

export type PublicApiReading = LatestReading & {
  timestamp: string;
};

export interface ListDevicesFilters {
  region?: string;
  status?: DeviceStatus;
  hasIssues?: boolean;
  sensor?: SensorName;
  sensorStatus?: SensorStatus;
}

export interface CompareSeries {
  device_id: number;
  device_name: string;
  metric: Metric;
  points: Array<{ time: string; value: number | null }>;
}

export function isMetric(value: string): value is Metric {
  return (METRICS as readonly string[]).includes(value);
}

export function supportedMetrics(): Metric[] {
  return [...METRICS];
}

export async function listDevices(filters: ListDevicesFilters = {}): Promise<Device[]> {
  const devices = await getDeviceList();

  return devices.filter((device) => {
    if (filters.region) {
      const region = filters.region.toLowerCase();
      const matchesRegion =
        device.parent_name.toLowerCase().includes(region) ||
        device.parent_name_en.toLowerCase().includes(region) ||
        device.parent_name_hy.toLowerCase().includes(region);
      if (!matchesRegion) return false;
    }

    if (filters.status && device.Status !== filters.status) return false;

    if (typeof filters.hasIssues === "boolean") {
      const hasIssues = device.issues.length > 0;
      if (hasIssues !== filters.hasIssues) return false;
    }

    if (filters.sensor) {
      const sensorValue = device[filters.sensor];
      if (filters.sensorStatus && sensorValue !== filters.sensorStatus) return false;
      if (!filters.sensorStatus && sensorValue !== "valid") return false;
    }

    return true;
  });
}

export async function getDevice(deviceId: number): Promise<Device> {
  const devices = await getDeviceList();
  const device = devices.find((candidate) => candidate.generated_id === deviceId);
  if (!device) throw new Error(`Device ${deviceId} was not found`);
  return device;
}

export async function getLatestReading(deviceId: number): Promise<LatestReading | null> {
  await ensureDeviceExists(deviceId);
  const readings = await getDeviceReadings({ deviceId });
  return readings.at(-1) ?? null;
}

export async function getDeviceReadings(params: {
  deviceId: number;
  startDate?: string;
  endDate?: string;
}): Promise<PublicApiReading[]> {
  validateDatePair(params.startDate, params.endDate);
  await ensureDeviceExists(params.deviceId);

  const url = new URL(CLIMATENET_PUBLIC_API_URL);
  url.searchParams.set("device_id", String(params.deviceId));
  if (params.startDate && params.endDate) {
    url.searchParams.set("start_time", params.startDate);
    url.searchParams.set("end_time", params.endDate);
  }

  const response = await fetchJson<{ keys: string[]; data: unknown[][] }>(url.toString());
  return response.data.map((row) => normalizePublicApiRow(response.keys, row));
}

export async function getDeviceGraph(params: {
  deviceId: number;
  startDate: string;
  endDate: string;
  metric?: Metric;
}): Promise<GraphReading[] | Array<{ time: string; value: number | null }>> {
  validateDate(params.startDate, "start_date");
  validateDate(params.endDate, "end_date");
  const publicReadings = await getDeviceReadings({
    deviceId: params.deviceId,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  const readings = publicReadings.map(publicReadingToGraphReading);

  if (!params.metric) return readings;

  const metric = params.metric;
  return readings.map((reading) => ({
    time: reading.time_interval,
    value: reading[metric],
  }));
}

export async function compareDevices(params: {
  deviceIds: number[];
  startDate: string;
  endDate: string;
  metric: Metric;
}): Promise<CompareSeries[]> {
  validateDate(params.startDate, "start_date");
  validateDate(params.endDate, "end_date");
  if (params.deviceIds.length === 0) throw new Error("At least one device_id is required");
  if (params.deviceIds.length > 10) throw new Error("Compare at most 10 devices at a time");

  const devices = await listDevices();
  const byGeneratedId = new Map(devices.map((device) => [device.generated_id, device]));

  return Promise.all(
    params.deviceIds.map(async (deviceId) => {
      const device = byGeneratedId.get(deviceId);
      if (!device) throw new Error(`Device ${deviceId} was not found`);
      const points = (await getDeviceGraph({
        deviceId,
        startDate: params.startDate,
        endDate: params.endDate,
        metric: params.metric,
      })) as Array<{ time: string; value: number | null }>;

      return {
        device_id: deviceId,
        device_name: device.name_en || device.name,
        metric: params.metric,
        points,
      };
    }),
  );
}

async function ensureDeviceExists(deviceId: number): Promise<void> {
  const devices = await getDeviceList();
  if (!devices.some((device) => device.generated_id === deviceId)) {
    throw new Error(`Device ${deviceId} was not found`);
  }
}

async function getDeviceList(): Promise<Device[]> {
  if (deviceListCache) return deviceListCache;

  try {
    deviceListCache = await requestJson<Device[]>("/device_inner/list/");
    return deviceListCache;
  } catch {
    deviceListCache = FALLBACK_DEVICES;
    return deviceListCache;
  }
}

async function requestJson<T>(path: string): Promise<T> {
  return fetchJson<T>(`${CLIMATENET_BASE_URL}${path}`);
}

async function fetchJson<T>(url: string): Promise<T> {
  const signal = AbortSignal.timeout(8_000);
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ClimateNet request failed: ${response.status} ${response.statusText} ${body}`);
  }

  return (await response.json()) as T;
}

function publicReadingToGraphReading(reading: PublicApiReading): GraphReading {
  return {
    time_interval: reading.timestamp.replace(" ", "T"),
    uv: reading.uv,
    lux: reading.lux,
    temperature: reading.temperature,
    pressure: reading.pressure,
    humidity: reading.humidity,
    pm1: reading.pm1,
    pm2_5: reading.pm2_5,
    pm10: reading.pm10,
    speed: reading.speed,
    rain: reading.rain,
  };
}

function normalizePublicApiRow(keys: string[], row: unknown[]): PublicApiReading {
  const normalized: Record<string, unknown> = {};

  keys.forEach((key, index) => {
    const mappedKey = PUBLIC_API_KEY_MAP[key as keyof typeof PUBLIC_API_KEY_MAP] ?? key;
    normalized[mappedKey] = row[index];
  });

  return {
    id: Number(normalized.id),
    timestamp: String(normalized.timestamp),
    time: String(normalized.timestamp),
    uv: nullableNumber(normalized.uv),
    lux: nullableNumber(normalized.lux),
    temperature: nullableNumber(normalized.temperature),
    pressure: nullableNumber(normalized.pressure),
    humidity: nullableNumber(normalized.humidity),
    pm1: nullableNumber(normalized.pm1),
    pm2_5: nullableNumber(normalized.pm2_5),
    pm10: nullableNumber(normalized.pm10),
    speed: nullableNumber(normalized.speed),
    rain: nullableNumber(normalized.rain),
    direction: typeof normalized.direction === "string" ? normalized.direction : null,
  };
}

function nullableNumber(value: unknown): number | null {
  if (value === null || typeof value === "undefined") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function validateDatePair(startDate?: string, endDate?: string): void {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new Error("start_date and end_date must be supplied together");
  }

  if (startDate) validateDate(startDate, "start_date");
  if (endDate) validateDate(endDate, "end_date");
}

function validateDate(date: string, fieldName: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format`);
  }

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${fieldName} must be a valid calendar date`);
  }
}
