// js/core/drag.js
import { getState, setState } from "./state.js";

/**
 * Drag DOT в idle + кламп в пределах экрана.
 * Фикс «езда со скроллом»: не слушаем visualViewport.scroll
 * и клампим только если действительно вышли за границы (EPS).
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // ---- geometry/safe areas ----
  const MARGIN = 8;
  const DOT_SIZE = 64; // синхронизировано с CSS --dot-size
  const EPS = 4;       // порог, чтобы не трогать позицию при микро-движениях вьюпорта

  const safeInt = (v) => {
    const n = parseInt(String(v || "0").trim(), 10);
    return Number.isFinite(n) ? n : 0;
  };
  const safeLeft   = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)"));
  const safeRight  = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)"));
  const safeTop    = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)"));
  const safeBottom = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)"));

  const vvRect = () => {
    const vv = window.visualViewport;
    return vv
      ? { w: vv.width, h: vv.height }
      : { w: window.innerWidth, h: window.innerHeight };
  };

  // ---- viewport memory to keep position stable on scroll URL-bar changes ----
  // Сохраняем предыдущие размеры вьюпорта, чтобы пересчитать позицию пропорционально
  // и не «прилипать» к углам при мелких изменениях высоты/ширины.
  let __lastVW = vvRect().w;
  let __lastVH = vvRect().h;

  function adjustForViewportDelta(prevVW, prevVH, vw, vh) {
    try {
      const r = dot.getBoundingClientRect();
      const sl = safeLeft(), sr = safeRight(), st = safeTop(), sb = safeBottom();

      let left = numPx(dot.style.left, r.left);
      let top  = numPx(dot.style.top,  r.top);

      // Горизонталь: если докнуто — пересчитываем по стороне дока; иначе — масштабируем.
      if (dot.classList.contains("dot-docked")) {
        const dockRight = dot.classList.contains("dot-docked-right");
        left = dockRight
          ? Math.max(MARGIN + sl, vw - DOT_SIZE - MARGIN - sr)
          : Math.max(MARGIN + sl, MARGIN + sl);
      } else if (prevVW && vw && Math.abs(prevVW - vw) > 0.5) {
        const ratioW = vw / prevVW;
        left = left * ratioW;
      }

      // Вертикаль: если близко к краю (≤24px) — сохраняем отступ до этого края; иначе — масштабируем.
      const gapTopPrev = r.top - (MARGIN + st);
      const gapBottomPrev = (prevVH - (r.top + r.height)) - (MARGIN + sb);

      if (prevVH && vh && Math.abs(prevVH - vh) > 0.5) {
        if (gapTopPrev <= 24) {
          top = Math.max(MARGIN + st, top);
        } else if (gapBottomPrev <= 24) {
          const newGapBottom = Math.max(MARGIN + sb, gapBottomPrev);
          top = vh - r.height - newGapBottom;
        } else {
          const ratioH = vh / prevVH;
          top = top * ratioH;
        }
      }

      dot.style.left = `${Math.round(left)}px`;
      dot.style.top  = `${Math.round(top)}px`;
      dot.style.transform = "translate(0,0)";
    } catch (_) { /* noop */ }
  }

  const numPx = (v, fallback) => {
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
  };

  function clampToViewport() {
    const { w: vw, h: vh } = vvRect();
    const sl = safeLeft(), sr = safeRight(), st = safeTop(), sb = safeBottom();

    const r = dot.getBoundingClientRect();

    const minLeft = MARGIN + sl;
    const maxLeft = Math.max(minLeft, vw - sr - r.width  - MARGIN);
    const minTop  = MARGIN + st;
    const maxTop  = Math.max(minTop,  vh - sb - r.height - MARGIN);

    const needLeft = (r.left < (minLeft - EPS)) || (r.left > (maxLeft + EPS));
    const needTop  = (r.top  < (minTop  - EPS)) || (r.top  > (maxTop  + EPS));
    if (!needLeft && !needTop) return; // внутри окна — не трогаем

    const curLeft = numPx(dot.style.left, r.left);
    const curTop  = numPx(dot.style.top,  r.top);

    const nextLeft = needLeft ? Math.min(Math.max(curLeft, minLeft), maxLeft) : curLeft;
    const nextTop  = needTop  ? Math.min(Math.max(curTop,  minTop ), maxTop) : curTop;

    dot.style.left = `${Math.round(nextLeft)}px`;
    dot.style.top  = `${Math.round(nextTop)}px`;
    dot.style.transform = "translate(0,0)";
  }

  // ---- drag state ----
  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;

  function onPointerDown(e) {
    if (getState() !== "idle") return;
    if (e.button !== 0 && e.pointerType !== "touch") return;

    const r = dot.getBoundingClientRect();
    originLeft = numPx(dot.style.left, r.left);
    originTop  = numPx(dot.style.top,  r.top);
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    moved = false;

    dot.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;

    dot.style.left = `${originLeft + dx}px`;
    dot.style.top  = `${originTop  + dy}px`;
    dot.classList.add("dot-free");
  }

  function snapDock() {
    if (getState() !== "idle") return;

    const { w: vw } = vvRect();
    const r = dot.getBoundingClientRect();
    const centerX = r.left + r.width / 2;

    if (document.body.classList.contains("dot-dock-off")) {
      clampToViewport();
      dot.classList.remove("dot-docked", "dot-docked-left", "dot-docked-right");
      return;
    }

    const dockRight = centerX > vw / 2;
    dot.classList.add("dot-docked");
    dot.classList.toggle("dot-docked-left",  !dockRight);
    dot.classList.toggle("dot-docked-right", dockRight);

    const sl = safeLeft(), sr = safeRight();
    const left = dockRight
      ? Math.max(MARGIN + sl, vw - DOT_SIZE - MARGIN - sr)
      : Math.max(MARGIN + sl, MARGIN + sl);

    dot.style.left = `${Math.round(left)}px`;
    dot.style.transform = "translate(0,0)";
    clampToViewport();
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;

    dot.classList.remove("dot-free");

    if (moved) {
      clampToViewport();
      snapDock();
    } else {
      if (getState() === "idle" && dot.classList.contains("dot-docked")) {
        setState("menu");
        e.stopPropagation();
      }
    }

    dot.releasePointerCapture?.(e.pointerId);
  }

  dot.addEventListener("pointerdown", onPointerDown, { passive: false });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });

  // ---- suppress clamp around keyboard focus/blur (GLOBAL) ----
  let suppress = false;
  let suppressUntil = 0;
  const SUPPRESS_AFTER_BLUR_MS = 550;
  const now = () => performance.now();
  const canClamp = () => !suppress && now() > suppressUntil;
  const safeClamp = () => {
    if (!canClamp()) return;
    const prevVW = __lastVW, prevVH = __lastVH;
    const { w: vw, h: vh } = vvRect();
    if (vw !== prevVW || vh !== prevVH) {
      adjustForViewportDelta(prevVW, prevVH, vw, vh);
      __lastVW = vw; __lastVH = vh;
    }
    clampToViewport();
  };

  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || t.getAttribute?.("role") === "textbox") {
      suppress = true;
    }
  }, true);

  document.addEventListener("focusout", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || t.getAttribute?.("role") === "textbox") {
      suppress = false;
      suppressUntil = now() + SUPPRESS_AFTER_BLUR_MS;
      setTimeout(() => { if (canClamp()) clampToViewport(); }, SUPPRESS_AFTER_BLUR_MS + 16);
    }
  }, true);

  // ---- viewport changes (URL bar, orientation, keyboard) ----
  window.addEventListener("resize", safeClamp);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", safeClamp);
    // ВАЖНО: scroll не слушаем — иначе дот «ездит» вместе со скроллом
    // window.visualViewport.addEventListener("scroll", safeClamp);
  }

  // стартовый кламп
  requestAnimationFrame(() => clampToViewport());
}