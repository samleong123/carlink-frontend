import { useState, type ReactNode } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Row,
  Space,
  Steps,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  AuditOutlined,
  BookOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  FileProtectOutlined,
  IdcardOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import type { Locale } from "../i18n/messages";
import "../styles/landing.css";
import { PublicHeader, useLandingNavigation } from "./Landing";
import { FooterHorizonArt } from "./landing/EditorialChaptersLate";
import { PaymentBadges } from "./landing/PaymentBadges";

const { Title, Paragraph, Text } = Typography;

const SUPPORT_EMAIL = "support_carlink@samsam123.name.my";

type ManualIconKey =
  "car" | "idcard" | "compass" | "safety" | "tool" | "file" | "wifi";

interface ManualStep {
  title: string;
  content: string;
}

interface ManualModule {
  key: string;
  number: string;
  icon: ManualIconKey;
  tag: string;
  title: string;
  summary: string;
  capabilities: string[];
  steps: ManualStep[];
}

interface ManualLocaleContent {
  badge: string;
  versionMeta: string;
  homeBreadcrumb: string;
  manualBreadcrumb: string;
  heroTitle: string;
  heroSubtitle: string;
  browserAlertTitle: string;
  browserNotice: string;
  tabAdminLabel: string;
  tabAdminIntro: string;
  tabDriverLabel: string;
  tabDriverIntro: string;
  adminBadgeLabel: string;
  driverBadgeLabel: string;
  whatYouCanDoLabel: string;
  stepByStepLabel: string;
  expandAllLabel: string;
  collapseAllLabel: string;
  backLabel: string;
  supportBannerTitle: string;
  supportBannerDesc: string;
  termsLabel: string;
  privacyLabel: string;
  manualLabel: string;
  supportColTitle: string;
  supportColDesc: string;
  weAcceptLabel: string;
  brandFooterText: string;
  adminModules: ManualModule[];
  driverModules: ManualModule[];
}

function renderModuleIcon(icon: ManualIconKey): ReactNode {
  switch (icon) {
    case "car":
      return <CarOutlined />;
    case "idcard":
      return <IdcardOutlined />;
    case "compass":
      return <CompassOutlined />;
    case "safety":
      return <SafetyCertificateOutlined />;
    case "tool":
      return <ToolOutlined />;
    case "file":
      return <FileProtectOutlined />;
    case "wifi":
      return <WifiOutlined />;
  }
}

const MANUAL_CONTENT: Record<Locale, ManualLocaleContent> = {
  en: {
    badge: "User Manual",
    versionMeta: "Documentation Version 2.4 · Organization Admins & Drivers",
    homeBreadcrumb: "Home",
    manualBreadcrumb: "User Manual",
    heroTitle: "CarLink Platform User Manual",
    heroSubtitle:
      "Step-by-step operational guide for Organization Administrators, Fleet Managers, and Drivers covering fleet vehicle registry, NFC shifts, live journeys, safety appeals, maintenance, compliance, and analytics.",
    browserAlertTitle: "Recommended Viewing Environment",
    browserNotice:
      "For the best experience, use Google Chrome, Microsoft Edge, or Safari at 1920 × 1080 resolution or higher on Desktop, Laptop, or Tablet.",
    tabAdminLabel: "Organization Admin & Fleet Manager",
    tabAdminIntro:
      "Complete administrative workflows for registering fleet vehicles, enrolling NFC driver badges, inspecting trips, adjudicating safety appeals, scheduling maintenance, approving compliance renewals, and tuning fleet analytics.",
    tabDriverLabel: "Driver Portal Manual",
    tabDriverIntro:
      "Day-to-day driver instructions for authenticating shifts with your NFC badge, reviewing your route maps and fuel efficiency, tracking your safety score, submitting event appeals, and verifying vehicle compliance before departure.",
    adminBadgeLabel: "7 Core Modules · Console & Telemetry",
    driverBadgeLabel: "4 Core Workflows · Driver Portal",
    whatYouCanDoLabel: "What You Can Do",
    stepByStepLabel: "Step-by-Step Guide",
    expandAllLabel: "Expand All",
    collapseAllLabel: "Collapse All",
    backLabel: "Back",
    supportBannerTitle: "Need Technical or Onboarding Assistance?",
    supportBannerDesc:
      "Contact our fleet operations and Telemetry Kit support team anytime for hardware support, account permissions, or compliance workflow guidance.",
    termsLabel: "Terms & Conditions",
    privacyLabel: "Privacy Policy",
    manualLabel: "User Manual",
    supportColTitle: "Support & Contact",
    supportColDesc:
      "Enterprise fleet operations, Telemetry Kit support, and billing assistance.",
    weAcceptLabel: "We Accept:",
    brandFooterText: "CarLink | Connected to Every Mile",
    adminModules: [
      {
        key: "admin-1",
        number: "01",
        icon: "car",
        tag: "Vehicle Registry",
        title: "Adding & Managing Fleet Vehicles",
        summary:
          "Register fleet vehicles with plate, make, model, and fuel specifications, automatically generate a pending Telemetry Kit device record upon registration, and manage vehicle details and telemetry link status.",
        capabilities: [
          "Register fleet vehicles with registration plate, make, model, fuel type, and vehicle specifications.",
          "Automatically generate a pending Telemetry Kit device record with unique serial/principal credentials when a vehicle is added.",
          "View each vehicle's Telemetry Kit link and online telemetry status once hardware is installed.",
          "Update vehicle specifications, fuel type, and fleet registry records as needed.",
        ],
        steps: [
          {
            title: "Add Vehicle in Registry",
            content:
              'Go to Registry / Vehicles, click "Add Vehicle", and enter the registration plate, make, model, fuel type, and vehicle specifications.',
          },
          {
            title: "Auto-Generate Pending Telemetry Kit Record",
            content:
              "Upon vehicle registration, the system automatically creates a pending Telemetry Kit device record with a unique serial and principal identifier linked to the vehicle.",
          },
          {
            title: "Monitor Device Link & Telemetry Status",
            content:
              "View the vehicle record in Registry / Vehicles to check its Telemetry Kit link status and confirm when live telemetry begins reporting after installation.",
          },
          {
            title: "Manage Vehicle Specifications",
            content:
              "Edit vehicle details, fuel type, or specifications anytime from Registry / Vehicles to keep fleet records and fuel calculations accurate.",
          },
        ],
      },
      {
        key: "admin-2",
        number: "02",
        icon: "idcard",
        tag: "Drivers & NFC Access",
        title: "Adding a New Driver, Staff Roles & NFC Card Enrolment",
        summary:
          "Register driver profiles, invite organization members, assign the primary driver role for Driver Portal eligibility, enroll physical NFC badges, and manage vehicle assignments.",
        capabilities: [
          "Register complete driver profiles with license details and emergency/contact information.",
          "Invite organization staff members and assign the primary `driver` role for Driver Portal access.",
          "Enroll physical NFC badges securely (card UID stored as a one-way SHA-256 digest).",
          "Manage vehicle assignments or allow NFC tap-in shift authorization across fleet vehicles.",
        ],
        steps: [
          {
            title: "Create Driver Profile",
            content:
              "Go to Registry / Drivers and create a driver record with full name, driving license number, and contact info.",
          },
          {
            title: "Invite Member with Driver Role",
            content:
              'Go to Administration / Staff & Members and invite the user email with "driver" selected as their primary role for Driver Portal eligibility.',
          },
          {
            title: "Enroll Physical NFC Badge",
            content:
              'Click "Enroll NFC" on the driver profile, then tap or enter the physical NFC card UID (stored securely as a SHA-256 digest).',
          },
          {
            title: "Configure Vehicle Assignment",
            content:
              "Assign specific vehicles to the driver or permit flexible NFC tap shift authorization on fleet vehicles.",
          },
        ],
      },
      {
        key: "admin-3",
        number: "03",
        icon: "compass",
        tag: "Live Telemetry & Routes",
        title: "Journeys, Live Telemetry, Distance & Fuel Efficiency",
        summary:
          "Monitor live vehicle state, inspect automatic journeys, view speed-colored GPS routes, check trip distance (km) and fuel efficiency (L/100km and km/L), and review server safety events.",
        capabilities: [
          "Monitor real-time vehicle online/stale state, ignition, speed, and live location.",
          "Inspect automatically segmented journeys with speed-colored GPS route playback.",
          "Evaluate trip distance (km) and fuel efficiency metrics in both L/100km and km/L.",
          "Review server-detected harsh braking and rapid acceleration events on the map.",
        ],
        steps: [
          {
            title: "Automatic Journey Detection",
            content:
              'Journeys start automatically after sustained movement (>5 km/h) and end when stationary with the engine off, or automatically end after 1 hour without telemetry transmission ("Automatic end").',
          },
          {
            title: "Open Journey Inspector",
            content:
              'Open Driving -> Journeys and click "Inspect journey" on any active or completed trip.',
          },
          {
            title: "Review KPIs & Efficiency",
            content:
              "Inspect the top KPI cards for Duration, Distance (km — calculated via OBD/GPS speed trapezoid and GPS coordinates), Fuel Efficiency (L/100km / km/L), Avg/Max Speed, and server Harsh Braking / Acceleration counts.",
          },
          {
            title: "Locate Safety Events on Map",
            content:
              'Click "Locate danger" on any safety event row to focus the exact coordinate on the speed-colored route map.',
          },
        ],
      },
      {
        key: "admin-4",
        number: "04",
        icon: "safety",
        tag: "Safety & Appeals",
        title: "Safety Scores & Deciding Driver Appeals",
        summary:
          "Track driver safety scores (100 - 5 × observed events within the plan retention window) and review, approve, or reject driver safety appeals.",
        capabilities: [
          "Track objective driver safety scores calculated as `100 - 5 × observed events` within your subscription retention window.",
          "Inspect driver appeal submissions paired with exact telemetry speed and deceleration context.",
          "Enforce separation of duties: reviewers cannot adjudicate their own safety appeals.",
          "Approve valid defensive-driving appeals (+5 points restored) or reject with a documented reason.",
        ],
        steps: [
          {
            title: "Open Safety & Appeals Queue",
            content:
              "Go to Driving -> Safety / Appeals to view all pending driver appeal requests.",
          },
          {
            title: "Select an Eligible Pending Appeal",
            content:
              "Select a pending appeal submitted by a driver. Note: you cannot review your own appeal; another authorized reviewer must decide.",
          },
          {
            title: "Evaluate Telemetry & Driver Context",
            content:
              "Review the event telemetry context (speed, g-force/deceleration, timestamp) alongside the driver's written explanation.",
          },
          {
            title: "Approve or Reject Appeal",
            content:
              "Click Approve (excludes the event from the driver's safety score and restores +5 points) or Reject with a clear written decision reason.",
          },
        ],
      },
      {
        key: "admin-5",
        number: "05",
        icon: "tool",
        tag: "Preventive Service",
        title: "Maintenance Module",
        summary:
          "Create recurring maintenance plans by distance (km) and/or time intervals, set carry-in mileage baselines, log completed service cycles, and monitor upcoming or overdue maintenance.",
        capabilities: [
          "Define recurring maintenance plans using distance intervals (km), calendar days, or both.",
          "Set carry-in mileage baselines for vehicles joining CarLink mid-lifecycle.",
          "Log completed workshop service cycles with dates, odometer baselines, and service notes.",
          "Track live remaining distance (km) and remaining days updated automatically from telemetry.",
        ],
        steps: [
          {
            title: "Create Vehicle Maintenance Plan",
            content:
              "Go to Maintenance, select a vehicle, and create a Maintenance Plan (for example, Engine Oil Service every 10,000 km or 180 days).",
          },
          {
            title: "Log Completed Service Cycle",
            content:
              "Record a completed Service Cycle with the service date, workshop notes, and optional carry-in distance (km).",
          },
          {
            title: "Monitor Upcoming & Overdue Status",
            content:
              "Monitor real-time remaining distance (km) and remaining days calculated automatically from live vehicle telemetry.",
          },
        ],
      },
      {
        key: "admin-6",
        number: "06",
        icon: "file",
        tag: "Statutory Renewals",
        title: "Compliance Module",
        summary:
          "Track statutory vehicle obligations (Road Tax, Motor Insurance, Inspection / PUSPAKOM), upload supporting renewal documents, and perform server-verified compliance approval.",
        capabilities: [
          "Track statutory obligations including Road Tax, Motor Insurance, and Inspection / PUSPAKOM.",
          "Configure expiry dates and advance reminder windows to prevent lapsed coverage.",
          "Upload PDF or image renewal evidence alongside official renewal reference numbers.",
          "Complete server-verified compliance review and approval to mark obligations compliant.",
        ],
        steps: [
          {
            title: "Create Compliance Obligation",
            content:
              "Go to Compliance and create an obligation for a vehicle with its expiry date and advance reminder window.",
          },
          {
            title: "Upload Renewal Evidence",
            content:
              "Upload the renewal PDF or image receipt/certificate and submit the renewal reference number.",
          },
          {
            title: "Verify & Approve Renewal",
            content:
              "An authorized compliance reviewer verifies the uploaded document and approves the renewal to mark the obligation compliant.",
          },
        ],
      },
      {
        key: "admin-7",
        number: "07",
        icon: "wifi",
        tag: "Coverage, Insights & Audit",
        title: "Network Coverage, Analytics, Audit Logs & Settings",
        summary:
          "Inspect cellular RSRP (dBm) and SINR (dB) signal maps, export up to 10,000 telemetry samples (24-hour window) to CSV, review Fleet Insights & CO₂/fuel analytics, inspect API/audit logs with AI explanations, and tune harsh driving thresholds (m/s²).",
        capabilities: [
          "Inspect cellular RSRP (dBm) and SINR (dB) signal quality heatmaps along vehicle routes.",
          "Export up to 10,000 raw telemetry samples within a 24-hour window directly to CSV.",
          "Review 30-day Fleet Insights covering distance, fuel usage, CO₂ emissions, and safety trends.",
          "Audit API and administrative activity logs with AI-assisted explanations, and calibrate harsh driving thresholds (m/s²).",
        ],
        steps: [
          {
            title: "Inspect Cellular Coverage & Export CSV",
            content:
              "Go to Analytics -> Coverage to inspect cellular RSRP (dBm) and SINR (dB) signal quality along routes or export up to 10,000 telemetry samples (24-hour window) to CSV.",
          },
          {
            title: "Review Fleet Reports & Audit Logs",
            content:
              "Go to Analytics -> Reports for 30-day distance, fuel, CO₂, and safety trends, and inspect Administration -> Logs for API/audit trails with AI explanations.",
          },
          {
            title: "Tune Organization Thresholds & Digests",
            content:
              "Go to Administration -> Settings to configure harsh braking and rapid acceleration thresholds (m/s²), device offline timeout, and daily email digests.",
          },
        ],
      },
    ],
    driverModules: [
      {
        key: "driver-1",
        number: "01",
        icon: "idcard",
        tag: "Shift Authorization",
        title: "Starting & Ending Your Shift",
        summary:
          "Authorize your driving shift on an assigned vehicle so trips and telemetry are accurately attributed to you.",
        capabilities: [
          "Authenticate instantly at the vehicle dashboard using your enrolled NFC driver badge.",
          "Confirm your active shift status and vehicle assignment inside the Driver Portal.",
          "Ensure all journeys, distance, fuel metrics, and safety records are accurately linked to your shift.",
        ],
        steps: [
          {
            title: "Tap NFC Badge Before Driving",
            content:
              "Tap your enrolled NFC driver badge on the vehicle's Telemetry Kit reader before driving (or view your active shift in Driver Portal -> My Shifts).",
          },
          {
            title: "Drive Normally",
            content:
              "Drive as usual; live telemetry, route coordinates, and journey segments are recorded automatically.",
          },
          {
            title: "End Shift Upon Completion",
            content:
              "Tap your NFC badge again or end your shift in the portal once your driving duty is finished.",
          },
        ],
      },
      {
        key: "driver-2",
        number: "02",
        icon: "compass",
        tag: "Trips & Route Playback",
        title: "Viewing My Trips, Route Maps & Fuel Efficiency",
        summary:
          "Review your own driving history, speed-colored GPS routes, trip distance, and fuel consumption.",
        capabilities: [
          "Browse your personal completed and active trips across assigned vehicles.",
          "Replay speed-colored GPS routes and examine speed profiles across each segment.",
          "Check trip distance estimates, fuel consumption, and any recorded driving event markers.",
        ],
        steps: [
          {
            title: "Open My Trips",
            content:
              "Open Driver Portal -> My Trips to view your chronological driving history.",
          },
          {
            title: "Inspect Route & Efficiency Details",
            content:
              "Click any trip segment to open the interactive route map, speed profile, distance estimate, fuel efficiency, and harsh event markers.",
          },
        ],
      },
      {
        key: "driver-3",
        number: "03",
        icon: "safety",
        tag: "Score & Appeals",
        title: "Checking My Safety Score & Submitting an Appeal",
        summary:
          "Monitor your current safety score (0–100) and submit an appeal if a harsh braking or rapid acceleration observation was caused by an unavoidable road hazard or defensive maneuver.",
        capabilities: [
          "Track your live safety score (0–100) within your organization's retention window.",
          "Inspect individual `observed` harsh braking or rapid acceleration events.",
          "Submit written appeals explaining unavoidable road hazards or defensive maneuvers.",
        ],
        steps: [
          {
            title: "Open My Safety / Records",
            content:
              "Open Driver Portal -> My Safety / Records to view your current score and safety observations.",
          },
          {
            title: "Locate Observed Event",
            content:
              'Find the "observed" safety event (harsh braking or rapid acceleration) that you wish to contest.',
          },
          {
            title: "Submit Appeal with Context",
            content:
              'Click "Submit Appeal" and enter a clear explanation of the traffic conditions, obstacle, or defensive maneuver.',
          },
          {
            title: "Track Appeal Outcome",
            content:
              'Once an authorized compliance reviewer approves your appeal, the event state changes to "excluded" and 5 points are restored to your score.',
          },
        ],
      },
      {
        key: "driver-4",
        number: "04",
        icon: "car",
        tag: "Pre-Trip Check",
        title: "Checking Current Vehicle Maintenance & Compliance",
        summary:
          "Verify that the vehicle you are currently operating has valid road tax, insurance, and up-to-date maintenance.",
        capabilities: [
          "Confirm active Road Tax, Motor Insurance, and Inspection / PUSPAKOM validity before departure.",
          "Check remaining service mileage and maintenance status for the vehicle on your current shift.",
        ],
        steps: [
          {
            title: "Inspect Vehicle Info Before Departing",
            content:
              "Open Driver Portal -> Vehicle Info during an active shift to inspect current compliance validity and maintenance status before departing.",
          },
        ],
      },
    ],
  },

  ms: {
    badge: "Manual Pengguna",
    versionMeta: "Dokumentasi Versi 2.4 · Pentadbir Organisasi & Pemandu",
    homeBreadcrumb: "Utama",
    manualBreadcrumb: "Manual Pengguna",
    heroTitle: "Manual Pengguna Platform CarLink",
    heroSubtitle:
      "Panduan operasi langkah demi langkah untuk Pentadbir Organisasi, Pengurus Armada dan Pemandu merangkumi pendaftaran kenderaan, syif NFC, perjalanan langsung, rayuan keselamatan, penyelenggaraan, pematuhan dan analitik.",
    browserAlertTitle: "Persekitaran Paparan Disyorkan",
    browserNotice:
      "Untuk pengalaman terbaik, gunakan Google Chrome, Microsoft Edge, atau Safari pada resolusi 1920 × 1080 atau lebih tinggi di Desktop, Komputer Riba, atau Tablet.",
    tabAdminLabel: "Pentadbir Organisasi & Pengurus Armada",
    tabAdminIntro:
      "Aliran kerja pentadbiran lengkap untuk mendaftarkan kenderaan armada, mendaftar kad NFC pemandu, menyemak perjalanan, memutuskan rayuan keselamatan, menjadualkan penyelenggaraan, meluluskan pembaharuan pematuhan dan melaras analitik armada.",
    tabDriverLabel: "Manual Portal Pemandu",
    tabDriverIntro:
      "Arahan harian pemandu untuk mengesahkan syif dengan kad NFC anda, menyemak peta laluan dan kecekapan bahan api, memantau skor keselamatan, menghantar rayuan peristiwa dan mengesahkan pematuhan kenderaan sebelum bertolak.",
    adminBadgeLabel: "7 Modul Teras · Konsol & Telemetri",
    driverBadgeLabel: "4 Aliran Kerja Utama · Portal Pemandu",
    whatYouCanDoLabel: "Apa yang Anda Boleh Lakukan",
    stepByStepLabel: "Panduan Langkah demi Langkah",
    expandAllLabel: "Kembangkan Semua",
    collapseAllLabel: "Runtuhkan Semua",
    backLabel: "Kembali",
    supportBannerTitle: "Perlukan Bantuan Teknikal atau Pendaftaran?",
    supportBannerDesc:
      "Hubungi pasukan sokongan operasi armada dan Telemetry Kit kami pada bila-bila masa untuk bantuan perkakasan, kebenaran akaun atau panduan pematuhan.",
    termsLabel: "Terma & Syarat",
    privacyLabel: "Dasar Privasi",
    manualLabel: "Manual Pengguna",
    supportColTitle: "Sokongan & Hubungi",
    supportColDesc:
      "Operasi armada perusahaan, sokongan Telemetry Kit dan bantuan pengebilan.",
    weAcceptLabel: "Kami Menerima:",
    brandFooterText: "CarLink | Connected to Every Mile",
    adminModules: [
      {
        key: "admin-1",
        number: "01",
        icon: "car",
        tag: "Pendaftaran Kenderaan",
        title: "Menambah & Mengurus Kenderaan Armada",
        summary:
          "Daftar kenderaan armada dengan nombor plat, jenama, model dan spesifikasi bahan api, jana rekod peranti Telemetry Kit belum selesai secara automatik semasa pendaftaran, serta urus butiran kenderaan dan status pautan telemetri.",
        capabilities: [
          "Daftar kenderaan armada dengan nombor pendaftaran, jenama, model, jenis bahan api dan spesifikasi kenderaan.",
          "Jana rekod peranti Telemetry Kit belum selesai secara automatik dengan siri dan pengecam prinsipal unik apabila kenderaan ditambah.",
          "Lihat status pautan Telemetry Kit dan telemetri dalam talian setiap kenderaan setelah perkakasan dipasang.",
          "Kemas kini spesifikasi kenderaan, jenis bahan api dan rekod pendaftaran armada mengikut keperluan.",
        ],
        steps: [
          {
            title: "Tambah Kenderaan dalam Pendaftaran",
            content:
              'Pergi ke Registry / Vehicles, klik "Add Vehicle" dan masukkan nombor pendaftaran, jenama, model, jenis bahan api serta spesifikasi kenderaan.',
          },
          {
            title: "Jana Rekod Telemetry Kit Belum Selesai Secara Automatik",
            content:
              "Semasa pendaftaran kenderaan, sistem secara automatik mencipta rekod peranti Telemetry Kit belum selesai dengan siri dan pengecam prinsipal unik yang dipautkan kepada kenderaan tersebut.",
          },
          {
            title: "Pantau Status Pautan & Telemetri Peranti",
            content:
              "Lihat rekod kenderaan dalam Registry / Vehicles untuk menyemak status pautan Telemetry Kit dan mengesahkan apabila telemetri langsung mula menghantar data selepas pemasangan.",
          },
          {
            title: "Urus Spesifikasi Kenderaan",
            content:
              "Sunting butiran kenderaan, jenis bahan api atau spesifikasi pada bila-bila masa melalui Registry / Vehicles bagi memastikan rekod armada dan pengiraan bahan api kekal tepat.",
          },
        ],
      },
      {
        key: "admin-2",
        number: "02",
        icon: "idcard",
        tag: "Pemandu & Akses NFC",
        title: "Menambah Pemandu Baharu, Peranan Staf & Pendaftaran Kad NFC",
        summary:
          "Daftar profil pemandu, jemput ahli organisasi, tetapkan peranan utama `driver` untuk kelayakan Portal Pemandu, daftarkan lencana NFC fizikal dan urus tugasan kenderaan.",
        capabilities: [
          "Daftar profil pemandu dengan maklumat lesen memandu dan butiran hubungan.",
          "Jemput ahli organisasi dan tetapkan `driver` sebagai peranan utama bagi akses Portal Pemandu.",
          "Daftarkan kad NFC fizikal dengan selamat (UID kad disimpan sebagai ringkasan SHA-256).",
          "Urus tugasan kenderaan atau benarkan pengesahan syif melalui sentuhan NFC.",
        ],
        steps: [
          {
            title: "Cipta Rekod Pemandu",
            content:
              "Pergi ke Registry / Drivers dan cipta rekod pemandu dengan nama penuh, lesen dan maklumat hubungan.",
          },
          {
            title: "Jemput Staf dengan Peranan Pemandu",
            content:
              'Pergi ke Administration / Staff & Members dan jemput e-mel pengguna dengan "driver" sebagai peranan utama.',
          },
          {
            title: "Daftar Kad NFC Fizikal",
            content:
              'Klik "Enroll NFC" pada profil pemandu, kemudian sentuh atau masukkan UID kad NFC fizikal (disimpan secara selamat sebagai digest SHA-256).',
          },
          {
            title: "Tetapkan Kenderaan atau Syif NFC",
            content:
              "Tugaskan kenderaan khusus kepada pemandu atau benarkan pengesahan syif melalui sentuhan NFC.",
          },
        ],
      },
      {
        key: "admin-3",
        number: "03",
        icon: "compass",
        tag: "Telemetri & Laluan Langsung",
        title: "Perjalanan, Telemetri Langsung, Jarak & Kecekapan Bahan Api",
        summary:
          "Pantau status kenderaan secara langsung, periksa perjalanan automatik, lihat laluan GPS berwarna mengikut kelajuan, semak jarak perjalanan (km) dan kecekapan bahan api (L/100km dan km/L) serta peristiwa keselamatan pelayan.",
        capabilities: [
          "Pantau status kenderaan langsung, pencucuhan, kelajuan dan lokasi semasa.",
          "Periksa perjalanan automatik dengan main semula laluan GPS berwarna mengikut kelajuan.",
          "Semak jarak perjalanan (km) serta kecekapan bahan api dalam unit L/100km dan km/L.",
          "Semak peristiwa brek mengejut dan pecutan mendadak yang dikesan pelayan pada peta.",
        ],
        steps: [
          {
            title: "Pengesanan Perjalanan Automatik",
            content:
              'Perjalanan bermula secara automatik selepas pergerakan berterusan (>5 km/j) dan tamat apabila berhenti dengan enjin dimatikan, atau tamat secara automatik selepas 1 jam tanpa penghantaran telemetri ("Automatic end").',
          },
          {
            title: "Buka Pemeriksa Perjalanan",
            content:
              'Buka Driving -> Journeys dan klik "Inspect journey" pada mana-mana perjalanan.',
          },
          {
            title: "Semak Kad KPI & Kecekapan",
            content:
              "Lihat kad KPI teratas untuk Tempoh, Jarak (km — dikira melalui trapezoid kelajuan OBD/GPS dan koordinat GPS), Kecekapan Bahan Api (L/100km / km/L), Kelajuan Purata/Maksimum serta kiraan Brek Mengejut / Pecutan pelayan.",
          },
          {
            title: "Cari Lokasi Bahaya pada Peta",
            content:
              'Klik "Locate danger" pada mana-mana baris peristiwa keselamatan untuk memfokuskan titik tepat pada peta laluan berwarna mengikut kelajuan.',
          },
        ],
      },
      {
        key: "admin-4",
        number: "04",
        icon: "safety",
        tag: "Keselamatan & Rayuan",
        title: "Skor Keselamatan & Memutuskan Rayuan Pemandu",
        summary:
          "Jejak skor keselamatan pemandu (100 - 5 × peristiwa diperhatikan dalam tempoh pengekalan pelan) serta luluskan atau tolak rayuan keselamatan pemandu.",
        capabilities: [
          "Pantau skor keselamatan pemandu (`100 - 5 × peristiwa observed`) dalam tempoh pengekalan pelan anda.",
          "Semak konteks telemetri peristiwa dan alasan bertulis yang dikemukakan oleh pemandu.",
          "Pengawal keselamatan tidak boleh menyemak rayuan diri sendiri; penyemak lain yang diberi kuasa mesti membuat keputusan.",
          "Luluskan rayuan sah (mengeluarkan peristiwa daripada skor dan memulihkan +5 mata) atau tolak dengan alasan bertulis.",
        ],
        steps: [
          {
            title: "Buka Senarai Keselamatan / Rayuan",
            content:
              "Pergi ke Driving -> Safety / Appeals untuk melihat rayuan yang sedang menunggu keputusan.",
          },
          {
            title: "Pilih Rayuan Pemandu Belum Selesai",
            content:
              "Pilih rayuan yang dihantar oleh pemandu (nota: anda tidak boleh menyemak rayuan anda sendiri; penyemak lain yang diberi kuasa mesti membuat keputusan).",
          },
          {
            title: "Semak Konteks Telemetri & Alasan",
            content:
              "Teliti konteks telemetri peristiwa bersama penjelasan bertulis daripada pemandu.",
          },
          {
            title: "Luluskan atau Tolak Rayuan",
            content:
              "Klik Approve (mengecualikan peristiwa daripada skor keselamatan pemandu dan memulihkan +5 mata) atau Reject berserta alasan keputusan bertulis.",
          },
        ],
      },
      {
        key: "admin-5",
        number: "05",
        icon: "tool",
        tag: "Servis Berkala",
        title: "Modul Penyelenggaraan",
        summary:
          "Cipta pelan penyelenggaraan berulang mengikut jarak (km) dan/atau selang masa, tetapkan garis asas perbatuan bawa masuk, rekod kitaran servis selesai serta pantau penyelenggaraan akan datang atau tertunggak.",
        capabilities: [
          "Cipta pelan penyelenggaraan berulang mengikut jarak (km), hari kalendar atau kedua-duanya.",
          "Tetapkan jarak bawa masuk (carry-in mileage) untuk kenderaan sedia ada.",
          "Rekod kitaran servis lengkap dengan tarikh servis dan nota bengkel.",
          "Pantau baki jarak (km) dan baki hari masa nyata secara automatik daripada telemetri kenderaan.",
        ],
        steps: [
          {
            title: "Cipta Pelan Penyelenggaraan",
            content:
              "Pergi ke Maintenance, pilih kenderaan dan cipta Maintenance Plan (contoh: Servis Minyak Enjin setiap 10,000 km atau 180 hari).",
          },
          {
            title: "Rekod Kitaran Servis Selesai",
            content:
              "Rekodkan Service Cycle yang telah siap dengan tarikh servis, nota bengkel dan jarak bawa masuk (km) pilihan.",
          },
          {
            title: "Pantau Baki Jarak & Hari",
            content:
              "Pantau baki jarak (km) dan baki hari masa nyata yang dikira secara automatik daripada telemetri kenderaan.",
          },
        ],
      },
      {
        key: "admin-6",
        number: "06",
        icon: "file",
        tag: "Pembaharuan Berkanun",
        title: "Modul Pematuhan",
        summary:
          "Jejak kewajipan berkanun kenderaan (Cukai Jalan, Insurans Motor, Pemeriksaan / PUSPAKOM), muat naik dokumen sokongan pembaharuan dan laksanakan kelulusan pematuhan disahkan pelayan.",
        capabilities: [
          "Jejak kewajipan berkanun termasuk Cukai Jalan, Insurans Motor dan Pemeriksaan / PUSPAKOM.",
          "Tetapkan tarikh luput dan tetingkap peringatan awal untuk setiap kenderaan.",
          "Muat naik bukti pembaharuan PDF/imej dan nombor rujukan rasmi.",
          "Lakukan pengesahan dan kelulusan pelayan oleh penyemak pematuhan yang diberi kuasa.",
        ],
        steps: [
          {
            title: "Cipta Kewajipan Pematuhan",
            content:
              "Pergi ke Compliance dan cipta kewajipan bagi kenderaan bersama tarikh luput dan tetingkap peringatan.",
          },
          {
            title: "Muat Naik Bukti Pembaharuan",
            content:
              "Muat naik bukti PDF/imej pembaharuan dan serahkan nombor rujukan pembaharuan.",
          },
          {
            title: "Sahkan & Luluskan Pembaharuan",
            content:
              "Penyemak pematuhan yang diberi kuasa mengesahkan dokumen dan meluluskan pembaharuan untuk menandakan kewajipan sebagai patuh.",
          },
        ],
      },
      {
        key: "admin-7",
        number: "07",
        icon: "wifi",
        tag: "Liputan, Analitik & Audit",
        title: "Liputan Rangkaian, Analitik, Log Audit & Tetapan",
        summary:
          "Periksa peta isyarat selular RSRP (dBm) dan SINR (dB), eksport sehingga 10,000 sampel telemetri (tetingkap 24 jam) ke CSV, semak analitik Fleet Insights & CO₂/bahan api, periksa log API/audit dengan penjelasan AI dan laras ambang pemanduan kasar (m/s²).",
        capabilities: [
          "Periksa peta kualiti isyarat selular RSRP (dBm) dan SINR (dB) di sepanjang laluan.",
          "Eksport sehingga 10,000 sampel telemetri dalam tetingkap 24 jam ke fail CSV.",
          "Semak laporan 30 hari untuk jarak, bahan api, CO₂ dan trend keselamatan armada.",
          "Semak log API/audit dengan penjelasan AI serta tetapkan ambang brek/pecutan kasar (m/s²), masa tamat luar talian dan ringkasan e-mel harian.",
        ],
        steps: [
          {
            title: "Lihat Liputan Selular & Eksport CSV",
            content:
              "Pergi ke Analytics -> Coverage untuk melihat kualiti isyarat selular sepanjang laluan atau mengeksport sehingga 10,000 sampel telemetri (tetingkap 24 jam) ke CSV.",
          },
          {
            title: "Semak Laporan Armada & Log Audit",
            content:
              "Pergi ke Analytics -> Reports untuk trend 30 hari jarak, bahan api, CO₂ dan keselamatan, serta Administration -> Logs untuk log API/audit bersama penjelasan AI.",
          },
          {
            title: "Laras Ambang & Tetapan Organisasi",
            content:
              "Pergi ke Administration -> Settings untuk mengkonfigurasi ambang brek/pecutan kasar (m/s²), tamat masa luar talian dan ringkasan e-mel harian.",
          },
        ],
      },
    ],
    driverModules: [
      {
        key: "driver-1",
        number: "01",
        icon: "idcard",
        tag: "Pengesahan Syif",
        title: "Memulakan & Menamatkan Syif Anda",
        summary:
          "Sahkan syif pemanduan anda pada kenderaan yang ditetapkan supaya perjalanan dan telemetri dikaitkan dengan tepat kepada anda.",
        capabilities: [
          "Sahkan syif serta-merta dengan menyentuh kad NFC berdaftar pada pembaca Telemetry Kit kenderaan.",
          "Semak status syif aktif dan kenderaan anda terus di Portal Pemandu -> My Shifts.",
          "Pastikan setiap perjalanan dan rekod keselamatan dipautkan kepada syif anda yang sah.",
        ],
        steps: [
          {
            title: "Sentuh Kad NFC Sebelum Memandu",
            content:
              "Sentuh kad pemandu NFC berdaftar anda pada pembaca Telemetry Kit kenderaan sebelum memandu (atau lihat syif aktif dalam Driver Portal -> My Shifts).",
          },
          {
            title: "Pandu Seperti Biasa",
            content:
              "Pandu seperti biasa; telemetri dan perjalanan direkodkan secara automatik.",
          },
          {
            title: "Sentuh Semula atau Tamatkan Syif",
            content:
              "Sentuh kad NFC sekali lagi atau tamatkan syif di portal apabila tugas pemanduan selesai.",
          },
        ],
      },
      {
        key: "driver-2",
        number: "02",
        icon: "compass",
        tag: "Perjalanan & Peta Laluan",
        title: "Melihat Perjalanan Saya, Peta Laluan & Kecekapan Bahan Api",
        summary:
          "Semak sejarah pemanduan anda sendiri, laluan GPS berwarna mengikut kelajuan, jarak perjalanan dan penggunaan bahan api.",
        capabilities: [
          "Semak senarai lengkap perjalanan anda pada kenderaan yang dipandu.",
          "Lihat peta laluan berwarna mengikut kelajuan, profil kelajuan dan anggaran jarak.",
          "Periksa penggunaan bahan api serta penanda peristiwa pemanduan kasar jika ada.",
        ],
        steps: [
          {
            title: "Buka My Trips",
            content:
              "Buka Driver Portal -> My Trips untuk menyemak rekod perjalanan anda.",
          },
          {
            title: "Pilih Segmen Perjalanan",
            content:
              "Klik mana-mana segmen perjalanan untuk membuka peta laluan, profil kelajuan, anggaran jarak dan penanda peristiwa kasar.",
          },
        ],
      },
      {
        key: "driver-3",
        number: "03",
        icon: "safety",
        tag: "Skor & Rayuan",
        title: "Menyemak Skor Keselamatan Saya & Menghantar Rayuan",
        summary:
          "Pantau skor keselamatan semasa anda (0–100) dan kemukakan rayuan jika pemerhatian brek mengejut atau pecutan mendadak berpunca daripada bahaya jalan raya yang tidak dapat dielakkan atau manuver defensif.",
        capabilities: [
          "Pantau skor keselamatan semasa anda (0–100) dalam Portal Pemandu.",
          "Kenal pasti peristiwa `observed` yang ingin dirayu.",
          "Hantar penjelasan terperinci mengenai keadaan trafik atau halangan jalan raya.",
        ],
        steps: [
          {
            title: "Buka My Safety / Records",
            content:
              "Buka Driver Portal -> My Safety / Records untuk melihat skor dan senarai peristiwa anda.",
          },
          {
            title: "Cari Peristiwa Observed",
            content:
              'Cari peristiwa keselamatan berstatus "observed" yang ingin anda bantah.',
          },
          {
            title: "Hantar Rayuan Bertulis",
            content:
              'Klik "Submit Appeal" dan masukkan penjelasan jelas tentang situasi trafik atau jalan raya.',
          },
          {
            title: "Pemulihan Mata Selepas Kelulusan",
            content:
              'Setelah penyemak pematuhan yang diberi kuasa meluluskan rayuan anda, status peristiwa bertukar kepada "excluded" dan 5 mata dipulihkan ke skor anda.',
          },
        ],
      },
      {
        key: "driver-4",
        number: "04",
        icon: "car",
        tag: "Semakan Pra-Perjalanan",
        title: "Menyemak Penyelenggaraan & Pematuhan Kenderaan Semasa",
        summary:
          "Pastikan kenderaan yang sedang anda kendalikan mempunyai cukai jalan, insurans yang sah dan penyelenggaraan terkini.",
        capabilities: [
          "Sahkan kesahihan cukai jalan, insurans motor dan pemeriksaan kenderaan sebelum bertolak.",
          "Semak status penyelenggaraan semasa kenderaan pada syif aktif anda.",
        ],
        steps: [
          {
            title: "Semak Vehicle Info Semasa Syif Aktif",
            content:
              "Buka Driver Portal -> Vehicle Info semasa syif aktif untuk memeriksa status pematuhan dan penyelenggaraan terkini sebelum memulakan perjalanan.",
          },
        ],
      },
    ],
  },

  zh: {
    badge: "用户手册",
    versionMeta: "文档版本 2.4 · 组织管理员与驾驶员指南",
    homeBreadcrumb: "首页",
    manualBreadcrumb: "用户手册",
    heroTitle: "CarLink 平台用户手册",
    heroSubtitle:
      "面向组织管理员、车队经理及驾驶员的完整操作指南，涵盖车队车辆登记、NFC 班次打卡、实时行程、安全评分申诉、维保计划、合规审批及网络与数据分析。",
    browserAlertTitle: "建议浏览环境",
    browserNotice:
      "为获得最佳体验，请在台式机、笔记本电脑或平板电脑上使用 Google Chrome、Microsoft Edge 或 Safari，并将分辨率设为 1920 × 1080 或更高。",
    tabAdminLabel: "组织管理员与车队经理手册",
    tabAdminIntro:
      "全面覆盖车队日常管理流程：登记与管理车队车辆、管理驾驶员与 NFC 卡绑定、查看行程与油耗、审核安全申诉、制定维保计划、审批合规续期以及配置分析阈值。",
    tabDriverLabel: "驾驶员门户手册",
    tabDriverIntro:
      "面向驾驶员的日常操作指引：使用 NFC 工卡开启与结束班次、查看个人行程轨迹与油耗表现、追踪安全评分与提交申诉，并在出车前核验当前车辆的维保与合规状态。",
    adminBadgeLabel: "7 大核心模块 · 管理控制台与遥测",
    driverBadgeLabel: "4 项核心流程 · 驾驶员门户",
    whatYouCanDoLabel: "您可以执行的操作",
    stepByStepLabel: "分步操作指南",
    expandAllLabel: "全部展开",
    collapseAllLabel: "全部收起",
    backLabel: "返回",
    supportBannerTitle: "需要技术支持或上线协助？",
    supportBannerDesc:
      "如需 Telemetry Kit 硬件支持、权限配置或合规审批流程协助，请随时联系我们的车队运营支持团队。",
    termsLabel: "服务条款",
    privacyLabel: "隐私政策",
    manualLabel: "用户手册",
    supportColTitle: "支持与联系",
    supportColDesc: "企业车队运营、Telemetry Kit 技术支持及账单咨询。",
    weAcceptLabel: "支持支付方式：",
    brandFooterText: "CarLink | Connected to Every Mile",
    adminModules: [
      {
        key: "admin-1",
        number: "01",
        icon: "car",
        tag: "车辆名录管理",
        title: "新增与管理车队车辆",
        summary:
          "登记车队车辆的车牌号、品牌、型号与燃油规格，在登记时自动生成待处理的 Telemetry Kit 设备记录，并管理车辆详细信息与遥测连接状态。",
        capabilities: [
          "登记车队车辆的车牌号、品牌、型号、燃油类型及车辆规格。",
          "新增车辆后自动生成带有唯一序列号与主体标识的待处理 Telemetry Kit 设备记录。",
          "在硬件安装完成后，查看每辆车的 Telemetry Kit 关联状态与在线遥测状态。",
          "随时更新车辆规格、燃油类型及车队车辆档案记录。",
        ],
        steps: [
          {
            title: "在车辆名录中新增车辆",
            content:
              "进入 Registry / Vehicles，点击“Add Vehicle（新增车辆）”，填写车牌号、品牌、型号、燃油类型及车辆规格。",
          },
          {
            title: "自动生成待处理 Telemetry Kit 记录",
            content:
              "车辆登记完成后，系统会自动创建一条关联至该车辆的待处理 Telemetry Kit 设备记录，并分配唯一的序列号与主体（Principal）标识。",
          },
          {
            title: "查看设备关联与遥测状态",
            content:
              "在 Registry / Vehicles 中查看车辆记录，核实 Telemetry Kit 的关联状态，并在安装完成后确认实时遥测是否已开始回传。",
          },
          {
            title: "管理车辆规格与档案",
            content:
              "随时在 Registry / Vehicles 中编辑车辆详细信息、燃油类型或规格参数，确保车队档案与油耗计算准确无误。",
          },
        ],
      },
      {
        key: "admin-2",
        number: "02",
        icon: "idcard",
        tag: "驾驶员与 NFC 门禁",
        title: "新增驾驶员、员工角色与 NFC 卡登记",
        summary:
          "创建驾驶员档案、邀请组织成员、分配 `driver` 主角色以开通驾驶员门户权限、登记实体 NFC 卡片并管理车辆指派。",
        capabilities: [
          "登记驾驶员姓名、驾照编号及联系方式等完整档案。",
          "邀请组织成员并为其分配 `driver` 主角色，开通驾驶员门户（Driver Portal）访问资格。",
          "安全登记实体 NFC 卡片（卡片 UID 以单向 SHA-256 摘要形式加密存储）。",
          "支持固定车辆指派或通过 NFC 刷卡灵活授权驾驶班次。",
        ],
        steps: [
          {
            title: "创建驾驶员档案",
            content:
              "进入 Registry / Drivers，填写驾驶员姓名、驾驶证信息及联系方式创建档案。",
          },
          {
            title: "邀请成员并授予驾驶员角色",
            content:
              "进入 Administration / Staff & Members，邀请成员邮箱并将主角色设为 `driver`，使其具备登录驾驶员门户的权限。",
          },
          {
            title: "登记实体 NFC 工卡",
            content:
              "在驾驶员档案中点击“Enroll NFC”，刷卡或输入实体 NFC 卡 UID（系统将以 SHA-256 摘要安全保存）。",
          },
          {
            title: "配置车辆指派或刷卡授权",
            content:
              "为驾驶员分配常用车辆，或启用车队通用的 NFC 刷卡班次授权机制。",
          },
        ],
      },
      {
        key: "admin-3",
        number: "03",
        icon: "compass",
        tag: "实时遥测与行程分析",
        title: "行程管理、实时遥测、里程与燃油效率",
        summary:
          "监控车辆实时状态、检查自动分段行程、查看按速度着色的 GPS 轨迹地图、核对行驶里程（km）与燃油效率（L/100km 及 km/L），并定位服务端检测的安全事件。",
        capabilities: [
          "实时监控车辆在线状态、点火状态、车速与当前位置。",
          "查看自动切分的行程记录及按车速梯度着色的 GPS 轨迹回放。",
          "统计精准行程里程（km）与双单位燃油效率（L/100km 及 km/L）。",
          "在地图上快速定位服务端判定出的急刹车与急加速安全事件。",
        ],
        steps: [
          {
            title: "自动行程起止机制",
            content:
              "车辆持续行驶（>5 km/h）后自动开启行程；停车熄火后结束，或连续 1 小时未收到遥测数据时系统自动结束行程（Automatic end）。",
          },
          {
            title: "打开行程详情视图",
            content:
              "进入 Driving -> Journeys，点击任意行程的“Inspect journey（检查行程）”。",
          },
          {
            title: "查看核心 KPI 与能效指标",
            content:
              "查看顶部 KPI 卡片：行程时长、行驶里程（km — 基于 OBD/GPS 速度梯形积分与 GPS 坐标计算）、燃油效率（L/100km / km/L）、平均/最高车速以及服务端统计的急刹车/急加速次数。",
          },
          {
            title: "地图定位危险事件",
            content:
              "点击任意安全事件行中的“Locate danger（定位危险点）”，地图将立即聚焦至速度着色轨迹上的对应坐标点。",
          },
        ],
      },
      {
        key: "admin-4",
        number: "04",
        icon: "safety",
        tag: "安全评分与申诉裁决",
        title: "安全评分与驾驶员申诉审核",
        summary:
          "追踪方案数据保留周期内的驾驶员安全评分（100 - 5 × observed 事件数），并审批或驳回驾驶员提交的安全事件申诉。",
        capabilities: [
          "实时追踪依据订阅保留周期计算的驾驶员安全评分（`100 - 5 × observed 事件数`）。",
          "结合当时车速、减速度等遥测上下文审核驾驶员申诉说明。",
          "严格执行回避规则：审核员无法审批本人发起的申诉，必须由其他授权人员裁决。",
          "批准合理申诉（将事件排除并恢复 +5 分）或附带书面理由驳回申诉。",
        ],
        steps: [
          {
            title: "进入安全与申诉队列",
            content:
              "进入 Driving -> Safety / Appeals 查看所有待处理的驾驶员申诉。",
          },
          {
            title: "选择待审核申诉",
            content:
              "选择驾驶员提交的待审核申诉（注意：您不能审核自己的申诉，须由其他获授权审核员做出决定）。",
          },
          {
            title: "核查遥测上下文与申诉原因",
            content:
              "对比该安全事件发生时的遥测上下文数据与驾驶员填写的路面情况说明。",
          },
          {
            title: "批准或驳回申诉",
            content:
              "点击 Approve（将该事件从驾驶员安全评分中排除并恢复 +5 分）或点击 Reject 并填写书面裁决理由。",
          },
        ],
      },
      {
        key: "admin-5",
        number: "05",
        icon: "tool",
        tag: "预防性保养",
        title: "车辆维保模块",
        summary:
          "按行驶里程（km）和/或时间周期创建循环维保计划、设置初始接入里程基线、记录已完成的保养周期，并监控即将到期或已逾期的维保任务。",
        capabilities: [
          "支持按公里数（km）、天数间隔或双重条件创建定期维保计划。",
          "支持为中途接入 CarLink 的车辆设置历史承接里程（Carry-in）基线。",
          "登记已完成的维修保养周期、服务日期与修理厂备注。",
          "基于实时车辆遥测自动计算剩余保养里程（km）与剩余天数。",
        ],
        steps: [
          {
            title: "创建维保计划",
            content:
              "进入 Maintenance，选择车辆并创建 Maintenance Plan（例如：每 10,000 km 或每 180 天更换发动机机油）。",
          },
          {
            title: "登记已完成的保养周期",
            content:
              "录入已完成保养周期（Service Cycle）的服务日期、修理厂备注及可选的历史承接里程（km）。",
          },
          {
            title: "监控实时剩余里程与天数",
            content:
              "系统会根据车辆遥测数据自动更新并展示各项维保计划的剩余里程（km）和剩余天数。",
          },
        ],
      },
      {
        key: "admin-6",
        number: "06",
        icon: "file",
        tag: "法定证件合规",
        title: "车辆合规模块",
        summary:
          "管理车辆法定合规义务（路税 Road Tax、车险 Motor Insurance、车检 Inspection / PUSPAKOM），上传续期证明文件并执行服务端核验审批。",
        capabilities: [
          "集中追踪路税、商业/交强车险及 PUSPAKOM 等法定检验到期日。",
          "自定义提前提醒窗口，避免证件逾期风险。",
          "上传 PDF 或图片格式的续期凭证并提交续期参考编号。",
          "由授权合规审核员在服务端完成文档核验与合规审批。",
        ],
        steps: [
          {
            title: "创建合规义务项目",
            content:
              "进入 Compliance，为目标车辆创建合规项目并设置到期日期及提醒窗口。",
          },
          {
            title: "上传续期证明文件",
            content: "上传 PDF 或图片格式的续期凭证，并填写官方续期参考编号。",
          },
          {
            title: "核验并批准续期",
            content:
              "由授权合规审核员核查证明文件并批准续期，将该合规义务更新为已合规状态。",
          },
        ],
      },
      {
        key: "admin-7",
        number: "07",
        icon: "wifi",
        tag: "信号覆盖、洞察与审计",
        title: "网络覆盖、数据分析、审计日志与系统设置",
        summary:
          "查看蜂窝网络 RSRP (dBm) 与 SINR (dB) 信号分布图、导出 24 小时窗口内最多 10,000 条遥测样本 CSV、查阅车队洞察与 CO₂/燃油报告、借助 AI 解释审计日志，并调优急驾阈值（m/s²）。",
        capabilities: [
          "查看沿途蜂窝网络 RSRP (dBm) 与 SINR (dB) 信号质量地图。",
          "支持在 24 小时时间窗口内导出最多 10,000 条原始遥测样本为 CSV 文件。",
          "查阅 30 天车队里程、燃油消耗、CO₂ 排放与安全趋势分析报告。",
          "查看附带 AI 解析的 API/审计日志，并自定义急刹车/急加速阈值（m/s²）、离线超时及每日邮件摘要。",
        ],
        steps: [
          {
            title: "检查网络覆盖与导出 CSV",
            content:
              "进入 Analytics -> Coverage 查看沿途蜂窝信号质量，或将 24 小时内最多 10,000 条遥测样本导出为 CSV。",
          },
          {
            title: "查阅车队报告与审计日志",
            content:
              "进入 Analytics -> Reports 查看 30 天里程、燃油、CO₂ 与安全趋势；进入 Administration -> Logs 查看带 AI 解释的 API/审计日志。",
          },
          {
            title: "调整安全阈值与通知设置",
            content:
              "进入 Administration -> Settings 配置急刹车/急加速阈值（m/s²）、设备离线超时时间及每日邮件汇总报告。",
          },
        ],
      },
    ],
    driverModules: [
      {
        key: "driver-1",
        number: "01",
        icon: "idcard",
        tag: "班次打卡授权",
        title: "开启与结束您的驾驶班次",
        summary:
          "在所分配车辆上完成驾驶班次授权，确保行程记录与遥测数据准确归属到您的个人名下。",
        capabilities: [
          "出车前在车载 Telemetry Kit 读卡器上轻触已绑定的 NFC 驾驶员卡即可快速授权。",
          "在驾驶员门户的 My Shifts 页面随时确认当前班次状态。",
          "确保行驶里程、路线、油耗与安全评分准确关联至本人。",
        ],
        steps: [
          {
            title: "出车前刷 NFC 卡开启班次",
            content:
              "驾驶前将已登记的 NFC 驾驶员卡轻触车载 Telemetry Kit 读卡器（或在 Driver Portal -> My Shifts 查看当前班次）。",
          },
          {
            title: "正常驾驶车辆",
            content: "正常行驶即可，系统将自动采集遥测数据并记录行程轨迹。",
          },
          {
            title: "收车时刷卡或结束班次",
            content: "驾驶任务结束后，再次轻触 NFC 卡或在门户中手动结束班次。",
          },
        ],
      },
      {
        key: "driver-2",
        number: "02",
        icon: "compass",
        tag: "行程与路线回放",
        title: "查看我的行程、路线地图与燃油效率",
        summary:
          "回顾个人历史驾驶记录、按车速着色的 GPS 轨迹路线、行程距离及燃油消耗表现。",
        capabilities: [
          "浏览您本人驾驶过的所有历史与进行中行程。",
          "查看速度着色路线地图、速度曲线、预估里程及急驾事件标记点。",
        ],
        steps: [
          {
            title: "打开“我的行程”",
            content: "进入 Driver Portal -> My Trips 浏览您的个人驾驶记录。",
          },
          {
            title: "点击行程查看详情",
            content:
              "点击任意行程片段，即可打开路线地图、速度变化曲线、里程估算及急驾事件标记。",
          },
        ],
      },
      {
        key: "driver-3",
        number: "03",
        icon: "safety",
        tag: "安全分与申诉",
        title: "查看我的安全评分与提交申诉",
        summary:
          "随时查看当前安全评分（0–100）；如因避让突发道路危险或采取防御性驾驶而触发急刹车/急加速记录，可在线提交申诉。",
        capabilities: [
          "实时掌握当前安全评分（0–100 分）。",
          "针对状态为 `observed` 的安全事件提交情况说明与申诉请求。",
          "审核通过后，事件状态自动转为 `excluded` 并恢复 5 分。",
        ],
        steps: [
          {
            title: "打开我的安全记录",
            content:
              "进入 Driver Portal -> My Safety / Records 查看当前评分与安全记录。",
          },
          {
            title: "定位待申诉的 Observed 事件",
            content: "找到您希望提出异议的“observed”安全事件记录。",
          },
          {
            title: "提交申诉与路况说明",
            content:
              "点击“Submit Appeal（提交申诉）”，清晰说明当时的交通状况、突发障碍或避险原因。",
          },
          {
            title: "等待批准并恢复分数",
            content:
              "待授权合规审核员批准申诉后，该事件状态将变为“excluded”，系统自动为您恢复 5 分。",
          },
        ],
      },
      {
        key: "driver-4",
        number: "04",
        icon: "car",
        tag: "出车前检查",
        title: "查看当前车辆的维保与合规状态",
        summary:
          "出车前确认您当前驾驶的车辆具有有效的路税、保险及按期完成的保养状态。",
        capabilities: [
          "出车前核验当前车辆的路税、车险及车检合规有效性。",
          "查看车辆当前维保周期状态，确保行车安全合规。",
        ],
        steps: [
          {
            title: "在班次中查看车辆信息",
            content:
              "在当前有效班次期间，打开 Driver Portal -> Vehicle Info 检查车辆最新的合规证件与维保状态后再启程。",
          },
        ],
      },
    ],
  },

  ta: {
    badge: "பயனர் கையேடு",
    versionMeta: "ஆவணப் பதிப்பு 2.4 · நிறுவன நிர்வாகிகள் & ஓட்டுநர்கள்",
    homeBreadcrumb: "முகப்பு",
    manualBreadcrumb: "பயனர் கையேடு",
    heroTitle: "CarLink தளத்தின் பயனர் கையேடு",
    heroSubtitle:
      "நிறுவன நிர்வாகிகள், வாகனக் குழு மேலாளர்கள் மற்றும் ஓட்டுநர்களுக்கான முழுமையான வழிகாட்டி: வாகனப் பதிவு, NFC பணி நேரப் பதிவு, நேரலைப் பயணங்கள், பாதுகாப்பு மேல்முறையீடுகள், பராமரிப்பு, இணக்க ஒப்புதல் மற்றும் பகுப்பாய்வு.",
    browserAlertTitle: "பரிந்துரைக்கப்படும் உலாவி சூழல்",
    browserNotice:
      "சிறந்த அனுபவத்திற்கு, டெஸ்க்டாப், மடிக்கணினி அல்லது டேப்லெட்டில் 1920 × 1080 அல்லது அதற்கு மேற்பட்ட தெளிவுத்திறனில் Google Chrome, Microsoft Edge அல்லது Safari உலாவியைப் பயன்படுத்தவும்.",
    tabAdminLabel: "நிறுவன நிர்வாகி & வாகனக் குழு மேலாளர்",
    tabAdminIntro:
      "வாகனக் குழு வாகனங்களைப் பதிவு செய்தல், ஓட்டுநர் NFC அட்டைகளை இணைத்தல், பயணங்களை ஆய்வு செய்தல், பாதுகாப்பு மேல்முறையீடுகளை முடிவு செய்தல், பராமரிப்பு திட்டமிடல், இணக்கப் புதுப்பிப்புகளுக்கு ஒப்புதல் அளித்தல் மற்றும் பகுப்பாய்வு அமைப்புகளை நிர்வகிப்பதற்கான முழு வழிகாட்டி.",
    tabDriverLabel: "ஓட்டுநர் போர்ட்டல் கையேடு",
    tabDriverIntro:
      "உங்கள் NFC அட்டை மூலம் பணி நேரத்தைத் தொடங்குதல் மற்றும் முடித்தல், பயணப் பாதை வரைபடங்கள் மற்றும் எரிபொருள் திறனைப் பார்த்தல், பாதுகாப்பு மதிப்பெண்ணைச் சரிபார்த்தல், மேல்முறையீடு சமர்ப்பித்தல் மற்றும் புறப்படும் முன் வாகன இணக்க நிலையை உறுதிப்படுத்தல்.",
    adminBadgeLabel: "7 முக்கிய தொகுதிகள் · கன்சோல் & டெலிமெட்ரி",
    driverBadgeLabel: "4 முக்கிய செயல்முறைகள் · ஓட்டுநர் போர்ட்டல்",
    whatYouCanDoLabel: "நீங்கள் செய்யக்கூடியவை",
    stepByStepLabel: "படிப்படியான வழிகாட்டி",
    expandAllLabel: "அனைத்தையும் விரிவாக்கு",
    collapseAllLabel: "அனைத்தையும் சுருக்கு",
    backLabel: "பின்செல்",
    supportBannerTitle: "தொழில்நுட்ப அல்லது தொடக்க உதவி தேவையா?",
    supportBannerDesc:
      "வன்பொருள் ஆதரவு, கணக்கு அனுமதிகள் அல்லது இணக்கச் செயல்முறை வழிகாட்டுதலுக்கு எங்கள் வாகனக் குழு மற்றும் Telemetry Kit ஆதரவுக் குழுவை எப்போது வேண்டுமானாலும் தொடர்பு கொள்ளவும்.",
    termsLabel: "விதிமுறைகள் & நிபந்தனைகள்",
    privacyLabel: "தனியுரிமைக் கொள்கை",
    manualLabel: "பயனர் கையேடு",
    supportColTitle: "ஆதரவு & தொடர்பு",
    supportColDesc:
      "நிறுவன வாகனக் குழு செயல்பாடுகள், Telemetry Kit ஆதரவு மற்றும் கட்டண உதவி.",
    weAcceptLabel: "ஏற்றுக்கொள்ளப்படும் கட்டண முறைகள்:",
    brandFooterText: "CarLink | Connected to Every Mile",
    adminModules: [
      {
        key: "admin-1",
        number: "01",
        icon: "car",
        tag: "வாகனப் பதிவகம்",
        title: "வாகனக் குழு வாகனங்களைச் சேர்த்தல் & நிர்வகித்தல்",
        summary:
          "பதிவு எண், தயாரிப்பாளர், மாடல் மற்றும் எரிபொருள் விவரங்களுடன் வாகனங்களைப் பதிவு செய்யவும், பதிவின்போது நிலுவையில் உள்ள Telemetry Kit சாதனப் பதிவைத் தானாக உருவாக்கவும், மேலும் வாகன விவரங்கள் மற்றும் டெலிமெட்ரி இணைப்பு நிலையை நிர்வகிக்கவும்.",
        capabilities: [
          "பதிவு எண், தயாரிப்பாளர், மாடல், எரிபொருள் வகை மற்றும் வாகன விவரக்குறிப்புகளுடன் வாகனங்களைப் பதிவு செய்யவும்.",
          "வாகனம் சேர்க்கப்படும்போது தனிப்பட்ட வரிசை எண் மற்றும் முதன்மை அடையாளத்துடன் நிலுவையில் உள்ள Telemetry Kit சாதனப் பதிவைத் தானாக உருவாக்கவும்.",
          "வன்பொருள் நிறுவப்பட்ட பிறகு ஒவ்வொரு வாகனத்தின் Telemetry Kit இணைப்பு மற்றும் நேரலை டெலிமெட்ரி நிலையைப் பார்க்கவும்.",
          "தேவைக்கேற்ப வாகன விவரக்குறிப்புகள், எரிபொருள் வகை மற்றும் வாகனப் பதிவகப் பதிவுகளைப் புதுப்பிக்கவும்.",
        ],
        steps: [
          {
            title: "பதிவகத்தில் வாகனம் சேர்க்கவும்",
            content:
              'Registry / Vehicles பகுதிக்குச் சென்று, "Add Vehicle" என்பதைக் கிளிக் செய்து பதிவு எண், தயாரிப்பாளர், மாடல், எரிபொருள் வகை மற்றும் வாகன விவரக்குறிப்புகளை உள்ளிடவும்.',
          },
          {
            title: "நிலுவை Telemetry Kit பதிவைத் தானாக உருவாக்கவும்",
            content:
              "வாகனத்தைப் பதிவு செய்தவுடன், அந்த வாகனத்துடன் இணைக்கப்பட்ட தனிப்பட்ட வரிசை எண் மற்றும் முதன்மை அடையாளத்துடன் நிலுவையில் உள்ள Telemetry Kit சாதனப் பதிவைக் கணினி தானாகவே உருவாக்கும்.",
          },
          {
            title: "சாதன இணைப்பு & டெலிமெட்ரி நிலையைக் கண்காணிக்கவும்",
            content:
              "Telemetry Kit இணைப்பு நிலையைச் சரிபார்க்கவும், நிறுவலுக்குப் பிறகு நேரலை டெலிமெட்ரி தரவு அனுப்பத் தொடங்குகிறதா என்பதை உறுதிப்படுத்தவும் Registry / Vehicles பகுதியில் வாகனப் பதிவைப் பார்க்கவும்.",
          },
          {
            title: "வாகன விவரக்குறிப்புகளை நிர்வகிக்கவும்",
            content:
              "வாகனக் குழுப் பதிவுகள் மற்றும் எரிபொருள் கணக்கீடுகள் துல்லியமாக இருக்க Registry / Vehicles வழியாக எப்போது வேண்டுமானாலும் வாகன விவரங்கள், எரிபொருள் வகை அல்லது விவரக்குறிப்புகளைத் திருத்தவும்.",
          },
        ],
      },
      {
        key: "admin-2",
        number: "02",
        icon: "idcard",
        tag: "ஓட்டுநர்கள் & NFC அணுகல்",
        title: "புதிய ஓட்டுநர் சேர்த்தல், பணியாளர் பொறுப்புகள் & NFC அட்டை பதிவு",
        summary:
          "ஓட்டுநர் சுயவிவரங்களைப் பதிவு செய்து, நிறுவன உறுப்பினர்களை அழைத்து, Driver Portal அணுகலுக்கு முதன்மை `driver` பொறுப்பை ஒதுக்கி, NFC அட்டைகளைப் பதிவு செய்யவும்.",
        capabilities: [
          "பெயர், உரிமம் மற்றும் தொடர்பு விவரங்களுடன் ஓட்டுநர் சுயவிவரங்களை உருவாக்கவும்.",
          "Driver Portal தகுதிக்காக `driver` முதன்மைப் பொறுப்புடன் உறுப்பினர்களை அழைக்கவும்.",
          "இயற்பியல் NFC அட்டைகளைப் பாதுகாப்பாகப் பதிவு செய்யவும் (UID SHA-256 வடிவில் சேமிக்கப்படும்).",
          "வாகன ஒதுக்கீடு அல்லது NFC தட்டுதல் மூலம் பணி நேர அங்கீகாரத்தை நிர்வகிக்கவும்.",
        ],
        steps: [
          {
            title: "ஓட்டுநர் பதிவை உருவாக்கவும்",
            content:
              "Registry / Drivers பகுதிக்குச் சென்று பெயர், ஓட்டுநர் உரிமம் மற்றும் தொடர்புத் தகவலுடன் பதிவை உருவாக்கவும்.",
          },
          {
            title: "Driver பொறுப்புடன் உறுப்பினரை அழைக்கவும்",
            content:
              'Administration / Staff & Members பகுதிக்குச் சென்று பயனர் மின்னஞ்சலுக்கு "driver" என்பதை முதன்மைப் பொறுப்பாகக் கொண்டு அழைப்பு அனுப்பவும்.',
          },
          {
            title: "இயற்பியல் NFC அட்டையைப் பதிவு செய்யவும்",
            content:
              'ஓட்டுநர் சுயவிவரத்தில் "Enroll NFC" என்பதைக் கிளிக் செய்து NFC அட்டை UID-ஐத் தட்டவும் அல்லது உள்ளிடவும் (SHA-256 வடிவில் பாதுகாப்பாகச் சேமிக்கப்படும்).',
          },
          {
            title: "வாகன ஒதுக்கீடு அமைக்கவும்",
            content:
              "குறிப்பிட்ட வாகனங்களை ஒதுக்கவும் அல்லது NFC தட்டுதல் மூலம் பணி நேர அங்கீகாரத்தை அனுமதிக்கவும்.",
          },
        ],
      },
      {
        key: "admin-3",
        number: "03",
        icon: "compass",
        tag: "நேரலை டெலிமெட்ரி & பாதைகள்",
        title: "பயணங்கள், நேரலை டெலிமெட்ரி, தூரம் & எரிபொருள் திறன்",
        summary:
          "வாகன நேரலை நிலையைக் கண்காணித்து, தானியங்கிப் பயணங்களை ஆய்வு செய்து, வேக வண்ண GPS பாதைகள், பயண தூரம் (km), எரிபொருள் திறன் (L/100km மற்றும் km/L) மற்றும் பாதுகாப்பு நிகழ்வுகளைப் பார்க்கவும்.",
        capabilities: [
          "வாகனத்தின் நேரலை நிலை, வேகம் மற்றும் இருப்பிடத்தைக் கண்காணிக்கவும்.",
          "வேக வண்ண GPS பாதைகளுடன் தானியங்கிப் பயணங்களை ஆய்வு செய்யவும்.",
          "பயண தூரம் (km) மற்றும் எரிபொருள் திறன் (L/100km, km/L) அளவீடுகளைச் சரிபார்க்கவும்.",
          "கடும் பிரேக்கிங் மற்றும் திடீர் வேக அதிகரிப்பு நிகழ்வுகளை வரைபடத்தில் கண்டறியவும்.",
        ],
        steps: [
          {
            title: "தானியங்கிப் பயணக் கண்டறிதல்",
            content:
              'தொடர் இயக்கத்திற்குப் (>5 km/h) பிறகு பயணங்கள் தானாகத் தொடங்கி, இயந்திரம் அணைக்கப்பட்டு நிற்கும்போது அல்லது 1 மணி நேரம் டெலிமெட்ரி இல்லாமல் இருந்தால் தானாக ("Automatic end") முடிவடையும்.',
          },
          {
            title: "பயண ஆய்வாளரைத் திறக்கவும்",
            content:
              'Driving -> Journeys பகுதியைத் திறந்து எந்தவொரு பயணத்திலும் "Inspect journey" என்பதைக் கிளிக் செய்யவும்.',
          },
          {
            title: "KPI & எரிபொருள் திறனைப் பார்க்கவும்",
            content:
              "கால அளவு, தூரம் (km — OBD/GPS வேக ட்ரெப்சாய்டு மற்றும் GPS ஆயத்தொலைவுகள் வழியாக கணக்கிடப்படுகிறது), எரிபொருள் திறன் (L/100km / km/L), சராசரி/அதிகபட்ச வேகம் மற்றும் கடும் பிரேக்கிங் / வேக அதிகரிப்பு எண்ணிக்கைகளுக்கான மேல் KPI அட்டைகளைப் பார்க்கவும்.",
          },
          {
            title: "வரைபடத்தில் ஆபத்து இடத்தைக் கண்டறியவும்",
            content:
              'வேக வண்ணப் பாதை வரைபடத்தில் சரியான இடத்தைக் காண எந்தவொரு பாதுகாப்பு நிகழ்வு வரிசையிலும் "Locate danger" என்பதைக் கிளிக் செய்யவும்.',
          },
        ],
      },
      {
        key: "admin-4",
        number: "04",
        icon: "safety",
        tag: "பாதுகாப்பு & மேல்முறையீடுகள்",
        title: "பாதுகாப்பு மதிப்பெண்கள் & ஓட்டுநர் மேல்முறையீடுகளை முடிவு செய்தல்",
        summary:
          "திட்டத் தக்கவைப்பு காலத்திற்குள் ஓட்டுநர் பாதுகாப்பு மதிப்பெண்களைக் (`100 - 5 × observed நிகழ்வுகள்`) கண்காணித்து, ஓட்டுநர் மேல்முறையீடுகளை ஏற்கவும் அல்லது நிராகரிக்கவும்.",
        capabilities: [
          "திட்டத் தக்கவைப்பு காலத்திற்குள் `100 - 5 × observed நிகழ்வுகள்` அடிப்படையில் பாதுகாப்பு மதிப்பெண்களைக் கண்காணிக்கவும்.",
          "நிகழ்வு டெலிமெட்ரி சூழல் மற்றும் ஓட்டுநரின் விளக்கத்தை ஆய்வு செய்யவும்.",
          "உங்கள் சொந்த மேல்முறையீட்டை நீங்களே மதிப்பாய்வு செய்ய முடியாது; அங்கீகரிக்கப்பட்ட மற்றொரு மதிப்பாய்வாளர் முடிவு செய்ய வேண்டும்.",
          "மேல்முறையீட்டை ஏற்று (+5 புள்ளிகள் மீட்டமைக்கப்படும்) அல்லது எழுத்துப்பூர்வ காரணத்துடன் நிராகரிக்கவும்.",
        ],
        steps: [
          {
            title: "பாதுகாப்பு / மேல்முறையீடுகள் பகுதியைத் திறக்கவும்",
            content:
              "நிலுவையில் உள்ள ஓட்டுநர் மேல்முறையீடுகளைக் காண Driving -> Safety / Appeals பகுதிக்குச் செல்லவும்.",
          },
          {
            title: "நிலுவை மேல்முறையீட்டைத் தேர்ந்தெடுக்கவும்",
            content:
              "ஓட்டுநர் சமர்ப்பித்த நிலுவை மேல்முறையீட்டைத் தேர்ந்தெடுக்கவும் (குறிப்பு: உங்கள் சொந்த மேல்முறையீட்டை நீங்களே மதிப்பாய்வு செய்ய முடியாது).",
          },
          {
            title: "டெலிமெட்ரி சூழலை மதிப்பாய்வு செய்யவும்",
            content:
              "நிகழ்வின் டெலிமெட்ரி விவரங்களையும் ஓட்டுநரின் காரணத்தையும் ஒப்பிட்டுப் பார்க்கவும்.",
          },
          {
            title: "ஏற்கவும் அல்லது நிராகரிக்கவும்",
            content:
              "Approve (மதிப்பெண்ணிலிருந்து நிகழ்வை நீக்கி +5 புள்ளிகளை மீட்டமைக்கும்) அல்லது எழுத்துப்பூர்வ முடிவுக் காரணத்துடன் Reject என்பதைக் கிளிக் செய்யவும்.",
          },
        ],
      },
      {
        key: "admin-5",
        number: "05",
        icon: "tool",
        tag: "முன்னெச்சரிக்கை பராமரிப்பு",
        title: "பராமரிப்புத் தொகுதி",
        summary:
          "தூரம் (km) மற்றும்/அல்லது கால இடைவெளிகளின் அடிப்படையில் தொடர் பராமரிப்புத் திட்டங்களை உருவாக்கி, முந்தைய மைலேஜ் அடிப்படைகளை அமைத்து, முடிந்த சேவை சுழற்சிகளைப் பதிவு செய்யவும்.",
        capabilities: [
          "தூரம் (km) மற்றும்/அல்லது நாட்களின் அடிப்படையில் தொடர் பராமரிப்புத் திட்டங்களை உருவாக்கவும்.",
          "முந்தைய கையிருப்பு தூர (carry-in) அடிப்படைகளை அமைக்கவும்.",
          "சேவைத் தேதி மற்றும் பணிமனை குறிப்புகளுடன் முடிந்த சேவை சுழற்சிகளைப் பதிவு செய்யவும்.",
          "வாகன டெலிமெட்ரியிலிருந்து தானாகக் கணக்கிடப்படும் மீதமுள்ள தூரம் (km) மற்றும் நாட்களைக் கண்காணிக்கவும்.",
        ],
        steps: [
          {
            title: "பராமரிப்புத் திட்டம் உருவாக்கவும்",
            content:
              "Maintenance பகுதிக்குச் சென்று ஒரு வாகனத்தைத் தேர்ந்தெடுத்து Maintenance Plan உருவாக்கவும் (எ.கா. ஒவ்வொரு 10,000 km அல்லது 180 நாட்களுக்கும் எஞ்சின் எண்ணெய் சேவை).",
          },
          {
            title: "முடிந்த சேவை சுழற்சியைப் பதிவு செய்யவும்",
            content:
              "சேவைத் தேதி, பணிமனை குறிப்புகள் மற்றும் விருப்பமான carry-in தூரத்துடன் (km) Service Cycle பதிவை உருவாக்கவும்.",
          },
          {
            title: "மீதமுள்ள தூரம் & நாட்களைக் கண்காணிக்கவும்",
            content:
              "நேரலை வாகன டெலிமெட்ரியிலிருந்து தானாகக் கணக்கிடப்படும் மீதமுள்ள தூரம் (km) மற்றும் நாட்களைப் பார்க்கவும்.",
          },
        ],
      },
      {
        key: "admin-6",
        number: "06",
        icon: "file",
        tag: "சட்டபூர்வ புதுப்பிப்புகள்",
        title: "இணக்கத் தொகுதி",
        summary:
          "வாகனச் சட்டபூர்வ கடமைகளைக் (சாலை வரி, வாகனக் காப்பீடு, ஆய்வு / PUSPAKOM) கண்காணித்து, புதுப்பிப்பு ஆவணங்களைப் பதிவேற்றிச் சேவையக ஒப்புதல் அளிக்கவும்.",
        capabilities: [
          "சாலை வரி, வாகனக் காப்பீடு மற்றும் PUSPAKOM ஆய்வு காலாவதி தேதிகளைக் கண்காணிக்கவும்.",
          "நினைவூட்டல் கால வரம்புகளுடன் PDF/படப் புதுப்பிப்பு ஆதாரங்களைப் பதிவேற்றவும்.",
          "அங்கீகரிக்கப்பட்ட இணக்க மதிப்பாய்வாளர் மூலம் ஆவணத்தைச் சரிபார்த்து ஒப்புதல் அளிக்கவும்.",
        ],
        steps: [
          {
            title: "இணக்கக் கடமையை உருவாக்கவும்",
            content:
              "Compliance பகுதிக்குச் சென்று காலாவதி தேதி மற்றும் நினைவூட்டல் கால வரம்புடன் வாகனத்திற்கான கடமையை உருவாக்கவும்.",
          },
          {
            title: "புதுப்பிப்பு ஆவணத்தைப் பதிவேற்றவும்",
            content:
              "புதுப்பிப்பு PDF/பட ஆதாரத்தைப் பதிவேற்றி புதுப்பிப்பு குறிப்பு எண்ணைச் சமர்ப்பிக்கவும்.",
          },
          {
            title: "சரிபார்த்து ஒப்புதல் அளிக்கவும்",
            content:
              "அங்கீகரிக்கப்பட்ட இணக்க மதிப்பாய்வாளர் ஆவணத்தைச் சரிபார்த்துப் புதுப்பிப்புக்கு ஒப்புதல் அளித்து இணக்க நிலையைப் புதுப்பிப்பார்.",
          },
        ],
      },
      {
        key: "admin-7",
        number: "07",
        icon: "wifi",
        tag: "சிக்னல், பகுப்பாய்வு & தணிக்கை",
        title: "நெட்வொர்க் கவரேஜ், பகுப்பாய்வு, தணிக்கை பதிவுகள் & அமைப்புகள்",
        summary:
          "செல்லுலார் RSRP (dBm) மற்றும் SINR (dB) சிக்னல் வரைபடங்களைப் பார்க்கவும், 24 மணி நேரத்தில் 10,000 டெலிமெட்ரி மாதிரிகள் வரை CSV ஆக ஏற்றுமதி செய்யவும், CO₂/எரிபொருள் அறிக்கைகள், AI விளக்கங்களுடன் கூடிய API/தணிக்கை பதிவுகள் மற்றும் கடுமையான ஓட்டுநர் வரம்புகளை (m/s²) அமைக்கவும்.",
        capabilities: [
          "பாதைகளில் செல்லுலார் RSRP (dBm) மற்றும் SINR (dB) சிக்னல் தர வரைபடங்களை ஆய்வு செய்யவும்.",
          "24 மணி நேர சாளரத்திற்குள் 10,000 டெலிமெட்ரி மாதிரிகள் வரை CSV கோப்பாக ஏற்றுமதி செய்யவும்.",
          "30 நாள் தூரம், எரிபொருள், CO₂ மற்றும் பாதுகாப்புப் போக்கு அறிக்கைகளைப் பார்க்கவும்.",
          "AI விளக்கங்களுடன் கூடிய API/தணிக்கை பதிவுகளைப் பார்க்கவும் மற்றும் கடும் பிரேக்கிங்/வேக வரம்புகளை (m/s²) அமைக்கவும்.",
        ],
        steps: [
          {
            title: "நெட்வொர்க் கவரேஜ் & CSV ஏற்றுமதி",
            content:
              "பாதைகளில் செல்லுலார் சிக்னல் தரத்தைக் காண அல்லது 10,000 மாதிரிகள் வரை (24 மணி நேரம்) CSV ஏற்றுமதி செய்ய Analytics -> Coverage பகுதிக்குச் செல்லவும்.",
          },
          {
            title: "அறிக்கைகள் & தணிக்கை பதிவுகளைப் பார்க்கவும்",
            content:
              "30 நாள் தூரம், எரிபொருள், CO₂ மற்றும் பாதுகாப்புப் போக்குகளுக்கு Analytics -> Reports மற்றும் AI விளக்கங்களுடன் கூடிய API/தணிக்கை பதிவுகளுக்கு Administration -> Logs பகுதிக்குச் செல்லவும்.",
          },
          {
            title: "கடுமையான ஓட்டுநர் வரம்புகள் & சுருக்கங்களை அமைக்கவும்",
            content:
              "கடும் பிரேக்கிங்/வேக அதிகரிப்பு வரம்புகள் (m/s²), ஆஃப்லைன் கால அளவு மற்றும் தினசரி மின்னஞ்சல் சுருக்கங்களை அமைக்க Administration -> Settings பகுதிக்குச் செல்லவும்.",
          },
        ],
      },
    ],
    driverModules: [
      {
        key: "driver-1",
        number: "01",
        icon: "idcard",
        tag: "பணி நேர அங்கீகாரம்",
        title: "உங்கள் பணி நேரத்தைத் தொடங்குதல் & முடித்தல்",
        summary:
          "பயணங்கள் மற்றும் டெலிமெட்ரி உங்களுக்குத் துல்லியமாகப் பதியப்பட ஒதுக்கப்பட்ட வாகனத்தில் உங்கள் ஓட்டுநர் பணி நேரத்தை அங்கீகரிக்கவும்.",
        capabilities: [
          "வாகன Telemetry Kit ரீடரில் உங்கள் பதிவுசெய்யப்பட்ட NFC அட்டையைத் தட்டிப் பணியைத் தொடங்கவும்.",
          "Driver Portal -> My Shifts பகுதியில் செயலில் உள்ள பணி நேரத்தைச் சரிபார்க்கவும்.",
        ],
        steps: [
          {
            title: "வாகனம் ஓட்டும் முன் NFC அட்டையைத் தட்டவும்",
            content:
              "ஓட்டுவதற்கு முன் வாகனத்தின் Telemetry Kit ரீடரில் உங்கள் NFC ஓட்டுநர் அட்டையைத் தட்டவும் (அல்லது Driver Portal -> My Shifts பகுதியில் செயலில் உள்ள பணி நேரத்தைப் பார்க்கவும்).",
          },
          {
            title: "வழக்கம் போல் ஓட்டவும்",
            content:
              "வழக்கம் போல் ஓட்டவும்; டெலிமெட்ரி மற்றும் பயணங்கள் தானாகப் பதிவு செய்யப்படும்.",
          },
          {
            title: "முடிந்ததும் பணி நேரத்தை முடிக்கவும்",
            content:
              "பணி முடிந்ததும் மீண்டும் NFC அட்டையைத் தட்டவும் அல்லது போர்ட்டலில் பணி நேரத்தை முடிக்கவும்.",
          },
        ],
      },
      {
        key: "driver-2",
        number: "02",
        icon: "compass",
        tag: "பயணங்கள் & பாதை வரைபடம்",
        title: "எனது பயணங்கள், பாதை வரைபடங்கள் & எரிபொருள் திறனைப் பார்த்தல்",
        summary:
          "உங்கள் சொந்த ஓட்டுநர் வரலாறு, வேக வண்ண GPS பாதைகள், பயண தூரம் மற்றும் எரிபொருள் பயன்பாட்டை மதிப்பாய்வு செய்யவும்.",
        capabilities: [
          "உங்கள் தனிப்பட்ட பயண வரலாறு மற்றும் வேக வண்ண GPS பாதைகளைப் பார்க்கவும்.",
          "பயண தூர மதிப்பீடு, எரிபொருள் பயன்பாடு மற்றும் கடும் நிகழ்வு குறியீடுகளைப் பார்க்கவும்.",
        ],
        steps: [
          {
            title: "My Trips பகுதியைத் திறக்கவும்",
            content:
              "உங்கள் பயண வரலாற்றைக் காண Driver Portal -> My Trips பகுதியைத் திறக்கவும்.",
          },
          {
            title: "பயணப் பிரிவைத் தேர்ந்தெடுக்கவும்",
            content:
              "பாதை வரைபடம், வேக விவரம், தூர மதிப்பீடு மற்றும் கடும் நிகழ்வு குறியீடுகளைத் திறக்க எந்தவொரு பயணப் பிரிவையும் கிளிக் செய்யவும்.",
          },
        ],
      },
      {
        key: "driver-3",
        number: "03",
        icon: "safety",
        tag: "மதிப்பெண் & மேல்முறையீடு",
        title: "எனது பாதுகாப்பு மதிப்பெண்ணைச் சரிபார்த்தல் & மேல்முறையீடு சமர்ப்பித்தல்",
        summary:
          "உங்கள் தற்போதைய பாதுகாப்பு மதிப்பெண்ணை (0–100) கண்காணித்து, தவிர்க்க முடியாத சாலை ஆபத்து அல்லது தற்காப்பு நடவடிக்கையால் ஏற்பட்ட நிகழ்வுகளுக்கு மேல்முறையீடு சமர்ப்பிக்கவும்.",
        capabilities: [
          "உங்கள் தற்போதைய 0–100 பாதுகாப்பு மதிப்பெண்ணைக் கண்காணிக்கவும்.",
          "`observed` பாதுகாப்பு நிகழ்வுகளுக்குத் தெளிவான சூழல் விளக்கத்துடன் மேல்முறையீடு சமர்ப்பிக்கவும்.",
        ],
        steps: [
          {
            title: "My Safety / Records பகுதியைத் திறக்கவும்",
            content:
              "உங்கள் மதிப்பெண் மற்றும் பதிவுகளைக் காண Driver Portal -> My Safety / Records பகுதியைத் திறக்கவும்.",
          },
          {
            title: "Observed நிகழ்வைக் கண்டறியவும்",
            content:
              'நீங்கள் மேல்முறையீடு செய்ய விரும்பும் "observed" பாதுகாப்பு நிகழ்வைக் கண்டறியவும்.',
          },
          {
            title: "மேல்முறையீட்டைச் சமர்ப்பிக்கவும்",
            content:
              '"Submit Appeal" என்பதைக் கிளிக் செய்து போக்குவரத்து/சாலை சூழல் குறித்த தெளிவான விளக்கத்தை உள்ளிடவும்.',
          },
          {
            title: "ஒப்புதல் மற்றும் மதிப்பெண் மீட்டமைப்பு",
            content:
              'அங்கீகரிக்கப்பட்ட இணக்க மதிப்பாய்வாளர் உங்கள் மேல்முறையீட்டை ஏற்றவுடன், நிகழ்வு நிலை "excluded" ஆக மாறி 5 புள்ளிகள் உங்கள் மதிப்பெண்ணில் மீட்டமைக்கப்படும்.',
          },
        ],
      },
      {
        key: "driver-4",
        number: "04",
        icon: "car",
        tag: "பயண முன் சோதனை",
        title: "தற்போதைய வாகனப் பராமரிப்பு & இணக்க நிலையைச் சரிபார்த்தல்",
        summary:
          "நீங்கள் தற்போது இயக்கும் வாகனத்தில் செல்லுபடியாகும் சாலை வரி, காப்பீடு மற்றும் புதுப்பிக்கப்பட்ட பராமரிப்பு உள்ளதா என்பதை உறுதிப்படுத்தவும்.",
        capabilities: [
          "புறப்படும் முன் தற்போதைய வாகனத்தின் சாலை வரி, காப்பீடு மற்றும் பராமரிப்பு நிலையை உறுதிப்படுத்தவும்.",
        ],
        steps: [
          {
            title: "செயலில் உள்ள பணி நேரத்தில் Vehicle Info பார்க்கவும்",
            content:
              "புறப்படும் முன் தற்போதைய இணக்கம் மற்றும் பராமரிப்பு நிலையை ஆய்வு செய்ய, செயலில் உள்ள பணி நேரத்தின் போது Driver Portal -> Vehicle Info பகுதியைத் திறக்கவும்.",
          },
        ],
      },
    ],
  },
};

function renderModulesAccordion(
  modules: ManualModule[],
  activeKeys: string[],
  onChange: (keys: string[]) => void,
  content: ManualLocaleContent,
) {
  return (
    <Collapse
      activeKey={activeKeys}
      onChange={onChange}
      size="large"
      style={{
        background: "transparent",
        border: "none",
      }}
      items={modules.map((mod) => ({
        key: mod.key,
        style: {
          marginBottom: 16,
          background: "#ffffff",
          borderRadius: 10,
          border: "1px solid var(--nb-grid, #dce6f5)",
          boxShadow: "0 2px 8px rgba(14, 34, 64, 0.04)",
          overflow: "hidden",
        },
        label: (
          <Space wrap align="center" size={10}>
            <Tag
              color="blue"
              style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              {mod.number}
            </Tag>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--nb-blue-wash, #e8f1ff)",
                color: "var(--nb-blue, #1677ff)",
                fontSize: 15,
              }}
            >
              {renderModuleIcon(mod.icon)}
            </span>
            <Text strong style={{ fontSize: 16, color: "var(--nb-ink)" }}>
              {mod.title}
            </Text>
            <Tag>{mod.tag}</Tag>
          </Space>
        ),
        children: (
          <div style={{ paddingTop: 4 }}>
            <Paragraph
              style={{
                fontSize: 15,
                color: "var(--nb-graphite-text, #4e617d)",
                marginBottom: 20,
              }}
            >
              {mod.summary}
            </Paragraph>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={10}>
                <Card
                  size="small"
                  style={{
                    height: "100%",
                    background: "var(--nb-paper, #fbfcfe)",
                    borderColor: "var(--nb-grid, #dce6f5)",
                    borderRadius: 8,
                  }}
                  title={
                    <Space size={8}>
                      <CheckCircleOutlined
                        style={{ color: "var(--nb-blue, #1677ff)" }}
                      />
                      <span>{content.whatYouCanDoLabel}</span>
                    </Space>
                  }
                >
                  <Space
                    orientation="vertical"
                    size={10}
                    style={{ width: "100%" }}
                  >
                    {mod.capabilities.map((cap, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <CheckCircleOutlined
                          style={{
                            color: "#16a34a",
                            marginTop: 4,
                            flexShrink: 0,
                          }}
                        />
                        <Text style={{ lineHeight: 1.6 }}>{cap}</Text>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card
                  size="small"
                  style={{
                    height: "100%",
                    borderColor: "var(--nb-grid, #dce6f5)",
                    borderRadius: 8,
                  }}
                  title={
                    <Space size={8}>
                      <BookOutlined
                        style={{ color: "var(--nb-blue, #1677ff)" }}
                      />
                      <span>{content.stepByStepLabel}</span>
                    </Space>
                  }
                >
                  <Steps
                    orientation="vertical"
                    size="small"
                    items={mod.steps.map((step) => ({
                      status: "process",
                      title: (
                        <Text strong style={{ color: "var(--nb-ink)" }}>
                          {step.title}
                        </Text>
                      ),
                      content: (
                        <Paragraph
                          style={{
                            marginBottom: 8,
                            color: "var(--nb-graphite-text, #4e617d)",
                            lineHeight: 1.6,
                          }}
                        >
                          {step.content}
                        </Paragraph>
                      ),
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ),
      }))}
    />
  );
}

export function UserManual() {
  const app = useApp();
  const navigate = useNavigate();
  const scrollToSection = useLandingNavigation();

  const locale: Locale = app.locale in MANUAL_CONTENT ? app.locale : "en";
  const content = MANUAL_CONTENT[locale];

  const allAdminKeys = content.adminModules.map((m) => m.key);
  const allDriverKeys = content.driverModules.map((m) => m.key);

  const [activeTab, setActiveTab] = useState<string>("admin");
  const [adminOpenKeys, setAdminOpenKeys] = useState<string[]>(allAdminKeys);
  const [driverOpenKeys, setDriverOpenKeys] = useState<string[]>(allDriverKeys);

  return (
    <div className="public-page carlink-landing">
      <PublicHeader />

      <main style={{ minHeight: "80vh", padding: "40px 16px 80px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Breadcrumb
            style={{ marginBottom: 20 }}
            items={[
              {
                title: (
                  <Link to="/">
                    <CarOutlined /> {content.homeBreadcrumb}
                  </Link>
                ),
              },
              {
                title: (
                  <span>
                    <BookOutlined /> {content.manualBreadcrumb}
                  </span>
                ),
              },
            ]}
          />

          <div style={{ marginBottom: 28 }}>
            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color="blue" icon={<BookOutlined />}>
                {content.badge}
              </Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {content.versionMeta}
              </Text>
            </Space>

            <Title
              level={1}
              style={{ marginTop: 0, marginBottom: 10, fontSize: 32 }}
            >
              {content.heroTitle}
            </Title>
            <Paragraph
              style={{
                fontSize: 16,
                color: "var(--nb-graphite-text, #4e617d)",
                maxWidth: 840,
                marginBottom: 20,
              }}
            >
              {content.heroSubtitle}
            </Paragraph>

            <Alert
              type="info"
              showIcon
              icon={<CheckCircleOutlined />}
              title={content.browserAlertTitle}
              description={content.browserNotice}
            />
          </div>

          <Card
            style={{
              borderRadius: 10,
              boxShadow: "0 2px 10px rgba(14, 34, 64, 0.05)",
              border: "1px solid var(--nb-grid, #dce6f5)",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              items={[
                {
                  key: "admin",
                  label: (
                    <Space size={8}>
                      <AuditOutlined />
                      <span>{content.tabAdminLabel}</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 18,
                        }}
                      >
                        <Space wrap>
                          <Tag color="geekblue" icon={<AuditOutlined />}>
                            {content.adminBadgeLabel}
                          </Tag>
                        </Space>
                        <Space size={8}>
                          <Button
                            size="small"
                            onClick={() => setAdminOpenKeys(allAdminKeys)}
                          >
                            {content.expandAllLabel}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setAdminOpenKeys([])}
                          >
                            {content.collapseAllLabel}
                          </Button>
                        </Space>
                      </div>

                      <Paragraph
                        style={{
                          fontSize: 15,
                          color: "var(--nb-graphite-text, #4e617d)",
                          marginBottom: 20,
                        }}
                      >
                        {content.tabAdminIntro}
                      </Paragraph>

                      {renderModulesAccordion(
                        content.adminModules,
                        adminOpenKeys,
                        (keys) => setAdminOpenKeys(keys),
                        content,
                      )}
                    </div>
                  ),
                },
                {
                  key: "driver",
                  label: (
                    <Space size={8}>
                      <IdcardOutlined />
                      <span>{content.tabDriverLabel}</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 18,
                        }}
                      >
                        <Space wrap>
                          <Tag color="cyan" icon={<IdcardOutlined />}>
                            {content.driverBadgeLabel}
                          </Tag>
                        </Space>
                        <Space size={8}>
                          <Button
                            size="small"
                            onClick={() => setDriverOpenKeys(allDriverKeys)}
                          >
                            {content.expandAllLabel}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setDriverOpenKeys([])}
                          >
                            {content.collapseAllLabel}
                          </Button>
                        </Space>
                      </div>

                      <Paragraph
                        style={{
                          fontSize: 15,
                          color: "var(--nb-graphite-text, #4e617d)",
                          marginBottom: 20,
                        }}
                      >
                        {content.tabDriverIntro}
                      </Paragraph>

                      {renderModulesAccordion(
                        content.driverModules,
                        driverOpenKeys,
                        (keys) => setDriverOpenKeys(keys),
                        content,
                      )}
                    </div>
                  ),
                },
              ]}
            />

            <Divider />

            <Alert
              type="success"
              showIcon
              icon={<MailOutlined />}
              title={content.supportBannerTitle}
              description={
                <Space orientation="vertical" size={4}>
                  <Text>{content.supportBannerDesc}</Text>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    style={{ fontWeight: 600 }}
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </Space>
              }
            />
          </Card>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {content.backLabel}
            </Button>
            <Space wrap>
              <Link to="/terms">
                <Button type="link">{content.termsLabel}</Button>
              </Link>
              <span>·</span>
              <Link to="/privacy">
                <Button type="link">{content.privacyLabel}</Button>
              </Link>
              <span>·</span>
              <Link to="/user_manual">
                <Button type="link">{content.manualLabel}</Button>
              </Link>
            </Space>
          </div>
        </div>
      </main>

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
              <div style={{ marginTop: 14 }}>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
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
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>

            <div className="ed-footer-col">
              <strong>{app.t("ed_footer_story_col")}</strong>
              <button
                type="button"
                onClick={() => scrollToSection("chapter-1")}
              >
                {app.t("ed_nav_story")}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("chapter-2")}
              >
                {app.t("ed_nav_tap")}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("chapter-3")}
              >
                {app.t("ed_nav_route")}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("chapter-4")}
              >
                {app.t("ed_nav_telemetry")}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("chapter-5")}
              >
                {app.t("ed_nav_fleet")}
              </button>
            </div>

            <div className="ed-footer-col">
              <strong>{app.t("ed_footer_platform_col")}</strong>
              <button type="button" onClick={() => scrollToSection("pricing")}>
                {app.t("ed_nav_plans")}
              </button>
              <Link to="/signup">{app.t("ed_ch1_cta_primary")}</Link>
              <Link to="/console">
                {app.session
                  ? app.t("ed_ch1_cta_secondary")
                  : app.t("ed_ch1_cta_signin")}
              </Link>
              <Link to="/terms">{content.termsLabel}</Link>
              <Link to="/privacy">{content.privacyLabel}</Link>
              <Link to="/user_manual">{content.manualLabel}</Link>
            </div>

            <div className="ed-footer-col">
              <strong>{content.supportColTitle}</strong>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--nb-blue, #1677ff)",
                }}
              >
                <MailOutlined />
                {SUPPORT_EMAIL}
              </a>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--nb-graphite-text)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {content.supportColDesc}
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
            <PaymentBadges label={content.weAcceptLabel} />
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 12.5,
              color: "var(--nb-graphite-text, #4e617d)",
              lineHeight: 1.5,
            }}
          >
            {content.browserNotice}
          </div>

          <div className="ed-footer-bottom">
            <span>{app.t("ed_footer_note")}</span>
            <span>{content.brandFooterText}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
