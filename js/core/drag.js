// js/core/drag.js
// Опциональный драг (включается в Settings → Fine‑Tune)
import { getMovable, getAnchor, setAnchor } from "./state.js";

export function initDotDrag(dot) {
  if (!dot) return;
  let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;

  const clamp = (x, y) => {
    const m = 8; // минимальные отступы
    const r = dot.getBoundingClientRect();
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.clientHeight;
    const nx = Math.min(W - r.width  - m, Math.max(m, x));
    const ny = Math.min(H - r.height - m, Math.max(m, y));
    return [nx, ny];
  };

  const onDown = (e) => {
    if (!getMovable()) return;
    dragging = true;
    const r = dot.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    baseX = r.left; baseY = r.top;
    dot.setPointerCapture(e.pointerId);
    dot.classList.add("dot-dragging");
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let [nx, ny] = clamp(baseX + dx, baseY + dy);
    dot.style.left = nx + "px";
    dot.style.top  = ny + "px";
    dot.style.right = "auto";
    dot.style.bottom = "auto";
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    dot.releasePointerCapture(e.pointerId);
    dot.classList.remove("dot-dragging");
    const r = dot.getBoundingClientRect();
    setAnchor(r.left, r.top);
  };

  dot.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  // применить сохранённый якорь (если есть)
  const a = getAnchor();
  if (Number.isFinite(a.x) && Number.isFinite(a.y)) {
    dot.style.left = a.x + "px";
    dot.style.top  = a.y + "px";
    dot.style.right = "auto";
    dot.style.bottom = "auto";
  }
}