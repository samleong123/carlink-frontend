import type { Workspace } from "./context";
export interface NavItem {
  key: string;
  label: string;
  path: string;
  permission?: string;
  feature?: "safety" | "cellular";
}
export function navigation(
  workspace: Workspace,
  organizationId: string,
  permissions: string[],
  features: { safety: boolean; cellular: boolean },
): NavItem[] {
  const prefix = `/organization/${encodeURIComponent(organizationId)}`;
  if (workspace === "platform")
    return [
      "subscribers",
      "plans",
      "billing",
      "signup-archives",
      "devices",
      "reports",
      "logs",
      "admins",
    ].map((key) => ({ key, label: key, path: `/platform/${key}` }));
  if (workspace === "technician")
    return [
      { key: "devices", label: "installation", path: "/technician/devices" },
    ];
  if (!organizationId) return [];
  if (workspace === "driver")
    return permissions.includes("profile.own")
      ? [
          {
            key: "my/overview",
            label: "myOverview",
            path: `${prefix}/my/overview`,
          },
          ...[
            "records",
            ...(features.safety ? ["score"] : []),
            "trips",
            "energy",
            "vehicle-info",
            ...(features.safety ? ["events", "appeals"] : []),
          ].map((key) => ({
            key: `my/${key}`,
            label:
              key === "vehicle-info"
                ? "vehicleInfo"
                : key === "appeals"
                  ? "myAppeals"
                  : key,
            path: `${prefix}/my/${key}`,
          })),
          {
            key: "notifications",
            label: "notifications",
            path: `${prefix}/notifications`,
          },
        ]
      : [];
  const spec: [string, string, string, ("safety" | "cellular")?][] = [
    ["dashboard", "dashboard", "dashboard.read"],
    ["vehicles", "vehicles", "vehicles.read"],
    ["drivers", "drivers", "drivers.read"],
    ["assignments", "drivers", "drivers.read"],
    ["devices", "devices", "devices.read"],
    ["journeys", "journeys", "journeys.read"],
    ["safety", "safety", "safety.read", "safety"],
    ["appeals", "appeals", "safety.appeals.decide", "safety"],
    ["maintenance", "maintenance", "maintenance.read"],
    ["compliance", "compliance", "compliance.read"],
    ["coverage", "coverage", "coverage.read", "cellular"],
    ["reports", "reports", "reports.read"],
    ["billing", "billing", "subscription.read"],
    ["staff", "staff", "members.read"],
    ["settings", "settings", "settings.read"],
    ["notifications", "notifications", "notifications.own"],
    ["logs", "logs", "request_logs.read"],
  ];
  return spec
    .filter(
      ([key, , permission, feature]) =>
        (permissions.includes(permission) ||
          (key === "logs" && permissions.includes("audit.read"))) &&
        (!feature || features[feature]),
    )
    .map(([key, label, permission, feature]) => ({
      key,
      label: key === "assignments" ? "Current assignments" : label,
      permission,
      feature,
      path: `${prefix}/${key}`,
    }));
}
export function safeLocalDestination(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(value)
  )
    return "/";
  // Only public signup destinations and guarded console routes. Never navigate to a real external path.
  if (value === "/" || value === "/console" || value === "/console/")
    return "/console";
  if (/^\/signup(?:\?plan=[A-Za-z0-9_-]+)?$/.test(value)) return value;
  if (
    /^\/signup\?signup=[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}&checkout=1$/.test(
      value,
    )
  )
    return value;
  if (
    /^\/(?:organization\/[^/?#]+\/.+|platform\/[^/?#]+|technician\/devices|account)$/.test(
      value,
    )
  )
    return value;
  return "/";
}
