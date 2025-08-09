// js/core/drag.js
import { getState, setState } from "./state.js";

/**
 * Drag DOT в IDLE и кламп в вьюпорт.
 * Фикс «прыжка» после фокуса поля: на время фокуса инпутов
 * отключаем кламп, и ещё на ~450ms после blur (когда прячется клавиатура).
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;

  // --- SUPPRESS CLAMP WHILE KEYBOARD ANIMATES ---
  let suppressClamp = false;
  let suppressUntil = 0;
  const SUPPRESS_AFTER_BLUR_MS = 500;

  function now() { return performance.now(); }
  function canClamp() { return !suppressClamp && now() > suppressUntil; }

  function withSuppress(fn) {
    const prev = suppressClamp; suppressClamp = true;
    try { fn(); } finally { suppressClamp = prev; }
  }

  // --- HELPERS ---
  function getNumberPx(v) {
    const n = parseFloat(String(v || 0));
    return Number.isFinite(n) ? n : 0;
  }

  function getViewportRect() {
    // Предпочтительно visualViewport (iOS корректно учитывает клавиатуру)
    const vv = window.visualViewport;
    if (vv) {
      return {
        x: vv.offsetLeft || 0,
        y: vv.offsetTop  || 0,
        w: vv.width,
        h: vv.height
      };
    }
    return { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
  }

  function clampToViewport() {
    if (!canClamp()) return;

    const margin = 8; // безопасный отступ со всех сторон
    const vp = getViewportRect();
    const rect = dot.getBoundingClientRect();

    // Текущие абсолютные left/top (через style, т.к. #dot-core position:fixed)
    const currentLeft = getNumberPx(dot.style.left) || rect.left;
    const currentTop  = getNumberPx(dot.style.top)  || rect.top;

    let nextLeft = currentLeft;
    let nextTop  = currentTop;

    const maxLeft = vp.x + vp.w - rect.width  - margin;
    const maxTop  = vp.y + vp.h - rect.height - margin;
    const minLeft = vp.x + margin;
    const minTop  = vp.y + margin;

    if (nextLeft < minLeft) nextLeft = minLeft;
    if (nextTop  < minTop ) nextTop  = minTop;
    if (nextLeft > maxLeft) nextLeft = maxLeft;
    if (nextTop  > maxTop ) nextTop  = maxTop;

    // Изменяем без переходов, чтобы не было рывков
    withSuppress(() => {
      dot.style.left = `${nextLeft}px`;
      dot.style.top  = `${nextTop}px`;
      dot.classList.add("dot-free"); // фиксируем, что он свободно перемещаемый
    });
  }

  // --- DRAG (только в idle) ---
  function onPointerDown(e) {
    if (getState() !== "idle") return;
    if (e.button !== 0 && e.pointerType !== "touch") return;

    dragging = true;
    moved = false;

    const rect = dot.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    originLeft = rect.left;
    originTop  = rect.top;

    dot.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;

    const nextLeft = originLeft + dx;
    const nextTop  = originTop  + dy;

    suppressClamp = true; // пока тащим — не клампим
    dot.style.left = `${nextLeft}px`;
    dot.style.top  = `${nextTop}px`;
    dot.classList.add("dot-free");
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    suppressClamp = false;

    // По отпусканию — просто клампим в вьюпорт, без «snap to side»
    clampToViewport();

    dot.releasePointerCapture?.(e.pointerId);

    // Тап по докнутому доту открывает меню (сохраняем твою логику)
    if (!moved && getState() === "idle" && dot.classList.contains("dot-docked")) {
      setState("menu");
      e.stopPropagation();
    }
  }

  dot.addEventListener("pointerdown", onPointerDown, { passive: false });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });

  // --- RESIZE/KEYBOARD HANDLERS ---
  function onAnyResize() {
    // Клампим только если разрешено
    if (dot.classList.contains("dot-docked") || dot.classList.contains("dot-free")) {
      clampToViewport();
    }
  }

  // window.resize (универсально)
  window.addEventListener("resize", onAnyResize);

  // visualViewport (лучше на iOS)
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onAnyResize);
    window.visualViewport.addEventListener("scroll", onAnyResize);
  }

  // --- SUPPRESS AROUND INPUT FOCUS ---
  // Когда любой input/textarea внутри DOT получает фокус — глушим кламп.
  dot.addEventListener("focusin", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
      suppressClamp = true;
    }
  });

  // После blur — даём клавиатуре схлопнуться и только потом снова клампим.
  dot.addEventListener("focusout", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
      suppressClamp = false;
      suppressUntil = now() + SUPPRESS_AFTER_BLUR_MS;
      // Через небольшой таймаут — безопасный кламп.
      setTimeout(() => clampToViewport(), SUPPRESS_AFTER_BLUR_MS + 16);
    }
  });

  // На старте — один раз убедимся, что DOT в пределах экрана.
  requestAnimationFrame(() => clampToViewport());
}