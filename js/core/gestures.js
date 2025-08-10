import { getState, setState } from "./state.js";

/** Долгое нажатие на элемент */
export function attachLongPress(el, { threshold = 360, onLongPress }) {
  let pressed = false, moved = false, id = null;

  const clear = () => {
    pressed = false; moved = false;
    if (id) { clearTimeout(id); id = null; }
    document.body.classList.remove("no-select");
  };

  el.addEventListener("pointerdown", (e) => {
    document.body.classList.add("no-select");
    pressed = true; moved = false;
    id = setTimeout(() => { if (pressed && !moved) onLongPress?.(e); }, threshold);
    e.preventDefault();
  });

  el.addEventListener("pointermove", (e) => {
    if (!pressed) return;
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) moved = true;
  });

  ["pointerup","pointercancel","pointerleave"].forEach(evt =>
    el.addEventListener(evt, clear)
  );

  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Outside click: переводим в idle
  let startedInside = false;
  document.addEventListener("pointerdown", (e) => {
    startedInside = dot.contains(e.target);
  }, { capture: true });

  document.addEventListener("click", () => {
    if (!startedInside) setState("idle");
    startedInside = false;
  }, { capture: true });

  // Tap по DOT в idle -> menu
  dot.addEventListener("click", (e) => {
    if (getState() !== "idle") return;

    // КЛЮЧЕВОЕ: если DOT докнут — НЕ открываем меню здесь.
    // Это сделает drag.js (сначала вернёт в центр, затем setState('menu')).
    if (dot.classList.contains("dot-docked")) return;

    e.stopPropagation();
    setState("menu");
  });

  // ESC -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}