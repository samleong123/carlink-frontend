import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Progress,
  Row as GridRow,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AimOutlined,
  AlertOutlined,
  CarOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  EyeOutlined,
  FireOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "../app/context";
import { api, downloadBlob, orgPath } from "../api/client";
import { directoryRows } from "../api/adapters";
import { object, rows, text, type ListData, type Row } from "../api/types";
import { CoordinateMap } from "../components/CoordinateMap";
import {
  dayjs,
  Directory,
  ErrorNotice,
  GeminiPoweredBadge,
  Metrics,
  PageTitle,
  Time,
  TimeWindow,
  Value,
  useData,
  useTelemetryRefreshMs,
  windowQuery,
} from "../components/shared";

function signalQuality(rsrp: unknown): { label: string; color: string } {
  if (rsrp === null || rsrp === undefined || !Number.isFinite(Number(rsrp)))
    return { label: "unknown", color: "default" };
  const dbm = Number(rsrp);
  if (dbm >= -90) return { label: "Good", color: "success" };
  if (dbm >= -105) return { label: "Fair", color: "warning" };
  return { label: "Weak", color: "error" };
}

function httpStatusTag(value: unknown, unknownLabel: string) {
  const raw = text(value);
  if (value === null || value === undefined || raw === "") {
    return <span className="muted">{unknownLabel}</span>;
  }
  const code = Number(value);
  if (!Number.isFinite(code)) {
    return <Tag>{raw}</Tag>;
  }
  const color =
    code >= 500
      ? "error"
      : code >= 400
        ? "warning"
        : code >= 300
          ? "processing"
          : code >= 200
            ? "success"
            : "default";
  return <Tag color={color}>{code}</Tag>;
}

function outcomeTag(value: unknown, translate: (k: string) => string) {
  const key = text(value) || "unknown";
  const color =
    key === "succeeded"
      ? "success"
      : key === "failed"
        ? "error"
        : key === "denied"
          ? "warning"
          : key === "attempted"
            ? "processing"
            : "default";
  return <Tag color={color}>{translate(key)}</Tag>;
}

export function Coverage() {
  const app = useApp(),
    path = orgPath(app.organizationId, "/coverage-map"),
    [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().subtract(1, "hour"),
      dayjs(),
    ]),
    [search, setSearch] = useState(""),
    [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const { pollMs } = useTelemetryRefreshMs(true);
  const windowParams = windowQuery(range);
  const q = useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      path,
      windowParams,
    ],
    queryFn: async ({ signal }) => {
      const items: Row[] = [];
      let nextCursor: string | undefined;
      let timestamp = "";
      let truncated = false;
      for (let page = 0; page < 50; page++) {
        const res = await api<ListData>(path, {
          query: { ...windowParams, per_page: 200, cursor: nextCursor },
          signal,
        });
        const pageRows = directoryRows(res.data.items, res.request_id, {
          path,
          httpStatus: res.status,
        });
        items.push(...pageRows);
        timestamp = res.timestamp;
        const cursorToken = res.data.pagination?.next_cursor || undefined;
        if (!cursorToken || cursorToken === nextCursor) {
          break;
        }
        nextCursor = cursorToken;
        if (page === 49) truncated = true;
      }
      return { items, timestamp, truncated };
    },
    retry: false,
    refetchInterval: (query) => (query.state.error ? false : pollMs || false),
    refetchIntervalInBackground: false,
  });
  const points = q.data?.items ?? [];
  const filtered = points
    .filter((row) => {
      if (!search.trim()) return true;
      const net = object(row.network_data);
      const haystack = [
        row.occurred_at,
        row.vehicle_id,
        row.registration_number,
        net.operator,
        net.network_type,
        net.registered_plmn,
        net.cell_id,
        net.tac,
        net.lte_band,
        net.rsrp_dbm,
        net.sinr_db,
      ]
        .map(text)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const ta = Date.parse(text(a.occurred_at)) || 0;
      const tb = Date.parse(text(b.occurred_at)) || 0;
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });
  const exportCsv = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api<Row>(path, {
        query: { ...windowParams, export: true },
      });
      if (typeof r.data.csv !== "string")
        throw new Error(app.t("Invalid CSV response"));
      downloadBlob(
        new Blob([r.data.csv], {
          type: text(r.data.content_type) || "text/csv",
        }),
        text(r.data.filename) || "coverage.csv",
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      <PageTitle
        title={app.t("coverage")}
        subtitle={app.t(
          "Raw RSRP/SINR and operator observations — not a calibrated radio survey.",
        )}
        extra={
          app.can("coverage.export") && (
            <Button onClick={() => void exportCsv()} loading={busy}>
              {app.t("Export server CSV")}
            </Button>
          )
        }
      />
      <TimeWindow value={range} onChange={setRange} />
      <ErrorNotice error={error} />
      <Card title={app.t("Loaded observation coordinates")}>
        <CoordinateMap items={filtered} coverage />
      </Card>
      <Card className="directory">
        <div className="table-toolbar">
          <Input.Search
            allowClear
            aria-label={app.t("search")}
            placeholder={app.t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Space wrap>
            <Select<"desc" | "asc">
              aria-label={app.t("Sort order")}
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "desc", label: app.t("Sort: Newest first") },
                { value: "asc", label: app.t("Sort: Oldest first") },
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              loading={q.isFetching}
              onClick={() => void q.refetch()}
            >
              {app.t("refresh")}
            </Button>
          </Space>
        </div>
        <ErrorNotice error={q.error} />
        <Table<Row>
          rowKey={(r) => text(r.id) || JSON.stringify(r)}
          dataSource={filtered}
          loading={q.isPending}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100", "200"],
          }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: app.t("Occurred at"),
              dataIndex: "occurred_at",
              key: "occurred_at",
              sorter: (a: Row, b: Row) =>
                (Date.parse(text(a.occurred_at)) || 0) -
                (Date.parse(text(b.occurred_at)) || 0),
              render: (v: unknown) => <Time value={v} />,
            },
            {
              title: app.t("Vehicle"),
              dataIndex: "vehicle_id",
              key: "vehicle_id",
              render: (v: unknown, row: Row) =>
                text(row.registration_number) || (
                  <span className="reference">
                    {text(v) || app.t("unknown")}
                  </span>
                ),
            },
            {
              title: app.t("Operator"),
              key: "operator",
              render: (_: unknown, row: Row) =>
                text(object(row.network_data).operator) || (
                  <span className="muted">{app.t("unknown")}</span>
                ),
            },
            {
              title: app.t("Network type"),
              key: "network_type",
              render: (_: unknown, row: Row) =>
                text(object(row.network_data).network_type) || (
                  <span className="muted">{app.t("unknown")}</span>
                ),
            },
            {
              title: app.t("PLMN"),
              key: "registered_plmn",
              render: (_: unknown, row: Row) => {
                const v = text(object(row.network_data).registered_plmn);
                return v ? (
                  <span className="reference">{v}</span>
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("Cell ID"),
              key: "cell_id",
              render: (_: unknown, row: Row) => {
                const v = text(object(row.network_data).cell_id);
                return v ? (
                  <span className="reference">{v}</span>
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("TAC"),
              key: "tac",
              render: (_: unknown, row: Row) => {
                const v = text(object(row.network_data).tac);
                return v ? (
                  <span className="reference">{v}</span>
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("Band"),
              key: "lte_band",
              render: (_: unknown, row: Row) => {
                const v = object(row.network_data).lte_band;
                return v !== null && v !== undefined && text(v) !== "" ? (
                  text(v)
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("Signal quality"),
              key: "signal_quality",
              render: (_: unknown, row: Row) => {
                const quality = signalQuality(
                  object(row.network_data).rsrp_dbm,
                );
                return <Tag color={quality.color}>{app.t(quality.label)}</Tag>;
              },
            },
            {
              title: app.t("RSRP (dBm)"),
              key: "rsrp_dbm",
              render: (_: unknown, row: Row) => {
                const v = object(row.network_data).rsrp_dbm;
                return v !== null && v !== undefined && text(v) !== "" ? (
                  `${text(v)} dBm`
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("SINR (dB)"),
              key: "sinr_db",
              render: (_: unknown, row: Row) => {
                const v = object(row.network_data).sinr_db;
                return v !== null && v !== undefined && text(v) !== "" ? (
                  `${text(v)} dB`
                ) : (
                  <span className="muted">{app.t("unknown")}</span>
                );
              },
            },
            {
              title: app.t("Latitude"),
              dataIndex: "latitude",
              key: "latitude",
              render: (v: unknown) =>
                v ?? <span className="muted">{app.t("unknown")}</span>,
            },
            {
              title: app.t("Longitude"),
              dataIndex: "longitude",
              key: "longitude",
              render: (v: unknown) =>
                v ?? <span className="muted">{app.t("unknown")}</span>,
            },
          ]}
          locale={{ emptyText: app.t("empty") }}
        />
        <div className="table-footer">
          <Typography.Text type="secondary">
            {filtered.length} {app.t("loaded")}
            {search.trim()
              ? ` (${app
                  .t("{count} total in timeframe")
                  .replace("{count}", String(points.length))})`
              : ""}
            {q.data?.truncated &&
              ` · ${app.t(
                "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.",
              )}`}
            {q.data?.timestamp && (
              <>
                {" "}
                · {app.t("Updated")} <Time value={q.data.timestamp} />
              </>
            )}
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
interface FleetSummary {
  active_vehicles?: number;
  inactive_or_maintenance_vehicles?: number;
  active_drivers?: number;
  inactive_drivers?: number;
  active_shifts?: number;
  active_journeys?: number;
  total_journeys_in_window?: number;
  distance_km_30d?: number;
  fuel_litres_30d?: number;
  estimated_co2_kg_30d?: number;
}

interface HarshEventRow extends Row {
  id: string;
  organization_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  shift_id?: string;
  kind?: string;
  acceleration_ms2?: number;
  threshold_ms2?: number;
  occurred_at?: string;
  latitude?: number | null;
  longitude?: number | null;
  start_latitude?: number | null;
  start_longitude?: number | null;
  end_latitude?: number | null;
  end_longitude?: number | null;
  start_speed_kmh?: number | null;
  end_speed_kmh?: number | null;
  delta_speed_kmh?: number | null;
  driver_name?: string;
  registration_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

interface DailyTrendItem {
  date: string;
  harsh_braking: number;
  rapid_acceleration: number;
  total: number;
}

interface DriverScoreItem {
  driver_id: string;
  name: string;
  score: number | null;
  events_included: number;
  eligible_speed_intervals: number;
}

interface SafetySummary {
  safety_enabled?: boolean;
  average_safety_score?: number | null;
  scored_drivers?: number;
  total_drivers?: number;
  min_score?: number | null;
  max_score?: number | null;
  total_observed?: number;
  total_excluded?: number;
  harsh_braking_count?: number;
  rapid_acceleration_count?: number;
  pending_appeals?: number;
  approved_appeals?: number;
  rejected_appeals?: number;
  daily_trend?: DailyTrendItem[];
  driver_scores?: DriverScoreItem[];
  recent_harsh_events?: HarshEventRow[];
}

interface AlertsSummary {
  open?: number;
  acknowledged?: number;
  resolved?: number;
  total?: number;
  by_severity?: Record<string, number>;
  by_kind?: Record<string, number>;
}

interface ComplianceSummary {
  total_obligations?: number;
  verified_records?: number;
  pending_records?: number;
  expired_or_overdue?: number;
}

interface MaintenanceSummary {
  assigned_plans?: number;
  total_records?: number;
  completed_last_30d?: number;
}

interface DailyTelemetryItem {
  date: string;
  samples: number;
  distance_km: number;
  fuel_litres: number;
}

interface ReportSummaryData extends Row {
  as_of?: string;
  vehicles?: number;
  drivers?: number;
  safety_observations?: number;
  open_alerts?: number;
  compliance_obligations?: number;
  fleet_summary?: FleetSummary;
  safety_summary?: SafetySummary;
  alerts_summary?: AlertsSummary;
  compliance_summary?: ComplianceSummary;
  maintenance_summary?: MaintenanceSummary;
  daily_telemetry?: DailyTelemetryItem[];
}

function SafetyTrendChart({
  dailyTrend,
  t,
}: {
  dailyTrend: DailyTrendItem[];
  t: (k: string) => string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!dailyTrend || dailyTrend.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("No safety observations in timeframe")}
      />
    );
  }

  const maxVal = Math.max(
    5,
    ...dailyTrend.map((d) =>
      Math.max(
        d.total || 0,
        (d.harsh_braking || 0) + (d.rapid_acceleration || 0),
      ),
    ),
  );
  const yMax = Math.ceil(maxVal * 1.15);

  const chartLeft = 45;
  const chartRight = 740;
  const chartTop = 20;
  const chartBottom = 175;
  const plotWidth = chartRight - chartLeft;
  const plotHeight = chartBottom - chartTop;

  const yFor = (v: number) =>
    chartBottom - (Math.max(0, v) / yMax) * plotHeight;
  const yTicks = [0, Math.round(yMax / 2), yMax];

  const slotWidth = plotWidth / dailyTrend.length;
  const barWidth = Math.max(6, Math.min(16, (slotWidth - 8) / 2));

  const totalBraking = dailyTrend.reduce(
    (acc, d) => acc + (d.harsh_braking || 0),
    0,
  );
  const totalAccel = dailyTrend.reduce(
    (acc, d) => acc + (d.rapid_acceleration || 0),
    0,
  );
  const totalObs = dailyTrend.reduce((acc, d) => acc + (d.total || 0), 0);

  return (
    <div className="stack">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Space size={12} wrap>
          <span className="reports-legend-item">
            <span
              className="reports-legend-dot"
              style={{ background: "#ef4444" }}
            />
            {t("Harsh Braking")} ({totalBraking})
          </span>
          <span className="reports-legend-item">
            <span
              className="reports-legend-dot"
              style={{ background: "#f59e0b" }}
            />
            {t("Rapid Acceleration")} ({totalAccel})
          </span>
        </Space>
        <Tag color="volcano">
          {totalObs} {t("Total (14 Days)")}
        </Tag>
      </div>

      <div className="telemetry-chart-wrap">
        <svg
          className="reports-svg-chart"
          viewBox="0 0 760 215"
          role="img"
          aria-label={t("14-day Safety Observations Trend")}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={chartLeft}
                y1={yFor(tick)}
                x2={chartRight}
                y2={yFor(tick)}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={chartLeft - 8}
                y={yFor(tick) + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
              >
                {tick}
              </text>
            </g>
          ))}

          {dailyTrend.map((item, i) => {
            const centerX = chartLeft + (i + 0.5) * slotWidth;
            const bH = ((item.harsh_braking || 0) / yMax) * plotHeight;
            const bX = centerX - barWidth - 1;
            const bY = chartBottom - bH;

            const aH = ((item.rapid_acceleration || 0) / yMax) * plotHeight;
            const aX = centerX + 1;
            const aY = chartBottom - aH;

            return (
              <g key={item.date || i}>
                {hoveredIdx === i && (
                  <rect
                    x={chartLeft + i * slotWidth}
                    y={chartTop}
                    width={slotWidth}
                    height={plotHeight}
                    fill="rgba(148, 163, 184, 0.12)"
                    rx="4"
                    pointerEvents="none"
                  />
                )}
                <rect
                  x={bX}
                  y={bY}
                  width={barWidth}
                  height={Math.max(1, bH)}
                  rx="2"
                  fill="#ef4444"
                />
                <rect
                  x={aX}
                  y={aY}
                  width={barWidth}
                  height={Math.max(1, aH)}
                  rx="2"
                  fill="#f59e0b"
                />
                <text
                  x={centerX}
                  y="198"
                  textAnchor="middle"
                  fill={hoveredIdx === i ? "#0f172a" : "#8c99ad"}
                  fontWeight={hoveredIdx === i ? "600" : "normal"}
                  fontSize="11"
                >
                  {dayjs(item.date).format("DD MMM")}
                </text>
                <rect
                  x={chartLeft + i * slotWidth}
                  y={chartTop}
                  width={slotWidth}
                  height={plotHeight + 35}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && dailyTrend[hoveredIdx] && (
          <div
            className={`telemetry-chart-tooltip${hoveredIdx > dailyTrend.length / 2 ? " is-left" : ""}`}
            style={{
              left: `${((chartLeft + (hoveredIdx + 0.5) * slotWidth) / 760) * 100}%`,
              top: "35%",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {dayjs(dailyTrend[hoveredIdx].date).format("ddd, DD MMM YYYY")}
            </div>
            <div className="telemetry-chart-tooltip-val">
              <span
                className="telemetry-chart-tooltip-dot"
                style={{ background: "#ef4444" }}
              />
              <span>
                {t("Harsh braking")}:{" "}
                <strong>{dailyTrend[hoveredIdx].harsh_braking}</strong>
              </span>
            </div>
            <div className="telemetry-chart-tooltip-val">
              <span
                className="telemetry-chart-tooltip-dot"
                style={{ background: "#f59e0b" }}
              />
              <span>
                {t("Rapid acceleration")}:{" "}
                <strong>{dailyTrend[hoveredIdx].rapid_acceleration}</strong>
              </span>
            </div>
            <div className="telemetry-chart-tooltip-sub">
              {t("Total observations")}:{" "}
              <strong>{dailyTrend[hoveredIdx].total}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TelemetryActivityChart({
  dailyTelemetry,
  t,
}: {
  dailyTelemetry: DailyTelemetryItem[];
  t: (k: string) => string;
}) {
  const [metricView, setMetricView] = useState<"distance_fuel" | "packets">(
    "distance_fuel",
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!dailyTelemetry || dailyTelemetry.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("No telemetry activity in timeframe")}
      />
    );
  }

  const chartLeft = 50;
  const chartRight = 710;
  const chartTop = 20;
  const chartBottom = 175;
  const plotWidth = chartRight - chartLeft;
  const plotHeight = chartBottom - chartTop;

  const totalDist = dailyTelemetry.reduce(
    (acc, d) => acc + (d.distance_km || 0),
    0,
  );
  const totalFuel = dailyTelemetry.reduce(
    (acc, d) => acc + (d.fuel_litres || 0),
    0,
  );
  const totalPackets = dailyTelemetry.reduce(
    (acc, d) => acc + (d.samples || 0),
    0,
  );

  const maxDist = Math.max(
    5,
    ...dailyTelemetry.map((d) => d.distance_km || 0),
  );
  const yMaxDist = Math.ceil(maxDist * 1.15);

  const maxFuel = Math.max(3, ...dailyTelemetry.map((d) => d.fuel_litres || 0));
  const yMaxFuel = Math.ceil(maxFuel * 1.15);

  const maxPackets = Math.max(
    50,
    ...dailyTelemetry.map((d) => d.samples || 0),
  );
  const yMaxPackets = Math.ceil(maxPackets * 1.15);

  const xFor = (i: number) =>
    dailyTelemetry.length === 1
      ? chartLeft + plotWidth / 2
      : chartLeft + (i / (dailyTelemetry.length - 1)) * plotWidth;

  const yForDist = (v: number) =>
    chartBottom - (Math.max(0, v) / yMaxDist) * plotHeight;
  const yForFuel = (v: number) =>
    chartBottom - (Math.max(0, v) / yMaxFuel) * plotHeight;
  const yForPackets = (v: number) =>
    chartBottom - (Math.max(0, v) / yMaxPackets) * plotHeight;

  const distPoints = dailyTelemetry
    .map((d, i) => `${xFor(i)},${yForDist(d.distance_km || 0)}`)
    .join(" ");
  const distArea = `${xFor(0)},${chartBottom} ${distPoints} ${xFor(dailyTelemetry.length - 1)},${chartBottom}`;

  const fuelPoints = dailyTelemetry
    .map((d, i) => `${xFor(i)},${yForFuel(d.fuel_litres || 0)}`)
    .join(" ");
  const fuelArea = `${xFor(0)},${chartBottom} ${fuelPoints} ${xFor(dailyTelemetry.length - 1)},${chartBottom}`;

  const packetsPoints = dailyTelemetry
    .map((d, i) => `${xFor(i)},${yForPackets(d.samples || 0)}`)
    .join(" ");
  const packetsArea = `${xFor(0)},${chartBottom} ${packetsPoints} ${xFor(dailyTelemetry.length - 1)},${chartBottom}`;

  return (
    <div className="stack">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Segmented
          size="small"
          value={metricView}
          onChange={(v) => setMetricView(v as "distance_fuel" | "packets")}
          options={[
            { label: t("Distance & Fuel"), value: "distance_fuel" },
            { label: t("Telemetry Packets"), value: "packets" },
          ]}
        />
        <Space size={8} wrap>
          {metricView === "distance_fuel" ? (
            <>
              <Tag color="blue">{totalDist.toFixed(1)} km</Tag>
              <Tag color="green">{totalFuel.toFixed(1)} L</Tag>
            </>
          ) : (
            <Tag color="purple">
              {totalPackets.toLocaleString()} {t("samples")}
            </Tag>
          )}
        </Space>
      </div>

      <div className="telemetry-chart-wrap">
        <svg
          className="reports-svg-chart"
          viewBox="0 0 760 215"
          role="img"
          aria-label={t("14-day Telemetry & Distance/Fuel Activity")}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="reportsDistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1677ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1677ff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="reportsFuelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="reportsPacketsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((pct) => {
            const y = chartBottom - pct * plotHeight;
            return (
              <g key={pct}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                {metricView === "distance_fuel" ? (
                  <>
                    <text
                      x={chartLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#1677ff"
                      fontSize="10"
                    >
                      {Math.round(pct * yMaxDist)}k
                    </text>
                    <text
                      x={chartRight + 8}
                      y={y + 4}
                      textAnchor="start"
                      fill="#10b981"
                      fontSize="10"
                    >
                      {Math.round(pct * yMaxFuel)}L
                    </text>
                  </>
                ) : (
                  <text
                    x={chartLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#8b5cf6"
                    fontSize="10"
                  >
                    {Math.round(pct * yMaxPackets)}
                  </text>
                )}
              </g>
            );
          })}

          {metricView === "distance_fuel" ? (
            <>
              <polygon points={distArea} fill="url(#reportsDistGrad)" />
              <polyline
                points={distPoints}
                fill="none"
                stroke="#1677ff"
                strokeWidth="2.5"
              />
              {dailyTelemetry.map((d, i) => (
                <circle
                  key={`dist-${i}`}
                  cx={xFor(i)}
                  cy={yForDist(d.distance_km || 0)}
                  r={hoveredIdx === i ? "5" : "3"}
                  fill="#1677ff"
                />
              ))}

              <polygon points={fuelArea} fill="url(#reportsFuelGrad)" />
              <polyline
                points={fuelPoints}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {dailyTelemetry.map((d, i) => (
                <circle
                  key={`fuel-${i}`}
                  cx={xFor(i)}
                  cy={yForFuel(d.fuel_litres || 0)}
                  r={hoveredIdx === i ? "5" : "3"}
                  fill="#10b981"
                />
              ))}
            </>
          ) : (
            <>
              <polygon points={packetsArea} fill="url(#reportsPacketsGrad)" />
              <polyline
                points={packetsPoints}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
              />
              {dailyTelemetry.map((d, i) => (
                <circle
                  key={`pkt-${i}`}
                  cx={xFor(i)}
                  cy={yForPackets(d.samples || 0)}
                  r={hoveredIdx === i ? "5" : "3"}
                  fill="#8b5cf6"
                />
              ))}
            </>
          )}

          {dailyTelemetry.map((d, i) => {
            const x = xFor(i);
            return (
              <text
                key={d.date || i}
                x={x}
                y="198"
                textAnchor="middle"
                fill={hoveredIdx === i ? "#0f172a" : "#8c99ad"}
                fontWeight={hoveredIdx === i ? "600" : "normal"}
                fontSize="11"
              >
                {dayjs(d.date).format("DD MMM")}
              </text>
            );
          })}

          {hoveredIdx !== null && (
            <line
              x1={xFor(hoveredIdx)}
              y1={chartTop}
              x2={xFor(hoveredIdx)}
              y2={chartBottom}
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              pointerEvents="none"
            />
          )}

          {dailyTelemetry.map((_, i) => {
            const step = plotWidth / Math.max(1, dailyTelemetry.length - 1);
            const boxX = i === 0 ? chartLeft : xFor(i) - step / 2;
            const boxW =
              i === 0 || i === dailyTelemetry.length - 1 ? step / 2 : step;
            return (
              <rect
                key={`hit-${i}`}
                x={boxX}
                y={chartTop}
                width={boxW}
                height={plotHeight + 35}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
              />
            );
          })}
        </svg>

        {hoveredIdx !== null && dailyTelemetry[hoveredIdx] && (
          <div
            className={`telemetry-chart-tooltip${hoveredIdx > dailyTelemetry.length / 2 ? " is-left" : ""}`}
            style={{
              left: `${(xFor(hoveredIdx) / 760) * 100}%`,
              top: "35%",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {dayjs(dailyTelemetry[hoveredIdx].date).format("ddd, DD MMM YYYY")}
            </div>
            <div className="telemetry-chart-tooltip-val">
              <span
                className="telemetry-chart-tooltip-dot"
                style={{ background: "#1677ff" }}
              />
              <span>
                {t("Distance")}:{" "}
                <strong>
                  {dailyTelemetry[hoveredIdx].distance_km?.toFixed(1) ?? 0} km
                </strong>
              </span>
            </div>
            <div className="telemetry-chart-tooltip-val">
              <span
                className="telemetry-chart-tooltip-dot"
                style={{ background: "#10b981" }}
              />
              <span>
                {t("Fuel")}:{" "}
                <strong>
                  {dailyTelemetry[hoveredIdx].fuel_litres?.toFixed(1) ?? 0} L
                </strong>
              </span>
            </div>
            <div className="telemetry-chart-tooltip-sub">
              {t("Telemetry samples")}:{" "}
              <strong>
                {dailyTelemetry[hoveredIdx].samples?.toLocaleString() ?? 0}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DriverScoresSection({
  driverScores,
  safetyEnabled,
  t,
}: {
  driverScores: DriverScoreItem[];
  safetyEnabled: boolean;
  t: (k: string) => string;
}) {
  const [driverSearch, setDriverSearch] = useState("");

  const sortedDrivers = useMemo(() => {
    return [...(driverScores || [])].sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  }, [driverScores]);

  const filteredDrivers = useMemo(() => {
    if (!driverSearch.trim()) return sortedDrivers;
    const q = driverSearch.toLowerCase();
    return sortedDrivers.filter((d) => d.name?.toLowerCase().includes(q));
  }, [sortedDrivers, driverSearch]);

  if (!safetyEnabled) {
    return (
      <Card title={t("Driver Safety Scores")}>
        <Alert
          type="info"
          showIcon
          title={t("Safety analytics feature disabled")}
          description={t(
            "Driver safety scoring is not enabled under this organization's current subscription tier.",
          )}
        />
      </Card>
    );
  }

  const topComparisonDrivers = sortedDrivers.slice(0, 8);
  const barChartHeight = Math.max(120, topComparisonDrivers.length * 34 + 30);

  return (
    <Card
      title={t("Driver Safety Scores & Leaderboard")}
      extra={
        <Input.Search
          allowClear
          placeholder={t("Filter driver name...")}
          value={driverSearch}
          onChange={(e) => setDriverSearch(e.target.value)}
          style={{ width: 220 }}
          size="small"
        />
      }
    >
      <GridRow gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>
            {t("Top Driver Safety Scores")}
          </Typography.Title>
          {topComparisonDrivers.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("No drivers found")}
            />
          ) : (
            <svg
              className="reports-svg-chart"
              viewBox={`0 0 540 ${barChartHeight}`}
              role="img"
              aria-label={t("Driver Safety Scores Comparison")}
            >
              {topComparisonDrivers.map((d, idx) => {
                const y = 16 + idx * 34;
                const score = d.score;
                const barColor =
                  score === null
                    ? "#cbd5e1"
                    : score >= 85
                      ? "#22c55e"
                      : score >= 70
                        ? "#f59e0b"
                        : "#ef4444";
                const barFillWidth =
                  score !== null
                    ? (Math.max(0, Math.min(100, score)) / 100) * 270
                    : 0;
                return (
                  <g key={d.driver_id || idx} className="reports-driver-bar-item">
                    <text
                      x="0"
                      y={y + 13}
                      fill="#1e293b"
                      fontSize="12"
                      fontWeight="500"
                    >
                      {d.name.length > 18 ? `${d.name.slice(0, 16)}…` : d.name}
                    </text>
                    <rect
                      x="140"
                      y={y}
                      width="270"
                      height="16"
                      rx="4"
                      fill="#f1f5f9"
                    />
                    {barFillWidth > 0 && (
                      <rect
                        x="140"
                        y={y}
                        width={barFillWidth}
                        height="16"
                        rx="4"
                        fill={barColor}
                      />
                    )}
                    <text
                      x="420"
                      y={y + 13}
                      fill={barColor}
                      fontSize="12"
                      fontWeight="600"
                    >
                      {score !== null ? `${score}/100` : t("N/A")}
                    </text>
                    <text x="485" y={y + 13} fill="#94a3b8" fontSize="11">
                      {d.events_included} {t("evts")}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </Col>

        <Col xs={24} lg={14}>
          <Table<DriverScoreItem>
            size="small"
            rowKey={(r) => r.driver_id}
            dataSource={filteredDrivers}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            columns={[
              {
                title: t("#"),
                key: "rank",
                width: 45,
                render: (_, __, index) => (
                  <span className="muted">{index + 1}</span>
                ),
              },
              {
                title: t("Driver"),
                dataIndex: "name",
                key: "name",
                render: (v) => <strong>{v}</strong>,
              },
              {
                title: t("Score"),
                key: "score",
                sorter: (a, b) => (a.score ?? -1) - (b.score ?? -1),
                render: (_, r) => {
                  if (r.score === null) return <Tag>{t("Unscored")}</Tag>;
                  const strokeColor =
                    r.score >= 85
                      ? "#22c55e"
                      : r.score >= 70
                        ? "#f59e0b"
                        : "#ef4444";
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 110,
                      }}
                    >
                      <Progress
                        percent={r.score}
                        size="small"
                        strokeColor={strokeColor}
                        format={() => r.score}
                      />
                    </div>
                  );
                },
              },
              {
                title: t("Harsh Events"),
                dataIndex: "events_included",
                key: "events_included",
                sorter: (a, b) => a.events_included - b.events_included,
                render: (v) => (
                  <Tag color={Number(v) > 0 ? "volcano" : "default"}>{v}</Tag>
                ),
              },
              {
                title: t("Eligible Intervals"),
                dataIndex: "eligible_speed_intervals",
                key: "eligible_speed_intervals",
                render: (v) => <span className="reference">{v}</span>,
              },
              {
                title: t("Standing"),
                key: "standing",
                render: (_, r) => {
                  if (r.score === null)
                    return <Tag>{t("Needs Telemetry")}</Tag>;
                  if (r.score >= 90)
                    return <Tag color="success">{t("Excellent")}</Tag>;
                  if (r.score >= 80)
                    return <Tag color="cyan">{t("Good")}</Tag>;
                  if (r.score >= 70)
                    return <Tag color="warning">{t("Fair")}</Tag>;
                  return <Tag color="error">{t("Needs Coaching")}</Tag>;
                },
              },
            ]}
          />
        </Col>
      </GridRow>
    </Card>
  );
}

function HarshEventsSection({
  harshEvents,
  t,
}: {
  harshEvents: HarshEventRow[];
  t: (k: string) => string;
}) {
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<HarshEventRow | null>(null);
  const [focusRowKey, setFocusRowKey] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const filteredEvents = useMemo(() => {
    return (harshEvents || []).filter((e) => {
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = [
          e.driver_name,
          e.registration_number,
          e.vehicle_make,
          e.vehicle_model,
          e.kind,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [harshEvents, kindFilter, search]);

  const mapItems = useMemo<Row[]>(() => {
    return filteredEvents.map((e, idx) => {
      const isBraking = e.kind === "harsh_braking";
      const lat = e.latitude ?? e.end_latitude ?? e.start_latitude;
      const lon = e.longitude ?? e.end_longitude ?? e.start_longitude;
      const id = text(e.id) || `harsh-evt-${idx}`;
      return {
        ...e,
        id,
        latitude: lat !== null && lat !== undefined ? Number(lat) : null,
        longitude: lon !== null && lon !== undefined ? Number(lon) : null,
        speed_kmh: e.end_speed_kmh ?? e.start_speed_kmh,
        current_driver_name: text(e.driver_name),
        registration_number: text(e.registration_number),
        make: e.vehicle_make,
        model: e.vehicle_model,
        occurred_at: e.occurred_at,
        harsh_braking: isBraking,
        rapid_acceleration: !isBraking,
        safety_events: [
          {
            id: e.id,
            kind: e.kind,
            acceleration_ms2: e.acceleration_ms2,
            threshold_ms2: e.threshold_ms2,
            occurred_at: e.occurred_at,
          },
        ],
      };
    });
  }, [filteredEvents]);

  const handleSelectEvent = (row: Row) => {
    const e = row as HarshEventRow;
    setSelectedEvent(e);
    setDrawerOpen(true);
    if (e.id) {
      setFocusRowKey(String(e.id));
      setFocusNonce((n) => n + 1);
    }
  };

  const focusOnMap = (e: HarshEventRow) => {
    if (e.id) {
      setFocusRowKey(String(e.id));
      setFocusNonce((n) => n + 1);
    }
  };

  return (
    <Card
      title={
        <Space wrap>
          <span>{t("Recent Harsh Driving Events (Last 50)")}</span>
          <Tag color="volcano">
            {filteredEvents.length} {t("events")}
          </Tag>
        </Space>
      }
    >
      <div className="reports-events-toolbar">
        <Space wrap>
          <Segmented
            value={kindFilter}
            onChange={(v) => setKindFilter(v as string)}
            options={[
              { label: t("All Events"), value: "all" },
              { label: t("Harsh Braking"), value: "harsh_braking" },
              { label: t("Rapid Acceleration"), value: "rapid_acceleration" },
            ]}
          />
          <Input.Search
            allowClear
            placeholder={t("Search vehicle plate or driver...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
        </Space>
        <Space size={12} wrap>
          <span className="reports-legend-item">
            <span
              className="reports-legend-dot"
              style={{ background: "#ef4444" }}
            />
            {t("Harsh Braking (Red Triangle)")}
          </span>
          <span className="reports-legend-item">
            <span
              className="reports-legend-dot"
              style={{ background: "#f59e0b" }}
            />
            {t("Rapid Acceleration (Amber Triangle)")}
          </span>
        </Space>
      </div>

      <div className="reports-events-map-wrap" style={{ marginBottom: 16 }}>
        <CoordinateMap
          items={mapItems}
          mode="fleet"
          focusRowKey={focusRowKey}
          focusNonce={focusNonce}
          onSelect={handleSelectEvent}
        />
      </div>

      <Table<HarshEventRow>
        size="small"
        className="reports-events-table"
        rowKey={(r) => text(r.id) || JSON.stringify(r)}
        dataSource={filteredEvents}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        scroll={{ x: "max-content" }}
        onRow={(r) => ({
          onClick: () => handleSelectEvent(r),
        })}
        columns={[
          {
            title: t("Type"),
            key: "kind",
            render: (_, r) => {
              const isBraking = r.kind === "harsh_braking";
              return (
                <Tag
                  color={isBraking ? "error" : "warning"}
                  icon={
                    isBraking ? <WarningOutlined /> : <ThunderboltOutlined />
                  }
                >
                  {isBraking ? t("Harsh Braking") : t("Rapid Acceleration")}
                </Tag>
              );
            },
          },
          {
            title: t("Occurred At"),
            dataIndex: "occurred_at",
            key: "occurred_at",
            sorter: (a, b) =>
              (Date.parse(text(a.occurred_at)) || 0) -
              (Date.parse(text(b.occurred_at)) || 0),
            render: (v) => <Time value={v} />,
          },
          {
            title: t("Driver"),
            key: "driver_name",
            render: (_, r) =>
              r.driver_name ? (
                <Space size={4}>
                  <UserOutlined style={{ color: "#64748b" }} />
                  <span>{r.driver_name}</span>
                </Space>
              ) : (
                <span className="muted">{t("unknown")}</span>
              ),
          },
          {
            title: t("Vehicle"),
            key: "registration_number",
            render: (_, r) => (
              <Space size={4}>
                <CarOutlined style={{ color: "#64748b" }} />
                <strong>
                  {r.registration_number || r.vehicle_id || t("unknown")}
                </strong>
                {(r.vehicle_make || r.vehicle_model) && (
                  <span className="muted">
                    (
                    {[r.vehicle_make, r.vehicle_model]
                      .filter(Boolean)
                      .join(" ")}
                    )
                  </span>
                )}
              </Space>
            ),
          },
          {
            title: t("Acceleration"),
            key: "accel",
            render: (_, r) => (
              <span>
                {r.acceleration_ms2 !== undefined &&
                r.acceleration_ms2 !== null
                  ? `${Number(r.acceleration_ms2).toFixed(2)} m/s²`
                  : "—"}
                {r.threshold_ms2 !== undefined && r.threshold_ms2 !== null && (
                  <span className="muted">
                    {" "}
                    ({t("thresh")}: {r.threshold_ms2})
                  </span>
                )}
              </span>
            ),
          },
          {
            title: t("Speed Δ"),
            key: "speed",
            render: (_, r) => {
              const start = r.start_speed_kmh;
              const end = r.end_speed_kmh;
              const delta = r.delta_speed_kmh;
              if (start === null && end === null && delta === null)
                return <span className="muted">—</span>;
              return (
                <span>
                  {start !== null && start !== undefined
                    ? `${Math.round(Number(start))} km/h`
                    : "?"}
                  {" → "}
                  {end !== null && end !== undefined
                    ? `${Math.round(Number(end))} km/h`
                    : "?"}
                  {delta !== null && delta !== undefined && (
                    <Tag style={{ marginLeft: 6 }}>
                      {Number(delta) > 0
                        ? `+${Math.round(Number(delta))}`
                        : Math.round(Number(delta))}{" "}
                      km/h
                    </Tag>
                  )}
                </span>
              );
            },
          },
          {
            title: t("Coordinates"),
            key: "coords",
            render: (_, r) => {
              const lat = r.latitude ?? r.end_latitude ?? r.start_latitude;
              const lon = r.longitude ?? r.end_longitude ?? r.start_longitude;
              if (
                lat !== null &&
                lat !== undefined &&
                lon !== null &&
                lon !== undefined
              ) {
                return (
                  <span className="mono" style={{ fontSize: 11 }}>
                    {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
                  </span>
                );
              }
              return <span className="muted">{t("No GPS")}</span>;
            },
          },
          {
            title: t("Action"),
            key: "action",
            render: (_, r) => {
              const hasGps =
                (r.latitude ?? r.end_latitude ?? r.start_latitude) !== null &&
                (r.latitude ?? r.end_latitude ?? r.start_latitude) !==
                  undefined;
              return (
                <Space size={6} onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    disabled={!hasGps}
                    title={t("Focus on map")}
                    onClick={() => focusOnMap(r)}
                  />
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleSelectEvent(r)}
                  >
                    {t("Inspect")}
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />

      <Drawer
        title={
          selectedEvent ? (
            <Space wrap>
              <Tag
                color={
                  selectedEvent.kind === "harsh_braking" ? "error" : "warning"
                }
                icon={
                  selectedEvent.kind === "harsh_braking" ? (
                    <WarningOutlined />
                  ) : (
                    <ThunderboltOutlined />
                  )
                }
              >
                {selectedEvent.kind === "harsh_braking"
                  ? t("Harsh Braking Event")
                  : t("Rapid Acceleration Event")}
              </Tag>
              <span>
                {selectedEvent.registration_number || selectedEvent.vehicle_id}
              </span>
            </Space>
          ) : (
            t("Event Details")
          )
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          selectedEvent &&
          (selectedEvent.latitude ?? selectedEvent.end_latitude) !== null &&
          (selectedEvent.latitude ?? selectedEvent.end_latitude) !==
            undefined ? (
            <Button
              type="primary"
              size="small"
              icon={<AimOutlined />}
              onClick={() => {
                focusOnMap(selectedEvent);
              }}
            >
              {t("Focus on Map")}
            </Button>
          ) : null
        }
      >
        {selectedEvent && (
          <div className="stack">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={t("Event ID")}>
                <span className="reference">{selectedEvent.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label={t("Occurred At")}>
                <Time value={selectedEvent.occurred_at} />
              </Descriptions.Item>
              <Descriptions.Item label={t("Driver")}>
                <strong>{selectedEvent.driver_name || t("unknown")}</strong>
                {selectedEvent.driver_id && (
                  <div>
                    <span className="muted">{t("ID")}: </span>
                    <span className="reference">{selectedEvent.driver_id}</span>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("Vehicle")}>
                <strong>
                  {selectedEvent.registration_number || t("unknown")}
                </strong>
                {(selectedEvent.vehicle_make ||
                  selectedEvent.vehicle_model) && (
                  <div>
                    {[selectedEvent.vehicle_make, selectedEvent.vehicle_model]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                )}
                {selectedEvent.vehicle_id && (
                  <div>
                    <span className="muted">{t("ID")}: </span>
                    <span className="reference">
                      {selectedEvent.vehicle_id}
                    </span>
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("Acceleration")}>
                <strong>
                  {selectedEvent.acceleration_ms2 !== undefined &&
                  selectedEvent.acceleration_ms2 !== null
                    ? `${Number(selectedEvent.acceleration_ms2).toFixed(2)} m/s²`
                    : t("unknown")}
                </strong>
                {selectedEvent.threshold_ms2 !== undefined &&
                  selectedEvent.threshold_ms2 !== null && (
                    <div className="muted">
                      {t("Detection threshold")}: {selectedEvent.threshold_ms2}{" "}
                      m/s²
                    </div>
                  )}
              </Descriptions.Item>
              <Descriptions.Item label={t("Speed Dynamics")}>
                <div>
                  {t("Start:")}{" "}
                  <strong>
                    {selectedEvent.start_speed_kmh !== null &&
                    selectedEvent.start_speed_kmh !== undefined
                      ? `${Math.round(Number(selectedEvent.start_speed_kmh))} km/h`
                      : "—"}
                  </strong>
                  {" · "}
                  {t("End:")}{" "}
                  <strong>
                    {selectedEvent.end_speed_kmh !== null &&
                    selectedEvent.end_speed_kmh !== undefined
                      ? `${Math.round(Number(selectedEvent.end_speed_kmh))} km/h`
                      : "—"}
                  </strong>
                </div>
                {selectedEvent.delta_speed_kmh !== null &&
                  selectedEvent.delta_speed_kmh !== undefined && (
                    <div style={{ marginTop: 4 }}>
                      {t("Delta:")}{" "}
                      <Tag
                        color={
                          Number(selectedEvent.delta_speed_kmh) < 0
                            ? "error"
                            : "warning"
                        }
                      >
                        {Number(selectedEvent.delta_speed_kmh) > 0
                          ? `+${Math.round(Number(selectedEvent.delta_speed_kmh))}`
                          : Math.round(Number(selectedEvent.delta_speed_kmh))}{" "}
                        km/h
                      </Tag>
                    </div>
                  )}
              </Descriptions.Item>
              <Descriptions.Item label={t("GPS Coordinates")}>
                {(() => {
                  const lat =
                    selectedEvent.latitude ??
                    selectedEvent.end_latitude ??
                    selectedEvent.start_latitude;
                  const lon =
                    selectedEvent.longitude ??
                    selectedEvent.end_longitude ??
                    selectedEvent.start_longitude;
                  if (
                    lat !== null &&
                    lat !== undefined &&
                    lon !== null &&
                    lon !== undefined
                  ) {
                    return (
                      <div>
                        <div className="mono">
                          {Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12 }}
                        >
                          {t("Open in Google Maps")} &rarr;
                        </a>
                      </div>
                    );
                  }
                  return (
                    <span className="muted">
                      {t("No GPS fix for this observation")}
                    </span>
                  );
                })()}
              </Descriptions.Item>
              {selectedEvent.shift_id && (
                <Descriptions.Item label={t("Shift ID")}>
                  <span className="reference">{selectedEvent.shift_id}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </Card>
  );
}

function OperationalSummaryCards({
  alerts,
  compliance,
  maintenance,
  t,
}: {
  alerts?: AlertsSummary;
  compliance?: ComplianceSummary;
  maintenance?: MaintenanceSummary;
  t: (k: string) => string;
}) {
  const verifiedCount = compliance?.verified_records ?? 0;
  const totalObligations = compliance?.total_obligations ?? 0;
  const compliancePct =
    totalObligations > 0
      ? Math.round((verifiedCount / totalObligations) * 100)
      : 100;

  return (
    <GridRow gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card
          className="reports-chart-card"
          size="small"
          title={t("Alerts Breakdown")}
        >
          <div className="stack" style={{ gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="error">
                {alerts?.open ?? 0} {t("Open")}
              </Tag>
              <Tag color="warning">
                {alerts?.acknowledged ?? 0} {t("Acknowledged")}
              </Tag>
              <Tag color="success">
                {alerts?.resolved ?? 0} {t("Resolved")}
              </Tag>
            </div>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t("By Severity")}
              </Typography.Text>
              <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                <Tag color="red">
                  {alerts?.by_severity?.critical ?? 0} {t("Critical")}
                </Tag>
                <Tag color="orange">
                  {alerts?.by_severity?.warning ?? 0} {t("Warning")}
                </Tag>
              </div>
            </div>
            {alerts?.by_kind && Object.keys(alerts.by_kind).length > 0 && (
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t("By Category")}
                </Typography.Text>
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {Object.entries(alerts.by_kind).map(([k, count]) => (
                    <Tag key={k}>
                      {k.replace(/^.*\./, "")}: {count}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card
          className="reports-chart-card"
          size="small"
          title={t("Compliance Obligations")}
        >
          <div className="stack" style={{ gap: 12 }}>
            <Statistic
              title={t("Verification Rate")}
              value={compliancePct}
              suffix="%"
              prefix={
                <SafetyCertificateOutlined style={{ color: "#10b981" }} />
              }
            />
            <Progress
              percent={compliancePct}
              strokeColor="#10b981"
              size="small"
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="success">
                {compliance?.verified_records ?? 0} {t("Verified")}
              </Tag>
              <Tag color="gold">
                {compliance?.pending_records ?? 0} {t("Pending")}
              </Tag>
              <Tag
                color={
                  (compliance?.expired_or_overdue ?? 0) > 0
                    ? "error"
                    : "default"
                }
              >
                {compliance?.expired_or_overdue ?? 0} {t("Overdue / Expired")}
              </Tag>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card
          className="reports-chart-card"
          size="small"
          title={t("Maintenance Fleet Summary")}
        >
          <div className="stack" style={{ gap: 12 }}>
            <Statistic
              title={t("Completed Service (30d)")}
              value={maintenance?.completed_last_30d ?? 0}
              prefix={<ToolOutlined style={{ color: "#1677ff" }} />}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="blue">
                {maintenance?.assigned_plans ?? 0} {t("Active Plans")}
              </Tag>
              <Tag>{maintenance?.total_records ?? 0} {t("Total Logs")}</Tag>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t(
                "Maintenance obligations are evaluated against odometer intervals and recurring schedules.",
              )}
            </Typography.Text>
          </div>
        </Card>
      </Col>
    </GridRow>
  );
}

function formatAdvisorMetricValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
  }
  const num = Number(value);
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(num)) {
    return Number.isInteger(num) ? num.toLocaleString() : num.toFixed(1);
  }
  return text(value) || "—";
}

function formatMetricTitle(
  key: string,
  t: (k: string) => string,
): string {
  const known: Record<string, string> = {
    total_fuel_litres: t("Total fuel (L)"),
    fuel_litres: t("Fuel (L)"),
    total_co2_kg: t("Total CO2 (kg)"),
    co2_kg: t("CO2 (kg)"),
    estimated_co2_kg: t("Estimated CO2 (kg)"),
    total_distance_km: t("Total distance (km)"),
    distance_km: t("Distance (km)"),
    journeys_count: t("Journeys"),
    total_journeys: t("Journeys"),
    vehicles_count: t("Vehicles"),
    active_vehicles: t("Active Vehicles"),
    avg_fuel_l_per_100km: t("Avg fuel (L/100km)"),
    avg_consumption_l_per_100km: t("Avg fuel (L/100km)"),
    idling_minutes: t("Idling (min)"),
    harsh_events_count: t("Safety Observations"),
  };
  if (known[key]) return known[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function priorityTagColor(priority: unknown): string {
  const normalized = text(priority).toLowerCase();
  if (normalized === "high") return "red";
  if (normalized === "medium") return "orange";
  if (normalized === "low") return "green";
  return "default";
}

function FleetCarbonAdvisorCard() {
  const app = useApp();
  const [days, setDays] = useState<number>(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<Row | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const generate = async () => {
    if (busy || !app.organizationId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    try {
      const res = await api<Row>(
        orgPath(app.organizationId, "/fleet-carbon-ai"),
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
      if (!controller.signal.aborted) {
        setBusy(false);
      }
    }
  };

  const executiveSummary = text(result?.executive_summary);
  const rawMetricsSummary = result?.metrics_summary;
  const metricsSummaryObj =
    rawMetricsSummary &&
    typeof rawMetricsSummary === "object" &&
    !Array.isArray(rawMetricsSummary)
      ? object(rawMetricsSummary)
      : null;
  const metricsEntries = metricsSummaryObj
    ? Object.entries(metricsSummaryObj).filter(
        ([, v]) => v !== null && v !== undefined && typeof v !== "object",
      )
    : [];
  const waste = object(result?.estimated_avoidable_waste);
  const wasteFuel = waste.fuel_litres;
  const wasteCo2 = waste.co2_kg;
  const wasteRationale = text(waste.rationale);
  const outliers = rows(result?.outliers);
  const recommendations = rows(result?.recommendations);
  const esgHighlights = Array.isArray(result?.esg_highlights)
    ? result.esg_highlights.map((item) => text(item)).filter(Boolean)
    : [];

  return (
    <Card
      size="small"
      title={app.t("Fleet Fuel & Carbon Reduction Advisor")}
      extra={
        <Space wrap>
          <GeminiPoweredBadge />
          {result && (
            <Button
              size="small"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              disabled={busy}
            >
              {app.t("Close")}
            </Button>
          )}
        </Space>
      }
    >
      <div className="stack">
        <div className="ai-hints-panel">
          <div className="ai-hints-bar" aria-hidden="true" />
          <div className="ai-hints-header">
            <Space wrap>
              <Typography.Text type="secondary">
                {app.t("Analysis window")}
              </Typography.Text>
              <Select<number>
                value={days}
                onChange={setDays}
                disabled={busy}
                style={{ minWidth: 120 }}
                aria-label={app.t("Analysis window")}
                options={[7, 30, 90].map((d) => ({
                  value: d,
                  label: app
                    .t("common_days_count")
                    .replace("{days}", String(d)),
                }))}
              />
              <Button
                type="primary"
                loading={busy}
                disabled={busy}
                onClick={() => void generate()}
              >
                {app.t("Generate Fuel & Carbon Advisor")}
              </Button>
            </Space>
          </div>
        </div>

        <ErrorNotice error={error} />

        {result && (
          <div className="transient-result ai-hints-result">
            <div className="ai-hints-bar" aria-hidden="true" />
            <div className="stack">
              {executiveSummary && (
                <Alert
                  type="info"
                  showIcon
                  icon={<ThunderboltOutlined />}
                  title={app.t("Executive Summary")}
                  description={executiveSummary}
                />
              )}

              {(metricsEntries.length > 0 ||
                typeof rawMetricsSummary === "string" ||
                Object.keys(waste).length > 0) && (
                <GridRow gutter={[12, 12]}>
                  {metricsEntries.map(([key, val]) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={key}>
                      <Card size="small" className="reports-kpi-card">
                        <Statistic
                          title={formatMetricTitle(key, app.t)}
                          value={formatAdvisorMetricValue(val)}
                        />
                      </Card>
                    </Col>
                  ))}
                  {typeof rawMetricsSummary === "string" &&
                    rawMetricsSummary.trim() !== "" && (
                      <Col xs={24}>
                        <Card size="small">
                          <Typography.Text>{rawMetricsSummary}</Typography.Text>
                        </Card>
                      </Col>
                    )}
                  {wasteFuel !== undefined && wasteFuel !== null && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card size="small" className="reports-kpi-card">
                        <Statistic
                          title={app.t("Avoidable Fuel Waste")}
                          value={formatAdvisorMetricValue(wasteFuel)}
                          suffix="L"
                          prefix={<FireOutlined style={{ color: "#f97316" }} />}
                        />
                      </Card>
                    </Col>
                  )}
                  {wasteCo2 !== undefined && wasteCo2 !== null && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card size="small" className="reports-kpi-card">
                        <Statistic
                          title={app.t("Avoidable CO2 Emissions")}
                          value={formatAdvisorMetricValue(wasteCo2)}
                          suffix="kg"
                          prefix={
                            <ThunderboltOutlined style={{ color: "#10b981" }} />
                          }
                        />
                      </Card>
                    </Col>
                  )}
                </GridRow>
              )}

              {wasteRationale && (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  <Typography.Text strong>
                    {app.t("Avoidable waste rationale:")}{" "}
                  </Typography.Text>
                  {wasteRationale}
                </Typography.Paragraph>
              )}

              {outliers.length > 0 && (
                <div>
                  <Typography.Text strong>
                    {app.t("Vehicle Outliers")}
                  </Typography.Text>
                  <Table<Row>
                    size="small"
                    style={{ marginTop: 8 }}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    rowKey={(r, idx) =>
                      `${text(r.vehicle_label)}-${idx}`
                    }
                    dataSource={outliers}
                    columns={[
                      {
                        title: app.t("Vehicle"),
                        dataIndex: "vehicle_label",
                        key: "vehicle_label",
                        render: (v: unknown) => (
                          <Typography.Text strong>
                            {text(v) || app.t("unknown")}
                          </Typography.Text>
                        ),
                      },
                      {
                        title: app.t("Issue"),
                        dataIndex: "issue",
                        key: "issue",
                        render: (v: unknown) => text(v) || "—",
                      },
                      {
                        title: app.t("Fuel (L)"),
                        dataIndex: "fuel_litres",
                        key: "fuel_litres",
                        align: "right",
                        render: (v: unknown) =>
                          v === null || v === undefined || v === ""
                            ? "—"
                            : `${formatAdvisorMetricValue(v)} L`,
                      },
                      {
                        title: app.t("CO2 (kg)"),
                        dataIndex: "co2_kg",
                        key: "co2_kg",
                        align: "right",
                        render: (v: unknown) =>
                          v === null || v === undefined || v === ""
                            ? "—"
                            : `${formatAdvisorMetricValue(v)} kg`,
                      },
                      {
                        title: app.t("Recommended Action"),
                        dataIndex: "recommended_action",
                        key: "recommended_action",
                        render: (v: unknown) => text(v) || "—",
                      },
                    ]}
                  />
                </div>
              )}

              {recommendations.length > 0 && (
                <div>
                  <Typography.Text strong>
                    {app.t("Recommendations")}
                  </Typography.Text>
                  <div className="stack" style={{ marginTop: 8, gap: 10 }}>
                    {recommendations.map((rec, idx) => {
                      const priority = text(rec.priority) || "medium";
                      return (
                        <Card key={`${text(rec.title)}-${idx}`} size="small">
                          <div className="stack" style={{ gap: 6 }}>
                            <Space wrap>
                              <Tag color={priorityTagColor(priority)}>
                                {priority.toUpperCase()}
                              </Tag>
                              <Typography.Text strong>
                                {text(rec.title) || "—"}
                              </Typography.Text>
                            </Space>
                            {text(rec.detail) && (
                              <Typography.Paragraph style={{ marginBottom: 0 }}>
                                {text(rec.detail)}
                              </Typography.Paragraph>
                            )}
                            {text(rec.expected_impact) && (
                              <Typography.Text type="secondary">
                                <strong>{app.t("Expected impact:")}</strong>{" "}
                                {text(rec.expected_impact)}
                              </Typography.Text>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {esgHighlights.length > 0 && (
                <div>
                  <Typography.Text strong>
                    {app.t("ESG Highlights")}
                  </Typography.Text>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                    {esgHighlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
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
                <Button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                >
                  {app.t("Close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function Reports() {
  const app = useApp();
  const q = useData<ReportSummaryData>(
    orgPath(app.organizationId, "/reports/summary"),
  );
  const report = q.data?.data;
  const fleet = report?.fleet_summary;
  const safety = report?.safety_summary;
  const alerts = report?.alerts_summary;
  const compliance = report?.compliance_summary;
  const maintenance = report?.maintenance_summary;
  const dailyTrend = safety?.daily_trend ?? [];
  const dailyTelemetry = report?.daily_telemetry ?? [];
  const driverScores = safety?.driver_scores ?? [];
  const recentHarshEvents = safety?.recent_harsh_events ?? [];

  const avgScore = safety?.average_safety_score ?? null;

  return (
    <div className="stack">
      <PageTitle
        title={app.t("reports")}
        subtitle={app.t(
          "Organization activity, safety telemetry, and operational compliance summary.",
        )}
        extra={
          <Space wrap>
            {report?.as_of && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {app.t("Generated:")} <Time value={report.as_of} />
              </Typography.Text>
            )}
            <Button
              icon={<ReloadOutlined spin={q.isFetching} />}
              loading={q.isFetching}
              onClick={() => void q.refetch()}
            >
              {app.t("refresh")}
            </Button>
          </Space>
        }
      />

      <ErrorNotice error={q.error} />


      {/* 1. KPI Summary Cards (3x3 grid) */}
      <GridRow gutter={[16, 16]} className="reports-kpi-row">
        {/* Vehicles */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("Active Vehicles")}
              value={fleet?.active_vehicles ?? 0}
              suffix={`/ ${report?.vehicles ?? 0}`}
              prefix={<CarOutlined style={{ color: "#1677ff" }} />}
            />
            <div className="reports-kpi-sub">
              <Tag color="success">
                {fleet?.active_vehicles ?? 0} {app.t("active")}
              </Tag>
              <Tag>
                {fleet?.inactive_or_maintenance_vehicles ?? 0}{" "}
                {app.t("inactive/service")}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Drivers */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("Active Drivers")}
              value={fleet?.active_drivers ?? 0}
              suffix={`/ ${report?.drivers ?? 0}`}
              prefix={<UserOutlined style={{ color: "#06b6d4" }} />}
            />
            <div className="reports-kpi-sub">
              <Tag color="processing">
                {fleet?.active_shifts ?? 0} {app.t("active shifts")}
              </Tag>
              <Tag>{fleet?.inactive_drivers ?? 0} {app.t("inactive")}</Tag>
            </div>
          </Card>
        </Col>

        {/* Average Safety Score */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="reports-kpi-card"
            size="small"
            title={app.t("Average Safety Score")}
          >
            {safety?.safety_enabled ? (
              <div className="reports-score-card-body">
                <Progress
                  type="dashboard"
                  percent={avgScore !== null ? Math.round(avgScore) : 0}
                  size={84}
                  strokeColor={
                    avgScore === null
                      ? "#cbd5e1"
                      : avgScore >= 85
                        ? "#22c55e"
                        : avgScore >= 70
                          ? "#f59e0b"
                          : "#ef4444"
                  }
                  format={() =>
                    avgScore !== null ? avgScore.toFixed(1) : "N/A"
                  }
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {avgScore !== null
                      ? `${avgScore.toFixed(1)} / 100`
                      : app.t("No Telemetry")}
                  </div>
                  <div className="reports-kpi-sub">
                    <span>
                      {app.t("Scored:")}{" "}
                      <strong>
                        {safety.scored_drivers ?? 0} /{" "}
                        {safety.total_drivers ?? 0}
                      </strong>{" "}
                      {app.t("drivers")}
                    </span>
                  </div>
                  <div className="reports-kpi-sub">
                    <span>
                      {app.t("Range:")}{" "}
                      <strong>{safety.min_score ?? "—"}</strong> min ·{" "}
                      <strong>{safety.max_score ?? "—"}</strong> max
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Tag color="default">{app.t("Safety Feature Inactive")}</Tag>
                <div className="reports-kpi-sub">
                  {app.t(
                    "Safety analytics is not enabled for this subscription tier.",
                  )}
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Safety Observations */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("Safety Observations")}
              value={safety?.total_observed ?? report?.safety_observations ?? 0}
              prefix={<WarningOutlined style={{ color: "#f59e0b" }} />}
            />
            <div className="reports-kpi-sub">
              <Tag color="error">
                {safety?.harsh_braking_count ?? 0} {app.t("Braking")}
              </Tag>
              <Tag color="warning">
                {safety?.rapid_acceleration_count ?? 0} {app.t("Accel")}
              </Tag>
              {(safety?.pending_appeals ?? 0) > 0 && (
                <Tag color="purple">
                  {safety?.pending_appeals} {app.t("appeals")}
                </Tag>
              )}
            </div>
          </Card>
        </Col>

        {/* Open Alerts */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("Open Alerts")}
              value={alerts?.open ?? report?.open_alerts ?? 0}
              prefix={
                <AlertOutlined
                  style={{
                    color: (alerts?.open ?? 0) > 0 ? "#ef4444" : "#10b981",
                  }}
                />
              }
            />
            <div className="reports-kpi-sub">
              <span>
                {alerts?.acknowledged ?? 0} {app.t("ack")} ·{" "}
                {alerts?.resolved ?? 0} {app.t("resolved")} (
                {alerts?.total ?? 0} {app.t("total")})
              </span>
            </div>
          </Card>
        </Col>

        {/* Compliance Obligations */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("Compliance Obligations")}
              value={
                compliance?.total_obligations ??
                report?.compliance_obligations ??
                0
              }
              prefix={
                <SafetyCertificateOutlined style={{ color: "#10b981" }} />
              }
            />
            <div className="reports-kpi-sub">
              <Tag color="success">
                {compliance?.verified_records ?? 0} {app.t("verified")}
              </Tag>
              <Tag color="warning">
                {compliance?.pending_records ?? 0} {app.t("pending")}
              </Tag>
              {(compliance?.expired_or_overdue ?? 0) > 0 && (
                <Tag color="error">
                  {compliance?.expired_or_overdue} {app.t("overdue")}
                </Tag>
              )}
            </div>
          </Card>
        </Col>

        {/* 30-Day Distance */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("30-Day Distance")}
              value={
                fleet?.distance_km_30d !== undefined
                  ? Number(fleet.distance_km_30d).toFixed(1)
                  : "—"
              }
              suffix="km"
              prefix={<AimOutlined style={{ color: "#3b82f6" }} />}
            />
            <div className="reports-kpi-sub">
              <span>
                {fleet?.total_journeys_in_window ?? 0}{" "}
                {app.t("journeys in 30d")} ({fleet?.active_journeys ?? 0}{" "}
                {app.t("active")})
              </span>
            </div>
          </Card>
        </Col>

        {/* 30-Day Fuel */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("30-Day Fuel")}
              value={
                fleet?.fuel_litres_30d !== undefined
                  ? Number(fleet.fuel_litres_30d).toFixed(1)
                  : "—"
              }
              suffix="L"
              prefix={<FireOutlined style={{ color: "#f97316" }} />}
            />
            <div className="reports-kpi-sub">
              <span>{app.t("Estimated from OBD sensor rates")}</span>
            </div>
          </Card>
        </Col>

        {/* 30-Day Estimated CO2 */}
        <Col xs={24} sm={12} lg={8}>
          <Card className="reports-kpi-card" size="small">
            <Statistic
              title={app.t("30-Day Estimated CO2")}
              value={
                fleet?.estimated_co2_kg_30d !== undefined
                  ? Number(fleet.estimated_co2_kg_30d).toFixed(1)
                  : "—"
              }
              suffix="kg"
              prefix={<ThunderboltOutlined style={{ color: "#10b981" }} />}
            />
            <div className="reports-kpi-sub">
              <span>{app.t("GHG Mobile Combustion Factor")}</span>
            </div>
          </Card>
        </Col>
      </GridRow>

      {app.workspace !== "platform" && app.can("reports.read") && (
        <FleetCarbonAdvisorCard />
      )}

      {/* 2. Recent 50 Harsh Events Map & Inspect Drawer */}
      <HarshEventsSection
        harshEvents={recentHarshEvents}
        t={app.t}
      />

      {/* 3. Charts: 14-day Safety Trend & 14-day Telemetry Activity */}
      <GridRow gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            className="reports-chart-card"
            size="small"
            title={app.t("14-Day Safety Observations Trend")}
          >
            <SafetyTrendChart
              dailyTrend={dailyTrend}
              t={app.t}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="reports-chart-card"
            size="small"
            title={app.t("14-Day Telemetry & Distance/Fuel Activity")}
          >
            <TelemetryActivityChart
              dailyTelemetry={dailyTelemetry}
              t={app.t}
            />
          </Card>
        </Col>
      </GridRow>

      {/* 4. Driver Safety Scores comparison bar chart & leaderboard */}
      <DriverScoresSection
        driverScores={driverScores}
        safetyEnabled={Boolean(safety?.safety_enabled)}
        t={app.t}
      />

      {/* 5. Alerts breakdown, Compliance summary, and Maintenance summary cards */}
      <OperationalSummaryCards
        alerts={alerts}
        compliance={compliance}
        maintenance={maintenance}
        t={app.t}
      />
    </div>
  );
}
export function Logs({ platform = false }: { platform?: boolean }) {
  const app = useApp(),
    path = orgPath(app.organizationId),
    [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().subtract(1, "day"),
      dayjs(),
    ]),
    [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]),
    [aiBusy, setAiBusy] = useState(false),
    [aiError, setAiError] = useState<unknown>(null),
    [aiResult, setAiResult] = useState<Row | null>(null),
    aiAbortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      aiAbortRef.current?.abort();
    },
    [],
  );

  const query = { ...windowQuery(range), per_page: 100 };

  const analyzeSelected = async () => {
    if (selectedAuditIds.length === 0 || aiBusy) return;
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiBusy(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await api<Row>(`${path}/audit-ai`, {
        method: "POST",
        body: { audit_ids: selectedAuditIds.slice(0, 20) },
        sensitive: true,
        readOnlyAction: true,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setAiResult(res.data);
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setAiError(e);
      }
    } finally {
      setAiBusy(false);
    }
  };

  const logRender: Record<
    string,
    (value: unknown, row: Row) => React.ReactNode
  > = {
    method: (v) =>
      text(v) ? (
        <Tag>{text(v)}</Tag>
      ) : (
        <span className="muted">{app.t("unknown")}</span>
      ),
    http_status: (v) => httpStatusTag(v, app.t("unknown")),
    outcome: (v) => outcomeTag(v, app.t),
    action: (v) =>
      text(v) ? (
        <Tag>{text(v)}</Tag>
      ) : (
        <span className="muted">{app.t("unknown")}</span>
      ),
    source: (v) =>
      text(v) ? (
        <Tag>{text(v)}</Tag>
      ) : (
        <span className="muted">{app.t("unknown")}</span>
      ),
    actor_name: (v) =>
      text(v) ? (
        <span>{text(v)}</span>
      ) : (
        <span className="muted">{app.t("unknown")}</span>
      ),
    actor_user_id: (v) => <Value field="actor_user_id" value={v} />,
    user_agent: (v, row) => {
      const ua = text(v);
      if (!ua) return <span className="muted">{app.t("unknown")}</span>;
      const browser = text(row.browser);
      return (
        <Tooltip title={browser ? `${browser} · ${ua}` : ua}>
          <Typography.Text ellipsis style={{ maxWidth: 240 }}>
            {ua}
          </Typography.Text>
        </Tooltip>
      );
    },
  };

  const aiItems = aiResult ? rows(aiResult.items) : [];

  return (
    <div className="stack">
      <PageTitle
        title={app.t("logs")}
        subtitle={
          platform
            ? app.t(
                "Global request metadata without tenant business association.",
              )
            : app.t("Permissioned request and action responsibility records.")
        }
      />
      <TimeWindow
        value={range}
        onChange={(nextRange) => {
          setRange(nextRange);
          setSelectedAuditIds([]);
        }}
        maxDays={31}
      />
      <Tabs
        destroyOnHidden
        items={[
          ...(platform || app.can("request_logs.read")
            ? [
                {
                  key: "requests",
                  label: app.t("HTTP requests"),
                  children: (
                    <Directory
                      path={
                        platform
                          ? "/api/v1/platform/request-logs"
                          : `${path}/request-logs`
                      }
                      query={query}
                      fields={[
                        "request_id",
                        "started_at",
                        "method",
                        "route",
                        "http_status",
                        "ip_address",
                        "user_agent",
                        "duration_ms",
                      ]}
                      render={logRender}
                    />
                  ),
                },
              ]
            : []),
          ...(!platform && app.can("audit.read")
            ? [
                {
                  key: "audit",
                  label: app.t("Action audit"),
                  children: (
                    <div className="stack">
                      <ErrorNotice error={aiError} />
                      {aiResult && (
                        <Card
                          title={app.t("Action Audit AI Analysis")}
                          extra={
                            <Space wrap>
                              <GeminiPoweredBadge />
                              <Button onClick={() => setAiResult(null)}>
                                {app.t("Close")}
                              </Button>
                            </Space>
                          }
                        >
                          <div className="stack">
                            <div>
                              <Typography.Text strong>
                                {app.t("Overall summary")}
                              </Typography.Text>
                              <Typography.Paragraph style={{ marginTop: 4 }}>
                                {text(aiResult.summary)}
                              </Typography.Paragraph>
                            </div>
                            {aiItems.length > 0 && (
                              <div>
                                <Typography.Text strong>
                                  {app.t("Per-action breakdown")}
                                </Typography.Text>
                                <Table<Row>
                                  size="small"
                                  style={{ marginTop: 8 }}
                                  rowKey={(r, idx) =>
                                    text(r.id) || `ai-item-${idx}`
                                  }
                                  dataSource={aiItems}
                                  pagination={false}
                                  scroll={{ x: "max-content" }}
                                  columns={[
                                    {
                                      title: app.t("action"),
                                      dataIndex: "action",
                                      key: "action",
                                      render: (v: unknown) => (
                                        <Tag>{text(v) || app.t("unknown")}</Tag>
                                      ),
                                    },
                                    {
                                      title: app.t("Intent"),
                                      dataIndex: "intent",
                                      key: "intent",
                                    },
                                    {
                                      title: app.t("Summary"),
                                      dataIndex: "summary",
                                      key: "summary",
                                    },
                                    {
                                      title: app.t("Status / Risk"),
                                      dataIndex: "risk_or_status",
                                      key: "risk_or_status",
                                    },
                                    {
                                      title: app.t("id"),
                                      dataIndex: "id",
                                      key: "id",
                                      render: (v: unknown) => (
                                        <span className="reference">
                                          {text(v) || app.t("unknown")}
                                        </span>
                                      ),
                                    },
                                  ]}
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                      <Directory
                        path={`${path}/audit-logs`}
                        query={query}
                        fields={[
                          "occurred_at",
                          "actor_name",
                          "actor_user_id",
                          "action",
                          "outcome",
                          "request_id",
                          "method",
                          "route",
                          "http_status",
                          "ip_address",
                          "user_agent",
                          "source",
                          "id",
                        ]}
                        render={logRender}
                        rowSelection={{
                          selectedRowKeys: selectedAuditIds,
                          onChange: (keys) => {
                            setSelectedAuditIds(
                              keys.map((k) => String(k)).slice(0, 20),
                            );
                          },
                          getCheckboxProps: (row) => {
                            const rowId = text(row.id);
                            const isSelected = selectedAuditIds.includes(rowId);
                            return {
                              disabled:
                                !rowId ||
                                (!isSelected && selectedAuditIds.length >= 20),
                            };
                          },
                        }}
                        toolbarExtra={
                          <Space wrap>
                            {selectedAuditIds.length > 0 && (
                              <Button
                                onClick={() => setSelectedAuditIds([])}
                                disabled={aiBusy}
                              >
                                {app.t("Clear selection")}
                              </Button>
                            )}
                            <Button
                              type="primary"
                              loading={aiBusy}
                              disabled={selectedAuditIds.length === 0 || aiBusy}
                              onClick={() => void analyzeSelected()}
                            >
                              {app
                                .t("Analyze selected with AI ({count})")
                                .replace(
                                  "{count}",
                                  String(selectedAuditIds.length),
                                )}
                            </Button>
                          </Space>
                        }
                      />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
