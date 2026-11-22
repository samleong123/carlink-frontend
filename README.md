# CarLink Frontend

Static React web portal for **CarLink — Connected Fleet Operations** ([https://carlink.samsam123.name.my](https://carlink.samsam123.name.my)).

The compiled output is a pure static bundle served via Nginx, Apache, Cloudflare Pages/Static hosting, or any HTTPS static web server—**no Node.js or PHP runtime is needed on the frontend host**. All API requests go directly from the browser to the Laravel backend ([https://carlink-be.samsam123.name.my](https://carlink-be.samsam123.name.my)) using credentialed CORS and Sanctum CSRF cookies.

---

## Tech Stack

- **Framework:** React 19, TypeScript 5.9, Vite 8
- **UI & Visualization:** Ant Design 6, Leaflet 1.9 (`CoordinateMap`), TanStack Query v5, React Router (`HashRouter`)
- **API & Types:** OpenAPI TypeScript (`openapi-typescript`) generated from [`../contracts/openapi.json`](../contracts/openapi.json)
- **Testing & Quality:** Vitest (unit tests), Playwright + Chromium (static-bundle browser E2E), Prettier
- **Languages (`src/i18n/`):** English (`en`), Bahasa Melayu (`ms`), Simplified Chinese (`zh`), Tamil (`ta`)

---

## Implemented Workspaces

- **Public & Onboarding (`src/public/`, `src/auth/`):**
  - Product landing page (`/`), live subscription pricing (`/#/plans`), email-first organization signup (`/#/signup`), Terms & Privacy (`/#/terms`, `/#/privacy`), and 4-language User Manual (`/#/manual`).
  - Explicit email confirmation pages at `/auth/confirm` (magic login links) and `/invitations/confirm` (organization staff invitations).
- **Organization Fleet Operations (`src/features/`):**
  - **Overview Dashboard & Live Map (`overview.tsx`):** Fleet-wide coordinate map with vehicle status, speed, fault markers, hover cards, and drill-down links.
  - **Fleet Registry & Vehicles (`registry.tsx`, `vehicles.tsx`):** Vehicle registration (auto-provisions a pending Telemetry Kit device), driver records, live OBD-II telemetry & gap-preserving charts, compliance & maintenance schedules, and private S3 attachments (`files.tsx`).
  - **Diagnostics & AI Fault Explanation (`diagnostics.tsx`):** Extended DUDU2 DTC scan (enforced `0 km/h` stationary check) and transient Google Gemini fault-code hints (**Powered by Google Gemini**).
  - **Driver Management & Self-Service Driver Portal (`driving.tsx`):** Active NFC shifts, driver safety scores, harsh braking/acceleration/speeding events, appeal submission & compliance review, personal trip maps, fuel/CO₂ efficiency, and **Personal Eco-Driving & Fuel Coach** (Gemini AI).
  - **Compliance, Maintenance & Coverage (`compliance.tsx`, `maintenance.tsx`, `analytics.tsx`):** JPJ road tax, insurance, PUSPAKOM inspections, mileage/calendar maintenance, cellular RSRP/SINR coverage maps & CSV exports, action audit/request logs, **Action Audit AI**, and **Fleet Fuel & Carbon Reduction Advisor** (Gemini AI).
  - **Administration, Billing & Notifications (`administration.tsx`, `billing.tsx`, `notifications.tsx`):** Staff invitations with granular module permissions, driving/telemetry/emission threshold configuration, invoice checkout, and alert notification centre.
- **SaaS Admin & Device Technician (`platform.tsx`):**
  - **SaaS Admin:** Subscription plans & limits (vehicles, drivers, retention days, cellular/safety gates, telemetry frequency), subscriber lifecycle, invoice issuance/voiding, 1-to-1 UUID device linking/unlinking, device online/operator health, archived unpaid signups, global request logs, SaaS staff management, and **Platform Fleet Health & Operations Triage Brief** (Gemini AI).
  - **Technician:** OBD-II Bluetooth MAC configuration, one-line Orange Pi Zero 3 `carlink-telemetry-agent` setup command generation, device activation, and cellular/telemetry diagnostics.

---

## Prerequisites

- **Node.js:** `>= 22.12.0` (verified on Node `v24.22.1`) and **npm**
- **`zip` utility:** Required on macOS/Linux when packaging release ZIP archives via `npm run package:static`
- **Chromium (optional, for E2E tests):** Installed via `npx playwright install chromium`

---

## Installation

1. **Navigate to the frontend directory and install dependencies from the lockfile:**

   ```bash
   cd frontend
   npm ci
   ```

   If your global `~/.npm` cache directory has permission restrictions, use a local cache instead:

   ```bash
   npm ci --cache .npm-cache
   ```

2. **Verify environment configuration ([`.env.production`](.env.production)):**

   The production build embeds non-secret public origins from `.env.production`:

   ```dotenv
   VITE_FRONTEND_ORIGIN=https://carlink.samsam123.name.my
   VITE_API_ORIGIN=https://carlink-be.samsam123.name.my
   ```

   > **Security note:** Never put API keys, Gemini keys, S3 credentials, HMAC keys, or device tokens into any `VITE_*` variable—Vite embeds all `VITE_*` values directly into public client JavaScript. Note that [`src/api/client.ts`](src/api/client.ts) strictly enforces `VITE_API_ORIGIN=https://carlink-be.samsam123.name.my` at startup; update both files together if deploying to a different API hostname.

3. **Optional — Sync TypeScript types after OpenAPI changes:**

   If [`../contracts/openapi.json`](../contracts/openapi.json) was updated in the backend, regenerate [`src/api/generated.ts`](src/api/generated.ts):

   ```bash
   npm run generate:api
   ```

---

## Local Development & Testing

| Command                                   | Purpose                                                                                                        |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Start Vite hot-reload dev server (`http://127.0.0.1:5173`)                                                     |
| `npm run typecheck`                       | Run strict TypeScript check (`tsc --noEmit`)                                                                   |
| `npm run test`                            | Run Vitest unit tests (`tests/unit/**/*.test.ts`)                                                              |
| `npm run build`                           | Typecheck, compile production `dist/`, bundle `THIRD_PARTY_NOTICES.txt`, and generate confirmation shells      |
| `node scripts/serve-static.mjs`           | Serve built `dist/` locally on `http://127.0.0.1:4173` with full CSP/security headers                          |
| `npm run test:e2e`                        | Run Playwright browser E2E tests against the built static server                                               |
| `npm run coverage`                        | Generate/verify OpenAPI operation traceability (`docs/operation-coverage.json` & `docs/OPERATION_COVERAGE.md`) |
| `npm run deploy:config`                   | Regenerate/verify Nginx and Apache config examples from [`deploy/headers.mjs`](deploy/headers.mjs)             |
| `npm run package:static`                  | Verify `dist/`, coverage & host configs, then produce a release ZIP + SHA-256 + manifest under `releases/`     |
| `npm run format` / `npm run format:check` | Format or verify formatting with Prettier                                                                      |

To run Playwright browser tests locally after building:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

---

## Building & Creating a Release ZIP

Run the full build and verification pipeline from `frontend/`:

```bash
npm ci
npm run typecheck
npm run test
npm run coverage
npm run deploy:config -- --check
npm run build
npm run package:static
```

> **Note:** Running `npm run build` executes `node ../scripts/prepare-frontend-static.mjs dist` at the end, which verifies all `/assets/*` references and copies `dist/index.html` into:
>
> - `dist/auth/confirm/index.html` (serves `/auth/confirm` and `/auth/confirm/`)
> - `dist/invitations/confirm/index.html` (serves `/invitations/confirm` and `/invitations/confirm/`)

After `npm run package:static` succeeds, `releases/` will contain:

- `carlink-static-YYYY-MM-DD-<hash>.zip` — Uploadable archive of `dist/` (only compiled assets, HTML shells, favicon, OG image, and license notices; excludes `src/`, `node_modules/`, `tests/`, and `.DS_Store`)
- `carlink-static-YYYY-MM-DD-<hash>.zip.sha256` — SHA-256 checksum
- `carlink-static-YYYY-MM-DD-<hash>.manifest.json` — Per-file byte/hash inventory

---

## Production Deployment Guide

### 1. Upload the Static Build to the Frontend Document Root

Extract `releases/carlink-static-*.zip` (or upload the full contents of `dist/`) into the static document root for `carlink.samsam123.name.my` (for example `/var/www/carlink-frontend`).

> **Important:**
>
> - Host the frontend in a **separate document root** from the Laravel backend's `public/` directory.
> - Whenever deploying a new build, replace the entire `dist/` contents (`index.html`, `auth/confirm/index.html`, `invitations/confirm/index.html`, and `assets/`) together so browser HTML and hashed JS/CSS chunks stay matched.

Expected deployed root layout:

```text
/var/www/carlink-frontend/
├── index.html
├── link-entry.js
├── favicon.svg
├── og-cover.png
├── THIRD_PARTY_NOTICES.txt
├── auth/
│   └── confirm/
│       └── index.html
├── invitations/
│   └── confirm/
│       └── index.html
└── assets/
    ├── index-*.js
    ├── index-*.css
    ├── leaflet-src-*.js
    └── leaflet-vh-*.css
```

### 2. Configure Your Web Server (Nginx or Apache)

This app uses `HashRouter` (`/#/console`, `/#/plans`, `/#/signup`) plus two dedicated confirmation directory paths (`/auth/confirm` and `/invitations/confirm`). Use directory-index resolution (`$uri $uri/ =404`) rather than a blanket SPA rewrite to `index.html`, so missing files under `/assets/*` return true `404` responses while `/auth/confirm` and `/invitations/confirm` serve their `index.html` shells cleanly.

#### Option A — Nginx

Merge [`deploy/nginx.conf.example`](deploy/nginx.conf.example) into your HTTPS `server` block for `carlink.samsam123.name.my`:

```nginx
index index.html;
autoindex off;

add_header Content-Security-Policy "default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; connect-src 'self' https://carlink-be.samsam123.name.my; img-src 'self' data: https://*.s3.ap-southeast-1.amazonaws.com https://s3.ap-southeast-1.amazonaws.com https://*.s3.amazonaws.com https://s3.amazonaws.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" always;
add_header Referrer-Policy "no-referrer" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), bluetooth=()" always;
add_header Cache-Control "no-store" always;

location / {
  try_files $uri $uri/ =404;
}
```

#### Option B — Apache

Ensure `mod_headers` and `AllowOverride` (or VirtualHost config) are enabled and review/merge [`deploy/apache.htaccess`](deploy/apache.htaccess) into `.htaccess` at the frontend document root.

> **If using Cloudflare CDN:**
>
> - Set SSL/TLS mode to **Full (strict)**.
> - Do **not** inject wildcard CORS headers on the frontend or backend via Cloudflare Transform Rules; Laravel's CORS config manages credentialed `Origin` headers cleanly.
> - Purge Cloudflare cache after uploading a new static release so stale `index.html` references do not point to old asset hashes.
> - Enable **IP Geolocation** in Cloudflare Dashboard → Network so the backend receives `CF-IPCountry` for login notifications and API envelopes.

#### S3 Bucket Origins in CSP

Allowed private file preview origins are maintained in [`deploy/file-origins.json`](deploy/file-origins.json) and synchronized across `src/api/client.ts` and `deploy/headers.mjs`. If your S3 bucket uses a different AWS region or custom endpoint, update [`deploy/file-origins.json`](deploy/file-origins.json), run `npm run deploy:config` and `npm run build`, and update your Nginx/Apache CSP headers to match.

### 3. Verify Backend (`.env`) Configuration (`carlink-be.samsam123.name.my`)

Cross-subdomain Sanctum session & CSRF authentication requires these backend settings in the Laravel API environment:

```dotenv
APP_URL=https://carlink-be.samsam123.name.my
FRONTEND_URL=https://carlink.samsam123.name.my
SESSION_DOMAIN=.samsam123.name.my
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=carlink.samsam123.name.my,carlink-be.samsam123.name.my
```

After updating the backend `.env`, clear cached Laravel config and restart app/worker containers (`php artisan config:clear`).

### 4. Post-Deployment Verification Checklist

1. `https://carlink.samsam123.name.my/` loads the landing page cleanly with zero CSP console errors.
2. `https://carlink.samsam123.name.my/auth/confirm` and `https://carlink.samsam123.name.my/invitations/confirm` (both with and without trailing `/`) return `200 OK` and render the confirmation screen.
3. Requesting a missing asset (e.g. `/assets/nonexistent.js`) returns `404` instead of HTML.
4. Requesting a magic sign-in link initializes `XSRF-TOKEN` (readable across `.samsam123.name.my`), keeps the session cookie `HttpOnly` + `Secure`, and completes login cleanly without `419` CSRF or CORS errors.
5. Organization private images/files open using short-lived S3 presigned URLs without CSP `img-src` blocks.

---

## Directory Structure

```text
frontend/
├── deploy/                 # Nginx/Apache examples, CSP & header definitions, allowed S3 origins
├── public/                 # Static public files copied verbatim (favicon.svg, og-cover.png, link-entry.js)
├── scripts/                # Build notices, coverage check, host config sync, static preview & ZIP packager
├── src/
│   ├── api/                # Generated OpenAPI types, fetch/CORS/CSRF client, form helpers & response adapters
│   ├── app/                # Root HashRouter shell, navigation config & authenticated app context
│   ├── auth/               # Login / invitation token confirmation screen
│   ├── components/         # Shared UI components, GeminiPoweredBadge, Leaflet CoordinateMap, NFC modal
│   ├── features/           # Fleet, Driver, Diagnostics, Analytics, Maintenance, Compliance & SaaS Platform views
│   ├── i18n/               # Complete UI translations (en, ms, zh, ta)
│   ├── lib/                # Unit/mileage/currency/checkout/telemetry helpers
│   ├── public/             # Landing page, pricing, signup flow, Legal & User Manual
│   └── styles/             # Application and landing stylesheets
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── browser/            # Playwright Chromium static-bundle tests
├── .env.production         # Build-time public origin configuration
├── .gitignore              # Ignores node_modules, dist, release/releases, .DS_Store, __MACOSX, test/log junk
├── index.html              # Vite HTML entry & SEO/Open Graph metadata
├── package.json            # Dependencies & scripts
├── playwright.config.ts    # Playwright test runner config
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite production build config
└── vitest.config.ts        # Vitest config
```

---

## License & Documentation

- Third-party dependency license notices are generated at build time into `dist/THIRD_PARTY_NOTICES.txt`.
- Backend static hosting & API contract docs are available in [`../docs/frontend/STATIC_HOSTING.md`](../docs/frontend/STATIC_HOSTING.md) and [`../docs/frontend/API_REFERENCE.md`](../docs/frontend/API_REFERENCE.md).
