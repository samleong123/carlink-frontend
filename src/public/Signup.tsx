import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Spin,
  Steps,
  Typography,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  api,
  isUncertainError,
  orgPath,
  segment,
  ResponseContractError,
} from "../api/client";
import { logicalAttempt } from "../api/forms";
import { object, rows, text, type Row, type Schemas } from "../api/types";
import { useApp } from "../app/context";
import { Details, ErrorNotice, Time, useData } from "../components/shared";
import { money, PaymentStatus } from "../features/billing";
import { bestExperienceText, PlanTerms, PublicHeader } from "./Landing";
import { SignupStart } from "./SignupStart";
import {
  beginSignupCheckout,
  closeReservedCheckout,
  openCheckoutWindow,
  reserveCheckoutWindow,
  isUuid,
  validSignup,
  signupCheckoutEligible,
} from "../lib/checkout";

export function Signup() {
  const app = useApp(),
    location = useLocation();
  return (
    <div className="public-page">
      <PublicHeader />
      <main className="signup-layout">
        {!app.session ||
        new URLSearchParams(location.search).get("new") === "1" ? (
          <SignupStart />
        ) : (
          <SignupForm key={app.session.user.id} />
        )}
      </main>
      <footer
        className="public-footer"
        style={{
          justifyContent: "center",
          textAlign: "center",
          borderTop: "1px solid #e8edf4",
          paddingTop: 18,
          paddingBottom: 28,
        }}
      >
        <span>{bestExperienceText(app.locale)}</span>
      </footer>
    </div>
  );
}
function SignupForm() {
  const app = useApp(),
    location = useLocation(),
    navigate = useNavigate(),
    [form] = Form.useForm();
  const requestedSignup = new URLSearchParams(location.search).get("signup");
  const plans = useData("/api/v1/public/plans"),
    latest = useData(
      requestedSignup
        ? `/api/v1/organization-signups/${segment(requestedSignup)}`
        : "/api/v1/organization-signups",
    );
  const [created, setCreated] = useState<Row | null>(null),
    [newSignup, setNewSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [uncertain, setUncertain] = useState(false),
    [checkoutBusy, setCheckoutBusy] = useState(false),
    [checkoutUncertain, setCheckoutUncertain] = useState(false),
    [autoOpen, setAutoOpen] = useState(false);
  const flight = useRef(false),
    attempt = useRef<{ payload: string; key: string } | null>(null),
    checkoutFlight = useRef(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => tick((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const catalogue = rows(plans.data?.data.items),
    requested = new URLSearchParams(location.search).get("plan") || "";
  const selected = Form.useWatch("plan_id", form) || requested,
    plan = catalogue.find((p) => p.id === selected);
  const current = created || (newSignup ? null : latest.data?.data),
    signup = object(current?.signup),
    invoice = object(current?.invoice);
  const expired =
    signup.deadline_passed === true ||
    (signup.status === "pending" &&
      (!Number.isFinite(Date.parse(text(signup.payment_due_at))) ||
        Date.parse(text(signup.payment_due_at)) <= Date.now()));
  const requestCheckout = async (data: Row) => {
    if (checkoutFlight.current || checkoutUncertain) return;
    const s = object(data.signup),
      inv = object(data.invoice);
    if (!signupCheckoutEligible(data)) {
      closeReservedCheckout();
      return;
    }
    checkoutFlight.current = true;
    setCheckoutBusy(true);
    setError(null);
    try {
      const path = orgPath(
        text(s.organization_id),
        `/invoices/${segment(text(inv.id))}/pay`,
      );
      const response = await api<Row>(path, {
        method: "POST",
        sensitive: true,
      });
      if (!response.data || !isUuid(response.data.payment_id))
        throw new ResponseContractError(
          response.status,
          response.request_id,
          path,
          app.t("signup_err_invalid_payment_ref"),
          true,
        );
      setCreated({
        ...data,
        invoice: { ...inv, payment_id: response.data.payment_id },
      });
      setAutoOpen(true);
      if (!signupCheckoutEligible(data)) closeReservedCheckout();
      else if (typeof response.data.payment_url === "string")
        openCheckoutWindow(response.data.payment_url, response.data.payment_id);
    } catch (e) {
      closeReservedCheckout();
      setError(e);
      if (
        isUncertainError(e) ||
        (e instanceof DOMException && e.name === "AbortError")
      )
        setCheckoutUncertain(true);
    } finally {
      checkoutFlight.current = false;
      setCheckoutBusy(false);
    }
  };
  useEffect(() => {
    if (!signup.id || expired || !invoice.id || signup.status !== "pending")
      return;
    if (beginSignupCheckout(text(signup.id))) {
      setAutoOpen(true);
      if (!invoice.payment_id && current) void requestCheckout(current);
    }
  }, [signup.id, invoice.id, invoice.payment_id, expired]);
  useEffect(() => {
    if (expired) closeReservedCheckout();
  }, [expired]);
  const refresh = async () => {
    const response = await latest.refetch();
    if (response.data) {
      setCreated(response.data.data);
      if (
        ["paid", "deleted"].includes(
          text(object(response.data.data.signup).status),
        )
      )
        await app.reload();
    }
  };
  const submit = async (values: Row) => {
    if (flight.current) return;
    if (!plan && !uncertain) {
      setError(new Error(app.t("signup_err_choose_plan")));
      return;
    }
    flight.current = true;
    reserveCheckoutWindow();
    setBusy(true);
    setError(null);
    try {
      const body =
        uncertain && attempt.current
          ? (JSON.parse(
              attempt.current.payload,
            ) as Schemas["OrganizationSignupCreate"])
          : ({
              name: text(values.name).trim(),
              timezone: text(values.timezone),
              default_locale: values.default_locale as "en" | "ms" | "zh",
              plan_id: text(plan?.id),
              plan_version: Number(plan?.version),
              accept_unpaid_deletion: true,
            } satisfies Schemas["OrganizationSignupCreate"]);
      attempt.current = logicalAttempt(attempt.current, body, uncertain);
      const response = await api<Row>("/api/v1/organization-signups", {
        method: "POST",
        body,
        headers: { "Idempotency-Key": attempt.current.key },
      });
      if (!validSignup(response.data))
        throw new ResponseContractError(
          response.status,
          response.request_id,
          "/api/v1/organization-signups",
          app.t("signup_err_invalid_signup"),
          true,
        );
      setCreated(response.data);
      setUncertain(false);
      await requestCheckout(response.data);
      await app.reload();
    } catch (e) {
      closeReservedCheckout();
      setError(e);
      if (
        isUncertainError(e) ||
        (e instanceof DOMException && e.name === "AbortError")
      )
        setUncertain(true);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      <div>
        <span className="eyebrow">{app.t("signup_eyebrow")}</span>
        <Typography.Title level={1}>
          {app.t("signup_setup_title")}
        </Typography.Title>
        <p>
          {app
            .t("signup_owner_email_line")
            .replace("{email}", text(app.session?.user.email))}
        </p>
      </div>
      <Steps
        current={signup.status === "paid" ? 3 : signup.id ? 2 : 1}
        items={[
          { title: app.t("signup_step_confirm_email") },
          { title: app.t("signup_step_review") },
          { title: app.t("signup_step_payment") },
          { title: app.t("signup_step_workspace") },
        ]}
      />
      <ErrorNotice error={error || latest.error || plans.error} />
      {(latest.isPending || plans.isPending) && <Spin />}
      {signup.id ? (
        <Card
          title={
            signup.status === "paid"
              ? app.t("signup_status_paid")
              : signup.status === "deleted"
                ? app.t("signup_status_deleted")
                : app.t("signup_status_awaiting")
          }
        >
          <div className="stack">
            <Details data={signup} />
            {!!invoice.id && (
              <>
                <Typography.Title level={3}>
                  {money(
                    invoice.amount_minor,
                    text(invoice.currency),
                    app.t("unknown"),
                  )}
                </Typography.Title>
                <p>
                  {app
                    .t("signup_invoice_line")
                    .replace("{plan}", text(object(invoice.plan_snapshot).name))
                    .replace("{number}", text(invoice.number))}
                </p>
                <PlanTerms plan={object(invoice.plan_snapshot)} />
              </>
            )}
            {signup.status === "pending" && (
              <>
                <Alert
                  showIcon
                  type={expired ? "error" : "warning"}
                  title={
                    expired
                      ? app.t("signup_deadline_passed")
                      : app.t("signup_confirm_deadline")
                  }
                  description={
                    <span>
                      {app.t("signup_deadline_prefix")}{" "}
                      <Time value={signup.payment_due_at} />
                      {app.t("signup_deadline_suffix")}
                    </span>
                  }
                />
                {!expired && !!invoice.id && !invoice.payment_id && (
                  <Button
                    type="primary"
                    loading={checkoutBusy}
                    disabled={checkoutUncertain}
                    onClick={() => {
                      reserveCheckoutWindow();
                      if (current) void requestCheckout(current);
                    }}
                  >
                    {app.t("signup_continue_payment")}
                  </Button>
                )}
                {checkoutUncertain && (
                  <Alert
                    type="warning"
                    title={app.t("signup_checkout_uncertain")}
                  />
                )}
                {!expired && !!invoice.payment_id && (
                  <PaymentStatus
                    key={text(invoice.payment_id)}
                    id={text(invoice.payment_id)}
                    organizationId={text(signup.organization_id)}
                    invoicePath={orgPath(
                      text(signup.organization_id),
                      `/invoices/${segment(text(invoice.id))}`,
                    )}
                    onConfirmed={() => void refresh()}
                    autoOpen={autoOpen}
                  />
                )}
                <Button
                  loading={latest.isFetching}
                  onClick={() => void refresh()}
                >
                  {app.t("signup_check_status")}
                </Button>
              </>
            )}
            {signup.status === "paid" && (
              <Button
                type="primary"
                onClick={() =>
                  navigate(
                    `/organization/${segment(text(signup.organization_id))}/dashboard`,
                  )
                }
              >
                {app.t("signup_open_console")}
              </Button>
            )}
            {signup.status === "deleted" && (
              <Alert type="warning" title={app.t("signup_deleted_alert")} />
            )}
            {["paid", "deleted"].includes(text(signup.status)) && (
              <Button
                onClick={() => {
                  setCreated(null);
                  setNewSignup(true);
                  attempt.current = null;
                  setCheckoutUncertain(false);
                  setAutoOpen(false);
                  setError(null);
                }}
              >
                {app.t("signup_create_another")}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        latest.data &&
        !latest.error && (
          <Card title={app.t("signup_review_before_creating")}>
            <div className="signup-columns">
              <Form
                form={form}
                layout="vertical"
                onFinish={submit}
                disabled={busy || uncertain}
                initialValues={{
                  timezone: app.session?.user.timezone || "Asia/Kuala_Lumpur",
                  default_locale: app.locale === "ta" ? "en" : app.locale,
                  plan_id: requested || undefined,
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
                  name="timezone"
                  label={app.t("signup_org_timezone")}
                  rules={[{ required: true }, { max: 64 }]}
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
                              new Error(app.t("signup_accept_deletion_err")),
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
                    . {app.t("signup_form_checkbox")}
                  </Checkbox>
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={busy}
                  disabled={!plan || !!plans.error || uncertain}
                >
                  {app.t("signup_create_continue_btn")}
                </Button>
              </Form>
              <aside className="stack">
                <Button
                  disabled={busy || uncertain}
                  loading={plans.isFetching}
                  onClick={() => void plans.refetch()}
                >
                  {app.t("signup_refresh_pricing")}
                </Button>
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
                        .t("signup_per_days_confirmed")
                        .replace("{days}", text(plan.period_days))}
                    </p>
                    <PlanTerms plan={plan} />
                  </>
                ) : (
                  <p>{app.t("signup_select_plan_review")}</p>
                )}
                {!catalogue.length && plans.data && (
                  <Alert
                    type="warning"
                    title={app.t("signup_no_plans_alert")}
                  />
                )}
                <Alert
                  type="info"
                  title={app.t("signup_secure_next_title")}
                  description={app.t("signup_secure_next_desc")}
                />
                <Button
                  href={`/#/signin?return_to=${encodeURIComponent(`/signup${location.search}`)}`}
                >
                  {app.t("signup_fresh_link")}
                </Button>
                <Button
                  href={`/#/signup${location.search ? `${location.search}&new=1` : "?new=1"}`}
                >
                  {app.t("signup_different_email")}
                </Button>
                <p className="muted">{app.t("signup_recent_confirm_note")}</p>
              </aside>
            </div>
            {uncertain && (
              <div className="stack">
                <Alert type="warning" title={app.t("signup_uncertain_alert")} />
                <Button onClick={() => void refresh()}>
                  {app.t("signup_reconcile_btn")}
                </Button>
                <Button loading={busy} onClick={() => void submit({})}>
                  {app.t("signup_retry_btn")}
                </Button>
              </div>
            )}
          </Card>
        )
      )}
      {latest.error && (
        <Button onClick={() => void refresh()}>
          {app.t("signup_check_latest_btn")}
        </Button>
      )}
    </div>
  );
}
