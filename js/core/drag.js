// js/core/drag.js (patched: clamp #dot-core within BODY)
let dragging = false;
let startX = 0, startY = 0;
let origX = 0, origY = 0;

let minX = 0, maxX = 0, minY = 0, maxY = 0;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

function getCurrentTranslate(el) {
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === "none") return { x: 0, y: 0 };
  const m = new DOMMatrixReadOnly(tr);
  return { x: m.m41 || 0, y: m.m42 || 0 };
}

function computeBoundsForTranslate(container, el, baseTranslate, elRectAtDown) {
  const c = container.getBoundingClientRect();
  const e = elRectAtDown;

  let minTranslateX = baseTranslate.x + (c.left - e.left);
  let maxTranslateX = baseTranslate.x + (c.right - e.right);
  let minTranslateY = baseTranslate.y + (c.top - e.top);
  let maxTranslateY = baseTranslate.y + (c.bottom - e.bottom);

  if (minTranslateX > maxTranslateX) {
    const midX = (minTranslateX + maxTranslateX) / 2;
    minTranslateX = maxTranslateX = midX;
  }
  if (minTranslateY > maxTranslateY) {
    const midY = (minTranslateY + maxTranslateY) / 2;
    minTranslateY = maxTranslateY = midY;
  }
  return { minX: minTranslateX, maxX: maxTranslateX, minY: minTranslateY, maxY: maxTranslateY };
}

function clampIntoContainer(container, el) {
  const t = getCurrentTranslate(el);
  const e = el.getBoundingClientRect();
  const b = computeBoundsForTranslate(container, el, t, e);
  const fx = Math.min(Math.max(t.x, b.minX), b.maxX);
  const fy = Math.min(Math.max(t.y, b.minY), b.maxY);
  el.style.transform = `translate(${fx}px, ${fy}px)`;
}

export function initDotDrag() {
  const el = document.getElementById("dot-core");
  if (!el) return;
  const container = document.body;

  clampIntoContainer(container, el);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const t = getCurrentTranslate(el);
    startX = e.clientX;
    startY = e.clientY;
    origX = t.x;
    origY = t.y;
    const elRectAtDown = el.getBoundingClientRect();
    const b = computeBoundsForTranslate(container, el, { x: origX, y: origY }, elRectAtDown);
    minX = b.minX; maxX = b.maxX; minY = b.minY; maxY = b.maxY;
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let nx = origX + dx;
    let ny = origY + dy;
    nx = clamp(nx, minX, maxX);
    ny = clamp(ny, minY, maxY);
    el.style.willChange = "transform";
    el.style.transform = `translate(${nx}px, ${ny}px)`;
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch {}
    clampIntoContainer(container, el);
    requestAnimationFrame(() => { el.style.willChange = ""; });
  };

  const onResize = () => clampIntoContainer(container, el);

  el.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("resize", onResize);
}
