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

/* --- sizes used in CSS, дублируем логикой в JS --- */
function targetWidthPx(state) {
  const vw = window.innerWidth;
  if (state === "menu" || state === "theme" || state === "settings") {
    return Math.min(0.92 * vw, 560); // matches: min(92vw, 560px)
  }
  if (state === "contacts") {
    return Math.min(0.94 * vw, 640); // matches: min(94vw, 640px)
  }
  return null; // idle
}
function targetHeightPx(state) {
  const vh = window.innerHeight;
  if (state === "menu" || state === "theme") return 72;
  if (state === "contacts") return 56;
  if (state === "settings") return Math.min(Math.floor(0.5 * vh), 520);
  return 0;
}

/* якорь раскрытия от стороны прилипания (для визуального ощущения) */
function applyOriginClass(dot) {
  dot.classList.remove("dot-origin-left", "dot-origin-right");
  if (dot.classList.contains("dot-docked-right")) dot.classList.add("dot-origin-right");
  else if (dot.classList.contains("dot-docked-left")) dot.classList.add("dot-origin-left");
}

/* держим прямоугольник в пределах экрана по вертикали */
function clampTopIfDocked(dot, targetH, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();
  let top = r.top;
  top = Math.max(margin, Math.min(top, vh - targetH - margin));
  dot.style.top = `${top}px`;
}

/* ключ: при доке справа левую координату считаем от правого края с учётом целевой ширины */
function adjustLeftForDock(dot, state, margin = 16) {
  if (!dot.classList.contains("dot-docked")) return;
  const tw = targetWidthPx(state);
  if (!tw) return; // idle

  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-right")) {
    // правый край = vw - margin
    const left = Math.max(8, vw - tw - margin);
    dot.style.left = `${left}px`;
    dot.style.transform = "translate(0,0)"; // важнo: убираем центрирование
  } else if (dot.classList.contains("dot-docked-left")) {
    // левый край = margin
    const left = Math.max(8, margin);
    dot.style.left = `${left}px`;
    dot.style.transform = "translate(0,0)";
  }
}

function sync(dot, state) {
  closePopover();

  // сброс + состояния
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // если раскрываемся прямоугольником — ориентируемся и корректируем позиции
  if (state === "menu" || state === "theme" || state === "contacts" || state === "settings") {
    applyOriginClass(dot);
    adjustLeftForDock(dot, state, 16);
    clampTopIfDocked(dot, targetHeightPx(state), 8);
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