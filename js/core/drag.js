// js/core/drag.js
import { getState } from "./state.js";

/**
 * Чистый драг DOT без дока/снапа и без анимаций.
 * Уважает выключение через body.dot-drag-off (управляется Fine‑Tune).
 * Надёжно конвертирует стартовое положение из %/transform в px.
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // iOS Safari: разрешаем pointermove
  dot.style.touchAction = "none";

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;

  const rect = () => dot.getBoundingClientRect();

  function clampToViewport() {
    const r = rect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
    const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
  }

  dot.addEventListener("pointerdown", (e) => {
    if (getState() !== "idle") return;
    if (document.body.classList.contains("dot-drag-off")) return;

    dragging = true;
    moved = false;

    const r = rect();
    originLeft = r.left;
    originTop  = r.top;
    startX = e.clientX;
    startY = e.clientY;

    // === ВАЖНО: сразу переводим в абсолютные px-координаты ===
    // (если до этого было top/left 50% и transform: translate(-50%,-50%))
    dot.style.left = `${originLeft}px`;
    dot.style.top  = `${originTop}px`;
    dot.style.transform = "translate(0,0)";

    try { dot.setPointerCapture(e.pointerId); } catch {}
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
    try { dot.releasePointerCapture(e.pointerId); } catch {}
    if (moved) clampToViewport();
  };

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", clampToViewport);
}

export default initDotDrag;