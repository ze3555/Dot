import { getState, setState } from "./state.js";

/**
 * Attach long press to element.
 * @param {Element} el
 * @param {{threshold?: number, onLongPress: (ev: PointerEvent)=>void}} opts
 */
export function attachLongPress(el, { threshold = 360, onLongPress }) {
  let t = 0, pressed = false, moved = false, id = null;

  const clear = () => { pressed = false; moved = false; if (id) { clearTimeout(id); id = null; } };

  el.addEventListener("pointerdown", (e) => {
    pressed = true; moved = false; t = performance.now();
    id = setTimeout(() => {
      if (pressed && !moved) onLongPress(e);
    }, threshold);
  });

  el.addEventListener("pointermove", (e) => {
    if (!pressed) return;
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) moved = true;
  });

  ["pointerup","pointercancel","pointerleave"].forEach(evt =>
    el.addEventListener(evt, clear)
  );
}

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Надёжный outside-click via pointerdown origin
  let startedInside = false;
  document.addEventListener("pointerdown", (e) => {
    startedInside = dot.contains(e.target);
  }, { capture: true });

  document.addEventListener("click", () => {
    if (!startedInside) setState("idle");
    startedInside = false;
  }, { capture: true });

  // Tap on Dot in idle -> menu
  dot.addEventListener("click", (e) => {
    if (getState() === "idle") {
      e.stopPropagation();
      setState("menu");
    }
  });

  // ESC -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}