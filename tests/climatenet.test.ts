import { beforeEach, describe, expect, it, vi } from "vitest";
import { installClimateNetFetchMock } from "./test-utils.js";

describe("ClimateNet client", () => {
  beforeEach(() => {
    vi.resetModules();
    installClimateNetFetchMock();
  });

  it("falls back to seeded devices and applies filters", async () => {
    const { listDevices } = await import("../src/climatenet.js");

    const devices = await listDevices({
      region: "Shirak",
      status: "online",
      sensor: "PMS5003",
      sensorStatus: "invalid",
    });

    expect(devices.map((device) => device.generated_id)).toEqual([1, 3, 4]);
  });

  it("returns a clean error for unknown fallback device ids", async () => {
    const { getDevice } = await import("../src/climatenet.js");

    await expect(getDevice(999999)).rejects.toThrow("Device 999999 was not found");
  });

  it("validates paired dates before device lookup", async () => {
    const fetchMock = installClimateNetFetchMock();
    const { getDeviceReadings } = await import("../src/climatenet.js");

    await expect(
      getDeviceReadings({ deviceId: 8, startDate: "2026-04-27" }),
    ).rejects.toThrow("start_date and end_date must be supplied together");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalizes documented public API row arrays into objects", async () => {
    const { getDeviceReadings } = await import("../src/climatenet.js");

    const readings = await getDeviceReadings({
      deviceId: 8,
      startDate: "2026-04-27",
      endDate: "2026-04-28",
    });

    expect(readings[0]).toMatchObject({
      id: 101,
      timestamp: "2026-04-27 00:00:00",
      temperature: 13.38,
      pm2_5: 15,
      speed: 0.13,
      direction: "E",
    });
  });

  it("reduces graph output to time/value points when a metric is selected", async () => {
    const { getDeviceGraph } = await import("../src/climatenet.js");

    const graph = await getDeviceGraph({
      deviceId: 8,
      startDate: "2026-04-27",
      endDate: "2026-04-28",
      metric: "temperature",
    });

    expect(graph).toEqual([
      { time: "2026-04-27T00:00:00", value: 13.38 },
      { time: "2026-04-27T00:15:00", value: 13.94 },
    ]);
  });
});
