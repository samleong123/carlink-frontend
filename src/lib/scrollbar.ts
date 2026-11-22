// Ant/rc's default measurement injects a runtime stylesheet for WebKit scrollbars.
// This app does not customize scrollbar pseudo-elements, so ordinary DOM measurement
// is sufficient and preserves a static style-src-elem 'self' policy.
let cached: number | undefined;
export function getTargetScrollBarSize(target?: Element) {
  if (typeof document === "undefined") return { width: 0, height: 0 };
  const probe = document.createElement("div");
  Object.assign(probe.style, {
    position: "absolute",
    left: "-10000px",
    top: "0",
    width: "100px",
    height: "100px",
    overflow: "scroll",
  });
  if (target) {
    const style = getComputedStyle(target);
    probe.style.scrollbarWidth = style.scrollbarWidth;
    probe.style.scrollbarColor = style.scrollbarColor;
  }
  document.body.appendChild(probe);
  const result = {
    width: probe.offsetWidth - probe.clientWidth,
    height: probe.offsetHeight - probe.clientHeight,
  };
  probe.remove();
  return result;
}
export default function getScrollBarSize(fresh?: boolean) {
  if (fresh || cached === undefined) cached = getTargetScrollBarSize().width;
  return cached;
}
