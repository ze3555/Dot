// js/handlers/coreHandlers.js
import { setTheme } from "../theme/index.js";

/**
 * DOT expands into a compact square with two vertical buttons:
 *  - "Function": emits 'dot:function'
 *  - "Theme": toggles light/dark via setTheme(next)
 * Smooth animation; drag-safe (post-drag clicks are suppressed).
 * Buttons now receive clicks (no capture-level stop on parent).
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
    zIndex: "", borderRadius: "", transition: "", transform: ""
  };

  // ----- Drag-safe click suppression -----
  const DRAG_SLOP = 4;      // px: считаем как "двигал"
  const SUPPRESS_MS = 180;  // ms: подавляем клик сразу после драга
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

  // Toggle on click (BUBBLE!). Не мешаем кнопкам внутри панели.
  dot.addEventListener("click", (e) => {
    if (Date.now() < suppressUntil) return;           // только что таскали — не открываем
    if (dot.classList.contains("is-dragging")) return;
    if (isOpen && e.target.closest(".dot-panel")) return; // пусть обработчик кнопки сработает
    e.preventDefault();
    isOpen ? collapse() : expand();
  }); // ← без capture

  function expand() {
    if (isOpen) return;
    isOpen = true;

    const rect = dot.getBoundingClientRect();
    for (const k in saved) saved[k] = dot.style[k] || "";

    // Зафиксировать Dot в экранных координатах
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

    dot.classList.add("dot-expanded");

    // Панель с кнопками (вертикально)
    panel = document.createElement("div");
    panel.className = "dot-panel";
    panel.innerHTML = `
      <button type="button" class="dot-btn" id="dot-fn" aria-label="Run Function">Function</button>
      <button type="button" class="dot-btn" id="dot-theme" aria-label="Toggle Theme">Theme</button>
    `;
    dot.appendChild(panel);

    // Действия
    panel.querySelector("#dot-fn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("dot:function"));
      collapse();
    });

    panel.querySelector("#dot-theme")?.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next); // единый механизм темы
      // панель не закрываем — можно сразу вернуть обратно при желании
    });

    // Закрытие
    document.addEventListener("keydown", onEsc, true);
    document.addEventListener("click", onOutsideClick); // bubble достаточно

    // Компактный квадрат, адаптивный
    const TARGET = Math.max(128, Math.min(160,
      Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.24)
    ));
    const dx = (TARGET - rect.width) / 2;
    const dy = (TARGET - rect.height) / 2;

    // Контраст от темы (фон панели)
    if (document.body.classList.contains("theme-dark")) {
      dot.style.background = "#111"; dot.style.color = "#fff";
    } else {
      dot.style.background = "#fff"; dot.style.color = "#111";
    }
    dot.style.boxShadow = "0 14px 32px rgba(0,0,0,0.32)";

    // Анимация
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

    // Возврат в исходные размеры/позицию
    dot.style.left = saved.left;
    dot.style.top = saved.top;
    dot.style.width = saved.width;
    dot.style.height = saved.height;
    dot.style.borderRadius = saved.borderRadius || "";
    dot.style.boxShadow = "0 0 0 rgba(0,0,0,0)";

    const onDone = () => {
      dot.removeEventListener("transitionend", onDone);
      panel?.remove(); panel = null;

      // Восстановить стили
      dot.style.position = saved.position;
      dot.style.left = saved.left;
      dot.style.top = saved.top;
      dot.style.width = saved.width;
      dot.style.height = saved.height;
      dot.style.zIndex = saved.zIndex;
      dot.style.borderRadius = saved.borderRadius;
      dot.style.transition = saved.transition;
      dot.style.transform = saved.transform;
      dot.style.background = "";
      dot.style.boxShadow = "";
      dot.classList.remove("dot-expanded");

      document.removeEventListener("keydown", onEsc, true);
      document.removeEventListener("click", onOutsideClick);

      isOpen = false;
      restoring = false;
    };
    dot.addEventListener("transitionend", onDone);
  }

  function onEsc(e) { if (e.key === "Escape") collapse(); }
  function onOutsideClick(e) { if (!dot.contains(e.target)) collapse(); }
}

function injectStylesOnce() {
  if (document.getElementById("dot-expander-styles")) return;
  const style = document.createElement("style");
  style.id = "dot-expander-styles";
  style.textContent = `
    .dot-core.dot-expanded {
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    /* Panel — vertical stack */
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
    /* Buttons — full width, compact height */
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
