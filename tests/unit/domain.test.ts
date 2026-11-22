import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import {
  curatedFields,
  fieldInitialValues,
  logicalAttempt,
} from "../../src/api/forms";
import { navigation, safeLocalDestination } from "../../src/app/navigation";
import { coordinates } from "../../src/components/CoordinateMap";
import { chartSegments } from "../../src/features/vehicles";
import {
  enrichRowsWithTelemetryAndSafety,
  getSafetySummary,
  matchSafetyEventsForJourney,
  rsrpColor,
  speedColor,
} from "../../src/lib/telemetrySafety";
import { money } from "../../src/features/billing";
import {
  base64File,
  validateFile,
  validatePhoto,
} from "../../src/features/files";
import {
  sessionData,
  membershipData,
  subscriptionData,
  directoryRows,
} from "../../src/api/adapters";
import { notificationRoute } from "../../src/features/notifications";
import { helpFor, valueHelpFor } from "../../src/components/fieldHelp";
import { messages, translate, type Locale } from "../../src/i18n/messages";
import {
  convertMileageInputsToMetres,
  formatKmFromMetres,
  formatMetresFromKm,
  isMileageMetreField,
  kmToMetres,
} from "../../src/lib/mileageUnits";
import {
  convertCurrencyInputsToMinor,
  formatMajorFromMinor,
  formatMinorPreviewFromMajor,
  isCurrencyMinorField,
  majorToMinor,
  minorToMajor,
} from "../../src/lib/currencyUnits";
const org = "11111111-1111-4111-8111-111111111111";
describe("domain safety", () => {
  it("selects curated nested fields, preserves false/zero and only permitted nulls", () => {
    expect(
      curatedFields(
        {
          version: 2,
          secret: "never send",
          settings: { enabled: false, hour: 0, optional: null },
          user_id: null,
        },
        [
          { name: "version" },
          { name: "settings.enabled" },
          { name: "settings.hour" },
          { name: "settings.optional" },
          { name: "user_id", nullable: true },
        ],
      ),
    ).toEqual({
      version: 2,
      settings: { enabled: false, hour: 0 },
      user_id: null,
    });
  });
  it("creates nested defaults without overwriting false and normalizes database booleans", () => {
    expect(
      fieldInitialValues({ enabled: 0 }, [
        { name: "enabled", kind: "switch", default: true },
        { name: "interval.due_when", default: "any" },
      ]),
    ).toEqual({ enabled: false, interval: { due_when: "any" } });
  });
  it("retains the key for the exact logical submission and rotates it for edits", () => {
    const first = logicalAttempt(null, { version: 1 });
    expect(logicalAttempt(first, { version: 1 })).toBe(first);
    expect(logicalAttempt(first, { version: 2 }).key).not.toBe(first.key);
  });
  it("does not rotate an uncertain operation key for an edited draft", () => {
    const first = logicalAttempt(null, { version: 1 });
    expect(logicalAttempt(first, { version: 1 }, true)).toBe(first);
    expect(() => logicalAttempt(first, { version: 2 }, true)).toThrow(
      "previous outcome is uncertain",
    );
  });
  it("combines module grants without fabricating platform authority or feature access", () => {
    const keys = navigation(
      "fleet",
      org,
      ["vehicles.read", "compliance.read", "safety.read", "coverage.read"],
      { safety: false, cellular: true },
    ).map((n) => n.key);
    expect(keys).toEqual(["vehicles", "compliance", "coverage"]);
    expect(
      navigation("fleet", "", ["vehicles.read"], {
        safety: true,
        cellular: true,
      }),
    ).toEqual([]);
    expect(
      navigation("driver", org, ["profile.own"], {
        safety: false,
        cellular: false,
      }).some((n) => n.key === "my/events"),
    ).toBe(false);
    expect(safeLocalDestination("https://evil.test")).toBe("/");
  });
  it("preserves signup and guarded console return destinations, not external or arbitrary paths", () => {
    expect(safeLocalDestination(`/signup?plan=${org}`)).toBe(
      `/signup?plan=${org}`,
    );
    expect(safeLocalDestination("/")).toBe("/console");
    expect(safeLocalDestination(`/organization/${org}/billing`)).toBe(
      `/organization/${org}/billing`,
    );
    for (const value of [
      "//evil.test",
      "/\\evil.test",
      "/signup?redirect=https://evil.test",
      "/auth/confirm?token=secret",
      "/signup\n",
    ])
      expect(safeLocalDestination(value)).toBe("/");
  });
  it("maps only known symbolic notification routes", () => {
    expect(
      notificationRoute(
        { route: "vehicle_compliance", parameters: { vehicle_id: org } },
        org,
      ),
    ).toBe(`/organization/${org}/vehicles/${org}`);
    expect(notificationRoute({ route: "https://evil.test" }, org)).toBeNull();
  });
  it("plots observed zero coordinates but never null coordinates", () =>
    expect(
      coordinates([
        { latitude: 0, longitude: 0 },
        { latitude: null, longitude: 1 },
        { latitude: 91, longitude: 0 },
      ]),
    ).toHaveLength(1));
  it("does not join null metrics or >15-second gaps", () => {
    const items = [
      { occurred_at: "2026-11-18T00:00:00Z", speed_kmh: 0 },
      { occurred_at: "2026-11-18T00:00:02Z", speed_kmh: null },
      { occurred_at: "2026-11-18T00:00:04Z", speed_kmh: 8 },
      { occurred_at: "2026-11-18T00:00:30Z", speed_kmh: 10 },
    ];
    expect(chartSegments(items, "speed_kmh").map((s) => s.length)).toEqual([
      1, 1, 1,
    ]);
    expect(money(101)).toBe("MYR 1.01");
    expect(money(null)).toBe("Unknown");
  });
  it("rejects invalid/large photos and encodes raw base64 without a data URL", async () => {
    expect(() =>
      validateFile(
        new File(["bad"], "bad.exe", { type: "application/octet-stream" }),
      ),
    ).toThrow();
    expect(() =>
      validateFile(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.png", {
          type: "image/png",
        }),
        true,
      ),
    ).toThrow();
    expect(
      await base64File(
        new File(["hello"], "test.pdf", { type: "application/pdf" }),
      ),
    ).toBe("aGVsbG8=");
  });
  it("bounds decoded photo dimensions and releases the decoded image", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 4096, height: 4096, close }),
    );
    try {
      await expect(
        validatePhoto(
          new File(["synthetic"], "photo.png", { type: "image/png" }),
        ),
      ).rejects.toThrow("8,388,608");
      expect(close).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("maps speed & RSRP bands and merges IMU + server safety events cleanly", () => {
    expect(speedColor(null).color).toBe("#64748b");
    expect(speedColor(5).color).toBe("#3b82f6");
    expect(speedColor(25).color).toBe("#06b6d4");
    expect(speedColor(48).color).toBe("#22c55e");
    expect(speedColor(72).color).toBe("#eab308");
    expect(speedColor(92).color).toBe("#f97316");
    expect(speedColor(118).color).toBe("#dc2626");

    expect(rsrpColor(-80).color).toBe("#16a34a");
    expect(rsrpColor(-100).color).toBe("#eab308");
    expect(rsrpColor(-120).color).toBe("#dc2626");

    const enriched = enrichRowsWithTelemetryAndSafety(
      [
        {
          id: "s1",
          occurred_at: "2026-11-20T00:00:00Z",
          speed_kmh: 55,
          latitude: 3.1,
          longitude: 101.6,
        },
        {
          id: "s2",
          occurred_at: "2026-11-20T00:00:10Z",
          speed_kmh: 18,
          latitude: 3.101,
          longitude: 101.601,
        },
      ],
      [
        {
          id: "s1",
          occurred_at: "2026-11-20T00:00:00Z",
          behaviour_data: {
            harsh_braking: false,
            rapid_acceleration: true,
            acceleration: { y_mps2: 3.4 },
          },
        },
      ],
      [
        {
          id: "ev1",
          end_sample_id: "s2",
          kind: "harsh_braking",
          acceleration_ms2: -4.1,
          threshold_ms2: 3.0,
          state: "observed",
          occurred_at: "2026-11-20T00:00:10Z",
        },
        {
          id: "ev-ignored",
          end_sample_id: "s1",
          kind: "harsh_braking",
          state: "excluded",
          occurred_at: "2026-11-20T00:00:00Z",
        },
      ],
    );

    const first = getSafetySummary(enriched[0]);
    expect(first.rapidAcceleration).toBe(true);
    expect(first.harshBraking).toBe(false);
    expect(first.hasDangerEvent).toBe(true);
    expect(first.sources).toEqual(["IMU (5 Hz)"]);

    const second = getSafetySummary(enriched[1]);
    expect(second.harshBraking).toBe(true);
    expect(second.accelerationMs2).toBe(-4.1);
    expect(second.sources).toEqual(["Server speed Δ"]);

    const matched = matchSafetyEventsForJourney(
      {
        vehicle_id: "veh-1",
        started_at: "2026-11-20T00:00:00Z",
        ended_at: "2026-11-20T00:00:10Z",
      },
      [
        {
          id: "ev1",
          vehicle_id: "veh-1",
          kind: "harsh_braking",
          state: "observed",
          occurred_at: "2026-11-20T00:00:10Z",
        },
        {
          id: "ev-other-car",
          vehicle_id: "veh-2",
          kind: "harsh_braking",
          state: "observed",
          occurred_at: "2026-11-20T00:00:05Z",
        },
      ],
    );
    expect(matched.map((e) => e.id)).toEqual(["ev1"]);
  });
  it("provides full 4-locale coverage (en, ms, zh, ta) and user-friendly technical field names with original-key tooltips", () => {
    const enKeys = Object.keys(messages.en);
    const locales: Locale[] = ["en", "ms", "zh", "ta"];
    for (const loc of locales) {
      const missing = enKeys.filter(
        (k) => !messages[loc][k] || !messages[loc][k].trim(),
      );
      expect(missing).toEqual([]);
    }

    const techKeys = [
      "mil_on",
      "has_dtc_fault",
      "calculated_fuel_consumption",
      "rateLph",
      "rateSource",
      "instantL100km",
      "totalLitres",
      "distanceKm",
      "averageL100km",
      "averageKmPerL",
    ];
    for (const key of techKeys) {
      for (const loc of locales) {
        expect(translate(loc, key)).toBeTruthy();
        expect(translate(loc, key)).not.toBe(key);
        const h = helpFor(key, loc);
        expect(h).toBeDefined();
        expect(h!.description).toContain(key);
        expect(h!.rawKey).toBe(key);
      }
    }

    expect(translate("en", "rateLph")).toBe("Fuel Litres per Hour (L/h)");
    expect(translate("zh", "rateLph")).toBe("每小时耗油量 (L/h)");
    expect(translate("ms", "rateLph")).toBe("Liter Bahan Api Sejam (L/j)");
    expect(translate("ta", "rateLph")).toBe("மணிக்கு எரிபொருள் லிட்டர் (L/h)");

    expect(valueHelpFor("maf", "en")?.label).toBe(
      "MAF Air Flow Sensor Estimate",
    );
    expect(valueHelpFor("maf", "en")?.description).toContain("maf");
    expect(valueHelpFor("maf", "ta")?.rawValue).toBe("maf");
    expect(translate("ta", "dashboard")).toBe("கப்பற்படை மேலோட்டம்");
  });
  it("converts km form inputs to server integer metres and formats metre fields as km", () => {
    expect(kmToMetres(3500)).toBe(3500000);
    expect(kmToMetres(12.3456)).toBe(12346);
    expect(kmToMetres("")).toBeUndefined();
    expect(kmToMetres(null)).toBeUndefined();
    expect(formatMetresFromKm(12.5)).toBe("12,500 m");

    expect(
      convertMileageInputsToMetres(
        { plan_id: "p1", carry_in_distance_m: 4200.5, carry_in_reason: "ok" },
        ["carry_in_distance_m"],
      ),
    ).toEqual({
      plan_id: "p1",
      carry_in_distance_m: 4200500,
      carry_in_reason: "ok",
    });
    expect(
      convertMileageInputsToMetres({ plan_id: "p1" }, ["carry_in_distance_m"]),
    ).toEqual({ plan_id: "p1" });

    expect(isMileageMetreField("distance_m")).toBe(true);
    expect(isMileageMetreField("accepted_distance_m")).toBe(true);
    expect(isMileageMetreField("carry_in_distance_m")).toBe(true);
    expect(isMileageMetreField("reading_m")).toBe(true);
    expect(isMileageMetreField("altitude_m")).toBe(false);

    expect(formatKmFromMetres(3500000)).toEqual({
      km: 3500,
      metres: 3500000,
      kmText: "3,500 km",
      metresText: "3,500,000 m",
    });
    expect(formatKmFromMetres(540)?.kmText).toBe("0.54 km");
    expect(formatKmFromMetres(null)).toBeNull();
  });
  it("converts major currency inputs to minor units and formats minor fields", () => {
    expect(majorToMinor(125.5)).toBe(12550);
    expect(majorToMinor("99")).toBe(9900);
    expect(majorToMinor(19.995)).toBe(2000);
    expect(majorToMinor("")).toBeUndefined();
    expect(majorToMinor(null)).toBeUndefined();
    expect(minorToMajor(12550)).toBe(125.5);
    expect(minorToMajor(9900)).toBe(99);
    expect(formatMinorPreviewFromMajor(125.5)).toBe("12,550");

    expect(
      convertCurrencyInputsToMinor(
        { workshop_name: "Workshop A", cost_minor: 125.5, currency: "MYR" },
        ["cost_minor"],
      ),
    ).toEqual({
      workshop_name: "Workshop A",
      cost_minor: 12550,
      currency: "MYR",
    });
    expect(
      convertCurrencyInputsToMinor({ workshop_name: "Workshop A" }, [
        "cost_minor",
      ]),
    ).toEqual({ workshop_name: "Workshop A" });

    expect(isCurrencyMinorField("cost_minor")).toBe(true);
    expect(isCurrencyMinorField("price_minor")).toBe(true);
    expect(isCurrencyMinorField("amount_minor")).toBe(true);
    expect(isCurrencyMinorField("currency")).toBe(false);

    expect(formatMajorFromMinor(12550, "MYR")).toEqual({
      majorText: "MYR 125.50",
      minorText: "12,550 minor",
    });
    expect(formatMajorFromMinor(null, "MYR")).toBeNull();
  });
});
describe("controller response adapters", () => {
  const profile = {
    user: {
      id: "user",
      email_normalized: "fixture@example.test",
      display_name: "Fixture",
      locale: "en",
      timezone: "Asia/Kuala_Lumpur",
      version: 1,
      memberships: ["never copy the full model"],
    },
    permissions: { org: ["vehicles.read"] },
    platform: null,
  };
  it("uses the real email_normalized field and curates the user model", () => {
    expect(sessionData(profile, "request").user).toEqual({
      id: "user",
      email: "fixture@example.test",
      display_name: "Fixture",
      locale: "en",
      timezone: "Asia/Kuala_Lumpur",
      version: 1,
    });
  });
  it.each(["admin", "technician"] as const)(
    "accepts a platform-only %s with canonical empty permission and membership containers",
    (role) => {
      const session = sessionData(
        {
          ...profile,
          user: { ...profile.user, memberships: [] },
          permissions: {},
          platform: { role, version: 1 },
        },
        "platform-only-profile-request",
      );
      expect(session.permissions).toEqual({});
      expect(session.platform).toEqual({ role, version: 1 });
      expect(
        membershipData(
          { organizations: [] },
          "platform-only-membership-request",
        ),
      ).toEqual([]);
      expect(
        navigation(role === "admin" ? "platform" : "technician", "", [], {
          safety: false,
          cellular: false,
        }).map((item) => item.path),
      ).toContain(
        role === "admin" ? "/platform/subscribers" : "/technician/devices",
      );
    },
  );
  it.each(["admin", "technician"] as const)(
    "normalizes only the legacy empty permissions array for a platform-only %s",
    (role) => {
      const session = sessionData(
        {
          ...profile,
          user: { ...profile.user, memberships: [] },
          permissions: [],
          platform: { role, version: 1 },
        },
        "legacy-platform-profile-request",
      );
      expect(session.permissions).toEqual({});
      expect(Array.isArray(session.permissions)).toBe(false);
      expect(session.platform).toEqual({ role, version: 1 });
    },
  );
  it.each([
    { permissions: ["vehicles.read"] },
    { permissions: [{ org: ["vehicles.read"] }] },
    { permissions: [[]] },
  ])(
    "rejects nonempty permission arrays instead of treating them as an empty map: %j",
    ({ permissions }) => {
      expect(() =>
        sessionData({ ...profile, permissions }, "invalid-permission-request"),
      ).toThrow();
    },
  );
  it("reports a malformed successful profile as a client contract mismatch with its original metadata", () => {
    let failure: unknown;
    try {
      sessionData(
        { ...profile, user: { ...profile.user, timezone: "not/a-zone" } },
        "profile-contract-request",
        { path: "/api/v1/me", httpStatus: 200 },
      );
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({
      name: "ResponseContractError",
      httpStatus: 200,
      path: "/api/v1/me",
      requestId: "profile-contract-request",
      issue: expect.any(String),
      uncertain: false,
    });
    expect(failure).not.toHaveProperty("status", 502);
  });
  it("attributes malformed membership data to the directory request rather than the parallel profile request", () => {
    let failure: unknown;
    try {
      membershipData({ organizations: {} }, "membership-contract-request", {
        path: "/api/v1/organizations",
        httpStatus: 200,
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({
      name: "ResponseContractError",
      httpStatus: 200,
      path: "/api/v1/organizations",
      requestId: "membership-contract-request",
      issue: expect.any(String),
      uncertain: false,
    });
    expect(failure).not.toHaveProperty("status", 502);
  });
  it("rejects malformed permissions/platform/version/timezone instead of granting access", () => {
    for (const value of [
      { ...profile, permissions: { org: "vehicles.read" } },
      { ...profile, platform: { role: "owner" } },
      { ...profile, user: { ...profile.user, version: 0 } },
      { ...profile, user: { ...profile.user, timezone: "not/a-zone" } },
    ])
      expect(() => sessionData(value, "request")).toThrow();
  });
  it("checks membership/list containers and rejects partial junk", () => {
    expect(() => membershipData({ organizations: [{}] }, "request")).toThrow();
    expect(directoryRows([{ id: "fixture" }], "request")).toEqual([
      { id: "fixture" },
    ]);
    expect(() => directoryRows({ items: [] }, "request")).toThrow();
    expect(() => directoryRows([null], "request")).toThrow();
  });
  it("keeps explicit inactive access and parses snapshot JSON without inventing a subscription", () => {
    expect(
      subscriptionData({ subscription: null, access_active: false }, "request")
        .subscription,
    ).toBeNull();
    expect(
      subscriptionData(
        {
          subscription: {
            status: "suspended",
            plan_snapshot: '{"safety_enabled":false}',
          },
          access_active: false,
        },
        "request",
      ),
    ).toMatchObject({
      access_active: false,
      subscription: { plan_snapshot: { safety_enabled: false } },
    });
    expect(() => subscriptionData({ access_active: 1 }, "request")).toThrow();
  });
});
describe("early entry script", () => {
  const script = readFileSync("public/link-entry.js", "utf8");
  function run(pathname: string, search: string, hash = "") {
    const replacements: unknown[][] = [];
    const window = {
      location: { pathname, search, hash },
      history: {
        replaceState: (...args: unknown[]) => replacements.push(args),
      },
      __carlinkEntry: undefined as unknown,
    };
    vm.runInNewContext(script, { window, URLSearchParams });
    return { window, replacements };
  }
  it.each(["/auth/confirm", "/auth/confirm/", "/invitations/confirm/"])(
    "captures tokens without consuming at %s",
    (path) => {
      const result = run(path, `?token=${"a".repeat(64)}`);
      expect(result.window.__carlinkEntry).toMatchObject({
        token: "a".repeat(64),
      });
      expect(result.replacements[0][2]).toBe(path);
    },
  );
  it("preserves ordinary hash routes and rejects invalid tokens", () => {
    expect(run("/", "", `#/organization/${org}/vehicles`).replacements).toEqual(
      [],
    );
    expect(
      run("/auth/confirm", "?token=bad").window.__carlinkEntry,
    ).toMatchObject({ token: null });
  });
});
