import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Input,
  Row as GridRow,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Image,
  Typography,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { api, privateFileLink, orgPath, segment } from "../api/client";
import { object, rows, text, type Row } from "../api/types";
import { CoordinateMap, coordinates } from "../components/CoordinateMap";
import { NfcEnrollModal } from "../components/NfcEnrollModal";
import {
  enrichRowsWithTelemetryAndSafety,
  fetchPagedList,
  fetchTelemetryRange,
  finiteNumber,
  getSafetySummary,
  matchSafetyEventsForJourney,
  rowPointKey,
} from "../lib/telemetrySafety";
import {
  dayjs,
  Details,
  Directory,
  ErrorNotice,
  GeminiPoweredBadge,
  PageTitle,
  Snapshot,
  Status,
  Time,
  TimeWindow,
  useData,
  useTelemetryRefreshMs,
  windowQuery,
} from "../components/shared";
import {
  Action,
  EntitySelect,
  ReadDrawer,
  Workflow,
  field,
  reason,
  version,
} from "../components/workflow";
import { driverFields } from "./registry";
import { Files } from "./files";

function SafetyScoreCard({
  path,
  enabled,
  title,
  compact = false,
}: {
  path: string;
  enabled: boolean;
  title?: string;
  compact?: boolean;
}) {
  const app = useApp();
  const q = useData(path, {}, enabled);
  const d = q.data?.data;
  const hasNumericScore =
    d?.score !== null &&
    d?.score !== undefined &&
    Number.isFinite(Number(d.score));
  return (
    <Card
      title={title ?? app.t("Safety score")}
      loading={q.isPending}
      extra={
        <Button
          size="small"
          onClick={() => void q.refetch()}
          loading={q.isFetching}
        >
          {app.t("refresh")}
        </Button>
      }
    >
      <div className="stack">
        <ErrorNotice error={q.error} retry={() => void q.refetch()} />
        {d && (
          <>
            <GridRow gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title={app.t("Score (0–100)")}
                  value={
                    hasNumericScore ? Number(d.score) : app.t("Unavailable")
                  }
                  suffix={hasNumericScore ? "/ 100" : undefined}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={app.t("Events included")}
                  value={
                    d.events_included === null ||
                    d.events_included === undefined
                      ? "—"
                      : text(d.events_included)
                  }
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={app.t("Observed speed samples")}
                  value={
                    d.observed_speed_samples === null ||
                    d.observed_speed_samples === undefined
                      ? "—"
                      : text(d.observed_speed_samples)
                  }
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={app.t("Eligible speed intervals")}
                  value={
                    d.eligible_speed_intervals === null ||
                    d.eligible_speed_intervals === undefined
                      ? "—"
                      : text(d.eligible_speed_intervals)
                  }
                />
              </Col>
            </GridRow>
            {!compact && (
              <>
                <Descriptions
                  size="small"
                  bordered
                  column={{ xs: 1, sm: 1, md: 2 }}
                  items={[
                    {
                      key: "algorithm",
                      label: app.t("Algorithm"),
                      children: text(d.algorithm) || app.t("unknown"),
                    },
                    {
                      key: "quality",
                      label: app.t("Quality"),
                      children: text(d.quality) || app.t("unknown"),
                    },
                    {
                      key: "window",
                      label: app.t("Retention window"),
                      children: (
                        <>
                          <Time value={d.from} /> – <Time value={d.to} />
                        </>
                      ),
                    },
                    {
                      key: "approved_appeals_excluded",
                      label: app.t("Approved appeals excluded"),
                      children: d.approved_appeals_excluded
                        ? app.t("Yes")
                        : app.t("No"),
                    },
                  ]}
                />
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function formatDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function haversineMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusM = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function JourneyDetailDrawer({
  journeyId,
  initialJourney,
  poll,
  onClose,
}: {
  journeyId: string;
  initialJourney?: Row;
  poll?: number;
  onClose: () => void;
}) {
  const app = useApp();
  const path = orgPath(app.organizationId);
  const mapAnchorRef = useRef<HTMLDivElement | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);

  const journeyQ = useData(
    `${path}/journeys/${segment(journeyId)}`,
    {},
    true,
    poll,
  );
  const journey = useMemo(() => {
    const fetched = object(journeyQ.data?.data.journey);
    return Object.keys(fetched).length ? fetched : (initialJourney ?? {});
  }, [journeyQ.data, initialJourney]);

  const vehicleId = text(journey.vehicle_id);
  const startedAt = text(journey.started_at);
  const rawEndAt = text(journey.ended_at || journey.last_observed_at);
  const windowEndIso = useMemo(() => {
    const endMs = Date.parse(rawEndAt);
    const startMs = Date.parse(startedAt);
    if (Number.isFinite(endMs)) {
      return new Date(endMs + 2000).toISOString();
    }
    if (Number.isFinite(startMs)) {
      return new Date(Math.max(Date.now(), startMs + 5000)).toISOString();
    }
    return new Date().toISOString();
  }, [rawEndAt, startedAt]);

  const telemetryQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "journey-telemetry",
      journeyId,
      vehicleId,
      startedAt,
      windowEndIso,
    ],
    enabled: app.can("telemetry.read") && Boolean(vehicleId && startedAt),
    queryFn: ({ signal }) =>
      fetchTelemetryRange(
        app.organizationId,
        vehicleId,
        startedAt,
        windowEndIso,
        { endpoint: "telemetry", signal, maxChunks: 5 },
      ),
    retry: false,
    refetchInterval: (q) =>
      q.state.error || journey.state !== "active" ? false : poll || false,
    refetchIntervalInBackground: false,
  });

  const safetyQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "journey-safety",
      vehicleId,
    ],
    enabled:
      app.can("safety.read") && app.feature("safety") && Boolean(vehicleId),
    queryFn: ({ signal }) =>
      fetchPagedList(
        `${path}/safety-events`,
        { vehicle_id: vehicleId, per_page: 100 },
        signal,
        10,
      ),
    retry: false,
    refetchInterval: (q) =>
      q.state.error || journey.state !== "active" ? false : poll || false,
    refetchIntervalInBackground: false,
  });

  const journeySafetyEvents = useMemo(
    () => matchSafetyEventsForJourney(journey, safetyQ.data?.items ?? []),
    [journey, safetyQ.data],
  );

  const enrichedSamples = useMemo(() => {
    const cleanSamples = (telemetryQ.data?.items ?? []).map((s) => ({
      ...s,
      behaviour_data: {
        ...object(s.behaviour_data),
        harsh_braking: false,
        rapid_acceleration: false,
        sharp_cornering: false,
      },
      harsh_braking: false,
      rapid_acceleration: false,
      sharp_cornering: false,
    }));
    return enrichRowsWithTelemetryAndSafety(
      cleanSamples,
      [],
      journeySafetyEvents,
    );
  }, [telemetryQ.data, journeySafetyEvents]);

  const stats = useMemo(() => {
    const gpsRows = coordinates(enrichedSamples);
    const speeds = enrichedSamples
      .map((r) => finiteNumber(r.speed_kmh))
      .filter((v): v is number => v !== null);
    const harshBrakingCount = journeySafetyEvents.filter(
      (e) => e.kind === "harsh_braking",
    ).length;
    const rapidAccelCount = journeySafetyEvents.filter(
      (e) => e.kind === "rapid_acceleration" || e.kind === "harsh_acceleration",
    ).length;
    const startMs = Date.parse(startedAt);
    const endMs = Date.parse(rawEndAt);
    const durationSec =
      Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
        ? Math.round((endMs - startMs) / 1000)
        : null;

    const sortedSamples = [...enrichedSamples].sort((a, b) => {
      const ta = Date.parse(text(a.occurred_at));
      const tb = Date.parse(text(b.occurred_at));
      if (!Number.isFinite(ta) && !Number.isFinite(tb)) return 0;
      if (!Number.isFinite(ta)) return 1;
      if (!Number.isFinite(tb)) return -1;
      return ta - tb;
    });

    const sampleFuelRateLph = (s: Row): number | null => {
      const vd = object(s.vehicle_data);
      const direct =
        finiteNumber(s.fuel_rate_lph) ?? finiteNumber(vd.fuel_rate_lph);
      if (direct !== null) return direct;
      const maf = finiteNumber(s.maf_gps ?? vd.maf_gps);
      return maf !== null ? (maf * 3600) / (14.7 * 745) : null;
    };

    let speedMetres = 0;
    let gpsMetres = 0;
    let sampleFuelLitres = 0;
    let prevGps: { lat: number; lon: number } | null = null;

    for (let i = 0; i < sortedSamples.length; i++) {
      const curr = sortedSamples[i];
      const lat = finiteNumber(curr.latitude);
      const lon = finiteNumber(curr.longitude);
      if (
        lat !== null &&
        lon !== null &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180
      ) {
        if (prevGps) {
          gpsMetres += haversineMetres(prevGps.lat, prevGps.lon, lat, lon);
        }
        prevGps = { lat, lon };
      }

      if (i === 0) continue;
      const prev = sortedSamples[i - 1];
      const t1 = Date.parse(text(prev.occurred_at));
      const t2 = Date.parse(text(curr.occurred_at));
      const dtSec =
        Number.isFinite(t1) && Number.isFinite(t2) ? (t2 - t1) / 1000 : 0;
      if (dtSec > 0 && dtSec <= 3600) {
        const s1 = finiteNumber(prev.speed_kmh);
        const s2 = finiteNumber(curr.speed_kmh);
        if (s1 !== null && s2 !== null) {
          speedMetres += ((s1 + s2) / 2) * (dtSec / 3.6);
        }
        const r1 = sampleFuelRateLph(prev);
        const r2 = sampleFuelRateLph(curr);
        if (r1 !== null && r2 !== null) {
          sampleFuelLitres += ((r1 + r2) * dtSec) / 7200;
        }
      }
    }

    const rawBackendDistanceM = finiteNumber(journey.distance_m);
    const rawBackendDistanceKm = finiteNumber(journey.distance_km);
    const backendDistanceM =
      rawBackendDistanceM ??
      (rawBackendDistanceKm !== null ? rawBackendDistanceKm * 1000 : null);
    const distanceM =
      backendDistanceM !== null && backendDistanceM > 0
        ? backendDistanceM
        : speedMetres > 0
          ? speedMetres
          : gpsMetres > 0
            ? gpsMetres
            : (backendDistanceM ?? (enrichedSamples.length > 0 ? 0 : null));

    const rawQuality = text(journey.distance_quality);
    const distanceQuality =
      rawQuality && rawQuality !== "not_implemented"
        ? rawQuality
        : speedMetres > 0
          ? "speed_estimated"
          : gpsMetres > 0
            ? "gps_coordinates"
            : "estimated";

    const backendFuelLitres = finiteNumber(journey.fuel_litres);
    const fuelLitres =
      backendFuelLitres !== null && backendFuelLitres > 0
        ? backendFuelLitres
        : sampleFuelLitres > 0
          ? sampleFuelLitres
          : null;

    const distanceKm = distanceM !== null ? distanceM / 1000 : null;
    const lPer100km =
      finiteNumber(journey.fuel_efficiency_l_per_100km) ??
      (distanceKm && distanceKm > 0 && fuelLitres && fuelLitres > 0
        ? (fuelLitres / distanceKm) * 100
        : null);
    const kmPerL =
      finiteNumber(journey.fuel_efficiency_km_per_l) ??
      (distanceKm && distanceKm > 0 && fuelLitres && fuelLitres > 0
        ? distanceKm / fuelLitres
        : null);
    const fuelEfficiencyText =
      lPer100km !== null && kmPerL !== null
        ? `${lPer100km.toFixed(2)} L/100km / ${kmPerL.toFixed(2)} km/L`
        : null;

    return {
      gpsCount: gpsRows.length,
      totalSamples: enrichedSamples.length,
      maxSpeed: speeds.length ? Math.max(...speeds) : null,
      avgSpeed: speeds.length
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : null,
      harshBrakingCount,
      rapidAccelCount,
      durationSec,
      distanceM,
      distanceKm,
      distanceQuality,
      fuelLitres,
      lPer100km,
      kmPerL,
      fuelEfficiencyText,
    };
  }, [enrichedSamples, startedAt, rawEndAt, journeySafetyEvents, journey]);

  const journeyDetails = useMemo(
    () => ({
      ...journey,
      distance_m: stats.distanceM ?? journey.distance_m,
      distance_quality: stats.distanceQuality,
      end_reason:
        journey.end_reason === "telemetry_gap"
          ? "automatic_end"
          : journey.end_reason,
      fuel_efficiency:
        stats.fuelEfficiencyText ?? journey.fuel_efficiency ?? null,
      fuel_litres:
        stats.fuelLitres !== null
          ? Number(stats.fuelLitres.toFixed(3))
          : (journey.fuel_litres ?? null),
    }),
    [journey, stats],
  );

  const locateOnMap = useCallback((row: Row) => {
    const targetKey =
      text(row.end_sample_id) || text(row.id) || rowPointKey(row);
    setFocusKey(targetKey);
    setFocusNonce((n) => n + 1);
    mapAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  return (
    <Drawer
      title={app.t("Automatic journey — Speed & Harsh Driving Route")}
      open
      size={880}
      onClose={onClose}
    >
      <div className="stack">
        <ErrorNotice error={journeyQ.error} />
        <ErrorNotice error={telemetryQ.error} />
        {telemetryQ.data?.truncated && (
          <Alert
            type="warning"
            showIcon
            title={app.t(
              "Long journey truncated to the first 5 days of telemetry samples.",
            )}
          />
        )}
        <Card
          size="small"
          loading={telemetryQ.isPending && !enrichedSamples.length}
        >
          <GridRow gutter={[16, 12]}>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Duration")}
                value={
                  stats.durationSec !== null
                    ? formatDurationSeconds(stats.durationSec)
                    : "—"
                }
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Distance")}
                value={
                  stats.distanceKm !== null
                    ? Number(stats.distanceKm.toFixed(2))
                    : "—"
                }
                suffix={stats.distanceKm !== null ? "km" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Fuel efficiency")}
                value={stats.fuelEfficiencyText ?? "—"}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("GPS points")}
                value={`${stats.gpsCount} / ${stats.totalSamples}`}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Max speed")}
                value={
                  stats.maxSpeed !== null
                    ? Number(stats.maxSpeed.toFixed(1))
                    : "—"
                }
                suffix={stats.maxSpeed !== null ? "km/h" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Avg speed")}
                value={
                  stats.avgSpeed !== null
                    ? Number(stats.avgSpeed.toFixed(1))
                    : "—"
                }
                suffix={stats.avgSpeed !== null ? "km/h" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Harsh braking")}
                value={stats.harshBrakingCount}
                styles={
                  stats.harshBrakingCount > 0
                    ? { content: { color: "#cf1322" } }
                    : undefined
                }
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={app.t("Harsh acceleration")}
                value={stats.rapidAccelCount}
                styles={
                  stats.rapidAccelCount > 0
                    ? { content: { color: "#d46b08" } }
                    : undefined
                }
              />
            </Col>
          </GridRow>
        </Card>

        {!app.can("telemetry.read") ? (
          <Alert
            type="info"
            showIcon
            title={app.t(
              "Telemetry read permission is required to plot the speed-colored route.",
            )}
          />
        ) : (
          <div ref={mapAnchorRef}>
            <Card
              title={app.t("Journey Speed & Danger Map")}
              size="small"
              loading={telemetryQ.isPending}
            >
              <CoordinateMap
                items={enrichedSamples}
                mode="route"
                focusRowKey={focusKey}
                focusNonce={focusNonce}
                onSelect={(row) => locateOnMap(row)}
              />
            </Card>
          </div>
        )}

        <Card
          title={app.t("Harsh Braking & Acceleration in This Journey")}
          size="small"
          loading={safetyQ.isPending || telemetryQ.isPending}
        >
          {journeySafetyEvents.length > 0 ? (
            <Table<Row>
              size="small"
              rowKey={(r) => text(r.id) || rowPointKey(r)}
              dataSource={journeySafetyEvents}
              pagination={
                journeySafetyEvents.length > 8 ? { pageSize: 8 } : false
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
                  dataIndex: "kind",
                  key: "kind",
                  render: (v: unknown) =>
                    v === "harsh_braking" ? (
                      <Tag color="error">{app.t("Harsh braking")}</Tag>
                    ) : (
                      <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                    ),
                },
                {
                  title: app.t("Speed"),
                  key: "speed",
                  render: (_: unknown, r: Row) => {
                    const end = finiteNumber(r.end_speed_kmh);
                    const start = finiteNumber(r.start_speed_kmh);
                    if (end !== null && start !== null) {
                      return `${start.toFixed(1)} → ${end.toFixed(1)} km/h`;
                    }
                    const single = end ?? start ?? finiteNumber(r.speed_kmh);
                    return single !== null ? `${single.toFixed(1)} km/h` : "—";
                  },
                },
                {
                  title: app.t("Speed Δ"),
                  dataIndex: "delta_speed_kmh",
                  key: "delta_speed_kmh",
                  render: (v: unknown, r: Row) => {
                    let n = finiteNumber(v);
                    if (n === null) {
                      const end = finiteNumber(r.end_speed_kmh);
                      const start = finiteNumber(r.start_speed_kmh);
                      if (end !== null && start !== null) {
                        n = end - start;
                      }
                    }
                    return n !== null
                      ? `${n > 0 ? "+" : ""}${n.toFixed(1)} km/h`
                      : "—";
                  },
                },
                {
                  title: app.t("Acceleration"),
                  dataIndex: "acceleration_ms2",
                  key: "accel",
                  render: (v: unknown) => {
                    const n = finiteNumber(v);
                    return n !== null ? `${n.toFixed(2)} m/s²` : "—";
                  },
                },
                {
                  title: app.t("Threshold"),
                  dataIndex: "threshold_ms2",
                  key: "threshold",
                  render: (v: unknown) => {
                    const n = finiteNumber(v);
                    return n !== null ? `${n.toFixed(2)} m/s²` : "—";
                  },
                },
                {
                  title: app.t("Coordinates"),
                  key: "coords",
                  render: (_: unknown, r: Row) => {
                    const lat = finiteNumber(
                      r.latitude ?? r.end_latitude ?? r.start_latitude,
                    );
                    const lon = finiteNumber(
                      r.longitude ?? r.end_longitude ?? r.start_longitude,
                    );
                    return lat !== null && lon !== null ? (
                      <span className="reference">
                        {lat.toFixed(5)}, {lon.toFixed(5)}
                      </span>
                    ) : (
                      <span className="muted">{app.t("No GPS fix")}</span>
                    );
                  },
                },
                {
                  title: app.t("Map"),
                  key: "locate",
                  render: (_: unknown, r: Row) => {
                    const lat = finiteNumber(
                      r.latitude ?? r.end_latitude ?? r.start_latitude,
                    );
                    const lon = finiteNumber(
                      r.longitude ?? r.end_longitude ?? r.start_longitude,
                    );
                    return lat !== null && lon !== null ? (
                      <Button size="small" onClick={() => locateOnMap(r)}>
                        {app.t("Locate danger")}
                      </Button>
                    ) : (
                      <span className="muted">—</span>
                    );
                  },
                },
              ]}
            />
          ) : (
            <Alert
              type="success"
              showIcon
              title={app.t(
                "No harsh braking or rapid acceleration events detected in this journey.",
              )}
            />
          )}
        </Card>

        <Card title={app.t("Journey Metadata")} size="small">
          <Details data={journeyDetails} />
        </Card>
      </div>
    </Drawer>
  );
}

export function Journeys({
  vehicleId,
  poll,
}: {
  vehicleId?: string;
  poll?: number;
}) {
  const app = useApp(),
    path = orgPath(app.organizationId),
    [selectedJourney, setSelectedJourney] = useState<Row | null>(null),
    [state, setState] = useState<string | undefined>(),
    [vehicle, setVehicle] = useState(vehicleId),
    [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().subtract(1, "day"),
      dayjs(),
    ]);
  useEffect(() => {
    if (!poll || poll <= 0) return;
    const timer = window.setInterval(() => {
      const now = dayjs();
      setRange((prev) => {
        if (Math.abs(now.diff(prev[1], "millisecond")) <= 3 * 60_000) {
          const spanMs = Math.max(60_000, prev[1].diff(prev[0]));
          return [now.subtract(spanMs, "millisecond"), now];
        }
        return prev;
      });
    }, poll);
    return () => window.clearInterval(timer);
  }, [poll]);

  const safetyQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "journeys-safety-events",
      vehicle ?? "all",
    ],
    enabled: app.can("safety.read") && app.feature("safety"),
    queryFn: ({ signal }) =>
      fetchPagedList(
        `${path}/safety-events`,
        { ...(vehicle ? { vehicle_id: vehicle } : {}), per_page: 100 },
        signal,
        10,
      ),
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : poll || false),
    refetchIntervalInBackground: false,
  });

  const journeyRender = useMemo(
    () => ({
      driving_events: (_v: unknown, row: Row) => {
        if (!app.can("safety.read") || !app.feature("safety")) {
          return <span className="muted">{app.t("Inspect journey")}</span>;
        }
        const matched = matchSafetyEventsForJourney(
          row,
          safetyQ.data?.items ?? [],
        );
        const braking = matched.filter(
          (e) => e.kind === "harsh_braking",
        ).length;
        const accel = matched.filter(
          (e) =>
            e.kind === "rapid_acceleration" || e.kind === "harsh_acceleration",
        ).length;
        if (braking === 0 && accel === 0) {
          return <Tag color="success">{app.t("No harsh events")}</Tag>;
        }
        return (
          <Space size={4} wrap>
            {braking > 0 && (
              <Tag color="error">
                {braking} {app.t("Harsh braking")}
              </Tag>
            )}
            {accel > 0 && (
              <Tag color="warning">
                {accel} {app.t("Harsh accel")}
              </Tag>
            )}
          </Space>
        );
      },
    }),
    [app, safetyQ.data],
  );

  return (
    <div className="stack">
      {!vehicleId && (
        <PageTitle
          title={app.t("journeys")}
          subtitle={app.t(
            "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.",
          )}
        />
      )}
      <TimeWindow value={range} onChange={setRange} maxDays={31} />
      <Space wrap>
        <Select
          allowClear
          placeholder={app.t("All journey states")}
          value={state}
          onChange={setState}
          options={["active", "completed", "incomplete"].map((value) => ({
            value,
            label: app.t(value),
          }))}
        />
        {!vehicleId && (
          <div className="filter-select">
            <EntitySelect
              path={`${path}/vehicles`}
              labelKey="registration_number"
              value={vehicle}
              onChange={setVehicle}
            />
          </div>
        )}
      </Space>
      <Directory
        path={`${path}/journeys`}
        poll={poll}
        query={{
          ...windowQuery(range),
          vehicle_id: vehicle,
          state,
          limit: 100,
        }}
        fields={[
          "vehicle_id",
          "state",
          "started_at",
          "ended_at",
          "distance_m",
          "fuel_efficiency",
          "driving_events",
          "last_observed_at",
          "unknown_seconds",
          "distance_quality",
        ]}
        render={journeyRender}
        transformRows={(rows) =>
          rows.map((r) => {
            const matched = matchSafetyEventsForJourney(
              r,
              safetyQ.data?.items ?? [],
            );
            const parts: string[] = [];
            const b = matched.filter((e) => e.kind === "harsh_braking").length;
            const a = matched.filter(
              (e) =>
                e.kind === "rapid_acceleration" ||
                e.kind === "harsh_acceleration",
            ).length;
            if (b > 0) parts.push(`${b} ${app.t("harsh braking")}`);
            if (a > 0) parts.push(`${a} ${app.t("harsh acceleration")}`);
            const lPer100 = finiteNumber(r.fuel_efficiency_l_per_100km);
            const kmPerL = finiteNumber(r.fuel_efficiency_km_per_l);
            const fuelEfficiency =
              lPer100 !== null && kmPerL !== null
                ? `${lPer100.toFixed(2)} L/100km / ${kmPerL.toFixed(2)} km/L`
                : text(r.fuel_efficiency) || null;
            return {
              ...r,
              end_reason:
                r.end_reason === "telemetry_gap"
                  ? "automatic_end"
                  : r.end_reason,
              fuel_efficiency: fuelEfficiency,
              driving_events: parts.join(", ") || app.t("None"),
            };
          })
        }
        scope={app.t(
          "At most 100 journeys in this filter; no cursor endpoint is available.",
        )}
        action={(row) => (
          <Button size="small" onClick={() => setSelectedJourney(row)}>
            {app.t("Inspect journey")}
          </Button>
        )}
      />
      {selectedJourney && (
        <JourneyDetailDrawer
          journeyId={text(selectedJourney.id)}
          initialJourney={selectedJourney}
          poll={poll}
          key={text(selectedJourney.id)}
          onClose={() => setSelectedJourney(null)}
        />
      )}
    </div>
  );
}
function EventDetailContent({
  record,
  own,
  onAppeal,
}: {
  record: Row;
  own?: boolean;
  onAppeal?: () => void;
}) {
  const app = useApp();

  const eventLat = finiteNumber(
    record.latitude ?? record.end_latitude ?? record.start_latitude,
  );
  const eventLon = finiteNumber(
    record.longitude ?? record.end_longitude ?? record.start_longitude,
  );
  const hasCoords =
    eventLat !== null &&
    eventLon !== null &&
    Math.abs(eventLat) <= 90 &&
    Math.abs(eventLon) <= 180;

  const mapItems = useMemo(() => {
    if (!hasCoords) return [];
    const startLat = finiteNumber(record.start_latitude);
    const startLon = finiteNumber(record.start_longitude);
    const endLat = finiteNumber(record.end_latitude);
    const endLon = finiteNumber(record.end_longitude);
    if (
      startLat !== null &&
      startLon !== null &&
      endLat !== null &&
      endLon !== null &&
      (startLat !== endLat || startLon !== endLon)
    ) {
      return [
        {
          ...record,
          id: `${text(record.id) || "event"}-start`,
          occurred_at: record.started_at ?? record.occurred_at,
          latitude: startLat,
          longitude: startLon,
          speed_kmh: record.start_speed_kmh ?? null,
        },
        {
          ...record,
          id: `${text(record.id) || "event"}-end`,
          occurred_at: record.ended_at ?? record.occurred_at,
          latitude: endLat,
          longitude: endLon,
          speed_kmh: record.end_speed_kmh ?? null,
          safety_events: [record],
        },
      ];
    }
    return [
      {
        ...record,
        id: text(record.id) || "event-location",
        occurred_at: record.occurred_at,
        latitude: eventLat,
        longitude: eventLon,
        speed_kmh: record.end_speed_kmh ?? record.start_speed_kmh ?? null,
        safety_events: [record],
      },
    ];
  }, [record, hasCoords, eventLat, eventLon]);

  const speedDelta = finiteNumber(record.delta_speed_kmh);
  const startSpeed = finiteNumber(record.start_speed_kmh);
  const endSpeed = finiteNumber(record.end_speed_kmh);
  const accel = finiteNumber(
    record.acceleration_ms2 ?? record.max_acceleration_g,
  );
  const vehiclePlate =
    text(record.registration_number) || text(record.vehicle_id) || "—";
  const vehicleMakeModel = [
    text(record.vehicle_make),
    text(record.vehicle_model),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="stack">
      <Card size="small" title={app.t("Speed & Vehicle Information")}>
        <GridRow gutter={[16, 12]}>
          <Col xs={12} sm={6}>
            <Statistic
              title={app.t("Speed delta")}
              value={
                speedDelta !== null
                  ? `${speedDelta > 0 ? "+" : ""}${speedDelta.toFixed(1)} km/h`
                  : "—"
              }
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={app.t("Speed range")}
              value={
                startSpeed !== null && endSpeed !== null
                  ? `${Math.round(startSpeed)} → ${Math.round(endSpeed)} km/h`
                  : "—"
              }
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={app.t("Acceleration")}
              value={
                accel !== null
                  ? `${accel.toFixed(2)} ${
                      record.acceleration_ms2 !== null &&
                      record.acceleration_ms2 !== undefined
                        ? "m/s²"
                        : "g"
                    }`
                  : "—"
              }
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={app.t("Vehicle")}
              value={vehiclePlate}
              formatter={() => (
                <span>
                  {vehiclePlate}
                  {vehicleMakeModel && (
                    <span
                      style={{
                        fontSize: "0.85em",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      {vehicleMakeModel}
                    </span>
                  )}
                </span>
              )}
            />
          </Col>
        </GridRow>
      </Card>

      {hasCoords ? (
        <Card size="small" title={app.t("Event Location Map")}>
          <CoordinateMap items={mapItems} mode="route" />
        </Card>
      ) : (
        <Alert
          type="info"
          showIcon
          title={app.t("No GPS coordinates recorded for this driving event.")}
          description={app.t(
            "This observation was captured from sensor telemetry without a valid GPS coordinate lock.",
          )}
        />
      )}

      {own && record.state === "observed" && onAppeal && (
        <Space>
          <Button type="primary" onClick={onAppeal}>
            {app.t("Submit appeal")}
          </Button>
        </Space>
      )}

      <Card size="small" title={app.t("Event Details")}>
        <Details data={record} />
      </Card>
    </div>
  );
}

export function Safety({
  appeals = false,
  own = false,
}: {
  appeals?: boolean;
  own?: boolean;
}) {
  const app = useApp(),
    path = orgPath(app.organizationId),
    [record, setRecord] = useState<Row | null>(null),
    [submit, setSubmit] = useState<Row | null>(null),
    [driver, setDriver] = useState<string | undefined>(),
    [vehicle, setVehicle] = useState<string | undefined>();
  const endpoint = own
    ? `${path}/driver/me/${appeals ? "appeals" : "events"}`
    : `${path}/safety-${appeals ? "appeals" : "events"}`;
  return (
    <div className="stack">
      <PageTitle
        title={app.t(
          own
            ? appeals
              ? "myAppeals"
              : "events"
            : appeals
              ? "appeals"
              : "safety",
        )}
        subtitle={app.t(
          "Review braking and acceleration observations and appeal decisions.",
        )}
      />
      {!own && !appeals && (
        <Space wrap>
          <div className="filter-select">
            <EntitySelect
              path={`${path}/drivers`}
              value={driver}
              onChange={setDriver}
            />
          </div>
          <div className="filter-select">
            <EntitySelect
              path={`${path}/vehicles`}
              labelKey="registration_number"
              value={vehicle}
              onChange={setVehicle}
            />
          </div>
        </Space>
      )}
      <Directory
        path={endpoint}
        query={own || appeals ? {} : { driver_id: driver, vehicle_id: vehicle }}
        fields={
          appeals
            ? [
                "id",
                "event_id",
                "driver_id",
                "reason",
                "status",
                "decision_reason",
                "created_at",
              ]
            : own
              ? [
                  "kind",
                  "registration_number",
                  "vehicle_id",
                  "occurred_at",
                  "state",
                  "delta_speed_kmh",
                  "acceleration_ms2",
                ]
              : [
                  "kind",
                  "driver_id",
                  "vehicle_id",
                  "occurred_at",
                  "state",
                  "delta_speed_kmh",
                  "acceleration_ms2",
                ]
        }
        render={
          !appeals
            ? {
                kind: (v: unknown) => {
                  const k = text(v);
                  if (k === "harsh_braking")
                    return <Tag color="error">{app.t("Harsh braking")}</Tag>;
                  if (k === "rapid_acceleration" || k === "harsh_acceleration")
                    return (
                      <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                    );
                  return <Tag>{k}</Tag>;
                },
                delta_speed_kmh: (v: unknown) => {
                  const n = finiteNumber(v);
                  return n !== null
                    ? `${n > 0 ? "+" : ""}${n.toFixed(1)} km/h`
                    : "—";
                },
                acceleration_ms2: (v: unknown) => {
                  const n = finiteNumber(v);
                  return n !== null ? `${n.toFixed(2)} m/s²` : "—";
                },
              }
            : undefined
        }
        action={(row) => (
          <>
            <Button size="small" onClick={() => setRecord(row)}>
              {app.t("Inspect")}
            </Button>
            {own && !appeals && row.state === "observed" && (
              <Button size="small" onClick={() => setSubmit(row)}>
                {app.t("Submit appeal")}
              </Button>
            )}
            {appeals &&
              !own &&
              app.can("safety.appeals.decide") &&
              row.submitted_by !== app.session?.user.id &&
              row.status === "pending" && (
                <Button size="small" onClick={() => setSubmit(row)}>
                  {app.t("Review decision")}
                </Button>
              )}
          </>
        )}
      />
      {record && (
        <Drawer
          open
          size={780}
          title={appeals ? app.t("Appeal record") : app.t("Safety observation")}
          onClose={() => setRecord(null)}
        >
          {appeals ? (
            <Details data={record} />
          ) : (
            <EventDetailContent
              record={record}
              own={own}
              onAppeal={
                own && !appeals && record.state === "observed"
                  ? () => {
                      setSubmit(record);
                      setRecord(null);
                    }
                  : undefined
              }
            />
          )}
        </Drawer>
      )}
      {submit && (
        <Workflow
          title={own ? app.t("Submit my event appeal") : app.t("Decide appeal")}
          path={
            own
              ? `${path}/driver/me/appeals`
              : `${path}/safety-appeals/${segment(text(submit.id))}/decision`
          }
          fields={
            own
              ? [
                  field("event_id", { kind: "readonly", required: true }),
                  field("reason", {
                    kind: "textarea",
                    required: true,
                    max: 2000,
                  }),
                ]
              : [
                  version,
                  field("decision", {
                    kind: "radio",
                    options: ["approved", "rejected"],
                    required: true,
                  }),
                  field("reason", {
                    kind: "textarea",
                    required: true,
                    max: 2000,
                  }),
                ]
          }
          initial={own ? { event_id: submit.id } : { version: submit.version }}
          description={
            own
              ? app.t(
                  "Describe why this driving event needs review. You can submit one appeal for each eligible event.",
                )
              : app.t(
                  "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.",
                )
          }
          onClose={() => setSubmit(null)}
        />
      )}
    </div>
  );
}
function credentialStatus(row: Row): "active" | "revoked" | "expired" {
  if (row.revoked_at || row.status === "revoked") return "revoked";
  if (
    row.status === "expired" ||
    (row.expires_at &&
      dayjs(text(row.expires_at)).isValid() &&
      dayjs(text(row.expires_at)).isBefore(dayjs()))
  ) {
    return "expired";
  }
  return "active";
}

export function DriverDetail({ id }: { id: string }) {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId),
    { pollMs } = useTelemetryRefreshMs(true),
    q = useData(`${path}/drivers/${segment(id)}`, {}, true, pollMs),
    driver = object(q.data?.data.item),
    activeShift = object(q.data?.data.active_shift),
    currentVehicleId = text(
      activeShift.vehicle_id || driver.current_vehicle_id,
    ),
    currentPlate = text(
      activeShift.registration_number || driver.current_vehicle_registration,
    ),
    currentVehicleModel = [
      text(activeShift.make || driver.current_vehicle_make),
      text(activeShift.model || driver.current_vehicle_model),
    ]
      .filter(Boolean)
      .join(" "),
    credQ = useData(
      `${path}/drivers/${segment(id)}/credentials`,
      {},
      app.can("credentials.manage"),
    ),
    credentialRows = rows(
      credQ.data?.data.credentials ?? credQ.data?.data.items,
    ),
    [edit, setEdit] = useState(false),
    [enroll, setEnroll] = useState(false),
    [knownCredential, setKnownCredential] = useState("");
  const [shift, setShift] = useState<string | null>(null),
    [closeShift, setCloseShift] = useState<string | null>(null);
  return (
    <div className="stack">
      <PageTitle
        title={text(driver.name) || app.t("Driver details")}
        subtitle={app.t(
          "Profile identity and currently authorized NFC shifts.",
        )}
        extra={
          <Space wrap>
            <Tag color={currentPlate ? "blue" : "default"}>
              {currentPlate
                ? `${app.t("Driving")}: ${currentPlate}`
                : app.t("Off shift")}
            </Tag>
            {app.can("credentials.manage") && driver.status !== "archived" && (
              <Button type="primary" onClick={() => setEnroll(true)}>
                {app.t("Link Driver NFC ID")}
              </Button>
            )}
            {app.can("drivers.write") && (
              <Button onClick={() => setEdit(true)}>
                {app.t("Edit driver")}
              </Button>
            )}
          </Space>
        }
      />
      <ErrorNotice error={q.error} />
      <Tabs
        destroyOnHidden
        items={[
          {
            key: "profile",
            label: app.t("Profile & private photo"),
            children: (
              <div className="stack">
                <Card
                  title={app.t("Current vehicle session")}
                  extra={
                    currentVehicleId ? (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() =>
                          navigate(
                            `/organization/${app.organizationId}/vehicles/${currentVehicleId}`,
                          )
                        }
                      >
                        {app.t("Open vehicle")}
                      </Button>
                    ) : undefined
                  }
                >
                  {currentPlate || currentVehicleId ? (
                    <Descriptions
                      size="small"
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      items={[
                        {
                          key: "registration_number",
                          label: app.t("registration_number"),
                          children: currentPlate || currentVehicleId,
                        },
                        {
                          key: "make_model",
                          label: app.t("Make / model"),
                          children: currentVehicleModel || (
                            <span className="muted">{app.t("unknown")}</span>
                          ),
                        },
                        {
                          key: "started_at",
                          label: app.t("started_at"),
                          children: (
                            <Time
                              value={
                                activeShift.started_at ||
                                driver.current_shift_started_at
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
                                driver.current_shift_expires_at
                              }
                            />
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <Typography.Text type="secondary">
                      {app.t(
                        "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.",
                      )}
                    </Typography.Text>
                  )}
                </Card>
                <Details data={driver} />
                <Photo id={id} />
                {app.can("drivers.write") && (
                  <Files
                    targetType="driver"
                    targetId={id}
                    version={driver.version as number}
                    write
                    photoWrapper
                  />
                )}
              </div>
            ),
          },
          ...(app.can("shifts.read")
            ? [
                {
                  key: "shifts",
                  label: app.t("NFC shifts"),
                  children: (
                    <div className="stack">
                      <Directory
                        path={`${path}/driver-shifts`}
                        rowFilter={(row) => row.driver_id === id}
                        listKey="shifts"
                        fields={[
                          "id",
                          "vehicle_id",
                          "registration_number",
                          "state",
                          "started_at",
                          "ended_at",
                          "attribution_expires_at",
                        ]}
                        action={(row) => (
                          <>
                            <Button
                              size="small"
                              onClick={() => setShift(text(row.id))}
                            >
                              {app.t("Inspect shift")}
                            </Button>
                            {app.can("shifts.manage") &&
                              row.state === "active" && (
                                <Button
                                  size="small"
                                  onClick={() => setCloseShift(text(row.id))}
                                >
                                  {app.t("Administrative close")}
                                </Button>
                              )}
                          </>
                        )}
                      />
                    </div>
                  ),
                },
              ]
            : []),
          ...(app.can("safety.read") && app.feature("safety")
            ? [
                {
                  key: "safety",
                  label: app.t("Safety score & events"),
                  children: (
                    <div className="stack">
                      <SafetyScoreCard
                        path={`${path}/drivers/${segment(id)}/safety-score`}
                        enabled={
                          !app.subscriptionPending && app.feature("safety")
                        }
                        title={app.t("Driver safety score")}
                      />
                      <Directory
                        path={`${path}/safety-events`}
                        query={{ driver_id: id }}
                        fields={[
                          "kind",
                          "vehicle_id",
                          "occurred_at",
                          "state",
                          "delta_speed_kmh",
                          "acceleration_ms2",
                        ]}
                      />
                    </div>
                  ),
                },
              ]
            : []),
          ...(app.can("credentials.manage")
            ? [
                {
                  key: "credentials",
                  label: app.t("NFC credentials"),
                  children: (
                    <div className="stack">
                      <Space wrap>
                        <Button
                          type="primary"
                          disabled={driver.status === "archived"}
                          onClick={() => setEnroll(true)}
                        >
                          {app.t("Enrol NFC fingerprint")}
                        </Button>
                        <Button
                          loading={credQ.isFetching}
                          onClick={() => void credQ.refetch()}
                        >
                          {app.t("refresh")}
                        </Button>
                      </Space>
                      <ErrorNotice error={credQ.error} />
                      <Table<Row>
                        size="small"
                        rowKey={(row) => text(row.id)}
                        loading={credQ.isLoading}
                        dataSource={credentialRows}
                        pagination={
                          credentialRows.length > 10 ? { pageSize: 10 } : false
                        }
                        scroll={{ x: "max-content" }}
                        columns={[
                          {
                            title: app.t("Credential reference ID"),
                            dataIndex: "id",
                            key: "id",
                            render: (v: unknown) => (
                              <span className="reference">{text(v)}</span>
                            ),
                          },
                          {
                            title: app.t("credential_type"),
                            dataIndex: "type",
                            key: "type",
                            render: (v: unknown) => {
                              const raw = text(v);
                              return raw ? app.t(raw) : "—";
                            },
                          },
                          {
                            title: app.t("Assurance"),
                            dataIndex: "assurance",
                            key: "assurance",
                            render: (v: unknown) =>
                              text(v) ? (
                                <Tag>{text(v)}</Tag>
                              ) : (
                                <span className="muted">—</span>
                              ),
                          },
                          {
                            title: app.t("Issued at"),
                            dataIndex: "issued_at",
                            key: "issued_at",
                            render: (v: unknown) => <Time value={v} />,
                          },
                          {
                            title: app.t("expires_at"),
                            dataIndex: "expires_at",
                            key: "expires_at",
                            render: (v: unknown) =>
                              v ? (
                                <Time value={v} />
                              ) : (
                                <span className="muted">
                                  {app.t("No expiry")}
                                </span>
                              ),
                          },
                          {
                            title: app.t("status"),
                            key: "status",
                            render: (_: unknown, row: Row) => {
                              const st = credentialStatus(row);
                              return st === "revoked" ? (
                                <Tag color="error">{app.t("Revoked")}</Tag>
                              ) : st === "expired" ? (
                                <Tag color="warning">{app.t("Expired")}</Tag>
                              ) : (
                                <Tag color="success">{app.t("Active")}</Tag>
                              );
                            },
                          },
                          {
                            title: app.t("Actions"),
                            key: "actions",
                            render: (_: unknown, row: Row) =>
                              credentialStatus(row) === "active" &&
                              text(row.id) ? (
                                <Action
                                  label={app.t("Revoke")}
                                  danger
                                  path={`${path}/drivers/${segment(id)}/credentials/${segment(text(row.id))}/revoke`}
                                  description={app.t(
                                    "Revoke this NFC credential? Active shifts using this card will be closed by the server.",
                                  )}
                                  options={{ sensitive: true }}
                                  onDone={() => {
                                    void credQ.refetch();
                                  }}
                                />
                              ) : null,
                          },
                        ]}
                      />
                      <Input
                        placeholder={app.t("Known enrolled credential UUID")}
                        value={knownCredential}
                        onChange={(e) => setKnownCredential(e.target.value)}
                      />
                      {/^[0-9a-fA-F-]{36}$/.test(knownCredential) && (
                        <Action
                          label={app.t("Revoke known credential")}
                          danger
                          path={`${path}/drivers/${segment(id)}/credentials/${segment(knownCredential)}/revoke`}
                          options={{ sensitive: true }}
                          onDone={() => {
                            setKnownCredential("");
                            void credQ.refetch();
                          }}
                        />
                      )}
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
      {edit && (
        <Workflow
          title={app.t("Edit driver")}
          path={`${path}/drivers/${segment(id)}`}
          method="PATCH"
          fields={[version, ...driverFields(path, app.t)]}
          initial={driver}
          refreshPath={`${path}/drivers/${segment(id)}`}
          onClose={() => setEdit(false)}
        />
      )}
      {enroll && (
        <NfcEnrollModal
          driverId={id}
          driverName={text(driver.name) || undefined}
          onDone={(cred) => {
            setKnownCredential(text(cred.id));
            void credQ.refetch();
          }}
          onClose={() => setEnroll(false)}
        />
      )}
      {shift && (
        <ReadDrawer
          title={app.t("Driver shift")}
          path={`${path}/driver-shifts/${segment(shift)}`}
          key={shift}
          onClose={() => setShift(null)}
        />
      )}
      {closeShift && (
        <Workflow
          title={app.t("Administratively close shift")}
          path={`${path}/driver-shifts/${segment(closeShift)}/close`}
          fields={[{ ...reason, max: 255 }]}
          onClose={() => setCloseShift(null)}
        />
      )}
    </div>
  );
}
export function Assignments() {
  const app = useApp(),
    navigate = useNavigate(),
    { pollMs } = useTelemetryRefreshMs(true),
    [assignmentPoints, setAssignmentPoints] = useState<Row[]>([]),
    onData = useCallback((items: Row[]) => setAssignmentPoints(items), []);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("Current assignments")}
        subtitle={app.t(
          "Locations require currently authorized NFC shifts; old observations are not live GPS.",
        )}
      />
      <Card title={app.t("Active shift coordinates")}>
        <CoordinateMap
          items={assignmentPoints}
          mode="fleet"
          inspectLabel={app.t("Driver details")}
          onSelect={(row) =>
            navigate(`/organization/${app.organizationId}/drivers/${row.id}`)
          }
        />
      </Card>
      <Directory
        path={orgPath(app.organizationId, "/driver-assignments")}
        query={{ per_page: 100 }}
        poll={pollMs}
        fields={[
          "name",
          "status",
          "registration_number",
          "make",
          "model",
          "speed_kmh",
          "freshness",
          "dtc_codes",
          "shift_started_at",
          "occurred_at",
        ]}
        render={{
          registration_number: (v) =>
            text(v) ? (
              <Tag color="blue">{text(v)}</Tag>
            ) : (
              <span className="muted">{app.t("Off shift")}</span>
            ),
          make: (v) => (text(v) ? text(v) : <span className="muted">—</span>),
          model: (v) => (text(v) ? text(v) : <span className="muted">—</span>),
          speed_kmh: (v) =>
            v !== null && v !== undefined && text(v) !== "" ? (
              `${Number(v).toFixed(1)} km/h`
            ) : (
              <span className="muted">—</span>
            ),
          freshness: (v, row) =>
            text(v) ? (
              <Status value={v} />
            ) : row.registration_number ? (
              <Status value="never_observed" />
            ) : (
              <span className="muted">—</span>
            ),
          dtc_codes: (v) =>
            Array.isArray(v) && v.length > 0 ? (
              <Space size={[4, 4]} wrap>
                {v.map((c, idx) => (
                  <Tag color="error" key={idx}>
                    {text(c)}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span className="muted">—</span>
            ),
          shift_started_at: (v) =>
            v ? <Time value={v} /> : <span className="muted">—</span>,
          occurred_at: (v) =>
            v ? <Time value={v} /> : <span className="muted">—</span>,
        }}
        onData={onData}
        action={(row) => (
          <Space size={4} wrap>
            <Button
              size="small"
              onClick={() =>
                navigate(`/organization/${app.organizationId}/drivers/${row.id}`)
              }
            >
              {app.t("Driver details")}
            </Button>
            {text(row.vehicle_id) && (
              <Button
                size="small"
                onClick={() =>
                  navigate(
                    `/organization/${app.organizationId}/vehicles/${row.vehicle_id}`,
                  )
                }
              >
                {app.t("Open vehicle")}
              </Button>
            )}
          </Space>
        )}
      />
    </div>
  );
}
function Photo({ id }: { id: string }) {
  const app = useApp(),
    [link, setLink] = useState<ReturnType<typeof privateFileLink> | null>(null),
    [error, setError] = useState<unknown>(null),
    [legacy, setLegacy] = useState(false);
  const scope = useRef(0);
  useEffect(() => {
    scope.current++;
    setLink(null);
    setError(null);
    setLegacy(false);
    return () => {
      scope.current++;
    };
  }, [app.organizationId, id]);
  const load = async () => {
    const currentScope = scope.current;
    setError(null);
    try {
      const r = await api<Row>(
        orgPath(app.organizationId, `/drivers/${segment(id)}/photo`),
        { sensitive: true },
      );
      if (currentScope !== scope.current) return;
      if (r.data.reupload_required) setLegacy(true);
      else setLink(privateFileLink(r.data.link));
    } catch (e) {
      if (currentScope === scope.current) setError(e);
    }
  };
  useEffect(() => {
    if (!link) return;
    const timer = window.setTimeout(
      () => setLink(null),
      Math.max(0, link.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [link]);
  return (
    <Card title={app.t("Private photo")}>
      <div className="stack">
        <ErrorNotice error={error} />
        {legacy && (
          <Alert
            type="warning"
            title={app.t(
              "Legacy photo requires an authorized reupload. The original private file is preserved.",
            )}
          />
        )}
        {link ? (
          <>
            <Image
              src={link.url}
              alt={app.t("Private driver photograph")}
              referrerPolicy="no-referrer"
              preview={false}
              onError={() => setLink(null)}
            />
            <Button onClick={() => setLink(null)}>
              {app.t("Clear photo")}
            </Button>
          </>
        ) : (
          <Button onClick={() => void load()}>
            {app.t("Request authorized photo")}
          </Button>
        )}
      </div>
    </Card>
  );
}
function TripDetailDrawer({
  segmentId,
  initialSegment,
  path,
  onClose,
}: {
  segmentId: string;
  initialSegment?: Row;
  path: string;
  onClose: () => void;
}) {
  const app = useApp();
  const mapAnchorRef = useRef<HTMLDivElement | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);

  const tripQ = useData(
    `${path}/trips/${segment(segmentId)}`,
    {},
    Boolean(segmentId),
  );

  const seg = useMemo(() => {
    const fetched = object(tripQ.data?.data.segment);
    return Object.keys(fetched).length ? fetched : (initialSegment ?? {});
  }, [tripQ.data, initialSegment]);

  const rawSamples = useMemo(
    () => rows(tripQ.data?.data.samples),
    [tripQ.data],
  );
  const safetyEvents = useMemo(
    () => rows(tripQ.data?.data.safety_events),
    [tripQ.data],
  );

  const enrichedSamples = useMemo(
    () => enrichRowsWithTelemetryAndSafety(rawSamples, [], safetyEvents),
    [rawSamples, safetyEvents],
  );

  const stats = useMemo(() => {
    const gpsRows = coordinates(enrichedSamples);
    const speeds = enrichedSamples
      .map((r) => finiteNumber(r.speed_kmh))
      .filter((v): v is number => v !== null);
    const startMs = Date.parse(text(seg.first_own_observation_at));
    const endMs = Date.parse(text(seg.last_own_observation_at));
    const durationSec =
      Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
        ? Math.round((endMs - startMs) / 1000)
        : null;
    const dist = finiteNumber(seg.distance_km_estimate);
    const harshBraking = safetyEvents.filter(
      (e) => e.kind === "harsh_braking",
    ).length;
    const harshAccel = safetyEvents.filter(
      (e) => e.kind === "rapid_acceleration" || e.kind === "harsh_acceleration",
    ).length;

    return {
      gpsCount: gpsRows.length,
      totalSamples: enrichedSamples.length,
      maxSpeed: speeds.length ? Math.max(...speeds) : null,
      avgSpeed: speeds.length
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : null,
      durationSec,
      dist,
      harshBraking,
      harshAccel,
      totalHarsh: harshBraking + harshAccel,
    };
  }, [enrichedSamples, seg, safetyEvents]);

  const locateOnMap = useCallback((row: Row) => {
    setFocusKey(rowPointKey(row));
    setFocusNonce((n) => n + 1);
    mapAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const vehiclePlate =
    text(seg.registration_number) ||
    [text(seg.make), text(seg.model)].filter(Boolean).join(" ") ||
    text(seg.vehicle_id) ||
    "—";

  return (
    <Drawer
      title={app.t("Trip Details — Speed & Harsh Driving Route")}
      open
      size={880}
      onClose={onClose}
    >
      <div className="stack">
        <ErrorNotice error={tripQ.error} />
        <Card size="small" loading={tripQ.isPending && !rawSamples.length}>
          <GridRow gutter={[16, 12]}>
            <Col xs={12} sm={8} md={4}>
              <Statistic title={app.t("Vehicle")} value={vehiclePlate} />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("Duration")}
                value={
                  stats.durationSec !== null
                    ? formatDurationSeconds(stats.durationSec)
                    : "—"
                }
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("Distance estimate")}
                value={
                  stats.dist !== null ? Number(stats.dist.toFixed(2)) : "—"
                }
                suffix={stats.dist !== null ? "km" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("GPS points")}
                value={`${stats.gpsCount} / ${stats.totalSamples}`}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("Max speed")}
                value={
                  stats.maxSpeed !== null
                    ? Number(stats.maxSpeed.toFixed(1))
                    : "—"
                }
                suffix={stats.maxSpeed !== null ? "km/h" : undefined}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic
                title={app.t("Harsh events")}
                value={stats.totalHarsh}
                styles={
                  stats.totalHarsh > 0
                    ? { content: { color: "#cf1322" } }
                    : undefined
                }
              />
            </Col>
          </GridRow>
        </Card>

        <div ref={mapAnchorRef}>
          <Card
            title={app.t("Trip Route & Danger Points")}
            size="small"
            loading={tripQ.isPending}
          >
            <CoordinateMap
              items={enrichedSamples}
              mode="route"
              focusRowKey={focusKey}
              focusNonce={focusNonce}
              onSelect={(row) => locateOnMap(row)}
            />
          </Card>
        </div>

        <Card
          title={app.t("Safety Events in This Trip")}
          size="small"
          loading={tripQ.isPending}
        >
          {safetyEvents.length > 0 ? (
            <Table<Row>
              size="small"
              rowKey={(r) => text(r.id) || rowPointKey(r)}
              dataSource={safetyEvents}
              pagination={safetyEvents.length > 8 ? { pageSize: 8 } : false}
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
                    const k = text(row.kind);
                    if (k === "harsh_braking")
                      return <Tag color="error">{app.t("Harsh braking")}</Tag>;
                    if (
                      k === "rapid_acceleration" ||
                      k === "harsh_acceleration"
                    )
                      return (
                        <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                      );
                    return <Tag>{k}</Tag>;
                  },
                },
                {
                  title: app.t("Delta speed"),
                  dataIndex: "delta_speed_kmh",
                  key: "delta_speed_kmh",
                  render: (v: unknown) => {
                    const n = finiteNumber(v);
                    return n !== null
                      ? `${n > 0 ? "+" : ""}${n.toFixed(1)} km/h`
                      : "—";
                  },
                },
                {
                  title: app.t("Acceleration"),
                  key: "acceleration",
                  render: (_: unknown, row: Row) => {
                    const a = finiteNumber(row.acceleration_ms2);
                    const g = finiteNumber(row.max_acceleration_g);
                    if (a !== null) return `${a.toFixed(2)} m/s²`;
                    if (g !== null) return `${g.toFixed(2)} g`;
                    return "—";
                  },
                },
                {
                  title: app.t("Coordinates"),
                  key: "coords",
                  render: (_: unknown, row: Row) => {
                    const lat = finiteNumber(row.latitude);
                    const lon = finiteNumber(row.longitude);
                    return lat !== null && lon !== null ? (
                      <span className="reference">
                        {lat.toFixed(5)}, {lon.toFixed(5)}
                      </span>
                    ) : (
                      <span className="muted">{app.t("No GPS fix")}</span>
                    );
                  },
                },
                {
                  title: app.t("Map"),
                  key: "locate",
                  render: (_: unknown, row: Row) => {
                    const lat = finiteNumber(row.latitude);
                    const lon = finiteNumber(row.longitude);
                    return lat !== null && lon !== null ? (
                      <Button size="small" onClick={() => locateOnMap(row)}>
                        {app.t("Locate danger")}
                      </Button>
                    ) : (
                      <span className="muted">—</span>
                    );
                  },
                },
              ]}
            />
          ) : (
            <Alert
              type="success"
              showIcon
              title={app.t(
                "No harsh braking or rapid acceleration events detected in this trip.",
              )}
            />
          )}
        </Card>

        <Card
          title={app.t("Sample Timeline")}
          size="small"
          loading={tripQ.isPending}
        >
          <Table<Row>
            size="small"
            rowKey={rowPointKey}
            dataSource={enrichedSamples}
            pagination={enrichedSamples.length > 10 ? { pageSize: 10 } : false}
            scroll={{ x: "max-content" }}
            columns={[
              {
                title: app.t("Occurred at"),
                dataIndex: "occurred_at",
                key: "occurred_at",
                render: (v: unknown) => <Time value={v} />,
              },
              {
                title: app.t("Speed"),
                dataIndex: "speed_kmh",
                key: "speed_kmh",
                render: (v: unknown) => {
                  const n = finiteNumber(v);
                  return n !== null ? `${n.toFixed(1)} km/h` : "—";
                },
              },
              {
                title: app.t("Engine RPM"),
                dataIndex: "engine_rpm",
                key: "engine_rpm",
                render: (v: unknown) => {
                  const n = finiteNumber(v);
                  return n !== null ? `${Math.round(n)} rpm` : "—";
                },
              },
              {
                title: app.t("Events"),
                key: "events",
                render: (_: unknown, row: Row) => {
                  const s = getSafetySummary(row);
                  if (!s.hasDangerEvent)
                    return <span className="muted">—</span>;
                  return (
                    <Space size={4}>
                      {s.harshBraking && (
                        <Tag color="error">{app.t("Harsh braking")}</Tag>
                      )}
                      {s.rapidAcceleration && (
                        <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                      )}
                    </Space>
                  );
                },
              },
              {
                title: app.t("Coordinates"),
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
                      {app.t("Locate on map")}
                    </Button>
                  ) : (
                    <span className="muted">—</span>
                  ),
              },
            ]}
          />
        </Card>

        <Card title={app.t("Trip Metadata")} size="small">
          <Details data={seg} />
        </Card>
      </div>
    </Drawer>
  );
}

function DriverRecords({ path }: { path: string }) {
  const app = useApp();
  const mapAnchorRef = useRef<HTMLDivElement | null>(null);
  const [records, setRecords] = useState<Row[]>([]);
  const [inspectedRecord, setInspectedRecord] = useState<Row | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);

  const safetyQ = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "driver-records-safety-events",
    ],
    enabled: app.feature("safety"),
    queryFn: ({ signal }) =>
      fetchPagedList(`${path}/events`, { per_page: 100 }, signal, 10),
    retry: false,
  });

  const enrichedRecords = useMemo(() => {
    return enrichRowsWithTelemetryAndSafety(
      records,
      [],
      safetyQ.data?.items ?? [],
    );
  }, [records, safetyQ.data]);

  const stats = useMemo(() => {
    const gpsCount = coordinates(enrichedRecords).length;
    const speeds = enrichedRecords
      .map((r) => finiteNumber(r.speed_kmh))
      .filter((v): v is number => v !== null);
    const dangerRows = enrichedRecords.filter(
      (r) => getSafetySummary(r).hasDangerEvent,
    );
    const harshBraking = dangerRows.filter(
      (r) => getSafetySummary(r).harshBraking,
    ).length;
    const harshAccel = dangerRows.filter(
      (r) => getSafetySummary(r).rapidAcceleration,
    ).length;
    return {
      gpsCount,
      totalCount: enrichedRecords.length,
      maxSpeed: speeds.length ? Math.max(...speeds) : null,
      avgSpeed: speeds.length
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : null,
      harshBraking,
      harshAccel,
      totalHarsh: dangerRows.length,
    };
  }, [enrichedRecords]);

  const locateOnMap = useCallback((row: Row) => {
    setFocusKey(rowPointKey(row));
    setFocusNonce((n) => n + 1);
    mapAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  return (
    <div className="stack">
      <PageTitle
        title={app.t("records")}
        subtitle={app.t(
          "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.",
        )}
      />

      <div ref={mapAnchorRef}>
        <Card
          title={app.t("Driving Route & Harsh Events Map")}
          size="small"
          extra={
            <Space wrap>
              {stats.harshBraking > 0 && (
                <Tag color="error">
                  {stats.harshBraking} {app.t("Harsh braking")}
                </Tag>
              )}
              {stats.harshAccel > 0 && (
                <Tag color="warning">
                  {stats.harshAccel} {app.t("Harsh acceleration")}
                </Tag>
              )}
              {stats.gpsCount > 0 && (
                <Tag color="blue">
                  {stats.gpsCount} {app.t("GPS points")}
                </Tag>
              )}
            </Space>
          }
        >
          <CoordinateMap
            items={enrichedRecords}
            mode="route"
            focusRowKey={focusKey}
            focusNonce={focusNonce}
            onSelect={(row) => {
              setInspectedRecord(row);
              locateOnMap(row);
            }}
          />
        </Card>
      </div>

      <Directory
        path={`${path}/records`}
        query={{ per_page: 50 }}
        fields={[
          "occurred_at",
          "registration_number",
          "speed_kmh",
          "engine_rpm",
          "latitude",
          "longitude",
          "fuel_rate_lph",
          "quality",
        ]}
        onData={setRecords}
        render={{
          speed_kmh: (v: unknown, row: Row) => {
            const n = finiteNumber(v);
            const s = getSafetySummary(row);
            return (
              <Space size={4}>
                <span>{n !== null ? `${n.toFixed(1)} km/h` : "—"}</span>
                {s.harshBraking && (
                  <Tag color="error">{app.t("Harsh braking")}</Tag>
                )}
                {s.rapidAcceleration && (
                  <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                )}
              </Space>
            );
          },
        }}
        action={(row) => (
          <Button
            size="small"
            onClick={() => {
              setInspectedRecord(row);
              locateOnMap(row);
            }}
          >
            {app.t("Inspect")}
          </Button>
        )}
      />

      {inspectedRecord && (
        <Drawer
          open
          size={640}
          title={app.t("Driving Record Details")}
          onClose={() => setInspectedRecord(null)}
        >
          <div className="stack">
            {getSafetySummary(inspectedRecord).hasDangerEvent && (
              <Alert
                type="warning"
                showIcon
                title={app.t("Harsh driving event detected at this sample")}
                description={
                  <Space wrap size={8} style={{ marginTop: 4 }}>
                    {getSafetySummary(inspectedRecord).harshBraking && (
                      <Tag color="error">{app.t("Harsh braking")}</Tag>
                    )}
                    {getSafetySummary(inspectedRecord).rapidAcceleration && (
                      <Tag color="warning">{app.t("Harsh acceleration")}</Tag>
                    )}
                    {getSafetySummary(inspectedRecord).accelerationMs2 !==
                      null && (
                      <span>
                        {app.t("Acceleration")}:{" "}
                        {getSafetySummary(
                          inspectedRecord,
                        ).accelerationMs2!.toFixed(2)}{" "}
                        m/s²
                      </span>
                    )}
                  </Space>
                }
              />
            )}
            {coordinates([inspectedRecord]).length > 0 && (
              <Button
                type="primary"
                onClick={() => {
                  locateOnMap(inspectedRecord);
                  setInspectedRecord(null);
                }}
              >
                {app.t("Focus on map")}
              </Button>
            )}
            <Details data={inspectedRecord} />
          </div>
        </Drawer>
      )}
    </div>
  );
}

function DriverTrips({ path }: { path: string }) {
  const app = useApp();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const tripsQ = useData(`${path}/trips`, { per_page: 50 });
  const tripItems = rows(tripsQ.data?.data.items);
  const newestSegment = tripItems[0] as Row | undefined;
  const newestSegmentId = text(newestSegment?.segment_id);

  const latestTripQ = useData(
    `${path}/trips/${segment(newestSegmentId)}`,
    {},
    Boolean(newestSegmentId),
  );

  const latestSeg = useMemo(() => {
    const fetched = object(latestTripQ.data?.data.segment);
    return Object.keys(fetched).length ? fetched : (newestSegment ?? {});
  }, [latestTripQ.data, newestSegment]);

  const latestSamples = useMemo(
    () => rows(latestTripQ.data?.data.samples),
    [latestTripQ.data],
  );
  const latestEvents = useMemo(
    () => rows(latestTripQ.data?.data.safety_events),
    [latestTripQ.data],
  );
  const latestEnriched = useMemo(
    () => enrichRowsWithTelemetryAndSafety(latestSamples, [], latestEvents),
    [latestSamples, latestEvents],
  );

  const latestStats = useMemo(() => {
    const startMs = Date.parse(text(latestSeg.first_own_observation_at));
    const endMs = Date.parse(text(latestSeg.last_own_observation_at));
    const durationSec =
      Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
        ? Math.round((endMs - startMs) / 1000)
        : null;
    const dist = finiteNumber(latestSeg.distance_km_estimate);
    const sampleCount =
      finiteNumber(latestSeg.sample_count) ?? latestSamples.length;
    const harshCount =
      latestEvents.length ||
      latestEnriched.filter((r) => getSafetySummary(r).hasDangerEvent).length;

    return {
      durationSec,
      dist,
      sampleCount,
      harshCount,
      vehicle:
        text(latestSeg.registration_number) ||
        [text(latestSeg.make), text(latestSeg.model)]
          .filter(Boolean)
          .join(" ") ||
        text(latestSeg.vehicle_id) ||
        "—",
    };
  }, [latestSeg, latestSamples, latestEvents, latestEnriched]);

  return (
    <div className="stack">
      <PageTitle
        title={app.t("trips")}
        subtitle={app.t(
          "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.",
        )}
      />

      <ErrorNotice error={tripsQ.error} />

      {tripsQ.isPending && !tripItems.length ? (
        <Card
          title={app.t("Latest Trip — Speed & Harsh Driving Route")}
          loading
        />
      ) : tripItems.length === 0 ? (
        <Alert
          type="info"
          showIcon
          title={app.t("No trips recorded yet.")}
          description={app.t(
            "Trip segments appear here after your authorized shift observes movement intersecting automatic vehicle journeys.",
          )}
        />
      ) : (
        <Card
          title={app.t("Latest Trip — Speed & Harsh Driving Route")}
          loading={latestTripQ.isPending && !latestSamples.length}
          extra={
            <Button
              size="small"
              type="primary"
              onClick={() => setSelectedTripId(newestSegmentId)}
            >
              {app.t("Inspect full trip")}
            </Button>
          }
        >
          <div className="stack">
            <ErrorNotice error={latestTripQ.error} />
            <GridRow gutter={[16, 12]}>
              <Col xs={12} sm={8} md={4}>
                <Statistic
                  title={app.t("Vehicle")}
                  value={latestStats.vehicle}
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic
                  title={app.t("Duration")}
                  value={
                    latestStats.durationSec !== null
                      ? formatDurationSeconds(latestStats.durationSec)
                      : "—"
                  }
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic
                  title={app.t("Distance estimate")}
                  value={
                    latestStats.dist !== null
                      ? Number(latestStats.dist.toFixed(2))
                      : "—"
                  }
                  suffix={latestStats.dist !== null ? "km" : undefined}
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic
                  title={app.t("Telemetry samples")}
                  value={latestStats.sampleCount}
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic
                  title={app.t("Harsh events")}
                  value={latestStats.harshCount}
                  styles={
                    latestStats.harshCount > 0
                      ? { content: { color: "#cf1322" } }
                      : undefined
                  }
                />
              </Col>
            </GridRow>
            <CoordinateMap
              items={latestEnriched}
              mode="route"
              onSelect={() => setSelectedTripId(newestSegmentId)}
            />
          </div>
        </Card>
      )}

      <Directory
        path={`${path}/trips`}
        query={{ per_page: 50 }}
        fields={[
          "first_own_observation_at",
          "last_own_observation_at",
          "registration_number",
          "vehicle_id",
          "quality",
        ]}
        render={{
          registration_number: (v: unknown, row: Row) => {
            const plate = text(v);
            const makeModel = [text(row.make), text(row.model)]
              .filter(Boolean)
              .join(" ");
            return (
              <span>
                {plate || text(row.vehicle_id) || "—"}
                {makeModel && (
                  <span className="muted" style={{ marginLeft: 6 }}>
                    ({makeModel})
                  </span>
                )}
              </span>
            );
          },
          first_own_observation_at: (v: unknown) => <Time value={v} />,
          last_own_observation_at: (v: unknown) => <Time value={v} />,
        }}
        action={(row) => (
          <Button
            size="small"
            onClick={() => setSelectedTripId(text(row.segment_id))}
          >
            {app.t("Inspect")}
          </Button>
        )}
      />

      {selectedTripId && (
        <TripDetailDrawer
          segmentId={selectedTripId}
          initialSegment={tripItems.find(
            (t) => text(t.segment_id) === selectedTripId,
          )}
          path={path}
          onClose={() => setSelectedTripId(null)}
        />
      )}
    </div>
  );
}

const ECO_COACH_CATEGORY_META: Record<
  string,
  { color: string; labelKey: string }
> = {
  idle: { color: "gold", labelKey: "Idle" },
  braking: { color: "volcano", labelKey: "Braking" },
  acceleration: { color: "orange", labelKey: "Acceleration" },
  speed: { color: "blue", labelKey: "Speed" },
  smoothness: { color: "green", labelKey: "Smoothness" },
  general: { color: "geekblue", labelKey: "General" },
};

function roundMetric(value: unknown, decimals = 2): number | null {
  const n = finiteNumber(value);
  return n !== null ? Number(n.toFixed(decimals)) : null;
}

/**
 * Interactive transient AI card for the Driver Portal that requests
 * eco-driving & fuel coaching without persisting model output.
 */
function DriverEcoCoachCard() {
  const app = useApp();
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<Row | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setBusy(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [app.organizationId]);

  const clearResult = () => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setBusy(false);
  };

  const requestCoach = async () => {
    if (busy || !app.organizationId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api<Row>(
        orgPath(app.organizationId, "/driver/me/eco-coach-ai"),
        {
          method: "POST",
          body: { days },
          sensitive: true,
          readOnlyAction: true,
          signal: controller.signal,
        },
      );
      if (!controller.signal.aborted) {
        setResult(object(res.data));
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e);
      }
    } finally {
      if (abortRef.current === controller) {
        setBusy(false);
      }
    }
  };

  const summaryText = text(result?.encouragement_summary);
  const snapshot = object(result?.efficiency_snapshot);
  const savings = object(result?.potential_savings);
  const tips = rows(result?.coaching_tips);

  const distanceKm = roundMetric(snapshot.distance_km, 2);
  const fuelLitres = roundMetric(snapshot.fuel_litres, 2);
  const co2Kg = roundMetric(snapshot.co2_kg, 2);
  const litresPer100Km = roundMetric(snapshot.litres_per_100km, 2);
  const idleMinutes = roundMetric(snapshot.idle_minutes, 1);
  const safetyScore = roundMetric(snapshot.safety_score, 1);

  const savedFuelLitres = roundMetric(savings.fuel_litres, 2);
  const savedCo2Kg = roundMetric(savings.co2_kg, 2);
  const savingsNote = text(savings.note);
  const hasSavings =
    savedFuelLitres !== null || savedCo2Kg !== null || savingsNote !== "";

  return (
    <Card
      title={app.t("Personal Eco-Driving & Fuel Coach")}
      extra={<GeminiPoweredBadge />}
    >
      <div className="stack">
        <div className="ai-hints-panel">
          <div className="ai-hints-bar" aria-hidden="true" />
          <div className="ai-hints-header">
            <Typography.Text strong>
              {app.t("Personalized fuel-saving and smooth-driving insights")}
            </Typography.Text>
          </div>
          <Typography.Text type="secondary">
            {app.t(
              "Review your recent driving efficiency and receive practical, encouraging tips tailored to your trips.",
            )}
          </Typography.Text>
          <Space wrap align="center">
            <Space size={8} align="center">
              <Typography.Text>{app.t("Period")}</Typography.Text>
              <Select<7 | 14 | 30>
                value={days}
                onChange={(value) => setDays(value)}
                disabled={busy}
                style={{ width: 136 }}
                aria-label={app.t("Period")}
                options={[
                  { value: 7, label: app.t("7 days") },
                  { value: 14, label: app.t("14 days") },
                  { value: 30, label: app.t("30 days") },
                ]}
              />
            </Space>
            <Button
              type="primary"
              loading={busy}
              disabled={busy}
              onClick={() => void requestCoach()}
            >
              {app.t("Get Personal Eco-Driving Coach")}
            </Button>
            {result && (
              <Button disabled={busy} onClick={clearResult}>
                {app.t("Close")}
              </Button>
            )}
          </Space>
        </div>

        <ErrorNotice error={error} />

        {result && (
          <div className="transient-result ai-hints-result">
            <div className="ai-hints-bar" aria-hidden="true" />
            <div className="stack">
              {summaryText && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <Typography.Text strong>
                    {app.t("Coach summary")}
                  </Typography.Text>
                  <Typography.Paragraph
                    style={{ marginTop: 4, marginBottom: 0 }}
                  >
                    {summaryText}
                  </Typography.Paragraph>
                </div>
              )}

              <div>
                <Typography.Text strong>
                  {app.t("Efficiency snapshot")}
                </Typography.Text>
                <GridRow gutter={[16, 12]} style={{ marginTop: 8 }}>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Distance")}
                      value={distanceKm ?? "—"}
                      suffix={distanceKm !== null ? "km" : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Fuel used")}
                      value={fuelLitres ?? "—"}
                      suffix={fuelLitres !== null ? "L" : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Estimated CO₂")}
                      value={co2Kg ?? "—"}
                      suffix={co2Kg !== null ? "kg" : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Fuel economy")}
                      value={litresPer100Km ?? "—"}
                      suffix={litresPer100Km !== null ? "L/100 km" : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Idle time")}
                      value={idleMinutes ?? "—"}
                      suffix={idleMinutes !== null ? app.t("min") : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic
                      title={app.t("Safety score")}
                      value={
                        safetyScore !== null
                          ? safetyScore
                          : app.t("Unavailable")
                      }
                      suffix={safetyScore !== null ? "/ 100" : undefined}
                    />
                  </Col>
                </GridRow>
              </div>

              {hasSavings && (
                <Alert
                  type="success"
                  showIcon
                  title={app.t("Potential savings")}
                  description={
                    <div className="stack" style={{ gap: 6 }}>
                      {(savedFuelLitres !== null || savedCo2Kg !== null) && (
                        <Space wrap size={16}>
                          {savedFuelLitres !== null && (
                            <Typography.Text strong>
                              {app.t("Fuel savings")}: {savedFuelLitres} L
                            </Typography.Text>
                          )}
                          {savedCo2Kg !== null && (
                            <Typography.Text strong>
                              {app.t("CO₂ reduction")}: {savedCo2Kg} kg CO₂
                            </Typography.Text>
                          )}
                        </Space>
                      )}
                      {savingsNote && (
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          {savingsNote}
                        </Typography.Paragraph>
                      )}
                    </div>
                  }
                />
              )}

              {tips.length > 0 && (
                <div>
                  <Typography.Text strong>
                    {app.t("Coaching tips")}
                  </Typography.Text>
                  <GridRow gutter={[12, 12]} style={{ marginTop: 8 }}>
                    {tips.map((item, index) => {
                      const rawCategory = text(item.category).toLowerCase();
                      const meta = ECO_COACH_CATEGORY_META[rawCategory] ?? {
                        color: "default",
                        labelKey: "General",
                      };
                      const tipTitle = text(item.title);
                      const tipBody = text(item.tip);
                      const benefit = text(item.estimated_benefit);
                      return (
                        <Col
                          xs={24}
                          md={tips.length === 1 ? 24 : 12}
                          key={`${rawCategory}-${tipTitle}-${index}`}
                        >
                          <Card size="small" style={{ height: "100%" }}>
                            <div className="stack" style={{ gap: 6 }}>
                              <Space wrap size={6}>
                                <Tag color={meta.color}>
                                  {app.t(meta.labelKey)}
                                </Tag>
                                {benefit && (
                                  <Tag color="success">{benefit}</Tag>
                                )}
                              </Space>
                              {tipTitle && (
                                <Typography.Text strong>
                                  {tipTitle}
                                </Typography.Text>
                              )}
                              {tipBody && (
                                <Typography.Paragraph
                                  style={{ marginBottom: 0 }}
                                >
                                  {tipBody}
                                </Typography.Paragraph>
                              )}
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </GridRow>
                </div>
              )}

              <div className="ai-hints-result-footer">
                <div className="ai-hints-powered">
                  <GeminiPoweredBadge />
                  <span>
                    {app.t(
                      "Advisory only — generated by Google Gemini and not stored by CarLink.",
                    )}
                  </span>
                </div>
                <Button onClick={clearResult}>{app.t("Close")}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function DriverPortal({ page }: { page: string }) {
  const app = useApp(),
    path = orgPath(app.organizationId, "/driver/me"),
    profile = useData(`${path}/profile`);
  if (page === "events" || page === "appeals")
    return <Safety own appeals={page === "appeals"} />;
  if (page === "score")
    return app.feature("safety") ? (
      <div className="stack">
        <PageTitle
          title={app.t("score")}
          subtitle={app.t(
            "Only your retained, server-authorized safety score. Approved appeals are excluded.",
          )}
        />
        <SafetyScoreCard
          path={`${path}/score`}
          enabled={!app.subscriptionPending && app.feature("safety")}
          title={app.t("My safety score")}
        />
      </div>
    ) : (
      <Alert
        type="info"
        title={app.t(
          "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.",
        )}
      />
    );
  if (page === "records") return <DriverRecords path={path} />;
  if (page === "trips") return <DriverTrips path={path} />;
  return (
    <div className="stack">
      <PageTitle
        title={app.t(
          page === "overview"
            ? "myOverview"
            : page === "vehicle-info"
              ? "vehicleInfo"
              : page,
        )}
        subtitle={app.t(
          "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.",
        )}
      />
      <ErrorNotice error={profile.error} />
      {page === "overview" ? (
        <>
          <Card title={app.t("Own driver profile")}>
            <Details data={object(profile.data?.data.driver)} />
          </Card>
          {!app.subscriptionPending && app.feature("safety") && (
            <SafetyScoreCard
              path={`${path}/score`}
              enabled
              title={app.t("My current safety score")}
              compact
            />
          )}
          {profile.data && (
            <Photo id={text(object(profile.data.data.driver).id)} />
          )}
          <Snapshot
            title={app.t("Currently NFC-authorized vehicle")}
            path={`${path}/vehicle-info`}
          />
          {app.can("profile.own") && <DriverEcoCoachCard />}
        </>
      ) : (
        <>
          <Snapshot path={`${path}/${page}`} />
          {page === "energy" && app.can("profile.own") && (
            <DriverEcoCoachCard />
          )}
        </>
      )}
    </div>
  );
}
