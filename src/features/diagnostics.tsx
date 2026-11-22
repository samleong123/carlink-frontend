import { useEffect, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Typography,
} from "antd";
import { api, orgPath, segment } from "../api/client";
import { object, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import {
  Details,
  ErrorNotice,
  GeminiPoweredBadge,
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
  const explain = async ({ code }: { code: string }) => {
    if (explaining.current && !explaining.current.signal.aborted) return;
    const controller = new AbortController();
    explaining.current = controller;
    form.resetFields();
    setResult(null);
    setBusy(true);
    setError(null);
    try {
      const r = await api<Row>(orgPath(app.organizationId, "/dtc-ai"), {
        method: "POST",
        body: { code: code.toUpperCase().trim() },
        sensitive: true,
        readOnlyAction: true,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setResult(r.data);
    } catch (e) {
      if (!controller.signal.aborted) setError(e);
    } finally {
      controller.abort();
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      <Card title={app.t("Read-only diagnostics")}>
        <div className="stack">
          <Details
            data={{
              obd_speed_kmh: sample.speed_kmh,
              observed_at: sample.occurred_at,
              installed_device_status: device.status,
            }}
          />
        </div>
      </Card>
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
                {app.t("Explain once")}
              </Button>
            </Form>
            {result && (
              <div className="transient-result ai-hints-result">
                <div className="ai-hints-bar" aria-hidden="true" />
                <div className="ai-hints-result-head">
                  <GeminiPoweredBadge />
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
                      {app.t(
                        "Advisory only — generated by Google Gemini and not stored by CarLink.",
                      )}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setResult(null);
                      form.resetFields();
                    }}
                  >
                    {app.t("Clear explanation")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
