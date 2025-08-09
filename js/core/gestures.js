
import { getState, setState } from "./state.js";
import { $ } from "./dom.js";

export function initGestures() {
  const dot = $("#dot-core");
  if (!dot) return;

  // Primary click: idle -> menu, else keep state (menu handles internal buttons)
  dot.addEventListener("click", (e) => {
    // If click comes from inside interactive content, ignore here
    if (e.target !== dot) return;
    if (getState() === "idle") setState("menu");
  });

  // Click outside closes back to idle
  document.addEventListener("click", (e) => {
    const within = dot.contains(e.target);
    if (!within) {
      setState("idle");
    }
  });

  // ESC to idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  });
}