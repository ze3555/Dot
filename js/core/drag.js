// js/core/drag.js
import { getState, setState } from "./state.js";

/**
 * Drag DOT in IDLE. On release, snap to nearest side (dock),
 * unless body has .dot-dock-off => then return to center.
 * No top-jumps: resize only clamps current position (no re-snap).
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;
  let suppressClickOnce = false;

  const ORIGIN_MARGIN = 16;
  const getRect = () => dot.getBoundingClientRect();

  /** switch to free positioning (left/top) */
  function enterFree() {
    dot.classList.add("dot-free");
    const r = getRect();
    dot.style.left = `${r.left}px`;
    dot.style.top  = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  }

  /** return to centered idle (no docking) */
  function returnToCenter() {
    dot.classList.remove("dot-free","dot-docked","dot-docked-left","dot-docked-right");
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  }

  /** snap to nearest left/right side and clamp vertically */
  function snapToSide() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = getRect();
    const cx = r.left + r.width / 2;
    const sideRight = cx > vw / 2;

    // vertical clamp with margins
    const margin = 8;
    let y = Math.max(margin, Math.min(r.top, vh - r.height - margin));

    dot.classList.add("dot-docked");
    dot.classList.toggle("dot-docked-right", sideRight);
    dot.classList.toggle("dot-docked-left", !sideRight);

    const x = sideRight ? (vw - r.width - ORIGIN_MARGIN) : ORIGIN_MARGIN;
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
    dot.style.transform = "translate(0,0)";
  }

  /** clamp current position inside viewport WITHOUT changing dock side */
  function clampToViewport() {
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = getRect();

    let left = r.left;
    let top  = r.top;

    // horizontal bounds
    const maxLeft = vw - r.width - margin;
    if (left < margin) left = margin;
    if (left > maxLeft) left = maxLeft;

    // vertical bounds
    const maxTop = vh - r.height - margin;
    if (top < margin) top = margin;
    if (top > maxTop) top = maxTop;

    dot.style.left = `${Math.round(left)}px`;
    dot.style.top  = `${Math.round(top)}px`;
    dot.style.transform = "translate(0,0)";
  }

  // ----- pointer flow -----
  dot.addEventListener("pointerdown", (e) => {
    // drag only from idle and when drag enabled
    if (getState() !== "idle") return;
    if (document.body.classList.contains("dot-drag-off")) return;

    dragging = true;
    moved = false;
    suppressClickOnce = false;

    dot.setPointerCapture(e.pointerId);

    const r = getRect();
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

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    dot.releasePointerCapture(e.pointerId);

    if (moved) {
      suppressClickOnce = true;
      if (document.body.classList.contains("dot-dock-off")) {
        returnToCenter();
      } else {
        snapToSide();
      }
    }
  }
  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  // When docked & idle: open menu IN PLACE (no returnToCenter jump)
  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
      return;
    }
    if (getState() === "idle" && dot.classList.contains("dot-docked")) {
      setState("menu");
      e.stopPropagation();
    }
  });

  // ----- viewport changes (URL bar, orientation, etc.) -----
  // Important: DO NOT re-snap on resize. Only clamp current position.
  window.addEventListener("resize", () => {
    if (dot.classList.contains("dot-docked") || dot.classList.contains("dot-free")) {
      clampToViewport();
    }
  });
}