import { useCallback, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row as GridRow,
  Progress,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { orgPath } from "../api/client";
import { rows, text, type Row } from "../api/types";
import { CoordinateMap } from "../components/CoordinateMap";
import {
  Directory,
  ErrorNotice,
  Metrics,
  PageTitle,
  Time,
  useData,
  useTelemetryRefreshMs,
} from "../components/shared";
import { money } from "./billing";
import { PlatformHealthTriageCard } from "./platform";

export interface PlatformReportSummary {
  as_of: string;
  organizations: number;
  active_paid_subscriptions: number;
  registered_devices: number;
  activated_devices: number;
  paid_invoice_total_minor: number;
  currency: string;
  total_users?: number;
  total_vehicles?: number;
  total_drivers?: number;
  saas_staff_count?: number;
  subscriptions_by_status?: Record<string, number>;
  devices_by_status?: Record<string, number>;
  paid_invoices_count?: number;
  revenue_30d_minor?: number;
  telemetry_samples_24h?: number;
  requests_24h?: number | null;
  requests_7d?: number | null;
  error_requests_24h?: number | null;
  server_errors_24h?: number | null;
  avg_latency_ms_24h?: number | null;
  daily_requests_7d?: { date: string; count: number; errors: number }[];
  top_endpoints_24h?: {
    method: string;
    path: string;
    route?: string;
    count: number;
  }[];
}

const num = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString();

function Breakdown({
  title,
  data,
}: {
  title: string;
  data?: Record<string, number>;
}) {
  const app = useApp();
  const entries = Object.entries(data ?? {});
  const total = entries.reduce((n, [, v]) => n + Number(v), 0);
  return (
    <Card title={title} size="small">
      {entries.length === 0 ? (
        <span className="muted">—</span>
      ) : (
        <div className="stack">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{app.t(k)}</span>
                <strong>{num(v)}</strong>
              </div>
              <Progress
                percent={total ? Math.round((Number(v) / total) * 100) : 0}
                showInfo={false}
                size="small"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PlatformReport({ report }: { report?: PlatformReportSummary }) {
  const app = useApp();
  const r = report;
  const currency = text(r?.currency) || "MYR";
  const errorRate =
    r?.requests_24h &&
    r.error_requests_24h !== null &&
    r.error_requests_24h !== undefined
      ? `${((r.error_requests_24h / r.requests_24h) * 100).toFixed(1)}%`
      : "—";
  const stat = (title: string, value: string | number) => (
    <Col xs={24} sm={12} lg={6} key={title}>
      <Card>
        <Statistic title={title} value={value} />
      </Card>
    </Col>
  );
  const daily = r?.daily_requests_7d ?? [];
  const max = Math.max(1, ...daily.map((d) => d.count));
  return (
    <div className="stack">
      <GridRow gutter={[16, 16]}>
        {stat(app.t("organizations"), num(r?.organizations))}
        {stat(app.t("Total users"), num(r?.total_users))}
        {stat(app.t("Total vehicles"), num(r?.total_vehicles))}
        {stat(app.t("Total drivers"), num(r?.total_drivers))}
        {stat(app.t("SaaS staff"), num(r?.saas_staff_count))}
        {stat(
          app.t("active_paid_subscriptions"),
          num(r?.active_paid_subscriptions),
        )}
        {stat(app.t("registered_devices"), num(r?.registered_devices))}
        {stat(app.t("activated_devices"), num(r?.activated_devices))}
        {stat(
          app.t("Paid invoice total"),
          r ? money(r.paid_invoice_total_minor, currency) : "—",
        )}
        {stat(
          app.t("Revenue (30 days)"),
          r?.revenue_30d_minor === undefined
            ? "—"
            : money(r.revenue_30d_minor, currency),
        )}
        {stat(app.t("Paid invoices"), num(r?.paid_invoices_count))}
        {stat(app.t("Telemetry samples (24h)"), num(r?.telemetry_samples_24h))}
      </GridRow>
      <GridRow gutter={[16, 16]}>
        {stat(app.t("Requests (24h)"), num(r?.requests_24h))}
        {stat(app.t("Requests (7d)"), num(r?.requests_7d))}
        {stat(
          app.t("Errors (24h)"),
          r?.error_requests_24h === null || r?.error_requests_24h === undefined
            ? "—"
            : `${num(r.error_requests_24h)} (${errorRate})`,
        )}
        {stat(
          app.t("Avg latency (24h)"),
          r?.avg_latency_ms_24h === null || r?.avg_latency_ms_24h === undefined
            ? "—"
            : `${Math.round(r.avg_latency_ms_24h)} ms`,
        )}
      </GridRow>
      <GridRow gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={app.t("Requests, last 7 days")} size="small">
            {daily.length === 0 ? (
              <span className="muted">—</span>
            ) : (
              <div className="stack">
                {daily.map((d) => (
                  <div key={d.date}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{d.date}</span>
                      <span>
                        {num(d.count)}
                        {d.errors > 0 && (
                          <Tag color="red" style={{ marginLeft: 8 }}>
                            {num(d.errors)} {app.t("errors")}
                          </Tag>
                        )}
                      </span>
                    </div>
                    <Progress
                      percent={Math.round((d.count / max) * 100)}
                      success={{
                        percent: Math.round(((d.count - d.errors) / max) * 100),
                      }}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={app.t("Top endpoints (24h)")} size="small">
            <Table
              size="small"
              pagination={false}
              rowKey={(e) => `${e.method} ${e.path}`}
              dataSource={r?.top_endpoints_24h ?? []}
              columns={[
                {
                  title: app.t("Method"),
                  dataIndex: "method",
                  width: 90,
                  render: (v: string) => <Tag>{v}</Tag>,
                },
                { title: app.t("Path"), dataIndex: "path", ellipsis: true },
                {
                  title: app.t("Requests"),
                  dataIndex: "count",
                  align: "right",
                  width: 100,
                  render: (v: number) => num(v),
                },
              ]}
            />
          </Card>
        </Col>
      </GridRow>
      <GridRow gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Breakdown
            title={app.t("Subscriptions by status")}
            data={r?.subscriptions_by_status}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Breakdown
            title={app.t("Devices by status")}
            data={r?.devices_by_status}
          />
        </Col>
      </GridRow>
    </div>
  );
}

export function Overview({ platform = false }: { platform?: boolean }) {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId);
  const { refreshSeconds, pollMs } = useTelemetryRefreshMs(!platform);
  const q = useData(
    platform ? "/api/v1/platform/reports/summary" : `${path}/dashboard`,
    {},
    true,
    platform ? 30000 : pollMs,
  );
  const [items, setItems] = useState<Row[]>([]),
    onData = useCallback((rowsList: Row[]) => setItems(rowsList), []);
  const platformSummary = q.data?.data;
  const dtcEpisodes = rows(q.data?.data?.dtc_episodes);
  const activeDtcCount = Number(q.data?.data?.active_dtc_episodes ?? 0);
  return (
    <div className="stack">
      <PageTitle
        title={app.t(platform ? "reports" : "dashboard")}
        subtitle={
          platform
            ? app.t(
                "Current platform counts and confirmed paid-invoice totals.",
              )
            : app.t(
                "Last-known fleet observations and today’s operational context.",
              )
        }
        extra={
          <Button onClick={() => void q.refetch()} loading={q.isFetching}>
            {app.t("refresh")}
          </Button>
        }
      />
      <ErrorNotice error={q.error} />
      {platform ? (
        <>
          <PlatformReport
            report={
              platformSummary as unknown as PlatformReportSummary | undefined
            }
          />
          {app.session?.platform?.role === "admin" && (
            <PlatformHealthTriageCard />
          )}
        </>
      ) : (
        <Metrics
          data={q.data?.data}
          fields={[
            "vehicles",
            "observed_vehicles",
            "active_shifts",
            "active_automatic_journeys",
          ]}
        />
      )}
      {q.data && (
        <Typography.Text type="secondary">
          {app.t("As of")} <Time value={q.data.data.as_of} />
          {!platform &&
            ` · ${app.t("Automatic journeys are not passenger fares.")}`}
        </Typography.Text>
      )}
      {!platform && (
        <>
          <GridRow gutter={[16, 16]}>
            <Col xs={24} xl={17}>
              <Card
                title={app.t("Fleet coordinates")}
                extra={
                  <span className="live-label">
                    ●{" "}
                    {app
                      .t("Auto-refresh every {seconds}s (threshold + 5s)")
                      .replace("{seconds}", String(refreshSeconds))}
                  </span>
                }
              >
                <CoordinateMap
                  items={items}
                  mode="fleet"
                  onSelect={(r) =>
                    navigate(
                      `/organization/${app.organizationId}/vehicles/${r.id}`,
                    )
                  }
                />
              </Card>
            </Col>
            <Col xs={24} xl={7}>
              <Card title={app.t("Operational context")}>
                <div className="stack">
                  <GridRow gutter={[12, 12]}>
                    {[
                      "open_alerts",
                      "pending_telemetry",
                      ...(app.can("incidents.read")
                        ? ["open_incidents", "critical_open_incidents"]
                        : []),
                    ].map((key) => (
                      <Col xs={12} key={key}>
                        <Card size="small">
                          <Statistic
                            title={app.t(key)}
                            value={
                              q.data?.data?.[key] === null ||
                              q.data?.data?.[key] === undefined
                                ? "—"
                                : text(q.data?.data?.[key])
                            }
                            valueStyle={
                              key === "critical_open_incidents" &&
                              Number(q.data?.data?.[key] ?? 0) > 0
                                ? { color: "#cf1322" }
                                : undefined
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </GridRow>
                  {app.can("incidents.read") && (
                    <Button
                      block
                      onClick={() =>
                        navigate(
                          `/organization/${app.organizationId}/incidents`,
                        )
                      }
                    >
                      {app.t("inc_open_console")}
                    </Button>
                  )}

                  <Typography.Text type="secondary">
                    {app.t(
                      "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.",
                    )}
                  </Typography.Text>
                </div>
              </Card>
            </Col>
          </GridRow>
          {app.can("telemetry.read") && (
            <>
              <Card
                title={app.t("Vehicle DTC Fault & Check-Engine Timeline")}
                extra={
                  <Tag color={activeDtcCount > 0 ? "error" : "success"}>
                    {activeDtcCount} {app.t("active")}
                  </Tag>
                }
              >
                <Table<Row>
                  size="small"
                  rowKey={(r) => text(r.id)}
                  dataSource={dtcEpisodes}
                  pagination={{ pageSize: 8, hideOnSinglePage: true }}
                  scroll={{ x: "max-content" }}
                  locale={{
                    emptyText: app.t(
                      "No active or historical DTC fault episodes recorded.",
                    ),
                  }}
                  columns={[
                    {
                      title: app.t("Vehicle"),
                      key: "vehicle",
                      render: (_v, r) => (
                        <Space direction="vertical" size={0}>
                          <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, height: "auto" }}
                            onClick={() =>
                              navigate(
                                `/organization/${app.organizationId}/vehicles/${text(r.vehicle_id)}`,
                              )
                            }
                          >
                            {text(r.registration_number) || text(r.vehicle_id)}
                          </Button>
                          {(text(r.make) || text(r.model)) && (
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {[text(r.make), text(r.model)]
                                .filter(Boolean)
                                .join(" ")}
                            </Typography.Text>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: app.t("DTC code"),
                      dataIndex: "code",
                      render: (v: unknown) => (
                        <Tag color="error">{text(v) || "—"}</Tag>
                      ),
                    },
                    {
                      title: app.t("Catalog info"),
                      key: "catalog",
                      render: (_v, r) => {
                        const comp = text(r.catalog_component);
                        const desc = text(r.catalog_description);
                        if (!comp && !desc) {
                          return <span className="muted">—</span>;
                        }
                        return (
                          <Space direction="vertical" size={0}>
                            {comp && <Tag>{comp}</Tag>}
                            {desc && (
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: 12, maxWidth: 260 }}
                                ellipsis={{ tooltip: desc }}
                              >
                                {desc}
                              </Typography.Text>
                            )}
                          </Space>
                        );
                      },
                    },
                    {
                      title: app.t("status"),
                      key: "status",
                      render: (_v, r) => (
                        <Space size={4} wrap>
                          {text(r.status) === "active" ? (
                            <Tag color="error">{app.t("Active (Lit Up)")}</Tag>
                          ) : (
                            <Tag color="success">{app.t("Cleared")}</Tag>
                          )}
                          {Boolean(r.mil_on) && (
                            <Tag color="warning">{app.t("MIL On")}</Tag>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: app.t("Started at"),
                      dataIndex: "started_at",
                      render: (v: unknown) => <Time value={v} />,
                    },
                    {
                      title: app.t("Ended at / Till"),
                      dataIndex: "ended_at",
                      render: (v: unknown) =>
                        v ? (
                          <Time value={v} />
                        ) : (
                          <Tag color="volcano">{app.t("Ongoing (Active)")}</Tag>
                        ),
                    },
                    {
                      title: app.t("Samples"),
                      dataIndex: "samples_count",
                      align: "right",
                      render: (v: unknown) => text(v) || "1",
                    },
                    {
                      title: app.t("Email alert"),
                      dataIndex: "email_notified_at",
                      render: (v: unknown) =>
                        v ? (
                          <Tag color="processing">{app.t("Email Sent")}</Tag>
                        ) : (
                          <span className="muted">—</span>
                        ),
                    },
                    {
                      title: app.t("actions"),
                      key: "actions",
                      render: (_v, r) => (
                        <Button
                          size="small"
                          onClick={() =>
                            navigate(
                              `/organization/${app.organizationId}/vehicles/${text(r.vehicle_id)}`,
                            )
                          }
                        >
                          {app.t("inspect")}
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
              <div className="stack">
                <Typography.Title level={4}>
                  {app.t("Fleet vehicle status")}
                </Typography.Title>
                <Directory
                  path={`${path}/fleet-states`}
                  query={{ per_page: 100 }}
                  fields={[
                    "registration_number",
                    "make",
                    "model",
                    "current_driver_name",
                    "speed_kmh",
                    "freshness",
                    "occurred_at",
                    "has_fault_code",
                    "dtc_codes",
                  ]}
                  render={{
                    current_driver_name: (v) =>
                      text(v) ? (
                        <Tag color="blue">{text(v)}</Tag>
                      ) : (
                        <span className="muted">{app.t("No active driver")}</span>
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
                  }}
                  poll={pollMs}
                  onData={onData}
                  action={(r) => (
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(
                          `/organization/${app.organizationId}/vehicles/${r.id}`,
                        )
                      }
                    >
                      {app.t("inspect")}
                    </Button>
                  )}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
