// js/core/gestures.js
// Жесты DOT: tap по DOT -> menu, tap вне -> idle, Esc -> idle.
// Игнорирует клики внутри .fine-tune-popover. Поддерживает подавление клика после драга.

import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) { console.warn("[DOT] #dot-core not found in initGestures"); return; }

  // Открыть меню по клику на DOT (только из idle)
  dot.addEventListener("click", (e) => {
    // Если драг поставил флаг подавления — гасим ровно один клик
    if (dot.dataset.suppressClick === "1") {
      dot.dataset.suppressClick = "";
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    if (getState() === "idle") setState("menu");
  });

  // Клик/тап вне DOT — закрыть (но не если внутри fine-tune поповера)
  document.addEventListener("pointerdown", (e) => {
    const t = e.target;
    if (t.closest("#dot-core")) return;
    if (t.closest(".fine-tune-popover")) return;
    if (getState() !== "idle") setState("idle");
  }, { capture: true });

  // Esc -> idle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getState() !== "idle") {
      e.preventDefault();
      setState("idle");
    }
  });

  // Не считаем нажатия внутри DOT «внешними»
  dot.addEventListener("pointerdown", (e) => e.stopPropagation());
}

export default initGestures;