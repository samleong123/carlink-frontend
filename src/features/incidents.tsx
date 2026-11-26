import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row as GridRow,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  AimOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { api, downloadBlob, orgPath, segment } from "../api/client";
import { object, rows, text, type Row } from "../api/types";
import { CoordinateMap } from "../components/CoordinateMap";
import { ErrorNotice, PageTitle, Time, useData } from "../components/shared";
import { Files } from "./files";

const STATUS_OPTIONS = [
  "open",
  "investigating",
  "action_required",
  "resolved",
  "closed",
] as const;

const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"] as const;

const CATEGORY_OPTIONS = [
  "extreme_deceleration",
  "critical_dtc",
  "connectivity_loss",
  "accident",
  "near_miss",
  "other",
] as const;

const DRIVER_CATEGORY_OPTIONS = [
  "accident",
  "near_miss",
  "critical_dtc",
  "other",
] as const;

const SOURCE_OPTIONS = [
  "telemetry_auto",
  "driver_report",
  "manager_manual",
] as const;

const MANUAL_UPDATE_TYPES = [
  "note",
  "dispatch",
  "insurance_claim",
  "resolution",
  "status_change",
] as const;

function severityColor(value: string): string {
  switch (value) {
    case "critical":
      return "red";
    case "high":
      return "volcano";
    case "medium":
      return "gold";
    default:
      return "default";
  }
}

function statusColor(value: string): string {
  switch (value) {
    case "open":
      return "error";
    case "investigating":
      return "processing";
    case "action_required":
      return "warning";
    case "resolved":
      return "success";
    default:
      return "default";
  }
}

function sourceColor(value: string): string {
  switch (value) {
    case "telemetry_auto":
      return "purple";
    case "driver_report":
      return "cyan";
    default:
      return "blue";
  }
}

function updateTypeColor(value: string): string {
  switch (value) {
    case "system_alert":
      return "red";
    case "dispatch":
      return "volcano";
    case "insurance_claim":
      return "geekblue";
    case "resolution":
      return "green";
    case "status_change":
      return "blue";
    case "assignment":
      return "purple";
    default:
      return "default";
  }
}

interface IncidentDetailDrawerProps {
  incidentId: string;
  own?: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

function IncidentDetailDrawer({
  incidentId,
  own = false,
  onClose,
  onUpdated,
}: IncidentDetailDrawerProps) {
  const app = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const detailPath = orgPath(
    app.organizationId,
    own
      ? `/me/incidents/${segment(incidentId)}`
      : `/incidents/${segment(incidentId)}`,
  );
  const q = useData(detailPath, {}, !!incidentId);
  const item = object(q.data?.data?.item);
  const updates = rows(q.data?.data?.updates);
  const canManage = !own && app.can("incidents.write");

  const [statusVal, setStatusVal] = useState<string | undefined>();
  const [severityVal, setSeverityVal] = useState<string | undefined>();
  const [resolutionText, setResolutionText] = useState<string | undefined>();
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<unknown>(null);
  const [statusNotice, setStatusNotice] = useState("");

  const [updateType, setUpdateType] = useState<string>("note");
  const [updateBody, setUpdateBody] = useState("");
  const [updateRef, setUpdateRef] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<unknown>(null);

  const currentStatus = statusVal ?? text(item.status);
  const currentSeverity = severityVal ?? text(item.severity);
  const currentResolution =
    resolutionText !== undefined
      ? resolutionText
      : text(item.resolution_summary);

  const lat =
    item.latitude !== null && item.latitude !== undefined
      ? Number(item.latitude)
      : null;
  const lng =
    item.longitude !== null && item.longitude !== undefined
      ? Number(item.longitude)
      : null;
  const hasGps =
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  const dtcCodes = Array.isArray(item.dtc_codes)
    ? item.dtc_codes.map((c) => text(c)).filter(Boolean)
    : [];

  const handleSaveStatus = async () => {
    if (!canManage || !item.id) return;
    setSavingStatus(true);
    setStatusError(null);
    setStatusNotice("");
    try {
      await api(orgPath(app.organizationId, `/incidents/${segment(incidentId)}`), {
        method: "PATCH",
        body: {
          status: currentStatus || text(item.status),
          severity: currentSeverity || text(item.severity),
          resolution_summary: currentResolution.trim() || null,
          version: Number(item.version) || 1,
        },
      });
      setStatusVal(undefined);
      setSeverityVal(undefined);
      setResolutionText(undefined);
      setStatusNotice(app.t("inc_status_saved"));
      await cache.invalidateQueries();
      void q.refetch();
      onUpdated();
    } catch (e) {
      setStatusError(e);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!canManage || !updateBody.trim()) return;
    setSavingUpdate(true);
    setUpdateError(null);
    try {
      const metadata = updateRef.trim()
        ? { reference: updateRef.trim() }
        : undefined;
      await api(
        orgPath(
          app.organizationId,
          `/incidents/${segment(incidentId)}/updates`,
        ),
        {
          method: "POST",
          body: {
            update_type: updateType,
            body: updateBody.trim(),
            ...(metadata ? { metadata } : {}),
          },
        },
      );
      setUpdateBody("");
      setUpdateRef("");
      await cache.invalidateQueries();
      void q.refetch();
      onUpdated();
    } catch (e) {
      setUpdateError(e);
    } finally {
      setSavingUpdate(false);
    }
  };

  return (
    <Drawer
      open
      size="large"
      title={text(item.title) || app.t("inc_drawer_title")}
      onClose={onClose}
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => void q.refetch()}
          loading={q.isFetching}
        >
          {app.t("refresh")}
        </Button>
      }
    >
      <div className="stack">
        <ErrorNotice error={q.error} retry={() => void q.refetch()} />
        {Boolean(item.id) && (
          <>
            <Space wrap>
              <Tag color={severityColor(text(item.severity))}>
                {app.t(`inc_sev_${text(item.severity)}`)}
              </Tag>
              <Tag color={statusColor(text(item.status))}>
                {app.t(`inc_status_${text(item.status)}`)}
              </Tag>
              <Tag>{app.t(`inc_cat_${text(item.category)}`)}</Tag>
              <Tag color={sourceColor(text(item.source))}>
                {app.t(`inc_src_${text(item.source)}`)}
              </Tag>
            </Space>

            {text(item.description) && (
              <Alert type="info" title={text(item.description)} />
            )}

            <Card size="small" title={app.t("inc_section_overview")}>
              <Descriptions
                size="small"
                bordered
                column={{ xs: 1, sm: 2 }}
                items={[
                  {
                    key: "vehicle",
                    label: app.t("Vehicle"),
                    children:
                      !own && text(item.vehicle_id) ? (
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, height: "auto" }}
                          onClick={() => {
                            onClose();
                            navigate(
                              `/organization/${segment(app.organizationId)}/vehicles/${segment(text(item.vehicle_id))}`,
                            );
                          }}
                        >
                          {text(item.registration_number) ||
                            text(item.vehicle_id)}
                        </Button>
                      ) : (
                        text(item.registration_number) ||
                        text(item.vehicle_id) ||
                        "—"
                      ),
                  },
                  {
                    key: "driver",
                    label: app.t("Driver"),
                    children: text(item.driver_name) || app.t("inc_unassigned"),
                  },
                  {
                    key: "occurred_at",
                    label: app.t("inc_col_occurred_at"),
                    children: <Time value={item.occurred_at} />,
                  },
                  {
                    key: "detected_at",
                    label: app.t("inc_field_detected_at"),
                    children: <Time value={item.detected_at} />,
                  },
                  {
                    key: "speed",
                    label: app.t("speed_kmh"),
                    children:
                      item.speed_kmh !== null && item.speed_kmh !== undefined
                        ? `${Number(item.speed_kmh).toFixed(1)} km/h`
                        : "—",
                  },
                  {
                    key: "accel",
                    label: app.t("inc_field_accel"),
                    children:
                      item.accel_mps2 !== null && item.accel_mps2 !== undefined
                        ? `${Number(item.accel_mps2).toFixed(2)} m/s²`
                        : "—",
                  },
                  {
                    key: "dtc",
                    label: app.t("inc_field_dtc_codes"),
                    span: 2,
                    children:
                      dtcCodes.length > 0 ? (
                        <Space wrap size={[4, 4]}>
                          {dtcCodes.map((code) => (
                            <Tag color="error" key={code}>
                              {code}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        "—"
                      ),
                  },
                  {
                    key: "reported_by",
                    label: app.t("inc_field_reported_by"),
                    children:
                      text(item.reported_by_name) ||
                      app.t(`inc_src_${text(item.source)}`),
                  },
                  {
                    key: "resolved_at",
                    label: app.t("inc_field_resolved_at"),
                    children: item.resolved_at ? (
                      <Time value={item.resolved_at} />
                    ) : (
                      "—"
                    ),
                  },
                  ...(text(item.resolution_summary)
                    ? [
                        {
                          key: "resolution_summary",
                          label: app.t("inc_field_resolution_summary"),
                          span: 2,
                          children: text(item.resolution_summary),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>

            {hasGps && (
              <Card
                size="small"
                title={app.t("inc_section_location")}
                extra={
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EnvironmentOutlined /> {app.t("inc_open_google_maps")}
                  </a>
                }
              >
                <div className="stack">
                  <Typography.Text type="secondary">
                    {lat!.toFixed(6)}, {lng!.toFixed(6)}
                  </Typography.Text>
                  <CoordinateMap
                    items={[
                      {
                        id: text(item.id),
                        registration_number:
                          text(item.registration_number) || text(item.title),
                        latitude: lat,
                        longitude: lng,
                        speed_kmh: item.speed_kmh,
                        occurred_at: item.occurred_at,
                      },
                    ]}
                    mode="fleet"
                  />
                </div>
              </Card>
            )}

            {canManage && (
              <Card size="small" title={app.t("inc_section_manage")}>
                <div className="stack">
                  <ErrorNotice error={statusError} />
                  {statusNotice && <Alert type="success" title={statusNotice} />}
                  <GridRow gutter={[12, 12]}>
                    <Col xs={24} sm={12}>
                      <Typography.Text strong>
                        {app.t("status")}
                      </Typography.Text>
                      <Select
                        style={{ width: "100%", marginTop: 4 }}
                        value={currentStatus}
                        onChange={setStatusVal}
                        options={STATUS_OPTIONS.map((s) => ({
                          value: s,
                          label: app.t(`inc_status_${s}`),
                        }))}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Typography.Text strong>
                        {app.t("inc_col_severity")}
                      </Typography.Text>
                      <Select
                        style={{ width: "100%", marginTop: 4 }}
                        value={currentSeverity}
                        onChange={setSeverityVal}
                        options={SEVERITY_OPTIONS.map((s) => ({
                          value: s,
                          label: app.t(`inc_sev_${s}`),
                        }))}
                      />
                    </Col>
                  </GridRow>
                  <div>
                    <Typography.Text strong>
                      {app.t("inc_field_resolution_summary")}
                    </Typography.Text>
                    <Input.TextArea
                      style={{ marginTop: 4 }}
                      rows={3}
                      value={currentResolution}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder={app.t("inc_resolution_placeholder")}
                    />
                  </div>
                  <Button
                    type="primary"
                    loading={savingStatus}
                    onClick={() => void handleSaveStatus()}
                  >
                    {app.t("inc_btn_save_status")}
                  </Button>
                </div>
              </Card>
            )}

            <Card size="small" title={app.t("inc_section_timeline")}>
              <div className="stack">
                {canManage && (
                  <div className="stack">
                    <ErrorNotice error={updateError} />
                    <GridRow gutter={[12, 12]}>
                      <Col xs={24} sm={12}>
                        <Select
                          style={{ width: "100%" }}
                          value={updateType}
                          onChange={setUpdateType}
                          options={MANUAL_UPDATE_TYPES.map((u) => ({
                            value: u,
                            label: app.t(`inc_upd_${u}`),
                          }))}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Input
                          value={updateRef}
                          onChange={(e) => setUpdateRef(e.target.value)}
                          placeholder={app.t("inc_update_ref_placeholder")}
                        />
                      </Col>
                    </GridRow>
                    <Input.TextArea
                      rows={2}
                      value={updateBody}
                      onChange={(e) => setUpdateBody(e.target.value)}
                      placeholder={app.t("inc_update_body_placeholder")}
                    />
                    <Button
                      loading={savingUpdate}
                      disabled={!updateBody.trim()}
                      onClick={() => void handleAddUpdate()}
                    >
                      {app.t("inc_btn_add_update")}
                    </Button>
                  </div>
                )}

                {updates.length === 0 ? (
                  <Typography.Text type="secondary">
                    {app.t("inc_no_updates")}
                  </Typography.Text>
                ) : (
                  <Timeline
                    items={updates.map((u) => {
                      const meta = object(u.metadata);
                      const refText = text(meta.reference);
                      return {
                        key: text(u.id),
                        color:
                          text(u.update_type) === "system_alert"
                            ? "red"
                            : text(u.update_type) === "resolution"
                              ? "green"
                              : "blue",
                        children: (
                          <div className="stack" style={{ gap: 4 }}>
                            <Space wrap size={4}>
                              <Tag color={updateTypeColor(text(u.update_type))}>
                                {app.t(`inc_upd_${text(u.update_type)}`)}
                              </Tag>
                              <Typography.Text strong>
                                {text(u.author_name) ||
                                  app.t("inc_system_actor")}
                              </Typography.Text>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                              >
                                <Time value={u.created_at} />
                              </Typography.Text>
                            </Space>
                            <div>{text(u.body)}</div>
                            {refText && (
                              <Tag color="geekblue">
                                {app.t("inc_ref_label")}: {refText}
                              </Tag>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                )}
              </div>
            </Card>

            <Files
              targetType="incident"
              targetId={incidentId}
              write={own ? true : canManage}
            />
          </>
        )}
      </div>
    </Drawer>
  );
}

interface ReportModalProps {
  open: boolean;
  own?: boolean;
  fixedVehicleId?: string;
  vehicles: Row[];
  drivers?: Row[];
  defaultVehicleId?: string;
  onClose: () => void;
  onCreated: () => void;
}

function ReportIncidentModal({
  open,
  own = false,
  fixedVehicleId,
  vehicles,
  drivers = [],
  defaultVehicleId,
  onClose,
  onCreated,
}: ReportModalProps) {
  const app = useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState("");

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGeoNotice(app.t("inc_geo_unsupported"));
      return;
    }
    setLocating(true);
    setGeoNotice("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setFieldsValue({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => {
        setGeoNotice(app.t("inc_geo_failed"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const vals = await form.validateFields();
      setBusy(true);
      const dtcRaw = String(vals.dtc_codes_text || "")
        .split(/[,\s]+/)
        .map((c: string) => c.trim().toUpperCase())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        vehicle_id: fixedVehicleId || vals.vehicle_id || undefined,
        category: vals.category,
        severity: vals.severity,
        title: String(vals.title || "").trim(),
        description: vals.description
          ? String(vals.description).trim()
          : undefined,
        latitude:
          vals.latitude !== undefined && vals.latitude !== null
            ? Number(vals.latitude)
            : undefined,
        longitude:
          vals.longitude !== undefined && vals.longitude !== null
            ? Number(vals.longitude)
            : undefined,
      };
      if (!own) {
        if (vals.driver_id) body.driver_id = vals.driver_id;
        if (vals.speed_kmh !== undefined && vals.speed_kmh !== null) {
          body.speed_kmh = Number(vals.speed_kmh);
        }
        if (dtcRaw.length > 0) body.dtc_codes = dtcRaw;
      }

      await api(
        orgPath(app.organizationId, own ? "/me/incidents" : "/incidents"),
        {
          method: "POST",
          body,
        },
      );
      form.resetFields();
      onCreated();
      onClose();
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return;
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const categories = own ? DRIVER_CATEGORY_OPTIONS : CATEGORY_OPTIONS;

  return (
    <Modal
      open={open}
      title={own ? app.t("inc_report_driver_title") : app.t("inc_report_title")}
      onCancel={onClose}
      onOk={() => void handleSubmit()}
      okText={app.t("inc_btn_submit_report")}
      cancelText={app.t("cancel")}
      confirmLoading={busy}
      destroyOnHidden
    >
      <div className="stack">
        <ErrorNotice error={error} />
        {geoNotice && <Alert type="warning" title={geoNotice} />}
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            vehicle_id: fixedVehicleId || defaultVehicleId,
            category: own ? "accident" : "accident",
            severity: "high",
          }}
        >
          {!fixedVehicleId && (
            <Form.Item
              name="vehicle_id"
              label={app.t("Vehicle")}
              rules={[
                { required: !own || !defaultVehicleId, message: app.t("inc_req_vehicle") },
              ]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={app.t("inc_select_vehicle")}
                options={vehicles.map((v) => ({
                  value: text(v.id),
                  label: [
                    text(v.registration_number),
                    text(v.make),
                    text(v.model),
                  ]
                    .filter(Boolean)
                    .join(" · "),
                }))}
              />
            </Form.Item>
          )}
          {!own && drivers.length > 0 && (
            <Form.Item name="driver_id" label={app.t("Driver")}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder={app.t("inc_select_driver_optional")}
                options={drivers.map((d) => ({
                  value: text(d.id),
                  label: text(d.name) || text(d.id),
                }))}
              />
            </Form.Item>
          )}
          <GridRow gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label={app.t("inc_col_category")}
                rules={[{ required: true }]}
              >
                <Select
                  options={categories.map((c) => ({
                    value: c,
                    label: app.t(`inc_cat_${c}`),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="severity"
                label={app.t("inc_col_severity")}
                rules={[{ required: true }]}
              >
                <Select
                  options={SEVERITY_OPTIONS.map((s) => ({
                    value: s,
                    label: app.t(`inc_sev_${s}`),
                  }))}
                />
              </Form.Item>
            </Col>
          </GridRow>
          <Form.Item
            name="title"
            label={app.t("inc_field_title")}
            rules={[{ required: true, max: 200 }]}
          >
            <Input placeholder={app.t("inc_title_placeholder")} />
          </Form.Item>
          <Form.Item name="description" label={app.t("inc_field_description")}>
            <Input.TextArea
              rows={3}
              placeholder={app.t("inc_desc_placeholder")}
            />
          </Form.Item>
          <Space style={{ marginBottom: 8 }}>
            <Button
              size="small"
              icon={<AimOutlined />}
              loading={locating}
              onClick={captureGps}
            >
              {app.t("inc_btn_use_gps")}
            </Button>
          </Space>
          <GridRow gutter={[12, 0]}>
            <Col xs={12}>
              <Form.Item name="latitude" label={app.t("Latitude")}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={-90}
                  max={90}
                  step={0.0001}
                />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="longitude" label={app.t("Longitude")}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={-180}
                  max={180}
                  step={0.0001}
                />
              </Form.Item>
            </Col>
          </GridRow>
          {!own && (
            <GridRow gutter={[12, 0]}>
              <Col xs={12}>
                <Form.Item name="speed_kmh" label={app.t("speed_kmh")}>
                  <InputNumber style={{ width: "100%" }} min={0} max={350} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item
                  name="dtc_codes_text"
                  label={app.t("inc_field_dtc_codes")}
                >
                  <Input placeholder="P0300, P0118" />
                </Form.Item>
              </Col>
            </GridRow>
          )}
        </Form>
      </div>
    </Modal>
  );
}

export function Incidents({ vehicleId }: { vehicleId?: string }) {
  const app = useApp();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | undefined>();
  const [severity, setSeverity] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>(
    vehicleId,
  );
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<unknown>(null);

  const effectiveVehicle = vehicleId || selectedVehicle;
  const query = useMemo(
    () => ({
      status,
      severity,
      category,
      source,
      vehicle_id: effectiveVehicle,
      per_page: 50,
    }),
    [status, severity, category, source, effectiveVehicle],
  );

  const list = useData(
    orgPath(app.organizationId, "/incidents"),
    query,
    !!app.organizationId && app.can("incidents.read"),
  );
  const vehiclesQ = useData(
    orgPath(app.organizationId, "/vehicles"),
    { per_page: 200 },
    !vehicleId && !!app.organizationId && app.can("vehicles.read"),
  );
  const driversQ = useData(
    orgPath(app.organizationId, "/drivers"),
    { per_page: 200 },
    !!app.organizationId && app.can("drivers.read"),
  );

  const items = rows(list.data?.data?.items);
  const summary = object(list.data?.data?.summary);
  const vehicles = rows(vehiclesQ.data?.data?.items);
  const drivers = rows(driversQ.data?.data?.items);

  const openTotal = Number(summary.open ?? 0);
  const criticalHighOpen =
    Number(summary.critical_open ?? 0) + Number(summary.high_open ?? 0);
  const inProgressTotal =
    Number(summary.investigating ?? 0) + Number(summary.action_required ?? 0);
  const resolvedTotal =
    Number(summary.resolved ?? 0) + Number(summary.closed ?? 0);

  const handleExportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await api<Row>(
        orgPath(app.organizationId, "/incidents/export.csv"),
        {
          query: {
            status,
            severity,
            category,
            source,
            vehicle_id: effectiveVehicle,
          },
        },
      );
      const csv = text(res.data.csv);
      downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
        text(res.data.filename) || "incidents.csv",
      );
    } catch (e) {
      setExportError(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="stack">
      {!vehicleId && (
        <PageTitle
          title={app.t("incidents")}
          subtitle={app.t("inc_subtitle")}
          extra={
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => void list.refetch()}
                loading={list.isFetching}
              >
                {app.t("refresh")}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={() => void handleExportCsv()}
              >
                {app.t("inc_btn_export_csv")}
              </Button>
              {app.can("incidents.write") && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setReportOpen(true)}
                >
                  {app.t("inc_btn_report")}
                </Button>
              )}
            </Space>
          }
        />
      )}

      <ErrorNotice error={list.error || exportError} retry={() => void list.refetch()} />

      <GridRow gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_open")}
              value={openTotal}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_critical_high")}
              value={criticalHighOpen}
              valueStyle={criticalHighOpen > 0 ? { color: "#cf1322" } : undefined}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_in_progress")}
              value={inProgressTotal}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_resolved_closed")}
              value={resolvedTotal}
            />
          </Card>
        </Col>
      </GridRow>

      <Card size="small">
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space wrap>
            <Select
              allowClear
              style={{ minWidth: 145 }}
              placeholder={app.t("inc_filter_status")}
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS.map((s) => ({
                value: s,
                label: app.t(`inc_status_${s}`),
              }))}
            />
            <Select
              allowClear
              style={{ minWidth: 145 }}
              placeholder={app.t("inc_filter_severity")}
              value={severity}
              onChange={setSeverity}
              options={SEVERITY_OPTIONS.map((s) => ({
                value: s,
                label: app.t(`inc_sev_${s}`),
              }))}
            />
            <Select
              allowClear
              style={{ minWidth: 175 }}
              placeholder={app.t("inc_filter_category")}
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS.map((c) => ({
                value: c,
                label: app.t(`inc_cat_${c}`),
              }))}
            />
            <Select
              allowClear
              style={{ minWidth: 155 }}
              placeholder={app.t("inc_filter_source")}
              value={source}
              onChange={setSource}
              options={SOURCE_OPTIONS.map((s) => ({
                value: s,
                label: app.t(`inc_src_${s}`),
              }))}
            />
            {!vehicleId && vehicles.length > 0 && (
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ minWidth: 180 }}
                placeholder={app.t("inc_filter_vehicle")}
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                options={vehicles.map((v) => ({
                  value: text(v.id),
                  label: text(v.registration_number) || text(v.id),
                }))}
              />
            )}
          </Space>
          {vehicleId && (
            <Space wrap>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => void list.refetch()}
                loading={list.isFetching}
              >
                {app.t("refresh")}
              </Button>
              {app.can("incidents.write") && (
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setReportOpen(true)}
                >
                  {app.t("inc_btn_report")}
                </Button>
              )}
            </Space>
          )}
        </Space>
      </Card>

      <Card>
        <Table<Row>
          size="small"
          loading={list.isPending}
          rowKey={(r) => text(r.id)}
          dataSource={items}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          locale={{ emptyText: app.t("inc_empty") }}
          columns={[
            {
              title: app.t("inc_col_severity"),
              dataIndex: "severity",
              render: (v: unknown) => (
                <Tag color={severityColor(text(v))}>
                  {app.t(`inc_sev_${text(v)}`)}
                </Tag>
              ),
            },
            {
              title: app.t("status"),
              dataIndex: "status",
              render: (v: unknown) => (
                <Tag color={statusColor(text(v))}>
                  {app.t(`inc_status_${text(v)}`)}
                </Tag>
              ),
            },
            {
              title: app.t("inc_field_title"),
              key: "title",
              render: (_v, r) => (
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>{text(r.title)}</Typography.Text>
                  <Space size={4} wrap>
                    <Tag>{app.t(`inc_cat_${text(r.category)}`)}</Tag>
                    <Tag color={sourceColor(text(r.source))}>
                      {app.t(`inc_src_${text(r.source)}`)}
                    </Tag>
                  </Space>
                </Space>
              ),
            },
            ...(!vehicleId
              ? [
                  {
                    title: app.t("Vehicle"),
                    key: "vehicle",
                    render: (_v: unknown, r: Row) => (
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, height: "auto" }}
                        onClick={() =>
                          navigate(
                            `/organization/${segment(app.organizationId)}/vehicles/${segment(text(r.vehicle_id))}`,
                          )
                        }
                      >
                        {text(r.registration_number) || text(r.vehicle_id)}
                      </Button>
                    ),
                  },
                ]
              : []),
            {
              title: app.t("Driver"),
              dataIndex: "driver_name",
              render: (v: unknown) =>
                text(v) ? (
                  <Tag color="blue">{text(v)}</Tag>
                ) : (
                  <span className="muted">—</span>
                ),
            },
            {
              title: app.t("inc_col_occurred_at"),
              dataIndex: "occurred_at",
              render: (v: unknown) => <Time value={v} />,
            },
            {
              title: app.t("inc_col_gps"),
              key: "gps",
              render: (_v, r) =>
                r.latitude !== null &&
                r.latitude !== undefined &&
                r.longitude !== null &&
                r.longitude !== undefined ? (
                  <Tag color="green" icon={<EnvironmentOutlined />}>
                    GPS
                  </Tag>
                ) : (
                  <span className="muted">—</span>
                ),
            },
            {
              title: app.t("actions"),
              key: "actions",
              render: (_v, r) => (
                <Button size="small" onClick={() => setInspectId(text(r.id))}>
                  {app.t("inspect")}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {inspectId && (
        <IncidentDetailDrawer
          incidentId={inspectId}
          onClose={() => setInspectId(null)}
          onUpdated={() => void list.refetch()}
        />
      )}

      <ReportIncidentModal
        open={reportOpen}
        fixedVehicleId={vehicleId}
        vehicles={vehicles}
        drivers={drivers}
        onClose={() => setReportOpen(false)}
        onCreated={() => void list.refetch()}
      />
    </div>
  );
}

export function MyIncidents() {
  const app = useApp();
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const list = useData(
    orgPath(app.organizationId, "/me/incidents"),
    { per_page: 50 },
    !!app.organizationId,
  );
  const items = rows(list.data?.data?.items);
  const summary = object(list.data?.data?.summary);
  const activeShift = object(list.data?.data?.active_shift);
  const vehicles = rows(list.data?.data?.vehicles);
  const activeVehicleId = text(activeShift.vehicle_id) || undefined;

  return (
    <div className="stack">
      <PageTitle
        title={app.t("myIncidents")}
        subtitle={app.t("inc_driver_subtitle")}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void list.refetch()}
              loading={list.isFetching}
            >
              {app.t("refresh")}
            </Button>
            <Button
              type="primary"
              danger
              icon={<PlusOutlined />}
              onClick={() => setReportOpen(true)}
            >
              {app.t("inc_btn_report_driver")}
            </Button>
          </Space>
        }
      />

      <ErrorNotice error={list.error} retry={() => void list.refetch()} />

      {activeVehicleId && (
        <Alert
          type="info"
          title={`${app.t("inc_active_shift_vehicle")}: ${text(activeShift.registration_number) || activeVehicleId}`}
        />
      )}

      <GridRow gutter={[16, 16]}>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_open")}
              value={
                Number(summary.open ?? 0) +
                Number(summary.investigating ?? 0) +
                Number(summary.action_required ?? 0)
              }
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_resolved_closed")}
              value={
                Number(summary.resolved ?? 0) + Number(summary.closed ?? 0)
              }
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title={app.t("inc_kpi_total")}
              value={Number(summary.total ?? 0)}
            />
          </Card>
        </Col>
      </GridRow>

      <Card>
        <Table<Row>
          size="small"
          loading={list.isPending}
          rowKey={(r) => text(r.id)}
          dataSource={items}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          locale={{ emptyText: app.t("inc_driver_empty") }}
          columns={[
            {
              title: app.t("inc_col_severity"),
              dataIndex: "severity",
              render: (v: unknown) => (
                <Tag color={severityColor(text(v))}>
                  {app.t(`inc_sev_${text(v)}`)}
                </Tag>
              ),
            },
            {
              title: app.t("status"),
              dataIndex: "status",
              render: (v: unknown) => (
                <Tag color={statusColor(text(v))}>
                  {app.t(`inc_status_${text(v)}`)}
                </Tag>
              ),
            },
            {
              title: app.t("inc_field_title"),
              key: "title",
              render: (_v, r) => (
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>{text(r.title)}</Typography.Text>
                  <Tag>{app.t(`inc_cat_${text(r.category)}`)}</Tag>
                </Space>
              ),
            },
            {
              title: app.t("Vehicle"),
              dataIndex: "registration_number",
              render: (v: unknown, r: Row) =>
                text(v) || text(r.vehicle_id) || "—",
            },
            {
              title: app.t("inc_col_occurred_at"),
              dataIndex: "occurred_at",
              render: (v: unknown) => <Time value={v} />,
            },
            {
              title: app.t("actions"),
              key: "actions",
              render: (_v, r) => (
                <Button size="small" onClick={() => setInspectId(text(r.id))}>
                  {app.t("inspect")}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {inspectId && (
        <IncidentDetailDrawer
          incidentId={inspectId}
          own
          onClose={() => setInspectId(null)}
          onUpdated={() => void list.refetch()}
        />
      )}

      <ReportIncidentModal
        open={reportOpen}
        own
        vehicles={vehicles}
        defaultVehicleId={activeVehicleId}
        onClose={() => setReportOpen(false)}
        onCreated={() => void list.refetch()}
      />
    </div>
  );
}
