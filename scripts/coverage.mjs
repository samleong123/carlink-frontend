// Reviewed operation-to-domain mapping, not a claim of live acceptance.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
const inventory = JSON.parse(
  readFileSync("../docs/frontend/api-inventory.json", "utf8"),
);
const hash = createHash("sha256")
  .update(readFileSync("../contracts/openapi.json"))
  .digest("hex");
if (inventory.source.sha256 !== hash)
  throw new Error("Refresh the authoritative API inventory first");
const rules = [
  [
    /\/public\/plans$/,
    "src/public/Landing.tsx",
    "Public pricing",
    "Server-returned active plans only; no invented/free catalogue",
  ],
  [
    /\/auth\/signup-links$/,
    "src/public/SignupStart.tsx",
    "Email-first organization signup",
    "Encrypted reviewed draft; explicit mailbox confirmation creates owner/invoice before automatic checkout",
  ],
  [
    /\/organization-signups(?:\/\{signup\})?$/,
    "src/public/Signup.tsx",
    "Plan-based organization signup",
    "Frozen uncertain payload/key; fixed 12-hour deadline; invoice checkout and tombstone reconciliation",
  ],
  [
    /\/platform\/signup-archives/,
    "src/public/SignupArchives.tsx",
    "Archived signup financial evidence",
    "Independent SaaS admin; no tenant resurrection, refund or cancellation claims",
  ],
  [
    /^GET \/sanctum\//,
    "src/api/client.ts",
    "CSRF bootstrap",
    "Credentialed CORS; JSON CSRF response; decoded cookie per mutation",
  ],
  [
    /health\/live$/,
    "src/api/client.ts",
    "Operator liveness endpoint",
    "Development readiness screen removed from the product",
    "deferred",
  ],
  [
    /\/auth\/logout$/,
    "src/app/App.tsx",
    "Confirmed browser sign-out",
    "Does not end physical NFC shifts",
  ],
  [
    /\/auth\/|\/invitations\/accept$/,
    "src/auth/AuthScreen.tsx",
    "Explicit email-link confirmation",
    "Token scrubbed before startup; invitation mailbox enforced by server",
  ],
  [
    /^GET \/api\/v1\/me$|^GET \/api\/v1\/organizations$/,
    "src/app/context.tsx",
    "Session/membership refresh",
    "Controller response adapters; context invalidation on permission changes",
  ],
  [
    /^PATCH \/api\/v1\/me$|\/organizations\/\{organization\}$/,
    "src/features/administration.tsx",
    "Personal account / organization details",
    "Versioned curated fields; account email is not editable",
  ],
  [
    /^POST .*\/devices\/\{device\}\/installations/,
    "src/features/vehicles.tsx",
    "Restricted legacy installation write",
    "Managed-device tenant writes deliberately omitted; use SaaS technician/device setup",
    "restricted-legacy",
  ],
  [
    /^POST .*\/organizations\/\{organization\}\/payments$/,
    "src/features/billing.tsx",
    "Restricted standalone payment creation",
    "Not used for subscription purchase: it has no invoice association; purchase uses invoice/pay",
    "restricted-legacy",
  ],
  [
    /\/platform\/organizations\/.*\/invoices|\/organizations\/.*\/(invoices|plans|subscription)(\/|$)|\/organizations\/.*\/payments\/\{payment\}$/,
    "src/features/billing.tsx",
    "Plan/invoice checkout and reconciliation",
    "payments.manage for checkout/status; transient allowlisted links; no replacement after uncertainty",
  ],
  [
    /\/platform\/devices/,
    "src/features/platform.tsx",
    "SaaS device / technician setup",
    "Backend and UI commissioning, MAC and activation technician-only; link/unlink admin-only",
  ],
  [
    /\/platform\/request-logs/,
    "src/features/analytics.tsx",
    "Restricted global HTTP logs",
    "No tenant association or business request-body viewer",
  ],
  [
    /\/platform\/health-triage-ai$/,
    "src/features/platform.tsx",
    "Platform fleet health & operations triage AI brief",
    "SaaS admin only; PII-scrubbed platform aggregates; transient Google Gemini briefing",
  ],
  [
    /\/platform\/reports/,
    "src/features/overview.tsx",
    "Platform summary",
    "Actual current server counts only",
  ],
  [
    /\/platform\/organizations\/.*\/vehicles$/,
    "src/features/platform.tsx",
    "SaaS device link vehicle selector",
    "Same-organization vehicle lookup for platform device linking",
  ],
  [
    /\/platform\//,
    "src/features/platform.tsx",
    "Plans, subscribers, SaaS staff",
    "Independent active SaaS authority; recent verification for staff writes",
  ],
  [
    /\/files(\/|$)/,
    "src/features/files.tsx",
    "Private attachments",
    "Target-authorized five-minute S3 bearer links; JSON issuance errors; direct download anchors/previews without PHP byte proxy; maintenance_work_orders mapping corrected",
  ],
  [
    /\/safety-score$|\/driver\/me\/score$/,
    "src/features/driving.tsx",
    "Driver safety score",
    "Retention-window observation score; unavailable when zero eligible intervals; approved appeals excluded",
  ],
  [
    /\/driver\/me\/eco-coach-ai$/,
    "src/features/driving.tsx",
    "Driver personal eco-driving & fuel coach AI",
    "Strictly single-driver scoped; PII-scrubbed; transient Google Gemini coaching tips",
  ],
  [
    /\/driver\/me\/|\/journeys|safety-(events|appeals)|driver-assignments|\/drivers\/\{driver\}\/(credentials|photo|safety-score)|\/driver-shifts/,
    "src/features/driving.tsx",
    "Own driver / authorized safety and NFC administration",
    "Driver own APIs never fall back to fleet data; known credential IDs only; appeal self-review rejected by backend",
  ],
  [
    /\/maintenance\/due-summary$/,
    "src/features/compliance.tsx",
    "Fleet maintenance due summary",
    "Upcoming and overdue maintenance cycles across fleet vehicles with direct vehicle inspection links",
  ],
  [
    /\/maintenance|\/service-records$/,
    "src/features/maintenance.tsx",
    "Maintenance plans, assignments and orders",
    "Immutable revisions; selective completion with logical idempotency key; private maintenance attachments",
  ],
  [
    /\/compliance-records$/,
    "src/features/compliance.tsx",
    "Pending compliance renewals list",
    "Pending verification records queue opening directly into evidence review and verification",
  ],
  [
    /\/compliance/,
    "src/features/compliance.tsx",
    "Compliance types, obligations and renewals",
    "Pending is not verified; explicit evidence reference; known record history; idempotent renewal",
  ],
  [
    /\/notification-preferences$/,
    "src/features/administration.tsx",
    "Unsupported delivery preferences withheld",
    "Stored quiet hours/opt-outs are not consumed by sender; controls removed",
    "deferred",
  ],
  [
    /\/notifications|\/notification-preferences/,
    "src/features/notifications.tsx",
    "Recipient inbox and preferences",
    "Selected visible IDs only; symbolic action routes; delivery is not inbox-read state",
  ],
  [
    /\/settings|\/members|\/ownership-transfers|\/invitations/,
    "src/features/administration.tsx",
    "Settings, staff and ownership",
    "Granular grants; recent verification; invitation idempotency; mandatory mail is not disabled",
  ],
  [
    /\/request-logs|\/audit-logs|\/audit-ai$|\/fleet-carbon-ai$|\/coverage-map|\/reports\/summary$/,
    "src/features/analytics.tsx",
    "Coverage CSV / reports / action logs / audit & fleet carbon AI",
    "Loaded-page coordinates; bounded server CSV; sanitized Google Gemini audit & fleet fuel/carbon analysis; roadmap reports not fabricated",
  ],
  [
    /\/extended-dtc$|\/device-commands\/|\/configuration$/,
    "src/features/diagnostics.tsx",
    "Extended DUDU2 DTC scan & configuration push",
    "Requires diagnostics.run / device_config.publish, stationary 0 km/h OBD reading + interruption ack for extended scan, and polls command status",
  ],
  [
    /\/dtc-ai$/,
    "src/features/diagnostics.tsx",
    "Transient AI / read-only device commands",
    "telemetry.read / diagnostics.run / device_config.publish; stationary current reading for extended scan only",
  ],
  [
    /\/fleet-states$|\/dashboard$/,
    "src/features/overview.tsx",
    "Fleet overview and coordinate map",
    "Null/stale observations remain unknown; no street basemap or invented motion",
  ],
  [
    /\/\{resource\}(\/\{id\})?$|\/archive$/,
    "src/features/registry.tsx",
    "Vehicle/driver/public-device registry",
    "vehicles/drivers write grants; devices read-only; pending device auto-created by backend",
  ],
  [
    /\/vehicles\/|\/devices\/\{device\}\/installations$/,
    "src/features/vehicles.tsx",
    "Vehicle detail / public-device installations",
    "Permission-gated tabs; typed units, bounded windows, gap-preserving charts",
  ],
];
const operations = inventory.operations.map((operation) => {
  const key = `${operation.method} ${operation.path}`;
  if (!operation.browser.executable_in_human_frontend)
    return {
      operation_id: operation.operation_id,
      method: operation.method,
      path: operation.path,
      classification: operation.browser.classification,
      disposition: "excluded",
      file: "src/api/client.ts",
      action: "Pi/provider only",
      notes:
        "Not executed by the human frontend; central client rejects these destination prefixes",
    };
  const rule = rules.find(([pattern]) => pattern.test(key));
  if (!rule) throw new Error(`Unclassified browser operation: ${key}`);
  const [, file, action, notes, disposition = "connected"] = rule;
  if (!existsSync(file))
    throw new Error(`Missing mapped implementation: ${file}`);
  return {
    operation_id: operation.operation_id,
    method: operation.method,
    path: operation.path,
    classification: operation.browser.classification,
    disposition,
    file,
    action,
    notes,
  };
});
const record = {
  contract_sha256: hash,
  operation_count: operations.length,
  evidence:
    "Source/action coverage only. Fixture tests and live acceptance are separate; see RELEASE_READINESS.md.",
  operations,
};
const outputs = {
  "docs/operation-coverage.json": JSON.stringify(record, null, 2) + "\n",
  "docs/OPERATION_COVERAGE.md":
    "# Operation/action coverage\n\nGenerated with `npm run coverage` from the authoritative " +
    operations.length +
    "-operation inventory and reviewed rules in `scripts/coverage.mjs`. This is source traceability, **not live acceptance**. Controller data adapters are curated separately; generic OpenAPI response schemas are not comprehensive endpoint models.\n\nEvery row retains backend authorization/subscription checks. Shared workflows provide confirmations, field validation, request IDs and explicit server-state review. `O = /api/v1/organizations/{organization}`. See [use-case coverage](USE_CASE_COVERAGE.md) and [release readiness](RELEASE_READINESS.md).\n\n| Operation | Disposition | Source / action | Boundary |\n| --- | --- | --- | --- |\n" +
    operations
      .map(
        (o) =>
          `| \`${o.method} ${o.path.replace("/api/v1/organizations/{organization}", "O")}\` | ${o.disposition} | \`${o.file}\` — ${o.action} | ${o.notes} |`,
      )
      .join("\n") +
    "\n",
};
for (const [path, content] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== content)
      throw new Error(`Stale coverage: ${path}`);
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
console.log(
  `${operations.length} operations mapped: ${JSON.stringify(operations.reduce((counts, o) => ({ ...counts, [o.disposition]: (counts[o.disposition] || 0) + 1 }), {}))}`,
);
