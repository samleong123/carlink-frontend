import { useCallback, useState } from "react";
import { Button, Drawer, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { orgPath, segment } from "../api/client";
import { object, text, type Row } from "../api/types";
import { Details, Directory, PageTitle } from "../components/shared";
import { Action } from "../components/workflow";

export function notificationRoute(action: unknown, org: string): string | null {
  const a = object(action),
    p = object(a.parameters),
    vehicle = text(p.vehicle_id);
  if (
    ["vehicle_compliance", "vehicle_maintenance", "vehicle"].includes(
      text(a.route),
    ) &&
    /^[a-fA-F0-9-]{36}$/.test(vehicle)
  )
    return `/organization/${segment(org)}/vehicles/${segment(vehicle)}`;
  if (a.route === "billing") return `/organization/${segment(org)}/billing`;
  if (a.route === "safety_appeals")
    return `/organization/${segment(org)}/appeals`;
  return null;
}
export function Notifications() {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId, "/notifications"),
    [unread, setUnread] = useState<boolean | undefined>(),
    [loaded, setLoaded] = useState<Row[]>([]),
    [inspect, setInspect] = useState<Row | null>(null);
  const onData = useCallback((items: Row[]) => setLoaded(items), []),
    ids = loaded.filter((row) => !row.read_at).map((row) => text(row.id));
  return (
    <div className="stack">
      <PageTitle
        title={app.t("notifications")}
        subtitle={app.t("notif_subtitle")}
        extra={
          ids.length > 0 && (
            <Action
              label={app.t("notif_mark_all_read")}
              path={`${path}/mark-read`}
              body={{ ids }}
            />
          )
        }
      />
      <Select
        className="filter-select"
        allowClear
        placeholder={app.t("notif_filter_placeholder")}
        value={unread}
        onChange={setUnread}
        options={[
          { value: true, label: app.t("notif_unread_only") },
          { value: false, label: app.t("notif_read_only") },
        ]}
      />
      <Directory
        path={path}
        query={{ unread, per_page: 50 }}
        fields={[
          "title",
          "type",
          "severity",
          "message",
          "created_at",
          "read_at",
        ]}
        onData={onData}
        action={(row) => (
          <>
            <Button size="small" onClick={() => setInspect(row)}>
              {app.t("notif_btn_inspect")}
            </Button>
            <Action
              label={
                row.read_at
                  ? app.t("notif_btn_mark_unread")
                  : app.t("notif_btn_mark_read")
              }
              path={`${path}/${segment(text(row.id))}`}
              options={{ method: "PATCH" }}
              body={{ read: !row.read_at }}
            />
            <Action
              label={app.t("notif_btn_archive")}
              path={`${path}/${segment(text(row.id))}`}
              options={{ method: "PATCH" }}
              body={{ archived: true }}
            />
            {notificationRoute(row.action, app.organizationId) && (
              <Button
                size="small"
                onClick={() =>
                  navigate(notificationRoute(row.action, app.organizationId)!)
                }
              >
                {app.t("notif_btn_open_related")}
              </Button>
            )}
          </>
        )}
      />
      {inspect && (
        <Drawer
          open
          title={app.t("notif_drawer_title")}
          onClose={() => setInspect(null)}
        >
          <Details data={inspect} />
        </Drawer>
      )}
    </div>
  );
}
