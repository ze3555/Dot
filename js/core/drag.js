// js/core/drag.js
// Перетаскивание #dot-core в пределах окна без инерции и без анимаций.

let dragging = false;
let startX = 0, startY = 0;
let origX = 0, origY = 0;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function getBounds(el) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;

  const pad = 0; // можно увеличить, если нужен внутренний отступ от краёв

  return {
    minX: pad,
    minY: pad,
    maxX: Math.max(pad, vw - r.width - pad),
    maxY: Math.max(pad, vh - r.height - pad),
    width: r.width,
    height: r.height,
  };
}

function getCurrentTranslate(el) {
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === "none") return { x: 0, y: 0 };
  const m = new DOMMatrixReadOnly(tr);
  return { x: m.m41 || 0, y: m.m42 || 0 };
}

export function initDotDrag() {
  const el = document.getElementById("dot-core");
  if (!el) return;

  // стартовая коррекция положения (на случай SSR/начальных классов)
  clampIntoViewport(el);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    const t = getCurrentTranslate(el);
    startX = e.clientX;
    startY = e.clientY;
    origX = t.x;
    origY = t.y;
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const b = getBounds(el);
    const nx = clamp(origX + dx, b.minX, b.maxX);
    const ny = clamp(origY + dy, b.minY, b.maxY);

    // Без переходов: просто ставим позицию
    el.style.willChange = "transform";
    el.style.transform = `translate(${nx}px, ${ny}px)`;
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    // Финальный «кламп» — если окно изменилось во время перетаскивания
    clampIntoViewport(el);
    // убираем will-change, чтобы не держать композитор
    requestAnimationFrame(() => { el.style.willChange = ""; });
  };

  const onResize = () => {
    clampIntoViewport(el);
  };

  el.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("resize", onResize);
}

function clampIntoViewport(el) {
  const t = getCurrentTranslate(el);
  const b = getBounds(el);
  const fx = clamp(t.x, b.minX, b.maxX);
  const fy = clamp(t.y, b.minY, b.maxY);
  el.style.transform = `translate(${fx}px, ${fy}px)`;
}
