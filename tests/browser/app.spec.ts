import { expect, test, type Page, type Route } from "@playwright/test";
import { signedFileLink } from "../file-link-fixture";
const API = "https://carlink-be.samsam123.name.my";
const ORG = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const VEHICLE = "33333333-3333-4333-8333-333333333333";
const O = `/api/v1/organizations/${ORG}`;
const all = [
  "vehicles.read",
  "vehicles.write",
  "drivers.read",
  "devices.read",
  "telemetry.read",
  "dashboard.read",
  "compliance.read",
  "compliance.write",
  "maintenance.read",
  "maintenance.write",
  "maintenance.complete",
  "subscription.read",
  "subscription.manage",
  "payments.manage",
  "settings.read",
  "settings.write",
  "notifications.own",
  "safety.read",
  "safety.appeals.decide",
];
type Options = {
  authenticated?: boolean;
  permissions?: string[];
  twoOrgs?: boolean;
  platform?: "admin" | "technician";
  custom?: (route: Route, url: URL) => Promise<boolean>;
};
async function send(
  route: Route,
  data: unknown,
  status = 200,
  requestId = "browser-fixture-request",
) {
  await route.fulfill({
    status,
    headers: {
      "access-control-allow-origin": "http://127.0.0.1:4173",
      "access-control-allow-credentials": "true",
      "access-control-allow-headers":
        "Accept,Content-Type,X-XSRF-TOKEN,Idempotency-Key",
      "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
      "content-type": "application/json",
      "X-Request-ID": requestId,
    },
    body: JSON.stringify({
      status,
      timestamp: "2026-11-18T00:00:00Z",
      ip_address: null,
      request_id: requestId,
      title: status < 400 ? "Server-confirmed test response" : "Rejected",
      desc: "",
      data,
    }),
  });
}
type MutationFailureKind = "network" | "HTTP 503" | "malformed HTTP 200";
async function failMutation(route: Route, failureKind: MutationFailureKind) {
  if (failureKind === "network") {
    await route.abort("failed");
  } else if (failureKind === "HTTP 503") {
    await send(route, {}, 503);
  } else {
    await route.fulfill({
      status: 200,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:4173",
        "access-control-allow-credentials": "true",
        "access-control-expose-headers": "X-Request-ID",
        "content-type": "application/json",
        "X-Request-ID": "malformed-mutation-fixture-request",
      },
      body: JSON.stringify({ unexpected: true }),
    });
  }
}
async function setup(page: Page, opts: Options = {}) {
  const calls: {
    path: string;
    method: string;
    body: unknown;
    headers: Record<string, string>;
  }[] = [];
  let signedIn = opts.authenticated !== false;
  await page.context().addCookies([
    {
      name: "XSRF-TOKEN",
      value: "synthetic-csrf",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.addInitScript(() => {
    (window as any).__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) =>
      (window as any).__cspViolations.push({
        directive: e.violatedDirective,
        blocked: e.blockedURI,
      }),
    );
  });
  await page.route(`${API}/**`, async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (request.method() === "OPTIONS") {
      await send(route, {});
      return;
    }
    const body = request.postData() ? request.postDataJSON() : null;
    calls.push({
      path: url.pathname,
      method: request.method(),
      body,
      headers: request.headers(),
    });
    if (opts.custom && (await opts.custom(route, url))) return;
    const permissions = opts.permissions || all;
    if (url.pathname === "/api/v1/me") {
      await send(
        route,
        signedIn
          ? {
              user: {
                id: "synthetic-user",
                email_normalized: "test@example.test",
                display_name: "Synthetic acceptance user",
                version: 1,
                locale: "en",
                timezone: "Asia/Kuala_Lumpur",
              },
              permissions: {
                [ORG]: permissions,
                ...(opts.twoOrgs ? { [OTHER]: permissions } : {}),
              },
              platform: opts.platform
                ? { role: opts.platform, version: 1 }
                : null,
            }
          : {},
        signedIn ? 200 : 401,
      );
      return;
    }
    if (url.pathname === "/api/v1/organizations") {
      await send(
        route,
        {
          organizations: signedIn
            ? [ORG, ...(opts.twoOrgs ? [OTHER] : [])].map((id, i) => ({
                id: `membership-${i}`,
                organization_id: id,
                role: "viewer",
                status: "active",
                organization: {
                  id,
                  name: i ? "Synthetic Fleet B" : "Synthetic Fleet A",
                  timezone: "Asia/Kuala_Lumpur",
                },
              }))
            : [],
        },
        signedIn ? 200 : 401,
      );
      return;
    }
    if (url.pathname === "/api/v1/auth/magic-links/consume") {
      signedIn = true;
      await send(route, { return_to: "/console" });
      return;
    }
    if (url.pathname === "/api/v1/auth/magic-links") {
      await send(route, {}, 202);
      return;
    }
    if (url.pathname === "/api/v1/auth/logout") {
      signedIn = false;
      await send(route, {});
      return;
    }
    if (url.pathname.endsWith("/subscription")) {
      await send(route, {
        subscription: {
          status: "active",
          plan_snapshot: {
            safety_enabled: true,
            cellular_enabled: true,
            telemetry_min_seconds: 5,
          },
        },
        access_active: true,
        usage: { vehicles: 1, drivers: 0 },
      });
      return;
    }
    if (url.pathname.endsWith("/notifications/unread-count")) {
      await send(route, { unread_count: 0 });
      return;
    }
    if (url.pathname.endsWith("/dashboard")) {
      await send(route, {
        vehicles: 1,
        observed_vehicles: 0,
        active_shifts: 0,
        active_automatic_journeys: 0,
        open_alerts: 0,
        pending_telemetry: 0,
      });
      return;
    }
    if (url.pathname.endsWith("/fleet-states")) {
      await send(route, { items: [], pagination: { next_cursor: null } });
      return;
    }
    if (url.pathname.endsWith("/vehicles")) {
      await send(route, {
        items: [
          {
            id: VEHICLE,
            registration_number: "SYNTHETIC-1",
            make: "Fixture",
            model: "Test only",
            status: "active",
            version: 1,
          },
        ],
        pagination: { next_cursor: null },
      });
      return;
    }
    if (url.pathname === `${O}/vehicles/${VEHICLE}`) {
      await send(route, {
        item: {
          id: VEHICLE,
          registration_number: "SYNTHETIC-1",
          registration_country: "MY",
          make: "Fixture",
          model: "Test only",
          status: "active",
          version: 1,
        },
        device: null,
      });
      return;
    }
    if (url.pathname.endsWith("/latest-state")) {
      await send(route, { sample: null, freshness: "never_observed" });
      return;
    }
    if (url.pathname.endsWith("/settings")) {
      await send(route, {
        version: 1,
        settings: { email_digest_hour: 8, email_driver_daily: true },
      });
      return;
    }
    await send(
      route,
      { items: [], pagination: { next_cursor: null } },
      request.method() === "GET" ? 200 : 404,
    );
  });
  return calls;
}
function platformOnlyProfile(
  role: "admin" | "technician",
  permissions: Record<string, string[]> | [] = {},
) {
  return {
    user: {
      id: "synthetic-platform-only-user",
      email_normalized: "platform-only@example.test",
      display_name: "Synthetic platform-only user",
      version: 1,
      locale: "en",
      timezone: "Asia/Kuala_Lumpur",
      memberships: [],
    },
    permissions,
    platform: { role, version: 1 },
  };
}
for (const role of ["admin", "technician"] as const) {
  for (const legacyPermissions of [false, true]) {
    test(`platform-only ${role} enters the permitted workspace with ${legacyPermissions ? "legacy array" : "canonical object"} empty permissions`, async ({
      page,
    }) => {
      const calls = await setup(page, {
        custom: async (route, url) => {
          if (url.pathname === "/api/v1/me") {
            await send(
              route,
              platformOnlyProfile(role, legacyPermissions ? [] : {}),
              200,
              "platform-only-profile-request",
            );
            return true;
          }
          if (url.pathname === "/api/v1/organizations") {
            await send(
              route,
              { organizations: [] },
              200,
              "platform-only-membership-request",
            );
            return true;
          }
          return false;
        },
      });
      await page.goto("/#/console");
      await expect(page).toHaveURL(
        role === "admin"
          ? /#\/platform\/subscribers$/
          : /#\/technician\/devices$/,
      );
      await expect(
        page.getByRole("heading", {
          name: role === "admin" ? "Subscribers" : "Device installation",
          exact: true,
        }),
      ).toBeVisible();
      await expect
        .poll(() =>
          calls.some(
            (call) =>
              call.path ===
              (role === "admin"
                ? "/api/v1/platform/subscriptions"
                : "/api/v1/platform/devices"),
          ),
        )
        .toBe(true);
      expect(
        calls.some((call) => /^\/api\/v1\/organizations\//.test(call.path)),
      ).toBe(false);
      await expect(
        page.getByRole("combobox", { name: "Organization", exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText("API response format mismatch", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Request could not complete (502)", { exact: true }),
      ).toHaveCount(0);
    });
  }
}
for (const malformedPath of ["/api/v1/me", "/api/v1/organizations"]) {
  test(`a malformed HTTP 200 at ${malformedPath} identifies the client contract failure and the correct request`, async ({
    page,
  }) => {
    const profileRequestId = "distinct-profile-contract-request";
    const membershipRequestId = "distinct-membership-contract-request";
    const calls = await setup(page, {
      custom: async (route, url) => {
        if (url.pathname === "/api/v1/me") {
          const profile = platformOnlyProfile("admin");
          await send(
            route,
            malformedPath === url.pathname
              ? {
                  ...profile,
                  user: { ...profile.user, timezone: "not/a-zone" },
                }
              : profile,
            200,
            profileRequestId,
          );
          return true;
        }
        if (url.pathname === "/api/v1/organizations") {
          await send(
            route,
            { organizations: malformedPath === url.pathname ? {} : [] },
            200,
            membershipRequestId,
          );
          return true;
        }
        return false;
      },
    });
    await page.goto("/#/console");
    const notice = page.locator(".ant-alert").filter({
      hasText: "API response format mismatch",
    });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/HTTP(?: status)?\s*:?\s*200/i);
    await expect(notice).toContainText(malformedPath);
    await expect(notice).toContainText(
      malformedPath === "/api/v1/me" ? profileRequestId : membershipRequestId,
    );
    await expect(notice).not.toContainText(
      malformedPath === "/api/v1/me" ? membershipRequestId : profileRequestId,
    );
    await expect(
      page.getByText(/Provider compatibility|upstream service returned/i),
    ).toHaveCount(0);
    await expect(
      page.getByText("Request could not complete (502)", { exact: true }),
    ).toHaveCount(0);
    expect(
      calls.some((call) => /^\/api\/v1\/organizations\//.test(call.path)),
    ).toBe(false);
  });
}
const SIGNUP_PLAN = "44444444-4444-4444-8444-444444444444";
const SIGNUP = "55555555-5555-4555-8555-555555555555";
const INVOICE = "66666666-6666-4666-8666-666666666666";
const PAYMENT = "77777777-7777-4777-8777-777777777777";
const signupPlan = {
  id: SIGNUP_PLAN,
  name: "Synthetic Discovery Plan",
  version: 1,
  price_minor: 12000,
  currency: "MYR",
  period_days: 30,
  vehicle_limit: 5,
  driver_limit: 10,
  retention_days: 90,
  telemetry_min_seconds: 5,
  cellular_enabled: true,
  safety_enabled: false,
};
function signupData(
  status = "pending",
  paymentId: string | null = null,
  due = new Date(Date.now() + 43200000).toISOString(),
) {
  return {
    signup: {
      id: SIGNUP,
      organization_id: ORG,
      invoice_id: INVOICE,
      status,
      payment_due_at: due,
      deadline_passed: false,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      deleted_at: status === "deleted" ? new Date().toISOString() : null,
    },
    invoice:
      status === "deleted"
        ? null
        : {
            id: INVOICE,
            number: "CL-SYNTHETIC",
            status: status === "paid" ? "paid" : "issued",
            amount_minor: 12000,
            currency: "MYR",
            plan_snapshot: signupPlan,
            payment_id: paymentId,
          },
  };
}
test("public landing and pricing use live catalogue responses without console or invented plans", async ({
  page,
}) => {
  const calls = await setup(page, {
    authenticated: false,
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan], payment_window_hours: 12 });
        return true;
      }
      return false;
    },
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Know where every vehicle is, and how it's driven\./,
    }),
  ).toBeVisible();
  await expect(page.getByText("MYR 120.00", { exact: true })).toBeVisible();
  await expect(page.getByText(/12 hours to confirm payment/)).toBeVisible();
  expect(calls.some((c) => c.path.includes("/platform/plans"))).toBe(false);
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  expect(await page.locator("style").count()).toBe(0);
  await page
    .getByRole("button", { name: "Choose Synthetic Discovery Plan" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Create your CarLink organization" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Owner email" })
    .fill("new@example.test");
  await page
    .getByRole("textbox", { name: "Organization name" })
    .fill("New Fleet");
  await page.getByRole("checkbox").check();
  await page.route(`${API}/api/v1/auth/signup-links`, (route) =>
    send(route, {}, 202),
  );
  await page.getByRole("button", { name: "Confirm email & continue" }).click();
  await expect(
    page.getByText(/Your confirmation request has been received/),
  ).toBeVisible();
  expect(
    calls.some(
      (c) => c.path === "/api/v1/organization-signups" && c.method === "POST",
    ),
  ).toBe(false);
});
test("empty public catalogue never offers a fictional signup plan", async ({
  page,
}) => {
  await setup(page, { authenticated: false });
  await page.goto("/#/plans");
  await expect(
    page.getByText(
      "No plans are currently available. Please check again later.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Choose / })).toHaveCount(0);
});
test("email confirmation preserves the selected signup destination without consuming on navigation", async ({
  page,
}) => {
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/auth/magic-links/consume") {
        await send(route, { return_to: `/signup?plan=${SIGNUP_PLAN}` });
        return true;
      }
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, { signup: null, invoice: null });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/auth/confirm?token=${"e".repeat(64)}`);
  expect(page.url()).not.toContain("token=");
  expect(calls.some((c) => c.path.endsWith("/consume"))).toBe(false);
  await page.getByRole("button", { name: "Confirm sign-in" }).click();
  await expect(
    page.getByRole("heading", { name: "Set up your CarLink organization" }),
  ).toBeVisible();
  expect(page.url()).toContain(`#/signup?plan=${SIGNUP_PLAN}`);
  await expect(
    page.getByText("Synthetic Discovery Plan", { exact: true }).last(),
  ).toBeVisible();
});
test("verified signup sends the selected version and deletion acceptance, then reconciles its server invoice", async ({
  page,
}) => {
  let current: ReturnType<typeof signupData> | null = null;
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        if (route.request().method() === "POST") {
          current = signupData();
          await send(route, current, 201);
        } else await send(route, current || { signup: null, invoice: null });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/signup?plan=${SIGNUP_PLAN}`);
  await page
    .getByRole("textbox", { name: "Organization name" })
    .fill("Synthetic New Fleet");
  await page.getByRole("checkbox").check();
  await page.screenshot({
    path: "test-results/signup-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create organization & continue to payment" })
    .click();
  await expect(
    page.getByText("Your organization is awaiting payment"),
  ).toBeVisible();
  const create = calls.filter(
    (c) => c.path === "/api/v1/organization-signups" && c.method === "POST",
  );
  expect(create).toHaveLength(1);
  expect(create[0].body).toEqual({
    name: "Synthetic New Fleet",
    timezone: "Asia/Kuala_Lumpur",
    default_locale: "en",
    plan_id: SIGNUP_PLAN,
    plan_version: 1,
    accept_unpaid_deletion: true,
  });
  expect(create[0].headers["idempotency-key"]).toMatch(/^[a-f0-9-]{36}$/);
  await expect(page.getByText("MYR 120.00", { exact: true })).toBeVisible();
  await expect
    .poll(() => calls.filter((c) => c.path.endsWith("/pay")).length)
    .toBe(1);
});
test("email-first signup uncertainty freezes reviewed details and reuses the email-request key", async ({
  page,
}) => {
  let attempts = 0;
  const calls = await setup(page, {
    authenticated: false,
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/auth/signup-links") {
        attempts++;
        if (attempts === 1) await send(route, {}, 503);
        else await send(route, {}, 202);
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/signup?plan=${SIGNUP_PLAN}`);
  await page
    .getByRole("textbox", { name: "Organization name" })
    .fill("Email First Fleet");
  await page
    .getByRole("textbox", { name: "Owner email" })
    .fill("owner-new@example.test");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm email & continue" }).click();
  await expect(
    page.getByRole("textbox", { name: "Owner email" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Retry unchanged confirmation request" })
    .click();
  await expect(
    page.getByText("Your confirmation request has been received"),
  ).toBeVisible();
  const writes = calls.filter((c) => c.path.endsWith("/signup-links"));
  expect(writes).toHaveLength(2);
  expect(writes[1].body).toEqual(writes[0].body);
  expect(writes[1].headers["idempotency-key"]).toBe(
    writes[0].headers["idempotency-key"],
  );
  expect(writes[0].body).toMatchObject({
    email: "owner-new@example.test",
    organization: {
      name: "Email First Fleet",
      plan_id: SIGNUP_PLAN,
      plan_version: 1,
      accept_unpaid_deletion: true,
    },
  });
  expect(
    calls.some(
      (c) =>
        c.path === "/api/v1/organization-signups" || c.path.endsWith("/pay"),
    ),
  ).toBe(false);
});
for (const blocked of [false, true]) {
  test(`explicit signup confirmation opens the same automatic checkout (${blocked ? "popup fallback" : "new window"})`, async ({
    page,
  }) => {
    const gateway =
      "https://gateway.samsam123.name.my/index.html?data=synthetic-only";
    if (blocked)
      await page.addInitScript(() => {
        window.open = () => null;
      });
    await page
      .context()
      .route("https://gateway.samsam123.name.my/**", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: "<p>Synthetic gateway fixture — no payment processed</p>",
        }),
      );
    const calls = await setup(page, {
      custom: async (route, url) => {
        if (url.pathname.endsWith("/consume")) {
          await send(route, {
            return_to: `/signup?signup=${SIGNUP}&checkout=1`,
          });
          return true;
        }
        if (url.pathname === `/api/v1/organization-signups/${SIGNUP}`) {
          await send(route, signupData());
          return true;
        }
        if (url.pathname.endsWith(`/invoices/${INVOICE}/pay`)) {
          await send(route, { payment_id: PAYMENT, payment_url: gateway }, 202);
          return true;
        }
        if (url.pathname.endsWith(`/payments/${PAYMENT}`)) {
          await send(route, {
            payment: { id: PAYMENT, status: "pending", payment_url: gateway },
          });
          return true;
        }
        return false;
      },
    });
    await page.goto(`/auth/confirm?token=${"f".repeat(64)}&flow=signup`);
    expect(page.url()).not.toContain("token=");
    expect(
      calls.some((c) => c.path.endsWith("/consume") || c.path.endsWith("/pay")),
    ).toBe(false);
    const popup = blocked ? null : page.waitForEvent("popup");
    await page
      .getByRole("button", { name: "Confirm & continue to payment" })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`signup\\?signup=${SIGNUP}&checkout=1`),
    );
    await expect(
      page.getByText("Your organization is awaiting payment"),
    ).toBeVisible();
    if (popup) {
      const paymentPage = await popup;
      await expect(paymentPage).toHaveURL(gateway);
      expect(await paymentPage.evaluate(() => window.opener === null)).toBe(
        true,
      );
      await paymentPage.close();
    } else
      await expect(
        page.getByText(/Your browser did not open the payment window/),
      ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open secure checkout" }),
    ).toHaveAttribute("href", gateway);
    expect(calls.filter((c) => c.path.endsWith("/pay"))).toHaveLength(1);
    expect(
      calls.filter(
        (c) => c.path === "/api/v1/organization-signups" && c.method === "POST",
      ),
    ).toHaveLength(0);
    expect(
      await page.evaluate(() => [localStorage.length, sessionStorage.length]),
    ).toEqual([0, 0]);
  });
}
test("a signup query alone cannot trigger an automatic payment request", async ({
  page,
}) => {
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `/api/v1/organization-signups/${SIGNUP}`) {
        await send(route, signupData());
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/signup?signup=${SIGNUP}&checkout=1`);
  await expect(
    page.getByRole("button", { name: "Continue to secure payment" }),
  ).toBeVisible();
  expect(calls.some((c) => c.path.endsWith("/pay"))).toBe(false);
});
test("a malformed checkout reference freezes payment retry even after refreshing signup", async ({
  page,
}) => {
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, signupData());
        return true;
      }
      if (url.pathname.endsWith("/pay")) {
        await send(route, { payment_id: "not-a-uuid" }, 202);
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/signup");
  await page
    .getByRole("button", { name: "Continue to secure payment" })
    .click();
  await expect(
    page.getByText(/The payment request may already exist/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Check signup status" }).click();
  await expect(
    page.getByRole("button", { name: "Continue to secure payment" }),
  ).toBeDisabled();
  expect(calls.filter((c) => c.path.endsWith("/pay"))).toHaveLength(1);
});
for (const failureKind of [
  "network",
  "HTTP 503",
  "malformed HTTP 200",
] as const) {
  test(`uncertain organization creation freezes draft and reuses the exact payload and key (${failureKind})`, async ({
    page,
  }) => {
    let creates = 0;
    const calls = await setup(page, {
      custom: async (route, url) => {
        if (url.pathname === "/api/v1/public/plans") {
          await send(route, { items: [signupPlan] });
          return true;
        }
        if (url.pathname === "/api/v1/organization-signups") {
          if (route.request().method() === "POST") {
            creates++;
            if (creates === 1) await failMutation(route, failureKind);
            else await send(route, signupData(), 201);
          } else await send(route, { signup: null, invoice: null });
          return true;
        }
        return false;
      },
    });
    await page.goto(`/#/signup?plan=${SIGNUP_PLAN}`);
    await page
      .getByRole("textbox", { name: "Organization name" })
      .fill("Frozen Synthetic Fleet");
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Create organization & continue to payment",
      })
      .click();
    await expect(page.getByText(/The signup may already exist/)).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Organization name" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Retry unchanged signup" }).click();
    await expect(
      page.getByText("Your organization is awaiting payment"),
    ).toBeVisible();
    const writes = calls.filter(
      (c) => c.path === "/api/v1/organization-signups" && c.method === "POST",
    );
    expect(writes).toHaveLength(2);
    expect(writes[1].body).toEqual(writes[0].body);
    expect(writes[1].headers["idempotency-key"]).toBe(
      writes[0].headers["idempotency-key"],
    );
  });
}
test("signup uncertain checkout is reconciled from the invoice and does not offer replacement charges", async ({
  page,
}) => {
  let current = signupData();
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, current);
        return true;
      }
      if (url.pathname.endsWith(`/invoices/${INVOICE}/pay`)) {
        current = signupData("pending", PAYMENT);
        await send(route, { payment_id: PAYMENT }, 502);
        return true;
      }
      if (url.pathname.endsWith(`/payments/${PAYMENT}`)) {
        await send(route, {
          payment: {
            id: PAYMENT,
            status: "creation_unknown",
            amount: "120.00",
            payment_url: null,
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/signup");
  await page
    .getByRole("button", { name: "Continue to secure payment" })
    .click();
  await expect(
    page.getByText(/The payment request may already exist/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Check signup status" }).click();
  await expect(
    page.getByText(/Contact an operator to reconcile this payment/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to secure payment" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Open secure checkout" }),
  ).toHaveCount(0);
  expect(calls.filter((c) => c.path.endsWith("/pay"))).toHaveLength(1);
});
test("signup deadline removes transient checkout access without waiting for the scheduler", async ({
  page,
}) => {
  const due = new Date(Date.now() + 6000).toISOString();
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, signupData("pending", PAYMENT, due));
        return true;
      }
      if (url.pathname.endsWith(`/payments/${PAYMENT}`)) {
        await send(route, {
          payment: {
            id: PAYMENT,
            status: "pending",
            amount: "120.00",
            expires_at: due,
            payment_url:
              "https://gateway.samsam123.name.my/index.html?data=synthetic-signup-secret",
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/signup");
  await expect(
    page.getByRole("link", { name: "Open secure checkout" }),
  ).toBeVisible();
  await expect(
    page.getByText("Payment deadline passed — do not pay an old checkout link"),
  ).toBeVisible({ timeout: 12000 });
  await expect(
    page.getByRole("link", { name: "Open secure checkout" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
test("signup settlement requires backend invoice/lifecycle confirmation and reveals its console entry", async ({
  page,
}) => {
  let settled = false;
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, signupData(settled ? "paid" : "pending", PAYMENT));
        return true;
      }
      if (url.pathname.endsWith(`/payments/${PAYMENT}`)) {
        settled = true;
        await send(route, {
          payment: {
            id: PAYMENT,
            status: "succeeded",
            amount: "120.00",
            payment_url: null,
          },
        });
        return true;
      }
      if (url.pathname.endsWith(`/invoices/${INVOICE}`)) {
        await send(route, { invoice: signupData("paid", PAYMENT).invoice });
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/signup");
  await expect(
    page.getByText("Payment confirmed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open organization console" }),
  ).toBeVisible();
});
test("deleted signup has no invoice or checkout and makes permanent deletion explicit", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, signupData("deleted"));
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/signup");
  await expect(
    page.getByText("Unpaid organization permanently deleted"),
  ).toBeVisible();
  await expect(
    page.getByText(/This organization cannot be restored/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to secure payment" }),
  ).toHaveCount(0);
});
test("organization signup remains usable at 320px under the compiled CSP", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/public/plans") {
        await send(route, { items: [signupPlan] });
        return true;
      }
      if (url.pathname === "/api/v1/organization-signups") {
        await send(route, { signup: null, invoice: null });
        return true;
      }
      return false;
    },
  });
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto(`/#/signup?plan=${SIGNUP_PLAN}`);
  await expect(
    page.getByRole("textbox", { name: "Organization name" }),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(await page.locator("style").count()).toBe(0);
  await page.screenshot({
    path: "test-results/signup-mobile.png",
    fullPage: true,
  });
});
test("SaaS admins inspect independent signup financial archives without a tenant restoration action", async ({
  page,
}) => {
  await setup(page, {
    platform: "admin",
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/platform/signup-archives") {
        await send(route, {
          items: [
            {
              id: SIGNUP,
              organization_id: ORG,
              payment_due_at: new Date().toISOString(),
              deleted_at: new Date().toISOString(),
              payments_requiring_reconciliation: 1,
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `/api/v1/platform/signup-archives/${SIGNUP}`) {
        await send(route, {
          snapshot: {
            organization: { name: "Archived Synthetic Fleet" },
            invoices: [{ amount_minor: 12000, currency: "MYR" }],
          },
          payments: [{ id: PAYMENT, reconciliation_required: true }],
          events: [],
        });
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/platform/signup-archives");
  await expect(
    page.getByRole("heading", { name: "Unpaid signup archives" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect financial evidence" })
    .click();
  await expect(page.getByText("Archived Synthetic Fleet")).toBeVisible();
  await expect(
    page.getByRole("cell", {
      name: "Reconciliation Required : Yes",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/This archive does not restore an organization/),
  ).toBeVisible();
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
test("production shells, hashes and missing assets use static hosting rules", async ({
  page,
  request,
}) => {
  await setup(page, { authenticated: false });
  for (const path of [
    "/",
    "/auth/confirm",
    "/auth/confirm/",
    "/invitations/confirm/",
  ]) {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("/link-entry.js");
    expect(res.headers()["content-security-policy"]).toContain(
      "script-src 'self'",
    );
  }
  expect((await request.get("/assets/missing.js")).status()).toBe(404);
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await expect(
    page.getByRole("heading", { name: "Sign in to CarLink" }),
  ).toBeVisible();
  expect(page.url()).toContain(`#/organization/${ORG}/vehicles`);
});
test("login token is scrubbed and never consumed before explicit confirmation", async ({
  page,
}) => {
  const calls = await setup(page, { authenticated: false });
  await page.goto(`/auth/confirm/?token=${"a".repeat(64)}`);
  await expect(
    page.getByRole("button", { name: "Confirm sign-in" }),
  ).toBeVisible();
  expect(page.url()).not.toContain("token=");
  expect(calls.some((c) => c.path.endsWith("/consume"))).toBe(false);
  await page.getByRole("button", { name: "Confirm sign-in" }).click();
  await expect(
    page.getByRole("heading", { name: "Fleet overview" }),
  ).toBeVisible();
  expect(calls.filter((c) => c.path.endsWith("/consume"))).toHaveLength(1);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
test("malformed link offers a new email request and never consumes", async ({
  page,
}) => {
  const calls = await setup(page, { authenticated: false });
  await page.goto("/auth/confirm?token=invalid");
  await expect(
    page.getByText("This link is missing or invalid."),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("test@example.test");
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(
    page.getByText("Check your email", { exact: true }),
  ).toBeVisible();
  expect(calls.find((c) => c.path.endsWith("/magic-links"))?.body).toEqual({
    email: "test@example.test",
    return_to: "/console",
  });
  expect(calls.some((c) => c.path.endsWith("/consume"))).toBe(false);
});
test("module navigation and guessed tenant URLs remain permission gated", async ({
  page,
}) => {
  const calls = await setup(page, { permissions: ["vehicles.read"] });
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await expect(page.getByText("SYNTHETIC-1")).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Subscriptions & invoices" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add record" })).toHaveCount(0);
  await page.goto(`/#/organization/${OTHER}/vehicles`);
  await expect(page.getByText("Workspace unavailable")).toBeVisible();
  expect(calls.some((c) => c.path.includes(OTHER))).toBe(false);
});
test("form values reach the API; 422 preserves the draft; explicit confirmation does not duplicate writes", async ({
  page,
}) => {
  let attempts = 0;
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (
        url.pathname === `${O}/vehicles` &&
        route.request().method() === "POST"
      ) {
        attempts++;
        await send(
          route,
          attempts === 1
            ? {
                error: {
                  fields: {
                    registration_number: ["Synthetic validation rejection"],
                  },
                },
              }
            : {
                item: { id: VEHICLE, registration_number: "TEST123" },
                device: { id: "public-device", status: "pending" },
              },
          attempts === 1 ? 422 : 201,
        );
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await page.getByRole("button", { name: "Add record" }).click();
  await page.getByLabel("Registration number", { exact: true }).fill("TEST123");
  await page.getByRole("button", { name: "Review & save" }).click();
  await expect(
    page.getByRole("dialog").filter({ hasText: "Confirm action" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm action" }).click();
  await expect(
    page.getByText("Synthetic validation rejection").first(),
  ).toBeVisible();
  await expect(
    page.getByLabel("Registration number", { exact: true }),
  ).toHaveValue("TEST123");
  await page.getByRole("button", { name: "Review & save" }).click();
  await page.getByRole("button", { name: "Confirm action" }).click();
  await expect(page.getByText("public-device")).toBeVisible();
  const writes = calls.filter(
    (c) => c.path === `${O}/vehicles` && c.method === "POST",
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toMatchObject({
    registration_number: "TEST123",
    registration_country: "MY",
  });
  expect(await page.evaluate(() => (window as any).__cspViolations)).toEqual(
    [],
  );
});
test("cursor navigation preserves opaque cursors and labels loaded scope", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname !== `${O}/vehicles`) return false;
      const next = url.searchParams.get("cursor") === "opaque+/=&";
      await send(route, {
        items: [
          {
            id: next ? OTHER : VEHICLE,
            registration_number: next ? "CURSOR-2" : "CURSOR-1",
          },
        ],
        pagination: { next_cursor: next ? null : "opaque+/=&" },
      });
      return true;
    },
  });
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await expect(page.getByText("CURSOR-1")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("CURSOR-2")).toBeVisible();
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page.getByText("CURSOR-1")).toBeVisible();
});
test("driver portal uses only own records and truthful unavailable vehicle state", async ({
  page,
}) => {
  const calls = await setup(page, {
    permissions: ["profile.own", "notifications.own"],
    custom: async (route, url) => {
      if (url.pathname.endsWith("/driver/me/profile")) {
        await send(route, {
          driver: { id: "own-driver", name: "Own synthetic driver" },
        });
        return true;
      }
      if (url.pathname.endsWith("/driver/me/vehicle-info")) {
        await send(route, { vehicle: null, maintenance: [], compliance: [] });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/my/vehicle-info`);
  await expect(
    page.getByText("Outside an active authorized shift"),
  ).toBeVisible();
  expect(calls.some((c) => c.path === `${O}/vehicles`)).toBe(false);
  expect(calls.some((c) => c.path.endsWith("/journeys"))).toBe(false);
});
test("SaaS administration omits technician commissioning controls", async ({
  page,
}) => {
  await setup(page, { platform: "admin" });
  await page.goto("/#/platform/devices");
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  await expect(
    page.getByText("Request private commissioning configuration"),
  ).toHaveCount(0);
});
test("personal preferences and dependencies remain absent while extended DTC scan and push configuration are properly gated", async ({
  page,
}) => {
  let speed = 42;
  const calls = await setup(page, {
    permissions: [
      ...all,
      "profile.own",
      "diagnostics.run",
      "device_config.publish",
    ],
    custom: async (route, url) => {
      if (url.pathname.endsWith("/latest-state")) {
        await send(route, {
          sample: { speed_kmh: speed, occurred_at: "2026-11-18T00:00:00Z" },
          freshness: "recent_packet",
        });
        return true;
      }
      if (
        url.pathname === `${O}/vehicles/${VEHICLE}/extended-dtc` &&
        route.request().method() === "POST"
      ) {
        await send(route, { command_id: "cmd-dtc-1", state: "pending" }, 202);
        return true;
      }
      if (
        url.pathname === `${O}/vehicles/${VEHICLE}/configuration` &&
        route.request().method() === "POST"
      ) {
        await send(route, { command_id: "cmd-cfg-1" }, 202);
        return true;
      }
      if (url.pathname.startsWith(`${O}/device-commands/`)) {
        const id = url.pathname.split("/").pop();
        await send(route, {
          command: {
            id,
            vehicle_id: VEHICLE,
            kind: id === "cmd-dtc-1" ? "extended_dtc" : "configuration",
            state: "pending",
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/settings`);
  await expect(
    page.getByRole("button", { name: "Edit settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Personal delivery preferences" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("menuitem", { name: /Dependencies/ }),
  ).toHaveCount(0);
  expect(calls.some((c) => /notification-preferences/.test(c.path))).toBe(
    false,
  );

  // Speed = 42 km/h: Run extended DTC scan stays disabled even if ack is checked
  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page
    .getByRole("tab", { name: "Device & diagnostics", exact: true })
    .click();
  await expect(
    page.getByText("Fault code explanation", { exact: true }),
  ).toBeVisible();
  const ackCheckbox = page.getByRole("checkbox", {
    name: /confirm the vehicle is parked at 0 km\/h/i,
  });
  const runScanBtn = page.getByRole("button", {
    name: "Run extended DTC scan",
  });
  await expect(runScanBtn).toBeDisabled();
  await ackCheckbox.check();
  await expect(runScanBtn).toBeDisabled();
  expect(calls.some((c) => c.path.endsWith("/extended-dtc"))).toBe(false);

  // Speed = 0 km/h: gated on acknowledgment checkbox, then fires POST .../extended-dtc
  speed = 0;
  await page.reload();
  await page
    .getByRole("tab", { name: "Device & diagnostics", exact: true })
    .click();
  await expect(runScanBtn).toBeDisabled();
  await ackCheckbox.check();
  await expect(runScanBtn).toBeEnabled();
  await runScanBtn.click();
  await expect(page.getByText("cmd-dtc-1").first()).toBeVisible();
  expect(
    calls.find((c) => c.path.endsWith("/extended-dtc") && c.method === "POST")
      ?.body,
  ).toEqual({ acknowledge_interruption: true });

  // Push device configuration fires POST .../configuration after confirmation
  await page
    .getByRole("button", { name: "Push device configuration", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm action" }).click();
  await expect(page.getByText("cmd-cfg-1").first()).toBeVisible();
  expect(
    calls.some((c) => c.path.endsWith("/configuration") && c.method === "POST"),
  ).toBe(true);
});

test("driver my/score fetches score when safety is enabled and is blocked when disabled", async ({
  page,
}) => {
  let safetyEnabled = true;
  const calls = await setup(page, {
    permissions: ["profile.own", "notifications.own", "subscription.read"],
    custom: async (route, url) => {
      if (url.pathname.endsWith("/subscription")) {
        await send(route, {
          subscription: {
            status: "active",
            plan_snapshot: {
              safety_enabled: safetyEnabled,
              cellular_enabled: true,
              telemetry_min_seconds: 5,
            },
          },
          access_active: true,
          usage: { vehicles: 1, drivers: 1 },
        });
        return true;
      }
      if (url.pathname.endsWith("/driver/me/profile")) {
        await send(route, {
          driver: { id: "own-driver", name: "Own synthetic driver" },
        });
        return true;
      }
      if (url.pathname.endsWith("/driver/me/score")) {
        await send(route, {
          score: 95,
          events_included: 1,
          observed_speed_samples: 120,
          eligible_speed_intervals: 110,
          algorithm: "experimental_100_minus_5_per_observation_v1",
          quality: "uncalibrated_not_distance_normalized",
          from: "2026-10-19T00:00:00Z",
          to: "2026-11-18T00:00:00Z",
          approved_appeals_excluded: true,
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/my/score`);
  await expect(page.getByText("95")).toBeVisible();
  await expect(
    page.getByText("experimental_100_minus_5_per_observation_v1"),
  ).toBeVisible();
  expect(calls.some((c) => c.path.endsWith("/driver/me/score"))).toBe(true);

  const callsBeforeDisable = calls.length;
  safetyEnabled = false;
  await page.reload();
  await expect(
    page.getByText("Workspace unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /My safety score/ }),
  ).toHaveCount(0);
  expect(
    calls
      .slice(callsBeforeDisable)
      .some((c) => c.path.endsWith("/driver/me/score")),
  ).toBe(false);
});

test("fleet overview operational context, platform subscribers status column, and sidebar collapse stay unclipped", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  await page.goto(`/#/organization/${ORG}/dashboard`);
  const contextCard = page.locator(".ant-card").filter({
    hasText: "Operational context",
  });
  await expect(contextCard).toBeVisible();
  const statBoxes = contextCard.locator(".ant-statistic");
  await expect(statBoxes).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const box = await statBoxes.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(85);
  }

  // Collapse desktop sidebar and confirm brand & toggle button stay clean
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect(page.locator(".desktop-sidebar")).toHaveClass(
    /ant-layout-sider-collapsed/,
  );
  await expect(async () => {
    const siderBox = await page.locator(".desktop-sidebar").boundingBox();
    expect(siderBox).not.toBeNull();
    expect(siderBox!.width).toBeLessThanOrEqual(84);
  }).toPass();
  await expect(page.locator(".desktop-sidebar .brand")).toBeVisible();
  await expect(page.locator(".desktop-sidebar .collapse-button")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("platform subscribers status column is readable and unclipped", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page, {
    platform: "admin",
    custom: async (route, url) => {
      if (url.pathname === "/api/v1/platform/subscriptions") {
        await send(route, {
          items: [
            {
              organization_id: ORG,
              organization_name: "Synthetic Fleet A",
              plan_snapshot: {
                name: "Pro Fleet",
                vehicle_limit: 50,
                driver_limit: 50,
                retention_days: 180,
                telemetry_min_seconds: 2,
              },
              status: "active",
              access_active: true,
              expires_at: "2026-12-31T00:00:00Z",
              version: 1,
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto("/#/platform/subscribers");
  await expect(
    page.getByText("Pro Fleet · 50V / 50D · 180d · 2s"),
  ).toBeVisible();
  const statusTag = page
    .locator(".ant-table-tbody .ant-tag")
    .filter({ hasText: "Active" })
    .first();
  await expect(statusTag).toBeVisible();
  const statusBox = await statusTag.boundingBox();
  expect(statusBox).not.toBeNull();
  expect(statusBox!.x + statusBox!.width).toBeLessThanOrEqual(1440);
});
test("maintenance threshold editor works under the compiled CSP", async ({
  page,
}) => {
  await setup(page);
  await page.goto(`/#/organization/${ORG}/maintenance`);
  await page.getByRole("tab", { name: "Maintenance plans" }).click();
  await page.getByRole("button", { name: "Create maintenance plan" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add threshold" }).click();
  await expect(page.getByLabel("Threshold key")).toBeVisible();
  expect(await page.evaluate(() => (window as any).__cspViolations)).toEqual(
    [],
  );
});
test("settings, switches, selects and date popups work under the compiled CSP", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/compliance-obligations`) {
        await send(route, {
          items: [
            {
              id: OTHER,
              compliance_type_name: "Road Tax",
              registration_number: "SYNTHETIC-1",
              subject_type: "vehicle",
              subject_name: "SYNTHETIC-1",
              applicability: "required",
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `${O}/compliance-obligations/${OTHER}`) {
        await send(route, {
          id: OTHER,
          compliance_type_name: "Road Tax",
          registration_number: "SYNTHETIC-1",
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/settings`);
  await page
    .getByRole("button", { name: "Edit settings", exact: true })
    .click();
  await expect(page.getByLabel("Daily email hour")).toHaveValue("08:00");
  await page.getByLabel("Daily email hour").click();
  await expect(page.locator(".ant-picker-dropdown:visible")).toBeVisible();
  await page
    .locator(".ant-picker-dropdown:visible .ant-picker-time-panel-cell")
    .filter({ hasText: /^10$/ })
    .click();
  await expect(page.getByLabel("Daily email hour")).toHaveValue("10:00");
  await page.getByLabel(/Telemetry interval.*seconds/i).click();
  await expect(page.locator(".ant-picker-dropdown:visible")).toHaveCount(0);
  await expect(page.locator(".slider-number-field .ant-slider")).toBeVisible();
  await expect(page.getByLabel(/Telemetry interval.*seconds/i)).toBeVisible();
  await page
    .locator(".ant-form-item")
    .filter({ hasText: "Harsh braking threshold (m/s²)" })
    .locator(".ant-form-item-tooltip")
    .hover();
  await expect(page.getByRole("tooltip")).toContainText("10.8 km/h");
  expect(await page.evaluate(() => (window as any).__cspViolations)).toEqual(
    [],
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page.getByRole("tab", { name: "Telemetry", exact: true }).click();
  await page.locator(".ant-picker-input input").first().click();
  await expect(page.locator(".ant-picker-dropdown:visible")).toBeVisible();
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await page.getByRole("button", { name: /Add record$/ }).click();
  await page.getByLabel(/Model Year/i).click();
  await expect(
    page.locator(".ant-picker-dropdown:visible .ant-picker-year-panel"),
  ).toBeVisible();
  await page.goto(`/#/organization/${ORG}/compliance`);
  await page.getByRole("tab", { name: "Obligations", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect / renew", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record pending renewal", exact: true })
    .click();
  await page
    .locator(".ant-form-item")
    .filter({ hasText: "Valid From" })
    .locator(".ant-picker-input")
    .click();
  await expect(page.locator(".ant-picker-dropdown:visible")).toBeVisible();
  expect(await page.locator("style").count()).toBe(0);
  expect(await page.evaluate(() => (window as any).__cspViolations)).toEqual(
    [],
  );
});
for (const width of [320, 390, 768, 1440]) {
  test(`responsive compiled shell at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page);
    await page.goto(`/#/organization/${ORG}/vehicles`);
    await expect(page.getByText("SYNTHETIC-1")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add record" })).toHaveCSS(
      "background-color",
      "rgb(22, 119, 255)",
    );
    await expect(page.getByRole("button", { name: "Add record" })).toHaveCSS(
      "height",
      "32px",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width < 900) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(
        page.getByRole("menuitem", { name: /Vehicles$/ }).last(),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath("mobile-navigation.png"),
        fullPage: true,
        animations: "disabled",
      });
      await page.keyboard.press("Escape");
      await expect(page.locator(".ant-drawer-content-wrapper")).toBeHidden();
    }
    expect(await page.evaluate(() => (window as any).__cspViolations)).toEqual(
      [],
    );
    expect(await page.locator("style").count()).toBe(0);
    await page.screenshot({
      path: testInfo.outputPath("compiled-shell.png"),
      fullPage: true,
      animations: "disabled",
    });
  });
}
test("organization switching aborts a slow old-scope refresh and clears its rows", async ({
  page,
}) => {
  let reads = 0;
  let held!: Route;
  let received!: () => void;
  const waiting = new Promise<void>((resolve) => {
    received = resolve;
  });
  await setup(page, {
    twoOrgs: true,
    permissions: ["vehicles.read"],
    custom: async (route, url) => {
      if (url.pathname === `${O}/vehicles`) {
        if (++reads === 2) {
          held = route;
          received();
          return true;
        }
        await send(route, {
          items: [{ id: VEHICLE, registration_number: "ONLY-FLEET-A" }],
        });
        return true;
      }
      if (url.pathname === `/api/v1/organizations/${OTHER}/vehicles`) {
        await send(route, {
          items: [{ id: OTHER, registration_number: "ONLY-FLEET-B" }],
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await expect(page.getByText("ONLY-FLEET-A")).toBeVisible();
  await page.getByRole("button", { name: /Refresh$/ }).click();
  await waiting;
  await page
    .getByRole("combobox", { name: "Organization", exact: true })
    .click();
  await page.getByText("Synthetic Fleet B", { exact: true }).click();
  await expect(page.getByText("ONLY-FLEET-B")).toBeVisible();
  await send(held, {
    items: [{ id: VEHICLE, registration_number: "LATE-PRIVATE-FLEET-A" }],
  }).catch(() => {});
  await expect(page.getByText("ONLY-FLEET-A")).toHaveCount(0);
  await expect(page.getByText("LATE-PRIVATE-FLEET-A")).toHaveCount(0);
});
test("permission revocation on focus removes the current record and draft", async ({
  page,
}) => {
  const options: Options = { permissions: ["vehicles.read", "vehicles.write"] };
  await setup(page, options);
  await page.goto(`/#/organization/${ORG}/vehicles`);
  await page.getByRole("button", { name: "Add record" }).click();
  await page
    .getByLabel("Registration number", { exact: true })
    .fill("PRIVATE-DRAFT");
  options.permissions = [];
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Workspace unavailable")).toBeVisible();
  await expect(
    page.getByLabel("Registration number", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("SYNTHETIC-1")).toHaveCount(0);
});
test("invoice reconciliation restores a transient checkout and keeps suspension after settlement", async ({
  page,
}) => {
  let settled = false;
  const invoice = {
    id: VEHICLE,
    status: "issued",
    amount_minor: 101,
    currency: "MYR",
    version: 1,
    payment_id: OTHER,
    plan_snapshot: { name: "Purchased fixture plan" },
  };
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/subscription`) {
        await send(route, {
          subscription: { status: "suspended", plan_snapshot: {} },
          access_active: false,
          usage: {},
        });
        return true;
      }
      if (url.pathname === `${O}/invoices`) {
        await send(route, { items: [invoice] });
        return true;
      }
      if (url.pathname === `${O}/invoices/${VEHICLE}`) {
        await send(route, {
          invoice: { ...invoice, status: settled ? "paid" : "issued" },
        });
        return true;
      }
      if (url.pathname === `${O}/payments/${OTHER}`) {
        await send(route, {
          payment: {
            id: OTHER,
            amount: "1.01",
            status: settled ? "succeeded" : "pending",
            payment_url: settled
              ? null
              : "https://gateway.samsam123.name.my/pay/synthetic-private",
            expires_at: "2099-01-01T00:00:00Z",
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/billing`);
  await page.getByRole("button", { name: "Inspect invoice" }).click();
  await expect(
    page.getByRole("link", { name: "Open secure checkout" }),
  ).toHaveAttribute(
    "href",
    "https://gateway.samsam123.name.my/pay/synthetic-private",
  );
  await expect(
    page.getByRole("button", { name: "Request checkout" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  settled = true;
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(page.getByText("Succeeded", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open secure checkout" }),
  ).toHaveCount(0);
  await expect(page.getByText("Suspended", { exact: true })).toBeVisible();
  expect(calls.filter((c) => c.method !== "GET")).toHaveLength(0);
});
for (const failureKind of ["HTTP 503", "malformed HTTP 200"] as const) {
  test(`uncertain maintenance completion preserves exactly the same idempotency key (${failureKind})`, async ({
    page,
  }) => {
    const calls = await setup(page, {
      custom: async (route, url) => {
        if (url.pathname === `${O}/maintenance/work-orders`) {
          await send(route, {
            items: [
              {
                id: VEHICLE,
                number: "WO-SYNTHETIC",
                status: "in_progress",
                version: 1,
              },
            ],
          });
          return true;
        }
        if (url.pathname === `${O}/maintenance/work-orders/${VEHICLE}`) {
          await send(route, {
            order: {
              id: VEHICLE,
              number: "WO-SYNTHETIC",
              status: "in_progress",
              version: 1,
              workshop_name: "Synthetic workshop",
            },
            items: [{ id: OTHER, assignment_id: OTHER, status: "pending" }],
          });
          return true;
        }
        if (url.pathname.endsWith("/complete")) {
          await failMutation(route, failureKind);
          return true;
        }
        return false;
      },
    });
    await page.goto(`/#/organization/${ORG}/maintenance`);
    await page.getByRole("button", { name: "Open order" }).click();
    await expect(page.getByText("B08", { exact: false })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Upload securely", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Complete selected items" }).click();
    await page.getByLabel(/Performed At/i).fill("2026-11-18T08:00:00+08:00");
    await page.getByLabel(/Performed At/i).press("Enter");
    await page.getByLabel(/Odometer Km/i).fill("100");
    await page
      .getByLabel(/Odometer Source/i)
      .fill("Observed workshop odometer");
    await page.getByLabel(/Completed Item Ids/i).click();
    await page
      .getByText(`Item ${OTHER} · assignment ${OTHER}`, { exact: true })
      .click();
    await page.keyboard.press("Escape");
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "Review & save" }).click();
      await page.getByRole("button", { name: "Confirm action" }).click();
      await expect(
        page.getByRole("button", { name: "Confirm action" }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Outcome uncertain — reconcile before retrying"),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Review & save" }),
      ).not.toHaveClass(/ant-btn-loading/);
    }
    const writes = calls.filter((c) => c.path.endsWith("/complete"));
    expect(writes).toHaveLength(2);
    expect((writes[0].body as Record<string, unknown>).performed_at).toBe(
      "2026-11-18T08:00:00+08:00",
    );
    expect(writes[0].headers["idempotency-key"]).toBe(
      writes[1].headers["idempotency-key"],
    );
    expect(writes[0].body).toEqual(writes[1].body);
    await page.getByLabel(/Odometer Km/i).fill("200");
    await page.getByRole("button", { name: "Review & save" }).click();
    await page.getByRole("button", { name: "Confirm action" }).click();
    await expect(
      page.getByText("The previous outcome is uncertain.", { exact: false }),
    ).toBeVisible();
    expect(calls.filter((c) => c.path.endsWith("/complete"))).toHaveLength(2);
  });
}
test("pending compliance history does not expose suspension or imply verified coverage", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/compliance/status`) {
        await send(route, {
          items: [
            {
              obligation_id: OTHER,
              vehicle_id: VEHICLE,
              record_id: VEHICLE,
              status: "unknown",
            },
          ],
        });
        return true;
      }
      if (url.pathname.endsWith(`/compliance-records/${VEHICLE}/history`)) {
        await send(route, {
          records: [
            {
              id: VEHICLE,
              cycle_number: 1,
              state: "pending",
              valid_from: "2026-11-18",
              expires_on: "2027-11-18",
            },
          ],
          events: [],
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/compliance`);
  await page.getByRole("button", { name: "Evidence & history" }).click();
  await expect(page.getByText("Pending", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Suspend verified record" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Verify reviewed evidence" }),
  ).toHaveCount(0);
});
for (const failureKind of ["HTTP 503", "malformed HTTP 200"] as const) {
  test(`private link issuance errors and upload failures show handled errors without leaks (${failureKind})`, async ({
    page,
  }) => {
    const calls = await setup(page, {
      custom: async (route, url) => {
        if (url.pathname === `${O}/files`) {
          if (route.request().method() === "POST")
            await failMutation(route, failureKind);
          else
            await send(route, {
              items: [
                {
                  id: OTHER,
                  filename: "Synthetic evidence.pdf",
                  mime_type: "application/pdf",
                  purpose: "document",
                  version: 1,
                },
              ],
            });
          return true;
        }
        if (url.pathname.endsWith(`/files/${OTHER}/link`)) {
          await send(route, {}, 403);
          return true;
        }
        return false;
      },
    });
    await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
    await page.getByRole("tab", { name: "Attachments", exact: true }).click();
    await page.getByRole("button", { name: "Download", exact: true }).click();
    await expect(
      page.getByText("Request could not complete (403)"),
    ).toBeVisible();
    await page.locator("input[type=file]").setInputFiles({
      name: "fixture.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-synthetic-test-only"),
    });
    await page.getByRole("button", { name: "Upload securely" }).click();
    await expect(
      page.getByText("Files are not antivirus-scanned.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("scans it before private storage", { exact: false }),
    ).toHaveCount(0);
    const confirmation = page.getByRole("dialog", {
      name: "Upload private evidence",
    });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "OK", exact: true }).click();
    await expect(confirmation).toBeHidden();
    await expect(
      page.getByText("Outcome uncertain — reconcile before retrying"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload securely" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Download", exact: true }).click();
    await expect(
      page.getByText("Request could not complete (403)"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload securely" }),
    ).toBeDisabled();
    await page.locator("input[type=file]").setInputFiles({
      name: "replacement-fixture.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-changed-synthetic-test-only"),
    });
    await expect(
      page.getByRole("button", { name: "Upload securely" }),
    ).toBeDisabled();
    expect(
      calls.filter((c) => c.path === `${O}/files` && c.method === "POST"),
    ).toHaveLength(1);
    expect(
      calls.find((c) => c.path === `${O}/files` && c.method === "POST")?.body,
    ).toMatchObject({
      target_type: "vehicle",
      target_id: VEHICLE,
      content_base64: Buffer.from("%PDF-synthetic-test-only").toString(
        "base64",
      ),
    });
    expect(
      calls.filter((c) => c.path.endsWith(`/files/${OTHER}/content`)),
    ).toHaveLength(0);
    expect(await page.evaluate(() => document.body.textContent)).not.toContain(
      "synthetic-private-signature",
    );
  });
}
test("downloads expose an explicit S3 bearer anchor and previews load directly without a PHP byte proxy", async ({
  page,
}) => {
  await page.clock.install();
  const pdf = signedFileLink(),
    image = signedFileLink("png");
  const s3Requests: string[] = [];
  await page.route(
    "https://*.s3.ap-southeast-1.amazonaws.com/**",
    async (route) => {
      s3Requests.push(route.request().url());
      expect(route.request().headers().referer).toBeUndefined();
      expect(route.request().headers().cookie).toBeUndefined();
      await route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
          "base64",
        ),
      });
    },
  );
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/files`) {
        await send(route, {
          items: [
            {
              id: OTHER,
              filename: "Fixture.pdf",
              mime_type: "application/pdf",
              version: 1,
            },
            {
              id: ORG,
              filename: "Fixture.png",
              mime_type: "image/png",
              version: 1,
            },
          ],
        });
        return true;
      }
      if (url.pathname.endsWith(`/files/${OTHER}/link`)) {
        await send(route, { link: pdf });
        return true;
      }
      if (url.pathname.endsWith(`/files/${ORG}/link`)) {
        await send(route, { link: image });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page.getByRole("tab", { name: "Attachments", exact: true }).click();
  await page
    .getByRole("button", { name: "Download", exact: true })
    .first()
    .click();
  const anchor = page.getByRole("link", { name: "Open S3 download" });
  await expect(anchor).toHaveAttribute("href", pdf.url);
  await expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  await expect(anchor).toHaveAttribute("referrerpolicy", "no-referrer");
  expect(s3Requests).toHaveLength(0); // Issuance is not a download and never fetches bytes.
  await page.getByRole("button", { name: "View image", exact: true }).click();
  await expect(
    page.getByAltText("Authorized private attachment"),
  ).toHaveAttribute("src", image.url);
  await expect.poll(() => s3Requests.length).toBe(1);
  expect(calls.filter((c) => c.path.endsWith("/content"))).toHaveLength(0);
  expect(
    await page.evaluate(
      () =>
        JSON.stringify({ ...localStorage }) +
        JSON.stringify({ ...sessionStorage }),
    ),
  ).not.toContain("X-Amz-Signature");
  await page.clock.fastForward(301000);
  await expect(anchor).toHaveCount(0);
  await expect(page.getByAltText("Authorized private attachment")).toHaveCount(
    0,
  );
});
test("driver photo rejects an untrusted URL, then previews S3 directly and clears on driver change", async ({
  page,
}) => {
  const image = signedFileLink("png");
  let issues = 0,
    reads = 0;
  await page.route(
    "https://*.s3.ap-southeast-1.amazonaws.com/**",
    async (route) => {
      reads++;
      expect(route.request().headers().referer).toBeUndefined();
      expect(route.request().headers().cookie).toBeUndefined();
      await route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
          "base64",
        ),
      });
    },
  );
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/drivers/${OTHER}/photo`) {
        await send(route, {
          link:
            ++issues === 1
              ? {
                  ...image,
                  url: image.url.replace(
                    "private-test-bucket.s3.ap-southeast-1.amazonaws.com",
                    "untrusted.test",
                  ),
                }
              : image,
        });
        return true;
      }
      if (
        url.pathname === `${O}/drivers/${OTHER}` ||
        url.pathname === `${O}/drivers/${VEHICLE}`
      ) {
        await send(route, {
          item: {
            id: url.pathname.endsWith(OTHER) ? OTHER : VEHICLE,
            name: "Fixture driver",
            version: 1,
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/drivers/${OTHER}`);
  await page.getByRole("button", { name: "Request authorized photo" }).click();
  await expect(
    page.getByText("Unsupported private file link.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByAltText("Private driver photograph")).toHaveCount(0);
  expect(reads).toBe(0);
  await page.getByRole("button", { name: "Request authorized photo" }).click();
  await expect(page.getByAltText("Private driver photograph")).toHaveAttribute(
    "src",
    image.url,
  );
  await expect.poll(() => reads).toBe(1);
  await page.goto(`/#/organization/${ORG}/drivers/${VEHICLE}`);
  await expect(page.getByAltText("Private driver photograph")).toHaveCount(0);
  expect(calls.filter((c) => c.path.endsWith("/content"))).toHaveLength(0);
});
test("DTC explanation is transient and destroyed when its tab closes", async ({
  page,
}) => {
  const calls = await setup(page, {
    custom: async (route, url) => {
      if (url.pathname.endsWith("/dtc-ai")) {
        await send(route, {
          code: "P0730",
          component: "Synthetic test advisory",
          description: "TRANSIENT-PRIVATE-ADVISORY",
          possible_solution: "Synthetic fixture only",
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page.getByRole("tab", { name: "Device & diagnostics" }).click();
  await page.getByLabel("DTC code").fill("p0730");
  await page.getByRole("button", { name: "Explain once" }).click();
  await expect(page.getByText("TRANSIENT-PRIVATE-ADVISORY")).toBeVisible();
  await expect(page.getByLabel("DTC code")).toHaveValue("");
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await page.getByRole("tab", { name: "Device & diagnostics" }).click();
  await expect(page.getByText("TRANSIENT-PRIVATE-ADVISORY")).toHaveCount(0);
  expect(calls.find((c) => c.path.endsWith("/dtc-ai"))?.body).toEqual({
    code: "P0730",
  });
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
test("fleet overview renders interactive Leaflet OpenStreetMap markers and popups", async ({
  page,
}) => {
  const tileReferers: (string | undefined)[] = [];
  await page.route("https://*.tile.openstreetmap.org/**", async (route) => {
    tileReferers.push(route.request().headers()["referer"]);
    await route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  });
  await page.route("https://tile.openstreetmap.org/**", async (route) => {
    tileReferers.push(route.request().headers()["referer"]);
    await route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  });
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/fleet-states`) {
        await send(route, {
          items: [
            {
              id: VEHICLE,
              registration_number: "VFR7550",
              make: "Perodua",
              model: "Alza",
              status: "active",
              occurred_at: "2026-11-18T14:50:00Z",
              speed_kmh: 58,
              latitude: 3.139,
              longitude: 101.6869,
              freshness: "recent_packet",
              has_fault_code: false,
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto(`/#/organization/${ORG}/dashboard`);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect.poll(() => tileReferers.length).toBeGreaterThan(0);
  expect(tileReferers.every((ref) => ref === "http://127.0.0.1:4173/")).toBe(
    true,
  );
  await expect(page.locator(".map-stage")).toHaveClass(/theme-clean/);
  await page.getByText("Slate", { exact: true }).click();
  await expect(page.locator(".map-stage")).toHaveClass(/theme-slate/);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.getByText("Ant Light", { exact: true }).click();
  await expect(page.locator(".map-stage")).toHaveClass(/theme-clean/);
  await expect(page.locator(".carlink-pin")).toHaveCount(1);
  await page.locator(".carlink-pin").first().click({ force: true });
  await expect(page.locator(".carlink-popup")).toContainText("VFR7550");
  await expect(page.locator(".carlink-popup")).toContainText("58 km/h");
  expect(
    await page.evaluate(() => (window as any).__cspViolations || []),
  ).toEqual([]);
});
for (const role of ["technician", "admin"] as const) {
  test(`${role} device views display linked vehicle when API returns nested vehicle object`, async ({
    page,
  }) => {
    const deviceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    await setup(page, {
      platform: role,
      custom: async (route, url) => {
        if (url.pathname === "/api/v1/platform/devices") {
          await send(route, {
            items: [
              {
                id: deviceId,
                organization_id: ORG,
                organization_name: "CrabCar",
                status: "active",
                version: 2,
                vehicle_id: VEHICLE,
                vehicle: {
                  id: VEHICLE,
                  registration_number: "VFR7550",
                  make: "Perodua",
                  model: "Alza",
                },
              },
            ],
            pagination: { next_cursor: null },
          });
          return true;
        }
        if (url.pathname === `/api/v1/platform/devices/${deviceId}`) {
          await send(route, {
            device: {
              id: deviceId,
              organization_id: ORG,
              organization_name: "CrabCar",
              status: "active",
              version: 2,
              online: true,
              vehicle: {
                id: VEHICLE,
                registration_number: "VFR7550",
                make: "Perodua",
                model: "Alza",
              },
            },
          });
          return true;
        }
        return false;
      },
    });
    await page.goto(
      role === "technician" ? "/#/technician/devices" : "/#/platform/devices",
    );
    await expect(
      page.getByText("VFR7550", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("Unlinked")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: role === "technician" ? "Installation setup" : "Inspect / link",
      })
      .first()
      .click();
    await expect(page.getByText("VFR7550 · Perodua Alza")).toBeVisible();
  });
}
test("landing page renders editorial 6-chapter scrollytelling, interactive fleet preview, mobile drawer, and responsive viewports without CSP violations", async ({
  page,
}) => {
  await setup(page, { authenticated: false });
  await page.goto("/#/");
  await expect(page.locator("main h1")).toContainText(
    "Know where every vehicle is, and how it's driven.",
  );

  // All 6 route-notebook chapters exist seamlessly in one continuous story
  await expect(
    page.getByRole("heading", { name: "Driver taps in" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Route traced" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Health and fuel, live" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Whole fleet, one screen" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Start with one vehicle today.",
    }),
  ).toBeVisible();

  // Scroll-linked active chapter updates as the user scrolls through the story
  const root = page.locator(".carlink-landing");
  await expect(root).toHaveAttribute("data-active-chapter", "1");
  await page.locator("#chapter-4").scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-active-chapter", /[345]/);

  // Interactive Chapter 5 CarLink Fleet Interface Preview
  await page.locator("#chapter-5").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /BQA 9104/ }).click();
  await expect(page.getByRole("button", { name: /BQA 9104/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Telemetry & safety" }).click();
  await expect(page.getByText("Clear · No fault")).toBeVisible();
  await page.getByRole("button", { name: "Compliance & service" }).click();
  await expect(page.getByText("PUSPAKOM inspection")).toBeVisible();
  await page.getByRole("button", { name: "Live fleet & routes" }).click();
  await expect(page.getByText("Route colour by speed")).toBeVisible();

  // Responsive overflow check across desktop, tablet, and compact mobile
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }

  // Mobile drawer opens and closes cleanly
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.locator(".ant-drawer-content-wrapper")).toBeVisible();
  await page
    .locator(".ant-drawer-content-wrapper")
    .getByRole("button", { name: "Telemetry" })
    .click();
  await expect(page.locator(".ant-drawer-content-wrapper")).toBeHidden();

  expect(await page.locator("style").count()).toBe(0);
  expect(
    await page.evaluate(() => (window as any).__cspViolations || []),
  ).toEqual([]);
});

test("vehicle location and journeys plot speed-colored routes, small dots, and harsh braking/acceleration danger markers", async ({
  page,
}) => {
  await page.route("https://*.tile.openstreetmap.org/**", async (route) => {
    await route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  });
  await page.route("https://tile.openstreetmap.org/**", async (route) => {
    await route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  });

  const now = new Date();
  const t0 = new Date(now.getTime() - 120_000).toISOString();
  const t1 = new Date(now.getTime() - 90_000).toISOString();
  const t2 = new Date(now.getTime() - 60_000).toISOString();
  const journeyId = "44444444-4444-4444-8444-444444444444";

  await setup(page, {
    permissions: [...all, "journeys.read"],
    custom: async (route, url) => {
      if (url.pathname === `${O}/vehicles/${VEHICLE}`) {
        await send(route, {
          item: {
            id: VEHICLE,
            registration_number: "VFR7550",
            make: "Perodua",
            model: "Alza",
            status: "active",
            version: 1,
          },
          device: null,
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/latest-state`) {
        await send(route, { freshness: "recent_packet", sample: null });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/diagnostics`) {
        await send(route, { status: "ok" });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/positions`) {
        await send(route, {
          items: [
            {
              id: "p1",
              occurred_at: t0,
              position_observed_at: t0,
              latitude: 3.139,
              longitude: 101.6869,
              speed_kmh: 22,
              engine_rpm: 1500,
            },
            {
              id: "p2",
              occurred_at: t1,
              position_observed_at: t1,
              latitude: 3.1402,
              longitude: 101.6881,
              speed_kmh: 72,
              engine_rpm: 2800,
            },
            {
              id: "p3",
              occurred_at: t2,
              position_observed_at: t2,
              latitude: 3.1415,
              longitude: 101.6895,
              speed_kmh: 18,
              engine_rpm: 1200,
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/telemetry`) {
        await send(route, {
          items: [
            {
              id: "p1",
              occurred_at: t0,
              latitude: 3.139,
              longitude: 101.6869,
              speed_kmh: 22,
              engine_rpm: 1500,
              behaviour_data: {
                harsh_braking: false,
                rapid_acceleration: true,
                acceleration: { y_mps2: 3.5 },
              },
            },
            {
              id: "p2",
              occurred_at: t1,
              latitude: 3.1402,
              longitude: 101.6881,
              speed_kmh: 72,
              engine_rpm: 2800,
              behaviour_data: {
                harsh_braking: false,
                rapid_acceleration: false,
              },
            },
            {
              id: "p3",
              occurred_at: t2,
              latitude: 3.1415,
              longitude: 101.6895,
              speed_kmh: 18,
              engine_rpm: 1200,
              behaviour_data: {
                harsh_braking: false,
                rapid_acceleration: false,
              },
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `${O}/safety-events`) {
        await send(route, {
          items: [
            {
              id: "sev-1",
              vehicle_id: VEHICLE,
              end_sample_id: "p3",
              kind: "harsh_braking",
              acceleration_ms2: -4.2,
              threshold_ms2: 3.0,
              state: "observed",
              occurred_at: t2,
            },
          ],
          pagination: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `${O}/journeys`) {
        await send(route, {
          items: [
            {
              id: journeyId,
              vehicle_id: VEHICLE,
              state: "completed",
              started_at: t0,
              ended_at: t2,
              last_observed_at: t2,
              unknown_seconds: 0,
              distance_quality: "valid",
            },
          ],
        });
        return true;
      }
      if (url.pathname === `${O}/journeys/${journeyId}`) {
        await send(route, {
          journey: {
            id: journeyId,
            vehicle_id: VEHICLE,
            state: "completed",
            started_at: t0,
            ended_at: t2,
            last_observed_at: t2,
            unknown_seconds: 0,
            distance_quality: "valid",
          },
        });
        return true;
      }
      return false;
    },
  });

  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page.getByRole("tab", { name: "Location" }).click();

  await expect(
    page.getByText("Route Speed & Harsh Driving Summary"),
  ).toBeVisible();
  await expect(
    page.getByText("Harsh Braking & Acceleration Moments"),
  ).toBeVisible();
  await expect(page.locator(".carlink-pin.carlink-danger")).toHaveCount(2);
  await expect(page.locator(".carlink-pin.carlink-dot")).toHaveCount(1);

  await page.getByRole("button", { name: "Locate danger" }).first().click();
  await expect(page.locator(".carlink-popup-danger")).toBeVisible();

  await page.getByRole("tab", { name: "Journeys" }).click();
  await expect(page.getByText("1 Harsh braking")).toBeVisible();
  await page.getByRole("button", { name: "Inspect journey" }).click();
  await expect(
    page.getByText("Automatic journey — Speed & Harsh Driving Route"),
  ).toBeVisible();
  await expect(
    page.getByText("Harsh Braking & Acceleration in This Journey"),
  ).toBeVisible();
  await expect(
    page.locator(".ant-drawer-body .carlink-pin.carlink-danger"),
  ).toHaveCount(2);
});

test("supports runtime 4-language switching (en, ms, zh, ta) and user-friendly technical telemetry labels with original-field tooltips", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/vehicles/${VEHICLE}`) {
        await send(route, {
          item: {
            id: VEHICLE,
            registration_number: "VFR7550",
            make: "Perodua",
            model: "Alza",
            status: "active",
            version: 1,
          },
          device: null,
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/latest-state`) {
        await send(route, {
          freshness: "recent_packet",
          sample: {
            id: "s-live-1",
            occurred_at: "2026-11-20T01:00:00Z",
            vehicle_data: {
              mil_on: null,
              has_dtc_fault: false,
              calculated_fuel_consumption: {
                rateLph: 0.5523,
                rateSource: "maf",
                instantL100km: null,
                totalLitres: 0.048858,
                distanceKm: 0,
                averageL100km: null,
                averageKmPerL: 0,
              },
            },
          },
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/diagnostics`) {
        await send(route, { status: "ok" });
        return true;
      }
      return false;
    },
  });

  // Public landing allows switching language including Tamil (and keeps mobile 320px overflow-free)
  await page.goto("/#/");
  const publicLang = page.locator(".cl-desktop-cta").getByLabel("Language");
  await publicLang.click();
  await page.getByTitle("தமிழ்", { exact: true }).click();
  await expect(
    page.getByText("ஒவ்வொரு பயணமும் ஒரு கதையைச் சொல்கிறது."),
  ).toBeVisible();
  await expect(page.locator(".ant-select-dropdown:visible")).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator(".cl-desktop-cta").getByLabel("மொழி").click();
  await page.getByTitle("EN", { exact: true }).click();
  await expect(page.locator(".ant-select-dropdown:visible")).toHaveCount(0);

  // Vehicle Overview shows friendly fuel & DTC terms + original field tooltip, and updates live across all 4 languages
  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await expect(page.getByText("Check Engine Light (MIL)")).toBeVisible();
  await expect(
    page.getByText("Diagnostic Trouble Code (DTC) Fault"),
  ).toBeVisible();
  await expect(page.getByText("Calculated Fuel Consumption")).toBeVisible();
  await expect(page.getByText("Fuel Litres per Hour (L/h)")).toBeVisible();
  await expect(page.getByText("Fuel Calculation Method")).toBeVisible();
  await expect(page.getByText("Total Fuel Consumed (L)")).toBeVisible();
  await expect(page.getByText("Distance Travelled (km)")).toBeVisible();
  await expect(page.getByText("Average Fuel Economy (km/L)")).toBeVisible();
  await expect(page.getByText("MAF Air Flow Sensor Estimate")).toBeVisible();

  await page.getByText("Fuel Litres per Hour (L/h)").hover();
  await expect(page.getByRole("tooltip")).toContainText("rateLph");

  // Switch dynamically between Simplified Chinese, Bahasa Melayu, and Tamil
  const headerLang = page.locator(".header-actions").getByRole("combobox");
  await headerLang.click();
  await page.getByText("中文 · 简体中文", { exact: true }).click();
  await expect(page.getByText("每小时耗油量 (L/h)")).toBeVisible();

  await page.locator(".header-actions").getByRole("combobox").click();
  await page.getByText("BM · Bahasa Melayu", { exact: true }).click();
  await expect(page.getByText("Liter Bahan Api Sejam (L/j)")).toBeVisible();

  await page.locator(".header-actions").getByRole("combobox").click();
  await page.getByText("TA · தமிழ்", { exact: true }).click();
  await expect(page.getByText("மணிக்கு எரிபொருள் லிட்டர் (L/h)")).toBeVisible();

  // Reloading keeps the frontend-selected Tamil language intact
  await page.reload();
  await expect(page.getByText("மணிக்கு எரிபொருள் லிட்டர் (L/h)")).toBeVisible();

  expect(
    await page.evaluate(() => (window as any).__cspViolations || []),
  ).toEqual([]);
});
test("vehicle telemetry charts show Latest, Max, and Avg tags and interactive hover tooltips", async ({
  page,
}) => {
  await setup(page, {
    custom: async (route, url) => {
      if (url.pathname === `${O}/vehicles/${VEHICLE}`) {
        await send(route, {
          item: {
            id: VEHICLE,
            registration_number: "VFR7550",
            make: "Perodua",
            model: "Alza",
            status: "active",
            version: 1,
          },
          device: null,
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/telemetry`) {
        await send(route, {
          items: [
            {
              id: "t-1",
              occurred_at: "2026-11-20T01:00:00Z",
              speed_kmh: 40,
              vehicle_data: { speed_kmh: 40, ecu_voltage_v: 13.8 },
            },
            {
              id: "t-2",
              occurred_at: "2026-11-20T01:00:10Z",
              speed_kmh: 80,
              vehicle_data: { speed_kmh: 80, ecu_voltage_v: 14.2 },
            },
            {
              id: "t-3",
              occurred_at: "2026-11-20T01:00:20Z",
              speed_kmh: 60,
              vehicle_data: { speed_kmh: 60, ecu_voltage_v: 14.0 },
            },
          ],
          meta: { next_cursor: null },
        });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/latest-state`) {
        await send(route, { freshness: "recent_packet", sample: null });
        return true;
      }
      if (url.pathname === `${O}/vehicles/${VEHICLE}/diagnostics`) {
        await send(route, { status: "ok" });
        return true;
      }
      return false;
    },
  });

  await page.goto(`/#/organization/${ORG}/vehicles/${VEHICLE}`);
  await page.getByRole("tab", { name: "Telemetry" }).click();

  const speedCard = page
    .locator(".telemetry-chart-card")
    .filter({ hasText: "Vehicle Speed (km/h)" });
  await expect(speedCard).toBeVisible();
  await expect(speedCard.getByText("Latest: 60 km/h")).toBeVisible();
  await expect(speedCard.getByText("Max: 80 km/h")).toBeVisible();
  await expect(speedCard.getByText("Avg: 60 km/h")).toBeVisible();

  const voltageCard = page
    .locator(".telemetry-chart-card")
    .filter({ hasText: "ECU / Control Module Voltage (V)" });
  await expect(voltageCard).toBeVisible();
  await expect(voltageCard.getByText("Latest: 14 V")).toBeVisible();
  await expect(voltageCard.getByText("Max: 14.2 V")).toBeVisible();
  await expect(voltageCard.getByText("Avg: 14 V")).toBeVisible();

  // Hovering the second sample point (80 km/h) reveals the interactive tooltip
  await speedCard.locator(".telemetry-chart-hit").nth(1).hover();
  const speedTooltip = speedCard.locator(".telemetry-chart-tooltip");
  await expect(speedTooltip).toBeVisible();
  await expect(speedTooltip).toContainText("80 km/h");
  await expect(speedTooltip).toContainText("09:00:10");

  // Hovering a non-speed chart (ECU Voltage) also shows that point's speed context
  await voltageCard.locator(".telemetry-chart-hit").nth(1).hover();
  const voltageTooltip = voltageCard.locator(".telemetry-chart-tooltip");
  await expect(voltageTooltip).toBeVisible();
  await expect(voltageTooltip).toContainText("14.2 V");
  await expect(voltageTooltip).toContainText("Vehicle Speed: 80 km/h");

  expect(
    await page.evaluate(() => (window as any).__cspViolations || []),
  ).toEqual([]);
});
