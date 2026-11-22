import { useState } from "react";
import { Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { api, orgPath, segment } from "../api/client";
import { object, text, type Row } from "../api/types";
import { Directory, ErrorNotice, PageTitle } from "../components/shared";
import { NfcEnrollModal } from "../components/NfcEnrollModal";
import {
  Workflow,
  choice,
  field,
  number,
  reference,
  version,
  type Field,
  Action,
} from "../components/workflow";

export function vehicleFields(t?: (key: string) => string): Field[] {
  return [
    field("registration_number", {
      required: true,
      max: 32,
      pattern: /^[A-Za-z0-9 -]+$/,
    }),
    field("registration_country", {
      kind: "autocomplete",
      required: true,
      pattern: /^[A-Za-z]{2}$/,
      max: 2,
      default: "MY",
      uppercase: true,
      options: ["MY", "SG", "ID", "TH", "BN", "PH", "VN", "AU", "GB", "US"].map(
        (c) => ({ value: c, label: c }),
      ),
    }),
    field("make", { max: 100, nullable: true }),
    field("model", { max: 100, nullable: true }),
    field("model_year", {
      kind: "year",
      min: 1886,
      max: 2200,
      nullable: true,
    }),
    choice("fuel_type", ["petrol", "diesel", "hybrid", "electric", "other"]),
    number("passenger_capacity", 0, 65535, {
      suffix: t ? t("seats") : "seats",
    }),
    choice("status", ["active", "maintenance", "inactive"], {
      default: "active",
    }),
  ];
}
export function driverFields(
  path: string,
  t?: (key: string) => string,
): Field[] {
  return [
    field("name", { required: true, max: 160 }),
    field("employee_code", { max: 100, nullable: true }),
    field("email", {
      kind: "email",
      max: 255,
      nullable: true,
      help: t
        ? t("Driver profile email is separate from the sign-in mailbox.")
        : "Driver profile email is separate from the sign-in mailbox.",
    }),
    field("phone", { kind: "phone", max: 40, nullable: true }),
    reference("user_id", `${path}/members`, "email_normalized", {
      valueKey: "user_id",
      secondaryKey: "display_name",
      nullable: true,
      help: t
        ? t(
            "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.",
          )
        : "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.",
    }),
    choice("status", ["active", "suspended"], { default: "active" }),
  ];
}
export function Registry({
  resource,
}: {
  resource: "vehicles" | "drivers" | "devices";
}) {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId, `/${resource}`);
  const [editing, setEditing] = useState<Row | null>(null),
    [error, setError] = useState<unknown>(null),
    [nfcTarget, setNfcTarget] = useState<{ id: string; name: string } | null>(
      null,
    );
  const write = resource !== "devices" && app.can(`${resource}.write`);
  const edit = async (row: Row) => {
    try {
      const r = await api<Row>(`${path}/${segment(text(row.id))}`);
      setEditing(object(r.data.item));
    } catch (e) {
      setError(e);
    }
  };
  return (
    <div className="stack">
      <PageTitle
        title={app.t(resource)}
        subtitle={
          resource === "vehicles"
            ? app.t(
                "Fleet identity, pending installations and vehicle records.",
              )
            : resource === "drivers"
              ? app.t(
                  "Registered drivers, linked accounts and accepted NFC attribution.",
                )
              : app.t(
                  "Public device identity. Managed installation is reserved for SaaS technicians.",
                )
        }
        extra={
          write && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setEditing({})}
            >
              {app.t("create")}
            </Button>
          )
        }
      />
      <ErrorNotice error={error} />
      <Directory
        path={path}
        query={{ per_page: 50 }}
        fields={
          resource === "vehicles"
            ? [
                "registration_number",
                "make",
                "model",
                "current_driver_name",
                "fuel_type",
                "status",
              ]
            : resource === "drivers"
              ? [
                  "name",
                  "employee_code",
                  "current_vehicle_registration",
                  "phone",
                  "status",
                ]
              : ["id", "serial_number", "registered_vehicle_id", "status"]
        }
        render={
          resource === "vehicles"
            ? {
                current_driver_name: (v) =>
                  text(v) ? (
                    <Tag color="blue">{text(v)}</Tag>
                  ) : (
                    <span className="muted">{app.t("No active driver")}</span>
                  ),
              }
            : resource === "drivers"
              ? {
                  current_vehicle_registration: (v) =>
                    text(v) ? (
                      <Tag color="blue">{text(v)}</Tag>
                    ) : (
                      <span className="muted">{app.t("Off shift")}</span>
                    ),
                }
              : undefined
        }
        action={(row) => (
          <>
            <Button
              size="small"
              onClick={() =>
                navigate(
                  `/organization/${app.organizationId}/${resource}/${row.id}`,
                )
              }
            >
              {app.t("inspect")}
            </Button>
            {write && row.status !== "archived" && (
              <Button size="small" onClick={() => void edit(row)}>
                {app.t("edit")}
              </Button>
            )}
            {resource === "drivers" &&
              app.can("credentials.manage") &&
              row.status !== "archived" && (
                <Button
                  size="small"
                  onClick={() =>
                    setNfcTarget({ id: text(row.id), name: text(row.name) })
                  }
                >
                  {app.t("Link NFC ID")}
                </Button>
              )}
            {resource === "vehicles" && write && row.status !== "archived" && (
              <Action
                label={app.t("Archive")}
                danger
                path={`${path}/${segment(text(row.id))}/archive`}
                body={{ version: row.version }}
                description={app.t(
                  "Archive this vehicle? The server checks active installations and other operational restrictions.",
                )}
              />
            )}
          </>
        )}
      />
      {editing && (
        <Workflow
          title={app.t(
            editing.id
              ? resource === "vehicles"
                ? "Edit vehicle"
                : "Edit driver"
              : resource === "vehicles"
                ? "Register vehicle"
                : "Register driver",
          )}
          path={editing.id ? `${path}/${segment(text(editing.id))}` : path}
          method={editing.id ? "PATCH" : "POST"}
          initial={editing}
          fields={[
            ...(editing.id ? [version] : []),
            ...(resource === "vehicles"
              ? vehicleFields(app.t)
              : driverFields(orgPath(app.organizationId), app.t)),
          ]}
          description={
            resource === "vehicles"
              ? app.t(
                  "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.",
                )
              : app.t(
                  "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.",
                )
          }
          refreshPath={
            editing.id ? `${path}/${segment(text(editing.id))}` : undefined
          }
          successAction={
            resource === "drivers" &&
            !editing.id &&
            app.can("credentials.manage")
              ? (data) => {
                  const created = object(data.item);
                  return created.id ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        setEditing(null);
                        setNfcTarget({
                          id: text(created.id),
                          name: text(created.name),
                        });
                      }}
                    >
                      {app.t("Link Driver NFC ID")}
                    </Button>
                  ) : null;
                }
              : undefined
          }
          onClose={() => setEditing(null)}
        />
      )}
      {nfcTarget && (
        <NfcEnrollModal
          driverId={nfcTarget.id}
          driverName={nfcTarget.name || undefined}
          onClose={() => setNfcTarget(null)}
        />
      )}
    </div>
  );
}
