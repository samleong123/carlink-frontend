import { useEffect, useState, type ReactNode } from "react";
import {
  App as AntApp,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Result,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  AlertOutlined,
  ApiOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  CompassOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TrophyOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, orgPath } from "../api/client";
import { useApp, type Workspace } from "./context";
import { coreText } from "../i18n/corePhrases";
import { navigation, safeLocalDestination } from "./navigation";
import { AuthScreen } from "../auth/AuthScreen";
import { ErrorNotice, useData } from "../components/shared";
import { Overview } from "../features/overview";
import { Registry } from "../features/registry";
import { VehicleDetail, DeviceDetail } from "../features/vehicles";
import {
  DriverDetail,
  Assignments,
  Journeys,
  DriverPortal,
  Safety,
} from "../features/driving";
import { Billing } from "../features/billing";
import {
  Plans,
  Subscribers,
  PlatformStaff,
  PlatformDevices,
} from "../features/platform";
import { Maintenance } from "../features/maintenance";
import { Compliance } from "../features/compliance";
import { Account, Settings, Staff } from "../features/administration";
import { Notifications } from "../features/notifications";
import { Coverage, Logs, Reports } from "../features/analytics";
import { Landing } from "../public/Landing";
import { TermsAndConditions, PrivacyPolicy } from "../public/Legal";
import { UserManual } from "../public/UserManual";
import { Signup } from "../public/Signup";
import { SignupArchives } from "../public/SignupArchives";

export function AppRoot() {
  const app = useApp(),
    navigate = useNavigate(),
    location = useLocation(),
    [entry, setEntry] = useState(window.__carlinkEntry);
  if (entry)
    return (
      <AuthScreen
        entry={entry}
        onFinish={(destination) => {
          window.history.replaceState(null, "", "/");
          setEntry(undefined);
          navigate(destination, { replace: true });
        }}
      />
    );
  if (app.loading)
    return (
      <div className="boot-screen">
        <CarOutlined />
        <Spin size="large" />
        <p>{app.t("loading")}</p>
        <footer className="site-footer" style={{ padding: "0 16px" }}>
          {coreText(
            app.locale,
            "For the best experience, use Google Chrome, Microsoft Edge, or Safari at 1920 × 1080 resolution or higher on Desktop, Laptop, or Tablet.",
            app.t,
          )}
        </footer>
      </div>
    );
  if (location.pathname === "/" || location.pathname === "/plans")
    return <Landing pricing={location.pathname === "/plans"} />;
  if (location.pathname === "/terms") return <TermsAndConditions />;
  if (location.pathname === "/privacy") return <PrivacyPolicy />;
  if (
    location.pathname === "/user_manual" ||
    location.pathname === "/user-manual"
  )
    return <UserManual />;
  if (location.pathname === "/signup") return <Signup />;
  if (location.pathname === "/signin")
    return (
      <AuthScreen
        returnTo={safeLocalDestination(
          new URLSearchParams(location.search).get("return_to") || "/console",
        )}
        onFinish={(to) => navigate(to, { replace: true })}
      />
    );
  if (!app.session)
    return (
      <AuthScreen
        returnTo={location.pathname + location.search}
        onFinish={(to) => navigate(to)}
      />
    );
  if (
    app.memberships.some(
      (m) =>
        m.organization_id === app.organizationId &&
        m.organization.status === "pending_payment",
    ) &&
    location.pathname === "/console"
  )
    return <Navigate to="/signup" replace />;
  return <Shell />;
}
function Shell() {
  const app = useApp(),
    location = useLocation(),
    navigate = useNavigate(),
    { modal } = AntApp.useApp();
  const ct = (key: string) => coreText(app.locale, key, app.t);
  const [mobileMenu, setMobileMenu] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [logoutError, setLogoutError] = useState<unknown>(null);
  const orgMatch = /^\/organization\/([^/]+)\/(.+)$/.exec(location.pathname),
    section = orgMatch?.[2] || location.pathname.split("/")[2] || "";
  const desiredWorkspace: Workspace = location.pathname.startsWith("/platform/")
    ? "platform"
    : location.pathname.startsWith("/technician/")
      ? "technician"
      : orgMatch
        ? section.startsWith("my/")
          ? "driver"
          : "fleet"
        : app.workspace;
  const desiredOrg = orgMatch
    ? decodeURIComponent(orgMatch[1])
    : app.organizationId;
  const validOrg =
    !orgMatch ||
    app.memberships.some(
      (m) => m.organization_id === desiredOrg && m.status === "active",
    );
  const validPlatform =
    desiredWorkspace !== "platform" || app.session?.platform?.role === "admin";
  const validTechnician =
    desiredWorkspace !== "technician" ||
    app.session?.platform?.role === "technician";
  useEffect(() => {
    if (
      validOrg &&
      validPlatform &&
      validTechnician &&
      (desiredWorkspace !== app.workspace || desiredOrg !== app.organizationId)
    )
      app.select(desiredWorkspace, desiredOrg);
  }, [
    desiredWorkspace,
    desiredOrg,
    validOrg,
    validPlatform,
    validTechnician,
    app.workspace,
    app.organizationId,
  ]);
  const nav = navigation(
    app.workspace,
    app.organizationId,
    app.session?.permissions[app.organizationId] || [],
    { safety: app.feature("safety"), cellular: app.feature("cellular") },
  );
  const home = nav[0]?.path || "/account";
  const q = useData(
    orgPath(app.organizationId, "/notifications/unread-count"),
    {},
    !!app.organizationId &&
      app.can("notifications.own") &&
      app.subscription?.access_active !== false,
    60000,
  );
  const selectWorkspace = (workspace: Workspace) => {
    app.select(workspace, app.organizationId);
    const paths = navigation(
      workspace,
      app.organizationId,
      app.session?.permissions[app.organizationId] || [],
      { safety: app.feature("safety"), cellular: app.feature("cellular") },
    );
    navigate(paths[0]?.path || "/account");
    setMobileMenu(false);
  };
  const signOut = () =>
    modal.confirm({
      title: ct("signOut"),
      content: ct(
        "End this browser session only? Physical NFC shifts and automatic journeys are not ended.",
      ),
      onOk: async () => {
        try {
          await api("/api/v1/auth/logout", { method: "POST" });
          app.clear();
          navigate("/");
        } catch (e) {
          setLogoutError(e);
        }
      },
    });
  const menuIcon = (key: string, label?: string): ReactNode => {
    if (label === "installation") return <ToolOutlined />;
    const icons: Record<string, ReactNode> = {
      dashboard: <DashboardOutlined />,
      vehicles: <CarOutlined />,
      drivers: <TeamOutlined />,
      assignments: <SolutionOutlined />,
      devices: <ApiOutlined />,
      journeys: <CompassOutlined />,
      safety: <SafetyCertificateOutlined />,
      appeals: <AuditOutlined />,
      maintenance: <ToolOutlined />,
      compliance: <FileProtectOutlined />,
      coverage: <WifiOutlined />,
      reports: <BarChartOutlined />,
      billing: <CreditCardOutlined />,
      staff: <UsergroupAddOutlined />,
      settings: <SettingOutlined />,
      notifications: <BellOutlined />,
      logs: <HistoryOutlined />,
      subscribers: <TeamOutlined />,
      plans: <InboxOutlined />,
      "signup-archives": <FileSearchOutlined />,
      admins: <UsergroupAddOutlined />,
      "my/overview": <DashboardOutlined />,
      "my/records": <HistoryOutlined />,
      "my/score": <TrophyOutlined />,
      "my/trips": <CompassOutlined />,
      "my/energy": <ThunderboltOutlined />,
      "my/vehicle-info": <CarOutlined />,
      "my/events": <AlertOutlined />,
      "my/appeals": <AuditOutlined />,
    };
    return icons[key] || <SafetyCertificateOutlined />;
  };
  const menu = (
    <>
      <div className="sidebar-caption">{ct("WORKSPACE")}</div>
      <Menu
        selectedKeys={[
          section.split("/")[0] === "my" ? section : section.split("/")[0],
        ]}
        items={nav.map((item) => ({
          key: item.key,
          label: app.t(item.label),
          icon: menuIcon(item.key, item.label),
          onClick: () => {
            navigate(item.path);
            setMobileMenu(false);
          },
        }))}
      />
      <div className="sidebar-bottom">
        <Menu
          selectedKeys={[location.pathname.slice(1)]}
          items={[
            {
              key: "account",
              label: ct("account"),
              icon: <UserOutlined />,
              onClick: () => {
                navigate("/account");
                setMobileMenu(false);
              },
            },
          ]}
        />
      </div>
    </>
  );
  const navKey = section.startsWith("my/") ? section : section.split("/")[0];
  const allowed = nav.some((n) => n.key === navKey);
  const syncing =
    app.workspace !== desiredWorkspace ||
    app.organizationId !== desiredOrg ||
    (app.subscriptionPending &&
      ["my/score", "safety", "coverage"].includes(navKey));
  const common = location.pathname === "/account";
  const inactive =
    app.subscription?.access_active === false &&
    !["billing", "staff", "settings", "logs"].includes(section) &&
    !["platform", "technician"].includes(app.workspace) &&
    !common;
  let content: ReactNode;
  if (location.pathname === "/console")
    content = <Navigate to={home} replace />;
  else if (
    !validOrg ||
    !validPlatform ||
    !validTechnician ||
    (!common && !syncing && !allowed)
  )
    content = (
      <Result
        status="403"
        title={ct("Workspace unavailable")}
        subTitle={ct(
          "Your current memberships and permissions do not grant this page.",
        )}
        extra={
          <Button onClick={() => navigate(home)}>
            {ct("Open permitted workspace")}
          </Button>
        }
      />
    );
  else if (syncing) content = <Spin />;
  else if (inactive)
    content = (
      <Result
        status="warning"
        title={ct("Paid operational access is inactive")}
        subTitle={ct(
          "Renew your subscription or contact an operator about suspension. Permitted billing/account pages remain available.",
        )}
        extra={
          <Button
            onClick={() =>
              navigate(`/organization/${app.organizationId}/billing`)
            }
          >
            {ct("Open billing")}
          </Button>
        }
      />
    );
  else content = <Page section={section} pathname={location.pathname} />;
  const orgName =
    app.memberships.find((m) => m.organization_id === app.organizationId)
      ?.organization.name || ct("No organization selected");
  return (
    <Layout className="application-layout">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        {ct("Skip to content")}
      </a>
      <Layout.Sider
        theme="light"
        width={248}
        collapsed={collapsed}
        className="desktop-sidebar"
      >
        <div className="brand">
          <CarOutlined />
          {!collapsed && <span>CarLink</span>}
        </div>
        <div className="sidebar-scroll">{menu}</div>
        <div className="sidebar-collapse-wrap">
          <Button
            className="collapse-button"
            block
            onClick={() => setCollapsed((v) => !v)}
            aria-label={ct("Toggle sidebar")}
          >
            {collapsed ? "›" : ct("‹ Collapse")}
          </Button>
        </div>
      </Layout.Sider>
      <Drawer
        open={mobileMenu}
        title="CarLink"
        placement="left"
        onClose={() => setMobileMenu(false)}
        size={280}
      >
        {menu}
      </Drawer>
      <Layout>
        <Layout.Header className="app-header">
          <Button
            className="mobile-menu-button"
            aria-label={ct("Open navigation")}
            icon={<MenuOutlined />}
            onClick={() => setMobileMenu(true)}
          />
          <div className="header-selectors">
            <Select
              aria-label={ct("workspace")}
              value={app.workspace}
              onChange={selectWorkspace}
              options={[
                ...(app.memberships.length
                  ? [
                      { value: "fleet", label: ct("fleet") },
                      ...(app.can("profile.own")
                        ? [{ value: "driver", label: ct("driver") }]
                        : []),
                    ]
                  : []),
                ...(app.session?.platform?.role === "admin"
                  ? [{ value: "platform", label: ct("platform") }]
                  : []),
                ...(app.session?.platform?.role === "technician"
                  ? [{ value: "technician", label: ct("technician") }]
                  : []),
              ]}
            />
            {!["platform", "technician"].includes(app.workspace) && (
              <Select
                aria-label={ct("organization")}
                value={app.organizationId || undefined}
                placeholder={ct("organization")}
                options={app.memberships.map((m) => ({
                  value: m.organization_id,
                  label: m.organization.name,
                }))}
                onChange={(org) => {
                  app.select(app.workspace, org);
                  const items = navigation(
                    app.workspace,
                    org,
                    app.session?.permissions[org] || [],
                    { safety: true, cellular: true },
                  );
                  navigate(items[0]?.path || "/account");
                }}
              />
            )}
          </div>
          <Space wrap className="header-actions">
            <Select
              aria-label={ct("language")}
              value={app.locale}
              onChange={app.setLocale}
              popupMatchSelectWidth={false}
              options={[
                { value: "en", label: "EN · English" },
                { value: "ms", label: "BM · Bahasa Melayu" },
                { value: "zh", label: "中文 · 简体中文" },
                { value: "ta", label: "TA · தமிழ்" },
              ]}
            />
            {app.can("notifications.own") && (
              <Badge count={Number(q.data?.data.unread_count) || 0}>
                <Button
                  aria-label={ct("Open notifications")}
                  icon={<BellOutlined />}
                  onClick={() =>
                    navigate(
                      `/organization/${app.organizationId}/notifications`,
                    )
                  }
                />
              </Badge>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "public",
                    label: ct("CarLink home & plans"),
                    onClick: () => navigate("/"),
                  },
                  {
                    key: "signup",
                    label: ct("Create organization"),
                    onClick: () => navigate("/signup"),
                  },
                  {
                    key: "account",
                    label: ct("account"),
                    icon: <UserOutlined />,
                    onClick: () => navigate("/account"),
                  },
                  {
                    key: "logout",
                    label: ct("signOut"),
                    icon: <LogoutOutlined />,
                    onClick: signOut,
                  },
                ],
              }}
            >
              <Button className="profile-button">
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{app.session?.user.display_name || ct("Account")}</span>
              </Button>
            </Dropdown>
          </Space>
        </Layout.Header>
        <Layout.Content
          id="main-content"
          tabIndex={-1}
          className="page-content"
        >
          <Breadcrumb
            items={[
              { title: "CarLink" },
              {
                title: ["platform", "technician"].includes(app.workspace)
                  ? ct(app.workspace)
                  : orgName,
              },
              {
                title: common
                  ? app.t(location.pathname.slice(1))
                  : app.t(
                      nav.find((n) => n.key === section)?.label ||
                        section.split("/")[0],
                    ),
              },
            ]}
          />
          <ErrorNotice error={logoutError} />
          {!!app.error && (
            <ErrorNotice error={app.error} retry={() => void app.reload()} />
          )}
          <div
            key={`${app.session?.user.id}:${app.organizationId}:${app.workspace}:${app.revision}:${location.pathname}`}
            className="route-content"
          >
            {content}
          </div>
          <footer className="site-footer">
            <div>
              {ct("CarLink | Connected to Every Mile")}
              {" · "}
              <a href="#/user_manual">{ct("User Manual")}</a>
              {" · "}
              <a href="#/terms">{ct("Terms & Conditions")}</a>
              {" · "}
              <a href="#/privacy">{ct("Privacy Policy")}</a>
            </div>
            <div style={{ marginTop: 4 }}>
              {ct(
                "For the best experience, use Google Chrome, Microsoft Edge, or Safari at 1920 × 1080 resolution or higher on Desktop, Laptop, or Tablet.",
              )}
            </div>
          </footer>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
function Page({ section, pathname }: { section: string; pathname: string }) {
  const app = useApp(),
    parts = section.split("/"),
    key = parts[0],
    id = parts[1];
  if (pathname === "/account") return <Account />;
  if (app.workspace === "platform") {
    switch (key) {
      case "subscribers":
        return <Subscribers />;
      case "plans":
        return <Plans />;
      case "billing":
        return <Billing platform />;
      case "signup-archives":
        return <SignupArchives />;
      case "devices":
        return <PlatformDevices />;
      case "reports":
        return <Overview platform />;
      case "logs":
        return <Logs platform />;
      case "admins":
        return <PlatformStaff />;
    }
  }
  if (app.workspace === "technician") return <PlatformDevices technician />;
  if (key === "my") return <DriverPortal page={id || "overview"} />;
  switch (key) {
    case "dashboard":
      return <Overview />;
    case "vehicles":
      return id ? (
        <VehicleDetail id={decodeURIComponent(id)} />
      ) : (
        <Registry resource="vehicles" />
      );
    case "drivers":
      return id ? (
        <DriverDetail id={decodeURIComponent(id)} />
      ) : (
        <Registry resource="drivers" />
      );
    case "devices":
      return id ? (
        <DeviceDetail id={decodeURIComponent(id)} />
      ) : (
        <Registry resource="devices" />
      );
    case "assignments":
      return <Assignments />;
    case "journeys":
      return <Journeys />;
    case "safety":
      return <Safety />;
    case "appeals":
      return <Safety appeals />;
    case "maintenance":
      return <Maintenance />;
    case "compliance":
      return <Compliance />;
    case "coverage":
      return <Coverage />;
    case "reports":
      return <Reports />;
    case "billing":
      return <Billing />;
    case "staff":
      return <Staff />;
    case "settings":
      return <Settings />;
    case "notifications":
      return <Notifications />;
    case "logs":
      return <Logs />;
    default:
      return (
        <Result
          status="404"
          title={coreText(app.locale, "Page unavailable", app.t)}
        />
      );
  }
}
