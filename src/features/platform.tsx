import { useEffect, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Grid,
  Input,
  Row as GridRow,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  AlertOutlined,
  CopyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "../app/context";
import { api, downloadBlob, segment } from "../api/client";
import { directoryRows } from "../api/adapters";
import { object, rows, text, type ListData, type Row } from "../api/types";
import {
  Details,
  Directory,
  ErrorNotice,
  GeminiPoweredBadge,
  PageTitle,
  Status,
  Time,
  useData,
} from "../components/shared";
import {
  Action,
  EntitySelect,
  Workflow,
  choice,
  field,
  number,
  reason,
  version,
  type Field,
} from "../components/workflow";
import { money } from "./billing";
import {
  convertCurrencyInputsToMinor,
  minorToMajor,
} from "../lib/currencyUnits";
const p = "/api/v1/platform";
export function planFields(t?: (key: string) => string): Field[] {
  const tr = t ?? ((k: string) => k);
  return [
    field("name", { required: true, max: 100 }),
    number("price_minor", 0.01, 10000000, {
      required: true,
      integer: false,
      step: 1,
      minorPreview: true,
      label: t ? t("plat_price_minor_label") : "Price (MYR)",
      help: t
        ? t("plat_price_minor_help")
        : "Enter price in MYR (e.g. 99.00). Automatically converted to integer minor units for the server.",
      suffix: "MYR",
    }),
    choice("currency", ["MYR"], { required: true, default: "MYR" }),
    number("period_days", 1, 365, {
      required: true,
      default: 30,
      suffix: t ? tr("unit_days") : "days",
    }),
    number("vehicle_limit", 1, 100000, {
      required: true,
      suffix: t ? tr("unit_vehicles") : "vehicles",
    }),
    number("driver_limit", 1, 100000, {
      required: true,
      suffix: t ? tr("unit_drivers") : "drivers",
    }),
    field("retention_days", {
      kind: "segmented",
      required: true,
      default: 30,
      options: [30, 90, 180, 365].map((d) => ({
        value: d,
        label: t
          ? tr("common_days_count").replace("{days}", String(d))
          : `${d} days`,
      })),
    }),
    field("cellular_enabled", { kind: "switch", default: false }),
    field("safety_enabled", { kind: "switch", default: false }),
    number("telemetry_min_seconds", 2, 30, {
      required: true,
      default: 5,
      slider: true,
      suffix: "s",
    }),
    choice("status", ["active", "inactive"], { default: "active" }),
  ];
}
export function Plans() {
  const app = useApp(),
    screens = Grid.useBreakpoint(),
    [edit, setEdit] = useState<Row | null>(null),
    [search, setSearch] = useState("");
  const q = useData<ListData>(`${p}/plans`);
  let items: Row[] = [],
    shapeError: unknown = null;
  if (q.data) {
    try {
      items = directoryRows(q.data.data.items, q.data.request_id, {
        path: `${p}/plans`,
        httpStatus: q.data.status,
      });
    } catch (e) {
      shapeError = e;
    }
  }
  const filtered = items.filter((row) =>
    !search.trim()
      ? true
      : [row.name, row.status, row.currency]
          .map(text)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
  );
  return (
    <div className="stack">
      <PageTitle
        title={app.t("plans")}
        subtitle={app.t("plat_plans_subtitle")}
        extra={
          <Button type="primary" onClick={() => setEdit({})}>
            {app.t("plat_create_plan")}
          </Button>
        }
      />
      <Card className="directory">
        <div className="table-toolbar">
          <Input.Search
            allowClear
            aria-label={app.t("search")}
            placeholder={app.t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={q.isFetching}
            onClick={() => void q.refetch()}
          >
            {app.t("refresh")}
          </Button>
        </div>
        <ErrorNotice error={q.error || shapeError} />
        <Table<Row>
          rowKey={(r) => text(r.id) || JSON.stringify(r)}
          dataSource={filtered}
          loading={q.isPending}
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            { title: app.t("name"), dataIndex: "name", key: "name" },
            {
              title: app.t("billing_col_price"),
              dataIndex: "price_minor",
              key: "price_minor",
              render: (v: unknown, row: Row) =>
                money(v, text(row.currency) || "MYR", app.t("unknown")),
            },
            {
              title: app.t("billing_col_period_days"),
              dataIndex: "period_days",
              key: "period_days",
            },
            {
              title: app.t("billing_col_vehicle_limit"),
              dataIndex: "vehicle_limit",
              key: "vehicle_limit",
            },
            {
              title: app.t("billing_col_driver_limit"),
              dataIndex: "driver_limit",
              key: "driver_limit",
            },
            {
              title: app.t("billing_col_retention_days"),
              dataIndex: "retention_days",
              key: "retention_days",
            },
            {
              title: app.t("billing_col_min_telemetry"),
              dataIndex: "telemetry_min_seconds",
              key: "telemetry_min_seconds",
            },
            {
              title: app.t("cellular_enabled"),
              dataIndex: "cellular_enabled",
              key: "cellular_enabled",
              render: (v: unknown) => (
                <Tag color={v ? "blue" : "default"}>
                  {v ? app.t("common_enabled") : app.t("common_disabled")}
                </Tag>
              ),
            },
            {
              title: app.t("safety_enabled"),
              dataIndex: "safety_enabled",
              key: "safety_enabled",
              render: (v: unknown) => (
                <Tag color={v ? "blue" : "default"}>
                  {v ? app.t("common_enabled") : app.t("common_disabled")}
                </Tag>
              ),
            },
            {
              title: app.t("status"),
              dataIndex: "status",
              key: "status",
              render: (v: unknown) => <Status value={v} />,
            },
            {
              title: app.t("col_actions"),
              key: "actions",
              fixed: screens.md ? ("right" as const) : undefined,
              render: (_: unknown, row: Row) => (
                <Button
                  size="small"
                  onClick={() =>
                    setEdit({
                      ...row,
                      price_minor:
                        minorToMajor(row.price_minor) ?? row.price_minor,
                      cellular_enabled: !!row.cellular_enabled,
                      safety_enabled: !!row.safety_enabled,
                    })
                  }
                >
                  {app.t("edit")}
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: app.t("empty") }}
        />
      </Card>
      {edit && (
        <Workflow
          title={edit.id ? app.t("plat_edit_plan") : app.t("plat_create_plan")}
          path={edit.id ? `${p}/plans/${segment(text(edit.id))}` : `${p}/plans`}
          method={edit.id ? "PATCH" : "POST"}
          initial={edit}
          fields={[...(edit.id ? [version] : []), ...planFields(app.t)]}
          transform={(body) =>
            convertCurrencyInputsToMinor(body, ["price_minor"])
          }
          onClose={() => setEdit(null)}
        />
      )}
    </div>
  );
}
function formatPlanSnapshotSummary(
  raw: unknown,
  t?: (key: string) => string,
): string {
  const snap = object(raw);
  if (!Object.keys(snap).length)
    return t ? t("plat_no_plan_snapshot") : "No plan snapshot";
  const name = text(snap.name) || (t ? t("plat_plan_fallback") : "Plan");
  const v = text(snap.vehicle_limit) || "—";
  const d = text(snap.driver_limit) || "—";
  const r = text(snap.retention_days) || "—";
  const tSec = text(snap.telemetry_min_seconds) || "—";
  return `${name} · ${v}V / ${d}D · ${r}d · ${tSec}s`;
}
export function Subscribers() {
  const app = useApp(),
    screens = Grid.useBreakpoint(),
    [edit, setEdit] = useState<Row | null>(null),
    [inspect, setInspect] = useState<Row | null>(null),
    [status, setStatus] = useState<string | undefined>(),
    [cursor, setCursor] = useState<string | undefined>(),
    [history, setHistory] = useState<(string | undefined)[]>([]),
    [search, setSearch] = useState("");
  useEffect(() => {
    setCursor(undefined);
    setHistory([]);
  }, [status]);
  const q = useData<ListData>(`${p}/subscriptions`, {
    status,
    per_page: 100,
    cursor,
  });
  let items: Row[] = [],
    shapeError: unknown = null;
  if (q.data) {
    try {
      items = directoryRows(q.data.data.items, q.data.request_id, {
        path: `${p}/subscriptions`,
        httpStatus: q.data.status,
      });
    } catch (e) {
      shapeError = e;
    }
  }
  const filtered = items.filter((row) =>
    !search.trim()
      ? true
      : [
          row.organization_name,
          row.organization_id,
          row.status,
          formatPlanSnapshotSummary(row.plan_snapshot),
        ]
          .map(text)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
  );
  const pagination = q.data?.data.pagination;
  return (
    <div className="stack">
      <PageTitle
        title={app.t("subscribers")}
        subtitle={app.t("plat_subscribers_subtitle")}
      />
      <Select
        className="filter-select"
        allowClear
        placeholder={app.t("plat_all_statuses")}
        value={status}
        onChange={setStatus}
        options={["pending", "active", "suspended", "inactive"].map(
          (value) => ({
            value,
            label:
              value === "inactive"
                ? app.t("plat_status_deactivated")
                : app.t(value),
          }),
        )}
      />
      <Card className="directory">
        <div className="table-toolbar">
          <Input.Search
            allowClear
            aria-label={app.t("search")}
            placeholder={app.t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={q.isFetching}
            onClick={() => void q.refetch()}
          >
            {app.t("refresh")}
          </Button>
        </div>
        <ErrorNotice error={q.error || shapeError} />
        <Table<Row>
          rowKey={(r) => text(r.id ?? r.organization_id) || JSON.stringify(r)}
          dataSource={filtered}
          loading={q.isPending}
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: app.t("organization"),
              dataIndex: "organization_name",
              key: "organization_name",
              render: (v: unknown) => text(v) || app.t("unknown"),
            },
            {
              title: app.t("plat_col_plan_snapshot"),
              dataIndex: "plan_snapshot",
              key: "plan_snapshot",
              render: (v: unknown) => formatPlanSnapshotSummary(v, app.t),
            },
            {
              title: app.t("status"),
              dataIndex: "status",
              key: "status",
              render: (v: unknown) => <Status value={v} />,
            },
            {
              title: app.t("plat_col_access_active"),
              dataIndex: "access_active",
              key: "access_active",
              render: (v: unknown) => (
                <Tag color={v ? "success" : "default"}>
                  {v ? app.t("common_yes") : app.t("common_no")}
                </Tag>
              ),
            },
            {
              title: app.t("plat_col_expires_at"),
              dataIndex: "expires_at",
              key: "expires_at",
              render: (v: unknown) => <Time value={v} />,
            },
            {
              title: app.t("version"),
              dataIndex: "version",
              key: "version",
            },
            {
              title: app.t("col_actions"),
              key: "actions",
              fixed: screens.md ? ("right" as const) : undefined,
              render: (_: unknown, row: Row) => (
                <Space wrap>
                  <Button size="small" onClick={() => setInspect(row)}>
                    {app.t("notif_btn_inspect")}
                  </Button>
                  <Button size="small" onClick={() => setEdit(row)}>
                    {app.t("plat_change_access_status")}
                  </Button>
                </Space>
              ),
            },
          ]}
          locale={{ emptyText: app.t("empty") }}
        />
        <div className="table-footer">
          <Typography.Text type="secondary">
            {items.length} {app.t("loaded")}
            {q.data && (
              <>
                {" "}
                · {app.t("common_updated")} <Time value={q.data.timestamp} />
              </>
            )}
          </Typography.Text>
          <Space>
            <Button
              disabled={!history.length || q.isFetching}
              onClick={() => {
                setCursor(history[history.length - 1]);
                setHistory((v) => v.slice(0, -1));
              }}
            >
              {app.t("previous")}
            </Button>
            <Button
              disabled={!pagination?.next_cursor || q.isFetching}
              onClick={() => {
                setHistory((v) => [...v, cursor]);
                setCursor(pagination!.next_cursor!);
              }}
            >
              {app.t("next")}
            </Button>
          </Space>
        </div>
      </Card>
      {inspect && (
        <Drawer
          open
          size={640}
          title={app
            .t("plat_subscriber_drawer_title")
            .replace(
              "{target}",
              text(inspect.organization_name) || text(inspect.organization_id),
            )}
          onClose={() => setInspect(null)}
        >
          <div className="stack">
            <Details
              data={Object.fromEntries(
                Object.entries(inspect).filter(
                  ([key]) => key !== "plan_snapshot",
                ),
              )}
            />
            <Card title={app.t("plat_col_plan_snapshot")}>
              <Details data={object(inspect.plan_snapshot)} />
            </Card>
          </div>
        </Drawer>
      )}
      {edit && (
        <Workflow
          title={app.t("plat_change_sub_status_title")}
          path={`${p}/organizations/${segment(text(edit.organization_id))}/subscription`}
          method="PATCH"
          initial={edit}
          fields={[
            version,
            choice(
              "status",
              [
                { value: "active", label: app.t("active") },
                { value: "suspended", label: app.t("suspended") },
                { value: "inactive", label: app.t("plat_status_deactivated") },
              ],
              { required: true },
            ),
          ]}
          description={app.t("plat_change_sub_desc")}
          onClose={() => setEdit(null)}
        />
      )}
    </div>
  );
}
export function PlatformStaff() {
  const app = useApp(),
    [edit, setEdit] = useState<Row | null>(null);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("admins")}
        subtitle={app.t("plat_staff_subtitle")}
        extra={
          <Button type="primary" onClick={() => setEdit({})}>
            {app.t("plat_add_staff")}
          </Button>
        }
      />
      <Alert type="info" title={app.t("plat_staff_alert")} />
      <Directory
        path={`${p}/admins`}
        fields={[
          "display_name",
          "email_normalized",
          "role",
          "status",
          "version",
        ]}
        action={(row) => (
          <Button size="small" onClick={() => setEdit(row)}>
            {app.t("plat_change_status")}
          </Button>
        )}
      />
      {edit && (
        <Workflow
          title={
            edit.user_id
              ? app.t("plat_change_staff_status_title")
              : app.t("plat_add_saas_staff_title")
          }
          path={
            edit.user_id
              ? `${p}/admins/${segment(text(edit.user_id))}`
              : `${p}/admins`
          }
          method={edit.user_id ? "PATCH" : "POST"}
          initial={edit}
          fields={
            edit.user_id
              ? [
                  version,
                  choice("status", ["active", "suspended"], { required: true }),
                ]
              : [
                  field("email", { kind: "email", required: true, max: 255 }),
                  field("display_name", { required: true, max: 160 }),
                  choice("role", ["admin", "technician"], { required: true }),
                ]
          }
          onClose={() => setEdit(null)}
        />
      )}
    </div>
  );
}
export function PlatformDevices({
  technician = false,
}: {
  technician?: boolean;
}) {
  const app = useApp(),
    [id, setId] = useState<string | null>(null);
  return (
    <div className="stack">
      <PageTitle
        title={app.t(technician ? "installation" : "devices")}
        subtitle={
          technician
            ? app.t("plat_devices_tech_subtitle")
            : app.t("plat_devices_admin_subtitle")
        }
      />
      <Directory
        path={`${p}/devices`}
        query={{ per_page: 100 }}
        fields={
          technician
            ? [
                "id",
                "organization_name",
                "registration_number",
                "make",
                "model",
                "status",
              ]
            : [
                "organization_name",
                "registration_number",
                "make",
                "model",
                "status",
              ]
        }
        render={{
          registration_number: (value, row) => {
            const plate = text(value ?? vehicleObject(row).registration_number);
            return plate ? (
              <span>{plate}</span>
            ) : (
              <span className="muted">{app.t("plat_unlinked")}</span>
            );
          },
          make: (value, row) => {
            const make = text(value ?? vehicleObject(row).make);
            return make ? (
              <span>{make}</span>
            ) : (
              <span className="muted">—</span>
            );
          },
          model: (value, row) => {
            const model = text(value ?? vehicleObject(row).model);
            return model ? (
              <span>{model}</span>
            ) : (
              <span className="muted">—</span>
            );
          },
        }}
        action={(row) => (
          <Button size="small" onClick={() => setId(text(row.id))}>
            {technician
              ? app.t("plat_installation_setup")
              : app.t("plat_inspect_link")}
          </Button>
        )}
      />
      {id && (
        <DeviceSetup
          key={id}
          id={id}
          technician={technician}
          onClose={() => setId(null)}
        />
      )}
    </div>
  );
}
function vehicleObject(device: Row): Row {
  return device.vehicle && typeof device.vehicle === "object"
    ? object(device.vehicle)
    : {};
}
function formatOnlineTag(online: unknown, t: (key: string) => string) {
  if (online === true) return <Tag color="success">{t("online")}</Tag>;
  if (online === false) return <Tag color="warning">{t("plat_offline")}</Tag>;
  return <Tag>{t("never_observed")}</Tag>;
}
function formatVehicleLabel(device: Row, t: (key: string) => string) {
  const v = vehicleObject(device);
  const plate = text(device.registration_number ?? v.registration_number);
  const model = [text(device.make ?? v.make), text(device.model ?? v.model)]
    .filter(Boolean)
    .join(" ");
  return [plate, model].filter(Boolean).join(" · ") || t("plat_unlinked");
}
function LinkVehicleDrawer({
  path,
  organizationId,
  onDone,
  onClose,
}: {
  path: string;
  organizationId: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const { modal } = App.useApp(),
    app = useApp(),
    cache = useQueryClient(),
    [form] = Form.useForm(),
    [selectedVehicle, setSelectedVehicle] = useState<string | undefined>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    submitting = useRef(false);
  const submit = async (values: { vehicle_id: string }) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const confirmed = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title: app.t("plat_link_vehicle_title"),
        content: app
          .t("plat_link_org_content")
          .replace("{orgId}", organizationId),
        okText: app.t("confirm"),
        cancelText: app.t("cancel"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );
    if (!confirmed) {
      submitting.current = false;
      setBusy(false);
      return;
    }
    setError(null);
    try {
      await api(`${path}/link`, {
        method: "POST",
        body: { vehicle_id: values.vehicle_id.trim() },
      });
      await cache.invalidateQueries();
      onDone();
      onClose();
    } catch (e) {
      setError(e);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <Drawer
      open
      title={app.t("plat_link_vehicle_title")}
      size={520}
      onClose={busy ? undefined : onClose}
      destroyOnHidden
    >
      <div className="stack">
        <Alert
          type="info"
          showIcon
          title={app
            .t("plat_link_org_content")
            .replace("{orgId}", organizationId)}
        />
        <ErrorNotice error={error} />
        <Form form={form} layout="vertical" onFinish={submit} disabled={busy}>
          <Form.Item label={app.t("plat_select_org_vehicle")}>
            <EntitySelect
              path={`${p}/organizations/${segment(organizationId)}/vehicles`}
              labelKey="registration_number"
              value={selectedVehicle}
              onChange={(val) => {
                setSelectedVehicle(val);
                form.setFieldValue("vehicle_id", val || "");
              }}
            />
          </Form.Item>
          <Form.Item
            name="vehicle_id"
            label={app.t("plat_vehicle_uuid")}
            rules={[
              { required: true, message: app.t("plat_vehicle_uuid_req") },
              {
                pattern: /^[0-9a-fA-F-]{36}$/,
                message: app.t("plat_vehicle_uuid_pattern"),
              },
            ]}
          >
            <Input
              autoComplete="off"
              placeholder={app.t("plat_vehicle_uuid_placeholder")}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={busy}>
              {app.t("save")}
            </Button>
            <Button onClick={onClose} disabled={busy}>
              {app.t("cancel")}
            </Button>
          </Space>
        </Form>
      </div>
    </Drawer>
  );
}
function DeviceSetup({
  id,
  technician,
  onClose,
}: {
  id: string;
  technician: boolean;
  onClose: () => void;
}) {
  const app = useApp(),
    path = `${p}/devices/${segment(id)}`,
    q = useData(path),
    device = object(q.data?.data.device);
  const [workflow, setWorkflow] = useState<
      "mac" | "activate" | "link" | "unlink" | null
    >(null),
    [commission, setCommission] = useState<Row | null>(null);
  const download = () => {
    if (!commission) return;
    downloadBlob(
      new Blob([JSON.stringify(commission.configuration, null, 2)], {
        type: "application/json",
      }),
      "carlink-device.json",
    );
    setCommission(null);
  };
  const network = object(device.network);
  const health = object(device.device_health);
  const operatorMode =
    [text(device.operator), text(device.network_mode)]
      .filter(Boolean)
      .join(" · ") || app.t("unknown");
  return (
    <Drawer
      title={
        technician
          ? app.t("plat_device_installation")
          : app.t("plat_restricted_device_status")
      }
      open
      size={720}
      onClose={onClose}
      destroyOnHidden
    >
      <div className="stack">
        <ErrorNotice error={q.error} />
        {technician ? (
          <>
            <Descriptions
              size="small"
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              items={[
                {
                  key: "id",
                  label: app.t("plat_device_id"),
                  children: (
                    <span className="reference">{text(device.id)}</span>
                  ),
                },
                {
                  key: "organization_name",
                  label: app.t("organization"),
                  children: text(device.organization_name) || app.t("unknown"),
                },
                {
                  key: "vehicle",
                  label: app.t("comp_subject_vehicle"),
                  children: formatVehicleLabel(device, app.t),
                },
                {
                  key: "status",
                  label: app.t("status"),
                  children: <Status value={device.status} />,
                },
                {
                  key: "obd_bluetooth_mac",
                  label: app.t("obd_bluetooth_mac"),
                  children: (
                    <span className="reference">
                      {text(device.obd_bluetooth_mac) ||
                        app.t("plat_unconfigured")}
                    </span>
                  ),
                },
                {
                  key: "obd_uuid",
                  label: app.t("obd_uuid"),
                  children: (
                    <span className="reference">
                      {text(device.obd_uuid) || app.t("unknown")}
                    </span>
                  ),
                },
                {
                  key: "serial_number",
                  label: app.t("serial_number"),
                  children: (
                    <span className="reference">
                      {text(device.serial_number) || app.t("unknown")}
                    </span>
                  ),
                },
                {
                  key: "online",
                  label: app.t("online"),
                  children: formatOnlineTag(device.online, app.t),
                },
                {
                  key: "last_received_at",
                  label: app.t("plat_last_received_at"),
                  children: <Time value={device.last_received_at} />,
                },
                {
                  key: "version",
                  label: app.t("version"),
                  children: text(device.version) || "—",
                },
              ]}
            />
            {Object.keys(network).length > 0 && (
              <Card title={app.t("plat_network_status")}>
                <Details data={network} />
              </Card>
            )}
            {Object.keys(health).length > 0 && (
              <Card title={app.t("plat_device_health")}>
                <Details data={health} />
              </Card>
            )}
          </>
        ) : (
          <Descriptions
            size="small"
            bordered
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              {
                key: "organization_name",
                label: app.t("organization"),
                children: text(device.organization_name) || app.t("unknown"),
              },
              {
                key: "vehicle",
                label: app.t("comp_subject_vehicle"),
                children: formatVehicleLabel(device, app.t),
              },
              {
                key: "status",
                label: app.t("status"),
                children: <Status value={device.status} />,
              },
              {
                key: "online",
                label: app.t("online"),
                children: formatOnlineTag(device.online, app.t),
              },
              {
                key: "operator",
                label: app.t("operator"),
                children: text(device.operator) || app.t("unknown"),
              },
              {
                key: "network_mode",
                label: app.t("network_mode"),
                children: operatorMode,
              },
              {
                key: "last_received_at",
                label: app.t("plat_last_received_at"),
                children: <Time value={device.last_received_at} />,
              },
            ]}
          />
        )}
        {technician ? (
          <>
            <Steps
              size="small"
              current={device.status === "active" ? 3 : 0}
              items={[
                { title: app.t("plat_step_save_mac") },
                { title: app.t("plat_step_commission") },
                { title: app.t("plat_step_acls") },
                { title: app.t("plat_step_activate") },
              ]}
            />
            <Button onClick={() => setWorkflow("mac")}>
              {app.t("plat_save_obd_mac")}
            </Button>
            <Action
              label={app.t("plat_request_commissioning")}
              path={`${path}/commissioning`}
              options={{ sensitive: true }}
              description={app.t("plat_commissioning_desc")}
              onDone={setCommission}
            />
            <Button onClick={() => setWorkflow("activate")}>
              {app.t("plat_attest_activate")}
            </Button>
            {commission &&
              (() => {
                const rmq = commission.rabbitmq
                  ? object(commission.rabbitmq)
                  : null;
                const rmqStatus = rmq ? text(rmq.status) : "";
                const rmqType =
                  rmqStatus === "success"
                    ? "success"
                    : rmqStatus === "failed"
                      ? "error"
                      : "info";
                return (
                  <Card title={app.t("plat_private_comm_download")}>
                    {rmq && (
                      <Alert
                        type={rmqType}
                        showIcon
                        style={{ marginBottom: 12 }}
                        title={`${app.t("plat_rmq_provisioning")}: ${text(rmq.action) || rmqStatus}${rmq.principal ? ` (${text(rmq.principal)})` : ""}${rmq.http_status ? ` · HTTP ${text(rmq.http_status)}` : ""}`}
                        description={text(rmq.message)}
                      />
                    )}
                    <Typography.Paragraph
                      copyable={{ text: text(commission.command) }}
                      className="reference"
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: 280,
                        overflowY: "auto",
                        background: "#f8fafc",
                        padding: 12,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {text(commission.command)}
                    </Typography.Paragraph>
                    <p>{text(commission.instructions)}</p>
                    <p style={{ margin: "8px 0" }}>
                      <a
                        href="https://github.com/samleong123/carlink-telemetry-agent"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        samleong123/carlink-telemetry-agent: Telemetry Agent for CarLink SaaS
                      </a>
                    </p>
                    <Space style={{ marginBottom: 12 }} wrap>
                      <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          void navigator.clipboard.writeText(text(commission.command));
                          void message.success(app.t("plat_copied_command"));
                        }}
                      >
                        {app.t("plat_copy_command")}
                      </Button>
                      <Button onClick={download}>
                        {app.t("plat_download_private_json")}
                      </Button>
                      <Button onClick={() => setCommission(null)}>
                        {app.t("plat_discard")}
                      </Button>
                    </Space>
                    <p className="muted">{app.t("plat_pi_stdin_note")}</p>
                  </Card>
                );
              })()}
          </>
        ) : (
          <>
            <Button onClick={() => setWorkflow("link")}>
              {app.t("plat_link_vehicle")}
            </Button>
            <Button danger onClick={() => setWorkflow("unlink")}>
              {app.t("plat_unlink_device")}
            </Button>
          </>
        )}
        {workflow === "link" && (
          <LinkVehicleDrawer
            path={path}
            organizationId={text(device.organization_id)}
            onDone={() => {
              setCommission(null);
              void q.refetch();
            }}
            onClose={() => setWorkflow(null)}
          />
        )}
        {workflow && workflow !== "link" && (
          <Workflow
            title={
              {
                mac: app.t("plat_save_obd_mac"),
                activate: app.t("plat_attest_installation"),
                unlink: app.t("plat_unlink_device"),
              }[workflow]
            }
            path={`${path}/${{ mac: "bluetooth", activate: "activate", unlink: "unlink" }[workflow]}`}
            fields={
              workflow === "mac"
                ? [
                    version,
                    field("obd_bluetooth_mac", {
                      required: true,
                      pattern: /^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/,
                    }),
                  ]
                : workflow === "activate"
                  ? [
                      version,
                      field("installed", {
                        kind: "check",
                        required: true,
                        help: app.t("plat_attest_installed_help"),
                      }),
                      field("verified_broker_acls", {
                        kind: "check",
                        required: true,
                        help: app.t("plat_attest_acls_help"),
                      }),
                    ]
                  : [reason]
            }
            initial={{ version: device.version }}
            refreshPath={path}
            onDone={() => {
              setCommission(null);
              void q.refetch();
            }}
            onClose={() => setWorkflow(null)}
          />
        )}
      </div>
    </Drawer>
  );
}

function triageSeverityColor(severity: unknown): string {
  const normalized = text(severity).toLowerCase();
  if (normalized === "critical") return "red";
  if (normalized === "high") return "volcano";
  if (normalized === "medium") return "gold";
  if (normalized === "low") return "blue";
  return "default";
}

function formatSignalCount(value: unknown): string | number {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  return Number.isFinite(num) ? num : text(value) || "—";
}

export function PlatformHealthTriageCard() {
  const app = useApp();
  const platformAdmin =
    app.session?.platform?.role === "admin" && app.workspace === "platform";
  const [days, setDays] = useState<number>(7);
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

  if (!platformAdmin) return null;

  const generate = async () => {
    if (busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    try {
      const res = await api<Row>(`${p}/health-triage-ai`, {
        method: "POST",
        body: { days },
        sensitive: true,
        readOnlyAction: true,
        signal: controller.signal,
      });
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

  const executiveBrief = text(result?.executive_brief);
  const signals = object(result?.platform_signals);
  const priorityQueue = rows(result?.priority_queue);
  const signalItems: { key: string; label: string }[] = [
    { key: "offline_devices", label: app.t("Offline Devices") },
    { key: "pending_devices", label: app.t("Pending Devices") },
    { key: "expiring_subscriptions", label: app.t("Expiring Subscriptions") },
    { key: "unpaid_signups", label: app.t("Unpaid Signups") },
    { key: "elevated_error_orgs", label: app.t("Elevated Error Orgs") },
    { key: "recent_alerts", label: app.t("Recent Alerts") },
  ];

  return (
    <Card
      size="small"
      title={app.t("Platform Fleet Health & Operations Triage Brief")}
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
                options={[1, 7, 14, 30].map((d) => ({
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
                {app.t("Generate Health & Triage Brief")}
              </Button>
            </Space>
          </div>
        </div>

        <ErrorNotice error={error} />

        {result && (
          <div className="transient-result ai-hints-result">
            <div className="ai-hints-bar" aria-hidden="true" />
            <div className="stack">
              {executiveBrief && (
                <Alert
                  type="info"
                  showIcon
                  icon={<AlertOutlined />}
                  title={app.t("Executive Brief")}
                  description={
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {executiveBrief}
                    </Typography.Paragraph>
                  }
                />
              )}

              {Object.keys(signals).length > 0 && (
                <div>
                  <Typography.Text strong>
                    {app.t("Platform Signals")}
                  </Typography.Text>
                  <GridRow gutter={[12, 12]} style={{ marginTop: 8 }}>
                    {signalItems.map((item) => (
                      <Col xs={12} sm={8} md={4} key={item.key}>
                        <Card size="small" className="reports-kpi-card">
                          <Statistic
                            title={item.label}
                            value={formatSignalCount(signals[item.key])}
                          />
                        </Card>
                      </Col>
                    ))}
                  </GridRow>
                </div>
              )}

              <div>
                <Typography.Text strong>
                  {app.t("Priority Triage Queue")}
                </Typography.Text>
                <Table<Row>
                  size="small"
                  style={{ marginTop: 8 }}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: app.t("empty") }}
                  rowKey={(r, idx) =>
                    `${text(r.area)}-${text(r.target)}-${idx}`
                  }
                  dataSource={priorityQueue}
                  columns={[
                    {
                      title: app.t("Severity"),
                      dataIndex: "severity",
                      key: "severity",
                      width: 110,
                      render: (v: unknown) => {
                        const label = text(v) || "unknown";
                        return (
                          <Tag color={triageSeverityColor(label)}>
                            {label.toUpperCase()}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: app.t("Area"),
                      dataIndex: "area",
                      key: "area",
                      width: 140,
                      render: (v: unknown) => (
                        <Tag>{text(v) || app.t("unknown")}</Tag>
                      ),
                    },
                    {
                      title: app.t("Target"),
                      dataIndex: "target",
                      key: "target",
                      render: (v: unknown) => (
                        <Typography.Text strong>
                          {text(v) || "—"}
                        </Typography.Text>
                      ),
                    },
                    {
                      title: app.t("Reason"),
                      dataIndex: "reason",
                      key: "reason",
                      render: (v: unknown) => text(v) || "—",
                    },
                    {
                      title: app.t("Next Action"),
                      dataIndex: "next_action",
                      key: "next_action",
                      render: (v: unknown) => text(v) || "—",
                    },
                  ]}
                />
              </div>

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
