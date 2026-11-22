import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Grid,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useApp } from "../app/context";
import { orgPath, segment } from "../api/client";
import { directoryRows } from "../api/adapters";
import { object, text, type ListData, type Row } from "../api/types";
import {
  Details,
  Directory,
  ErrorNotice,
  PageTitle,
  Status,
  Time,
  useData,
} from "../components/shared";
import {
  Action,
  Workflow,
  choice,
  field,
  number,
  version,
  type Field,
} from "../components/workflow";
import { type Locale } from "../i18n/messages";
import { Files } from "./files";

function getRoleOptions(t: (key: string) => string) {
  return [
    { value: "admin", label: t("role_desc_admin") },
    { value: "manager", label: t("role_desc_manager") },
    { value: "viewer", label: t("role_desc_viewer") },
    { value: "safety_officer", label: t("role_desc_safety_officer") },
    { value: "maintenance_officer", label: t("role_desc_maintenance_officer") },
    { value: "driver", label: t("role_desc_driver") },
    { value: "support", label: t("role_desc_support") },
    { value: "module_vehicle", label: t("role_desc_module_vehicle") },
    { value: "module_driver", label: t("role_desc_module_driver") },
    { value: "module_dashboard", label: t("role_desc_module_dashboard") },
    { value: "module_compliance", label: t("role_desc_module_compliance") },
    { value: "module_coverage", label: t("role_desc_module_coverage") },
  ];
}
const DISPLAY_LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ms", label: "Bahasa Melayu" },
  { value: "zh", label: "简体中文" },
  { value: "ta", label: "தமிழ்" },
];
const timezones = [
  ...new Set([
    "Asia/Kuala_Lumpur",
    "UTC",
    ...Intl.supportedValuesOf("timeZone"),
  ]),
];

export function Account() {
  const app = useApp(),
    [edit, setEdit] = useState(false);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("account")}
        subtitle={app.t("admin_account_subtitle")}
        extra={
          <Button type="primary" onClick={() => setEdit(true)}>
            {app.t("admin_edit_personal_details")}
          </Button>
        }
      />
      <Card title={app.t("admin_personal_account")}>
        <Details data={app.session?.user} />
      </Card>
      <Card title={app.t("admin_display_language")}>
        <div className="stack">
          <Space wrap align="center">
            <Select
              aria-label={app.t("admin_display_language")}
              value={app.locale}
              onChange={(val) => app.setLocale(val as Locale)}
              options={DISPLAY_LANGUAGE_OPTIONS}
              popupMatchSelectWidth={false}
            />
          </Space>
          <Typography.Text type="secondary">
            {app.t("admin_display_language_note")}
          </Typography.Text>
        </div>
      </Card>
      <Typography.Paragraph type="secondary">
        {app.t("admin_account_lang_note")}
      </Typography.Paragraph>
      {edit && (
        <Workflow
          title={app.t("admin_edit_personal_account")}
          path="/api/v1/me"
          method="PATCH"
          fields={[
            version,
            field("display_name", { max: 160, required: true }),
            choice(
              "locale",
              [
                { value: "en", label: "English" },
                { value: "ms", label: "Bahasa Melayu" },
                { value: "zh", label: "简体中文" },
              ],
              { required: true },
            ),
            choice("timezone", timezones, { required: true }),
          ]}
          initial={app.session?.user}
          refreshPath="/api/v1/me"
          onClose={() => setEdit(false)}
        />
      )}
    </div>
  );
}
export function Staff() {
  const app = useApp(),
    screens = Grid.useBreakpoint(),
    path = orgPath(app.organizationId),
    [invite, setInvite] = useState(false),
    [member, setMember] = useState<Row | null>(null),
    [transfer, setTransfer] = useState<Row | null>(null),
    [inspectPerms, setInspectPerms] = useState<Row | null>(null),
    [cursor, setCursor] = useState<string | undefined>(),
    [history, setHistory] = useState<(string | undefined)[]>([]),
    [search, setSearch] = useState("");
  useEffect(() => {
    setCursor(undefined);
    setHistory([]);
  }, [path]);
  const membersQ = useData<ListData>(`${path}/members`, {
    per_page: 100,
    cursor,
  });
  let memberRows: Row[] = [],
    memberShapeError: unknown = null;
  if (membersQ.data) {
    try {
      memberRows = directoryRows(
        membersQ.data.data.items,
        membersQ.data.request_id,
        { path: `${path}/members`, httpStatus: membersQ.data.status },
      );
    } catch (e) {
      memberShapeError = e;
    }
  }
  const filteredMembers = memberRows.filter((row) =>
    !search.trim()
      ? true
      : [
          row.display_name,
          row.email_normalized,
          row.role,
          row.status,
          row.user_id,
        ]
          .map(text)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
  );
  const memberPagination = membersQ.data?.data.pagination;
  const roleOptions = getRoleOptions(app.t);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("staff")}
        subtitle={app.t("admin_staff_subtitle")}
      />
      <Tabs
        destroyOnHidden
        items={[
          {
            key: "members",
            label: app.t("admin_tab_members"),
            children: (
              <div className="stack">
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
                      loading={membersQ.isFetching}
                      onClick={() => void membersQ.refetch()}
                    >
                      {app.t("refresh")}
                    </Button>
                  </div>
                  <ErrorNotice error={membersQ.error || memberShapeError} />
                  <Table<Row>
                    rowKey={(r) => text(r.id ?? r.user_id) || JSON.stringify(r)}
                    dataSource={filteredMembers}
                    loading={membersQ.isPending}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    columns={[
                      {
                        title: app.t("display_name"),
                        dataIndex: "display_name",
                        key: "display_name",
                        render: (v: unknown, row: Row) =>
                          text(v) || (
                            <span className="reference">
                              {text(row.user_id) || app.t("unknown")}
                            </span>
                          ),
                      },
                      {
                        title: app.t("admin_col_email"),
                        dataIndex: "email_normalized",
                        key: "email_normalized",
                        render: (v: unknown) =>
                          text(v) || (
                            <span className="muted">{app.t("unknown")}</span>
                          ),
                      },
                      {
                        title: app.t("role_code"),
                        dataIndex: "role",
                        key: "role",
                        render: (v: unknown) => app.t(text(v)),
                      },
                      {
                        title: app.t("status"),
                        dataIndex: "status",
                        key: "status",
                        render: (v: unknown) => <Status value={v} />,
                      },
                      {
                        title: app.t("permissions"),
                        dataIndex: "permissions",
                        key: "permissions",
                        render: (v: unknown, row: Row) => {
                          const perms = Array.isArray(v) ? v.map(text) : [];
                          return (
                            <Space size={[4, 4]} wrap>
                              <Tag color="blue">
                                {app
                                  .t("admin_grants_count")
                                  .replace("{count}", String(perms.length))}
                              </Tag>
                              {perms.slice(0, 2).map((p) => (
                                <Tag key={p}>{p}</Tag>
                              ))}
                              {perms.length > 0 && (
                                <Button
                                  size="small"
                                  type="link"
                                  onClick={() => setInspectPerms(row)}
                                >
                                  {app.t("admin_inspect_permissions")}
                                </Button>
                              )}
                            </Space>
                          );
                        },
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
                            {app.can("members.manage") && (
                              <Button
                                size="small"
                                onClick={() => setMember(row)}
                              >
                                {app.t("admin_update_member")}
                              </Button>
                            )}
                            {app.can("ownership.transfer") &&
                              row.role !== "owner" &&
                              row.status === "active" && (
                                <Button
                                  size="small"
                                  onClick={() => setTransfer(row)}
                                >
                                  {app.t("admin_transfer_ownership")}
                                </Button>
                              )}
                          </Space>
                        ),
                      },
                    ]}
                    locale={{ emptyText: app.t("empty") }}
                  />
                  <div className="table-footer">
                    <Typography.Text type="secondary">
                      {memberRows.length} {app.t("loaded")}
                      {membersQ.data && (
                        <>
                          {" "}
                          · {app.t("common_updated")}{" "}
                          <Time value={membersQ.data.timestamp} />
                        </>
                      )}
                    </Typography.Text>
                    <Space>
                      <Button
                        disabled={!history.length || membersQ.isFetching}
                        onClick={() => {
                          setCursor(history[history.length - 1]);
                          setHistory((v) => v.slice(0, -1));
                        }}
                      >
                        {app.t("previous")}
                      </Button>
                      <Button
                        disabled={
                          !memberPagination?.next_cursor || membersQ.isFetching
                        }
                        onClick={() => {
                          setHistory((v) => [...v, cursor]);
                          setCursor(memberPagination!.next_cursor!);
                        }}
                      >
                        {app.t("next")}
                      </Button>
                    </Space>
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: "invitations",
            label: app.t("admin_tab_invitations"),
            children: (
              <div className="stack">
                {app.can("members.manage") && (
                  <Button type="primary" onClick={() => setInvite(true)}>
                    {app.t("admin_invite_staff")}
                  </Button>
                )}
                <Directory
                  path={`${path}/invitations`}
                  query={{ per_page: 50 }}
                  fields={[
                    "email_normalized",
                    "role_code",
                    "expires_at",
                    "accepted_at",
                    "revoked_at",
                    "created_at",
                  ]}
                  action={(row) =>
                    app.can("members.manage") &&
                    !row.accepted_at &&
                    !row.revoked_at && (
                      <Action
                        label={app.t("admin_revoke_invitation")}
                        danger
                        path={`${path}/invitations/${segment(text(row.id))}/revoke`}
                      />
                    )
                  }
                />
              </div>
            ),
          },
        ]}
      />
      {inspectPerms && (
        <Drawer
          open
          size={520}
          title={app
            .t("admin_permissions_drawer_title")
            .replace(
              "{target}",
              text(inspectPerms.display_name) ||
                text(inspectPerms.email_normalized) ||
                text(inspectPerms.user_id),
            )}
          onClose={() => setInspectPerms(null)}
        >
          <div className="stack">
            <Typography.Text type="secondary">
              {app
                .t("admin_primary_role")
                .replace("{role}", app.t(text(inspectPerms.role)))}
            </Typography.Text>
            <Space size={[6, 6]} wrap>
              {(Array.isArray(inspectPerms.permissions)
                ? inspectPerms.permissions
                : []
              ).map((perm) => (
                <Tag key={text(perm)}>{text(perm)}</Tag>
              ))}
            </Space>
          </div>
        </Drawer>
      )}
      {invite && (
        <Workflow
          title={app.t("admin_invite_title")}
          path={`${path}/invitations`}
          fields={[
            field("email", { kind: "email", required: true, max: 255 }),
            choice("role", roleOptions, { required: true }),
          ]}
          idempotent
          description={app.t("admin_invite_desc")}
          onClose={() => setInvite(false)}
        />
      )}
      {member && (
        <Workflow
          title={app.t("admin_update_member_title")}
          path={`${path}/members/${segment(text(member.id))}`}
          method="PATCH"
          fields={[
            version,
            choice("status", [
              { value: "active", label: app.t("active") },
              { value: "suspended", label: app.t("suspended") },
              { value: "removed", label: app.t("admin_status_removed") },
            ]),
            ...(member.role === "owner"
              ? []
              : [
                  choice("roles", roleOptions, {
                    kind: "multi",
                    help: app.t("admin_roles_help"),
                  }),
                ]),
          ]}
          initial={{ version: member.version, status: member.status }}
          description={app.t("admin_update_member_desc")}
          onClose={() => setMember(null)}
        />
      )}
      {transfer && (
        <Workflow
          title={app.t("admin_transfer_title")}
          path={`${path}/ownership-transfers`}
          fields={[
            field("membership_id", { kind: "readonly", required: true }),
            version,
          ]}
          initial={{ membership_id: transfer.id, version: transfer.version }}
          description={app.t("admin_transfer_desc")}
          onClose={() => setTransfer(null)}
        />
      )}
    </div>
  );
}
function settingFields(app: ReturnType<typeof useApp>): Field[] {
  return [
    number(
      "settings.telemetry_interval_seconds",
      Math.max(
        2,
        Number(
          app.subscription?.subscription?.plan_snapshot?.telemetry_min_seconds,
        ) || 2,
      ),
      30,
      { slider: true, suffix: "s" },
    ),
    ...(app.feature("safety")
      ? [
          number("settings.harsh_braking_ms2", 0.5, 20, {
            integer: false,
            step: 0.1,
            suffix: "m/s²",
          }),
          number("settings.rapid_acceleration_ms2", 0.5, 20, {
            integer: false,
            step: 0.1,
            suffix: "m/s²",
          }),
        ]
      : []),
    number("settings.maf_air_fuel_ratio", 5, 30, {
      integer: false,
      step: 0.1,
      suffix: ":1",
    }),
    number("settings.maf_fuel_density_g_per_litre", 500, 1000, {
      integer: false,
      suffix: "g/L",
    }),
    number("settings.co2_petrol_kg_per_litre", 0.1, 10, {
      integer: false,
      step: 0.01,
      default: 2.31,
      suffix: "kg/L",
    }),
    number("settings.co2_diesel_kg_per_litre", 0.1, 10, {
      integer: false,
      step: 0.01,
      default: 2.68,
      suffix: "kg/L",
    }),
    number("settings.device_offline_after_s", 90, 3600, { suffix: "s" }),
    field("settings.email_digest_hour", {
      kind: "hour",
      min: 0,
      max: 23,
      required: true,
    }),
    choice(
      "settings.email_weekly_iso_day",
      [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        label: app.t(`weekday_${day}`),
        value: day,
      })),
    ),
    number("settings.email_subscription_warning_days", 0, 365, {
      suffix: app.t("unit_days"),
    }),
    ...[
      "email_organization_daily",
      "email_driver_daily",
      "email_driver_weekly",
      ...(app.feature("safety") ? ["email_score_changes"] : []),
    ].map((key) => field(`settings.${key}`, { kind: "switch" })),
  ];
}
export function Settings() {
  const app = useApp(),
    path = orgPath(app.organizationId),
    q = useData(`${path}/settings`, {}, app.can("settings.read")),
    org = useData(path, {}, app.can("organizations.read"));
  const [edit, setEdit] = useState(false),
    [editOrg, setEditOrg] = useState(false);
  return (
    <div className="stack">
      <PageTitle
        title={app.t("settings")}
        subtitle={app.t("admin_settings_subtitle")}
      />
      <ErrorNotice error={q.error} />
      <Tabs
        destroyOnHidden
        items={[
          {
            key: "telemetry",
            label: app.t("admin_tab_telemetry_email"),
            children: (
              <div className="stack">
                <Card
                  title={app.t("settings")}
                  extra={
                    app.can("settings.write") && (
                      <Button onClick={() => setEdit(true)}>
                        {app.t("admin_edit_settings")}
                      </Button>
                    )
                  }
                >
                  <Details
                    data={
                      q.data
                        ? Object.fromEntries(
                            Object.entries({
                              co2_petrol_kg_per_litre: 2.31,
                              co2_diesel_kg_per_litre: 2.68,
                              ...object(q.data.data.settings),
                            }).filter(
                              ([key]) =>
                                ![
                                  "notification_locales",
                                  "unidentified_driving_alert_after_s",
                                ].includes(key),
                            ),
                          )
                        : undefined
                    }
                  />
                </Card>
                <p className="muted">{app.t("admin_security_notices_note")}</p>
              </div>
            ),
          },
          ...(app.can("organizations.read")
            ? [
                {
                  key: "organization",
                  label: app.t("admin_tab_org_profile"),
                  children: (
                    <Card
                      title={app.t("admin_org_metadata")}
                      extra={
                        app.can("organizations.write") && (
                          <Button onClick={() => setEditOrg(true)}>
                            {app.t("admin_edit_org")}
                          </Button>
                        )
                      }
                    >
                      <ErrorNotice error={org.error} />
                      <Details data={object(org.data?.data.organization)} />
                      <Files
                        targetType="organization"
                        targetId={app.organizationId}
                        write={app.can("organizations.write")}
                      />
                    </Card>
                  ),
                },
              ]
            : []),
        ]}
      />
      {edit && q.data && (
        <Workflow
          title={app.t("admin_edit_server_settings")}
          path={`${path}/settings`}
          method="PATCH"
          fields={[version, ...settingFields(app)]}
          initial={q.data.data}
          transform={(v) => ({
            version: v.version,
            settings: Object.fromEntries(
              Object.entries(object(v.settings)).filter(
                ([key, value]) =>
                  JSON.stringify(value) !==
                  JSON.stringify(object(q.data!.data.settings)[key]),
              ),
            ),
          })}
          refreshPath={`${path}/settings`}
          onClose={() => setEdit(false)}
        />
      )}
      {editOrg && (
        <Workflow
          title={app.t("admin_edit_org_metadata")}
          path={path}
          method="PATCH"
          fields={[
            version,
            field("name", { max: 160 }),
            field("contact_email", { kind: "email", max: 255 }),
            choice("timezone", timezones),
            choice("default_locale", [
              { value: "en", label: "English" },
              { value: "ms", label: "Bahasa Melayu" },
              { value: "zh", label: "简体中文" },
            ]),
            field("country_code", {
              kind: "autocomplete",
              uppercase: true,
              pattern: /^[A-Z]{2}$/,
              options: [
                "MY",
                "SG",
                "ID",
                "TH",
                "BN",
                "PH",
                "VN",
                "AU",
                "GB",
                "US",
              ].map((c) => ({ value: c, label: c })),
            }),
          ]}
          initial={object(org.data?.data.organization)}
          refreshPath={path}
          onClose={() => setEditOrg(false)}
        />
      )}
    </div>
  );
}
