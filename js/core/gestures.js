import { getState, setState } from "./state.js";

/** Вешает long-press на элемент */
export function attachLongPress(el, { threshold = 360, onLongPress }) {
  let pressed = false, moved = false, id = null;

  const clear = () => {
    pressed = false; moved = false;
    if (id) { clearTimeout(id); id = null; }
    document.body.classList.remove("no-select");
  };

  el.addEventListener("pointerdown", (e) => {
    document.body.classList.add("no-select"); // временно запрещаем выделение
    pressed = true; moved = false;
    id = setTimeout(() => { if (pressed && !moved) onLongPress(e); }, threshold);
    // На некоторых мобилах помогает подавить выделение/лупу:
    e.preventDefault();
  });

  el.addEventListener("pointermove", (e) => {
    if (!pressed) return;
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) moved = true;
  });

  ["pointerup","pointercancel","pointerleave"].forEach(evt =>
    el.addEventListener(evt, clear)
  );

  // Локально гасим контекст-меню (долгое касание) для этого элемента
  el.addEventListener("contextmenu", (e) => e.preventDefault());
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