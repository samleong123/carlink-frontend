import { useEffect, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { api, orgPath, segment } from "../api/client";
import { object, rows, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import { AiHistoryPanel } from "../components/AiHistoryPanel";
import {
  Details,
  ErrorNotice,
  GeminiPoweredBadge,
  Time,
  useData,
} from "../components/shared";

export function CommandStatus({ id }: { id: string }) {
  const app = useApp(),
    [started] = useState(Date.now());
  const q = useData(
    orgPath(app.organizationId, `/device-commands/${segment(id)}`),
    {},
    true,
  );
  const command = object(q.data?.data.command),
    terminal = ["completed", "failed", "expired", "cancelled"].includes(
      String(command.state),
    );
  useEffect(() => {
    if (terminal || q.error || Date.now() - started > 360000) return;
    const timer = window.setInterval(() => {
      if (Date.now() - started >= 360000) {
        window.clearInterval(timer);
        return;
      }
      if (!document.hidden) void q.refetch();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [terminal, q.error, q.refetch, started]);
  return (
    <Card
      title={app.t("Command status")}
      extra={
        <Button onClick={() => void q.refetch()} loading={q.isFetching}>
          {app.t("refresh")}
        </Button>
      }
    >
      <ErrorNotice error={q.error} />
      <Details data={{ command_id: id, ...command }} />
      <Typography.Paragraph type="secondary">
        {app.t(
          "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.",
        )}
      </Typography.Paragraph>
    </Card>
  );
}
export function Diagnostics({
  vehicleId,
  sample,
  device,
}: {
  vehicleId: string;
  sample: Row;
  device: Row;
}) {
  const app = useApp(),
    { modal } = App.useApp(),
    [result, setResult] = useState<Row | null>(null),
    [history, setHistory] = useState<Row[]>([]),
    [catalog, setCatalog] = useState<Row[]>([]),
    [activeGenerationId, setActiveGenerationId] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [form] = Form.useForm();
  const [ack, setAck] = useState(false),
    [scanBusy, setScanBusy] = useState(false),
    [scanError, setScanError] = useState<unknown>(null),
    [scanCommandId, setScanCommandId] = useState<string | null>(null);
  const [configBusy, setConfigBusy] = useState(false),
    [configError, setConfigError] = useState<unknown>(null),
    [configCommandId, setConfigCommandId] = useState<string | null>(null);
  const explaining = useRef<AbortController | null>(null),
    scanning = useRef(false),
    configuring = useRef(false);

  const diagnosticsQ = useData(
    orgPath(app.organizationId, `/vehicles/${segment(vehicleId)}/diagnostics`),
    {},
    app.can("telemetry.read"),
  );

  useEffect(() => {
    const data = diagnosticsQ.data?.data;
    if (!data) return;
    if (Array.isArray(data.dtc_catalog)) {
      setCatalog(rows(data.dtc_catalog));
    }
    if (Array.isArray(data.ai_history)) {
      setHistory(rows(data.ai_history));
    }
  }, [diagnosticsQ.data]);

  useEffect(
    () => () => {
      form.resetFields();
      explaining.current?.abort();
      setResult(null);
    },
    [form],
  );
  const hasSpeed =
    sample.speed_kmh !== null &&
    sample.speed_kmh !== undefined &&
    Number.isFinite(Number(sample.speed_kmh));
  const isStationary = hasSpeed && Number(sample.speed_kmh) === 0;
  const vehicleData = object(sample.vehicle_data);
  const activeDtcCodes = Array.isArray(vehicleData.dtc_codes)
    ? vehicleData.dtc_codes
    : [];
  const dtcEpisodes = rows(diagnosticsQ.data?.data?.dtc_episodes);

  const runExtendedScan = async () => {
    if (!ack || !isStationary || scanning.current) return;
    scanning.current = true;
    setScanBusy(true);
    setScanError(null);
    try {
      const r = await api<Row>(
        orgPath(
          app.organizationId,
          `/vehicles/${segment(vehicleId)}/extended-dtc`,
        ),
        {
          method: "POST",
          body: { acknowledge_interruption: true },
        },
      );
      setScanCommandId(text(r.data.command_id));
      setAck(false);
    } catch (e) {
      setScanError(e);
    } finally {
      scanning.current = false;
      setScanBusy(false);
    }
  };
  const pushConfiguration = async () => {
    if (configuring.current) return;
    configuring.current = true;
    setConfigBusy(true);
    const confirmed = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title: app.t("Push device configuration"),
        content: app.t(
          "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.",
        ),
        okText: app.t("confirm"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );
    if (!confirmed) {
      configuring.current = false;
      setConfigBusy(false);
      return;
    }
    setConfigError(null);
    try {
      const r = await api<Row>(
        orgPath(
          app.organizationId,
          `/vehicles/${segment(vehicleId)}/configuration`,
        ),
        { method: "POST" },
      );
      setConfigCommandId(text(r.data.command_id));
    } catch (e) {
      setConfigError(e);
    } finally {
      configuring.current = false;
      setConfigBusy(false);
    }
  };
  const explain = async ({
    code,
    refresh = false,
  }: {
    code: string;
    refresh?: boolean;
  }) => {
    explaining.current?.abort();
    const controller = new AbortController();
    explaining.current = controller;
    const normalizedCode = code.toUpperCase().trim();
    form.setFieldValue("code", normalizedCode);
    setResult(null);
    setBusy(true);
    setError(null);
    try {
      const r = await api<Row>(orgPath(app.organizationId, "/dtc-ai"), {
        method: "POST",
        body: refresh
          ? { code: normalizedCode, refresh: true }
          : { code: normalizedCode },
        sensitive: true,
        readOnlyAction: true,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setResult(r.data);
        if (Array.isArray(r.data.catalog)) {
          setCatalog(rows(r.data.catalog));
        }
        if (Array.isArray(r.data.history)) {
          setHistory(rows(r.data.history));
        }
        if (text(r.data.generation_id)) {
          setActiveGenerationId(text(r.data.generation_id));
        } else {
          setActiveGenerationId(null);
        }
        void diagnosticsQ.refetch();
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e);
    } finally {
      if (explaining.current === controller) {
        setBusy(false);
      }
    }
  };

  const isFromDtcDb =
    result?.cached === true || text(result?.source) === "dtc_database";

  return (
    <div className="stack">
      <Card title={app.t("Read-only diagnostics")}>
        <div className="stack">
          <Details
            data={{
              obd_speed_kmh: sample.speed_kmh,
              observed_at: sample.occurred_at,
              installed_device_status: device.status,
              mil_on: vehicleData.mil_on,
              has_dtc_fault: vehicleData.has_dtc_fault,
              dtc_codes: activeDtcCodes,
            }}
          />
        </div>
      </Card>
      {app.can("telemetry.read") && (
        <Card
          title={app.t("Vehicle DTC Fault Timeline (started_at to ended_at)")}
          extra={
            <Button
              size="small"
              onClick={() => void diagnosticsQ.refetch()}
              loading={diagnosticsQ.isFetching}
            >
              {app.t("refresh")}
            </Button>
          }
        >
          <ErrorNotice error={diagnosticsQ.error} />
          <Table<Row>
            size="small"
            rowKey={(r) => text(r.id)}
            dataSource={dtcEpisodes}
            loading={diagnosticsQ.isFetching}
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: app.t(
                "No DTC fault episodes recorded for this vehicle yet.",
              ),
            }}
            columns={[
              {
                title: app.t("DTC code"),
                dataIndex: "code",
                render: (v: unknown) => {
                  const codeStr = text(v);
                  const explainable = /^[PCBU][0-3][0-9A-F]{3}$/i.test(
                    codeStr,
                  );
                  return (
                    <Tag
                      color="error"
                      style={explainable ? { cursor: "pointer" } : undefined}
                      onClick={() => {
                        if (explainable) {
                          void explain({ code: codeStr });
                        }
                      }}
                    >
                      {codeStr || "—"}
                    </Tag>
                  );
                },
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
                          style={{ fontSize: 12, maxWidth: 280 }}
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
                title: app.t("Ended at"),
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
            ]}
          />
        </Card>
      )}
      {app.can("diagnostics.run") && (
        <Card title={app.t("Extended Read-Only DUDU2 DTC Scan")}>
          <div className="stack">
            <Alert
              type="info"
              showIcon
              title={app.t("DUDU2 OBD extended DTC method (read-only)")}
              description={app.t(
                "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.",
              )}
            />
            {!isStationary && (
              <Alert
                type="warning"
                showIcon
                title={app.t("Vehicle must be stationary at 0 km/h")}
                description={
                  hasSpeed
                    ? app
                        .t(
                          "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.",
                        )
                        .replace("{speed}", text(sample.speed_kmh))
                    : app.t(
                        "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.",
                      )
                }
              />
            )}
            <ErrorNotice error={scanError} />
            <Checkbox
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={scanBusy}
            >
              {app.t(
                "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes",
              )}
            </Checkbox>
            <div>
              <Button
                type="primary"
                loading={scanBusy}
                disabled={!ack || !isStationary || scanBusy}
                onClick={() => void runExtendedScan()}
              >
                {app.t("Run extended DTC scan")}
              </Button>
            </div>
            {scanCommandId && (
              <CommandStatus key={scanCommandId} id={scanCommandId} />
            )}
          </div>
        </Card>
      )}
      {app.can("device_config.publish") && (
        <Card title={app.t("Push device configuration")}>
          <div className="stack">
            <Alert
              type="info"
              showIcon
              title={app.t("Push organization settings to installed Pi device")}
              description={app.t(
                "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.",
              )}
            />
            <ErrorNotice error={configError} />
            <div>
              <Button
                loading={configBusy}
                disabled={configBusy}
                onClick={() => void pushConfiguration()}
              >
                {app.t("Push device configuration")}
              </Button>
            </div>
            {configCommandId && (
              <CommandStatus key={configCommandId} id={configCommandId} />
            )}
          </div>
        </Card>
      )}
      {app.can("telemetry.read") && (
        <Card title={app.t("Fault code explanation")}>
          <div className="stack">
            <div className="ai-hints-panel">
              <div className="ai-hints-bar" aria-hidden="true" />
              <div className="ai-hints-header">
                <GeminiPoweredBadge />
              </div>
            </div>
            {activeDtcCodes.length > 0 && (
              <Space size={[6, 6]} wrap>
                {activeDtcCodes.map((code, idx) => (
                  <Tag
                    key={idx}
                    color="error"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      form.setFieldValue("code", text(code));
                      void explain({ code: text(code) });
                    }}
                  >
                    {text(code)}
                  </Tag>
                ))}
              </Space>
            )}
            <Card
              size="small"
              title={
                <Space size={8} wrap>
                  <span>{app.t("DTC Database")}</span>
                  <Tag color="blue">{catalog.length}</Tag>
                </Space>
              }
            >
              {catalog.length === 0 ? (
                <Typography.Text type="secondary">
                  {app.t(
                    "No codes saved in the persistent DTC database yet. Explaining a code once saves it here for instant future lookups.",
                  )}
                </Typography.Text>
              ) : (
                <Space size={[6, 6]} wrap>
                  {catalog.map((entry) => {
                    const c = text(entry.code);
                    const comp = text(entry.component);
                    const hits = Number(entry.lookup_count || 1);
                    return (
                      <Tag
                        key={c}
                        color="geekblue"
                        style={{ cursor: "pointer" }}
                        onClick={() => void explain({ code: c })}
                      >
                        {c} · {comp} · {hits}×
                      </Tag>
                    );
                  })}
                </Space>
              )}
            </Card>
            <ErrorNotice error={error} />
            <Form form={form} layout="vertical" onFinish={explain}>
              <Form.Item
                name="code"
                label={app.t("DTC code")}
                rules={[
                  {
                    required: true,
                    message: app.t("Please enter a DTC code."),
                  },
                  {
                    pattern: /^[PCBUpcbu][0-3][0-9a-fA-F]{3}$/,
                    message: app.t(
                      "Enter a normalized code, for example P0730.",
                    ),
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  maxLength={5}
                  placeholder={app.t("e.g. P0730")}
                  style={{ textTransform: "uppercase" }}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={busy}>
                {app.t("Explain code")}
              </Button>
            </Form>
            {result && (
              <div className="transient-result ai-hints-result">
                <div className="ai-hints-bar" aria-hidden="true" />
                <div className="ai-hints-result-head">
                  <Space size={8} wrap>
                    <GeminiPoweredBadge />
                    {isFromDtcDb ? (
                      <Tag color="green">
                        {app.t("Loaded from DTC Database (no AI call)")}
                      </Tag>
                    ) : text(result.source) === "history" ? (
                      <Tag color="blue">
                        {app.t("Loaded from Saved AI History")}
                      </Tag>
                    ) : (
                      <Tag color="purple">
                        {app.t("Generated by Gemini AI & saved to DTC Database")}
                      </Tag>
                    )}
                    {result.lookup_count !== undefined && (
                      <Tag>
                        {app.t("Lookups")}: {text(result.lookup_count)}
                      </Tag>
                    )}
                  </Space>
                </div>
                <Typography.Title level={4} className="ai-hints-result-title">
                  {String(result.code)} · {String(result.component)}
                </Typography.Title>
                <p>{String(result.description)}</p>
                <p>{String(result.possible_solution)}</p>
                <div className="ai-hints-result-footer">
                  <div className="ai-hints-powered">
                    <GeminiPoweredBadge />
                    <span>
                      {isFromDtcDb
                        ? app.t(
                            "Served from CarLink persistent DTC database without calling Google Gemini.",
                          )
                        : app.t(
                            "Advisory only — generated by Google Gemini and saved in CarLink DTC database & AI history.",
                          )}
                    </span>
                  </div>
                  <Space wrap>
                    <Button
                      loading={busy}
                      onClick={() =>
                        void explain({
                          code: text(result.code),
                          refresh: true,
                        })
                      }
                    >
                      {app.t("Re-analyze with AI")}
                    </Button>
                    <Button
                      onClick={() => {
                        setResult(null);
                        setActiveGenerationId(null);
                        form.resetFields();
                      }}
                    >
                      {app.t("Clear explanation")}
                    </Button>
                  </Space>
                </div>
              </div>
            )}
            <AiHistoryPanel
              history={history}
              activeGenerationId={activeGenerationId}
              onSelectResult={(res, entry) => {
                setResult({
                  ...res,
                  ...entry,
                  cached: false,
                  source: "history",
                });
                setActiveGenerationId(text(entry.id));
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
