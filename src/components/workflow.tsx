import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  App,
  Alert,
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Segmented,
  Select,
  Slider,
  Space,
  Switch,
  TimePicker,
  Typography,
} from "antd";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  ApiError,
  isUncertainError,
  type ApiOptions,
} from "../api/client";
import { object, rows, text, type ListData, type Row } from "../api/types";
import { useApp } from "../app/context";
import { dayjs, Details, ErrorNotice, type Dayjs } from "./shared";
import * as fieldHelpModule from "./fieldHelp";
import { coreText } from "../i18n/corePhrases";
import type { Locale } from "../i18n/messages";
import { formatMetresFromKm } from "../lib/mileageUnits";
import { formatMinorPreviewFromMajor } from "../lib/currencyUnits";

type HelpEntry = { label: string; description: string };

function getFieldHelp(name: string, locale: Locale): HelpEntry | undefined {
  return (
    fieldHelpModule.helpFor as unknown as (
      name: string,
      locale?: Locale,
    ) => HelpEntry | undefined
  )(name, locale);
}
import {
  curatedFields,
  fieldInitialValues,
  logicalAttempt,
} from "../api/forms";

export interface Field {
  name: string;
  label?: string;
  kind?:
    | "text"
    | "textarea"
    | "email"
    | "phone"
    | "readonly"
    | "number"
    | "select"
    | "multi"
    | "radio"
    | "segmented"
    | "autocomplete"
    | "switch"
    | "reference"
    | "date"
    | "datetime"
    | "year"
    | "hour"
    | "check"
    | "thresholds";
  required?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  slider?: boolean;
  metrePreview?: boolean;
  minorPreview?: boolean;
  suffix?: string;
  pattern?: RegExp;
  options?: (string | number | { label: string; value: string | number })[];
  path?: string;
  labelKey?: string;
  valueKey?: string;
  secondaryKey?: string;
  uppercase?: boolean;
  help?: string;
  default?: unknown;
}
export const field = (name: string, extra: Partial<Field> = {}): Field => ({
  name,
  ...extra,
});
export const number = (
  name: string,
  min = 0,
  max = 1000000000,
  extra: Partial<Field> = {},
): Field => field(name, { kind: "number", min, max, integer: true, ...extra });
export const choice = (
  name: string,
  options: Field["options"],
  extra: Partial<Field> = {},
): Field => field(name, { kind: "select", options, ...extra });
export const reference = (
  name: string,
  path: string,
  labelKey: string,
  extra: Partial<Field> = {},
): Field => field(name, { kind: "reference", path, labelKey, ...extra });
export const reason = field("reason", {
  kind: "textarea",
  required: true,
  min: 3,
  max: 500,
});
export const version = number("version", 1, 1000000000, {
  required: true,
  help: "Current server version. Refresh after every successful change.",
});

export function EntitySelect({
  path,
  labelKey = "name",
  valueKey = "id",
  secondaryKey,
  value,
  onChange,
  id,
}: {
  path: string;
  labelKey?: string;
  valueKey?: string;
  secondaryKey?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
}) {
  const { locale, t } = useApp();
  const ct = (key: string) => coreText(locale, key, t);
  const [items, setItems] = useState<Row[]>([]),
    [cursor, setCursor] = useState<string | undefined>(),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const load = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await api<ListData>(path, {
        query: { per_page: 100, cursor },
      });
      setItems((v) => [...v, ...rows(response.data.items)]);
      setCursor(response.data.pagination?.next_cursor || undefined);
      setLoaded(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Select
        id={id}
        showSearch
        allowClear
        value={value}
        loading={busy}
        onChange={onChange}
        optionFilterProp="label"
        placeholder={ct("Select an authorized record")}
        onOpenChange={(open) => {
          if (open && !loaded) void load();
        }}
        options={items.map((row) => {
          const primary = text(row[labelKey]) || text(row.id);
          const extra = secondaryKey ? text(row[secondaryKey]) : "";
          return {
            value: text(row[valueKey]),
            label: `${primary}${extra ? ` (${extra})` : ""}${row.status ? ` · ${ct(text(row.status))}` : ""}`,
          };
        })}
        popupRender={(menu) => (
          <>
            {menu}
            {loaded && cursor && (
              <Button block loading={busy} onClick={() => void load()}>
                {ct("Load next page")}
              </Button>
            )}
          </>
        )}
      />
      <ErrorNotice error={error} />
    </>
  );
}
function parseDayjs(value: unknown, format: string): Dayjs | null {
  if (value === undefined || value === null || value === "") return null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value : null;
  const raw = text(value).trim();
  if (!raw) return null;
  const strict = dayjs(raw, format, true);
  if (strict.isValid()) return strict;
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed : null;
}
function parseDateTimeDayjs(value: unknown, tz: string): Dayjs | null {
  if (value === undefined || value === null || value === "") return null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value.tz(tz) : null;
  const raw = text(value).trim();
  if (!raw) return null;
  const hasOffset = /(?:Z|[+-]\d\d:?\d\d)$/i.test(raw);
  const parsed = hasOffset ? dayjs(raw).tz(tz) : dayjs.tz(raw, tz);
  if (parsed.isValid()) return parsed;
  const fallback = dayjs(raw, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DDTHH:mm:ss[Z]",
    "YYYY-MM-DD HH:mm",
    "YYYY-MM-DD",
  ]);
  return fallback.isValid() ? fallback.tz(tz) : null;
}
function optionItems(options: Field["options"], ct: (key: string) => string) {
  return (options || []).map((v) =>
    typeof v === "object" ? v : { value: v, label: ct(String(v)) },
  );
}
function Control({ spec, ...props }: { spec: Field; [key: string]: any }) {
  const { locale, t, session } = useApp();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(locale, key, t, vars);
  const tz = session?.user.timezone || "Asia/Kuala_Lumpur";
  const metresHint = spec.metrePreview ? formatMetresFromKm(props.value) : null;
  const minorHint = spec.minorPreview
    ? formatMinorPreviewFromMajor(props.value)
    : null;
  switch (spec.kind) {
    case "number":
      if (spec.slider && spec.min !== undefined && spec.max !== undefined) {
        return (
          <div className="slider-number-field">
            <Slider
              min={spec.min}
              max={spec.max}
              step={spec.step ?? (spec.integer ? 1 : 0.1)}
              value={typeof props.value === "number" ? props.value : spec.min}
              onChange={(v) => props.onChange?.(v)}
            />
            <InputNumber
              id={props.id}
              value={props.value}
              onChange={props.onChange}
              min={spec.min}
              max={spec.max}
              step={spec.step}
              precision={spec.integer ? 0 : undefined}
              suffix={spec.suffix}
              className="full-width"
            />
          </div>
        );
      }
      return (
        <div>
          <InputNumber
            {...props}
            id={props.id}
            min={spec.min}
            max={spec.max}
            step={spec.step}
            precision={spec.integer ? 0 : undefined}
            suffix={spec.suffix}
            className="full-width"
          />
          {metresHint && (
            <Typography.Text
              type="secondary"
              style={{ display: "block", fontSize: 12, marginTop: 4 }}
            >
              {ct("= {metres} sent to server", { metres: metresHint })}
            </Typography.Text>
          )}
          {minorHint && (
            <Typography.Text
              type="secondary"
              style={{ display: "block", fontSize: 12, marginTop: 4 }}
            >
              {ct("= {minor} minor units sent to server", { minor: minorHint })}
            </Typography.Text>
          )}
        </div>
      );
    case "textarea":
      return (
        <Input.TextArea {...props} rows={3} maxLength={spec.max} showCount />
      );
    case "email":
      return (
        <Input
          {...props}
          type="email"
          autoComplete="email"
          maxLength={spec.max}
        />
      );
    case "phone":
      return (
        <Input {...props} type="tel" autoComplete="tel" maxLength={spec.max} />
      );
    case "readonly":
      return <Input {...props} readOnly />;
    case "select":
    case "multi":
      return (
        <Select
          {...props}
          allowClear
          showSearch
          mode={spec.kind === "multi" ? "multiple" : undefined}
          options={optionItems(spec.options, ct)}
        />
      );
    case "segmented":
      return (
        <Segmented
          block={false}
          options={optionItems(spec.options, ct)}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "radio":
      return (
        <Radio.Group
          id={props.id}
          optionType="button"
          buttonStyle="solid"
          options={optionItems(spec.options, ct)}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "autocomplete":
      return (
        <AutoComplete
          id={props.id}
          className="full-width"
          allowClear
          options={(spec.options || []).map((v) =>
            typeof v === "object"
              ? { value: String(v.value), label: v.label }
              : { value: String(v), label: ct(String(v)) },
          )}
          value={
            props.value === undefined || props.value === null
              ? ""
              : String(props.value)
          }
          filterOption={(input, option) =>
            String(option?.label ?? option?.value ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(v) =>
            props.onChange?.(
              spec.uppercase && typeof v === "string" ? v.toUpperCase() : v,
            )
          }
        />
      );
    case "switch":
      return <Switch {...props} />;
    case "check":
      return (
        <Checkbox {...props}>{spec.help ? ct(spec.help) : spec.label}</Checkbox>
      );
    case "reference":
      return (
        <EntitySelect
          {...props}
          path={spec.path!}
          labelKey={spec.labelKey}
          valueKey={spec.valueKey}
          secondaryKey={spec.secondaryKey}
        />
      );
    case "date":
      return (
        <DatePicker
          id={props.id}
          className="full-width"
          format="YYYY-MM-DD"
          allowClear={!spec.required}
          value={parseDayjs(props.value, "YYYY-MM-DD")}
          onChange={(d) =>
            props.onChange?.(
              d ? d.format("YYYY-MM-DD") : spec.nullable ? null : undefined,
            )
          }
        />
      );
    case "datetime":
      return (
        <DatePicker
          showTime
          needConfirm={false}
          id={props.id}
          className="full-width"
          format={[
            "YYYY-MM-DD HH:mm:ss",
            "YYYY-MM-DDTHH:mm:ssZ",
            "YYYY-MM-DDTHH:mm:ss[Z]",
            "YYYY-MM-DD HH:mm",
            "YYYY-MM-DD",
          ]}
          allowClear={!spec.required}
          value={parseDateTimeDayjs(props.value, tz)}
          onChange={(d) =>
            props.onChange?.(
              d
                ? d.tz(tz).format("YYYY-MM-DDTHH:mm:ssZ")
                : spec.nullable
                  ? null
                  : undefined,
            )
          }
        />
      );
    case "year":
      return (
        <DatePicker
          picker="year"
          id={props.id}
          className="full-width"
          allowClear={!spec.required}
          value={
            typeof props.value === "number" && Number.isFinite(props.value)
              ? dayjs().year(props.value).startOf("year")
              : null
          }
          disabledDate={(d) =>
            (spec.min !== undefined && d.year() < spec.min) ||
            (spec.max !== undefined && d.year() > spec.max)
          }
          onChange={(d) =>
            props.onChange?.(d ? d.year() : spec.nullable ? null : undefined)
          }
        />
      );
    case "hour":
      return (
        <TimePicker
          id={props.id}
          className="full-width"
          format="HH:00"
          showMinute={false}
          showSecond={false}
          needConfirm={false}
          allowClear={!spec.required && !props.required}
          value={
            typeof props.value === "number" && Number.isFinite(props.value)
              ? dayjs().hour(props.value).minute(0).second(0)
              : null
          }
          onChange={(d) =>
            props.onChange?.(d ? d.hour() : spec.nullable ? null : undefined)
          }
        />
      );
    case "thresholds":
      return <ThresholdEditor {...props} />;
    default:
      return <Input {...props} maxLength={spec.max} autoComplete="off" />;
  }
}
function ThresholdEditor({
  value = [],
  onChange,
}: {
  value?: Row[];
  onChange?: (rows: Row[]) => void;
}) {
  const { locale, t } = useApp();
  const ct = (key: string) => coreText(locale, key, t);
  const update = (index: number, key: string, v: unknown) =>
    onChange?.(
      value.map((row, i) => (i === index ? { ...row, [key]: v } : row)),
    );
  return (
    <div className="stack">
      {value.map((row, i) => (
        <div className="threshold-row" key={i}>
          <Input
            aria-label={ct("Threshold key")}
            placeholder={ct("Unique key")}
            value={text(row.key)}
            onChange={(e) => update(i, "key", e.target.value)}
          />
          <Select
            aria-label={ct("Threshold severity")}
            value={text(row.severity)}
            onChange={(v) => update(i, "severity", v)}
            options={["info", "warning", "high", "critical"].map((val) => ({
              value: val,
              label: ct(`channel:${val}`),
            }))}
          />
          <InputNumber
            aria-label={ct("Remaining kilometres")}
            placeholder={ct("Remaining km ≤")}
            step={0.5}
            suffix="km"
            value={row.remaining_km_lte as number | undefined}
            onChange={(v) => update(i, "remaining_km_lte", v)}
          />
          <InputNumber
            aria-label={ct("Remaining days")}
            placeholder={ct("Remaining days ≤")}
            suffix={ct("days")}
            value={row.remaining_days_lte as number | undefined}
            precision={0}
            onChange={(v) => update(i, "remaining_days_lte", v)}
          />
          <Select
            aria-label={ct("Threshold matching")}
            value={text(row.match)}
            options={["any", "all"].map((val) => ({
              value: val,
              label: ct(`channel:${val}`),
            }))}
            onChange={(v) => update(i, "match", v)}
          />
          <Select
            aria-label={ct("Threshold channels")}
            mode="multiple"
            value={row.channels as string[]}
            options={["in_app", "email"].map((val) => ({
              value: val,
              label: ct(`channel:${val}`),
            }))}
            onChange={(v) => update(i, "channels", v)}
          />
          <Button
            danger
            onClick={() => onChange?.(value.filter((_, idx) => idx !== i))}
          >
            {ct("Remove threshold")}
          </Button>
        </div>
      ))}
      <Button
        disabled={value.length >= 32}
        onClick={() =>
          onChange?.([
            ...value,
            {
              key: `stage_${value.length + 1}`,
              severity: "warning",
              match: "any",
              channels: ["in_app", "email"],
            },
          ])
        }
      >
        {ct("Add threshold")}
      </Button>
    </div>
  );
}
export function Fields({ fields }: { fields: Field[] }) {
  const { locale, t } = useApp();
  const ct = (key: string) => coreText(locale, key, t);
  return (
    <>
      {fields.map((spec) => {
        const help = getFieldHelp(spec.name, locale);
        return (
          <Form.Item
            key={spec.name}
            name={spec.name.split(".")}
            label={
              spec.label || help?.label || ct(spec.name.split(".").at(-1)!)
            }
            tooltip={
              spec.kind === "check"
                ? undefined
                : spec.help
                  ? ct(spec.help)
                  : help?.description
            }
            valuePropName={
              spec.kind === "switch" || spec.kind === "check"
                ? "checked"
                : "value"
            }
            rules={[
              ...(spec.required
                ? [{ required: true, message: ct("This field is required.") }]
                : []),
              ...(spec.pattern
                ? [
                    {
                      pattern: spec.pattern,
                      message: ct("Enter the expected format."),
                    },
                  ]
                : []),
              ...(spec.kind === "number" ||
              spec.kind === "year" ||
              spec.kind === "hour"
                ? [
                    {
                      type: (spec.integer ||
                      spec.kind === "year" ||
                      spec.kind === "hour"
                        ? "integer"
                        : "number") as "integer" | "number",
                      min: spec.min,
                      max: spec.max,
                    },
                  ]
                : spec.min !== undefined || spec.max !== undefined
                  ? [{ min: spec.min, max: spec.max }]
                  : []),
              ...(spec.kind === "email" ||
              ["email", "contact_email"].includes(spec.name)
                ? [{ type: "email" as const }]
                : []),
              ...(spec.kind === "check"
                ? [
                    {
                      validator: (_: unknown, value: unknown) =>
                        value === true
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(
                                ct("Explicit acknowledgment is required."),
                              ),
                            ),
                    },
                  ]
                : []),
              ...(spec.kind === "datetime"
                ? [
                    {
                      validator: (_: unknown, value: unknown) =>
                        !value ||
                        (/^\d{4}-\d\d-\d\dT.+(?:Z|[+-]\d\d:\d\d)$/.test(
                          text(value),
                        ) &&
                          Number.isFinite(Date.parse(text(value))))
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(
                                ct(
                                  "Use an ISO timestamp with a timezone offset.",
                                ),
                              ),
                            ),
                    },
                  ]
                : []),
            ]}
          >
            <Control spec={spec} />
          </Form.Item>
        );
      })}
    </>
  );
}
export function Workflow({
  title,
  path,
  method = "POST",
  fields = [],
  initial = {},
  transform,
  idempotent = false,
  description,
  refreshPath,
  onDone,
  onClose,
  successAction,
  sensitive = false,
}: {
  title: string;
  path: string;
  method?: "POST" | "PATCH";
  fields?: Field[];
  initial?: Row;
  transform?: (values: Row) => unknown;
  idempotent?: boolean;
  description?: ReactNode;
  refreshPath?: string;
  onDone?: (data: Row) => void;
  onClose: () => void;
  successAction?: (data: Row) => ReactNode;
  sensitive?: boolean;
}) {
  const { modal } = App.useApp(),
    app = useApp(),
    cache = useQueryClient();
  const ct = (key: string) => coreText(app.locale, key, app.t);
  const [form] = Form.useForm(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [result, setResult] = useState<{
      data: Row;
      title: string;
      desc: string;
      status: number;
    } | null>(null);
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  const submitting = useRef(false);
  const uncertainAttempt = useRef(false);
  const submit = async (values: Row) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const confirmed = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title,
        content:
          description ||
          ct(
            "Submit this change to the server? Current authorization and business rules will be checked.",
          ),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        okText: ct("confirm"),
      }),
    );
    if (!confirmed) {
      submitting.current = false;
      setBusy(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const selected = curatedFields(values, fields);
      const body = transform ? transform(selected) : selected;
      attempt.current = logicalAttempt(
        attempt.current,
        body,
        uncertainAttempt.current,
      );
      const response = await api<Row>(path, {
        method,
        body,
        sensitive,
        headers: idempotent
          ? { "Idempotency-Key": attempt.current.key }
          : undefined,
      });
      setResult({ ...response, data: response.data });
      await cache.invalidateQueries();
      if (!sensitive) void app.reload();
      onDone?.(response.data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (isUncertainError(e)) uncertainAttempt.current = true;
      setError(e);
      if (e instanceof ApiError)
        form.setFields(
          Object.entries(e.fields).map(([name, errors]) => ({
            name: name.split("."),
            errors,
          })),
        );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const refreshVersion = async () => {
    if (!refreshPath) return;
    try {
      const response = await api<Row>(refreshPath);
      const data = response.data;
      const entity = object(
        data.item ??
          data.order ??
          data.device ??
          data.organization ??
          data.user ??
          data,
      );
      if (typeof entity.version === "number") {
        modal.confirm({
          title: ct("Review current server state"),
          content: (
            <div className="stack">
              <p>
                {ct(
                  "Your proposed fields are preserved. Review this server state before using its current version.",
                )}
              </p>
              <Details data={entity} />
            </div>
          ),
          okText: ct("Use fetched version with my draft"),
          onOk: () => {
            form.setFieldValue("version", entity.version);
            setError(null);
          },
        });
      }
    } catch (e) {
      setError(e);
    }
  };
  return (
    <Drawer
      open
      title={title}
      size={520}
      onClose={busy ? undefined : onClose}
      destroyOnHidden
      footer={
        result ? (
          <Space wrap>
            {successAction?.(result.data)}
            <Button onClick={onClose} disabled={busy}>
              {ct("Close")}
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose} disabled={busy}>
            {ct("cancel")}
          </Button>
        )
      }
    >
      <div className="stack">
        {description && <Alert type="info" showIcon title={description} />}
        <ErrorNotice
          error={error}
          retry={refreshPath ? () => void refreshVersion() : undefined}
        />
        {uncertainAttempt.current && (
          <Alert
            type="warning"
            title={
              idempotent
                ? ct(
                    "Only the unchanged draft can be retried with the same idempotency key. Reconcile before editing or starting a new operation.",
                  )
                : ct(
                    "Reconcile this outcome before closing and starting a replacement operation.",
                  )
            }
          />
        )}
        {result ? (
          <>
            <Alert
              type={result.status === 202 ? "info" : "success"}
              showIcon
              title={result.title}
              description={
                result.status === 202
                  ? `${result.desc} ${ct("Accepted/queued is not proof of completion.")}`
                  : result.desc
              }
            />
            {!sensitive && <Details data={result.data} />}
          </>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={fieldInitialValues(initial, fields)}
            onFinish={submit}
            disabled={busy}
          >
            <Fields fields={fields} />
            <Button
              type="primary"
              htmlType="submit"
              loading={busy}
              disabled={!idempotent && isUncertainError(error)}
            >
              {ct("save")}
            </Button>
          </Form>
        )}
      </div>
    </Drawer>
  );
}
export function Action({
  label,
  path,
  body,
  description,
  options = {},
  onDone,
  danger = false,
}: {
  label: string;
  path: string;
  body?: unknown;
  description?: ReactNode;
  options?: ApiOptions;
  onDone?: (data: Row) => void;
  danger?: boolean;
}) {
  const { modal, message } = App.useApp(),
    cache = useQueryClient(),
    app = useApp();
  const ct = (key: string) => coreText(app.locale, key, app.t);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const submitting = useRef(false);
  const [uncertain, setUncertain] = useState(false);
  const run = async () => {
    if (submitting.current || uncertain) return;
    submitting.current = true;
    setBusy(true);
    const yes = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title: label,
        content:
          description ||
          ct("Confirm this server action. It cannot be automatically retried."),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );
    if (!yes) {
      submitting.current = false;
      setBusy(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api<Row>(path, { method: "POST", body, ...options });
      message.success(
        result.status === 202
          ? ct("Accepted/queued — completion is not yet confirmed.")
          : result.title,
      );
      await cache.invalidateQueries();
      onDone?.(result.data);
      if (!options.sensitive) void app.reload();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (isUncertainError(e)) setUncertain(true);
      setError(e);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <Button
        size="small"
        danger={danger}
        loading={busy}
        disabled={uncertain}
        onClick={() => void run()}
      >
        {label}
      </Button>
      {error && (
        <Drawer title={label} open onClose={() => setError(null)}>
          <ErrorNotice error={error} />
        </Drawer>
      )}
    </>
  );
}
export function ReadDrawer({
  title,
  path,
  onClose,
  pick,
}: {
  title: string;
  path: string;
  onClose: () => void;
  pick?: string;
}) {
  const [data, setData] = useState<Row | null>(null),
    [error, setError] = useState<unknown>(null);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    void api<Row>(path, { signal: controller.signal })
      .then((r) => {
        if (!controller.signal.aborted)
          setData(pick ? object(r.data[pick]) : r.data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e);
      });
    return () => controller.abort();
  }, [path, pick]);
  return (
    <Drawer title={title} open size={640} onClose={onClose}>
      <ErrorNotice error={error} />
      <Details data={data} />
    </Drawer>
  );
}
