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

function clampMenuTop(dot, targetHeight = 72, margin = 8) {
  // корректируем top так, чтобы прямоугольник меню влезал по вертикали
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();
  let top = r.top;
  top = Math.max(margin, Math.min(top, vh - targetHeight - margin));
  dot.style.top = `${top}px`;
}

function applyOriginClass(dot) {
  // если дот пристыкован — выбрать правильный якорь расширения
  dot.classList.remove("dot-origin-left", "dot-origin-right");
  if (dot.classList.contains("dot-docked-right")) {
    dot.classList.add("dot-origin-right");
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.classList.add("dot-origin-left");
  }
}

function sync(dot, state) {
  closePopover();

  // сброс + базовые классы состояния
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // если открываем прямоугольник (menu/theme), заякорим в сторону от края
  if (state === "menu" || state === "theme") {
    applyOriginClass(dot);
    // если дот пристыкован — убедимся, что высота меню не уедет за край
    if (dot.classList.contains("dot-docked")) {
      clampMenuTop(dot, 72, 8);
    }
  }

  const host = document.createElement("div");
  host.className = "dot-content dot-swap-in";
  if (state !== "idle") host.addEventListener("click", (e) => e.stopPropagation());

  switch (state) {
    case "idle":
      host.innerHTML = "";
      break;

    case "menu": {
      const menu = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
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

    case "settings":
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;

    case "theme": {
      // визуально оставляем меню
      dot.classList.add("dot-menu");
      const m = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
      });
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);
}