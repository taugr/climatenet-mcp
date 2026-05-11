<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef } from "vue";
import type * as Leaflet from "leaflet";

const DEVICE_LIST_URL = "https://climatenet.am/device_inner/list/";
const READINGS_URL = "https://emvnh9buoh.execute-api.us-east-1.amazonaws.com/getData";
const ARMENIA_CENTER: Leaflet.LatLngExpression = [40.0691, 45.0382];
const ALL_REGIONS = "All regions";

interface ClimateNetDevice {
  generated_id: number;
  name: string;
  name_en: string;
  parent_name: string;
  parent_name_en: string;
  parent_name_hy: string;
  latitude: string;
  longitude: string;
  PMS5003: "valid" | "invalid" | "nodata";
  Status: "online" | "offline";
  last_updated: string;
}

interface LatestReading {
  timestamp: string;
  pm1: number | null;
  pm2_5: number | null;
  pm10: number | null;
}

interface StationReading {
  device: ClimateNetDevice;
  reading: LatestReading | null;
}

interface PublicApiResponse {
  keys: string[];
  data: unknown[][];
}

const mapElement = ref<HTMLElement | null>(null);
const map = shallowRef<Leaflet.Map | null>(null);
const stationLayer = shallowRef<Leaflet.FeatureGroup | null>(null);
const stations = ref<StationReading[]>([]);
const selectedRegion = ref(ALL_REGIONS);
const loading = ref(true);
const readingLoadCompleted = ref(0);
const readingLoadTotal = ref(0);
const error = ref<string | null>(null);
const loadedAt = ref<Date | null>(null);
const leaflet = shallowRef<typeof Leaflet | null>(null);

const regionOptions = computed(() => {
  const regions = new Set(stations.value.map((station) => regionName(station.device)));
  return [ALL_REGIONS, ...[...regions].sort((left, right) => left.localeCompare(right))];
});
const visibleStations = computed(() => {
  if (selectedRegion.value === ALL_REGIONS) return stations.value;
  return stations.value.filter((station) => regionName(station.device) === selectedRegion.value);
});
const stationCount = computed(() => visibleStations.value.length);
const selectedRegionLabel = computed(() =>
  selectedRegion.value === ALL_REGIONS ? "Armenia" : selectedRegion.value,
);
const loadingStatus = computed(() => {
  if (readingLoadTotal.value === 0) return "Finding ClimateNet stations...";
  return `Loading readings ${readingLoadCompleted.value} of ${readingLoadTotal.value}`;
});
const latestTimestamp = computed(() => {
  const timestamps = visibleStations.value
    .map((station) => station.reading?.timestamp)
    .filter((timestamp): timestamp is string => Boolean(timestamp));

  return timestamps.sort().at(-1) ?? null;
});

onMounted(async () => {
  leaflet.value = await import("leaflet");
  await nextTick();
  initializeMap();
  await loadStations();
});

onUnmounted(() => {
  map.value?.remove();
  map.value = null;
});

async function loadStations(): Promise<void> {
  loading.value = true;
  readingLoadCompleted.value = 0;
  readingLoadTotal.value = 0;
  error.value = null;

  try {
    const devices = await fetchDevices();
    const devicesWithCoordinates = devices.filter(hasCoordinates);
    readingLoadTotal.value = devicesWithCoordinates.length;

    const results = await Promise.allSettled(
      devicesWithCoordinates.map(async (device) => {
        try {
          return {
            device,
            reading: await fetchLatestReading(device.generated_id),
          };
        } finally {
          readingLoadCompleted.value += 1;
        }
      }),
    );

    stations.value = results
      .filter(
        (result): result is PromiseFulfilledResult<StationReading> => result.status === "fulfilled",
      )
      .map((result) => result.value);

    const failedCount = results.length - stations.value.length;
    if (failedCount > 0) {
      error.value = `${failedCount} station${failedCount === 1 ? "" : "s"} could not load current readings.`;
    }

    if (!regionOptions.value.includes(selectedRegion.value)) {
      selectedRegion.value = ALL_REGIONS;
    }

    loadedAt.value = new Date();
    renderStations();
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Could not load ClimateNet air quality data.";
    stations.value = [];
    renderStations();
  } finally {
    loading.value = false;
  }
}

async function fetchDevices(): Promise<ClimateNetDevice[]> {
  const response = await fetch(DEVICE_LIST_URL, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`ClimateNet devices request failed with ${response.status}.`);
  }

  return (await response.json()) as ClimateNetDevice[];
}

async function fetchLatestReading(deviceId: number): Promise<LatestReading | null> {
  const url = new URL(READINGS_URL);
  url.searchParams.set("device_id", String(deviceId));

  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`ClimateNet readings request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as PublicApiResponse;
  const row = payload.data.at(-1);
  if (!row) return null;

  const record = Object.fromEntries(payload.keys.map((key, index) => [key, row[index]]));

  return {
    timestamp: String(record.timestamp ?? ""),
    pm1: nullableNumber(record.pm1),
    pm2_5: nullableNumber(record.pm2_5),
    pm10: nullableNumber(record.pm10),
  };
}

function initializeMap(): void {
  if (!mapElement.value || !leaflet.value || map.value) return;

  const L = leaflet.value;
  const nextMap = L.map(mapElement.value, {
    center: ARMENIA_CENTER,
    zoom: 8,
    scrollWheelZoom: false,
  });
  nextMap.attributionControl.setPrefix(false);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(nextMap);

  stationLayer.value = L.featureGroup().addTo(nextMap);
  map.value = nextMap;
}

function renderStations(): void {
  if (!leaflet.value || !map.value || !stationLayer.value) return;

  const L = leaflet.value;
  stationLayer.value.clearLayers();

  for (const station of visibleStations.value) {
    const lat = Number(station.device.latitude);
    const lng = Number(station.device.longitude);
    const style = pm25Style(station.reading?.pm2_5 ?? null);

    L.circleMarker([lat, lng], {
      radius: 10,
      color: style.stroke,
      weight: 2,
      fillColor: style.fill,
      fillOpacity: 0.86,
    })
      .bindPopup(popupHtml(station))
      .addTo(stationLayer.value);
  }

  if (visibleStations.value.length > 0) {
    map.value.fitBounds(stationLayer.value.getBounds(), { padding: [36, 36], maxZoom: 14 });
  } else {
    map.value.setView(ARMENIA_CENTER, 8);
  }
}

function handleRegionChange(): void {
  renderStations();
}

function regionName(device: ClimateNetDevice): string {
  return device.parent_name_en || device.parent_name || "Unknown";
}

function hasCoordinates(device: ClimateNetDevice): boolean {
  return Number.isFinite(Number(device.latitude)) && Number.isFinite(Number(device.longitude));
}

function nullableNumber(value: unknown): number | null {
  if (value === null || typeof value === "undefined") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function pm25Style(value: number | null): { fill: string; label: string; stroke: string } {
  if (value === null) return { fill: "#737373", stroke: "#525252", label: "No PM2.5 data" };
  if (value <= 12) return { fill: "#2e8b57", stroke: "#166534", label: "Low" };
  if (value <= 35.4) return { fill: "#d9a441", stroke: "#a16207", label: "Moderate" };
  if (value <= 55.4) return { fill: "#d97706", stroke: "#9a3412", label: "Elevated" };
  return { fill: "#c2410c", stroke: "#7c2d12", label: "High" };
}

function popupHtml(station: StationReading): string {
  const reading = station.reading;
  const style = pm25Style(reading?.pm2_5 ?? null);

  return `
    <div class="aq-popup">
      <strong>${escapeHtml(station.device.name_en || station.device.name)}</strong>
      <span>${escapeHtml(regionName(station.device))}</span>
      <span>${escapeHtml(style.label)} particulate status</span>
      <dl>
        <div><dt>PM1</dt><dd>${formatPm(reading?.pm1)}</dd></div>
        <div><dt>PM2.5</dt><dd>${formatPm(reading?.pm2_5)}</dd></div>
        <div><dt>PM10</dt><dd>${formatPm(reading?.pm10)}</dd></div>
      </dl>
      <p>${reading?.timestamp ? escapeHtml(reading.timestamp) : "No current reading"}</p>
      <p>${escapeHtml(station.device.Status)} device - PMS5003 ${escapeHtml(station.device.PMS5003)}</p>
    </div>
  `;
}

function formatPm(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toFixed(value % 1 === 0 ? 0 : 1)} ug/m3` : "No data";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character] ?? character;
  });
}
</script>

<template>
  <section class="aq-map-shell">
    <div class="aq-map-header">
      <div>
        <p class="aq-eyebrow">Live particulate readings</p>
        <h2>ClimateNet air quality</h2>
      </div>
      <div class="aq-controls">
        <label class="aq-region">
          <span>Region</span>
          <select v-model="selectedRegion" :disabled="loading" @change="handleRegionChange">
            <option v-for="region in regionOptions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </label>
        <button class="aq-refresh" type="button" :disabled="loading" @click="loadStations">
          {{ loading ? "Loading" : "Refresh" }}
        </button>
      </div>
    </div>

    <div class="aq-map-meta" aria-live="polite">
      <span>
        {{ stationCount }} {{ selectedRegionLabel }} station{{ stationCount === 1 ? "" : "s" }}
      </span>
      <span v-if="latestTimestamp">Latest reading {{ latestTimestamp }}</span>
      <span v-if="loadedAt">Loaded {{ loadedAt.toLocaleTimeString() }}</span>
    </div>

    <p v-if="error" class="aq-error">{{ error }}</p>

    <div class="aq-map-frame">
      <div
        ref="mapElement"
        class="aq-map"
        :aria-label="`Map of ${selectedRegionLabel} ClimateNet air quality stations`"
      />
      <div v-if="loading" class="aq-loading" role="status" aria-live="polite">
        <span class="aq-spinner" aria-hidden="true" />
        <strong>Preparing map</strong>
        <span>{{ loadingStatus }}</span>
      </div>
      <div v-else-if="stationCount === 0" class="aq-empty">
        No {{ selectedRegionLabel }} stations are available right now.
      </div>
    </div>

    <div class="aq-legend" aria-label="PM2.5 particulate status legend">
      <span><i style="background: #2e8b57" />Low</span>
      <span><i style="background: #d9a441" />Moderate</span>
      <span><i style="background: #d97706" />Elevated</span>
      <span><i style="background: #c2410c" />High</span>
      <span><i style="background: #737373" />No data</span>
    </div>
  </section>
</template>

<style scoped>
.aq-map-shell {
  margin: 32px 0;
}

.aq-map-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.aq-eyebrow {
  margin: 0 0 4px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.aq-map-header h2 {
  margin: 0;
  border: 0;
  padding: 0;
}

.aq-refresh {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 7px 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 600;
  cursor: pointer;
}

.aq-controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.aq-region {
  display: grid;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
}

.aq-region select {
  min-width: 148px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 7px 28px 7px 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font: inherit;
}

.aq-refresh:disabled {
  cursor: wait;
  opacity: 0.62;
}

.aq-map-meta,
.aq-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.aq-error {
  margin: 12px 0;
  color: #b45309;
  font-size: 14px;
}

.aq-map-frame {
  position: relative;
  overflow: hidden;
  margin: 16px 0 12px;
  min-height: 520px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.aq-map {
  position: absolute;
  inset: 0;
  min-height: 520px;
  z-index: 0;
}

.aq-empty {
  position: absolute;
  inset: auto 16px 16px;
  z-index: 500;
  border-radius: 6px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--vp-c-bg) 92%, transparent);
  box-shadow: var(--vp-shadow-2);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.aq-loading {
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 500;
  display: grid;
  justify-items: center;
  min-width: min(280px, calc(100% - 32px));
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 18px 20px;
  background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
  box-shadow: var(--vp-shadow-3);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transform: translate(-50%, -50%);
}

.aq-loading strong {
  margin-top: 10px;
}

.aq-loading span:last-child {
  margin-top: 4px;
  color: var(--vp-c-text-2);
}

.aq-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid color-mix(in srgb, var(--vp-c-brand-1) 24%, transparent);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: aq-spin 0.8s linear infinite;
}

.aq-legend {
  align-items: center;
}

.aq-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.aq-legend i {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

:global(.aq-popup) {
  min-width: 180px;
}

:global(.aq-popup strong),
:global(.aq-popup span) {
  display: block;
}

:global(.aq-popup span),
:global(.aq-popup p) {
  margin: 4px 0 0;
  color: #4b5563;
}

:global(.aq-popup dl) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 10px 0;
}

:global(.aq-popup dt) {
  color: #6b7280;
  font-size: 11px;
}

:global(.aq-popup dd) {
  margin: 0;
  font-weight: 700;
}

@keyframes aq-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .aq-map-header {
    align-items: stretch;
    flex-direction: column;
  }

  .aq-refresh {
    width: 100%;
  }

  .aq-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .aq-region select {
    width: 100%;
  }

  .aq-map-frame,
  .aq-map {
    min-height: 420px;
  }
}
</style>
