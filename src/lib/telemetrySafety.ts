import { directoryRows } from "../api/adapters";
import { api, orgPath, segment } from "../api/client";
import {
  object,
  text,
  type ListData,
  type Query,
  type Row,
} from "../api/types";

export interface ColorBand {
  color: string;
  label: string;
  shortLabel: string;
}

export const SPEED_LEGEND_BANDS: ColorBand[] = [
  { color: "#3b82f6", label: "0–9 km/h (Crawl / Stopped)", shortLabel: "0–9" },
  { color: "#06b6d4", label: "10–34 km/h (Slow urban)", shortLabel: "10–34" },
  { color: "#22c55e", label: "35–59 km/h (Cruising)", shortLabel: "35–59" },
  { color: "#eab308", label: "60–79 km/h (Brisk)", shortLabel: "60–79" },
  { color: "#f97316", label: "80–99 km/h (Fast)", shortLabel: "80–99" },
  { color: "#dc2626", label: "100+ km/h (High speed)", shortLabel: "100+" },
];

export const RSRP_LEGEND_BANDS: ColorBand[] = [
  { color: "#16a34a", label: "Excellent (≥ -85 dBm)", shortLabel: "≥ -85" },
  { color: "#84cc16", label: "Good (-85 to -95 dBm)", shortLabel: "-85..-95" },
  {
    color: "#eab308",
    label: "Fair (-95 to -105 dBm)",
    shortLabel: "-95..-105",
  },
  {
    color: "#f97316",
    label: "Weak (-105 to -115 dBm)",
    shortLabel: "-105..-115",
  },
  { color: "#dc2626", label: "Very weak (< -115 dBm)", shortLabel: "< -115" },
];

export function finiteNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function speedColor(speedKmh: unknown): ColorBand {
  const speed = finiteNumber(speedKmh);
  if (speed === null) {
    return { color: "#64748b", label: "Unknown speed", shortLabel: "?" };
  }
  if (speed >= 100) return SPEED_LEGEND_BANDS[5];
  if (speed >= 80) return SPEED_LEGEND_BANDS[4];
  if (speed >= 60) return SPEED_LEGEND_BANDS[3];
  if (speed >= 35) return SPEED_LEGEND_BANDS[2];
  if (speed >= 10) return SPEED_LEGEND_BANDS[1];
  return SPEED_LEGEND_BANDS[0];
}

export function rsrpColor(rsrpDbm: unknown): ColorBand {
  const rsrp = finiteNumber(rsrpDbm);
  if (rsrp === null) {
    return { color: "#64748b", label: "Unknown signal", shortLabel: "?" };
  }
  if (rsrp >= -85) return RSRP_LEGEND_BANDS[0];
  if (rsrp >= -95) return RSRP_LEGEND_BANDS[1];
  if (rsrp >= -105) return RSRP_LEGEND_BANDS[2];
  if (rsrp >= -115) return RSRP_LEGEND_BANDS[3];
  return RSRP_LEGEND_BANDS[4];
}

export function rowPointKey(row: Row): string {
  return (
    text(row.id) ||
    `${text(row.occurred_at)}:${text(row.latitude)}:${text(row.longitude)}`
  );
}

export interface SafetySummary {
  harshBraking: boolean;
  rapidAcceleration: boolean;
  sharpCornering: boolean;
  hasDangerEvent: boolean;
  sources: string[];
  accelerationMs2: number | null;
  thresholdMs2: number | null;
  serverEvents: Row[];
}

export function getSafetySummary(row: Row): SafetySummary {
  const behaviour = object(row.behaviour_data);
  const imuAccel = object(behaviour.acceleration);
  const imuThreshold = object(behaviour.threshold);
  const serverEvents = Array.isArray(row.safety_events)
    ? row.safety_events
        .map((e) => object(e))
        .filter((e) => Object.keys(e).length > 0)
    : [];

  const imuBraking = behaviour.harsh_braking === true;
  const imuAccelFlag = behaviour.rapid_acceleration === true;
  const imuCornering = behaviour.sharp_cornering === true;

  const directBraking = row.kind === "harsh_braking";
  const directAccel =
    row.kind === "rapid_acceleration" || row.kind === "harsh_acceleration";
  const directCornering = row.kind === "sharp_cornering";

  const srvBraking =
    directBraking || serverEvents.some((e) => e.kind === "harsh_braking");
  const srvAccel =
    directAccel ||
    serverEvents.some(
      (e) => e.kind === "rapid_acceleration" || e.kind === "harsh_acceleration",
    );
  const srvCornering =
    directCornering || serverEvents.some((e) => e.kind === "sharp_cornering");

  const harshBraking = row.harsh_braking === true || imuBraking || srvBraking;
  const rapidAcceleration =
    row.rapid_acceleration === true || imuAccelFlag || srvAccel;
  const sharpCornering =
    row.sharp_cornering === true || imuCornering || srvCornering;

  const sources: string[] = [];
  if (imuBraking || imuAccelFlag) sources.push("IMU (5 Hz)");
  if (srvBraking || srvAccel) sources.push("Server speed Δ");

  const firstDangerServer =
    (directBraking || directAccel ? row : null) ??
    serverEvents.find(
      (e) =>
        e.kind === "harsh_braking" ||
        e.kind === "rapid_acceleration" ||
        e.kind === "harsh_acceleration",
    );
  const serverAccelMs2 = finiteNumber(
    firstDangerServer?.acceleration_ms2 ??
      firstDangerServer?.max_acceleration_g,
  );
  const imuAccelY = finiteNumber(imuAccel.y_mps2);
  const accelerationMs2 = serverAccelMs2 ?? imuAccelY;

  const serverThresh = finiteNumber(firstDangerServer?.threshold_ms2);
  const imuThresh = harshBraking
    ? finiteNumber(imuThreshold.harsh_braking)
    : rapidAcceleration
      ? finiteNumber(imuThreshold.rapid_acceleration)
      : null;

  return {
    harshBraking,
    rapidAcceleration,
    sharpCornering,
    hasDangerEvent: harshBraking || rapidAcceleration,
    sources,
    accelerationMs2,
    thresholdMs2: serverThresh ?? imuThresh,
    serverEvents:
      (directBraking || directAccel || directCornering) && !serverEvents.length
        ? [row]
        : serverEvents,
  };
}

export function formatSafetyLabel(summary: SafetySummary): string {
  const parts: string[] = [];
  if (summary.harshBraking) parts.push("Harsh braking");
  if (summary.rapidAcceleration) parts.push("Harsh acceleration");
  if (!parts.length && summary.sharpCornering) parts.push("Sharp cornering");
  return parts.join(" & ");
}

function mergeSampleFields(base: Row, extra?: Row): Row {
  if (!extra) return base;
  const vehicleData = {
    ...object(base.vehicle_data),
    ...object(extra.vehicle_data),
  };
  const behaviourData = {
    ...object(base.behaviour_data),
    ...object(extra.behaviour_data),
  };
  const networkData = {
    ...object(base.network_data),
    ...object(extra.network_data),
  };
  const healthData = {
    ...object(base.health_data),
    ...object(extra.health_data),
  };
  const quality = { ...object(base.quality), ...object(extra.quality) };
  return {
    ...extra,
    ...base,
    speed_kmh: base.speed_kmh ?? extra.speed_kmh,
    engine_rpm: base.engine_rpm ?? extra.engine_rpm,
    latitude: base.latitude ?? extra.latitude,
    longitude: base.longitude ?? extra.longitude,
    ...(Object.keys(vehicleData).length ? { vehicle_data: vehicleData } : {}),
    ...(Object.keys(behaviourData).length
      ? { behaviour_data: behaviourData }
      : {}),
    ...(Object.keys(networkData).length ? { network_data: networkData } : {}),
    ...(Object.keys(healthData).length ? { health_data: healthData } : {}),
    ...(Object.keys(quality).length ? { quality } : {}),
  };
}

export function enrichRowsWithTelemetryAndSafety(
  baseRows: Row[],
  telemetrySamples: Row[] = [],
  safetyEvents: Row[] = [],
): Row[] {
  const sampleById = new Map<string, Row>();
  const sampleByTimeSec = new Map<number, Row>();
  for (const s of telemetrySamples) {
    const sid = text(s.id);
    if (sid) sampleById.set(sid, s);
    const ts = Date.parse(text(s.occurred_at));
    if (Number.isFinite(ts)) {
      sampleByTimeSec.set(Math.floor(ts / 1000), s);
    }
  }

  const activeEvents = safetyEvents.filter(
    (e) => e.state !== "superseded" && e.state !== "excluded",
  );
  const eventsByEndSampleId = new Map<string, Row[]>();
  const unmatchedEvents: Row[] = [];
  for (const ev of activeEvents) {
    const endId = text(ev.end_sample_id);
    if (endId) {
      const list = eventsByEndSampleId.get(endId) ?? [];
      list.push(ev);
      eventsByEndSampleId.set(endId, list);
    } else {
      unmatchedEvents.push(ev);
    }
  }

  const mergedRows = baseRows.map((row) => {
    const rid = text(row.id);
    const rts = Date.parse(text(row.occurred_at));
    const matchedSample =
      (rid ? sampleById.get(rid) : undefined) ??
      (Number.isFinite(rts)
        ? sampleByTimeSec.get(Math.floor(rts / 1000))
        : undefined);
    const combined = mergeSampleFields(row, matchedSample);
    const attached = rid ? [...(eventsByEndSampleId.get(rid) ?? [])] : [];
    return { row: combined, attached, rts };
  });

  // Match any server safety event whose end_sample_id was outside baseRows by nearest timestamp within 2 seconds.
  const leftoverEvents: Row[] = [...unmatchedEvents];
  const matchedIds = new Set(
    mergedRows.map((m) => text(m.row.id)).filter(Boolean),
  );
  for (const [endId, evList] of eventsByEndSampleId.entries()) {
    if (!matchedIds.has(endId)) {
      leftoverEvents.push(...evList);
    }
  }

  const extraRows: Array<{ row: Row; attached: Row[]; rts: number }> = [];
  for (const ev of leftoverEvents) {
    const evTs = Date.parse(text(ev.occurred_at));
    let bestIdx = -1;
    let bestDelta = 2001;
    if (Number.isFinite(evTs)) {
      for (let i = 0; i < mergedRows.length; i++) {
        const cand = mergedRows[i];
        if (!Number.isFinite(cand.rts)) continue;
        if (
          ev.vehicle_id &&
          cand.row.vehicle_id &&
          text(ev.vehicle_id) !== text(cand.row.vehicle_id)
        ) {
          continue;
        }
        const delta = Math.abs(cand.rts - evTs);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIdx = i;
        }
      }
    }
    if (bestIdx >= 0) {
      mergedRows[bestIdx].attached.push(ev);
    } else {
      const lat = finiteNumber(
        ev.latitude ?? ev.end_latitude ?? ev.start_latitude,
      );
      const lon = finiteNumber(
        ev.longitude ?? ev.end_longitude ?? ev.start_longitude,
      );
      if (
        lat !== null &&
        lon !== null &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180
      ) {
        extraRows.push({
          row: {
            ...ev,
            id: ev.id,
            occurred_at: ev.occurred_at,
            latitude: lat,
            longitude: lon,
            speed_kmh: ev.end_speed_kmh ?? ev.start_speed_kmh ?? null,
            safety_events: [ev],
          },
          attached: [ev],
          rts: Number.isFinite(evTs) ? evTs : 0,
        });
      }
    }
  }

  const allRows = extraRows.length
    ? [...mergedRows, ...extraRows].sort((a, b) => (a.rts || 0) - (b.rts || 0))
    : mergedRows;

  return allRows.map(({ row, attached }) => {
    const withEvents: Row = attached.length
      ? { ...row, safety_events: attached }
      : row;
    const summary = getSafetySummary(withEvents);
    return {
      ...withEvents,
      harsh_braking: summary.harshBraking,
      rapid_acceleration: summary.rapidAcceleration,
      sharp_cornering: summary.sharpCornering,
      driving_events: formatSafetyLabel(summary) || "normal",
    };
  });
}

export function matchSafetyEventsForJourney(
  journey: Row,
  safetyEvents: Row[],
): Row[] {
  const startMs = Date.parse(text(journey.started_at));
  if (!Number.isFinite(startMs)) return [];
  const rawEnd = text(journey.ended_at || journey.last_observed_at);
  const endMs = Number.isFinite(Date.parse(rawEnd))
    ? Date.parse(rawEnd) + 1500
    : Date.now() + 1500;
  const vehicleId = text(journey.vehicle_id);
  return safetyEvents.filter((ev) => {
    if (ev.state === "superseded" || ev.state === "excluded") return false;
    if (vehicleId && text(ev.vehicle_id) && text(ev.vehicle_id) !== vehicleId) {
      return false;
    }
    const ts = Date.parse(text(ev.occurred_at));
    return Number.isFinite(ts) && ts >= startMs - 1000 && ts <= endMs;
  });
}

export async function fetchPagedList(
  path: string,
  query: Query = {},
  signal?: AbortSignal,
  maxPages = 50,
): Promise<{ items: Row[]; timestamp: string; truncated: boolean }> {
  const items: Row[] = [];
  let nextCursor: string | undefined;
  let timestamp = "";
  let truncated = false;
  for (let page = 0; page < maxPages; page++) {
    const res = await api<ListData>(path, {
      query: { ...query, cursor: nextCursor },
      signal,
    });
    items.push(
      ...directoryRows(res.data.items, res.request_id, {
        path,
        httpStatus: res.status,
      }),
    );
    timestamp = res.timestamp;
    const cursorToken = res.data.pagination?.next_cursor || undefined;
    if (!cursorToken || cursorToken === nextCursor) break;
    nextCursor = cursorToken;
    if (page === maxPages - 1) truncated = true;
  }
  return { items, timestamp, truncated };
}

export async function fetchTelemetryRange(
  organizationId: string,
  vehicleId: string,
  fromIso: string,
  toIso: string,
  {
    endpoint = "telemetry",
    signal,
    maxChunks = 5,
  }: {
    endpoint?: "telemetry" | "positions";
    signal?: AbortSignal;
    maxChunks?: number;
  } = {},
): Promise<{ items: Row[]; timestamp: string; truncated: boolean }> {
  const startMs = Date.parse(fromIso);
  const rawEndMs = Date.parse(toIso);
  if (!Number.isFinite(startMs)) {
    return { items: [], timestamp: "", truncated: false };
  }
  // Telemetry endpoints enforce to > from and a max 86400s window per request.
  const endMs = Number.isFinite(rawEndMs)
    ? Math.max(startMs + 2000, rawEndMs)
    : Math.max(startMs + 2000, Date.now() + 1000);

  const maxChunkMs = 23.5 * 3600 * 1000;
  const deduped = new Map<string, Row>();
  let timestamp = "";
  let truncated = false;
  let chunkStart = startMs;

  for (let chunk = 0; chunk < maxChunks && chunkStart < endMs; chunk++) {
    const chunkEnd = Math.min(endMs, chunkStart + maxChunkMs);
    const res = await fetchPagedList(
      orgPath(organizationId, `/vehicles/${segment(vehicleId)}/${endpoint}`),
      {
        from: new Date(chunkStart).toISOString(),
        to: new Date(chunkEnd).toISOString(),
        per_page: 200,
      },
      signal,
      50,
    );
    timestamp = res.timestamp || timestamp;
    if (res.truncated) truncated = true;
    for (const row of res.items) {
      deduped.set(rowPointKey(row), row);
    }
    chunkStart = chunkEnd;
  }
  if (chunkStart < endMs) truncated = true;

  const items = [...deduped.values()].sort(
    (a, b) => Date.parse(text(a.occurred_at)) - Date.parse(text(b.occurred_at)),
  );
  return { items, timestamp, truncated };
}
