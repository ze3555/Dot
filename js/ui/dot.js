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
  // гарантируем поверх всех
  dot.style.zIndex = "1000";
  sync(dot, getState());
  subscribe(({ next }) => sync(dot, next));
}
export default initDot;

const DOT_SIZE = 64;

function clearRectSizing(dot) {
  dot.style.width = "";
  dot.style.height = "";
  dot.style.maxHeight = "";
}

function applyRectSizing(dot) {
  dot.style.width = "min(520px, 86vw)";
  dot.style.height = "auto";
  dot.style.maxHeight = "min(78vh, 640px)"; // чтобы было место для контента
}

function sync(dot, state) {
  closePopover();

  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`);

  const isRect =
    state === "menu" ||
    state === "theme" ||
    state === "contacts" ||
    state === "settings";

  if (isRect) {
    applyRectSizing(dot);
  } else {
    clearRectSizing(dot); // idle => круг из CSS
  }

  // Контейнер контента. Гасим «внешний клик» по умолчанию.
  const host = document.createElement("div");
  host.className = "dot-content";
  if (state !== "idle") {
    const stop = (e) => e.stopPropagation();
    host.addEventListener("click", stop);
    host.addEventListener("pointerdown", stop);
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
      // делаем видимым после монтирования (если в стилях есть .is-live)
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