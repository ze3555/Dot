// js/handlers/coreHandlers.js
import { setTheme } from "../theme/index.js";

/**
 * DOT expands into a compact square with two vertical buttons:
 *  - "Function": emits 'dot:function'
 *  - "Theme": toggles light/dark via setTheme(next)
 * Smooth animation; drag-safe (post-drag clicks are suppressed).
 * Now: no hard theme colors on expand; contrast auto-recomputed.
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
    zIndex: "", borderRadius: "", transition: "", transform: "", boxShadow: "", background: "", color: ""
  };

  // ----- Drag-safe click suppression -----
  const DRAG_SLOP = 4;      // px
  const SUPPRESS_MS = 180;  // ms
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

  // Toggle on click (BUBBLE). Не мешаем кнопкам внутри панели.
  dot.addEventListener("click", (e) => {
    if (Date.now() < suppressUntil) return;
    if (dot.classList.contains("is-dragging")) return;
    if (isOpen && e.target.closest(".dot-panel")) return;
    e.preventDefault();
    isOpen ? collapse() : expand();
  });

  // ===== Контраст под Дотом (фон+цвет) — локальная утилита =====
  function recomputeDotContrast() {
    // центр текущего дота в viewport
    const rect = dot.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    // заглянуть «под дот»
    const prevPE = dot.style.pointerEvents;
    dot.style.pointerEvents = "none";
    let behind = document.elementFromPoint(cx, cy);
    dot.style.pointerEvents = prevPE;

    // ищем непрозрачный фон вверх
    let rgba = null;
    for (let i = 0; i < 12 && behind; i++) {
      const bg = getComputedStyle(behind).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { rgba = parsed; break; }
      behind = behind.parentElement;
    }
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const hex = lum < 0.5 ? "#fff" : "#000";

    // ставим и fill, и fg
    if (dot.style.backgroundColor !== hex) dot.style.backgroundColor = hex;
    if (dot.style.color !== hex) dot.style.color = hex;

    // страхуем вложенные svg
    try {
      dot.querySelectorAll("svg").forEach(svg => {
        svg.style.stroke = "currentColor";
        svg.style.fill = "currentColor";
      });
    } catch(_) {}
  }
  function srgb(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  function parseCssColor(color){
    if (!color) return null;
    if (color === "transparent") return [0,0,0,0];
    if (color.startsWith("rgb")) {
      const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/i);
      if (!m) return null;
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), m[4] ? parseFloat(m[4]) : 1];
    }
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split("").map(c=>c+c).join("");
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return [r,g,b,1];
    }
    return null;
  }

  // Временные подписки на время раскрытия
  let mo = null;
  const onWinChange = () => recomputeDotContrast();

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
      // контраст мог измениться из-за overlay — обновим перед закрытием
      recomputeDotContrast();
      collapse();
    });

    panel.querySelector("#dot-theme")?.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
      // сразу пересчитать контраст, т.к. фон за дотом поменялся
      // маленькая задержка, чтобы body успел переключить класс и перекрасить фон
      requestAnimationFrame(recomputeDotContrast);
    });

    // Подписки на время открытия: изменения окна и темы
    window.addEventListener("resize", onWinChange, { passive: true });
    window.addEventListener("scroll", onWinChange, { passive: true });
    mo = new MutationObserver(recomputeDotContrast);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Компактный квадрат
    const TARGET = Math.max(128, Math.min(160,
      Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.24)
    ));
    const dx = (TARGET - rect.width) / 2;
    const dy = (TARGET - rect.height) / 2;

    // Тени без вмешательства в цвет — цвет задаёт auto-contrast
    dot.style.boxShadow = "0 14px 32px rgba(0,0,0,0.32)";

    // Анимация и первичный пересчёт контраста
    requestAnimationFrame(() => {
      dot.style.left = rect.left - dx + "px";
      dot.style.top = rect.top - dy + "px";
      dot.style.width = TARGET + "px";
      dot.style.height = TARGET + "px";
      dot.style.borderRadius = "12px";
      // панель появляется, и затем пересчитываем контраст ещё раз
      setTimeout(() => {
        panel.classList.add("visible");
        recomputeDotContrast();
      }, 60);
    });
  }

  function collapse() {
    if (!isOpen || restoring) return;
    restoring = true;
    panel?.classList.remove("visible");

    // Отписки
    window.removeEventListener("resize", onWinChange);
    window.removeEventListener("scroll", onWinChange);
    mo?.disconnect(); mo = null;

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

      // Восстановить стили, КРОМЕ цвета/фона — их оставляем авто-контрастными
      dot.style.position = saved.position;
      dot.style.left = saved.left;
      dot.style.top = saved.top;
      dot.style.width = saved.width;
      dot.style.height = saved.height;
      dot.style.zIndex = saved.zIndex;
      dot.style.borderRadius = saved.borderRadius;
      dot.style.transition = saved.transition;
      dot.style.transform = saved.transform;
      dot.classList.remove("dot-expanded");

      // На всякий — пересчёт после закрытия
      recomputeDotContrast();

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
