import { ResponseContractError, type ResponseMetadata } from "./client";
import {
  object,
  type Membership,
  type Row,
  type Session,
  type SubscriptionData,
} from "./types";

function invalid(
  requestId: string,
  metadata: ResponseMetadata,
  issue: string,
): never {
  throw new ResponseContractError(
    metadata.httpStatus,
    requestId,
    metadata.path,
    issue,
  );
}
function string(
  value: unknown,
  requestId: string,
  metadata: ResponseMetadata,
  field: string,
): string {
  return typeof value === "string" && value.length > 0
    ? value
    : invalid(requestId, metadata, `${field} must be a nonempty string.`);
}
export function sessionData(
  value: unknown,
  requestId: string,
  metadata: ResponseMetadata = { path: "/api/v1/me", httpStatus: 200 },
): Session {
  const data = object(value),
    user = object(data.user);
  // Older PHP deployments encoded an empty permission map as []. Normalize
  // only this empty legacy representation; it confers no organization grants.
  const rawPermissions =
    Array.isArray(data.permissions) && data.permissions.length === 0
      ? {}
      : data.permissions;
  const permissions = object(rawPermissions);
  if (
    !rawPermissions ||
    typeof rawPermissions !== "object" ||
    Array.isArray(rawPermissions) ||
    !Object.values(permissions).every(
      (v) => Array.isArray(v) && v.every((k) => typeof k === "string"),
    )
  )
    invalid(
      requestId,
      metadata,
      "data.permissions must map organizations to permission arrays.",
    );
  if (!Number.isInteger(user.version) || Number(user.version) < 1)
    invalid(
      requestId,
      metadata,
      "data.user.version must be a positive integer.",
    );
  if (!["en", "ms", "zh", "ta"].includes(String(user.locale)))
    invalid(requestId, metadata, "data.user.locale is unsupported.");
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: string(
        user.timezone,
        requestId,
        metadata,
        "data.user.timezone",
      ),
    });
  } catch {
    invalid(
      requestId,
      metadata,
      "data.user.timezone must be a valid timezone.",
    );
  }
  let platform: Session["platform"] = null;
  if (data.platform !== null) {
    const staff = object(data.platform);
    if (
      !["admin", "technician"].includes(String(staff.role)) ||
      !Number.isInteger(staff.version) ||
      Number(staff.version) < 1
    )
      invalid(
        requestId,
        metadata,
        "data.platform must identify a SaaS staff role and positive version.",
      );
    platform = staff as NonNullable<Session["platform"]>;
  }
  return {
    user: {
      id: string(user.id, requestId, metadata, "data.user.id"),
      email: string(
        user.email_normalized,
        requestId,
        metadata,
        "data.user.email_normalized",
      ),
      display_name: string(
        user.display_name,
        requestId,
        metadata,
        "data.user.display_name",
      ),
      version: Number(user.version),
      locale: user.locale as Session["user"]["locale"],
      timezone: String(user.timezone),
    },
    permissions: permissions as Session["permissions"],
    platform,
  };
}
export function membershipData(
  value: unknown,
  requestId: string,
  metadata: ResponseMetadata = {
    path: "/api/v1/organizations",
    httpStatus: 200,
  },
): Membership[] {
  const list = object(value).organizations;
  if (!Array.isArray(list))
    invalid(
      requestId,
      metadata,
      "data.organizations must be a membership array.",
    );
  return list.map((value) => {
    const row = object(value),
      org = object(row.organization);
    return {
      id: string(row.id, requestId, metadata, "membership.id"),
      organization_id: string(
        row.organization_id,
        requestId,
        metadata,
        "membership.organization_id",
      ),
      role: string(row.role, requestId, metadata, "membership.role"),
      status: string(row.status, requestId, metadata, "membership.status"),
      organization: {
        id: string(org.id, requestId, metadata, "membership.organization.id"),
        name: string(
          org.name,
          requestId,
          metadata,
          "membership.organization.name",
        ),
        timezone: string(
          org.timezone,
          requestId,
          metadata,
          "membership.organization.timezone",
        ),
      },
    };
  });
}
export function subscriptionData(
  value: unknown,
  requestId: string,
  metadata: ResponseMetadata = {
    path: "/api/v1/organizations/{organization}/subscription",
    httpStatus: 200,
  },
): SubscriptionData {
  const data = object(value);
  if (typeof data.access_active !== "boolean" || !("subscription" in data))
    invalid(
      requestId,
      metadata,
      "Expected subscription and boolean access_active fields.",
    );
  if (data.subscription === null)
    return {
      subscription: null,
      access_active: data.access_active,
      usage: object(data.usage),
    };
  const subscription = object(data.subscription);
  return {
    subscription: {
      ...subscription,
      status: string(
        subscription.status,
        requestId,
        metadata,
        "subscription.status",
      ),
      plan_snapshot: object(subscription.plan_snapshot),
    },
    access_active: data.access_active,
    usage: object(data.usage),
  };
}
export function directoryRows(
  value: unknown,
  requestId: string,
  metadata: ResponseMetadata = { path: "", httpStatus: 200 },
): Row[] {
  if (
    !Array.isArray(value) ||
    value.some((v) => !v || typeof v !== "object" || Array.isArray(v))
  )
    invalid(requestId, metadata, "Expected a list of record objects.");
  return value as Row[];
}
