import { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  EnvironmentOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export interface FleetInterfacePreviewProps {
  t: (k: string) => string;
}

type PreviewMode = "map" | "telemetry" | "compliance";

interface RouteSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface VehiclePreviewRecord {
  id: string;
  label: string;
  driver: string;
  speed: string;
  signal: string;
  voltage: string;
  harshPin: { x: number; y: number };
  segments: readonly RouteSegment[];
}

const BLUE = "#1677FF";
const SKY = "#0284C7";
const AMBER = "#F59E0B";
const AMBER_TEXT = "#92400E";
const INK = "#0E2240";
const MUTED = "#4E617D";
const PAPER = "#FBFCFE";
const WHITE = "#FFFFFF";
const BORDER = "#CBD8EA";
const BLUE_WASH = "#E8F1FF";

const VEHICLES: readonly VehiclePreviewRecord[] = [
  {
    id: "wxa-4821",
    label: "WXA 4821 · Proton Exora",
    driver: "Azman H. · NFC #04",
    speed: "62 km/h",
    signal: "-74 dBm · 4G",
    voltage: "13.9 V",
    harshPin: { x: 356, y: 122 },
    segments: [
      { x1: 72, y1: 214, x2: 128, y2: 196, color: BLUE },
      { x1: 128, y1: 196, x2: 184, y2: 176, color: BLUE },
      { x1: 184, y1: 176, x2: 242, y2: 148, color: SKY },
      { x1: 242, y1: 148, x2: 300, y2: 130, color: SKY },
      { x1: 300, y1: 130, x2: 356, y2: 122, color: AMBER },
      { x1: 356, y1: 122, x2: 418, y2: 96, color: BLUE },
      { x1: 418, y1: 96, x2: 484, y2: 74, color: BLUE },
    ],
  },
  {
    id: "bqa-9104",
    label: "BQA 9104 · Perodua Alza",
    driver: "Mei Ling T. · NFC #11",
    speed: "48 km/h",
    signal: "-81 dBm · 4G",
    voltage: "14.1 V",
    harshPin: { x: 266, y: 188 },
    segments: [
      { x1: 86, y1: 92, x2: 146, y2: 118, color: BLUE },
      { x1: 146, y1: 118, x2: 206, y2: 152, color: BLUE },
      { x1: 206, y1: 152, x2: 266, y2: 188, color: AMBER },
      { x1: 266, y1: 188, x2: 332, y2: 204, color: SKY },
      { x1: 332, y1: 204, x2: 404, y2: 196, color: BLUE },
      { x1: 404, y1: 196, x2: 472, y2: 172, color: BLUE },
    ],
  },
  {
    id: "vfr-7550",
    label: "VFR 7550 · Toyota Hiace",
    driver: "Farid R. · NFC #07",
    speed: "76 km/h",
    signal: "-69 dBm · 4G",
    voltage: "13.8 V",
    harshPin: { x: 312, y: 92 },
    segments: [
      { x1: 68, y1: 154, x2: 130, y2: 144, color: SKY },
      { x1: 130, y1: 144, x2: 192, y2: 120, color: SKY },
      { x1: 192, y1: 120, x2: 254, y2: 96, color: BLUE },
      { x1: 254, y1: 96, x2: 312, y2: 92, color: AMBER },
      { x1: 312, y1: 92, x2: 382, y2: 116, color: BLUE },
      { x1: 382, y1: 116, x2: 456, y2: 138, color: BLUE },
    ],
  },
];

interface ComplianceTrackItem {
  id: string;
  titleKey: string;
  plate: string;
  statusKey: string;
  tone: "warm" | "neutral" | "blue";
}

const COMPLIANCE_TRACKS: readonly ComplianceTrackItem[] = [
  {
    id: "roadtax",
    titleKey: "ed_preview_comp_roadtax",
    plate: "WXA 4821",
    statusKey: "ed_preview_due_14d",
    tone: "warm",
  },
  {
    id: "insurance",
    titleKey: "ed_preview_comp_insurance",
    plate: "BQA 9104",
    statusKey: "ed_preview_due_42d",
    tone: "neutral",
  },
  {
    id: "puspakom",
    titleKey: "ed_preview_comp_puspakom",
    plate: "VFR 7550",
    statusKey: "ed_preview_due_ok",
    tone: "blue",
  },
  {
    id: "service",
    titleKey: "ed_preview_comp_service",
    plate: "WXA 4821",
    statusKey: "ed_preview_due_680km",
    tone: "warm",
  },
];

const PILL_STYLES: Record<
  ComplianceTrackItem["tone"],
  { bg: string; color: string; border: string }
> = {
  warm: { bg: "#FEF3C7", color: AMBER_TEXT, border: "#FCD34D" },
  neutral: { bg: "#F1F5FA", color: MUTED, border: BORDER },
  blue: { bg: BLUE_WASH, color: "#0958D9", border: "#BFD8FA" },
};

/**
 * Quiet, hairline-framed interactive preview of the CarLink fleet console.
 */
export function FleetInterfacePreview({ t }: FleetInterfacePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("map");
  const [selectedId, setSelectedId] = useState<string>(VEHICLES[0].id);

  const selectedVehicle =
    VEHICLES.find((v) => v.id === selectedId) ?? VEHICLES[0];

  const telemetryMetrics = [
    {
      label: t("ed_preview_speed"),
      value: "62 km/h",
      field: "speed_kmh",
      accent: BLUE,
    },
    {
      label: t("ed_preview_voltage"),
      value: "13.9 V",
      field: "ecu_voltage_v",
      accent: AMBER_TEXT,
    },
    {
      label: t("ed_preview_fuel"),
      value: "2.4 L/h",
      field: "rateLph",
      accent: INK,
    },
    {
      label: t("ed_preview_mil"),
      value: t("ed_preview_mil_clear"),
      field: "mil_on",
      accent: BLUE,
    },
  ];

  return (
    <div className="ed-preview-frame">
      <div className="ed-preview-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: INK,
            }}
          >
            {t("ed_preview_caption")}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#0958D9",
              backgroundColor: BLUE_WASH,
              border: "1px solid #BFD8FA",
              padding: "2px 9px",
              borderRadius: 999,
            }}
          >
            {t("ed_preview_badge")}
          </span>
        </div>

        <Space size={6} wrap>
          <Button
            size="small"
            type={mode === "map" ? "primary" : "default"}
            icon={<EnvironmentOutlined />}
            onClick={() => setMode("map")}
          >
            {t("ed_preview_tab_map")}
          </Button>
          <Button
            size="small"
            type={mode === "telemetry" ? "primary" : "default"}
            icon={<LineChartOutlined />}
            onClick={() => setMode("telemetry")}
          >
            {t("ed_preview_tab_telemetry")}
          </Button>
          <Button
            size="small"
            type={mode === "compliance" ? "primary" : "default"}
            icon={<SafetyCertificateOutlined />}
            onClick={() => setMode("compliance")}
          >
            {t("ed_preview_tab_compliance")}
          </Button>
        </Space>
      </div>

      <div className="ed-preview-body">
        {mode === "map" && (
          <div className="ed-preview-map-grid">
            <div
              style={{
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                overflow: "hidden",
                backgroundColor: PAPER,
              }}
            >
              <svg
                viewBox="0 0 560 280"
                width="100%"
                role="img"
                aria-label={t("ed_preview_tab_map")}
                style={{ display: "block" }}
              >
                <rect width={560} height={280} fill="#F4F7FC" />
                <rect
                  x={28}
                  y={24}
                  width={118}
                  height={74}
                  rx={6}
                  fill={BLUE_WASH}
                />
                <rect
                  x={392}
                  y={178}
                  width={132}
                  height={76}
                  rx={6}
                  fill={BLUE_WASH}
                />
                <rect
                  x={228}
                  y={22}
                  width={96}
                  height={46}
                  rx={4}
                  fill={BLUE_WASH}
                />

                <g stroke={WHITE} strokeLinecap="round">
                  <line x1={0} y1={146} x2={560} y2={112} strokeWidth={8} />
                  <line x1={0} y1={226} x2={560} y2={198} strokeWidth={6} />
                  <line x1={164} y1={0} x2={192} y2={280} strokeWidth={7} />
                  <line x1={342} y1={0} x2={376} y2={280} strokeWidth={7} />
                  <path
                    d="M 44 252 Q 248 164, 520 62"
                    fill="none"
                    stroke={WHITE}
                    strokeWidth={7}
                  />
                </g>

                {VEHICLES.filter((v) => v.id !== selectedVehicle.id).map(
                  (v) => (
                    <g key={v.id} opacity={0.4}>
                      {v.segments.map((seg, idx) => (
                        <line
                          key={idx}
                          x1={seg.x1}
                          y1={seg.y1}
                          x2={seg.x2}
                          y2={seg.y2}
                          stroke="#7A8CA8"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                  ),
                )}

                <g>
                  {selectedVehicle.segments.map((seg, idx) => (
                    <line
                      key={idx}
                      x1={seg.x1}
                      y1={seg.y1}
                      x2={seg.x2}
                      y2={seg.y2}
                      stroke={seg.color}
                      strokeWidth={3.6}
                      strokeLinecap="round"
                    />
                  ))}
                  {selectedVehicle.segments.map((seg, idx) => (
                    <circle
                      key={`start-${idx}`}
                      cx={seg.x1}
                      cy={seg.y1}
                      r={3.5}
                      fill={WHITE}
                      stroke={seg.color}
                      strokeWidth={1.6}
                    />
                  ))}
                  {(() => {
                    const last =
                      selectedVehicle.segments[
                        selectedVehicle.segments.length - 1
                      ];
                    return (
                      <circle
                        cx={last.x2}
                        cy={last.y2}
                        r={4.2}
                        fill={BLUE}
                        stroke={WHITE}
                        strokeWidth={1.8}
                      />
                    );
                  })()}
                </g>

                <g
                  transform={`translate(${selectedVehicle.harshPin.x}, ${selectedVehicle.harshPin.y})`}
                >
                  <circle r={14} fill="#FEF3C7" opacity={0.95} />
                  <polygon
                    points="0,-9 8,6 -8,6"
                    fill={WHITE}
                    stroke={AMBER}
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                  />
                  <line
                    x1={0}
                    y1={-4}
                    x2={0}
                    y2={0.5}
                    stroke={AMBER}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <circle cx={0} cy={3.2} r={1} fill={AMBER} />
                  <g transform="translate(13, -10)">
                    <rect
                      x={0}
                      y={-11}
                      width={98}
                      height={20}
                      rx={4}
                      fill={WHITE}
                      stroke="#FCD34D"
                      strokeWidth={1}
                    />
                    <text
                      x={8}
                      y={2.5}
                      fill={AMBER_TEXT}
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      {t("ed_preview_harsh_pin")}
                    </text>
                  </g>
                </g>
              </svg>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 12px",
                  backgroundColor: WHITE,
                  borderTop: `1px solid ${BORDER}`,
                  fontSize: 12,
                  color: MUTED,
                  flexWrap: "wrap",
                }}
              >
                <span>{t("ed_preview_speed_legend")}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {[BLUE, SKY, AMBER].map((swatch) => (
                    <span
                      key={swatch}
                      style={{
                        width: 16,
                        height: 4,
                        borderRadius: 999,
                        backgroundColor: swatch,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>

            <div className="ed-preview-fleet-rail">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {VEHICLES.map((vehicle) => {
                  const active = vehicle.id === selectedVehicle.id;
                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(vehicle.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: `1px solid ${active ? BLUE : BORDER}`,
                        backgroundColor: active ? BLUE_WASH : WHITE,
                        color: INK,
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span>{vehicle.label}</span>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: active ? BLUE : "#7A8CA8",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="ed-preview-kv-grid tabular">
                {[
                  {
                    label: t("ed_preview_driver"),
                    val: selectedVehicle.driver,
                  },
                  { label: t("ed_preview_speed"), val: selectedVehicle.speed },
                  {
                    label: t("ed_preview_signal"),
                    val: selectedVehicle.signal,
                  },
                  {
                    label: t("ed_preview_voltage"),
                    val: selectedVehicle.voltage,
                  },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      backgroundColor: PAPER,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}
                    >
                      {cell.label}
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: INK }}
                    >
                      {cell.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "telemetry" && (
          <div className="ed-preview-telemetry-grid">
            <div
              className="tabular"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
              }}
            >
              {telemetryMetrics.map((metric) => (
                <Tooltip key={metric.field} title={metric.field}>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: PAPER,
                      border: `1px solid ${BORDER}`,
                      cursor: "help",
                    }}
                  >
                    <div
                      style={{ fontSize: 12, color: MUTED, marginBottom: 3 }}
                    >
                      {metric.label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: metric.accent,
                      }}
                    >
                      {metric.value}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>

            <div
              style={{
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                backgroundColor: WHITE,
                padding: "10px 12px",
              }}
            >
              <svg
                viewBox="0 0 640 160"
                width="100%"
                role="img"
                aria-label={t("ed_preview_tab_telemetry")}
                style={{ display: "block" }}
              >
                {[32, 68, 104, 136].map((gy) => (
                  <line
                    key={gy}
                    x1={20}
                    y1={gy}
                    x2={620}
                    y2={gy}
                    stroke="#DCE6F5"
                    strokeWidth={0.9}
                  />
                ))}

                <path
                  d="M 24 114 C 78 112, 114 54, 168 58 C 222 62, 252 104, 306 94 C 350 86, 378 44, 424 46 C 460 48, 474 106, 508 98 C 546 90, 582 68, 616 70"
                  fill="none"
                  stroke={BLUE}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />

                <path
                  d="M 24 126 C 110 124, 176 118, 260 120 C 340 122, 420 116, 500 124 C 550 128, 588 122, 616 122"
                  fill="none"
                  stroke="#7A8CA8"
                  strokeWidth={1.65}
                  strokeLinecap="round"
                />

                <g transform="translate(476, 82)">
                  <circle r={9} fill="#FEF3C7" />
                  <circle
                    r={4}
                    fill={AMBER}
                    stroke={WHITE}
                    strokeWidth={1.5}
                  />
                  <text
                    x={12}
                    y={4}
                    fill={AMBER_TEXT}
                    style={{ fontSize: 11, fontWeight: 600 }}
                  >
                    {t("ed_preview_harsh_pin")}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {mode === "compliance" && (
          <div className="ed-preview-compliance-list">
            {COMPLIANCE_TRACKS.map((item) => {
              const pill = PILL_STYLES[item.tone];
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "11px 14px",
                    borderRadius: 8,
                    backgroundColor: WHITE,
                    border: `1px solid ${BORDER}`,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: INK,
                      }}
                    >
                      {t(item.titleKey)}
                    </span>
                    <span
                      className="tabular"
                      style={{
                        fontSize: 12.5,
                        color: MUTED,
                      }}
                    >
                      {item.plate}
                    </span>
                  </div>

                  <span
                    className="tabular"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      backgroundColor: pill.bg,
                      color: pill.color,
                      border: `1px solid ${pill.border}`,
                    }}
                  >
                    {t(item.statusKey)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
