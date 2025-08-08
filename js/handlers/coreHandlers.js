// js/handlers/coreHandlers.js
import { setTheme } from "../theme/index.js";

/**
 * DOT expands into a compact square with two vertical buttons:
 *  - "Function": emits 'dot:function'
 *  - "Theme": toggles light/dark via setTheme(next)
 * Smooth animation; drag-safe; when expanded we freeze auto-contrast
 * and style via theme vars (no inline colors).
 */
export function setupDotCoreMenu() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  injectStylesOnce();

  let isOpen = false;
  let restoring = false;
  let panel = null;

  // Save/restore inline styles to avoid layout shifts
  const saved = {
    position: "", left: "", top: "", width: "", height: "",
    zIndex: "", borderRadius: "", transition: "", transform: "",
    boxShadow: "", color: "", backgroundColor: ""
  };

  // ----- Drag-safe click suppression -----
  const DRAG_SLOP = 4;
  const SUPPRESS_MS = 180;
  let suppressUntil = 0;
  const pointer = { active:false, startX:0, startY:0, moved:false };

  dot.addEventListener("pointerdown", (e) => {
    pointer.active = true;
    pointer.moved = false;
    pointer.startX = e.clientX;
    pointer.startY = e.clientY;
  }, true);

  window.addEventListener("pointermove", (e) => {
    if (!pointer.active || pointer.moved) return;
    const dx = Math.abs(e.clientX - pointer.startX);
    const dy = Math.abs(e.clientY - pointer.startY);
    if (dx > DRAG_SLOP || dy > DRAG_SLOP) pointer.moved = true;
  }, true);

  window.addEventListener("pointerup", () => {
    if (pointer.moved) suppressUntil = Date.now() + SUPPRESS_MS;
    pointer.active = false;
  }, true);

  // Блокируем драг, когда раскрыт
  dot.addEventListener("pointerdown", (e) => {
    if (isOpen) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // Toggle on click (bubble). Кнопки внутри панели не трогаем.
  dot.addEventListener("click", (e) => {
    if (Date.now() < suppressUntil) return;
    if (dot.classList.contains("is-dragging")) return;
    if (isOpen && e.target.closest(".dot-panel")) return;
    e.preventDefault();
    isOpen ? collapse() : expand();
  });

  // === Закрытие по клику вне и по ESC ===
  const onOutsidePointerDown = (e) => {
    if (!isOpen) return;
    // если клик не по доту и не внутри панели — закрываем
    if (!dot.contains(e.target)) {
      collapse();
    }
  };
  const onEscape = (e) => {
    if (isOpen && e.key === "Escape") collapse();
  };

  function expand() {
    if (isOpen) return;
    isOpen = true;

    const rect = dot.getBoundingClientRect();
    for (const k in saved) saved[k] = dot.style[k] || "";

    // Зафиксировать в viewport и анимировать в квадрат
    dot.style.position = "fixed";
    dot.style.left = rect.left + "px";
    dot.style.top = rect.top + "px";
    dot.style.width = rect.width + "px";
    dot.style.height = rect.height + "px";
    dot.style.transform = "translate3d(0,0,0)";
    dot.style.zIndex = "2147483647";
    dot.style.transition =
      "left 180ms cubic-bezier(.2,.8,.2,1), " +
      "top 180ms cubic-bezier(.2,.8,.2,1), " +
      "width 180ms cubic-bezier(.2,.8,.2,1), " +
      "height 180ms cubic-bezier(.2,.8,.2,1), " +
      "border-radius 180ms cubic-bezier(.2,.8,.2,1), " +
      "box-shadow 180ms cubic-bezier(.2,.8,.2,1)";

    // Флаг раскрытия — замораживает автоконтраст в dotCoreDrag.js
    dot.classList.add("dot-expanded");

    // Панель
    panel = document.createElement("div");
    panel.className = "dot-panel";
    panel.innerHTML = `
      <button type="button" class="dot-btn" id="dot-fn" aria-label="Run Function">Function</button>
      <button type="button" class="dot-btn" id="dot-theme" aria-label="Toggle Theme">Theme</button>
    `;
    dot.appendChild(panel);

    panel.querySelector("#dot-fn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("dot:function"));
      collapse();
    });

    panel.querySelector("#dot-theme")?.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
      // цвета/фон панели задаёт тема через .dot-expanded
    });

    // Подписки на время открытия: клики вне и ESC
    // pointerdown с capture — закрываем до чужих обработчиков
    document.addEventListener("pointerdown", onOutsidePointerDown, true);
    document.addEventListener("keydown", onEscape);

    // Визуал
    const TARGET = Math.max(128, Math.min(160,
      Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.24)
    ));
    const dx = (TARGET - rect.width) / 2;
    const dy = (TARGET - rect.height) / 2;

    dot.style.boxShadow = "0 14px 32px rgba(0,0,0,0.32)";

    requestAnimationFrame(() => {
      dot.style.left = rect.left - dx + "px";
      dot.style.top = rect.top - dy + "px";
      dot.style.width = TARGET + "px";
      dot.style.height = TARGET + "px";
      dot.style.borderRadius = "12px";
      setTimeout(() => panel.classList.add("visible"), 60);
    });
  }

  function collapse() {
    if (!isOpen || restoring) return;
    restoring = true;
    panel?.classList.remove("visible");

    // Снятие подписок
    document.removeEventListener("pointerdown", onOutsidePointerDown, true);
    document.removeEventListener("keydown", onEscape);

    // Возврат геометрии
    dot.style.left = saved.left;
    dot.style.top = saved.top;
    dot.style.width = saved.width;
    dot.style.height = saved.height;
    dot.style.borderRadius = saved.borderRadius || "";
    dot.style.boxShadow = "0 0 0 rgba(0,0,0,0)";

    const onDone = () => {
      dot.removeEventListener("transitionend", onDone);
      panel?.remove(); panel = null;

      // Снимаем флаг раскрытия — автоконтраст снова активен
      dot.classList.remove("dot-expanded");

      // Восстанавливаем inline-стили (цвет/фон дальше выставит автоконтраст)
      dot.style.position = saved.position;
      dot.style.left = saved.left;
      dot.style.top = saved.top;
      dot.style.width = saved.width;
      dot.style.height = saved.height;
      dot.style.zIndex = saved.zIndex;
      dot.style.borderRadius = saved.borderRadius;
      dot.style.transition = saved.transition;
      dot.style.transform = saved.transform;
      dot.style.backgroundColor = saved.backgroundColor;
      dot.style.color = saved.color;

      isOpen = false;
      restoring = false;
    };
    dot.addEventListener("transitionend", onDone);
  }
}

function injectStylesOnce() {
  if (document.getElementById("dot-expander-styles")) return;
  const style = document.createElement("style");
  style.id = "dot-expander-styles";
  style.textContent = `
    /* Когда DOT раскрыт, фон/текст берем из темы (кнопки видны) */
    .dot-core.dot-expanded {
      display: grid;
      place-items: center;
      overflow: hidden;
      background: var(--panel-bg) !important;
      color: var(--panel-fg) !important;
    }
    /* Панель с кнопками */
    .dot-core .dot-panel {
      position: absolute;
      inset: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
      justify-content: center;
      opacity: 0;
      transform: scale(.985);
      transition: opacity 150ms cubic-bezier(.2,.8,.2,1), transform 150ms cubic-bezier(.2,.8,.2,1);
      pointer-events: none;
    }
    .dot-core .dot-panel.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    /* Кнопки — currentColor */
    .dot-core .dot-btn {
      -webkit-tap-highlight-color: transparent;
      appearance: none;
      border: 1px solid currentColor;
      background: transparent;
      color: currentColor;
      padding: 10px 12px;
      border-radius: 10px;
      font: inherit;
      line-height: 1;
      cursor: pointer;
      opacity: 0.95;
      transition: transform 120ms cubic-bezier(.2,.8,.2,1), opacity 120ms cubic-bezier(.2,.8,.2,1);
      width: 100%;
      text-align: center;
    }
    .dot-core .dot-btn:hover { opacity: 1; }
    .dot-core .dot-btn:active { transform: scale(0.985); }
  `;
  document.head.appendChild(style);
}