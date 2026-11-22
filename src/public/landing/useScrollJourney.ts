import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ChapterId =
  | "chapter-1"
  | "chapter-2"
  | "chapter-3"
  | "chapter-4"
  | "chapter-5"
  | "chapter-6";

export interface ScrollJourneyState {
  overall: number;
  activeChapter: number;
  chapters: Record<ChapterId, number>;
  reducedMotion: boolean;
}

const ALL_CHAPTER_IDS: readonly ChapterId[] = [
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "chapter-4",
  "chapter-5",
  "chapter-6",
];

const REDUCED_CHAPTER_PROGRESS = 1;
const CHANGE_EPSILON = 0.002;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function createChapterRecord(
  defaultValue: number,
  chapterOneValue = defaultValue,
): Record<ChapterId, number> {
  return {
    "chapter-1": chapterOneValue,
    "chapter-2": defaultValue,
    "chapter-3": defaultValue,
    "chapter-4": defaultValue,
    "chapter-5": defaultValue,
    "chapter-6": defaultValue,
  };
}

function readReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function chapterNumberFromId(id: ChapterId, index: number): number {
  const parsed = Number.parseInt(id.replace("chapter-", ""), 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 6
    ? parsed
    : index + 1;
}

function computeJourneyState(
  chapterIds: readonly ChapterId[],
  reducedMotion: boolean,
): ScrollJourneyState {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      overall: 0,
      activeChapter: 1,
      chapters: reducedMotion
        ? createChapterRecord(REDUCED_CHAPTER_PROGRESS)
        : createChapterRecord(0, 0),
      reducedMotion,
    };
  }

  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const docHeight = document.documentElement.scrollHeight || vh;
  const maxScroll = Math.max(1, docHeight - vh);
  const probeY = vh * 0.45;

  const chapters = reducedMotion
    ? createChapterRecord(REDUCED_CHAPTER_PROGRESS)
    : createChapterRecord(0, 0);

  let activeChapter = 1;
  let foundContaining = false;
  let closestDistance = Number.POSITIVE_INFINITY;

  chapterIds.forEach((id, index) => {
    const el = document.querySelector(`[data-chapter-id="${id}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const chNum = chapterNumberFromId(id, index);

    if (rect.top <= probeY && rect.bottom >= probeY) {
      activeChapter = chNum;
      foundContaining = true;
    } else if (!foundContaining) {
      const dist =
        probeY < rect.top
          ? rect.top - probeY
          : probeY > rect.bottom
            ? probeY - rect.bottom
            : 0;
      if (dist < closestDistance) {
        closestDistance = dist;
        activeChapter = chNum;
      }
    }

    if (reducedMotion) return;

    const docTop = rect.top + scrollY;
    const minPossibleTop = docTop - maxScroll;

    if (id === "chapter-1") {
      // Hero draws autonomously on load; scroll progress tracks leaving the hero toward chapter 2.
      const span = Math.max(120, rect.height * 0.55);
      chapters[id] = clamp((scrollY - Math.max(0, docTop - 72)) / span, 0, 1);
    } else {
      const endTop = Math.max(
        id === "chapter-6" ? vh * 0.34 : vh * 0.22,
        minPossibleTop + 12,
      );
      const startTop = Math.max(endTop + 120, vh * 0.88);
      chapters[id] = clamp((startTop - rect.top) / (startTop - endTop), 0, 1);
    }
  });

  return {
    overall: reducedMotion ? 1 : clamp(scrollY / maxScroll, 0, 1),
    activeChapter,
    chapters,
    reducedMotion,
  };
}

function statesDifferSignificantly(
  prev: ScrollJourneyState,
  next: ScrollJourneyState,
): boolean {
  if (prev.reducedMotion !== next.reducedMotion) return true;
  if (prev.activeChapter !== next.activeChapter) return true;
  if (Math.abs(prev.overall - next.overall) > CHANGE_EPSILON) return true;

  for (const id of ALL_CHAPTER_IDS) {
    if (Math.abs(prev.chapters[id] - next.chapters[id]) > CHANGE_EPSILON) {
      return true;
    }
  }
  return false;
}

/**
 * Tracks native scroll progress across route-notebook chapters without
 * intercepting wheel or scroll events. Respects prefers-reduced-motion.
 */
export function useScrollJourney(
  chapterIds: readonly ChapterId[],
): ScrollJourneyState {
  const chapterKey = chapterIds.join(",");
  const chapterIdsRef = useRef<readonly ChapterId[]>(chapterIds);
  chapterIdsRef.current = chapterIds;

  const [state, setState] = useState<ScrollJourneyState>(() => {
    const initialReduced = readReducedMotion();
    return {
      overall: initialReduced ? 1 : 0,
      activeChapter: 1,
      chapters: initialReduced
        ? createChapterRecord(REDUCED_CHAPTER_PROGRESS)
        : createChapterRecord(0, 0),
      reducedMotion: initialReduced,
    };
  });

  const stateRef = useRef<ScrollJourneyState>(state);
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let reducedMotion = readReducedMotion();

    const sync = () => {
      rafId = null;
      const next = computeJourneyState(chapterIdsRef.current, reducedMotion);
      if (statesDifferSignificantly(stateRef.current, next)) {
        stateRef.current = next;
        setState(next);
      }
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      if (typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(sync);
      } else {
        sync();
      }
    };

    sync();

    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      scheduleSync();
    };

    if (mql) {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handleMotionChange);
      } else if (typeof mql.addListener === "function") {
        mql.addListener(handleMotionChange);
      }
    }

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("load", scheduleSync, { passive: true });
    window.addEventListener("pageshow", scheduleSync, { passive: true });

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(scheduleSync)
        : null;
    chapterIdsRef.current.forEach((id) => {
      const chapter = document.querySelector(`[data-chapter-id="${id}"]`);
      if (chapter) resizeObserver?.observe(chapter);
    });

    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("load", scheduleSync);
      window.removeEventListener("pageshow", scheduleSync);
      resizeObserver?.disconnect();
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", handleMotionChange);
        } else if (typeof mql.removeListener === "function") {
          mql.removeListener(handleMotionChange);
        }
      }
      if (rafId !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [chapterKey]);

  return state;
}

/**
 * Samples position, tangent angle (in degrees), and total arc length along
 * an SVG path element at a normalized progress value in [0, 1].
 */
export function usePathPose(
  pathRef: RefObject<SVGPathElement | null>,
  progress: number,
  fallback: { x: number; y: number; angle: number },
): { x: number; y: number; angle: number; length: number } {
  const clamped = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  const fallbackX = fallback.x;
  const fallbackY = fallback.y;
  const fallbackAngle = fallback.angle;

  const [pose, setPose] = useState<{
    x: number;
    y: number;
    angle: number;
    length: number;
  }>({
    x: fallbackX,
    y: fallbackY,
    angle: fallbackAngle,
    length: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const path = pathRef.current;
    if (
      !path ||
      typeof path.getTotalLength !== "function" ||
      typeof path.getPointAtLength !== "function"
    ) {
      setPose((prev) =>
        prev.x === fallbackX &&
        prev.y === fallbackY &&
        prev.angle === fallbackAngle &&
        prev.length === 0
          ? prev
          : { x: fallbackX, y: fallbackY, angle: fallbackAngle, length: 0 },
      );
      return;
    }

    const totalLength = path.getTotalLength();
    if (!Number.isFinite(totalLength) || totalLength <= 0) {
      return;
    }

    const dist = totalLength * clamped;
    const delta = Math.min(2, totalLength * 0.01);
    const d1 = Math.max(0, dist - delta);
    const d2 = Math.min(totalLength, dist + delta);

    const pt = path.getPointAtLength(dist);
    const p1 = path.getPointAtLength(d1);
    const p2 = path.getPointAtLength(d2);
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    setPose((prev) => {
      if (
        Math.abs(prev.x - pt.x) <= 0.05 &&
        Math.abs(prev.y - pt.y) <= 0.05 &&
        Math.abs(prev.angle - angle) <= 0.05 &&
        Math.abs(prev.length - totalLength) <= 0.1
      ) {
        return prev;
      }
      return {
        x: pt.x,
        y: pt.y,
        angle,
        length: totalLength,
      };
    });
  }, [pathRef, clamped, fallbackX, fallbackY, fallbackAngle]);

  return pose;
}
