import { useState } from "react";
import { Button, Card, Drawer, Tabs } from "antd";
import { useApp } from "../app/context";
import { orgPath, segment } from "../api/client";
import { object, rows, text, type Row } from "../api/types";
import {
  Details,
  Directory,
  ErrorNotice,
  PageTitle,
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
  reference,
  version,
  type Field,
} from "../components/workflow";
import { Files } from "./files";
import { convertMileageInputsToMetres } from "../lib/mileageUnits";
import { convertCurrencyInputsToMinor } from "../lib/currencyUnits";

function revisionFields(t: (key: string) => string): Field[] {
  return [
    number("interval.distance_km", 1, 100000000, {
      integer: false,
      step: 0.5,
      suffix: "km",
      help: t("maint_help_interval_metric"),
    }),
    number("interval.calendar_months", 1, 1200, {
      suffix: t("unit_months"),
      help: t("maint_help_months_or_days"),
    }),
    number("interval.calendar_days", 1, 36500, { suffix: t("unit_days") }),
    choice("interval.due_when", ["any"], { required: true }),
    field("thresholds", {
      kind: "thresholds",
      help: t("maint_help_thresholds"),
    }),
  ];
}
function revisionBody(v: Row) {
  return {
    ...v,
    ...(Array.isArray(v.thresholds) && !v.thresholds.length
      ? { thresholds: undefined }
      : {
          thresholds: rows(v.thresholds).map((row) =>
            Object.fromEntries(
              Object.entries(row).filter(
                ([, value]) => value !== null && value !== undefined,
              ),
            ),
          ),
        }),
  };
}
export function Maintenance() {
  const app = useApp(),
    path = orgPath(app.organizationId),
    [createPlan, setCreatePlan] = useState(false),
    [planId, setPlanId] = useState<string | null>(null),
    [orderId, setOrderId] = useState<string | null>(null),
    [newOrder, setNewOrder] = useState(false);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("maintenance")}
        subtitle={app.t("maint_subtitle")}
      />
      <Tabs
        destroyOnHidden
        items={[
          {
            key: "orders",
            label: app.t("maint_tab_orders"),
            children: (
              <div className="stack">
                {app.can("maintenance.write") && (
                  <Button type="primary" onClick={() => setNewOrder(true)}>
                    {app.t("maint_btn_create_order")}
                  </Button>
                )}
                <Directory
                  path={`${path}/maintenance/work-orders`}
                  fields={[
                    "number",
                    "vehicle_id",
                    "status",
                    "scheduled_at",
                    "workshop_name",
                    "version",
                  ]}
                  scope={app.t("maint_orders_scope")}
                  action={(row) => (
                    <Button
                      size="small"
                      onClick={() => setOrderId(text(row.id))}
                    >
                      {app.t("maint_btn_open_order")}
                    </Button>
                  )}
                />
              </div>
            ),
          },
          {
            key: "plans",
            label: app.t("maint_tab_plans"),
            children: (
              <div className="stack">
                {app.can("maintenance.write") && (
                  <Button type="primary" onClick={() => setCreatePlan(true)}>
                    {app.t("maint_btn_create_plan")}
                  </Button>
                )}
                <Directory
                  path={`${path}/maintenance-plans`}
                  fields={["name", "service_type", "created_at"]}
                  scope={app.t("maint_plans_scope")}
                  action={(row) => (
                    <Button
                      size="small"
                      onClick={() => setPlanId(text(row.id))}
                    >
                      {app.t("maint_btn_plan_revisions")}
                    </Button>
                  )}
                />
              </div>
            ),
          },
        ]}
      />
      {createPlan && (
        <Workflow
          title={app.t("maint_btn_create_plan")}
          path={`${path}/maintenance-plans`}
          initial={{ interval: { due_when: "any" } }}
          fields={[
            field("name", { required: true, max: 160 }),
            field("service_type", { required: true, max: 80 }),
            ...revisionFields(app.t),
          ]}
          transform={revisionBody}
          onClose={() => setCreatePlan(false)}
        />
      )}
      {planId && (
        <PlanDetail key={planId} id={planId} onClose={() => setPlanId(null)} />
      )}
      {orderId && (
        <OrderDetail
          key={orderId}
          id={orderId}
          onClose={() => setOrderId(null)}
        />
      )}
      {newOrder && (
        <NewOrder
          onClose={() => setNewOrder(false)}
          onDone={(id) => {
            setNewOrder(false);
            setOrderId(id);
          }}
        />
      )}
    </div>
  );
}
function PlanDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const app = useApp(),
    path = orgPath(app.organizationId, `/maintenance-plans/${segment(id)}`),
    q = useData(path),
    [revision, setRevision] = useState(false);
  return (
    <Drawer
      title={app.t("maint_plan_drawer_title")}
      open
      size={700}
      onClose={onClose}
    >
      <div className="stack">
        <ErrorNotice error={q.error} />
        <Details data={q.data?.data} />
        {app.can("maintenance.write") && (
          <Button onClick={() => setRevision(true)}>
            {app.t("maint_btn_add_revision")}
          </Button>
        )}
        {revision && (
          <Workflow
            title={app.t("maint_add_revision_title")}
            path={`${path}/revisions`}
            fields={revisionFields(app.t)}
            initial={{ interval: { due_when: "any" } }}
            transform={revisionBody}
            onClose={() => setRevision(false)}
          />
        )}
      </div>
    </Drawer>
  );
}
export function VehicleMaintenance({
  vehicleId,
  poll,
}: {
  vehicleId: string;
  poll?: number;
}) {
  const app = useApp(),
    path = orgPath(app.organizationId, `/vehicles/${segment(vehicleId)}`),
    [assign, setAssign] = useState(false),
    [order, setOrder] = useState(false),
    [orderId, setOrderId] = useState<string | null>(null);
  return (
    <div className="stack">
      {app.can("maintenance.write") && (
        <>
          <Button onClick={() => setAssign(true)}>
            {app.t("maint_btn_assign_plan")}
          </Button>
          <Button onClick={() => setOrder(true)}>
            {app.t("maint_btn_create_order_vehicle")}
          </Button>
        </>
      )}
      <Directory
        path={`${path}/maintenance`}
        poll={poll}
        fields={[
          "name",
          "service_type",
          "status",
          "remaining_km",
          "remaining_days",
          "due_date",
          "baseline_quality",
          "id",
        ]}
      />
      <Card title={app.t("maint_service_records_title")}>
        <Directory
          path={`${path}/service-records`}
          poll={poll}
          fields={[
            "performed_at",
            "odometer_km",
            "odometer_source",
            "workshop_name",
            "cost_minor",
            "currency",
          ]}
        />
      </Card>
      {assign && (
        <Workflow
          title={app.t("maint_btn_assign_plan")}
          path={`${path}/maintenance-plan-assignments`}
          fields={[
            reference(
              "plan_id",
              orgPath(app.organizationId, "/maintenance-plans"),
              "name",
              { required: true },
            ),
            field("last_serviced_at", { kind: "datetime" }),
            number("carry_in_distance_m", 0, 10000000, {
              integer: false,
              step: 0.1,
              label: app.t("Carry-in distance (km)"),
              suffix: "km",
              metrePreview: true,
              help: app.t("maint_carry_in_help"),
            }),
            field("carry_in_as_of", { kind: "datetime" }),
            field("carry_in_reason", { kind: "textarea", min: 3, max: 500 }),
          ]}
          transform={(body) =>
            convertMileageInputsToMetres(body, ["carry_in_distance_m"])
          }
          onClose={() => setAssign(false)}
        />
      )}
      {order && (
        <NewOrder
          vehicleId={vehicleId}
          onClose={() => setOrder(false)}
          onDone={(id) => {
            setOrder(false);
            setOrderId(id);
          }}
        />
      )}
      {orderId && (
        <OrderDetail
          id={orderId}
          key={orderId}
          onClose={() => setOrderId(null)}
        />
      )}
    </div>
  );
}
function NewOrder({
  vehicleId,
  onClose,
  onDone,
}: {
  vehicleId?: string;
  onClose: () => void;
  onDone: (id: string) => void;
}) {
  const app = useApp(),
    [vehicle, setVehicle] = useState(vehicleId || ""),
    path = orgPath(app.organizationId),
    q = useData(
      `${path}/vehicles/${segment(vehicle)}/maintenance`,
      {},
      !!vehicle,
    );
  if (!vehicle)
    return (
      <Drawer
        open
        title={app.t("maint_select_vehicle_title")}
        onClose={onClose}
      >
        <EntitySelect
          path={`${path}/vehicles`}
          labelKey="registration_number"
          onChange={setVehicle}
        />
      </Drawer>
    );
  if (!q.data)
    return (
      <Drawer
        open
        title={app.t("maint_loading_assignments_title")}
        onClose={onClose}
      >
        <ErrorNotice error={q.error} />
      </Drawer>
    );
  const assignments = rows(q.data.data.items);
  return (
    <Workflow
      title={app.t("maint_btn_create_order")}
      path={`${path}/maintenance/work-orders`}
      initial={{ vehicle_id: vehicle }}
      fields={[
        field("vehicle_id", { kind: "readonly", required: true }),
        field("number", { required: true, max: 80 }),
        choice(
          "assignment_ids",
          assignments.map((row) => ({
            value: text(row.id),
            label: `${text(row.name)} · ${text(row.service_type)}`,
          })),
          { kind: "multi", required: true },
        ),
        field("scheduled_at", { kind: "datetime" }),
        field("workshop_name", { max: 160 }),
      ]}
      description={app.t("maint_new_order_desc")}
      onDone={(data) => onDone(text(data.id))}
      onClose={onClose}
    />
  );
}
function OrderDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const app = useApp(),
    path = orgPath(
      app.organizationId,
      `/maintenance/work-orders/${segment(id)}`,
    ),
    q = useData(path),
    order = object(q.data?.data.order),
    items = rows(q.data?.data.items);
  const [action, setAction] = useState<"cancel" | "complete" | null>(null);
  const open = ["draft", "scheduled", "in_progress"].includes(
    text(order.status),
  );
  return (
    <Drawer
      open
      title={app
        .t("maint_order_drawer_title")
        .replace("{number}", text(order.number))}
      size={720}
      onClose={onClose}
    >
      <div className="stack">
        <ErrorNotice error={q.error} retry={() => void q.refetch()} />
        <Details data={order} />
        <Card title={app.t("maint_order_items_title")}>
          <Details data={{ items }} />
        </Card>
        {app.can("maintenance.write") &&
          ["draft", "scheduled"].includes(text(order.status)) && (
            <Action
              label={app.t("maint_btn_start_order")}
              path={`${path}/start`}
              body={{ version: order.version }}
            />
          )}
        {app.can("maintenance.write") && open && (
          <Button danger onClick={() => setAction("cancel")}>
            {app.t("maint_btn_cancel_order")}
          </Button>
        )}
        {app.can("maintenance.complete") && order.status === "in_progress" && (
          <Button type="primary" onClick={() => setAction("complete")}>
            {app.t("maint_btn_complete_items")}
          </Button>
        )}
        <Files
          targetType="maintenance_order"
          targetId={id}
          version={order.version as number}
          write={app.can("maintenance.write")}
        />
        {action && (
          <Workflow
            title={
              action === "cancel"
                ? app.t("maint_cancel_order_title")
                : app.t("maint_complete_items_title")
            }
            path={`${path}/${action}`}
            fields={
              action === "cancel"
                ? [version, reason]
                : [
                    version,
                    field("performed_at", { kind: "datetime", required: true }),
                    number("odometer_km", 0, 1000000000, {
                      required: true,
                      integer: false,
                      step: 0.1,
                      suffix: "km",
                    }),
                    field("odometer_source", {
                      kind: "autocomplete",
                      required: true,
                      max: 100,
                      options: [
                        {
                          value: "Workshop odometer",
                          label: app.t("maint_odom_workshop"),
                        },
                        {
                          value: "Observed workshop odometer",
                          label: app.t("maint_odom_observed"),
                        },
                        {
                          value: "Vehicle instrument cluster",
                          label: app.t("maint_odom_cluster"),
                        },
                        {
                          value: "Diagnostic scan odometer",
                          label: app.t("maint_odom_scan"),
                        },
                      ],
                    }),
                    field("workshop_name", { required: true, max: 160 }),
                    choice(
                      "completed_item_ids",
                      items
                        .filter((row) => row.status === "pending")
                        .map((row) => ({
                          value: text(row.id),
                          label: app
                            .t("maint_order_item_label")
                            .replace("{id}", text(row.id))
                            .replace("{assignmentId}", text(row.assignment_id)),
                        })),
                      { kind: "multi", required: true },
                    ),
                    number("cost_minor", 0, 10000000, {
                      integer: false,
                      step: 0.01,
                      minorPreview: true,
                      label: app.t("maint_cost_label"),
                      help: app.t("maint_cost_help"),
                    }),
                    field("currency", {
                      kind: "autocomplete",
                      pattern: /^[A-Z]{3}$/,
                      default: "MYR",
                      uppercase: true,
                      options: ["MYR", "SGD", "USD", "IDR", "THB"].map((v) => ({
                        value: v,
                        label: v,
                      })),
                    }),
                    field("notes", { kind: "textarea", max: 4000 }),
                  ]
            }
            initial={{
              version: order.version,
              workshop_name: order.workshop_name,
            }}
            refreshPath={path}
            transform={
              action === "complete"
                ? (body) => convertCurrencyInputsToMinor(body, ["cost_minor"])
                : undefined
            }
            idempotent={action === "complete"}
            description={
              action === "complete"
                ? app.t("maint_complete_desc")
                : app.t("maint_cancel_desc")
            }
            onClose={() => setAction(null)}
          />
        )}
      </div>
    </Drawer>
  );
}
