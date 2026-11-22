import type { Envelope, Query, Row } from "./types";
import { object } from "./types";
import fileOrigins from "../../deploy/file-origins.json";

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://carlink-be.samsam123.name.my";
if (API_ORIGIN !== "https://carlink-be.samsam123.name.my")
  throw new Error("Unexpected API origin.");
export const transport = {
  credentials: "include",
  mode: "cors",
  cache: "no-store",
  redirect: "error",
  referrerPolicy: "no-referrer",
} as const;
let generation = 0;
const controllers = new Set<AbortController>();
let csrfFlight: Promise<void> | null = null;

export function resetContext() {
  generation++;
  for (const controller of controllers) controller.abort();
  controllers.clear();
  csrfFlight = null;
}
export const segment = (value: string) => encodeURIComponent(value);
export const orgPath = (id: string, path = "") =>
  `/api/v1/organizations/${segment(id)}${path}`;

export function apiUrl(path: string, query: Query = {}): URL {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
    throw new Error("Unsupported API destination.");
  const url = new URL(path, API_ORIGIN);
  if (
    url.origin !== API_ORIGIN ||
    !(
      url.pathname.startsWith("/api/v1/") ||
      url.pathname === "/sanctum/csrf-cookie"
    ) ||
    /^\/api\/v1\/(device\/|payment-gateway\/)/.test(url.pathname)
  )
    throw new Error("Unsupported human API destination.");
  for (const [key, value] of Object.entries(query))
    if (value !== undefined)
      url.searchParams.set(
        key,
        typeof value === "boolean" ? (value ? "1" : "0") : String(value),
      );
  return url;
}
export function fileUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Unsupported private file link.");
  }
  const allowed = fileOrigins.some((origin) => {
    if (!origin.startsWith("https://*.")) return url.origin === origin;
    const suffix = origin.slice("https://*".length);
    return (
      !url.port &&
      url.hostname.endsWith(suffix) &&
      url.hostname.length > suffix.length
    );
  });
  if (
    url.protocol !== "https:" ||
    !allowed ||
    url.username ||
    url.password ||
    url.hash ||
    !/^\/(?:[^/]+\/)?private-assets\/[A-Za-z0-9-]+\/[A-Za-z0-9-]+\.(?:png|jpg|pdf)$/.test(
      url.pathname,
    ) ||
    url.searchParams.get("X-Amz-Algorithm") !== "AWS4-HMAC-SHA256" ||
    !/^[a-f0-9]{64}$/.test(url.searchParams.get("X-Amz-Signature") || "") ||
    !/^\d{8}T\d{6}Z$/.test(url.searchParams.get("X-Amz-Date") || "") ||
    !/\/s3\/aws4_request$/.test(
      url.searchParams.get("X-Amz-Credential") || "",
    ) ||
    url.searchParams.get("X-Amz-SignedHeaders") !== "host" ||
    !/^[1-9]\d*$/.test(url.searchParams.get("X-Amz-Expires") || "") ||
    Number(url.searchParams.get("X-Amz-Expires")) > 300
  )
    throw new Error("Unsupported private file link.");
  const signedDate = url.searchParams.get("X-Amz-Date")!;
  const isoDate = signedDate.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z",
  );
  const signedAt = Date.parse(isoDate);
  if (
    !Number.isFinite(signedAt) ||
    new Date(signedAt).toISOString().replace(/[-:]|\.000/g, "") !==
      signedDate ||
    signedAt > Date.now() + 5000 ||
    signedAt + Number(url.searchParams.get("X-Amz-Expires")) * 1000 <=
      Date.now() ||
    Array.from(url.searchParams.keys()).some(
      (key) => url.searchParams.getAll(key).length !== 1,
    ) ||
    !/^[^/]+\/\d{8}\/[^/]+\/s3\/aws4_request$/.test(
      url.searchParams.get("X-Amz-Credential") || "",
    )
  )
    throw new Error("Unsupported private file link.");
  return url;
}
export function privateFileLink(value: unknown): {
  url: string;
  expiresAt: number;
} {
  const link = object(value),
    expiresAt = Date.parse(String(link.expires_at || ""));
  if (
    link.valid_for_seconds !== 300 ||
    link.requires_authenticated_session !== false ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now() ||
    expiresAt > Date.now() + 305000
  )
    throw new Error(
      "The private file link is expired or invalid. Request a new link.",
    );
  const url = fileUrl(String(link.url || ""));
  const signedAt = Date.parse(
    url.searchParams
      .get("X-Amz-Date")!
      .replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
        "$1-$2-$3T$4:$5:$6Z",
      ),
  );
  const signedExpiry =
    signedAt + Number(url.searchParams.get("X-Amz-Expires")) * 1000;
  if (Math.abs(expiresAt - signedExpiry) > 5000)
    throw new Error(
      "The private file link is expired or invalid. Request a new link.",
    );
  return { url: url.href, expiresAt: Math.min(expiresAt, signedExpiry) };
}
export function checkoutUrl(value: string): URL {
  const url = new URL(value);
  if (
    url.origin !== "https://gateway.samsam123.name.my" ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("Unsupported checkout provider.");
  return url;
}
export function csrfCookie(): string | null {
  const cookie = document.cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("XSRF-TOKEN="));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice("XSRF-TOKEN=".length));
  } catch {
    return null;
  }
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public requestId: string,
    public fields: Record<string, string[]>,
    public uncertain = false,
    public retryAfter?: number,
    public path = "",
  ) {
    super(
      status === 0
        ? "The API could not be reached."
        : `Request returned ${status}.`,
    );
    this.name = "ApiError";
  }
}
export class ResponseContractError extends Error {
  constructor(
    public httpStatus: number,
    public requestId: string,
    public path: string,
    public issue: string,
    public uncertain = false,
  ) {
    super("The API response did not match the expected format.");
    this.name = "ResponseContractError";
  }
}
export interface ResponseMetadata {
  path: string;
  httpStatus: number;
}
export function isUncertainError(error: unknown): boolean {
  return (
    (error instanceof ApiError || error instanceof ResponseContractError) &&
    error.uncertain
  );
}
export function errorFields(data: unknown): Record<string, string[]> {
  const d = object(data),
    source = object(object(d.error).fields ?? d.errors);
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ]),
  );
}
export interface ApiOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  sensitive?: boolean;
  readOnlyAction?: boolean;
}

export async function initializeCsrf(): Promise<void> {
  if (!csrfFlight) {
    const flight = api<Row>("/sanctum/csrf-cookie").then(() => {
      if (!csrfCookie()) throw new ApiError(419, "", {});
    });
    csrfFlight = flight;
    flight
      .finally(() => {
        if (csrfFlight === flight) csrfFlight = null;
      })
      .catch(() => {});
  }
  await csrfFlight;
}
export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<Envelope<T>> {
  const url = apiUrl(path, options.query);
  const method = options.method || "GET",
    mutation = method !== "GET",
    mutatingWrite = mutation && !options.readOnlyAction;
  const epoch = generation,
    controller = new AbortController();
  controllers.add(controller);
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  let sent = false;
  try {
    if (mutation && !csrfCookie()) await initializeCsrf();
    if (controller.signal.aborted || epoch !== generation)
      throw new DOMException("Context changed", "AbortError");
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    };
    if (mutation) {
      const token = csrfCookie();
      if (!token) throw new ApiError(419, "", {});
      headers["X-XSRF-TOKEN"] = token;
    }
    if (options.body !== undefined)
      headers["Content-Type"] = "application/json";
    sent = true;
    const response = await fetch(url, {
      ...transport,
      method,
      headers,
      signal: controller.signal,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (epoch !== generation)
      throw new DOMException("Context changed", "AbortError");
    const headerRequestId = response.headers.get("X-Request-ID") || "";
    const serverError = (data?: unknown) =>
      new ApiError(
        response.status,
        typeof object(data).request_id === "string"
          ? String(object(data).request_id)
          : headerRequestId,
        errorFields(object(data).data),
        mutatingWrite && response.status >= 500,
        Number(response.headers.get("Retry-After")) || undefined,
        url.pathname,
      );
    if (!response.headers.get("content-type")?.includes("application/json")) {
      if (!response.ok) throw serverError();
      throw new ResponseContractError(
        response.status,
        headerRequestId,
        url.pathname,
        "Expected a JSON response.",
        mutatingWrite,
      );
    }
    let envelope: Envelope<T>;
    try {
      envelope = (await response.json()) as Envelope<T>;
    } catch {
      if (epoch !== generation || controller.signal.aborted)
        throw new DOMException("Context changed", "AbortError");
      if (!response.ok) throw serverError();
      throw new ResponseContractError(
        response.status,
        headerRequestId,
        url.pathname,
        "The response contained invalid JSON.",
        mutatingWrite,
      );
    }
    if (epoch !== generation || controller.signal.aborted)
      throw new DOMException("Context changed", "AbortError");
    if (!response.ok) {
      if (response.status === 401)
        window.dispatchEvent(new Event("carlink:session-expired"));
      if (response.status === 419) void initializeCsrf().catch(() => {});
      throw serverError(envelope);
    }
    if (
      !envelope ||
      typeof envelope !== "object" ||
      typeof envelope.status !== "number" ||
      envelope.status !== response.status ||
      typeof envelope.request_id !== "string" ||
      !("data" in envelope)
    )
      throw new ResponseContractError(
        response.status,
        typeof object(envelope).request_id === "string"
          ? String(object(envelope).request_id)
          : headerRequestId,
        url.pathname,
        "Expected an API envelope matching the HTTP response status.",
        mutatingWrite,
      );
    return envelope;
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof ResponseContractError ||
      (error instanceof DOMException && error.name === "AbortError")
    )
      throw error;
    throw new ApiError(0, "", {}, mutatingWrite && sent);
  } finally {
    controllers.delete(controller);
    options.signal?.removeEventListener("abort", abort);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener noreferrer";
  a.click();
  // Give the browser a turn to start the download; never persist the URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
