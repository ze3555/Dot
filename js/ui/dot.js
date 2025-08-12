// js/ui/dot.js
import { mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { closePopover } from "./dot-popover.js";

/**
 * Инициализация ядра DOT без анимаций.
 * Классы вида .dot-morph, .dot-swap-in и т.п. больше не используются.
 */
export function initDot() {
  const dot = document.getElementById("dot-core");
  if (!dot) throw new Error("#dot-core not found");
  sync(dot, getState());
  subscribe(({ next }) => sync(dot, next));
}

function sync(dot, state) {
  // Закрываем поповеры на смену состояния
  closePopover();

  // Чистим классы и выставляем только состояние (без «морфов»)
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`);

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // Контейнер контента — без анимационных классов
  const host = document.createElement("div");
  host.className = "dot-content";
  if (state !== "idle") {
    host.addEventListener("click", (e) => e.stopPropagation());
  }

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
      host.appendChild(menu);
      break;
    }
    case "contacts": {
      const c = renderContacts({ onBack: () => setState("menu") });
      host.appendChild(c);
      break;
    }
    case "settings": {
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;
    }
    case "theme": {
      const m = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      });
      host.appendChild(m);
      break;
    }
    default: {
      // на случай неизвестного состояния просто чистим
      host.innerHTML = "";
    }
  }

  mount(dot, host);
}

  mount(dot, host);
}
