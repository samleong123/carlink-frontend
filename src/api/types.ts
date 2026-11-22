import type { components, paths } from "./generated";

export type Schemas = components["schemas"];
export type RequestBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;
// Individual response data is not fully specified by OpenAPI. These models reflect controllers.
export type Row = Record<string, unknown>;
export interface Envelope<T> {
  status: number;
  timestamp: string;
  ip_address: string | null;
  ip_country?: string | null;
  request_id: string;
  title: string;
  desc: string;
  data: T;
}
export interface Pagination {
  next_cursor?: string | null;
  previous_cursor?: string | null;
  per_page?: number;
}
export interface ListData {
  items: Row[];
  pagination?: Pagination;
  [key: string]: unknown;
}
export interface User extends Row {
  id: string;
  email: string;
  display_name: string;
  version: number;
  locale: "en" | "ms" | "zh" | "ta";
  timezone: string;
}
export interface Organization extends Row {
  id: string;
  name: string;
  timezone: string;
}
export interface Membership extends Row {
  id: string;
  organization_id: string;
  role: string;
  status: string;
  organization: Organization;
}
export interface Session {
  user: User;
  permissions: Record<string, string[]>;
  platform: { role: "admin" | "technician"; version: number } | null;
}
export interface SubscriptionData {
  subscription:
    (Row & { plan_snapshot?: Row; status: string; expires_at?: string }) | null;
  access_active: boolean;
  usage: Row;
}
export type Query = Record<
  string,
  string | number | boolean | null | undefined
>;

export function object(value: unknown): Row {
  if (typeof value === "string") {
    try {
      return object(JSON.parse(value));
    } catch {
      return {};
    }
  }
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : {};
}
export function rows(value: unknown): Row[] {
  return Array.isArray(value) ? value.map(object) : [];
}
export function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}
