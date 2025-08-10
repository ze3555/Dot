// js/core/drag.js
import { getState, setState } from "./state.js";

/**
 * Перетаскивание DOT в IDLE и док к краям.
 * — Всегда включено (игнорируем .dot-drag-off).
 * — iOS fix: touch-action: none.
 * — Тап по докнутой точке: возвращает в центр и открывает меню.
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // iOS Safari требует это, иначе pointermove блокируется скроллом
  dot.style.touchAction = "none";

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;
  let suppressClickOnce = false;

  function rect() {
    const r = dot.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
    }

  function toLeft() {
    dot.classList.add("dot-docked","dot-docked-left");
    dot.classList.remove("dot-docked-right");
    const r = rect();
    dot.style.left = `0px`;
    dot.style.top  = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  }
  function toRight() {
    dot.classList.add("dot-docked","dot-docked-right");
    dot.classList.remove("dot-docked-left");
    const r = rect();
    const vw = window.innerWidth;
    dot.style.left = `${vw - r.width}px`;
    dot.style.top  = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  }
  function returnToCenter() {
    dot.classList.remove("dot-free","dot-docked","dot-docked-left","dot-docked-right");
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  }
  function clampFreePos() {
    const r = rect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
    const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
  }
  function snapToSide() {
    const r = rect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const safeTop = Math.max(8, Math.min(r.top, vh - r.height - 8));
    dot.style.top = `${safeTop}px`;
    (r.left + r.width / 2 < vw / 2) ? toLeft() : toRight();
  }

  dot.addEventListener("pointerdown", (e) => {
    if (getState() !== "idle") return;

    dragging = true;
    moved = false;
    suppressClickOnce = false;

    dot.setPointerCapture(e.pointerId);

    const r = rect();
    originLeft = r.left;
    originTop  = r.top;
    startX = e.clientX;
    startY = e.clientY;

    dot.classList.add("dot-free");
  });

  dot.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;

    dot.style.left = `${originLeft + dx}px`;
    dot.style.top  = `${originTop + dy}px`;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    try { dot.releasePointerCapture(e.pointerId); } catch {}

    if (moved) {
      suppressClickOnce = true;
      if (document.body.classList.contains("dot-dock-off")) {
        returnToCenter();
      } else {
        snapToSide();
      }
    }
    dot.classList.remove("dot-free");
  }

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
    } else {
      // Тап по докнутой точке в idle → в центр и сразу меню
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
      clampFreePos();
    }
  });
}
export default initDotDrag;