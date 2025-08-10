// js/core/gestures.js
// Жесты DOT: клики, back/esc, outside-click.
// ВАЖНО: outside‑click игнорирует клики внутри .fine-tune-popover.

import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) throw new Error("#dot-core not found");

  // Tap по DOT
  dot.addEventListener("click", (e) => {
    // клики по контенту не должны «пробрасываться» наружу
    e.stopPropagation();

    const s = getState();
    if (s === "idle") {
      setState("menu");
    }
    // если не idle — содержимое само рулит переходами (кнопки меню и т.п.)
  });

  // Outside click → back to idle (кроме кликов по поповерам)
  document.addEventListener("pointerdown", (e) => {
    // Если клик пришёл изнутри DOT — не закрываем
    if (e.target.closest("#dot-core")) return;

    // Если клик попал в любой поповер с fine‑tune — тоже не закрываем
    if (e.target.closest(".fine-tune-popover")) return;

    // Любой внешний тап — закрываем всё до idle
    if (getState() !== "idle") setState("idle");
  }, { capture: true }); // capture — чтобы сработать раньше bubbling‑обработчиков

  // Esc / Back
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (getState() !== "idle") {
        e.preventDefault();
        setState("idle");
      }
    }
  });

  // Защита: чтобы клики по контенту не считались «внешними»
  dot.addEventListener("pointerdown", (e) => e.stopPropagation());
}

export default initGestures;