import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Тап по Доту в idle -> меню (и не даём этому же клику схлопнуть меню)
  dot.addEventListener("click", (e) => {
    if (getState() === "idle") {
      e.stopPropagation();
      setState("menu");
    }
  });

  // Надёжный outside-click:
  // 1) Запоминаем, где начался pointer (внутри/снаружи)
  // 2) Закрываем на click только если pointerdown был СНАРУЖИ
  let startedInside = false;

  document.addEventListener("pointerdown", (e) => {
    startedInside = dot.contains(e.target);
  }, { capture: true }); // захват, чтобы сработало до ремаута

  document.addEventListener("click", (e) => {
    if (!startedInside) {
      setState("idle");
    }
    startedInside = false; // сброс
  }, { capture: true });

  // ESC -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState("idle");
  }, { passive: true });
}