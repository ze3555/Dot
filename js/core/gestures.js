import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Тап по Доту в idle -> меню (и не даём этому же клику схлопнуть меню)
  dot.addEventListener("click", (e) => {
    if (getState() === "idle") {
      e.stopPropagation();      // не пускаем событие на document
      setState("menu");
    }
  });

  // Клик вне Дота -> idle
  document.addEventListener("click", (e) => {
    if (!dot.contains(e.target)) setState("idle");
  });

  // ESC -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}