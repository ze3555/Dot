import { getState } from "./state.js";

/**
 * Enable dragging the Dot in IDLE.
 * Без дока и без фиксации в центре: после отпускания остаёмся на месте.
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
      // Остаёмся там, где отпустили (никакого returnToCenter).
      suppressClickOnce = true;
    }
  };

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
    }
  });

  // Держим Dot в видимой области при ресайзе, если он в свободном положении
  window.addEventListener("resize", () => {
    if (dot.classList.contains("dot-free")) {
      const r = getDotRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
      const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
    }
  });
}