// js/ui/dot.js
import { mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { closePopover } from "./dot-popover.js";

/**
 * Инициализация DOT: первичный sync и подписка на изменения state-машины.
 */
export function initDot() {
  const dot = document.getElementById("dot-core");
  if (!dot) throw new Error("#dot-core not found");
  sync(dot, getState());
  subscribe(({ next }) => sync(dot, next));
}
export default initDot;

/* ------------------------------------------------------------------ */
/* Константы (держим в синхроне с CSS)                                */
/* ------------------------------------------------------------------ */
const DOT_SIZE = 64; // соответствует --dot-size

/* ------------------------------------------------------------------ */
/* Вспомогательные                                                     */
/* ------------------------------------------------------------------ */
function readDockFlags(dot) {
  return {
    docked: dot.classList.contains("dot-docked"),
    left: dot.classList.contains("dot-docked-left"),
    right: dot.classList.contains("dot-docked-right"),
  };
}
function reapplyDockFlags(dot, f) {
  dot.classList.toggle("dot-docked", !!f.docked);
  dot.classList.toggle("dot-docked-left",  !!f.left && !f.right && !!f.docked);
  dot.classList.toggle("dot-docked-right", !!f.right && !f.left && !!f.docked);
}
function fixLeftWhenDocked(dot) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `0px`;
    dot.style.transform = "translate(0, -50%)";
  } else if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${vw - DOT_SIZE}px`;
    dot.style.transform = "translate(0, -50%)";
  }
}
function clampTopByRect(dot, pad = 8) {
  const r = dot.getBoundingClientRect();
  const vh = window.innerHeight;
  const safeTop = Math.max(pad, Math.min(r.top, vh - r.height - pad));
  dot.style.top = `${safeTop}px`;
}
/** Возвращаем круглую форму и стандартные размеры */
function resetToCircle(dot, dock) {
  dot.classList.remove("dot-expanding", "dot-vert");
  // размеры из CSS (чистим инлайн)
  dot.style.width = "";
  dot.style.height = "";
  // Центрируем только если не докнуто
  if (dock.docked) {
    fixLeftWhenDocked(dot); // и правильный translate для дока
  } else {
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  }
}

/* ------------------------------------------------------------------ */
/* Основная синхронизация состояния                                    */
/* ------------------------------------------------------------------ */
function sync(dot, state) {
  closePopover();

  // 1) Сохраняем флаги докинга ДО сброса классов
  const dock = readDockFlags(dot);

  // 2) Сбрасываем и ставим базовые классы состояния
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // 3) Возвращаем флаги докинга
  reapplyDockFlags(dot, dock);

  const isRect =
    state === "menu" ||
    state === "theme" ||
    state === "contacts" ||
    state === "settings";

  // 4) Габариты формы (круг/капсула/квадрат)
  if (isRect) {
    dot.classList.add("dot-expanding");
    if (dock.docked) {
      // Вертикальный режим у докнутой точки
      dot.classList.add("dot-vert");
      dot.style.width = `${DOT_SIZE}px`;
      dot.style.height = "auto";
      dot.style.transform = "translate(0, -50%)";
      fixLeftWhenDocked(dot);
    } else {
      dot.classList.remove("dot-vert");
      dot.style.width = "min(520px, 86vw)";
      dot.style.height = "auto";
      dot.style.transform = ""; // даём контенту занять форму
    }
  } else {
    // Возврат в IDLE — всегда круг
    resetToCircle(dot, dock);
  }

  // 5) Монтируем содержимое
  const host = document.createElement("div");
  host.className = "dot-content dot-swap-in";
  if (state !== "idle") host.addEventListener("click", (e) => e.stopPropagation());

  switch (state) {
    case "idle": {
      host.innerHTML = "";
      break;
    }
    case "menu": {
      const menu = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      });
      if (dock.docked) menu.classList.add("is-vert");
      queueMicrotask(() => menu.classList.add("is-live"));
      host.appendChild(menu);
      break;
    }
    case "contacts": {
      const c = renderContacts({ onBack: () => setState("menu") });
      queueMicrotask(() => c.classList.add("is-live"));
      host.appendChild(c);
      break;
    }
    case "settings": {
      const s = renderSettings({ onBack: () => setState("menu") });
      queueMicrotask(() => s.classList.add("is-live"));
      host.appendChild(s);
      break;
    }
    case "theme": {
      // Используем меню как каталог выбора тем
      const m = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      });
      if (dock.docked) m.classList.add("is-vert");
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);

  // 6) После монтирования знаем реальную высоту — клампим top и корректируем left при доке
  if (isRect && dock.docked) {
    clampTopByRect(dot, 8);
    fixLeftWhenDocked(dot);
  }
}