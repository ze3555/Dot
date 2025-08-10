// js/core/gestures.js
// Tap DOT -> open menu (from idle)
// Tap outside -> idle
// Esc -> idle
// Inside .fine-tune-popover clicks are ignored by outside-closer.

import { getState, setState } from "./state.js";

export function initGestures() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Открыть меню по клику на DOT (только из idle)
  dot.addEventListener("click", (e) => {
    // Подавление одиночного клика после драга
    if (dot.dataset.suppressClick === "1") {
      dot.dataset.suppressClick = "";
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    if (getState() === "idle") setState("menu");
  });

  // Не считать нажатия внутри DOT «внешними»
  dot.addEventListener("pointerdown", (e) => e.stopPropagation(), { capture: true });

  // Outside click -> idle (но игнорим клики внутри fine-tune)
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
}

export default initGestures;