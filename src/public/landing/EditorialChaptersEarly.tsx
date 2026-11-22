import { useRef, type CSSProperties } from "react";
import { usePathPose } from "./useScrollJourney";

export interface EditorialChapterProps {
  progress: number;
  reducedMotion: boolean;
  t: (k: string) => string;
}

export const NB_BLUE = "#1677FF";
export const NB_BLUE_SKY = "#0284C7";
export const NB_BLUE_WASH = "#E8F1FF";
export const NB_GRAPHITE = "#7A8CA8";
export const NB_GRAPHITE_TEXT = "#4E617D";
export const NB_GRID = "#DCE6F5";
export const NB_INK = "#0E2240";
export const NB_PAPER = "#FBFCFE";
export const NB_AMBER = "#F59E0B";

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function drawVars(start: number, span: number): CSSProperties {
  return {
    "--d-start": start,
    "--d-span": span,
  } as CSSProperties;
}

/**
 * Hand-sketched double-stroke path: one confident ballpoint pass
 * plus a subtle offset sketch-over pass for consistent pen-drawn texture.
 */
export function SketchPath({
  d,
  stroke = NB_BLUE,
  strokeWidth = 1.9,
  secondOffset = "translate(0.7, 0.55)",
  secondOpacity = 0.44,
  className = "nb-draw",
  style,
  pathLength = 100,
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  secondOffset?: string;
  secondOpacity?: number;
  className?: string;
  style?: CSSProperties;
  pathLength?: number;
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={pathLength}
        className={className}
        style={style}
      />
      <path
        d={d}
        transform={secondOffset}
        fill="none"
        stroke={stroke}
        strokeWidth={Math.max(1.05, strokeWidth * 0.62)}
        strokeOpacity={secondOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={pathLength}
        className={className}
        style={style}
      />
    </g>
  );
}

/**
 * Light diagonal pencil hatching strips for consistent notebook shading.
 */
export function PencilHatch({
  x,
  y,
  count,
  step = 10,
  dx = 7,
  dy = -7,
  opacity = 0.45,
  className,
}: {
  x: number;
  y: number;
  count: number;
  step?: number;
  dx?: number;
  dy?: number;
  opacity?: number;
  className?: string;
}) {
  const segments = Array.from({ length: count }, (_, idx) => {
    const sx = x + idx * step;
    return `M ${sx} ${y} L ${sx + dx} ${y + dy}`;
  }).join(" ");

  return (
    <path
      d={segments}
      fill="none"
      stroke={NB_GRAPHITE}
      strokeWidth={1}
      strokeLinecap="round"
      opacity={opacity}
      className={className}
    />
  );
}

/**
 * Italic graphite annotation attached with a curved hand-drawn leader line.
 */
export function SketchAnnotation({
  leaderD,
  dotX,
  dotY,
  textX,
  textY,
  anchor = "start",
  label,
  dotColor = NB_BLUE,
  visible = true,
  className = "nb-draw",
  style,
}: {
  leaderD: string;
  dotX: number;
  dotY: number;
  textX: number;
  textY: number;
  anchor?: "start" | "end" | "middle";
  label: string;
  dotColor?: string;
  visible?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <g
      className={`nb-annotation ${visible ? "is-visible" : ""}`}
      style={{ opacity: visible ? 1 : 0 }}
    >
      <path
        d={leaderD}
        fill="none"
        stroke={NB_GRAPHITE}
        strokeWidth={1.15}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className={className}
        style={style}
      />
      <circle
        cx={dotX}
        cy={dotY}
        r={3}
        fill={NB_PAPER}
        stroke={dotColor}
        strokeWidth={1.6}
      />
      <text
        x={textX}
        y={textY}
        textAnchor={anchor}
        fill={NB_GRAPHITE_TEXT}
        fontSize="14"
        fontStyle="italic"
        fontWeight="500"
        fontFamily="inherit"
      >
        {label}
      </text>
    </g>
  );
}

/* ============================================================================
 * Chapter 1 — Large hand-sketched car parked at kerb + drawn driver holding NFC card.
 * Kerb runs all the way to the right edge (x = 680) and curves down to (340, 420).
 * Autonomous ~1.6s draw-on animation on page load.
 * ========================================================================== */
export function ChapterOneStreet({
  reducedMotion,
  t,
}: EditorialChapterProps) {
  return (
    <svg
      className={`nb-scene-svg nb-hero-sketch ${reducedMotion ? "is-reduced" : ""}`}
      viewBox="0 0 680 420"
      role="img"
      aria-label={t("ed_ch1_scene_aria")}
    >
      {/* Subtle horizon construction line */}
      <path
        d="M 16 318 Q 340 316 680 318"
        fill="none"
        stroke={NB_GRID}
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/* Quiet background shophouse & tree in graphite double-stroke */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <SketchPath
          d="M 318 317 L 320 132 L 310 132 L 456 76 L 602 132 L 592 132 L 594 317"
          stroke={NB_GRAPHITE}
          strokeWidth={1.3}
          secondOpacity={0.35}
          className="nb-hero-draw nb-hero-draw--4"
        />
        {/* Arched upper windows */}
        <path
          d="M 358 202 L 358 156 Q 376 140 394 156 L 394 202 Z M 438 202 L 438 156 Q 456 140 474 156 L 474 202 Z M 516 202 L 516 156 Q 534 140 552 156 L 552 202 Z"
          stroke={NB_GRAPHITE}
          strokeWidth="1.15"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--4"
        />
        {/* Canopy wash + hatch */}
        <path
          d="M 340 228 L 574 228 L 582 246 L 332 246 Z"
          fill={NB_BLUE_WASH}
          fillOpacity="0.65"
          stroke={NB_GRAPHITE}
          strokeWidth="1.2"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--4"
        />
        {/* Tree on right */}
        <path
          d="M 636 317 Q 638 272 635 232 M 635 262 L 620 246 M 636 254 L 650 240"
          stroke={NB_GRAPHITE}
          strokeWidth="1.45"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--4"
        />
        <path
          d="M 602 238 C 588 220, 600 186, 626 186 C 638 168, 666 174, 670 194 C 682 204, 676 234, 656 242 C 638 248, 612 248, 602 238 Z"
          fill={NB_BLUE_WASH}
          fillOpacity="0.65"
          stroke={NB_GRAPHITE}
          strokeWidth="1.35"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--4"
        />
      </g>

      {/* Blue-wash fills for windows, driver jacket & NFC card */}
      <g className="nb-hero-wash">
        <path
          d="M 332 250 L 368 206 L 434 205 L 436 250 Z"
          fill={NB_BLUE_WASH}
        />
        <path
          d="M 446 205 L 494 206 C 518 208, 536 222, 548 250 L 446 250 Z"
          fill={NB_BLUE_WASH}
        />
        {/* Driver jacket wash */}
        <path
          d="M 80 218 Q 98 212 116 218 L 122 264 Q 98 268 78 264 Z"
          fill={NB_BLUE_WASH}
        />
        {/* NFC Card wash */}
        <rect
          x="160"
          y="238"
          width="17"
          height="23"
          rx="2.5"
          transform="rotate(-12 168 249)"
          fill={NB_BLUE_WASH}
        />
      </g>

      {/* Light diagonal pencil hatching under car, kerb, and driver stride */}
      <g className="nb-hero-wash">
        <PencilHatch x={286} y={325} count={26} step={12} dx={8} dy={-6} />
        <PencilHatch x={72} y={325} count={6} step={11} dx={7} dy={-6} />
      </g>

      {/* Large parked fleet crossover (double ballpoint strokes) */}
      <g>
        <SketchPath
          d="M 272 296 Q 268 268 282 257 L 322 248 Q 344 212 368 199 C 396 193, 460 193, 498 198 C 526 203, 548 228, 562 251 L 596 261 Q 608 271 605 296 L 578 298 M 516 298 L 364 298 M 302 298 L 272 296"
          stroke={NB_BLUE}
          strokeWidth={2.2}
          className="nb-hero-draw nb-hero-draw--2"
        />
        {/* Windows & pillar */}
        <SketchPath
          d="M 332 250 Q 352 219 371 206 L 434 205 L 436 250 Z M 446 205 L 494 206 C 518 208, 536 222, 548 250 L 446 250 Z"
          stroke={NB_BLUE}
          strokeWidth={1.45}
          secondOpacity={0.38}
          className="nb-hero-draw nb-hero-draw--2"
        />
        {/* Door seam, handles & side mirror */}
        <path
          d="M 441 252 Q 440 274 442 296 M 384 263 L 398 263 M 460 263 L 474 263 M 528 247 Q 538 244 540 253 L 528 255"
          fill="none"
          stroke={NB_GRAPHITE}
          strokeWidth="1.35"
          strokeLinecap="round"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--2"
        />
        {/* Rear & front wheels */}
        <SketchPath
          d="M 302 298 A 31 31 0 1 1 364 298 A 31 31 0 1 1 302 298 Z M 516 298 A 31 31 0 1 1 578 298 A 31 31 0 1 1 516 298 Z"
          stroke={NB_INK}
          strokeWidth={2.05}
          className="nb-hero-draw nb-hero-draw--2"
        />
        <path
          d="M 319 298 A 14 14 0 1 1 347 298 A 14 14 0 1 1 319 298 M 533 298 A 14 14 0 1 1 561 298 A 14 14 0 1 1 533 298"
          fill="none"
          stroke={NB_BLUE}
          strokeWidth="1.45"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--2"
        />
        {/* Headlight ticks */}
        <path
          d="M 596 271 Q 604 272 604 281 M 614 268 L 630 265 M 616 277 L 634 277"
          fill="none"
          stroke={NB_BLUE}
          strokeWidth="1.35"
          strokeLinecap="round"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--2"
        />
      </g>

      {/* Drawn driver figure (head, shoulders, jacket, bent arm, trousers & shoes) */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Head & hair contour */}
        <SketchPath
          d="M 85 198 A 13 13 0 1 1 111 198 A 13 13 0 1 1 85 198 M 86 194 Q 98 182 110 192"
          stroke={NB_INK}
          strokeWidth={1.85}
          className="nb-hero-draw nb-hero-draw--3"
        />
        {/* Shoulders, collar & jacket torso */}
        <SketchPath
          d="M 94 211 L 94 217 L 78 221 Q 72 224 72 234 L 74 265 Q 98 269 121 264 L 122 230 Q 121 221 112 218 L 103 217 L 103 211"
          stroke={NB_BLUE}
          strokeWidth={1.85}
          className="nb-hero-draw nb-hero-draw--3"
        />
        {/* Jacket shading hatches */}
        <path
          d="M 80 238 L 90 228 M 80 250 L 94 236 M 82 260 L 96 246"
          fill="none"
          stroke={NB_GRAPHITE}
          strokeWidth="1"
          opacity="0.55"
          className="nb-hero-wash"
        />
        {/* Back arm bent slightly */}
        <path
          d="M 74 226 Q 62 246 71 262"
          fill="none"
          stroke={NB_INK}
          strokeWidth="1.75"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--3"
        />
        {/* Front arm extending from shoulder -> elbow -> forearm -> hand */}
        <SketchPath
          d="M 116 226 Q 134 242 142 248 L 160 249"
          stroke={NB_INK}
          strokeWidth={1.85}
          className="nb-hero-draw nb-hero-draw--3"
        />
        {/* Striding trousers & shoes */}
        <SketchPath
          d="M 81 266 L 74 295 L 67 316 L 56 316 M 93 267 L 87 294 L 82 316 M 102 267 L 114 294 L 124 316 L 136 316 M 115 266 L 126 291 L 135 314"
          stroke={NB_INK}
          strokeWidth={1.85}
          className="nb-hero-draw nb-hero-draw--3"
        />
        {/* NFC Card held in hand */}
        <SketchPath
          d="M 158 238 L 175 235 L 179 258 L 162 261 Z"
          stroke={NB_BLUE}
          strokeWidth={1.85}
          className="nb-hero-draw nb-hero-draw--3"
        />
        <path
          d="M 183 241 Q 189 247 185 254 M 189 237 Q 197 247 191 258"
          fill="none"
          stroke={NB_BLUE}
          strokeWidth="1.25"
          pathLength={100}
          className="nb-hero-draw nb-hero-draw--3"
        />
      </g>

      {/* THE CONTINUOUS INK LINE: kerb runs all the way to right edge (x=680), curves down to (340, 420) */}
      <SketchPath
        d="M 680 318 L 244 318 C 194 318, 190 358, 256 376 C 314 392, 340 400, 340 420"
        stroke={NB_BLUE}
        strokeWidth={2.35}
        secondOffset="translate(0.55, 0.7)"
        secondOpacity={0.38}
        className="nb-hero-draw nb-hero-draw--1"
      />

      {/* Two separate plain italic graphite annotations (zero middle dots) */}
      <SketchAnnotation
        leaderD="M 172 232 Q 186 112 232 94"
        dotX={172}
        dotY={232}
        textX={240}
        textY={98}
        anchor="start"
        label={t("ed_ch1_ann_card")}
        className="nb-hero-draw nb-hero-draw--5"
      />
      <SketchAnnotation
        leaderD="M 556 314 Q 586 350 530 374"
        dotX={556}
        dotY={314}
        textX={522}
        textY={378}
        anchor="end"
        label={t("ed_ch1_ann_curb")}
        className="nb-hero-draw nb-hero-draw--5"
      />
    </svg>
  );
}

/* ============================================================================
 * Chapter 2 — Recognisable hand holding NFC card against dashboard-mounted reader,
 * with clear steering-wheel arc & windscreen edge behind it.
 * Ink line routes cleanly as the reader cable: (340, 0) -> top of reader -> exits bottom -> (340, 430).
 * ========================================================================== */
export function ChapterTwoTap({
  progress,
  reducedMotion,
  t,
}: EditorialChapterProps) {
  const p = reducedMotion ? 1 : clamp(progress, 0, 1);

  // Hand glides in from +48px to 0 during p = 0..0.50
  const touchP = clamp(p / 0.5, 0, 1);
  const handTranslateX = reducedMotion ? 0 : (1 - touchP) * 48;
  const touched = p >= 0.45;

  // Ripple arcs bloom once the card meets the reader (p = 0.44..0.92)
  const ripple1 = clamp((p - 0.44) / 0.2, 0, 1);
  const ripple2 = clamp((p - 0.54) / 0.22, 0, 1);
  const ripple3 = clamp((p - 0.64) / 0.24, 0, 1);

  return (
    <svg
      className="nb-scene-svg"
      viewBox="0 0 680 430"
      role="img"
      aria-label={t("ed_ch2_scene_aria")}
    >
      {/* Windscreen glass wash & subtle exterior horizon */}
      <path
        d="M 86 244 L 170 64 L 392 64 L 392 244 Z"
        fill={NB_BLUE_WASH}
        fillOpacity="0.48"
      />
      <path
        d="M 184 134 L 222 96 M 204 142 L 248 98"
        fill="none"
        stroke={NB_GRAPHITE}
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* A-pillar, windscreen edge & dashboard cowl in double-stroke graphite */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <SketchPath
          d="M 62 364 L 62 248 L 154 54 L 184 54 L 106 246 L 382 246 C 398 246, 408 256, 408 272 L 408 364"
          stroke={NB_GRAPHITE}
          strokeWidth={1.65}
          style={drawVars(0, 0.42)}
        />
        {/* Windscreen top & right edge */}
        <path
          d="M 184 54 L 402 54"
          stroke={NB_GRAPHITE}
          strokeWidth="1.2"
          strokeDasharray="5 5"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.05, 0.35)}
        />
        {/* Dashboard cowl hatching */}
        <PencilHatch x={82} y={266} count={14} step={11} dx={7} dy={-7} />
      </g>

      {/* Recognisable steering wheel arc, rim thickness, hub & spokes on lower-left */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer & inner rim curves */}
        <SketchPath
          d="M 88 364 A 82 82 0 0 1 244 364"
          stroke={NB_INK}
          strokeWidth={2.2}
          style={drawVars(0.06, 0.42)}
        />
        <path
          d="M 101 364 A 69 69 0 0 1 231 364"
          stroke={NB_GRAPHITE}
          strokeWidth="1.5"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.08, 0.4)}
        />
        {/* Steering wheel spokes & center hub */}
        <path
          d="M 102 350 L 146 358 M 230 350 L 186 358 M 144 364 A 22 22 0 0 1 188 364"
          stroke={NB_GRAPHITE}
          strokeWidth="1.65"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.1, 0.4)}
        />
      </g>

      {/* CONTINUOUS INK LINE as reader cable: enters (340, 0), plugs into top of reader (280, 174), exits bottom (280, 254) -> (340, 430) */}
      <SketchPath
        d="M 340 0 C 340 54, 280 72, 280 132 L 280 174"
        stroke={NB_BLUE}
        strokeWidth={2.3}
        style={drawVars(0, 0.36)}
      />
      <SketchPath
        d="M 280 254 L 280 326 C 280 378, 340 390, 340 430"
        stroke={NB_BLUE}
        strokeWidth={2.3}
        style={drawVars(0.45, 0.55)}
      />

      {/* Dashboard-mounted NFC Reader Pad */}
      <g>
        <rect
          x="252"
          y="180"
          width="56"
          height="68"
          rx="7"
          fill={NB_BLUE_WASH}
          fillOpacity={touched ? 0.95 : 0.45}
        />
        <SketchPath
          d="M 248 176 Q 280 173 312 176 L 313 252 Q 280 255 247 252 Z"
          stroke={NB_BLUE}
          strokeWidth={2}
          style={drawVars(0.1, 0.42)}
        />
        <path
          d="M 262 190 L 298 190 L 298 238 L 262 238 Z"
          fill="none"
          stroke={NB_BLUE}
          strokeWidth="1.25"
          strokeDasharray="4 3"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.16, 0.38)}
        />
        <circle
          cx="280"
          cy="214"
          r="4"
          fill={touched ? NB_BLUE : NB_PAPER}
          stroke={NB_BLUE}
          strokeWidth="1.6"
        />
      </g>

      {/* Concentric NFC Ripples radiating when the card touches */}
      <g fill="none" strokeLinecap="round">
        {[
          { d: "M 318 192 A 25 25 0 0 1 318 236", rp: ripple1, w: 2.1 },
          { d: "M 328 180 A 38 38 0 0 1 328 248", rp: ripple2, w: 1.85 },
          { d: "M 338 168 A 52 52 0 0 1 338 260", rp: ripple3, w: 1.55 },
        ].map((arc, idx) => (
          <path
            key={idx}
            d={arc.d}
            stroke={NB_BLUE}
            strokeWidth={arc.w}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={100 * (1 - arc.rp)}
            strokeOpacity={arc.rp * 0.95}
          />
        ))}
      </g>

      {/* Recognisable sketched hand holding the NFC card */}
      <g
        transform={`translate(${handTranslateX.toFixed(2)}, 0)`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* NFC Card */}
        <g transform="translate(318, 190) rotate(-8)">
          <rect
            x="2"
            y="2"
            width="54"
            height="36"
            rx="4"
            fill={NB_BLUE_WASH}
          />
          <SketchPath
            d="M 0 2 Q 28 0 56 2 L 57 38 Q 28 40 1 38 Z"
            stroke={NB_BLUE}
            strokeWidth={1.9}
            style={drawVars(0.06, 0.38)}
          />
          <path
            d="M 9 14 L 20 14 L 20 23 L 9 23 Z"
            fill={NB_PAPER}
            stroke={NB_BLUE}
            strokeWidth="1.2"
          />
          <path
            d="M 36 14 A 6 6 0 0 1 36 24 M 41 11 A 10 10 0 0 1 41 27"
            fill="none"
            stroke={NB_BLUE}
            strokeWidth="1.25"
          />
        </g>

        {/* Hand silhouette: palm, knuckles, 3 curled fingers & articulated thumb */}
        {/* Back/palm & wrist leading into sleeve cuff */}
        <SketchPath
          d="M 366 196 C 394 188, 434 192, 474 206 L 522 220 L 520 268 L 454 256 C 426 260, 398 258, 376 248"
          stroke={NB_INK}
          strokeWidth={1.8}
          style={drawVars(0.08, 0.42)}
        />
        {/* Thumb pressing front face of card */}
        <SketchPath
          d="M 398 214 C 378 212, 358 216, 354 224 C 351 230, 362 234, 382 232 L 412 228"
          stroke={NB_INK}
          strokeWidth={1.75}
          style={drawVars(0.1, 0.4)}
        />
        {/* Curled index, middle & ring fingers holding card edge */}
        <path
          d="M 362 198 C 356 202, 358 210, 368 212 M 364 236 C 362 244, 370 248, 384 246 M 374 247 C 378 255, 390 257, 404 253"
          fill="none"
          stroke={NB_INK}
          strokeWidth="1.65"
          pathLength={100}
          className="nb-draw"
          style={drawVars(0.12, 0.4)}
        />
        {/* Subtle palm crease & knuckle pencil ticks */}
        <path
          d="M 418 224 Q 428 232 422 244 M 440 214 L 448 217"
          fill="none"
          stroke={NB_GRAPHITE}
          strokeWidth="1.2"
        />
        {/* Shirt sleeve cuff with blue wash + diagonal hatching */}
        <rect
          x="518"
          y="214"
          width="36"
          height="62"
          rx="4"
          fill={NB_BLUE_WASH}
        />
        <SketchPath
          d="M 518 214 L 554 214 L 554 276 L 518 276 Z"
          stroke={NB_BLUE}
          strokeWidth={1.7}
          style={drawVars(0.14, 0.4)}
        />
        <PencilHatch x={524} y={244} count={3} step={9} dx={12} dy={-14} />
      </g>

      {/* Plain italic graphite annotations (zero middle dots) */}
      <SketchAnnotation
        leaderD="M 294 174 Q 328 118 408 106"
        dotX={294}
        dotY={174}
        textX={416}
        textY={110}
        label={t("ed_ch2_callout_nfc")}
        visible={p >= 0.22}
        style={drawVars(0.22, 0.3)}
      />
      <SketchAnnotation
        leaderD="M 342 262 Q 390 318 446 330"
        dotX={342}
        dotY={262}
        textX={454}
        textY={334}
        label={t("ed_ch2_callout_shift")}
        visible={p >= 0.52}
        style={drawVars(0.52, 0.3)}
      />
    </svg>
  );
}

/* ============================================================================
 * Chapter 3 — Road bends into a speed-coloured GPS trace; car follows path
 * via usePathPose; one amber (#F59E0B) harsh-brake marker pops when car passes.
 * Seam entry: (340, 0) -> Seam exit: (340, 500).
 * ========================================================================== */

const CH3_PATH_D =
  "M 340 0 C 340 88, 174 120, 174 210 C 174 304, 504 302, 504 388 C 504 452, 340 452, 340 500";

// Exact De Casteljau split on middle cubic (174,210)->(174,304)->(504,302)->(504,388)
const CH3_SPEED_SEGMENTS: readonly {
  d: string;
  color: string;
}[] = [
  {
    d: "M 340 0 C 340 88, 174 120, 174 210",
    color: NB_BLUE,
  },
  {
    d: "M 174.0 210.0 C 174.0 245.7, 221.7 267.5, 280.7 285.5",
    color: NB_BLUE_SKY,
  },
  {
    d: "M 280.7 285.5 C 333.8 301.7, 396.0 314.6, 441.3 331.7",
    color: NB_AMBER,
  },
  {
    d: "M 441.3 331.7 C 478.3 345.7, 504.0 363.2, 504.0 388.0 C 504 452, 340 452, 340 500",
    color: NB_BLUE,
  },
];

export function ChapterThreeRoad({
  progress,
  reducedMotion,
  t,
}: EditorialChapterProps) {
  const centerlineRef = useRef<SVGPathElement | null>(null);
  const p = reducedMotion ? 1 : clamp(progress, 0, 1);
  const vehicleT = reducedMotion ? 0.84 : clamp(p * 0.92 + 0.04, 0.04, 0.96);

  const pose = usePathPose(centerlineRef, vehicleT, {
    x: 340,
    y: 250,
    angle: 90,
  });

  const traceLen = pose.length > 0 ? pose.length : 810;
  const traceOffset = traceLen * (1 - vehicleT);
  const harshBrakeReached = reducedMotion || vehicleT >= 0.56;

  return (
    <svg
      className="nb-scene-svg"
      viewBox="0 0 680 500"
      role="img"
      aria-label={t("ed_ch3_scene_aria")}
    >
      {/* Topographic contour notebook curves */}
      <g
        fill="none"
        stroke={NB_GRID}
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <path d="M 48 124 Q 112 108 164 132 T 264 122" />
        <path d="M 42 158 Q 108 142 154 166" />
        <path d="M 428 108 Q 512 86 618 118" />
        <path d="M 412 146 Q 520 128 634 164" />
        <path d="M 88 362 Q 166 338 252 366 T 372 358" />
      </g>

      {/* Roadside sketched trees with blue wash & pencil hatching */}
      {[
        { x: 112, y: 190, s: 0.9 },
        { x: 422, y: 206, s: 0.84 },
        { x: 562, y: 344, s: 0.92 },
      ].map((tree, idx) => (
        <g
          key={idx}
          transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-18"
            stroke={NB_GRAPHITE}
            strokeWidth="1.5"
          />
          <path
            d="M -16 -16 C -22 -28, -14 -44, -2 -44 C 4 -54, 18 -48, 18 -34 C 26 -26, 20 -14, 8 -13 C -2 -12, -10 -12, -16 -16 Z"
            fill={NB_BLUE_WASH}
            stroke={NB_GRAPHITE}
            strokeWidth="1.35"
          />
        </g>
      ))}

      {/* Upper sketched physical road bending into the GPS trace */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M 314 0 C 314 76, 148 108, 148 210 C 148 242, 174 264, 214 278 L 246 244 C 216 232, 200 222, 200 210 C 200 126, 366 96, 366 0 Z"
          fill={NB_BLUE_WASH}
          fillOpacity="0.45"
        />
        <SketchPath
          d="M 314 0 C 314 76, 148 108, 148 210 C 148 238, 168 258, 202 274"
          stroke={NB_GRAPHITE}
          strokeWidth={1.65}
          secondOpacity={0.35}
          style={drawVars(0, 0.55)}
        />
        <SketchPath
          d="M 366 0 C 366 96, 200 126, 200 210 C 200 226, 214 236, 240 248"
          stroke={NB_GRAPHITE}
          strokeWidth={1.65}
          secondOpacity={0.35}
          style={drawVars(0, 0.55)}
        />
      </g>

      {/* Faint dotted future GPS corridor */}
      <path
        d={CH3_PATH_D}
        fill="none"
        stroke={NB_GRID}
        strokeWidth="2.2"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />

      {/* Hidden centerline for exact arc-length pose sampling */}
      <path ref={centerlineRef} d={CH3_PATH_D} fill="none" stroke="none" />

      {/* Live scroll-drawn speed-coloured GPS trace */}
      <g>
        <defs>
          <mask id="nb-ch3-trace-mask">
            <path
              d={CH3_PATH_D}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={traceLen}
              strokeDashoffset={traceOffset}
            />
          </mask>
        </defs>
        <g mask="url(#nb-ch3-trace-mask)">
          {CH3_SPEED_SEGMENTS.map((seg, idx) => (
            <g key={idx}>
              <path
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth="3.1"
                strokeLinecap="round"
              />
              <path
                d={seg.d}
                transform="translate(0.7, 0.6)"
                fill="none"
                stroke={seg.color}
                strokeWidth="1.35"
                strokeOpacity="0.42"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      </g>

      {/* Amber (#F59E0B) harsh-brake marker — pops once when car passes */}
      <g
        transform="translate(364, 308)"
        className={`nb-brake-marker ${harshBrakeReached ? "is-popped" : ""}`}
      >
        <g className="nb-brake-marker-inner">
          <circle cx="0" cy="0" r="17" fill="#FEF3C7" fillOpacity="0.9" />
          <path
            d="M 0 -11 L 10 8 L -10 8 Z"
            fill={NB_PAPER}
            stroke={NB_AMBER}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line
            x1="0"
            y1="-4"
            x2="0"
            y2="1.5"
            stroke={NB_AMBER}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="0" cy="4.6" r="1.15" fill={NB_AMBER} />
        </g>
      </g>

      {/* Sketched top-down vehicle following path via usePathPose */}
      <g
        transform={`translate(${pose.x.toFixed(2)}, ${pose.y.toFixed(2)}) rotate(${pose.angle.toFixed(2)})`}
      >
        <ellipse cx="-1" cy="2" rx="18" ry="10" fill={NB_BLUE_WASH} />
        <rect
          x="-15"
          y="-9"
          width="30"
          height="18"
          rx="5"
          fill={NB_PAPER}
          stroke={NB_INK}
          strokeWidth="1.8"
        />
        <path
          d="M 3 -6.5 L 9 -5.5 L 9 5.5 L 3 6.5 Z"
          fill={NB_BLUE_WASH}
          stroke={NB_BLUE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line
          x1="-8"
          y1="0"
          x2="0"
          y2="0"
          stroke={NB_BLUE}
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </g>

      {/* Plain italic graphite annotations */}
      <SketchAnnotation
        leaderD="M 222 132 Q 186 96 150 86"
        dotX={222}
        dotY={132}
        textX={24}
        textY={88}
        anchor="start"
        label={t("ed_ch3_ann_gps")}
        visible={vehicleT >= 0.14}
        style={drawVars(0.1, 0.25)}
      />
      <SketchAnnotation
        leaderD="M 374 298 Q 422 258 466 246"
        dotX={374}
        dotY={298}
        textX={474}
        textY={250}
        anchor="start"
        dotColor={NB_AMBER}
        label={t("ed_ch3_ann_brake")}
        visible={harshBrakeReached}
      />
      <SketchAnnotation
        leaderD="M 436 444 Q 350 424 296 424"
        dotX={436}
        dotY={444}
        textX={288}
        textY={428}
        anchor="end"
        label={t("ed_ch3_ann_spool")}
        visible={vehicleT >= 0.72}
        style={drawVars(0.65, 0.25)}
      />
    </svg>
  );
}
