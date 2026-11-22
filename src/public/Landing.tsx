import { useEffect, useState, type CSSProperties } from "react";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  CarOutlined,
  CheckOutlined,
  MenuOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { rows, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import { ErrorNotice, useData } from "../components/shared";
import { money } from "../features/billing";
import type { Locale } from "../i18n/messages";
import "../styles/landing.css";
import { PaymentBadges } from "./landing/PaymentBadges";
import {
  ChapterOneStreet,
  ChapterThreeRoad,
  ChapterTwoTap,
  NB_BLUE,
  clamp,
} from "./landing/EditorialChaptersEarly";
import {
  ChapterFiveFleetPullback,
  ChapterFourTelemetry,
  ChapterSixUnderline,
  FooterHorizonArt,
} from "./landing/EditorialChaptersLate";
import { FleetInterfacePreview } from "./landing/FleetInterfacePreview";
import { useScrollJourney, type ChapterId } from "./landing/useScrollJourney";

const CHAPTER_IDS: readonly ChapterId[] = [
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "chapter-4",
  "chapter-5",
  "chapter-6",
];

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ms", label: "BM" },
  { value: "zh", label: "中文" },
  { value: "ta", label: "தமிழ்" },
];

const BEST_EXPERIENCE_COPY: Record<Locale, string> = {
  en: "For the best experience, use Google Chrome, Microsoft Edge, or Safari at 1920 × 1080 resolution or higher on Desktop, Laptop, or Tablet.",
  ms: "Untuk pengalaman terbaik, gunakan Google Chrome, Microsoft Edge, atau Safari pada resolusi 1920 × 1080 atau lebih tinggi pada Desktop, Komputer Riba, atau Tablet.",
  zh: "为获得最佳体验，建议在台式机、笔记本电脑或平板电脑上使用 Google Chrome、Microsoft Edge 或 Safari 浏览器，并将分辨率设为 1920 × 1080 及以上。",
  ta: "சிறந்த அனுபவத்திற்கு, டெஸ்க்டாப், லேப்டாப் அல்லது டேப்லெட்டில் 1920 × 1080 அல்லது அதற்கு மேற்பட்ட தெளிவுத்திறனுடன் Google Chrome, Microsoft Edge அல்லது Safari-ஐப் பயன்படுத்தவும்.",
};

/** Returns the localized browser and screen resolution recommendation notice. */
export function bestExperienceText(locale: Locale): string {
  return BEST_EXPERIENCE_COPY[locale] ?? BEST_EXPERIENCE_COPY.en;
}

export const PUBLIC_CHROME_COPY: Record<
  Locale,
  {
    userManual: string;
    terms: string;
    privacy: string;
    supportContact: string;
    supportDesc: string;
    connectedMile: string;
  }
> = {
  en: {
    userManual: "User Manual",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    supportContact: "Support & Contact",
    supportDesc:
      "Enterprise fleet operations, Telemetry Kit support, and billing assistance.",
    connectedMile: "CarLink | Connected to Every Mile",
  },
  ms: {
    userManual: "Manual Pengguna",
    terms: "Terma & Syarat",
    privacy: "Dasar Privasi",
    supportContact: "Sokongan & Hubungi",
    supportDesc:
      "Operasi armada perusahaan, sokongan Kit Telemetri, dan bantuan pengebilan.",
    connectedMile: "CarLink | Terhubung ke Setiap Batu",
  },
  zh: {
    userManual: "用户手册",
    terms: "条款与条件",
    privacy: "隐私政策",
    supportContact: "支持与联系",
    supportDesc: "企业车队运营、Telemetry Kit 硬件支持与账单协助。",
    connectedMile: "CarLink | 连接每一程",
  },
  ta: {
    userManual: "பயனர் கையேடு",
    terms: "விதிமுறைகள் & நிபந்தனைகள்",
    privacy: "தனியுரிமைக் கொள்கை",
    supportContact: "ஆதரவு & தொடர்பு",
    supportDesc:
      "நிறுவன வாகனத் தொகுதி செயல்பாடுகள், டெலிமெட்ரி கிட் ஆதரவு மற்றும் பில்லிங் உதவி.",
    connectedMile: "CarLink | ஒவ்வொரு மைலுக்கும் இணைக்கப்பட்டது",
  },
};

export function useLandingNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollBehavior = (): ScrollBehavior => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    } catch {
      return "auto";
    }
  };

  return (sectionId: string, onAfter?: () => void) => {
    onAfter?.();
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el)
          el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      }, 120);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
  };
}

export function PublicHeader() {
  const app = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollToSection = useLandingNavigation();
  const isLandingRoute =
    location.pathname === "/" || location.pathname === "/plans";

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 12);
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        document.documentElement.style.setProperty(
          "--page-scroll",
          `${Math.min(1, Math.max(0, y / max))}`,
        );
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const copy = PUBLIC_CHROME_COPY[app.locale] ?? PUBLIC_CHROME_COPY.en;

  const desktopNavItems: [string, string][] = [
    [app.t("ed_nav_how_it_works"), "chapter-2"],
    [app.t("ed_nav_plans"), "pricing"],
  ];

  const drawerNavItems: [string, string][] = [
    [app.t("ed_nav_story"), "chapter-1"],
    [app.t("ed_nav_tap"), "chapter-2"],
    [app.t("ed_nav_route"), "chapter-3"],
    [app.t("ed_nav_telemetry"), "chapter-4"],
    [app.t("ed_nav_fleet"), "chapter-5"],
    [app.t("ed_nav_plans"), "pricing"],
  ];

  return (
    <header className={`public-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="cl-scroll-hairline" aria-hidden="true" />
      <div className="public-header-inner">
        <Link to="/" className="brand">
          <CarOutlined />
          <span>CarLink</span>
        </Link>

        <nav
          className="cl-header-links"
          aria-label={app.t("pub_nav_primary_aria")}
        >
          {desktopNavItems.map(([label, sectionId]) => (
            <button
              key={sectionId}
              type="button"
              className="cl-nav-btn"
              onClick={() => scrollToSection(sectionId)}
            >
              {label}
            </button>
          ))}
          <Link
            to="/user_manual"
            className="cl-nav-btn"
            style={{ textDecoration: "none" }}
          >
            {copy.userManual}
          </Link>
        </nav>

        <div className="cl-header-actions">
          <div className="cl-desktop-cta">
            <Select
              size="small"
              popupMatchSelectWidth={false}
              aria-label={app.t("language")}
              value={app.locale}
              onChange={(val) => app.setLocale(val as Locale)}
              options={LOCALE_OPTIONS}
            />
            <Button href="/#/console">
              {app.session
                ? app.t("ed_ch1_cta_secondary")
                : app.t("ed_ch1_cta_signin")}
            </Button>
            <Button type="primary" href="/#/signup">
              {app.t("ed_ch1_cta_primary")}
            </Button>
          </div>
          <Button
            className="cl-mobile-menu-btn"
            aria-label={app.t("pub_open_nav_menu")}
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      <Drawer
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rootClassName={isLandingRoute ? "carlink-landing-drawer" : undefined}
        title={
          <Link
            to="/"
            className="brand cl-drawer-brand"
            onClick={() => setDrawerOpen(false)}
          >
            <CarOutlined />
            <span>CarLink</span>
          </Link>
        }
      >
        <div className="cl-drawer-nav">
          {drawerNavItems.map(([label, sectionId]) => (
            <button
              key={sectionId}
              type="button"
              className="cl-drawer-link"
              onClick={() =>
                scrollToSection(sectionId, () => setDrawerOpen(false))
              }
            >
              {label}
            </button>
          ))}
          <Link
            to="/user_manual"
            className="cl-drawer-link"
            style={{ textDecoration: "none", display: "block" }}
            onClick={() => setDrawerOpen(false)}
          >
            {copy.userManual}
          </Link>
          <div className="cl-drawer-ctas">
            <Select
              size="small"
              popupMatchSelectWidth={false}
              aria-label={app.t("language")}
              value={app.locale}
              onChange={(val) => app.setLocale(val as Locale)}
              options={LOCALE_OPTIONS}
            />
            <Button
              block
              href="/#/console"
              onClick={() => setDrawerOpen(false)}
            >
              {app.session
                ? app.t("ed_ch1_cta_secondary")
                : app.t("ed_ch1_cta_signin")}
            </Button>
            <Button
              block
              type="primary"
              href="/#/signup"
              onClick={() => setDrawerOpen(false)}
            >
              {app.t("ed_ch1_cta_primary")}
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export function PlanTerms({ plan }: { plan: Row }) {
  const app = useApp();
  return (
    <ul className="plan-terms">
      <li>
        <CheckOutlined />{" "}
        {app
          .t("pub_plan_up_to_vehicles")
          .replace("{count}", text(plan.vehicle_limit))}
      </li>
      <li>
        <CheckOutlined />{" "}
        {app
          .t("pub_plan_up_to_drivers")
          .replace("{count}", text(plan.driver_limit))}
      </li>
      <li>
        <CheckOutlined />{" "}
        {app
          .t("pub_plan_retention")
          .replace("{days}", text(plan.retention_days))}
      </li>
      <li>
        <CheckOutlined />{" "}
        {app
          .t("pub_plan_telemetry_interval")
          .replace("{seconds}", text(plan.telemetry_min_seconds))}
      </li>
      <li>
        {[true, 1].includes(plan.cellular_enabled as boolean | number)
          ? app.t("pub_plan_cellular_yes")
          : app.t("pub_plan_cellular_no")}
      </li>
      <li>
        {[true, 1].includes(plan.safety_enabled as boolean | number)
          ? app.t("pub_plan_safety_yes")
          : app.t("pub_plan_safety_no")}
      </li>
    </ul>
  );
}

export function PlanCatalogue() {
  const app = useApp(),
    q = useData("/api/v1/public/plans"),
    navigate = useNavigate(),
    plans = rows(q.data?.data.items);
  return (
    <section
      id="pricing"
      className="public-section cl-pricing-section"
      aria-labelledby="plans-heading"
    >
      <div className="cl-container">
        <Typography.Title id="plans-heading" level={2}>
          {app.t("ed_plans_heading")}
        </Typography.Title>
        <p className="public-intro">{app.t("ed_plans_intro")}</p>

        <dl
          className="nb-plan-specs"
          aria-label={app.t("pub_plans_dimensions_aria")}
        >
          <div>
            <dt>{app.t("ed_dim_fleet_size")}</dt>
            <dd>{app.t("ed_dim_fleet_size_val")}</dd>
          </div>
          <div>
            <dt>{app.t("ed_dim_retention")}</dt>
            <dd>{app.t("ed_dim_retention_val")}</dd>
          </div>
          <div>
            <dt>{app.t("ed_dim_modules")}</dt>
            <dd>{app.t("ed_dim_modules_val")}</dd>
          </div>
          <div>
            <dt>{app.t("ed_dim_reporting")}</dt>
            <dd>{app.t("ed_dim_reporting_val")}</dd>
          </div>
        </dl>

        <ErrorNotice error={q.error} retry={() => void q.refetch()} />
        {q.isPending && <Spin />}
        {q.data && !plans.length && (
          <Empty description={app.t("pub_no_plans")} />
        )}
        <div className="plan-grid">
          {plans.map((plan) => (
            <Card key={text(plan.id)} className="plan-card cl-plan-card">
              <Typography.Title level={3}>{text(plan.name)}</Typography.Title>
              <div className="plan-price tabular">
                {money(plan.price_minor, text(plan.currency), app.t("unknown"))}
              </div>
              <p className="muted">
                {app
                  .t("ed_plan_per_days")
                  .replace("{days}", text(plan.period_days))}
              </p>
              <PlanTerms plan={plan} />
              {Number(plan.telemetry_min_seconds) > 15 && (
                <Alert
                  type="warning"
                  title={app.t("pub_plan_longer_interval_warn")}
                />
              )}
              <Button
                type="primary"
                block
                size="large"
                onClick={() =>
                  navigate(`/signup?plan=${encodeURIComponent(text(plan.id))}`)
                }
              >
                {app.t("pub_choose_plan").replace("{name}", text(plan.name))}
              </Button>
            </Card>
          ))}
        </div>

        <Alert
          type="info"
          showIcon
          title={app.t("pub_12h_title")}
          description={app.t("pub_12h_desc")}
        />
        <p className="muted cl-plan-footnote">{app.t("pub_plan_footnote")}</p>
      </div>
    </section>
  );
}

/**
 * Continuous ink bridge connecting the exit point of chapter N's sketch
 * to the entry point of chapter N+1's sketch across the 12-column notebook grid.
 */
function InkBridge({
  fromX,
  toX,
  progress,
  reducedMotion,
}: {
  fromX: number;
  toX: number;
  progress: number;
  reducedMotion: boolean;
}) {
  const p = reducedMotion ? 1 : clamp(progress, 0, 1);
  const d =
    fromX === toX
      ? `M ${fromX} 0 L ${toX} 56`
      : `M ${fromX} 0 C ${fromX} 28, ${toX} 28, ${toX} 56`;

  return (
    <div
      className="nb-ink-bridge"
      aria-hidden="true"
      style={{ "--p": p } as CSSProperties}
    >
      <svg
        className="nb-bridge-desktop"
        viewBox="0 0 1200 56"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          stroke={NB_BLUE}
          strokeWidth={2.3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          className="nb-draw"
          style={{ "--d-start": 0, "--d-span": 1 } as CSSProperties}
        />
      </svg>
      <svg
        className="nb-bridge-mobile"
        viewBox="0 0 120 36"
        preserveAspectRatio="none"
      >
        <path
          d="M 60 0 Q 62 18 60 36"
          fill="none"
          stroke={NB_BLUE}
          strokeWidth={2.2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          className="nb-draw"
          style={{ "--d-start": 0, "--d-span": 1 } as CSSProperties}
        />
      </svg>
    </div>
  );
}

export function EditorialFooter({
  onJump,
}: {
  onJump?: (sectionId: string) => void;
}) {
  const app = useApp();
  const scrollToSection = useLandingNavigation();
  const jump = onJump ?? scrollToSection;
  const copy = PUBLIC_CHROME_COPY[app.locale] ?? PUBLIC_CHROME_COPY.en;
  const supportEmail = "support_carlink@samsam123.name.my";
  return (
    <footer className="ed-footer">
      <div className="ed-footer-horizon">
        <FooterHorizonArt />
      </div>
      <div className="ed-container">
        <div className="ed-footer-grid">
          <div className="ed-footer-brand">
            <Link to="/" className="brand">
              <CarOutlined />
              <span>CarLink</span>
            </Link>
            <p>{app.t("ed_footer_tagline")}</p>
            <div style={{ marginTop: 12 }}>
              <a
                href={`mailto:${supportEmail}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--nb-blue, #1677ff)",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <MailOutlined />
                {supportEmail}
              </a>
            </div>
          </div>

          <div className="ed-footer-col">
            <strong>{app.t("ed_footer_story_col")}</strong>
            <button type="button" onClick={() => jump("chapter-1")}>
              {app.t("ed_nav_story")}
            </button>
            <button type="button" onClick={() => jump("chapter-2")}>
              {app.t("ed_nav_tap")}
            </button>
            <button type="button" onClick={() => jump("chapter-3")}>
              {app.t("ed_nav_route")}
            </button>
            <button type="button" onClick={() => jump("chapter-4")}>
              {app.t("ed_nav_telemetry")}
            </button>
            <button type="button" onClick={() => jump("chapter-5")}>
              {app.t("ed_nav_fleet")}
            </button>
          </div>

          <div className="ed-footer-col">
            <strong>{app.t("ed_footer_platform_col")}</strong>
            <button type="button" onClick={() => jump("pricing")}>
              {app.t("ed_nav_plans")}
            </button>
            <Link to="/signup">{app.t("ed_ch1_cta_primary")}</Link>
            <Link to="/console">
              {app.session
                ? app.t("ed_ch1_cta_secondary")
                : app.t("ed_ch1_cta_signin")}
            </Link>
            <Link to="/user_manual">{copy.userManual}</Link>
            <Link to="/terms">{copy.terms}</Link>
            <Link to="/privacy">{copy.privacy}</Link>
          </div>

          <div className="ed-footer-col">
            <strong>{copy.supportContact}</strong>
            <a
              href={`mailto:${supportEmail}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--nb-blue, #1677ff)",
              }}
            >
              <MailOutlined />
              {supportEmail}
            </a>
            <span
              style={{
                fontSize: 13,
                color: "var(--nb-graphite-text)",
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              {copy.supportDesc}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: "1px solid var(--nb-grid, #e2e8f0)",
          }}
        >
          <PaymentBadges label={app.t("pub_we_accept")} />
        </div>

        <div className="ed-footer-bottom">
          <span>{app.t("ed_footer_note")}</span>
          <span>{copy.connectedMile}</span>
          <span
            style={{
              flexBasis: "100%",
              fontSize: 12,
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            {bestExperienceText(app.locale)}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Landing({ pricing }: { pricing?: boolean }) {
  const app = useApp();
  const scrollToSection = useLandingNavigation();
  const journey = useScrollJourney(CHAPTER_IDS);

  if (pricing) {
    return (
      <div className="public-page carlink-landing">
        <PublicHeader />
        <main>
          <PlanCatalogue />
        </main>
        <EditorialFooter onJump={scrollToSection} />
      </div>
    );
  }

  const p1 = journey.chapters["chapter-1"];
  const p2 = journey.chapters["chapter-2"];
  const p3 = journey.chapters["chapter-3"];
  const p4 = journey.chapters["chapter-4"];
  const p5 = journey.chapters["chapter-5"];
  const p6 = journey.chapters["chapter-6"];

  return (
    <div
      className="public-page carlink-landing"
      data-active-chapter={journey.activeChapter}
    >
      <PublicHeader />

      <main className="ed-journey-main">
        {/* Chapter 1 — Hero: parked car at kerb + driver walking up with NFC card */}
        <section
          id="chapter-1"
          data-chapter-id="chapter-1"
          className="ed-chapter ed-chapter--hero"
          aria-labelledby="ed-ch1-heading"
          style={{ "--p": p1 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-chapter-grid nb-hero-grid">
              <div className="nb-copy-col nb-hero-copy">
                <Typography.Title
                  id="ed-ch1-heading"
                  level={1}
                  className="ed-h1"
                >
                  {app.t("ed_ch1_title")}
                </Typography.Title>
                <p className="ed-lead">{app.t("ed_ch1_body")}</p>
                <div className="ed-cta-row">
                  <Space size={12} wrap>
                    <Button type="primary" size="large" href="/#/signup">
                      {app.t("ed_ch1_cta_primary")}
                    </Button>
                    <Button
                      size="large"
                      onClick={() => scrollToSection("pricing")}
                    >
                      {app.t("ed_ch1_cta_plans")}
                    </Button>
                  </Space>
                </div>
              </div>

              <div className="nb-sketch-col nb-hero-stage">
                <ChapterOneStreet
                  progress={p1}
                  reducedMotion={journey.reducedMotion}
                  t={app.t}
                />
              </div>
            </div>

            <InkBridge
              fromX={857}
              toX={343}
              progress={Math.max(p1, clamp(p2 * 3, 0, 1))}
              reducedMotion={journey.reducedMotion}
            />
          </div>
        </section>

        {/* Chapter 2 — Step 1: Driver taps in */}
        <section
          id="chapter-2"
          data-chapter-id="chapter-2"
          className="ed-chapter"
          aria-labelledby="ed-ch2-heading"
          style={{ "--p": p2 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-chapter-grid nb-chapter-grid--sketch-left">
              <div className="nb-sketch-col">
                <ChapterTwoTap
                  progress={p2}
                  reducedMotion={journey.reducedMotion}
                  t={app.t}
                />
              </div>

              <div className="nb-copy-col">
                <div className="nb-step-heading">
                  <span className="nb-step-num tabular" aria-hidden="true">
                    01
                  </span>
                  <Typography.Title
                    id="ed-ch2-heading"
                    level={2}
                    className="ed-h2"
                  >
                    {app.t("ed_ch2_title")}
                  </Typography.Title>
                </div>
                <p className="ed-lead">{app.t("ed_ch2_body")}</p>
              </div>
            </div>

            <InkBridge
              fromX={343}
              toX={857}
              progress={clamp((p2 - 0.55) / 0.45, 0, 1) || clamp(p3 * 3, 0, 1)}
              reducedMotion={journey.reducedMotion}
            />
          </div>
        </section>

        {/* Chapter 3 — Step 2: Route traced */}
        <section
          id="chapter-3"
          data-chapter-id="chapter-3"
          className="ed-chapter"
          aria-labelledby="ed-ch3-heading"
          style={{ "--p": p3 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-chapter-grid nb-chapter-grid--sketch-right">
              <div className="nb-copy-col">
                <div className="nb-step-heading">
                  <span className="nb-step-num tabular" aria-hidden="true">
                    02
                  </span>
                  <Typography.Title
                    id="ed-ch3-heading"
                    level={2}
                    className="ed-h2"
                  >
                    {app.t("ed_ch3_title")}
                  </Typography.Title>
                </div>
                <p className="ed-lead">{app.t("ed_ch3_body")}</p>
              </div>

              <div className="nb-sketch-col">
                <ChapterThreeRoad
                  progress={p3}
                  reducedMotion={journey.reducedMotion}
                  t={app.t}
                />
              </div>
            </div>

            <InkBridge
              fromX={857}
              toX={343}
              progress={clamp((p3 - 0.55) / 0.45, 0, 1) || clamp(p4 * 3, 0, 1)}
              reducedMotion={journey.reducedMotion}
            />
          </div>
        </section>

        {/* Chapter 4 — Step 3: Health and fuel, live */}
        <section
          id="chapter-4"
          data-chapter-id="chapter-4"
          className="ed-chapter"
          aria-labelledby="ed-ch4-heading"
          style={{ "--p": p4 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-chapter-grid nb-chapter-grid--sketch-left">
              <div className="nb-sketch-col">
                <ChapterFourTelemetry
                  progress={p4}
                  reducedMotion={journey.reducedMotion}
                  t={app.t}
                />
              </div>

              <div className="nb-copy-col">
                <div className="nb-step-heading">
                  <span className="nb-step-num tabular" aria-hidden="true">
                    03
                  </span>
                  <Typography.Title
                    id="ed-ch4-heading"
                    level={2}
                    className="ed-h2"
                  >
                    {app.t("ed_ch4_title")}
                  </Typography.Title>
                </div>
                <p className="ed-lead">{app.t("ed_ch4_body")}</p>
              </div>
            </div>

            <InkBridge
              fromX={343}
              toX={600}
              progress={clamp((p4 - 0.55) / 0.45, 0, 1) || clamp(p5 * 3, 0, 1)}
              reducedMotion={journey.reducedMotion}
            />
          </div>
        </section>

        {/* Chapter 5 — Step 4: Whole fleet, one screen + FleetInterfacePreview */}
        <section
          id="chapter-5"
          data-chapter-id="chapter-5"
          className="ed-chapter ed-chapter--fleet"
          aria-labelledby="ed-ch5-heading"
          style={{ "--p": p5 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-fleet-intro">
              <div className="nb-step-heading">
                <span className="nb-step-num tabular" aria-hidden="true">
                  04
                </span>
                <Typography.Title
                  id="ed-ch5-heading"
                  level={2}
                  className="ed-h2"
                >
                  {app.t("ed_ch5_title")}
                </Typography.Title>
              </div>
              <p className="ed-lead">{app.t("ed_ch5_body")}</p>
            </div>

            <div className="nb-fleet-map-stage">
              <ChapterFiveFleetPullback
                progress={p5}
                reducedMotion={journey.reducedMotion}
                t={app.t}
              />
            </div>

            <InkBridge
              fromX={600}
              toX={600}
              progress={clamp(p5 * 1.4, 0, 1)}
              reducedMotion={journey.reducedMotion}
            />

            <div className="ed-preview-wrap">
              <FleetInterfacePreview t={app.t} />
            </div>
          </div>
        </section>

        {/* Plans */}
        <PlanCatalogue />

        {/* Chapter 6 — Final CTA where the continuous ink line ends underlining the primary button */}
        <section
          id="chapter-6"
          data-chapter-id="chapter-6"
          className="ed-chapter ed-chapter--destination"
          aria-labelledby="ed-ch6-heading"
          style={{ "--p": p6 } as CSSProperties}
        >
          <div className="ed-container">
            <div className="nb-destination-row">
              <div className="nb-destination-copy">
                <Typography.Title
                  id="ed-ch6-heading"
                  level={2}
                  className="ed-h2"
                >
                  {app.t("ed_ch6_title")}
                </Typography.Title>
                <p className="ed-lead">{app.t("ed_ch6_body")}</p>
              </div>

              <div className="nb-destination-actions">
                <div className="nb-ch6-primary-wrap">
                  <Button type="primary" size="large" href="/#/signup">
                    {app.t("ed_ch1_cta_primary")}
                  </Button>
                  <ChapterSixUnderline
                    reducedMotion={journey.reducedMotion}
                    t={app.t}
                  />
                </div>
                <Button size="large" href="/#/console">
                  {app.session
                    ? app.t("ed_ch1_cta_secondary")
                    : app.t("ed_ch1_cta_signin")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EditorialFooter onJump={scrollToSection} />
    </div>
  );
}
