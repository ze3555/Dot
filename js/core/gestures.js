import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Primary click on the empty DOT itself: idle -> menu
  dot.addEventListener("click", (e) => {
    // ignore clicks when content inside handles its own actions
    if (e.target !== dot) return;
    if (getState() === "idle") setState("menu");
  });

  // Click outside closes to idle
  document.addEventListener("click", (e) => {
    if (!dot.contains(e.target)) setState("idle");
  });

  // ESC to idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}