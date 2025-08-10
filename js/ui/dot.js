import { mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { closePopover } from "./dot-popover.js";

export function initDot() {
  const dot = document.getElementById("dot-core");
  if (!dot) throw new Error("#dot-core not found");
  sync(dot, getState());
  subscribe(({ next }) => sync(dot, next));
}

/* Константы */
const DOT_SIZE = 64; // должен совпадать с --dot-size
const MARGIN = 16;   // отступ от краёв по X при доке

function readDockFlags(dot) {
  return {
    docked: dot.classList.contains("dot-docked"),
    left: dot.classList.contains("dot-docked-left"),
    right: dot.classList.contains("dot-docked-right"),
  };
}
function reapplyDockFlags(dot, f) {
  if (!f.docked) return;
  dot.classList.add("dot-docked");
  dot.classList.toggle("dot-docked-left",  !!f.left && !f.right);
  dot.classList.toggle("dot-docked-right", !!f.right && !f.left);
}
function fixLeftWhenDocked(dot) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  const width = DOT_SIZE;
  if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `0px`;
    dot.style.transform = "translate(0, -50%)";
  } else if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${vw - width}px`;
    dot.style.transform = "translate(0, -50%)";
  }
}
function clampTopByRect(dot, pad = 8) {
  const r = dot.getBoundingClientRect();
  const vh = window.innerHeight;
  const safeTop = Math.max(pad, Math.min(r.top, vh - r.height - pad));
  dot.style.top = `${safeTop}px`;
}

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

  const isRect = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");

  // 4) Габариты формы (круг/капсула/квадрат)
  if (isRect) {
    dot.classList.add("dot-expanding");
    if (dock.docked) {
      dot.classList.add("dot-vert");
      dot.style.width  = `${DOT_SIZE}px`;
      dot.style.height = "auto";
    } else {
      dot.classList.remove("dot-vert");
      dot.style.width  = "min(520px, 86vw)";
      dot.style.height = "auto";
    }
  } else {
    dot.classList.remove("dot-expanding", "dot-vert");
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
      const isDocked = dock.docked;
      if (isDocked) menu.classList.add("is-vert");
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
      // Оставляем открытым меню (как каталог выбора темы)
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

  // 6) После монтирования знаем реальную высоту — клампим top ещё раз (и подправляем left на всякий случай)
  if (isRect && dock.docked) {
    clampTopByRect(dot, 8);
    fixLeftWhenDocked(dot);
  }
}