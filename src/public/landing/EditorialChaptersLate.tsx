import { useRef } from "react";
import {
  NB_AMBER,
  NB_BLUE,
  NB_BLUE_WASH,
  NB_GRAPHITE,
  NB_GRAPHITE_TEXT,
  NB_GRID,
  NB_INK,
  NB_PAPER,
  PencilHatch,
  SketchAnnotation,
  SketchPath,
  clamp,
  drawVars,
  type EditorialChapterProps,
} from "./EditorialChaptersEarly";
import { usePathPose } from "./useScrollJourney";

/* ============================================================================
 * Chapter 4 — Unified sketched instrument cluster (gauge + fuel rate + battery)
 * with live ink speed graph underneath.
 * Ink spine routes cleanly along left margin (x=52) into the speed graph:
 * Seam entry: (340, 0) -> Seam exit: (340, 460). Nothing overlaps text or gauge.
 * ========================================================================== */

const CH4_SPEED_WAVE_D =
  "M 96 344 C 148 344, 174 274, 226 278 C 276 282, 296 352, 344 338 C 392 324, 418 258, 466 266 C 508 273, 530 330, 588 316";

export function ChapterFourTelemetry({
  progress,
  reducedMotion,
  t,
}: EditorialChapterProps) {
  const speedWaveRef = useRef<SVGPathElement | null>(null);
  const p = reducedMotion ? 1 : clamp(progress, 0, 1);

  const waveP = reducedMotion ? 0.85 : clamp((p - 0.16) / 0.68, 0, 1);
  const speedPose = usePathPose(speedWaveRef, waveP, {
    x: 96,
    y: 344,
    angle: 0,
  });

  // Gauge needle sweeps from -120 deg (idle) to +28 deg (cruise load)
  const needleAngle = reducedMotion ? 24 : -120 + 148 * clamp(p / 0.78, 0, 1);

  return (
    <svg
      className="nb-scene-svg"
      viewBox="0 0 680 460"
      role="img"
      aria-label={t("ed_ch4_scene_aria")}
    >
      {/* Continuous blue ink line entering cleanly at (340, 0) and routing outside the cluster (x=52) to speed graph start (96, 344) */}
      <SketchPath
        d="M 340 0 C 340 24, 52 18, 52 110 L 52 320 C 52 344, 68 344, 96 344"
        stroke={NB_BLUE}
        strokeWidth={2.35}
        style={drawVars(0, 0.34)}
      />

      {/* Unified Dashboard Instrument Cluster Panel (x=104..596, y=46..210) */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Panel paper fill + soft bevel header wash */}
        <rect
          x="104"
          y="46"
          width="492"
          height="164"
          rx="10"
          fill={NB_PAPER}
        />
        <path
          d="M 106 56 Q 106 48 114 48 L 586 48 Q 594 48 594 56 L 594 72 L 106 72 Z"
          fill={NB_BLUE_WASH}
          fillOpacity="0.6"
        />
        {/* Outer hand-sketched double-stroke cluster frame with corner overshoot */}
        <SketchPath
          d="M 98 46 L 586 46 Q 596 46 596 56 L 596 200 Q 596 210 586 210 L 114 210 Q 104 210 104 200 L 104 40"
          stroke={NB_GRAPHITE}
          strokeWidth={1.6}
          secondOpacity={0.35}
          style={drawVars(0.05, 0.36)}
        />
        {/* Internal divider separating dial gauge (left) from digital readouts (right) */}
        <line
          x1="274"
          y1="62"
          x2="274"
          y2="196"
          stroke={NB_GRID}
          strokeWidth="1.4"
        />
        {/* Subtle pencil hatching along bottom panel edge */}
        <PencilHatch x={122} y={208} count={14} step={12} dx={6} dy={-5} opacity={0.35} />

        {/* Left inside cluster: Analog Engine Load / Fuel Dial Gauge (cx=188, cy=130) */}
        <path
          d="M 142 152 A 50 50 0 1 1 234 152"
          fill="none"
          stroke={NB_BLUE_WASH}
          strokeWidth="10"
        />
        <SketchPath
          d="M 132 130 A 56 56 0 1 1 244 130 A 56 56 0 1 1 132 130"
          stroke={NB_BLUE}
          strokeWidth={1.85}
          style={drawVars(0.08, 0.4)}
        />
        <g stroke={NB_GRAPHITE} strokeWidth="1.35">
          {[-125, -90, -55, -20, 15, 50].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={188 + Math.cos(rad) * 40}
                y1={130 + Math.sin(rad) * 40}
                x2={188 + Math.cos(rad) * 49}
                y2={130 + Math.sin(rad) * 49}
              />
            );
          })}
        </g>
        <path
          d="M 222 104 A 46 46 0 0 1 232 134"
          fill="none"
          stroke={NB_AMBER}
          strokeWidth="2.1"
        />
        <g transform={`rotate(${needleAngle.toFixed(1)} 188 130)`}>
          <line
            x1="188"
            y1="136"
            x2="188"
            y2="88"
            stroke={NB_INK}
            strokeWidth="2.1"
          />
          <circle cx="188" cy="130" r="5" fill={NB_BLUE} />
        </g>
        {/* Small sketched fuel droplet at bottom of dial */}
        <path
          d="M 188 154 C 184 161, 184 166, 188 166 C 192 166, 192 161, 188 154 Z"
          fill={NB_BLUE_WASH}
          stroke={NB_BLUE}
          strokeWidth="1.25"
        />

        {/* Right inside cluster: Two integrated readout rows (Fuel rate + Battery) */}
        {/* Readout 1: Fuel rate */}
        <g>
          <rect
            x="294"
            y="78"
            width="280"
            height="52"
            rx="6"
            fill={NB_BLUE_WASH}
            fillOpacity="0.45"
            stroke={NB_GRID}
            strokeWidth="1.2"
          />
          {/* Sketched fuel bar indicator */}
          <path
            d="M 310 112 L 310 92 L 326 92 L 326 112 Z M 326 96 L 332 100 L 332 110"
            fill="none"
            stroke={NB_BLUE}
            strokeWidth="1.5"
          />
          <text
            x="346"
            y="100"
            fill={NB_GRAPHITE_TEXT}
            fontSize="13"
            fontStyle="italic"
          >
            {t("ed_ch4_label_fuel")}
          </text>
          <text
            x="346"
            y="119"
            fill={NB_INK}
            fontSize="15"
            fontWeight="650"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {t("ed_ch4_val_fuel")}
          </text>
        </g>

        {/* Readout 2: Battery & engine warning */}
        <g>
          <rect
            x="294"
            y="140"
            width="280"
            height="52"
            rx="6"
            fill={NB_PAPER}
            stroke={NB_GRID}
            strokeWidth="1.2"
          />
          {/* Sketched 12V battery icon inside cell */}
          <path
            d="M 308 159 L 334 159 L 334 176 L 308 176 Z M 313 159 L 313 155 M 329 159 L 329 155 M 314 167 L 320 167 M 317 164 L 317 170 M 324 167 L 329 167"
            fill="none"
            stroke={NB_BLUE}
            strokeWidth="1.4"
          />
          <text
            x="346"
            y="162"
            fill={NB_GRAPHITE_TEXT}
            fontSize="13"
            fontStyle="italic"
          >
            {t("ed_ch4_label_battery")}
          </text>
          <text
            x="346"
            y="181"
            fill={NB_INK}
            fontSize="14.5"
            fontWeight="650"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {t("ed_ch4_val_battery")}
          </text>
        </g>
      </g>

      {/* Quiet cluster annotation above panel (never touches ink spine or gauge) */}
      <SketchAnnotation
        leaderD="M 440 46 Q 448 26 476 24"
        dotX={440}
        dotY={46}
        textX={482}
        textY={28}
        anchor="start"
        label={t("ed_ch4_ann_gauge")}
        visible={p >= 0.1}
        style={drawVars(0.08, 0.25)}
      />

      {/* Lower area: Sketched ink speed & voltage graph on notebook axes */}
      <g>
        <g stroke={NB_GRID} strokeWidth="1">
          {[262, 296, 330, 364].map((gy) => (
            <line key={gy} x1="94" y1={gy} x2="594" y2={gy} />
          ))}
          {[174, 258, 342, 426, 510].map((gx) => (
            <line key={gx} x1={gx} y1="246" x2={gx} y2="394" />
          ))}
        </g>

        {/* Hand-drawn L-axis with small overshoot ticks */}
        <SketchPath
          d="M 94 242 L 94 398 M 84 390 L 602 390"
          stroke={NB_GRAPHITE}
          strokeWidth={1.5}
          secondOpacity={0.32}
          style={drawVars(0.14, 0.3)}
        />

        {/* Secondary graphite ECU voltage trace */}
        <path
          d="M 96 372 C 180 370, 240 364, 324 368 C 408 372, 492 362, 588 368"
          fill="none"
          stroke={NB_GRAPHITE}
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.28, 0.55)}
        />

        {/* Hidden reference path for moving pen dot */}
        <path ref={speedWaveRef} d={CH4_SPEED_WAVE_D} fill="none" stroke="none" />

        {/* Primary blue ballpoint speed trace */}
        <SketchPath
          d={CH4_SPEED_WAVE_D}
          stroke={NB_BLUE}
          strokeWidth={2.4}
          style={drawVars(0.2, 0.62)}
        />

        {/* Subtle amber deceleration dip dot */}
        {waveP >= 0.48 && (
          <circle
            cx="336"
            cy="340"
            r="4.2"
            fill={NB_PAPER}
            stroke={NB_AMBER}
            strokeWidth="2"
          />
        )}

        {/* Moving reading dot along speed curve */}
        {(reducedMotion || waveP > 0.02) && (
          <g
            transform={`translate(${speedPose.x.toFixed(1)}, ${speedPose.y.toFixed(1)})`}
          >
            <circle r="7" fill={NB_BLUE_WASH} />
            <circle
              r="3.8"
              fill={NB_BLUE}
              stroke={NB_PAPER}
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Continuous ink line exiting right end of graph calmly to bottom-center (340, 460) */}
        <SketchPath
          d="M 588 316 C 612 316, 610 418, 480 432 C 390 442, 340 436, 340 460"
          stroke={NB_BLUE}
          strokeWidth={2.35}
          style={drawVars(0.66, 0.34)}
        />

        {/* Graph labels cleanly outside gridlines */}
        <text
          x="96"
          y="235"
          fill={NB_GRAPHITE_TEXT}
          fontSize="14"
          fontStyle="italic"
          fontWeight="500"
        >
          {t("ed_ch4_wave_speed")}
        </text>
        <text
          x="96"
          y="414"
          fill={NB_GRAPHITE_TEXT}
          fontSize="13.5"
          fontStyle="italic"
          fontWeight="500"
        >
          {t("ed_ch4_wave_volt")}
        </text>
      </g>
    </svg>
  );
}

/* ============================================================================
 * Chapter 5 — Pullback to a sketched city map with many small cars.
 * Seam entry: (568, 0) -> Seam exit: (568, 400).
 * ========================================================================== */

interface FleetCorridor {
  id: string;
  plate: string;
  d: string;
  tOffset: number;
  tSpan: number;
  settledT: number;
  fallback: { x: number; y: number; angle: number };
}

const CITY_CORRIDORS: readonly FleetCorridor[] = [
  {
    id: "wxa",
    plate: "WXA 4821",
    d: "M 568 0 L 568 54 C 568 112, 466 132, 466 194 C 466 256, 568 280, 568 346 L 568 400",
    tOffset: 0.22,
    tSpan: 0.52,
    settledT: 0.46,
    fallback: { x: 466, y: 194, angle: 90 },
  },
  {
    id: "bqa",
    plate: "BQA 9104",
    d: "M 568 54 C 470 68, 294 78, 212 146 C 148 198, 186 286, 330 318 C 424 338, 524 340, 568 364",
    tOffset: 0.16,
    tSpan: 0.56,
    settledT: 0.42,
    fallback: { x: 212, y: 146, angle: 135 },
  },
  {
    id: "vfr",
    plate: "VFR 7550",
    d: "M 568 54 C 668 70, 838 88, 910 156 C 972 214, 916 294, 782 320 C 686 338, 608 340, 568 364",
    tOffset: 0.28,
    tSpan: 0.48,
    settledT: 0.52,
    fallback: { x: 910, y: 156, angle: 60 },
  },
  {
    id: "jrt",
    plate: "JRT 2208",
    d: "M 568 54 C 618 100, 728 114, 744 184 C 760 248, 672 290, 568 346",
    tOffset: 0.34,
    tSpan: 0.44,
    settledT: 0.58,
    fallback: { x: 744, y: 184, angle: 90 },
  },
  {
    id: "kla",
    plate: "KLA 3092",
    d: "M 568 54 C 430 84, 344 128, 340 198 C 336 264, 444 304, 568 346",
    tOffset: 0.18,
    tSpan: 0.5,
    settledT: 0.64,
    fallback: { x: 340, y: 198, angle: 90 },
  },
];

export function ChapterFiveFleetPullback({
  progress,
  reducedMotion,
  t,
}: EditorialChapterProps) {
  const c0Ref = useRef<SVGPathElement | null>(null);
  const c1Ref = useRef<SVGPathElement | null>(null);
  const c2Ref = useRef<SVGPathElement | null>(null);
  const c3Ref = useRef<SVGPathElement | null>(null);
  const c4Ref = useRef<SVGPathElement | null>(null);
  const refs = [c0Ref, c1Ref, c2Ref, c3Ref, c4Ref] as const;

  const p = reducedMotion ? 1 : clamp(progress, 0, 1);

  const pose0 = usePathPose(
    c0Ref,
    reducedMotion
      ? CITY_CORRIDORS[0].settledT
      : clamp(CITY_CORRIDORS[0].tOffset + p * CITY_CORRIDORS[0].tSpan, 0, 1),
    CITY_CORRIDORS[0].fallback,
  );
  const pose1 = usePathPose(
    c1Ref,
    reducedMotion
      ? CITY_CORRIDORS[1].settledT
      : clamp(CITY_CORRIDORS[1].tOffset + p * CITY_CORRIDORS[1].tSpan, 0, 1),
    CITY_CORRIDORS[1].fallback,
  );
  const pose2 = usePathPose(
    c2Ref,
    reducedMotion
      ? CITY_CORRIDORS[2].settledT
      : clamp(CITY_CORRIDORS[2].tOffset + p * CITY_CORRIDORS[2].tSpan, 0, 1),
    CITY_CORRIDORS[2].fallback,
  );
  const pose3 = usePathPose(
    c3Ref,
    reducedMotion
      ? CITY_CORRIDORS[3].settledT
      : clamp(CITY_CORRIDORS[3].tOffset + p * CITY_CORRIDORS[3].tSpan, 0, 1),
    CITY_CORRIDORS[3].fallback,
  );
  const pose4 = usePathPose(
    c4Ref,
    reducedMotion
      ? CITY_CORRIDORS[4].settledT
      : clamp(CITY_CORRIDORS[4].tOffset + p * CITY_CORRIDORS[4].tSpan, 0, 1),
    CITY_CORRIDORS[4].fallback,
  );

  const poses = [pose0, pose1, pose2, pose3, pose4] as const;

  const blocks = [
    { x: 112, y: 40, w: 108, h: 60, hatch: true },
    { x: 244, y: 40, w: 128, h: 60, hatch: false },
    { x: 404, y: 40, w: 112, h: 50, hatch: false },
    { x: 624, y: 40, w: 112, h: 50, hatch: true },
    { x: 764, y: 40, w: 136, h: 60, hatch: false },
    { x: 928, y: 40, w: 104, h: 60, hatch: false },
    { x: 112, y: 126, w: 92, h: 82, hatch: false },
    { x: 224, y: 126, w: 100, h: 74, hatch: true },
    { x: 496, y: 122, w: 106, h: 78, hatch: false },
    { x: 774, y: 126, w: 110, h: 74, hatch: false },
    { x: 928, y: 126, w: 104, h: 82, hatch: true },
    { x: 112, y: 304, w: 112, h: 62, hatch: true },
    { x: 416, y: 304, w: 108, h: 52, hatch: false },
    { x: 618, y: 304, w: 108, h: 52, hatch: false },
    { x: 912, y: 304, w: 118, h: 62, hatch: true },
  ];

  return (
    <svg
      className="nb-scene-svg"
      viewBox="0 0 1136 400"
      role="img"
      aria-label={t("ed_ch5_scene_aria")}
    >
      {/* Sketched river / waterway in light blue wash (#E8F1FF) */}
      <path
        d="M 48 244 Q 280 216, 560 250 T 1088 228 L 1088 272 Q 820 294, 560 278 T 48 282 Z"
        fill={NB_BLUE_WASH}
        fillOpacity="0.88"
      />
      <path
        d="M 76 258 Q 160 250 236 258 M 640 264 Q 740 254 824 264 M 912 248 Q 988 240 1046 248"
        fill="none"
        stroke={NB_BLUE}
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Sketched city street grid */}
      <g stroke={NB_GRID} strokeWidth="1.15">
        {[100, 224, 386, 744, 906, 1044].map((ax) => (
          <line key={ax} x1={ax} y1={24} x2={ax} y2={376} />
        ))}
        {[34, 116, 218, 294, 372].map((ay) => (
          <line key={ay} x1={76} y1={ay} x2={1060} y2={ay} />
        ))}
      </g>

      {/* Hand-sketched city block outlines with corner overshoots and light hatching */}
      <g fill="none" stroke={NB_GRAPHITE} strokeWidth="1.15" strokeOpacity="0.65">
        {blocks.map((b, idx) => (
          <g key={idx}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={2}
              fill={NB_PAPER}
              fillOpacity="0.6"
            />
            <line
              x1={b.x - 5}
              y1={b.y}
              x2={b.x + 12}
              y2={b.y}
              strokeOpacity="0.5"
            />
            {b.hatch && (
              <PencilHatch
                x={b.x + 10}
                y={b.y + b.h - 8}
                count={4}
                step={14}
                dx={8}
                dy={-8}
                opacity={0.32}
              />
            )}
          </g>
        ))}
      </g>

      {/* 5 connected city fleet corridors in blue ballpoint */}
      {CITY_CORRIDORS.map((corridor, idx) => (
        <SketchPath
          key={corridor.id}
          d={corridor.d}
          stroke={NB_BLUE}
          strokeWidth={idx === 0 ? 2.35 : 1.75}
          secondOpacity={0.34}
          style={drawVars(0.04 * idx, 0.65)}
        />
      ))}

      {/* Hidden exact paths for usePathPose sampling */}
      {CITY_CORRIDORS.map((corridor, idx) => (
        <path
          key={`ref-${corridor.id}`}
          ref={refs[idx]}
          d={corridor.d}
          fill="none"
          stroke="none"
        />
      ))}

      {/* Amber harsh-brake marker on east corridor */}
      <g transform="translate(910, 156)">
        <circle r="13" fill="#FEF3C7" fillOpacity="0.9" />
        <path
          d="M 0 -8 L 7.5 6 L -7.5 6 Z"
          fill={NB_PAPER}
          stroke={NB_AMBER}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="3" r="1.1" fill={NB_AMBER} />
      </g>

      {/* 5 sketched fleet cars + 2 clean non-overlapping plate labels */}
      {CITY_CORRIDORS.map((corridor, idx) => {
        const pose = poses[idx];
        const showLabel = idx === 0 || idx === 2;
        return (
          <g key={corridor.id}>
            <g
              transform={`translate(${pose.x.toFixed(1)}, ${pose.y.toFixed(1)}) rotate(${pose.angle.toFixed(1)})`}
            >
              <rect
                x="-11"
                y="-6.5"
                width="22"
                height="13"
                rx="4"
                fill={NB_PAPER}
                stroke={NB_INK}
                strokeWidth="1.6"
              />
              <path
                d="M 2 -4.5 L 5.5 -3.5 L 5.5 3.5 L 2 4.5 Z"
                fill={NB_BLUE_WASH}
                stroke={NB_BLUE}
                strokeWidth="1.1"
              />
            </g>
            {showLabel && (
              <text
                x={pose.x + (idx === 0 ? -74 : 18)}
                y={pose.y + (idx === 0 ? 18 : 16)}
                fill={NB_GRAPHITE_TEXT}
                fontSize="12"
                fontStyle="italic"
                fontWeight="600"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {corridor.plate}
              </text>
            )}
          </g>
        );
      })}

      {/* Quiet italic map annotation */}
      <text
        x="112"
        y="390"
        fill={NB_GRAPHITE_TEXT}
        fontSize="14"
        fontStyle="italic"
      >
        {t("ed_ch5_ann_map")}
      </text>
    </svg>
  );
}

/* ============================================================================
 * Chapter 6 — Final CTA underline where the continuous ink line ends.
 * ========================================================================== */
export function ChapterSixUnderline({
  reducedMotion,
  t,
}: {
  reducedMotion: boolean;
  t: (k: string) => string;
}) {
  return (
    <svg
      className={`nb-ch6-underline-svg ${reducedMotion ? "is-reduced" : ""}`}
      viewBox="0 0 300 44"
      role="img"
      aria-label={t("ed_ch6_scene_aria")}
    >
      <SketchPath
        d="M 6 2 C 6 20, 26 28, 72 27 C 130 26, 204 22, 268 24"
        stroke={NB_BLUE}
        strokeWidth={2.5}
        secondOffset="translate(0.4, 2.2)"
        secondOpacity={0.45}
        style={drawVars(0, 0.85)}
      />
      <circle
        cx="278"
        cy="24"
        r="3.6"
        fill={NB_BLUE}
        className="nb-ch6-nib"
      />
    </svg>
  );
}

/* ============================================================================
 * Minimal notebook horizon sketch above the footer.
 * ========================================================================== */
export function FooterHorizonArt() {
  return (
    <svg
      viewBox="0 0 1200 68"
      width="100%"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M 40 56 Q 280 54 600 56 T 1160 56"
        fill="none"
        stroke={NB_GRID}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <g
        fill="none"
        stroke={NB_GRAPHITE}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 572 54 L 574 44 C 576 38, 584 34, 594 34 L 610 34 L 620 42 L 630 44 C 634 45, 636 48, 636 54 Z" />
        <path
          d="M 572 54 L 574 44 C 576 38, 584 34, 594 34 L 610 34 L 620 42 L 630 44 C 634 45, 636 48, 636 54 Z"
          transform="translate(0.6, 0.5)"
          opacity="0.4"
        />
        <circle cx="586" cy="54" r="4" fill={NB_PAPER} />
        <circle cx="622" cy="54" r="4" fill={NB_PAPER} />
        <line x1="590" y1="40" x2="608" y2="40" stroke={NB_BLUE} />
      </g>
    </svg>
  );
}
