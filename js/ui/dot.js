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

/** Возвращает целевую высоту раскрытого контейнера для клампа по вертикали */
function getTargetHeight(state) {
  switch (state) {
    case "menu":
    case "theme":
      return 72; // высота прямоугольника меню
    case "contacts":
      return 56; // высота капсулы
    case "settings":
      return Math.min(Math.floor(window.innerHeight * 0.5), 520); // квадрат ~50vh
    default:
      return 0;
  }
}

/** Привязываем origin в зависимости от стороны прилипания */
function applyOriginClass(dot) {
  dot.classList.remove("dot-origin-left", "dot-origin-right");
  if (dot.classList.contains("dot-docked-right")) {
    dot.classList.add("dot-origin-right"); // раскрывать влево
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.classList.add("dot-origin-left"); // раскрывать вправо
  }
}

/** Делаем так, чтобы верх контейнера не выезжал за экран при доке */
function clampTopIfDocked(dot, targetHeight, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();
  let top = r.top;
  top = Math.max(margin, Math.min(top, vh - targetHeight - margin));
  dot.style.top = `${top}px`;
}

function sync(dot, state) {
  closePopover();

  // сброс + базовые классы состояния
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // если открываем прямоугольную форму — выставим origin и подправим top
  if (state === "menu" || state === "theme" || state === "contacts" || state === "settings") {
    applyOriginClass(dot);
    // theme визуально = menu
    if (state === "theme") dot.classList.add("dot-menu");
    clampTopIfDocked(dot, getTargetHeight(state), 8);
  }

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
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;
    }
    case "theme": {
      // оставляем меню на экране
      const m = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      });
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);
}