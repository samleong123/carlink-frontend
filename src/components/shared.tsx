import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Select,
  Space,
  Table,
  type TableProps,
  Tag,
  Typography,
  DatePicker,
  Statistic,
  Row as GridRow,
  Col,
  Grid,
  Tooltip,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  api,
  ApiError,
  orgPath,
  ResponseContractError,
  type ApiOptions,
} from "../api/client";
import {
  object,
  rows,
  text,
  type ListData,
  type Query,
  type Row,
  type Envelope,
} from "../api/types";
import { useApp } from "../app/context";
import { directoryRows } from "../api/adapters";
import * as fieldHelpModule from "./fieldHelp";
import { CORE_PHRASES, coreText } from "../i18n/corePhrases";
import type { Locale } from "../i18n/messages";
import { formatKmFromMetres, isMileageMetreField } from "../lib/mileageUnits";
import {
  formatMajorFromMinor,
  isCurrencyMinorField,
} from "../lib/currencyUnits";

type HelpEntry = { label: string; description: string };

function getFieldHelp(name: string, locale: Locale): HelpEntry | undefined {
  return (
    fieldHelpModule.helpFor as unknown as (
      name: string,
      locale?: Locale,
    ) => HelpEntry | undefined
  )(name, locale);
}

function getValueHelp(
  raw: string,
  locale: Locale,
  t: (k: string) => string,
): HelpEntry | undefined {
  const valueHelpFor = (fieldHelpModule as Record<string, unknown>)
    .valueHelpFor as
    ((value: unknown, locale?: Locale) => HelpEntry | undefined) | undefined;
  const fromModule = valueHelpFor?.(raw, locale);
  if (fromModule) return fromModule;
  const valKey = `val:${raw}`;
  if (CORE_PHRASES[locale]?.[valKey] || CORE_PHRASES.en[valKey]) {
    const friendly = coreText(locale, valKey, t);
    return {
      label: friendly,
      description: `${coreText(locale, "Original value", t)}: ${raw}`,
    };
  }
  const tVal = t(valKey);
  if (tVal !== valKey && !tVal.startsWith("Val:")) {
    return {
      label: tVal,
      description: `${coreText(locale, "Original value", t)}: ${raw}`,
    };
  }
  return undefined;
}
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
export { dayjs, type Dayjs };

export function useData<T = Row>(
  path: string,
  query: Query = {},
  enabled = true,
  poll?: number,
) {
  const app = useApp();
  return useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      path,
      query,
    ],
    queryFn: ({ signal }) => api<T>(path, { query, signal }),
    enabled,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : poll || false),
    refetchIntervalInBackground: false,
  });
}

export function useTelemetryRefreshMs(enabled = true) {
  const app = useApp();
  const settingsQ = useData(
    orgPath(app.organizationId, "/settings"),
    {},
    Boolean(app.organizationId) && app.can("settings.read"),
  );
  const orgInterval = Number(
    object(settingsQ.data?.data.settings).telemetry_interval_seconds,
  );
  const planMinInterval = Number(
    app.subscription?.subscription?.plan_snapshot?.telemetry_min_seconds,
  );
  const configuredSeconds =
    Number.isFinite(orgInterval) && orgInterval > 0
      ? orgInterval
      : Number.isFinite(planMinInterval) && planMinInterval > 0
        ? planMinInterval
        : 5;
  const refreshSeconds = configuredSeconds + 5;
  const pollMs = enabled ? refreshSeconds * 1000 : undefined;
  return { configuredSeconds, refreshSeconds, pollMs };
}

export function useAllTimeframeItems(
  path: string,
  query: Query = {},
  enabled = true,
  poll?: number,
  listKey = "items",
  maxPages = Number.POSITIVE_INFINITY,
) {
  const app = useApp();
  return useQuery({
    queryKey: [
      app.session?.user.id,
      app.workspace,
      app.organizationId,
      app.revision,
      "all-pages",
      path,
      query,
      listKey,
    ],
    queryFn: async ({ signal }) => {
      const allItems: Row[] = [];
      const seenIds = new Set<string>();
      let nextCursor: string | undefined;
      let lastResponse: Envelope<ListData> | undefined;
      for (let page = 0; page < maxPages; page++) {
        const res = await api<ListData>(path, {
          query: { ...query, per_page: 200, cursor: nextCursor },
          signal,
        });
        lastResponse = res;
        const pageRows = directoryRows(res.data[listKey], res.request_id, {
          path,
          httpStatus: res.status,
        });
        for (const r of pageRows) {
          const id = text(r.id);
          if (id) {
            if (seenIds.has(id)) continue;
            seenIds.add(id);
          }
          allItems.push(r);
        }
        const cursor = res.data.pagination?.next_cursor;
        if (!cursor || cursor === nextCursor || pageRows.length === 0) break;
        nextCursor = cursor;
      }
      return {
        items: allItems,
        timestamp: lastResponse?.timestamp ?? new Date().toISOString(),
        status: lastResponse?.status ?? 200,
        request_id: lastResponse?.request_id ?? "",
      };
    },
    enabled,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : poll || false),
    refetchIntervalInBackground: false,
  });
}
// Sensitive URLs/results must not enter the shared query cache. Abort on close,
// path changes and permission/scope invalidation, including late JSON responses.
export function useTransientData(path: string) {
  const { revision } = useApp();
  const [data, setData] = useState<Envelope<Row>>();
  const [error, setError] = useState<unknown>(null);
  const [isFetching, setFetching] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const refetch = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setFetching(true);
    setError(null);
    try {
      const response = await api<Row>(path, {
        signal: active.signal,
        sensitive: true,
      });
      if (!active.signal.aborted) setData(response);
    } catch (e) {
      if (
        !active.signal.aborted &&
        !(e instanceof DOMException && e.name === "AbortError")
      )
        setError(e);
    } finally {
      if (!active.signal.aborted) setFetching(false);
    }
  }, [path, revision]);
  useEffect(() => {
    setData(undefined);
    void refetch();
    return () => controller.current?.abort();
  }, [refetch]);
  return { data, error, isFetching, refetch };
}
export function ErrorNotice({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { locale, t } = useApp();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(locale, key, t, vars);
  if (!error || (error instanceof DOMException && error.name === "AbortError"))
    return null;
  const contract = error instanceof ResponseContractError ? error : null;
  const e = error instanceof ApiError ? error : null;
  const uncertain = contract?.uncertain || e?.uncertain;
  const requestId = contract?.requestId || e?.requestId;
  const path = contract?.path || e?.path;
  const isGeminiCapacity =
    e?.code === "GEMINI_CAPACITY_ISSUE" ||
    (e?.status === 0 && e.path.endsWith("-ai"));
  const statusCodes = [
    0, 401, 402, 403, 404, 409, 410, 413, 415, 419, 422, 429, 502, 503,
  ];
  const statusKey =
    e && statusCodes.includes(e.status) ? `error.${e.status}` : "";
  return (
    <Alert
      type="error"
      showIcon
      title={
        uncertain
          ? ct("Outcome uncertain — reconcile before retrying")
          : contract
            ? ct("API response format mismatch")
            : e?.code === "GEMINI_CAPACITY_ISSUE"
              ? ct("Google Gemini temporary capacity issue")
              : e?.status
                ? ct("Request could not complete ({status})", {
                    status: e.status,
                  })
                : ct("API unavailable")
      }
      description={
        <>
          <p>
            {uncertain
              ? ct(
                  "The operation may have committed even though the response failed. Refresh the affected record before making another submission.",
                )
              : contract
                ? ct(
                    "The server returned HTTP {status}, but this frontend could not read the expected response format. {issue}",
                    { status: contract.httpStatus, issue: contract.issue },
                  )
                : isGeminiCapacity
                  ? ct(
                      "Please try again later due to Google Gemini capacity issue",
                    )
                  : e?.status === 502 &&
                      e.serverMessage &&
                      e.code === "GEMINI_CAPACITY_ISSUE"
                    ? ct(
                        "Please try again later due to Google Gemini capacity issue",
                      )
                    : !e && error instanceof Error
                      ? error.message
                      : statusKey
                        ? ct(statusKey)
                        : ct(
                            "The request failed. Refresh the record or contact an operator.",
                          )}
          </p>
          {path && (
            <p className="reference">{ct("Endpoint: {path}", { path })}</p>
          )}
          {requestId && (
            <p className="reference">
              {ct("Request ID: {requestId}", { requestId })}
            </p>
          )}
          {e?.retryAfter && (
            <p>
              {ct("Retry after {seconds} seconds.", {
                seconds: e.retryAfter,
              })}
            </p>
          )}
          {e &&
            Object.entries(e.fields).map(([k, v]) => (
              <p key={k}>
                {k}: {v.join(" ")}
              </p>
            ))}
        </>
      }
      action={
        retry && (
          <Button onClick={retry} icon={<ReloadOutlined />}>
            {ct("Refresh state")}
          </Button>
        )
      }
    />
  );
}
export function Status({ value }: { value: unknown }) {
  const { locale, t } = useApp(),
    key = text(value) || "unknown";
  const color = [
    "active",
    "paid",
    "succeeded",
    "approved",
    "valid",
    "completed",
    "recent_packet",
  ].includes(key)
    ? "success"
    : ["failed", "expired", "suspended", "rejected", "critical"].includes(key)
      ? "error"
      : [
            "pending",
            "submitted",
            "stale",
            "due_soon",
            "in_progress",
            "registered",
          ].includes(key)
        ? "warning"
        : "default";
  return <Tag color={color}>{coreText(locale, key, t)}</Tag>;
}
export function Time({ value }: { value: unknown }) {
  const { session, locale, t } = useApp();
  if (!value || !dayjs(text(value)).isValid())
    return <span className="muted">{coreText(locale, "unknown", t)}</span>;
  return (
    <time dateTime={text(value)} title={text(value)}>
      {dayjs(text(value))
        .tz(session?.user.timezone || "Asia/Kuala_Lumpur")
        .format("DD MMM YYYY, HH:mm:ss")}
    </time>
  );
}
const secretKeys =
  /auth_token|token_hash|credential_fingerprint|photo_path|signature|payment_url|callback|content_base64|storage_key|possible_solution/i;

function summarizeCompactValue(
  value: unknown,
  ct: (key: string, vars?: Record<string, string | number>) => string,
  locale: Locale,
  t: (key: string) => string,
  field?: string,
  currency?: string,
): string {
  if (value === null || value === undefined) return ct("unknown");
  if (typeof value === "boolean") return value ? ct("Yes") : ct("No");
  if (Array.isArray(value)) return ct("{count} items", { count: value.length });
  if (typeof value === "object") {
    const obj = object(value);
    const objCurrency =
      typeof obj.currency === "string" ? obj.currency : undefined;
    const pairs = Object.entries(obj)
      .filter(([k]) => !secretKeys.test(k))
      .slice(0, 2)
      .map(
        ([k, v]) =>
          `${ct(k)}: ${summarizeCompactValue(v, ct, locale, t, k, objCurrency)}`,
      );
    return pairs.length ? pairs.join(", ") : "{…}";
  }
  if (field && isMileageMetreField(field)) {
    const kmDisplay = formatKmFromMetres(value);
    if (kmDisplay) return `${kmDisplay.kmText} (${kmDisplay.metresText})`;
  }
  if (field && isCurrencyMinorField(field)) {
    const moneyDisplay = formatMajorFromMinor(value, currency || "MYR");
    if (moneyDisplay)
      return `${moneyDisplay.majorText} (${moneyDisplay.minorText})`;
  }
  const raw = text(value);
  return getValueHelp(raw, locale, t)?.label ?? raw;
}

function CompactObjectCell({ value }: { value: unknown }) {
  const { locale, t } = useApp();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(locale, key, t, vars);
  if (Array.isArray(value)) {
    if (!value.length) return <span className="muted">—</span>;
    const labels = value.map((item) =>
      summarizeCompactValue(item, ct, locale, t),
    );
    return (
      <Space size={[4, 4]} wrap className="cell-chip-list">
        {labels.slice(0, 3).map((label, idx) => {
          const raw = typeof value[idx] === "string" ? value[idx] : "";
          const valHelp = raw ? getValueHelp(raw, locale, t) : undefined;
          const tag = (
            <Tag key={idx} className="cell-summary-chip">
              {label}
            </Tag>
          );
          return valHelp ? (
            <Tooltip key={idx} title={valHelp.description}>
              {tag}
            </Tooltip>
          ) : (
            tag
          );
        })}
        {labels.length > 3 && (
          <Tooltip title={labels.join(", ")}>
            <Tag className="cell-summary-chip">+{labels.length - 3}</Tag>
          </Tooltip>
        )}
      </Space>
    );
  }
  const entries = Object.entries(object(value)).filter(
    ([k]) => !secretKeys.test(k),
  );
  if (!entries.length) return <span className="muted">—</span>;
  const formatted = entries.map(
    ([k, v]) => `${ct(k)}: ${summarizeCompactValue(v, ct, locale, t)}`,
  );
  return (
    <Space size={[4, 4]} wrap className="cell-chip-list">
      {entries.slice(0, 3).map(([k], idx) => (
        <Tooltip key={k} title={`${ct(k)} (${ct("Original field")}: ${k})`}>
          <Tag className="cell-summary-chip">{formatted[idx]}</Tag>
        </Tooltip>
      ))}
      {formatted.length > 3 && (
        <Tooltip title={formatted.join(" · ")}>
          <Tag className="cell-summary-chip">+{formatted.length - 3}</Tag>
        </Tooltip>
      )}
    </Space>
  );
}

export function Value({
  value,
  field = "",
  compactCell = false,
  currency,
}: {
  value: unknown;
  field?: string;
  compactCell?: boolean;
  currency?: string;
}): ReactNode {
  const { locale, t } = useApp();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(locale, key, t, vars);
  if (value === null || value === undefined)
    return <span className="muted">{ct("unknown")}</span>;
  if (typeof value === "boolean") return value ? ct("Yes") : ct("No");
  if (typeof value === "object") {
    if (compactCell) return <CompactObjectCell value={value} />;
    return (
      <Details
        data={Array.isArray(value) ? { values: value } : object(value)}
        compact
      />
    );
  }
  if (field.endsWith("_at") || field === "timestamp")
    return <Time value={value} />;
  if (["status", "state", "freshness", "decision", "quality"].includes(field))
    return <Status value={value} />;
  if (isMileageMetreField(field)) {
    const kmDisplay = formatKmFromMetres(value);
    if (kmDisplay) {
      return (
        <Tooltip title={`${kmDisplay.metresText} (${field})`}>
          <span tabIndex={0}>
            {kmDisplay.kmText}{" "}
            <span className="muted">({kmDisplay.metresText})</span>
          </span>
        </Tooltip>
      );
    }
  }
  if (isCurrencyMinorField(field)) {
    const moneyDisplay = formatMajorFromMinor(value, currency || "MYR");
    if (moneyDisplay) {
      return (
        <Tooltip title={`${moneyDisplay.minorText} (${field})`}>
          <span tabIndex={0}>
            {moneyDisplay.majorText}{" "}
            <span className="muted">({moneyDisplay.minorText})</span>
          </span>
        </Tooltip>
      );
    }
  }
  const raw = text(value);
  const className = field.endsWith("_id") || field === "id" ? "reference" : "";
  const valHelp = getValueHelp(raw, locale, t);
  if (valHelp) {
    return (
      <Tooltip title={valHelp.description}>
        <span className={className} tabIndex={0}>
          {valHelp.label}
        </span>
      </Tooltip>
    );
  }
  return <span className={className}>{raw}</span>;
}
export function Details({
  data,
  compact = false,
}: {
  data: Row | undefined | null;
  compact?: boolean;
}) {
  const { locale, t } = useApp();
  const ct = (key: string) => coreText(locale, key, t);
  if (!data || !Object.keys(data).length)
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={ct("empty")} />
    );
  return (
    <Descriptions
      size="small"
      bordered={!compact}
      column={compact ? 1 : { xs: 1, sm: 1, md: 2 }}
      items={Object.entries(data)
        .filter(([key]) => !secretKeys.test(key))
        .map(([key, value]) => {
          const help = getFieldHelp(key, locale);
          const translated = ct(key);
          const showTooltip =
            Boolean(help) || translated !== key || /[_A-Z]/.test(key);
          return {
            key,
            label: showTooltip ? (
              <Tooltip
                title={help?.description || `${ct("Original field")}: ${key}`}
              >
                <span tabIndex={0}>
                  {help?.label || translated}
                  <span aria-hidden="true"> ⓘ</span>
                </span>
              </Tooltip>
            ) : (
              translated
            ),
            children:
              key === "dtc_codes" && Array.isArray(value) ? (
                value.length > 0 ? (
                  <Space size={[4, 4]} wrap>
                    {value.map((code, i) => (
                      <Tag color="error" key={i}>
                        {text(code)}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <span className="muted">{ct("None")}</span>
                )
              ) : Array.isArray(value) ? (
              <Space orientation="vertical">
                {value.map((v, i) => (
                  <div key={i}>
                    {typeof v === "object" && v !== null ? (
                      <Details data={object(v)} compact />
                    ) : (
                      <Value value={v} />
                    )}
                  </div>
                ))}
              </Space>
            ) : (
              <Value
                value={value}
                field={key}
                currency={
                  typeof data.currency === "string" ? data.currency : undefined
                }
              />
            ),
          };
        })}
    />
  );
}
export function PageTitle({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <Typography.Title level={2}>{title}</Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </div>
      {extra && <Space wrap>{extra}</Space>}
    </div>
  );
}
export function Metrics({
  data,
  fields,
  columns = 4,
  format,
}: {
  data?: Row;
  fields?: string[];
  columns?: 2 | 3 | 4;
  format?: Record<string, (value: unknown) => ReactNode>;
}) {
  const { t } = useApp();
  const keys =
    fields ||
    Object.keys(data || {}).filter(
      (k) => typeof data?.[k] === "number" || data?.[k] === null,
    );
  const lgSpan = columns === 2 ? 12 : columns === 3 ? 8 : 6;
  const currency = text(data?.currency) || "MYR";
  return (
    <GridRow gutter={[16, 16]}>
      {keys.map((key) => {
        const raw = data?.[key];
        const custom = format?.[key];
        const formattedMinor = isCurrencyMinorField(key)
          ? formatMajorFromMinor(raw, currency)?.majorText
          : null;
        const value =
          raw === null || raw === undefined ? "—" : formattedMinor || text(raw);
        return (
          <Col xs={24} sm={12} lg={lgSpan} key={key} className="metric-col">
            <Card className="metric-card">
              <Statistic
                title={t(key)}
                value={value}
                formatter={custom ? () => custom(raw) : undefined}
              />
            </Card>
          </Col>
        );
      })}
    </GridRow>
  );
}
function isDateField(fieldKey: string): boolean {
  return (
    fieldKey.endsWith("_at") ||
    ["timestamp", "effective_from", "effective_to", "due_date"].includes(
      fieldKey,
    )
  );
}

export function Directory({
  path,
  fields,
  query = {},
  action,
  listKey = "items",
  scope,
  poll,
  onData,
  rowFilter,
  transformRows,
  render,
  cardTitle,
  fetchAllPages = false,
  toolbarExtra,
  defaultSortOrder = "desc",
  rowSelection,
}: {
  path: string;
  fields: string[];
  query?: Query;
  action?: (row: Row) => ReactNode;
  listKey?: string;
  scope?: string;
  poll?: number;
  onData?: (items: Row[]) => void;
  rowFilter?: (row: Row) => boolean;
  transformRows?: (items: Row[]) => Row[];
  render?: Record<string, (value: unknown, row: Row) => ReactNode>;
  cardTitle?: (row: Row) => string;
  fetchAllPages?: boolean;
  toolbarExtra?: ReactNode;
  defaultSortOrder?: "desc" | "asc";
  rowSelection?: TableProps<Row>["rowSelection"];
}) {
  const { locale, t } = useApp(),
    ct = (key: string, vars?: Record<string, string | number>) =>
      coreText(locale, key, t, vars),
    [cursor, setCursor] = useState<string | undefined>(),
    [history, setHistory] = useState<(string | undefined)[]>([]),
    [search, setSearch] = useState("");
  const explicitDateFields = fields.filter(isDateField);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">(defaultSortOrder);
  const [sortField, setSortField] = useState<string>(
    explicitDateFields[0] || "occurred_at",
  );
  const screens = Grid.useBreakpoint();
  const isMobileList = screens.xs === true && !screens.sm;
  const filterKey = JSON.stringify(query);
  useEffect(() => {
    setCursor(undefined);
    setHistory([]);
  }, [path, filterKey]);
  const singleQ = useData<ListData>(
    path,
    { ...query, cursor },
    !fetchAllPages,
    poll,
  );
  const allQ = useAllTimeframeItems(path, query, fetchAllPages, poll, listKey);
  const activeQ = fetchAllPages ? allQ : singleQ;
  let items: Row[] = [],
    shapeError: unknown = null;
  if (fetchAllPages) {
    items = allQ.data?.items ?? [];
  } else if (singleQ.data) {
    try {
      items = directoryRows(
        singleQ.data.data[listKey],
        singleQ.data.request_id,
        {
          path,
          httpStatus: singleQ.data.status,
        },
      );
    } catch (e) {
      shapeError = e;
    }
  }
  useEffect(() => {
    if (fetchAllPages) {
      if (allQ.data) onData?.(allQ.data.items);
    } else if (singleQ.data) {
      try {
        onData?.(
          directoryRows(singleQ.data.data[listKey], singleQ.data.request_id, {
            path,
            httpStatus: singleQ.data.status,
          }),
        );
      } catch {
        onData?.([]);
      }
    }
  }, [fetchAllPages, allQ.data, singleQ.data, listKey, path, onData]);
  const dateFields = explicitDateFields.length
    ? explicitDateFields
    : ["occurred_at", "created_at", "started_at"].filter((k) =>
        items.some(
          (r) => r[k] !== undefined && r[k] !== null && text(r[k]) !== "",
        ),
      );
  const primaryDateField = dateFields[0] || "";
  const dateFieldsKey = dateFields.join(",");
  useEffect(() => {
    if (primaryDateField && !dateFields.includes(sortField)) {
      setSortField(primaryDateField);
    }
  }, [primaryDateField, dateFieldsKey, sortField]);
  const activeSortField = dateFields.includes(sortField)
    ? sortField
    : primaryDateField || sortField;
  const transformed = transformRows ? transformRows(items) : items;
  const scoped = rowFilter ? transformed.filter(rowFilter) : transformed;
  const filtered = scoped.filter((row) =>
    fields.some((k) => {
      const cell = row[k];
      const haystack =
        typeof cell === "object" && cell !== null
          ? JSON.stringify(cell)
          : text(cell);
      return haystack.toLowerCase().includes(search.toLowerCase());
    }),
  );
  const sorted = dateFields.length
    ? [...filtered].sort((a, b) => {
        const ta = Date.parse(text(a[activeSortField]));
        const tb = Date.parse(text(b[activeSortField]));
        const aValid = Number.isFinite(ta);
        const bValid = Number.isFinite(tb);
        if (!aValid && !bValid) return 0;
        if (!aValid) return 1;
        if (!bValid) return -1;
        return sortOrder === "desc" ? tb - ta : ta - tb;
      })
    : filtered;
  const pagination = fetchAllPages ? undefined : singleQ.data?.data.pagination;
  const timestamp = fetchAllPages
    ? allQ.data?.timestamp
    : singleQ.data?.timestamp;
  const getRowKey = (r: Row) =>
    text(
      r.id ?? r.request_id ?? r.segment_id ?? r.user_id ?? r.obligation_id,
    ) || JSON.stringify(r);
  return (
    <Card className="directory">
      <div className="table-toolbar">
        <Input.Search
          allowClear
          aria-label={ct("search")}
          placeholder={ct("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Space wrap>
          {dateFields.length > 0 && (
            <Select
              size="middle"
              aria-label={ct("Sort by date")}
              popupMatchSelectWidth={false}
              style={{ minWidth: 190 }}
              value={`${activeSortField}:${sortOrder}`}
              onChange={(val: string) => {
                const idx = val.lastIndexOf(":");
                if (idx > 0) {
                  setSortField(val.slice(0, idx));
                  setSortOrder(val.slice(idx + 1) as "desc" | "asc");
                }
              }}
              options={dateFields.flatMap((df) =>
                dateFields.length === 1
                  ? [
                      {
                        value: `${df}:desc`,
                        label: ct("Newest first (recent)"),
                      },
                      { value: `${df}:asc`, label: ct("Oldest first") },
                    ]
                  : [
                      {
                        value: `${df}:desc`,
                        label: `${ct(df)}: ${ct("Newest first (recent)")}`,
                      },
                      {
                        value: `${df}:asc`,
                        label: `${ct(df)}: ${ct("Oldest first")}`,
                      },
                    ],
              )}
            />
          )}
          {toolbarExtra}
          <Button
            icon={<ReloadOutlined />}
            loading={activeQ.isFetching}
            onClick={() => void activeQ.refetch()}
          >
            {ct("refresh")}
          </Button>
        </Space>
      </div>
      <ErrorNotice error={activeQ.error || shapeError} />
      {activeQ.error && activeQ.data && (
        <Alert
          type="warning"
          title={ct("Last successful result — refresh failed")}
        />
      )}
      {isMobileList ? (
        <div className="mobile-directory-list">
          {activeQ.isPending ? (
            <Card loading size="small" />
          ) : !sorted.length ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={ct("empty")}
            />
          ) : (
            sorted.map((row) => (
              <Card
                size="small"
                key={getRowKey(row)}
                className="mobile-record-card"
                title={cardTitle ? cardTitle(row) : undefined}
              >
                <div className="mobile-record-fields">
                  {fields.map((key) => (
                    <div className="mobile-record-row" key={key}>
                      <span className="mobile-record-label">{ct(key)}</span>
                      <span className="mobile-record-value">
                        {render?.[key] ? (
                          render[key](row[key], row)
                        ) : (
                          <Value
                            field={key}
                            value={row[key]}
                            compactCell
                            currency={
                              typeof row.currency === "string"
                                ? row.currency
                                : undefined
                            }
                          />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {action && (
                  <div className="mobile-record-actions">
                    <Space wrap>{action(row)}</Space>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          <Table<Row>
            rowKey={getRowKey}
            rowSelection={rowSelection}
            dataSource={sorted}
            loading={activeQ.isPending}
            pagination={
              fetchAllPages
                ? {
                    pageSize: 50,
                    showSizeChanger: true,
                    pageSizeOptions: ["20", "50", "100", "200"],
                  }
                : false
            }
            scroll={{ x: "max-content" }}
            columns={[
              ...fields.map((key) => ({
                title: ct(key),
                dataIndex: key,
                key,
                ...(isDateField(key)
                  ? {
                      sorter: (a: Row, b: Row) =>
                        (Date.parse(text(a[key])) || 0) -
                        (Date.parse(text(b[key])) || 0),
                    }
                  : {}),
                render: (v: unknown, row: Row) =>
                  render?.[key] ? (
                    render[key](v, row)
                  ) : (
                    <Value
                      field={key}
                      value={v}
                      compactCell
                      currency={
                        typeof row.currency === "string"
                          ? row.currency
                          : undefined
                      }
                    />
                  ),
              })),
              ...(action
                ? [
                    {
                      title: ct("Actions"),
                      key: "actions",
                      fixed: screens.lg ? ("right" as const) : undefined,
                      render: (_: unknown, row: Row) => (
                        <Space wrap>{action(row)}</Space>
                      ),
                    },
                  ]
                : []),
            ]}
            locale={{ emptyText: ct("empty") }}
          />
          <p className="table-scroll-hint">
            {action
              ? ct(
                  "Scroll the table horizontally for more columns and actions.",
                )
              : ct("Scroll the table horizontally for more columns.")}
          </p>
        </>
      )}
      <div className="table-footer">
        <Typography.Text type="secondary">
          {scoped.length} {ct("loaded")}
          {rowFilter &&
            ` / ${
              fetchAllPages
                ? ct("{count} returned", { count: items.length })
                : ct("{count} returned on this capped page", {
                    count: items.length,
                  })
            }`}
          {scope
            ? ` · ${scope}`
            : !fetchAllPages && !pagination
              ? ` · ${ct("Server-limited list; no full-fleet total is available.")}`
              : ""}
          {timestamp && (
            <>
              {" "}
              · {ct("Updated")} <Time value={timestamp} />
            </>
          )}
        </Typography.Text>
        {!fetchAllPages && (
          <Space>
            <Button
              disabled={!history.length || activeQ.isFetching}
              onClick={() => {
                setCursor(history[history.length - 1]);
                setHistory((v) => v.slice(0, -1));
              }}
            >
              {ct("previous")}
            </Button>
            <Button
              disabled={!pagination?.next_cursor || activeQ.isFetching}
              onClick={() => {
                setHistory((v) => [...v, cursor]);
                setCursor(pagination!.next_cursor!);
              }}
            >
              {ct("next")}
            </Button>
          </Space>
        )}
      </div>
    </Card>
  );
}
export function windowQuery(range: [Dayjs, Dayjs]): Query {
  return { from: range[0].toISOString(), to: range[1].toISOString() };
}
export function TimeWindow({
  value,
  onChange,
}: {
  value: [Dayjs, Dayjs];
  onChange: (range: [Dayjs, Dayjs]) => void;
  maxDays?: number;
}) {
  const [invalid, setInvalid] = useState(false);
  const app = useApp();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(app.locale, key, app.t, vars);
  const tz = app.session?.user.timezone || "Asia/Kuala_Lumpur";
  const preset = (label: string, amount: number, unit: "hour" | "day") => ({
    label,
    value: (): [Dayjs, Dayjs] => {
      const end = dayjs().tz(tz);
      return [end.subtract(amount, unit), end];
    },
  });
  const presets = [
    preset(ct("Last 1 hour"), 1, "hour"),
    preset(ct("Last 6 hours"), 6, "hour"),
    preset(ct("Last 24 hours"), 24, "hour"),
    preset(ct("Last 7 days"), 7, "day"),
    preset(ct("Last 30 days"), 30, "day"),
    preset(ct("Last 90 days"), 90, "day"),
    preset(ct("Last 365 days"), 365, "day"),
  ];
  return (
    <div className="time-window">
      <DatePicker.RangePicker
        showTime
        presets={presets}
        value={[value[0].tz(tz), value[1].tz(tz)]}
        allowClear={false}
        onChange={(range) => {
          if (!range?.[0] || !range[1]) return;
          const seconds = range[1].diff(range[0], "second");
          setInvalid(seconds <= 0);
          if (seconds > 0) onChange([range[0], range[1]]);
        }}
      />
      <Typography.Text type={invalid ? "danger" : "secondary"}>
        {invalid
          ? ct("Choose an increasing range where end time is after start time.")
          : ct("Select any timeframe · Your account timezone")}
      </Typography.Text>
    </div>
  );
}
export function Snapshot({
  path,
  query,
  pick,
  title,
  poll,
}: {
  path: string;
  query?: Query;
  pick?: string;
  title?: string;
  poll?: number;
}) {
  const q = useData(path, query, true, poll);
  return (
    <Card title={title} loading={q.isPending}>
      <ErrorNotice error={q.error} retry={() => void q.refetch()} />
      {q.data && (
        <Details data={pick ? object(q.data.data[pick]) : q.data.data} />
      )}
    </Card>
  );
}
export function GeminiSparkleIcon() {
  const gradientId = useId();
  return (
    <svg
      className="ai-hints-sparkle"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#9B72CB" />
          <stop offset="70%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#F4B400" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function GeminiPoweredBadge() {
  const app = useApp();
  return (
    <span className="ai-hints-badge">
      <GeminiSparkleIcon />
      <span>{app.t("Powered by Google Gemini")}</span>
    </span>
  );
}

export type ActionOptions = ApiOptions;
