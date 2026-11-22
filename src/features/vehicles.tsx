import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Row as GridRow,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { downloadBlob, orgPath, segment } from "../api/client";
import { object, text, type Row } from "../api/types";
import { CoordinateMap, coordinates } from "../components/CoordinateMap";
import {
  enrichRowsWithTelemetryAndSafety,
  fetchPagedList,
  fetchTelemetryRange,
  finiteNumber,
  getSafetySummary,
  rowPointKey,
} from "../lib/telemetrySafety";
import {
  dayjs,
  Details,
  Directory,
  ErrorNotice,
  PageTitle,
  Snapshot,
  Time,
  TimeWindow,
  useData,
  useTelemetryRefreshMs,
  Value,
  windowQuery,
} from "../components/shared";
import { Workflow, field, number, version } from "../components/workflow";
import { vehicleFields } from "./registry";
import { Diagnostics } from "./diagnostics";
import { Files } from "./files";
import { VehicleMaintenance } from "./maintenance";
import { Compliance } from "./compliance";
import { Journeys } from "./driving";
import { convertMileageInputsToMetres } from "../lib/mileageUnits";

interface MetricMeta {
  label: string;
  unit: string;
  color: string;
}

const OBD_METRICS: Record<string, MetricMeta> = {
  speed_kmh: { label: "Vehicle Speed", unit: "km/h", color: "#1677ff" },
  engine_rpm: { label: "Engine Speed", unit: "rpm", color: "#722ed1" },
  ecu_voltage_v: {
    label: "ECU / Control Module Voltage",
    unit: "V",
    color: "#13c2c2",
  },
  throttle_pct: { label: "Throttle Position", unit: "%", color: "#fa8c16" },
  engine_load_pct: { label: "Engine Load", unit: "%", color: "#eb2f96" },
  coolant_temp_c: {
    label: "Coolant Temperature",
    unit: "°C",
    color: "#f5222d",
  },
  intake_temp_c: {
    label: "Intake Air Temperature",
    unit: "°C",
    color: "#faad14",
  },
  maf_gps: { label: "Mass Air Flow (MAF)", unit: "g/s", color: "#2f54eb" },
  fuel_rate_lph: { label: "Fuel Rate", unit: "L/h", color: "#52c41a" },
  fuel_level_pct: { label: "Fuel Tank Level", unit: "%", color: "#389e0d" },
  instantL100km: {
    label: "Instant Fuel Consumption",
    unit: "L/100km",
    color: "#08979c",
  },
  accel_y_mps2: {
    label: "IMU Longitudinal Accel (Y)",
    unit: "m/s²",
    color: "#d4380d",
  },
  accel_x_mps2: {
    label: "IMU Lateral Accel (X)",
    unit: "m/s²",
    color: "#531dab",
  },
};

const OBD_METRIC_KEYS = Object.keys(OBD_METRICS);

const LIVE_SUMMARY_METRICS: Array<{
  key: string;
  label: string;
  unit: string;
}> = [
  { key: "speed_kmh", label: "Vehicle Speed", unit: "km/h" },
  { key: "engine_rpm", label: "Engine Speed", unit: "rpm" },
  { key: "ecu_voltage_v", label: "ECU Voltage", unit: "V" },
  { key: "throttle_pct", label: "Throttle Position", unit: "%" },
  { key: "engine_load_pct", label: "Engine Load", unit: "%" },
  { key: "coolant_temp_c", label: "Coolant Temp", unit: "°C" },
  { key: "intake_temp_c", label: "Intake Air Temp", unit: "°C" },
  { key: "maf_gps", label: "Mass Air Flow", unit: "g/s" },
  { key: "fuel_rate_lph", label: "Fuel Rate", unit: "L/h" },
  { key: "fuel_level_pct", label: "Fuel Level", unit: "%" },
  { key: "engine_runtime_s", label: "Engine Runtime", unit: "s" },
];

const TELEMETRY_TABLE_OBD_FIELDS = [
  "speed_kmh",
  "engine_rpm",
  "ecu_voltage_v",
  "throttle_pct",
  "engine_load_pct",
  "coolant_temp_c",
  "fuel_rate_lph",
];

const LOCATION_CSV_COLUMNS = [
  "id",
  "occurred_at",
  "position_observed_at",
  "latitude",
  "longitude",
  "speed_kmh",
  "engine_rpm",
  "harsh_braking",
  "harsh_acceleration",
  "acceleration_ms2",
  "detection_source",
] as const;

function toFiniteNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Extract a numeric OBD or IMU metric from top-level or nested telemetry fields. */
export function extractObdMetric(row: Row, key: string): number | null {
  const vd = object(row.vehicle_data);
  const calc = object(vd.calculated_fuel_consumption);
  const accel = object(object(row.behaviour_data).acceleration);
  const candidates: unknown[] = [
    row[key],
    vd[key],
    calc[key],
    key === "accel_x_mps2"
      ? accel.x_mps2
      : key === "accel_y_mps2"
        ? accel.y_mps2
        : key === "accel_z_mps2"
          ? accel.z_mps2
          : undefined,
  ];
  for (const candidate of candidates) {
    const value = toFiniteNumber(candidate);
    if (value !== null) return value;
  }
  return null;
}

export function chartSegments(
  items: Row[],
  metric: string,
  maxGapMs = 15000,
): Row[][] {
  const segments: Row[][] = [];
  let current: Row[] = [],
    previous: Row | null = null;
  for (const item of items) {
    const valid = extractObdMetric(item, metric) !== null;
    const gap = previous
      ? Date.parse(text(item.occurred_at)) -
        Date.parse(text(previous.occurred_at))
      : 0;
    if (!valid || gap > maxGapMs || gap < 0) {
      if (current.length) segments.push(current);
      current = [];
    }
    if (valid) current.push(item);
    previous = item;
  }
  if (current.length) segments.push(current);
  return segments;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let raw = text(value);
  // Neutralize spreadsheet formula triggers while preserving negative numbers like coordinates.
  if (!/^-?\d+(?:\.\d+)?$/.test(raw) && /^[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function buildLocationsCsv(rows: Row[]): string {
  const header = LOCATION_CSV_COLUMNS.join(",");
  const lines = rows.map((row) => {
    const summary = getSafetySummary(row);
    const enrichedRow: Row = {
      ...row,
      harsh_braking: summary.harshBraking,
      harsh_acceleration: summary.rapidAcceleration,
      acceleration_ms2:
        summary.accelerationMs2 !== null
          ? Number(summary.accelerationMs2.toFixed(3))
          : "",
      detection_source: summary.sources.join(" + "),
    };
    return LOCATION_CSV_COLUMNS.map((col) => csvCell(enrichedRow[col])).join(
      ",",
    );
  });
  return [header, ...lines].join("\r\n");
}

function mergeSample(row: Row, enriched?: Row): Row {
  if (!enriched) return row;
  const mergedVehicle = {
    ...object(enriched.vehicle_data),
    ...object(row.vehicle_data),
  };
  const mergedBehaviour = {
    ...object(enriched.behaviour_data),
    ...object(row.behaviour_data),
  };
  const mergedHealth = {
    ...object(enriched.health_data),
    ...object(row.health_data),
  };
  return {
    ...enriched,
    ...row,
    ...(Object.keys(mergedVehicle).length
      ? { vehicle_data: mergedVehicle }
      : {}),
    ...(Object.keys(mergedBehaviour).length
      ? { behaviour_data: mergedBehaviour }
      : {}),
    ...(Object.keys(mergedHealth).length ? { health_data: mergedHealth } : {}),
  };
}

function useLiveSlidingRange(poll?: number) {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().subtract(1, "hour"),
    dayjs(),
  ]);
  useEffect(() => {
    if (!poll || poll <= 0) return;
    const timer = window.setInterval(() => {
      setRange((prev) => {
        const now = dayjs();
        if (Math.abs(now.diff(prev[1], "second")) > 180) return prev;
        const durationSec = Math.max(60, prev[1].diff(prev[0], "second"));
        return [now.subtract(durationSec, "second"), now];
      });
    }, poll);
    return () => window.clearInterval(timer);
  }, [poll]);
  return [range, setRange] as const;
}

function formatMetricNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function ObdMetricChart({
  items,
  metricKey,
  maxGapMs,
}: {
  items: Row[];
  metricKey: string;
  maxGapMs: number;
}) {
  const app = useApp();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const meta = OBD_METRICS[metricKey] ?? {
    label: metricKey,
    unit: "",
    color: "#1677ff",
  };
  const localizedLabel = app.t(meta.label);
  const tz = app.session?.user.timezone || "Asia/Kuala_Lumpur";

  const chartData = useMemo(() => {
    const numeric = items.filter(
      (i) => extractObdMetric(i, metricKey) !== null,
    );
    if (!numeric.length) return null;
    const values = numeric.map((i) => extractObdMetric(i, metricKey)!);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
    const minVal = rawMin < 0 ? rawMin : 0;
    const maxVal = rawMax > minVal ? rawMax : minVal + 1;
    const times = numeric.map((i) => Date.parse(text(i.occurred_at)));
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const xFor = (t: number) =>
      minTime === maxTime
        ? 510
        : 46 + ((t - minTime) / Math.max(1, maxTime - minTime)) * 930;
    const yFor = (v: number) =>
      200 - ((v - minVal) / Math.max(1e-6, maxVal - minVal)) * 170;
    const points = numeric.map((row, idx) => {
      const value = values[idx];
      const timeMs = times[idx];
      return {
        row,
        value,
        timeMs,
        occurredAt: text(row.occurred_at),
        speedKmh: extractObdMetric(row, "speed_kmh"),
        x: xFor(timeMs),
        y: yFor(value),
      };
    });
    const segments = chartSegments(items, metricKey, maxGapMs);
    return {
      numeric,
      values,
      rawMax,
      avgValue,
      minVal,
      maxVal,
      minTime,
      maxTime,
      xFor,
      yFor,
      points,
      segments,
      latestValue: values[values.length - 1],
    };
  }, [items, metricKey, maxGapMs]);

  if (!chartData) return null;

  const {
    numeric,
    rawMax,
    avgValue,
    minVal,
    maxVal,
    minTime,
    maxTime,
    xFor,
    yFor,
    points,
    segments,
    latestValue,
  } = chartData;

  const plot = (i: Row) =>
    `${xFor(Date.parse(text(i.occurred_at)))},${yFor(extractObdMetric(i, metricKey)!)}`;
  const unitSuffix = meta.unit ? ` ${meta.unit}` : "";

  const activePoint =
    hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < points.length
      ? points[hoveredIdx]
      : null;

  const handlePointerAtClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || !points.length) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = ((clientX - rect.left) / rect.width) * 1000;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i += 1) {
      const dist = Math.abs(points[i].x - svgX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    setHoveredIdx(bestIdx);
  };

  const tooltipLeftPct = activePoint ? (activePoint.x / 1000) * 100 : 0;
  const tooltipTopPct = activePoint ? (activePoint.y / 230) * 100 : 0;
  const flipTooltipLeft = activePoint ? activePoint.x > 640 : false;
  const avgY = yFor(avgValue);

  return (
    <Card
      size="small"
      className="telemetry-chart-card"
      title={
        <Tooltip title={`${app.t("Original field")}: ${metricKey}`}>
          <span>{`${localizedLabel}${meta.unit ? ` (${meta.unit})` : ""}`}</span>
        </Tooltip>
      }
      extra={
        <Space size={4} wrap>
          <Tag color="blue">
            {app.t("Latest:")} {formatMetricNumber(latestValue)}
            {unitSuffix}
          </Tag>
          <Tag color="volcano">
            {app.t("Max:")} {formatMetricNumber(rawMax)}
            {unitSuffix}
          </Tag>
          <Tag color="cyan">
            {app.t("Avg:")} {formatMetricNumber(avgValue)}
            {unitSuffix}
          </Tag>
          <Tag>
            {numeric.length} {app.t("pts")}
          </Tag>
        </Space>
      }
    >
      <div className="telemetry-chart-wrap">
        <svg
          ref={svgRef}
          className="telemetry-chart"
          viewBox="0 0 1000 230"
          role="img"
          aria-label={app
            .t(
              "{metric} versus observation time, {count} observed samples; gaps are not connected",
            )
            .replace("{metric}", localizedLabel)
            .replace("{count}", String(numeric.length))}
          onMouseMove={(e) => handlePointerAtClientX(e.clientX)}
          onMouseLeave={() => setHoveredIdx(null)}
          onTouchStart={(e) => {
            if (e.touches[0]) handlePointerAtClientX(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerAtClientX(e.touches[0].clientX);
          }}
        >
          <line x1="46" y1="200" x2="980" y2="200" stroke="#d9dfe8" />
          <line
            x1="46"
            y1={avgY}
            x2="980"
            y2={avgY}
            stroke="#94a3b8"
            strokeOpacity="0.45"
            strokeDasharray="4 4"
          />
          {minVal < 0 && maxVal > 0 && (
            <line
              x1="46"
              y1={yFor(0)}
              x2="980"
              y2={yFor(0)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          )}
          <text x="0" y="28">
            {formatMetricNumber(maxVal)}
          </text>
          <text x="5" y="202">
            {formatMetricNumber(minVal)}
          </text>
          {Number.isFinite(minTime) && (
            <text x="46" y="222" fill="#8c99ad">
              {dayjs(minTime).tz(tz).format("HH:mm:ss")}
            </text>
          )}
          {Number.isFinite(maxTime) && maxTime !== minTime && (
            <text x="980" y="222" textAnchor="end" fill="#8c99ad">
              {dayjs(maxTime).tz(tz).format("HH:mm:ss")}
            </text>
          )}
          {segments.map((s, idx) =>
            s.length === 1 ? (
              <circle
                key={idx}
                cx={xFor(Date.parse(text(s[0].occurred_at)))}
                cy={yFor(extractObdMetric(s[0], metricKey)!)}
                r="3.5"
                fill={meta.color}
              />
            ) : (
              <polyline
                key={idx}
                points={s.map(plot).join(" ")}
                fill="none"
                stroke={meta.color}
                strokeWidth="2"
              />
            ),
          )}
          {points.map((pt, idx) => (
            <circle
              key={`${pt.occurredAt}-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="9"
              fill="transparent"
              className="telemetry-chart-hit"
              onMouseEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              tabIndex={0}
              aria-label={`${localizedLabel}: ${formatMetricNumber(pt.value)}${unitSuffix}`}
            />
          ))}
          {activePoint && (
            <g className="telemetry-chart-crosshair" pointerEvents="none">
              <line
                x1={activePoint.x}
                y1="20"
                x2={activePoint.x}
                y2="200"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <line
                x1="46"
                y1={activePoint.y}
                x2="980"
                y2={activePoint.y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7.5"
                fill={meta.color}
                fillOpacity="0.2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4"
                fill={meta.color}
                stroke="#ffffff"
                strokeWidth="1.8"
              />
            </g>
          )}
        </svg>
        {activePoint && (
          <div
            className={`telemetry-chart-tooltip${flipTooltipLeft ? " is-left" : ""}`}
            role="status"
            style={{
              left: `${Math.min(96, Math.max(4, tooltipLeftPct))}%`,
              top: `${Math.min(78, Math.max(20, tooltipTopPct))}%`,
            }}
          >
            <div className="telemetry-chart-tooltip-val">
              <span
                className="telemetry-chart-tooltip-dot"
                style={{ backgroundColor: meta.color }}
              />
              <strong>
                {formatMetricNumber(activePoint.value)}
                {unitSuffix}
              </strong>
            </div>
            {metricKey !== "speed_kmh" && activePoint.speedKmh !== null && (
              <div className="telemetry-chart-tooltip-sub">
                {app.t("Vehicle Speed")}:{" "}
                {formatMetricNumber(activePoint.speedKmh)} km/h
              </div>
            )}
            <div className="telemetry-chart-tooltip-time">
              {dayjs(activePoint.occurredAt).isValid()
                ? dayjs(activePoint.occurredAt)
                    .tz(tz)
                    .format("DD MMM YYYY, HH:mm:ss")
                : activePoint.occurredAt}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Telemetry({
  vehicleId,
  positions = false,
  coverage = false,
  poll,
  latestSample,
  plate,
}: {
  vehicleId: string;
  positions?: boolean;
  coverage?: boolean;
  poll?: number;
  latestSample?: Row;
  plate?: string;
}) {
  const app = useApp(),
    [range, setRange] = useLiveSlidingRange(poll),
    [items, setItems] = useState<Row[]>([]),
    [metric, setMetric] = useState("all"),
    [focusPointKey, setFocusPointKey] = useState<string | null>(null),
    [focusNonce, setFocusNonce] = useState(0);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const sessionSamplesRef = useRef<Map<string, Row>>(new Map());
  useEffect(() => {
    sessionSamplesRef.current.clear();
  }, [vehicleId]);
  useEffect(() => {
    if (positions || coverage || !latestSample) return;
    const occurredAt = text(latestSample.occurred_at);
    if (!occurredAt || !Number.isFinite(Date.parse(occurredAt))) return;
    sessionSamplesRef.current.set(
      text(latestSample.id || occurredAt),
      latestSample,
    );
  }, [latestSample, positions, coverage]);

  const positionWindow = windowQuery(range);
  const telemetryBehaviorQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "position-behaviour",
      vehicleId,
      positionWindow,
    ],
    enabled: positions && app.can("telemetry.read"),
    queryFn: ({ signal }) =>
      fetchTelemetryRange(
        app.organizationId,
        vehicleId,
        positionWindow.from as string,
        positionWindow.to as string,
        { endpoint: "telemetry", signal, maxChunks: 2 },
      ),
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : poll || false),
    refetchIntervalInBackground: false,
  });

  const safetyEventsQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "vehicle-safety-events",
      vehicleId,
    ],
    enabled: positions && app.can("safety.read") && app.feature("safety"),
    queryFn: ({ signal }) =>
      fetchPagedList(
        orgPath(app.organizationId, "/safety-events"),
        { vehicle_id: vehicleId, per_page: 100 },
        signal,
        10,
      ),
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : poll || false),
    refetchIntervalInBackground: false,
  });

  const settingsQ = useData(
    orgPath(app.organizationId, "/settings"),
    {},
    !positions && !coverage && app.can("settings.read"),
  );
  const orgInterval = Number(
    object(settingsQ.data?.data.settings).telemetry_interval_seconds,
  );
  const planMinInterval = Number(
    app.subscription?.subscription?.plan_snapshot?.telemetry_min_seconds,
  );
  const configuredSeconds =
    Number.isFinite(orgInterval) && orgInterval > 0
      ? orgInterval
      : Number.isFinite(planMinInterval) && planMinInterval > 0
        ? planMinInterval
        : 5;
  const maxGapSeconds = Math.max(15, configuredSeconds + 5);
  const maxGapMs = maxGapSeconds * 1000;
  const onData = useCallback((rows: Row[]) => setItems(rows), []);

  const mergedItems = useMemo(() => {
    if (positions || coverage) return items;
    const pool = new Map<string, Row>(sessionSamplesRef.current);
    if (latestSample) {
      const occurredAt = text(latestSample.occurred_at);
      if (occurredAt && Number.isFinite(Date.parse(occurredAt))) {
        pool.set(text(latestSample.id || occurredAt), latestSample);
      }
    }
    const byId = new Map<string, Row>();
    const byOccurredAt = new Map<string, Row>();
    for (const sample of pool.values()) {
      const sid = text(sample.id);
      const socc = text(sample.occurred_at);
      if (sid) byId.set(sid, sample);
      if (socc) byOccurredAt.set(socc, sample);
    }
    const matchedKeys = new Set<string>();
    const merged = items.map((row) => {
      const rid = text(row.id);
      const rocc = text(row.occurred_at);
      const enriched =
        (rid ? byId.get(rid) : undefined) ??
        (rocc ? byOccurredAt.get(rocc) : undefined);
      if (enriched) {
        matchedKeys.add(text(enriched.id || enriched.occurred_at));
      }
      return mergeSample(row, enriched);
    });
    const fromMs = range[0].valueOf();
    const toMs = range[1].valueOf();
    for (const [key, sample] of pool.entries()) {
      if (matchedKeys.has(key)) continue;
      const ts = Date.parse(text(sample.occurred_at));
      if (!Number.isFinite(ts) || ts < fromMs || ts > toMs) continue;
      merged.push(sample);
    }
    merged.sort(
      (a, b) =>
        Date.parse(text(a.occurred_at)) - Date.parse(text(b.occurred_at)),
    );
    return merged;
  }, [items, latestSample, range, positions, coverage]);

  const enrichedPositionItems = useMemo(() => {
    if (!positions) return items;
    return enrichRowsWithTelemetryAndSafety(
      items,
      telemetryBehaviorQ.data?.items ?? [],
      safetyEventsQ.data?.items ?? [],
    );
  }, [positions, items, telemetryBehaviorQ.data, safetyEventsQ.data]);

  const enrichedPositionMap = useMemo(() => {
    const map = new Map<string, Row>();
    for (const row of enrichedPositionItems) {
      map.set(rowPointKey(row), row);
    }
    return map;
  }, [enrichedPositionItems]);

  const positionStats = useMemo(() => {
    if (!positions) return null;
    const validCoords = coordinates(enrichedPositionItems);
    const speeds = enrichedPositionItems
      .map((r) => finiteNumber(r.speed_kmh))
      .filter((v): v is number => v !== null);
    const dangerEvents = enrichedPositionItems.filter(
      (r) => getSafetySummary(r).hasDangerEvent,
    );
    const brakingCount = dangerEvents.filter(
      (r) => getSafetySummary(r).harshBraking,
    ).length;
    const accelCount = dangerEvents.filter(
      (r) => getSafetySummary(r).rapidAcceleration,
    ).length;
    const maxSpeed = speeds.length ? Math.max(...speeds) : null;
    const avgSpeed = speeds.length
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : null;
    return {
      gpsCount: validCoords.length,
      maxSpeed,
      avgSpeed,
      brakingCount,
      accelCount,
      dangerEvents,
    };
  }, [positions, enrichedPositionItems]);

  const locateOnMap = useCallback((row: Row) => {
    setFocusPointKey(rowPointKey(row));
    setFocusNonce((n) => n + 1);
    mapWrapRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const effectiveLatest = useMemo(() => {
    if (latestSample && text(latestSample.occurred_at)) return latestSample;
    return mergedItems.length ? mergedItems[mergedItems.length - 1] : undefined;
  }, [latestSample, mergedItems]);

  const liveMetrics = useMemo(() => {
    if (!effectiveLatest) return [];
    return LIVE_SUMMARY_METRICS.flatMap((entry) => {
      const value = extractObdMetric(effectiveLatest, entry.key);
      return value === null ? [] : [{ ...entry, value }];
    });
  }, [effectiveLatest]);

  const visibleChartKeys = useMemo(() => {
    if (metric !== "all") {
      return mergedItems.some((row) => extractObdMetric(row, metric) !== null)
        ? [metric]
        : [];
    }
    return OBD_METRIC_KEYS.filter((k) =>
      mergedItems.some((row) => extractObdMetric(row, k) !== null),
    );
  }, [metric, mergedItems]);

  const exportLocationsCsv = useCallback(() => {
    const label =
      (plate || vehicleId).trim().replace(/[/\\:*?"<>|]+/g, "-") || vehicleId;
    const csvString = buildLocationsCsv(enrichedPositionItems);
    downloadBlob(
      new Blob([csvString], { type: "text/csv;charset=utf-8" }),
      `vehicle-${label}-locations.csv`,
    );
  }, [enrichedPositionItems, plate, vehicleId]);

  const telemetryRender = useMemo(() => {
    return Object.fromEntries(
      TELEMETRY_TABLE_OBD_FIELDS.map((k) => [
        k,
        (v: unknown, row: Row) => {
          const resolved = v ?? object(row.vehicle_data)[k];
          return <Value field={k} value={resolved} compactCell />;
        },
      ]),
    );
  }, []);

  const positionRender = useMemo(
    () => ({
      driving_events: (_v: unknown, row: Row) => {
        const enriched = enrichedPositionMap.get(rowPointKey(row)) ?? row;
        const summary = getSafetySummary(enriched);
        if (!summary.hasDangerEvent && !summary.sharpCornering) {
          return <span className="muted">—</span>;
        }
        return (
          <Space size={[4, 4]} wrap>
            {summary.harshBraking && (
              <Tag color="error">
                {app.t("Harsh braking")}
                {summary.accelerationMs2 !== null
                  ? ` (${summary.accelerationMs2.toFixed(1)} m/s²)`
                  : ""}
              </Tag>
            )}
            {summary.rapidAcceleration && (
              <Tag color="warning">
                {app.t("Harsh acceleration")}
                {summary.accelerationMs2 !== null
                  ? ` (${summary.accelerationMs2.toFixed(1)} m/s²)`
                  : ""}
              </Tag>
            )}
            {summary.sharpCornering && <Tag>{app.t("Sharp cornering")}</Tag>}
          </Space>
        );
      },
    }),
    [enrichedPositionMap, app],
  );

  const latestVehicleData = object(effectiveLatest?.vehicle_data);

  return (
    <div className="stack">
      <TimeWindow value={range} onChange={setRange} />
      {positions && positionStats && (
        <Card title={app.t("Route Speed & Harsh Driving Summary")} size="small">
          <GridRow gutter={[16, 12]}>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("GPS points")}
                value={positionStats.gpsCount}
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic
                title={app.t("Max speed")}
                value={
                  positionStats.maxSpeed !== null
                    ? formatMetricNumber(positionStats.maxSpeed)
                    : "—"
                }
                suffix={positionStats.maxSpeed !== null ? "km/h" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic
                title={app.t("Average speed")}
                value={
                  positionStats.avgSpeed !== null
                    ? formatMetricNumber(positionStats.avgSpeed)
                    : "—"
                }
                suffix={positionStats.avgSpeed !== null ? "km/h" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic
                title={app.t("Harsh braking")}
                value={positionStats.brakingCount}
                styles={
                  positionStats.brakingCount > 0
                    ? { content: { color: "#cf1322" } }
                    : undefined
                }
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic
                title={app.t("Harsh acceleration")}
                value={positionStats.accelCount}
                styles={
                  positionStats.accelCount > 0
                    ? { content: { color: "#d46b08" } }
                    : undefined
                }
              />
            </Col>
          </GridRow>
          {positionStats.dangerEvents.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8 }}
              >
                {app.t("Harsh Braking & Acceleration Moments")}
              </Typography.Text>
              <Table<Row>
                size="small"
                rowKey={rowPointKey}
                dataSource={positionStats.dangerEvents}
                pagination={
                  positionStats.dangerEvents.length > 5
                    ? { pageSize: 5 }
                    : false
                }
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: app.t("Occurred at"),
                    dataIndex: "occurred_at",
                    key: "occurred_at",
                    render: (v: unknown) => <Time value={v} />,
                  },
                  {
                    title: app.t("Event"),
                    key: "event",
                    render: (_: unknown, row: Row) => {
                      const s = getSafetySummary(row);
                      return (
                        <Space size={4} wrap>
                          {s.harshBraking && (
                            <Tag color="error">{app.t("Harsh braking")}</Tag>
                          )}
                          {s.rapidAcceleration && (
                            <Tag color="warning">
                              {app.t("Harsh acceleration")}
                            </Tag>
                          )}
                        </Space>
                      );
                    },
                  },
                  {
                    title: app.t("Speed"),
                    dataIndex: "speed_kmh",
                    key: "speed_kmh",
                    render: (v: unknown) => {
                      const n = finiteNumber(v);
                      return n !== null ? `${formatMetricNumber(n)} km/h` : "—";
                    },
                  },
                  {
                    title: app.t("Accel (m/s²)"),
                    key: "accel",
                    render: (_: unknown, row: Row) => {
                      const s = getSafetySummary(row);
                      return s.accelerationMs2 !== null
                        ? `${s.accelerationMs2.toFixed(2)} m/s²`
                        : "—";
                    },
                  },
                  {
                    title: app.t("Detector"),
                    key: "source",
                    render: (_: unknown, row: Row) => {
                      const s = getSafetySummary(row);
                      return s.sources.join(" + ") || "—";
                    },
                  },
                  {
                    title: app.t("Location"),
                    key: "coords",
                    render: (_: unknown, row: Row) =>
                      coordinates([row]).length ? (
                        <span className="reference">
                          {Number(row.latitude).toFixed(5)},{" "}
                          {Number(row.longitude).toFixed(5)}
                        </span>
                      ) : (
                        <span className="muted">{app.t("No GPS fix")}</span>
                      ),
                  },
                  {
                    title: app.t("Map"),
                    key: "locate",
                    render: (_: unknown, row: Row) =>
                      coordinates([row]).length ? (
                        <Button size="small" onClick={() => locateOnMap(row)}>
                          {app.t("Locate danger")}
                        </Button>
                      ) : (
                        <span className="muted">—</span>
                      ),
                  },
                ]}
              />
            </div>
          )}
        </Card>
      )}
      {!positions && !coverage && (
        <Card
          title={app.t("Live OBD-II & Telemetry Metrics")}
          extra={
            effectiveLatest && (
              <Space size="small" wrap>
                {typeof latestVehicleData.obd_connected === "boolean" && (
                  <Tag
                    color={
                      latestVehicleData.obd_connected ? "success" : "default"
                    }
                  >
                    {app.t("OBD:")}{" "}
                    {latestVehicleData.obd_connected
                      ? app.t("Connected")
                      : app.t("Disconnected")}
                  </Tag>
                )}
                {typeof latestVehicleData.engine_running === "boolean" && (
                  <Tag
                    color={
                      latestVehicleData.engine_running
                        ? "processing"
                        : "default"
                    }
                  >
                    {app.t("Engine:")}{" "}
                    {latestVehicleData.engine_running
                      ? app.t("Running")
                      : app.t("Off")}
                  </Tag>
                )}
                <Time value={effectiveLatest.occurred_at} />
              </Space>
            )
          }
        >
          {liveMetrics.length ? (
            <GridRow gutter={[16, 16]}>
              {liveMetrics.map((m) => (
                <Col xs={12} sm={8} md={6} lg={4} key={m.key}>
                  <Statistic
                    title={
                      <Tooltip title={`${app.t("Original field")}: ${m.key}`}>
                        <span>{app.t(m.label)}</span>
                      </Tooltip>
                    }
                    value={formatMetricNumber(m.value)}
                    suffix={m.unit}
                  />
                </Col>
              ))}
            </GridRow>
          ) : (
            <Alert
              type="info"
              title={app.t("No live OBD-II & telemetry readings received yet.")}
            />
          )}
        </Card>
      )}
      {positions || coverage ? (
        <div ref={mapWrapRef}>
          <CoordinateMap
            items={positions ? enrichedPositionItems : items}
            coverage={coverage}
            mode={positions ? "route" : "coverage"}
            focusRowKey={positions ? focusPointKey : undefined}
            focusNonce={positions ? focusNonce : undefined}
          />
        </div>
      ) : (
        <Card
          title={app.t("Loaded observations")}
          extra={
            <Select
              value={metric}
              onChange={setMetric}
              style={{ minWidth: 260 }}
              options={[
                {
                  value: "all",
                  label: app.t("All valid OBD & telemetry charts"),
                },
                ...OBD_METRIC_KEYS.map((key) => ({
                  value: key,
                  label: `${app.t(OBD_METRICS[key].label)} · ${OBD_METRICS[key].unit}`,
                })),
              ]}
            />
          }
        >
          {visibleChartKeys.length ? (
            <GridRow gutter={[16, 16]}>
              {visibleChartKeys.map((key) => (
                <Col
                  xs={24}
                  lg={visibleChartKeys.length === 1 ? 24 : 12}
                  key={key}
                >
                  <ObdMetricChart
                    items={mergedItems}
                    metricKey={key}
                    maxGapMs={maxGapMs}
                  />
                </Col>
              ))}
            </GridRow>
          ) : (
            <Alert
              type="info"
              title={app.t("No usable metric samples in the loaded timeframe.")}
            />
          )}
          <p className="muted">
            {app
              .t(
                "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.",
              )
              .replace("{seconds}", String(maxGapSeconds))}
          </p>
        </Card>
      )}
      <Directory
        path={orgPath(
          app.organizationId,
          `/vehicles/${segment(vehicleId)}/${positions ? "positions" : coverage ? "coverage" : "telemetry"}`,
        )}
        query={{ ...windowQuery(range), per_page: 100 }}
        fetchAllPages
        poll={poll}
        toolbarExtra={
          positions ? (
            <Button
              onClick={exportLocationsCsv}
              disabled={!enrichedPositionItems.length}
            >
              {app.t("Export CSV")}
            </Button>
          ) : undefined
        }
        fields={
          positions
            ? [
                "occurred_at",
                "position_observed_at",
                "driving_events",
                "speed_kmh",
                "engine_rpm",
                "latitude",
                "longitude",
              ]
            : coverage
              ? [
                  "occurred_at",
                  "latitude",
                  "longitude",
                  "network_data",
                  "source_format",
                ]
              : [
                  "occurred_at",
                  "speed_kmh",
                  "engine_rpm",
                  "ecu_voltage_v",
                  "throttle_pct",
                  "engine_load_pct",
                  "coolant_temp_c",
                  "fuel_rate_lph",
                  "latitude",
                  "longitude",
                  "quality",
                  "source_format",
                ]
        }
        render={
          positions ? positionRender : !coverage ? telemetryRender : undefined
        }
        transformRows={
          positions
            ? (rows) =>
                rows.map((r) => enrichedPositionMap.get(rowPointKey(r)) ?? r)
            : undefined
        }
        action={
          positions
            ? (row) =>
                coordinates([row]).length ? (
                  <Button
                    size="small"
                    danger={
                      getSafetySummary(
                        enrichedPositionMap.get(rowPointKey(row)) ?? row,
                      ).hasDangerEvent
                    }
                    onClick={() =>
                      locateOnMap(
                        enrichedPositionMap.get(rowPointKey(row)) ?? row,
                      )
                    }
                  >
                    {app.t("Locate")}
                  </Button>
                ) : (
                  <span className="muted">{app.t("No fix")}</span>
                )
            : undefined
        }
        onData={onData}
      />
    </div>
  );
}
function Energy({ vehicleId, poll }: { vehicleId: string; poll?: number }) {
  const app = useApp(),
    [range, setRange] = useLiveSlidingRange(poll);
  return (
    <div className="stack">
      <TimeWindow value={range} onChange={setRange} />
      <Snapshot
        path={orgPath(
          app.organizationId,
          `/vehicles/${segment(vehicleId)}/energy`,
        )}
        query={windowQuery(range)}
        poll={poll}
      />
    </div>
  );
}
export function VehicleDetail({ id }: { id: string }) {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId, `/vehicles/${segment(id)}`);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { configuredSeconds, refreshSeconds, pollMs } =
    useTelemetryRefreshMs(autoRefresh);
  const record = useData(path, {}, true, pollMs),
    latest = useData(
      `${path}/latest-state`,
      {},
      app.can("telemetry.read"),
      pollMs,
    );
  const vehicle = object(record.data?.data.item),
    device = object(record.data?.data.device),
    activeShift = object(record.data?.data.active_shift),
    sample = object(latest.data?.data.sample);
  const currentDriverName = text(
    activeShift.driver_name || vehicle.current_driver_name,
  );
  const currentDriverId = text(
    activeShift.driver_id || vehicle.current_driver_id,
  );
  const [edit, setEdit] = useState(false),
    [baseline, setBaseline] = useState(false);
  const publicSample = Object.fromEntries(
    Object.entries(sample).filter(
      ([key]) =>
        !["network_data"].includes(key) ||
        (app.can("coverage.read") && app.feature("cellular")),
    ),
  );
  const items = [
    {
      key: "overview",
      label: app.t("Overview"),
      children: (
        <div className="stack">
          <Card
            title={app.t("Current driver session")}
            extra={
              currentDriverId ? (
                <Button
                  size="small"
                  onClick={() =>
                    navigate(
                      `/organization/${app.organizationId}/drivers/${currentDriverId}`,
                    )
                  }
                >
                  {app.t("Open driver")}
                </Button>
              ) : undefined
            }
          >
            {currentDriverName || currentDriverId ? (
              <Descriptions
                size="small"
                bordered
                column={{ xs: 1, sm: 1, md: 2 }}
                items={[
                  {
                    key: "driver",
                    label: app.t("Driver"),
                    children: currentDriverName || currentDriverId,
                  },
                  {
                    key: "started_at",
                    label: app.t("started_at"),
                    children: (
                      <Time
                        value={
                          activeShift.started_at ||
                          vehicle.current_shift_started_at
                        }
                      />
                    ),
                  },
                  {
                    key: "attribution_expires_at",
                    label: app.t("attribution_expires_at"),
                    children: (
                      <Time
                        value={
                          activeShift.attribution_expires_at ||
                          vehicle.current_shift_expires_at
                        }
                      />
                    ),
                  },
                  {
                    key: "last_authenticated_at",
                    label: app.t("Last authenticated"),
                    children: (
                      <Time value={activeShift.last_authenticated_at} />
                    ),
                  },
                ]}
              />
            ) : (
              <Typography.Text type="secondary">
                {app.t(
                  "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.",
                )}
              </Typography.Text>
            )}
          </Card>
          <Card title={app.t("Vehicle identity")}>
            <Details data={vehicle} />
          </Card>
          {app.can("devices.read") && (
            <Card title={app.t("Public device identity")}>
              <Details data={device} />
            </Card>
          )}
          {app.can("telemetry.read") && (
            <>
              <ErrorNotice
                error={latest.error}
                retry={() => void latest.refetch()}
              />
              <Card title={app.t("Latest observed sample")}>
                <Details
                  data={{
                    freshness: latest.data?.data.freshness,
                    ...publicSample,
                  }}
                />
              </Card>
              <Snapshot
                path={`${path}/diagnostics`}
                title={app.t("Reported fault presence")}
                poll={pollMs}
              />
            </>
          )}
        </div>
      ),
    },
    ...(app.can("telemetry.read")
      ? [
          {
            key: "telemetry",
            label: app.t("Telemetry"),
            children: (
              <Telemetry
                vehicleId={id}
                poll={pollMs}
                latestSample={sample}
                plate={text(vehicle.registration_number)}
              />
            ),
          },
          {
            key: "location",
            label: app.t("Location"),
            children: (
              <Telemetry
                vehicleId={id}
                positions
                poll={pollMs}
                latestSample={sample}
                plate={text(vehicle.registration_number)}
              />
            ),
          },
          {
            key: "diagnostics",
            label: app.t("Device & diagnostics"),
            children: (
              <Diagnostics vehicleId={id} sample={sample} device={device} />
            ),
          },
        ]
      : []),
    ...(app.can("mileage.read")
      ? [
          {
            key: "mileage",
            label: app.t("Mileage"),
            children: (
              <div className="stack">
                <Snapshot path={`${path}/mileage`} poll={pollMs} />
                {app.can("mileage.correct") && (
                  <Button onClick={() => setBaseline(true)}>
                    {app.t("Record initial baseline")}
                  </Button>
                )}
                <Directory
                  path={`${path}/mileage/segments`}
                  poll={pollMs}
                  fields={[
                    "from_at",
                    "to_at",
                    "distance_m",
                    "quality",
                    "source",
                  ]}
                />
                {app.can("mileage.correct") && (
                  <Files targetType="mileage" targetId={id} write />
                )}
              </div>
            ),
          },
        ]
      : []),
    ...(app.can("analytics.read")
      ? [
          {
            key: "energy",
            label: app.t("Fuel"),
            children: <Energy vehicleId={id} poll={pollMs} />,
          },
        ]
      : []),
    ...(app.can("journeys.read")
      ? [
          {
            key: "journeys",
            label: app.t("Journeys"),
            children: <Journeys vehicleId={id} poll={pollMs} />,
          },
        ]
      : []),
    ...(app.can("maintenance.read")
      ? [
          {
            key: "maintenance",
            label: app.t("Maintenance"),
            children: <VehicleMaintenance vehicleId={id} poll={pollMs} />,
          },
        ]
      : []),
    ...(app.can("compliance.read")
      ? [
          {
            key: "compliance",
            label: app.t("Compliance"),
            children: <Compliance vehicleId={id} poll={pollMs} />,
          },
        ]
      : []),
    ...(app.can("coverage.read") && app.feature("cellular")
      ? [
          {
            key: "coverage",
            label: app.t("Network coverage"),
            children: (
              <Telemetry
                vehicleId={id}
                coverage
                poll={pollMs}
                latestSample={sample}
                plate={text(vehicle.registration_number)}
              />
            ),
          },
        ]
      : []),
    {
      key: "files",
      label: app.t("Attachments"),
      children: (
        <Files
          targetType="vehicle"
          targetId={id}
          write={app.can("vehicles.write")}
        />
      ),
    },
  ];
  return (
    <div className="stack">
      <PageTitle
        title={text(vehicle.registration_number) || app.t("Vehicle details")}
        subtitle={[vehicle.make, vehicle.model].filter(Boolean).join(" · ")}
        extra={
          <>
            <Tag color={currentDriverName ? "blue" : "default"}>
              {currentDriverName
                ? `${app.t("Driver")}: ${currentDriverName}`
                : app.t("No active driver")}
            </Tag>
            <Tag color={autoRefresh ? "processing" : "default"}>
              {autoRefresh
                ? app
                    .t(
                      "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)",
                    )
                    .replace("{refreshSeconds}", String(refreshSeconds))
                    .replace("{configuredSeconds}", String(configuredSeconds))
                : app.t("Auto-refresh: OFF (until browser reload)")}
            </Tag>
            <Button onClick={() => setAutoRefresh((v) => !v)}>
              {autoRefresh
                ? app.t("Disable auto-refresh")
                : app.t("Enable auto-refresh")}
            </Button>
            <Button
              onClick={() =>
                navigate(`/organization/${app.organizationId}/vehicles`)
              }
            >
              {app.t("Back to vehicles")}
            </Button>
            {app.can("vehicles.write") &&
              vehicle.id &&
              vehicle.status !== "archived" && (
                <Button onClick={() => setEdit(true)}>{app.t("edit")}</Button>
              )}
          </>
        }
      />
      <ErrorNotice error={record.error} retry={() => void record.refetch()} />
      <Tabs destroyOnHidden items={items} />
      {edit && (
        <Workflow
          title={app.t("Edit vehicle")}
          path={path}
          method="PATCH"
          fields={[version, ...vehicleFields(app.t)]}
          initial={vehicle}
          refreshPath={path}
          onClose={() => setEdit(false)}
        />
      )}
      {baseline && (
        <Workflow
          title={app.t("Initial odometer baseline")}
          path={`${path}/odometer-observations`}
          fields={[
            number("reading_m", 0, 10000000, {
              required: true,
              integer: false,
              step: 0.1,
              label: app.t("Odometer reading (km)"),
              suffix: "km",
              metrePreview: true,
              help: app.t("odo_baseline_km_help"),
            }),
            field("observed_at", { kind: "datetime", required: true }),
            field("reason", {
              kind: "textarea",
              required: true,
              min: 3,
              max: 500,
            }),
          ]}
          transform={(body) =>
            convertMileageInputsToMetres(body, ["reading_m"])
          }
          onClose={() => setBaseline(false)}
        />
      )}
    </div>
  );
}
export function DeviceDetail({ id }: { id: string }) {
  const app = useApp(),
    path = orgPath(app.organizationId, `/devices/${segment(id)}`);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("Public device record")}
        subtitle={app.t(
          "Commissioning, activation and installation writes are managed by SaaS staff.",
        )}
      />
      <Snapshot path={path} pick="item" />
      <Directory
        path={`${path}/installations`}
        query={{ per_page: 50 }}
        fields={[
          "id",
          "vehicle_id",
          "effective_from",
          "effective_to",
          "closure_reason",
        ]}
      />
    </div>
  );
}
