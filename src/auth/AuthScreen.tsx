import { useRef, useState } from "react";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import {
  CarOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { api } from "../api/client";
import type { Row, RequestBody } from "../api/types";
import { ErrorNotice } from "../components/shared";
import { useApp } from "../app/context";
import { coreText } from "../i18n/corePhrases";
import { safeLocalDestination } from "../app/navigation";
import { bestExperienceText } from "../public/Landing";
import {
  authorizeSignupCheckout,
  closeReservedCheckout,
  reserveCheckoutWindow,
} from "../lib/checkout";

declare global {
  interface Window {
    __carlinkEntry?: {
      kind: "login" | "invitation";
      token: string | null;
      signup?: boolean;
    };
  }
}
export function AuthScreen({
  entry,
  onFinish,
  signup = false,
  returnTo = "/console",
}: {
  entry?: Window["__carlinkEntry"];
  onFinish: (destination: string) => void;
  signup?: boolean;
  returnTo?: string;
}) {
  const app = useApp(),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState<unknown>(null),
    [form] = Form.useForm();
  const ct = (key: string, vars?: Record<string, string | number>) =>
    coreText(app.locale, key, app.t, vars);
  const submitting = useRef(false);
  const request = async ({ email }: { email: string }) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      await api(
        signup ? "/api/v1/auth/signup-links" : "/api/v1/auth/magic-links",
        {
          method: "POST",
          body: {
            email: email.trim(),
            return_to: returnTo,
          } satisfies RequestBody<"/api/v1/auth/magic-links", "post">,
          sensitive: true,
        },
      );
      setSent(true);
    } catch (e) {
      setError(e);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const confirm = async () => {
    if (!entry?.token || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    if (entry.signup) reserveCheckoutWindow();
    try {
      const response = await api<Row>(
        entry.kind === "login"
          ? "/api/v1/auth/magic-links/consume"
          : "/api/v1/invitations/accept",
        { method: "POST", body: { token: entry.token }, sensitive: true },
      );
      entry.token = null;
      window.__carlinkEntry = undefined;
      const destination = safeLocalDestination(response.data.return_to);
      const signupId = /^\/signup\?signup=([a-f0-9-]{36})&checkout=1$/.exec(
        destination,
      )?.[1];
      if (signupId) authorizeSignupCheckout(signupId);
      else closeReservedCheckout();
      await app.reload();
      onFinish(destination);
    } catch (e) {
      closeReservedCheckout();
      setError(e);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="brand">
          <CarOutlined />
          <span>CarLink</span>
        </div>
        <span className="eyebrow">{ct("FLEET OPERATIONS, CONNECTED")}</span>
        <Typography.Title>
          {ct("One clear view.")}
          <br />
          {ct("A better connected fleet.")}
        </Typography.Title>
        <p>
          {ct(
            "Bring vehicles, drivers and day-to-day operations together — with the right information in the right hands.",
          )}
        </p>
        <div className="auth-features">
          <p>
            <SafetyCertificateOutlined /> {ct("Permission-aware workspaces")}
          </p>
          <p>
            <CarOutlined />{" "}
            {ct("Vehicles, drivers and compliance in one place")}
          </p>
          <p>
            <MailOutlined /> {ct("Secure, single-use email sign-in")}
          </p>
        </div>
        <span className="auth-footnote">
          {ct("Fleet · Drivers · Compliance · Managed devices")}
        </span>
      </section>
      <section className="auth-content">
        <Card className="auth-card">
          <Typography.Text type="secondary">
            {ct("WELCOME TO CARLINK")}
          </Typography.Text>
          <Typography.Title level={2}>
            {entry?.signup
              ? ct("Confirm your organization")
              : entry
                ? ct(
                    entry.kind === "login"
                      ? "confirmLogin"
                      : "confirmInvitation",
                  )
                : signup
                  ? ct("Confirm your email to get started")
                  : ct("signIn")}
          </Typography.Title>
          <div className="stack">
            <ErrorNotice error={error || app.error} />
            {entry ? (
              <>
                {!entry.token ? (
                  <Alert
                    type="warning"
                    showIcon
                    title={ct(
                      "This link is missing or invalid. Request a fresh sign-in link.",
                    )}
                  />
                ) : entry.kind === "invitation" && !app.session ? (
                  <>
                    <Alert
                      type="info"
                      title={ct(
                        "Sign in with the invited mailbox in a separate tab, then return here. The invitation is kept only in this tab's memory.",
                      )}
                    />
                    <Button
                      loading={app.loading}
                      onClick={() => void app.reload()}
                    >
                      {ct("Check sign-in status")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography.Paragraph>
                      {entry.kind === "invitation"
                        ? ct(
                            "Signed in as {email}. Accepting grants only the server-authorized invitation role.",
                            { email: app.session?.user.email || "" },
                          )
                        : entry.signup
                          ? ct(
                              "Confirm the organization and plan reviewed in your signup email. Your invoice will be issued and secure payment will open in a new window. Unpaid organizations are permanently deleted after 12 hours.",
                            )
                          : ct(
                              "Confirm below to sign in securely. This link works once.",
                            )}
                    </Typography.Paragraph>
                    <Button
                      type="primary"
                      block
                      loading={busy}
                      onClick={() => void confirm()}
                    >
                      {entry.signup
                        ? ct("Confirm & continue to payment")
                        : ct(
                            entry.kind === "login"
                              ? "confirmLogin"
                              : "confirmInvitation",
                          )}
                    </Button>
                  </>
                )}
              </>
            ) : null}
            {(!entry ||
              !entry.token ||
              (entry.kind === "invitation" && !app.session)) && (
              <>
                {sent && (
                  <Alert
                    type="success"
                    showIcon
                    title={ct("Check your email")}
                    description={ct(
                      "If your account is eligible, a link will arrive shortly. It expires after 10 minutes and works once. Check your spam folder if needed.",
                    )}
                  />
                )}
                <Form form={form} layout="vertical" onFinish={request}>
                  <Form.Item
                    label={ct("email")}
                    name="email"
                    rules={[
                      { required: true },
                      { type: "email" },
                      { max: 255 },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined />}
                      autoComplete="email"
                      placeholder="you@organization.com"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    block
                    loading={busy}
                  >
                    {ct("requestLink")}
                  </Button>
                </Form>
              </>
            )}
            <Typography.Paragraph className="muted">
              {signup &&
                `${ct("Confirming email creates an account identity, not an organization or a charge. You will choose and review your plan next.")} `}
              {ct("Sign in securely by email — no password needed.")}
            </Typography.Paragraph>
            <Space wrap>
              <Button type="link" onClick={() => app.setLocale("en")}>
                English
              </Button>
              <Button type="link" onClick={() => app.setLocale("ms")}>
                Bahasa Melayu
              </Button>
              <Button type="link" onClick={() => app.setLocale("zh")}>
                简体中文
              </Button>
              <Button type="link" onClick={() => app.setLocale("ta")}>
                தமிழ்
              </Button>
            </Space>
            <Button type="link" href="/#/">
              {ct("Back to CarLink")}
            </Button>
          </div>
        </Card>
        <Typography.Text type="secondary">
          {ct("CarLink | Connected to Every Mile")}
        </Typography.Text>
        <footer style={{ textAlign: "center", maxWidth: 460 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {bestExperienceText(app.locale)}
          </Typography.Text>
        </footer>
      </section>
    </main>
  );
}
