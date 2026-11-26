import { Card, Table } from "antd";
import { useApp } from "../app/context";
import { PageTitle, ErrorNotice, Details, useData } from "../components/shared";
export const dependencies = [
  [
    "B01",
    "Checkout recovery",
    "Uncertain or expired payments need operator reconciliation; no safe automatic retry/void.",
  ],
  [
    "B02",
    "Telemetry cadence",
    "16–30 second cadence exceeds the 15-second analytics interval cap.",
  ],
  [
    "B03",
    "Collector integration",
    "Supply the actual Pi adapter and fix the relocated DUDU runner import before scan/config rollout.",
  ],
  [
    "B04",
    "Stationary scan freshness",
    "A ≤5-second reading conflicts with minute-based projection; backend latency design needs acceptance.",
  ],
  [
    "B05",
    "Edge throttles",
    "Separate per-device/operation polling and AI limiters; shared-IP counters can collide.",
  ],
  [
    "B06",
    "Commissioning authority",
    "UI is technician-only. Backend currently also admits SaaS admins to credential retrieval.",
  ],
  [
    "B07",
    "Network exposure",
    "UI hides unauthorized network sections; backend latest-state needs a cellular/coverage gate.",
  ],
  [
    "B08",
    "Maintenance evidence",
    "Attachment flow is blocked because the backend maps to maintenance_orders instead of maintenance_work_orders.",
  ],
  [
    "B09",
    "Personal email preferences",
    "Quiet-hours and opt-out controls are deferred because the current sender does not consume them.",
  ],
  [
    "B10",
    "Self-review",
    "UI omits own-appeal decisions. Add a backend dual-role self-review guard.",
  ],
  [
    "B11",
    "Capped directories",
    "Compliance, maintenance, shifts and some platform lists have hard caps; returned scope is disclosed.",
  ],
  [
    "B12",
    "Response contracts",
    "Generic envelopes need domain response adapters. Legacy managed-device mutations are excluded.",
  ],
  [
    "B13",
    "Roadmap APIs",
    "Street tiles, durable report jobs, emissions, route comparison and governance are not implemented.",
  ],
  [
    "B14",
    "Prototype privacy",
    "Private Windows prototype recordings and configuration are not bundled. Edge privacy needs independent review.",
  ],
  [
    "B15",
    "Pending renewal discovery",
    "Use known/created record IDs for review; backend needs a permissioned pending-record directory.",
  ],
  [
    "B16",
    "Credential discovery",
    "Enrol/revoke supports known references; no reloadable credential list exists.",
  ],
].map(([id, feature, handling]) => ({ id, feature, handling }));
export function Dependencies() {
  const app = useApp();
  const health = useData("/api/v1/health/live");
  const rows = dependencies.map((row) => {
    const key = row.id.toLowerCase();
    return {
      id: row.id,
      feature: app.t(`dep_${key}_feature`),
      handling: app.t(`dep_${key}_handling`),
    };
  });
  return (
    <div className="stack">
      <PageTitle
        title={app.t("dependencies")}
        subtitle={app.t("dep_subtitle")}
      />
      <Card title={app.t("dep_health_card")}>
        <ErrorNotice error={health.error} />
        <Details data={health.data?.data} />
      </Card>
      <Card>
        <Table
          dataSource={rows}
          rowKey="id"
          pagination={false}
          scroll={{ x: 600 }}
          columns={[
            { title: app.t("dep_col_id"), dataIndex: "id", width: 70 },
            { title: app.t("dep_col_area"), dataIndex: "feature", width: 190 },
            { title: app.t("dep_col_handling"), dataIndex: "handling" },
          ]}
        />
      </Card>
    </div>
  );
}
