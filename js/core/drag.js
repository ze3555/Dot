// js/core/drag.js
// Plain drag for #dot-core (idle only). No dock/snap. Respects body.dot-drag-off.

import { getState } from "./state.js";

export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // allow absolute positioning & pointer moves (iOS)
  if (getComputedStyle(dot).position === "static") dot.style.position = "absolute";
  dot.style.touchAction = "none";

  let dragging = false, moved = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;

  const rect = () => dot.getBoundingClientRect();

  function clampToViewport() {
    const r = rect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
    const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
  }

  dot.addEventListener("pointerdown", (e) => {
    if (getState() !== "idle") return;
    if (document.body.classList.contains("dot-drag-off")) return;

    dragging = true; moved = false;

    const r = rect();
    originLeft = r.left; originTop = r.top;
    startX = e.clientX;  startY = e.clientY;

    // convert from centered translate to absolute px
    dot.style.left = `${originLeft}px`;
    dot.style.top  = `${originTop}px`;
    dot.style.transform = "translate(0,0)";

    try { dot.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
  });

  dot.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;

    dot.style.left = `${originLeft + dx}px`;
    dot.style.top  = `${originTop + dy}px`;
    e.preventDefault();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    try { dot.releasePointerCapture(e.pointerId); } catch {}
    if (moved) clampToViewport();
  }

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);
  window.addEventListener("resize", clampToViewport);
}

export default initDotDrag;