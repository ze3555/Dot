// js/core/gestures.js
// Tap DOT -> open menu (from idle). Tap outside -> idle. Esc -> idle.

import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Open menu by tap on DOT (idle only)
  dot.addEventListener("click", (e) => {
    e.stopPropagation();
    if (getState() === "idle") setState("menu");
  });

  // Prevent inside DOT from counting as outside
  dot.addEventListener("pointerdown", (e) => e.stopPropagation(), { capture: true });

  // Outside click closes to idle
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("#dot-core")) return;
    if (getState() !== "idle") setState("idle");
  }, { capture: true });

  // Esc -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getState() !== "idle") {
      e.preventDefault();
      setState("idle");
    }
  });
}

export default initGestures;