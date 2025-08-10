import { getState, setState } from "./state.js";

/**
 * Enable dragging the Dot in IDLE. On release, snap to nearest side (dock),
 * unless body has .dot-dock-off => then return to center.
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;

  let suppressClickOnce = false;

  const getDotRect = () => dot.getBoundingClientRect();

  const enterFree = () => {
    dot.classList.add("dot-free");
    const r = getDotRect();
    dot.style.left = `${r.left}px`;
    dot.style.top = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  };

  const returnToCenter = () => {
    dot.classList.remove("dot-free","dot-docked","dot-docked-left","dot-docked-right");
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  };

  const ORIGIN_MARGIN = 16;

  function snapToSide() {
    const safeTop = 8 + getSafeInsetTop();
    const safeBottom = 8 + getSafeInsetBottom();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = getDotRect();
    const cx = r.left + r.width / 2;
    const sideRight = cx > vw / 2;

    let y = Math.max(safeTop, Math.min(r.top, vh - r.height - safeBottom));

    dot.classList.add("dot-docked");
    dot.classList.toggle("dot-docked-right", sideRight);
    dot.classList.toggle("dot-docked-left", !sideRight);

    const x = sideRight ? (vw - r.width - ORIGIN_MARGIN) : ORIGIN_MARGIN;
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
    dot.style.transform = "translate(0,0)";
  }

  function getSafeInsetTop() {
    const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function getSafeInsetBottom() {
    const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0", 10);
    return isNaN(v) ? 0 : v;
  }

  dot.addEventListener("pointerdown", (e) => {
    if (getState() !== "idle") return;
    if (document.body.classList.contains("dot-drag-off")) return;

    dragging = true;
    moved = false;
    suppressClickOnce = false;

    dot.setPointerCapture(e.pointerId);

    const r = getDotRect();
    startX = e.clientX;
    startY = e.clientY;
    originLeft = r.left;
    originTop  = r.top;

    enterFree();
    e.stopPropagation();
  });

  dot.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;

    dot.style.left = `${originLeft + dx}px`;
    dot.style.top  = `${originTop + dy}px`;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    dot.releasePointerCapture(e.pointerId);

    if (moved) {
      suppressClickOnce = true;
      if (document.body.classList.contains("dot-dock-off")) {
        returnToCenter();
      } else {
        snapToSide();
      }
    }
  };

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
    } else {
      if (getState() === "idle" && dot.classList.contains("dot-docked")) {
        returnToCenter();
        queueMicrotask(() => setState("menu"));
        e.stopPropagation();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (dot.classList.contains("dot-docked")) {
      snapToSide();
    } else if (dot.classList.contains("dot-free")) {
      const r = getDotRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
      const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
    }
  });
}