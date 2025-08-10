// js/ui/dot.js
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
export default initDot;

// держите в синхроне с CSS
const DOT_SIZE = 64;

function clearRectSizing(dot) {
  // убираем инлайны размеров, положение НЕ трогаем
  dot.style.width = "";
  dot.style.height = "";
}

function applyRectSizing(dot, isTall = false) {
  // прямоугольные состояния — просто ширина по контенту/вьюпорту
  dot.style.width  = isTall ? `${DOT_SIZE}px` : "min(520px, 86vw)";
  dot.style.height = "auto";
}

function sync(dot, state) {
  closePopover();

  // Сбрасываем классы состояния (без дока, без анимаций)
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`);

  const isRect =
    state === "menu" ||
    state === "theme" ||
    state === "contacts" ||
    state === "settings";

  // Размерность формы (без «морфов» и док‑вертикали)
  if (isRect) {
    applyRectSizing(dot, false);
  } else {
    clearRectSizing(dot); // idle => круг из CSS; позицию оставляем, где пользователь оставил
  }

  // Контент
  const host = document.createElement("div");
  host.className = "dot-content";
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
      host.appendChild(menu);
      break;
    }
    case "contacts": {
      host.appendChild(renderContacts({ onBack: () => setState("menu") }));
      break;
    }
    case "settings": {
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;
    }
    case "theme": {
      // Используем то же меню как каталог тем
      host.appendChild(renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      }));
      break;
    }
  }

  mount(dot, host);
}