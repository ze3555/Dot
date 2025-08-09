import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Любой клик внутри DOT в idle -> menu
  dot.addEventListener("click", () => {
    if (getState() === "idle") setState("menu");
  });

  // Клик снаружи -> idle
  document.addEventListener("click", (e) => {
    if (!dot.contains(e.target)) setState("idle");
  });

  // ESC -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}