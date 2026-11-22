import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Grid,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useApp } from "../app/context";
import { api, checkoutUrl, orgPath, segment } from "../api/client";
import { directoryRows } from "../api/adapters";
import {
  object,
  text,
  type ListData,
  type Row,
  type Schemas,
} from "../api/types";
import { openCheckoutWindow } from "../lib/checkout";
import {
  Details,
  ErrorNotice,
  PageTitle,
  Status,
  Time,
  useData,
  useTransientData,
} from "../components/shared";
import {
  Action,
  EntitySelect,
  Workflow,
  reference,
} from "../components/workflow";

export function money(
  value: unknown,
  currency = "MYR",
  unknownLabel = "Unknown",
) {
  const raw = text(value);
  if (!/^\d+$/.test(raw)) return unknownLabel;
  const cents = BigInt(raw);
  return `${currency} ${(cents / 100n).toLocaleString("en-MY")}.${String(cents % 100n).padStart(2, "0")}`;
}
export function PaymentStatus({
  id,
  invoicePath,
  organizationId,
  onConfirmed,
  autoOpen = false,
}: {
  id: string;
  invoicePath: string;
  organizationId?: string;
  onConfirmed?: () => void;
  autoOpen?: boolean;
}) {
  const app = useApp(),
    [start] = useState(Date.now()),
    q = useTransientData(
      orgPath(organizationId || app.organizationId, `/payments/${segment(id)}`),
    );
  const payment = object(q.data?.data.payment),
    terminal = [
      "succeeded",
      "failed",
      "expired",
      "cancelled",
      "creation_unknown",
    ].includes(text(payment.status));
  const [popupBlocked, setPopupBlocked] = useState(false);
  useEffect(() => {
    if (
      autoOpen &&
      payment.status === "pending" &&
      typeof payment.payment_url === "string"
    ) {
      try {
        setPopupBlocked(!openCheckoutWindow(payment.payment_url, id));
      } catch {
        setPopupBlocked(true);
      }
    }
  }, [autoOpen, payment.status, payment.payment_url, id]);
  useEffect(() => {
    if (terminal || q.error || Date.now() - start > 360000) return;
    const timer = window.setInterval(() => {
      if (Date.now() - start >= 360000) {
        window.clearInterval(timer);
        return;
      }
      if (!document.hidden) void q.refetch();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [terminal, q.error, start, q.refetch]);
  const invoice = useData(invoicePath, {}, payment.status === "succeeded");
  useEffect(() => {
    if (payment.status === "succeeded") {
      if (onConfirmed) onConfirmed();
      else void app.reload();
    }
  }, [payment.status]);
  return (
    <Card
      title={app.t("billing_payment_reconciliation")}
      extra={
        <Button onClick={() => void q.refetch()}>
          {app.t("billing_check_status")}
        </Button>
      }
    >
      <div className="stack">
        <ErrorNotice error={q.error} />
        <Details data={payment} />
        {popupBlocked && (
          <Alert type="info" title={app.t("billing_popup_blocked")} />
        )}
        {!q.error &&
          payment.status === "pending" &&
          typeof payment.payment_url === "string" && (
            <CheckoutLink url={payment.payment_url} />
          )}
        {invoice.data && <Details data={object(invoice.data.data.invoice)} />}
        {terminal && payment.status !== "succeeded" && (
          <Alert type="warning" title={app.t("billing_reconcile_terminal")} />
        )}
        {payment.status === "pending" && !payment.payment_url && (
          <Alert type="warning" title={app.t("billing_checkout_unavailable")} />
        )}
      </div>
    </Card>
  );
}
function CheckoutLink({ url }: { url: string }) {
  const app = useApp();
  try {
    const destination = checkoutUrl(url);
    return (
      <div className="stack">
        <Alert type="warning" title={app.t("billing_real_charge_warning")} />
        <Button
          type="primary"
          href={destination.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {app.t("billing_open_secure_checkout")}
        </Button>
      </div>
    );
  } catch {
    return <Alert type="error" title={app.t("billing_unsupported_provider")} />;
  }
}
export function Billing({ platform = false }: { platform?: boolean }) {
  const app = useApp(),
    screens = Grid.useBreakpoint(),
    [selectedOrg, setSelectedOrg] = useState(""),
    [issue, setIssue] = useState(false),
    [invoiceId, setInvoiceId] = useState<string | null>(null),
    [payment, setPayment] = useState<Row | null>(null),
    [error, setError] = useState<unknown>(null),
    [invoiceCursor, setInvoiceCursor] = useState<string | undefined>(),
    [invoiceHistory, setInvoiceHistory] = useState<(string | undefined)[]>([]);
  const org = platform ? selectedOrg : app.organizationId,
    path = platform
      ? `/api/v1/platform/organizations/${segment(org)}`
      : orgPath(org);
  useEffect(() => {
    setInvoiceCursor(undefined);
    setInvoiceHistory([]);
  }, [path]);
  const sub = useData(`${path}/subscription`, {}, !platform && !!org),
    plansPath = platform ? "/api/v1/platform/plans" : `${path}/plans`,
    plansQ = useData<ListData>(plansPath, {}, !!org),
    invoicesQ = useData<ListData>(
      `${path}/invoices`,
      { per_page: 50, cursor: invoiceCursor },
      !!org,
    );
  let planRows: Row[] = [],
    planShapeError: unknown = null;
  if (plansQ.data) {
    try {
      planRows = directoryRows(plansQ.data.data.items, plansQ.data.request_id, {
        path: plansPath,
        httpStatus: plansQ.data.status,
      });
    } catch (e) {
      planShapeError = e;
    }
  }
  let invoiceRows: Row[] = [],
    invoiceShapeError: unknown = null;
  if (invoicesQ.data) {
    try {
      invoiceRows = directoryRows(
        invoicesQ.data.data.items,
        invoicesQ.data.request_id,
        { path: `${path}/invoices`, httpStatus: invoicesQ.data.status },
      );
    } catch (e) {
      invoiceShapeError = e;
    }
  }
  const invoicePagination = invoicesQ.data?.data.pagination;
  const detail = useData(
    `${path}/invoices/${segment(invoiceId || "")}`,
    {},
    !!invoiceId,
  );
  const invoice = object(detail.data?.data.invoice),
    snapshot = object(invoice.plan_snapshot);
  const subData = object(sub.data?.data),
    subRecord = object(subData.subscription),
    subPlan = object(subRecord.plan_snapshot),
    subUsage = object(subData.usage);
  const pay = (data: Row) => {
    try {
      if (data.payment_url) checkoutUrl(text(data.payment_url));
      setPayment(data);
    } catch (e) {
      setError(e);
    }
  };
  return (
    <div className="stack">
      <PageTitle
        title={app.t("billing")}
        subtitle={app.t("billing_subtitle")}
        extra={
          org &&
          (platform || app.can("subscription.manage")) && (
            <Button type="primary" onClick={() => setIssue(true)}>
              {app.t("billing_issue_invoice")}
            </Button>
          )
        }
      />
      {platform && (
        <Card title={app.t("billing_subscriber_org")}>
          <EntitySelect
            path="/api/v1/platform/subscriptions"
            labelKey="organization_name"
            valueKey="organization_id"
            value={selectedOrg}
            onChange={(id) => {
              setSelectedOrg(id);
              setInvoiceId(null);
              setPayment(null);
            }}
          />
        </Card>
      )}
      <ErrorNotice error={error || sub.error} />
      <Steps
        size="small"
        current={object(sub.data?.data).access_active ? 3 : 0}
        items={[
          { title: app.t("billing_step_select") },
          { title: app.t("billing_issue_invoice") },
          { title: app.t("billing_step_checkout") },
          { title: app.t("billing_step_confirmed") },
        ]}
      />
      {sub.data && (
        <Card title={app.t("billing_current_paid_access")}>
          <Descriptions
            size="small"
            bordered
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              {
                key: "status",
                label: app.t("billing_sub_status"),
                children: <Status value={subRecord.status || "inactive"} />,
              },
              {
                key: "access_active",
                label: app.t("billing_effective_access"),
                children: (
                  <Tag color={subData.access_active ? "success" : "default"}>
                    {subData.access_active
                      ? app.t("active")
                      : app.t("inactive")}
                  </Tag>
                ),
              },
              {
                key: "plan",
                label: app.t("billing_current_plan"),
                children: text(subPlan.name) || app.t("common_none"),
              },
              {
                key: "expires_at",
                label: app.t("billing_period_expires"),
                children: <Time value={subRecord.expires_at} />,
              },
              {
                key: "vehicles",
                label: app.t("billing_vehicles_used_limit"),
                children: `${text(subUsage.vehicles) || "0"} / ${text(subPlan.vehicle_limit) || "—"}`,
              },
              {
                key: "drivers",
                label: app.t("billing_drivers_used_limit"),
                children: `${text(subUsage.drivers) || "0"} / ${text(subPlan.driver_limit) || "—"}`,
              },
              {
                key: "retention",
                label: app.t("billing_driver_retention"),
                children: subPlan.retention_days
                  ? app
                      .t("common_days_count")
                      .replace("{days}", text(subPlan.retention_days))
                  : "—",
              },
              {
                key: "telemetry",
                label: app.t("billing_min_telemetry_interval"),
                children: subPlan.telemetry_min_seconds
                  ? app
                      .t("common_seconds_count")
                      .replace("{seconds}", text(subPlan.telemetry_min_seconds))
                  : "—",
              },
              {
                key: "cellular",
                label: app.t("billing_cellular_feature"),
                children: (
                  <Tag color={subPlan.cellular_enabled ? "blue" : "default"}>
                    {subPlan.cellular_enabled
                      ? app.t("common_enabled")
                      : app.t("common_disabled")}
                  </Tag>
                ),
              },
              {
                key: "safety",
                label: app.t("billing_safety_feature"),
                children: (
                  <Tag color={subPlan.safety_enabled ? "blue" : "default"}>
                    {subPlan.safety_enabled
                      ? app.t("common_enabled")
                      : app.t("common_disabled")}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      )}
      {org && (
        <>
          <Card
            title={app.t("billing_plan_catalogue")}
            extra={
              <Button
                icon={<ReloadOutlined />}
                size="small"
                loading={plansQ.isFetching}
                onClick={() => void plansQ.refetch()}
              >
                {app.t("refresh")}
              </Button>
            }
          >
            <ErrorNotice error={plansQ.error || planShapeError} />
            <Table<Row>
              rowKey={(r) => text(r.id) || JSON.stringify(r)}
              dataSource={planRows}
              loading={plansQ.isPending}
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
              ]}
              locale={{ emptyText: app.t("empty") }}
            />
          </Card>
          <Card
            title={app.t("billing_invoices_title")}
            className="directory"
            extra={
              <Button
                icon={<ReloadOutlined />}
                size="small"
                loading={invoicesQ.isFetching}
                onClick={() => void invoicesQ.refetch()}
              >
                {app.t("refresh")}
              </Button>
            }
          >
            <ErrorNotice error={invoicesQ.error || invoiceShapeError} />
            <Table<Row>
              rowKey={(r) => text(r.id) || JSON.stringify(r)}
              dataSource={invoiceRows}
              loading={invoicesQ.isPending}
              pagination={false}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: app.t("number"),
                  dataIndex: "number",
                  key: "number",
                  render: (v: unknown, row: Row) => (
                    <span className="reference">
                      {text(v) || text(row.id) || app.t("unknown")}
                    </span>
                  ),
                },
                {
                  title: app.t("status"),
                  dataIndex: "status",
                  key: "status",
                  render: (v: unknown) => <Status value={v} />,
                },
                {
                  title: app.t("billing_col_amount"),
                  dataIndex: "amount_minor",
                  key: "amount_minor",
                  render: (v: unknown, row: Row) =>
                    money(v, text(row.currency) || "MYR", app.t("unknown")),
                },
                {
                  title: app.t("common_created_at"),
                  dataIndex: "created_at",
                  key: "created_at",
                  render: (v: unknown) => <Time value={v} />,
                },
                {
                  title: app.t("col_actions"),
                  key: "actions",
                  fixed: screens.md ? ("right" as const) : undefined,
                  render: (_: unknown, row: Row) => (
                    <Button
                      size="small"
                      onClick={() => {
                        setInvoiceId(text(row.id));
                        setPayment(null);
                      }}
                    >
                      {app.t("billing_inspect_invoice")}
                    </Button>
                  ),
                },
              ]}
              locale={{ emptyText: app.t("empty") }}
            />
            <div className="table-footer">
              <Typography.Text type="secondary">
                {invoiceRows.length} {app.t("loaded")}
                {invoicesQ.data && (
                  <>
                    {" "}
                    · {app.t("common_updated")}{" "}
                    <Time value={invoicesQ.data.timestamp} />
                  </>
                )}
              </Typography.Text>
              <Space>
                <Button
                  disabled={!invoiceHistory.length || invoicesQ.isFetching}
                  onClick={() => {
                    setInvoiceCursor(invoiceHistory[invoiceHistory.length - 1]);
                    setInvoiceHistory((v) => v.slice(0, -1));
                  }}
                >
                  {app.t("previous")}
                </Button>
                <Button
                  disabled={
                    !invoicePagination?.next_cursor || invoicesQ.isFetching
                  }
                  onClick={() => {
                    setInvoiceHistory((v) => [...v, invoiceCursor]);
                    setInvoiceCursor(invoicePagination!.next_cursor!);
                  }}
                >
                  {app.t("next")}
                </Button>
              </Space>
            </div>
          </Card>
        </>
      )}
      {issue && (
        <Workflow
          title={app.t("billing_issue_workflow_title")}
          path={`${path}/invoices`}
          fields={[reference("plan_id", plansPath, "name", { required: true })]}
          transform={(v) =>
            ({ plan_id: text(v.plan_id) }) satisfies Schemas["SaasInvoiceIssue"]
          }
          description={app.t("billing_issue_workflow_desc")}
          onDone={(data) => {
            setInvoiceId(text(object(data.invoice).id));
            setIssue(false);
          }}
          onClose={() => setIssue(false)}
        />
      )}
      {invoiceId && (
        <Drawer
          open
          size={760}
          title={app.t("billing_invoice_details")}
          onClose={() => {
            setInvoiceId(null);
            setPayment(null);
          }}
        >
          <div className="stack">
            <ErrorNotice error={detail.error} />
            <Typography.Title level={3}>
              {money(
                invoice.amount_minor,
                text(invoice.currency) || "MYR",
                app.t("unknown"),
              )}
            </Typography.Title>
            <Details
              data={Object.fromEntries(
                Object.entries(invoice).filter(
                  ([key]) => key !== "plan_snapshot",
                ),
              )}
            />
            <Card title={app.t("billing_purchased_snapshot")}>
              <Details data={snapshot} />
            </Card>
            <Space>
              {!platform &&
                app.can("payments.manage") &&
                invoice.status === "issued" &&
                !invoice.payment_id && (
                  <Action
                    label={app.t("billing_request_checkout")}
                    path={`${path}/invoices/${segment(invoiceId)}/pay`}
                    options={{ sensitive: true }}
                    description={app
                      .t("billing_request_checkout_desc")
                      .replace(
                        "{amount}",
                        money(
                          invoice.amount_minor,
                          text(invoice.currency) || "MYR",
                          app.t("unknown"),
                        ),
                      )}
                    onDone={pay}
                  />
                )}
              {platform &&
                invoice.status === "issued" &&
                !invoice.payment_id && (
                  <Action
                    label={app.t("billing_void_invoice")}
                    danger
                    path={`${path}/invoices/${segment(invoiceId)}/void`}
                    body={{ version: invoice.version }}
                  />
                )}
            </Space>
            {!!payment?.payment_url && !payment.payment_id && (
              <>
                <Alert
                  type="warning"
                  title={app.t("billing_real_charge_warning")}
                />
                <Button
                  type="primary"
                  href={checkoutUrl(text(payment.payment_url)).href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {app.t("billing_open_secure_checkout")}
                </Button>
              </>
            )}
            {!platform &&
              app.can("payments.manage") &&
              !!(payment?.payment_id || invoice.payment_id) && (
                <PaymentStatus
                  key={text(payment?.payment_id || invoice.payment_id)}
                  id={text(payment?.payment_id || invoice.payment_id)}
                  invoicePath={`${path}/invoices/${segment(invoiceId)}`}
                />
              )}
            {!platform &&
              !app.can("payments.manage") &&
              !!invoice.payment_id && (
                <Alert
                  type="info"
                  title={app.t("billing_reconcile_permission_alert")}
                />
              )}
            {platform && !!invoice.payment_id && (
              <Alert
                type="warning"
                title={app.t("billing_payment_attempt_alert")}
              />
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
