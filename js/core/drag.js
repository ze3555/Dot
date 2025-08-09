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

  // to cancel fake click after drag
  let suppressClickOnce = false;

  // Get current center of dot in viewport
  const getDotRect = () => dot.getBoundingClientRect();

  // Put dot in "free" mode (absolute positioning via left/top)
  const enterFree = () => {
    dot.classList.add("dot-free");
    // remove center translate, compute left/top from center
    const r = getDotRect();
    const left = r.left;
    const top  = r.top;
    dot.style.left = `${left}px`;
    dot.style.top  = `${top}px`;
    dot.style.transform = "translate(0,0)"; // override center transform
  };

  // Return to centered idle (no docking)
  const returnToCenter = () => {
    // center again
    dot.classList.remove("dot-free","dot-docked","dot-docked-left","dot-docked-right");
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  };

  // Snap to the nearest side (left/right), clamp top
  const snapToSide = () => {
    const safeTop = 8 + getSafeInsetTop();
    const safeBottom = 8 + getSafeInsetBottom();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = getDotRect();
    const cx = r.left + r.width/2;
    const sideRight = cx > vw/2;

    // clamp top
    let y = Math.max(safeTop, Math.min(r.top, vh - r.height - safeBottom));

    dot.classList.add("dot-docked");
    dot.classList.toggle("dot-docked-right", sideRight);
    dot.classList.toggle("dot-docked-left", !sideRight);

    // set final coords
    const x = sideRight ? (vw - r.width - 16) : 16;
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
    dot.style.transform = "translate(0,0)";
  };

  function getSafeInsetTop() {
    const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function getSafeInsetBottom() {
    const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0", 10);
    return isNaN(v) ? 0 : v;
  }

  dot.addEventListener("pointerdown", (e) => {
    // only allow drag in idle and if drag not disabled
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
      suppressClickOnce = true; // prevent immediate click->menu
      // Dock if enabled, else return to center
      if (document.body.classList.contains("dot-dock-off")) {
        // smooth back to center
        returnToCenter();
      } else {
        snapToSide();
      }
    }
  };

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  // prevent click after drag from opening menu
  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
    } else {
      // If docked and clicked, bring back to center and open menu
      if (getState() === "idle" && dot.classList.contains("dot-docked")) {
        returnToCenter();
        // microtask to let layout settle, then open menu
        queueMicrotask(() => setState("menu"));
        e.stopPropagation();
      }
    }
  });

  // On resize/orientation change, keep docked within bounds
  window.addEventListener("resize", () => {
    if (dot.classList.contains("dot-docked")) {
      snapToSide();
    } else if (dot.classList.contains("dot-free")) {
      // keep within viewport
      const r = getDotRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
      const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
    }
  });
}
