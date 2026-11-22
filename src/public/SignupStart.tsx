import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Spin,
  Typography,
} from "antd";
import { Link, useLocation } from "react-router-dom";
import { api, isUncertainError } from "../api/client";
import { logicalAttempt } from "../api/forms";
import { rows, text, type Row, type Schemas } from "../api/types";
import { useApp } from "../app/context";
import { ErrorNotice, useData } from "../components/shared";
import { money } from "../features/billing";
import { PlanTerms } from "./Landing";

export function SignupStart() {
  const app = useApp(),
    location = useLocation(),
    [form] = Form.useForm();
  const plans = useData("/api/v1/public/plans");
  const catalogue = rows(plans.data?.data.items);
  const requested = new URLSearchParams(location.search).get("plan") || "";
  const selected = Form.useWatch("plan_id", form) || requested;
  const plan = catalogue.find((p) => p.id === selected);
  const [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [error, setError] = useState<unknown>(null);
  const flight = useRef(false),
    attempt = useRef<{ payload: string; key: string } | null>(null);
  const submit = async (values: Row) => {
    if (flight.current || (!plan && !uncertain)) return;
    flight.current = true;
    setBusy(true);
    setError(null);
    try {
      const body =
        uncertain && attempt.current
          ? JSON.parse(attempt.current.payload)
          : {
              email: text(values.email).trim(),
              return_to: "/signup",
              organization: {
                name: text(values.name).trim(),
                timezone: text(values.timezone),
                default_locale: values.default_locale as "en" | "ms" | "zh",
                plan_id: text(plan?.id),
                plan_version: Number(plan?.version),
                accept_unpaid_deletion: true,
              } satisfies Schemas["OrganizationSignupCreate"],
            };
      attempt.current = logicalAttempt(attempt.current, body, uncertain);
      await api("/api/v1/auth/signup-links", {
        method: "POST",
        body,
        sensitive: true,
        headers: { "Idempotency-Key": attempt.current.key },
      });
      setSent(true);
      setUncertain(false);
    } catch (e) {
      setError(e);
      if (isUncertainError(e)) setUncertain(true);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      <div>
        <Typography.Title level={1}>
          {app.t("signup_start_title")}
        </Typography.Title>
        <p>{app.t("signup_start_subtitle")}</p>
      </div>
      <ErrorNotice error={error || plans.error} />
      {plans.isPending && <Spin />}
      {sent ? (
        <Card title={app.t("signup_check_email")}>
          <div className="stack">
            <Alert
              type="success"
              showIcon
              title={app.t("signup_req_received_title")}
              description={app.t("signup_req_received_desc")}
            />
            <p>{app.t("signup_confirm_link_note")}</p>
            <Button
              onClick={() => {
                setSent(false);
                attempt.current = null;
              }}
            >
              {app.t("signup_new_req_btn")}
            </Button>
          </div>
        </Card>
      ) : (
        <Card title={app.t("signup_org_email_plan")}>
          <div className="signup-columns">
            <Form
              form={form}
              layout="vertical"
              disabled={busy || uncertain}
              onFinish={submit}
              initialValues={{
                timezone: app.session?.user.timezone || "Asia/Kuala_Lumpur",
                default_locale: app.locale === "ta" ? "en" : app.locale,
                plan_id: requested || undefined,
                email: app.session?.user.email,
              }}
            >
              <Form.Item
                name="name"
                label={app.t("signup_org_name")}
                rules={[{ required: true, whitespace: true }, { max: 160 }]}
              >
                <Input autoComplete="organization" maxLength={160} />
              </Form.Item>
              <Form.Item
                name="email"
                label={app.t("signup_owner_email")}
                tooltip={app.t("signup_owner_email_tooltip")}
                rules={[{ required: true }, { type: "email" }, { max: 255 }]}
              >
                <Input autoComplete="email" type="email" maxLength={255} />
              </Form.Item>
              <Form.Item
                name="timezone"
                label={app.t("signup_org_timezone")}
                tooltip={app.t("signup_org_timezone_tooltip")}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  options={[
                    ...new Set([
                      "Asia/Kuala_Lumpur",
                      "UTC",
                      ...Intl.supportedValuesOf("timeZone"),
                    ]),
                  ].map((value) => ({ value, label: value }))}
                />
              </Form.Item>
              <Form.Item
                name="default_locale"
                label={app.t("signup_default_language")}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "en", label: "English" },
                    { value: "ms", label: "Bahasa Melayu" },
                    { value: "zh", label: "简体中文" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="plan_id"
                label={app.t("signup_sub_plan")}
                rules={[{ required: true }]}
              >
                <Select
                  options={catalogue.map((p) => ({
                    value: text(p.id),
                    label: app
                      .t("signup_plan_option")
                      .replace("{name}", text(p.name))
                      .replace(
                        "{price}",
                        money(
                          p.price_minor,
                          text(p.currency),
                          app.t("unknown"),
                        ),
                      )
                      .replace("{days}", text(p.period_days)),
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="accept_unpaid_deletion"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(app.t("signup_accept_policy_err")),
                          ),
                  },
                ]}
              >
                <Checkbox>
                  {app.t("signup_accept_prefix")}{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "underline",
                      color: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {app.t("signup_terms_label")}
                  </Link>{" "}
                  {app.t("signup_and_label")}{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "underline",
                      color: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {app.t("signup_privacy_label")}
                  </Link>
                  . {app.t("signup_start_checkbox")}
                </Checkbox>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={busy}
                disabled={!plan || !!plans.error || uncertain}
              >
                {app.t("signup_confirm_email_continue")}
              </Button>
            </Form>
            <aside className="stack">
              {plan ? (
                <>
                  <Typography.Title level={3}>
                    {text(plan.name)}
                  </Typography.Title>
                  <div className="plan-price">
                    {money(
                      plan.price_minor,
                      text(plan.currency),
                      app.t("unknown"),
                    )}
                  </div>
                  <p>
                    {app
                      .t("signup_per_days")
                      .replace("{days}", text(plan.period_days))}
                  </p>
                  <PlanTerms plan={plan} />
                </>
              ) : (
                <p>{app.t("signup_choose_plan_prompt")}</p>
              )}
              {!catalogue.length && plans.data && (
                <Alert type="info" title={app.t("pub_no_plans")} />
              )}
              <Alert
                type="info"
                title={app.t("signup_info_title")}
                description={app.t("signup_info_desc")}
              />
            </aside>
          </div>
          {uncertain && (
            <div className="stack">
              <Alert
                type="warning"
                title={app.t("signup_start_uncertain_alert")}
              />
              <Button loading={busy} onClick={() => void submit({})}>
                {app.t("signup_retry_confirmation")}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
