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

/* sizes (в пикселях, соответствуют CSS) */
function targetWidthPx(state) {
  const vw = window.innerWidth;
  if (state === "menu" || state === "theme" || state === "settings") return Math.min(0.92 * vw, 560);
  if (state === "contacts") return Math.min(0.94 * vw, 640);
  return null;
}
function targetHeightPx(state) {
  const vh = window.innerHeight;
  if (state === "menu" || state === "theme") return 72;
  if (state === "contacts") return 56;
  if (state === "settings") return Math.min(Math.floor(0.5 * vh), 520);
  return 0;
}

/* safe-area helpers */
function safe(n) { return Number.isFinite(n) ? n : 0; }
function getSafeInsetLeft() {
  const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)") || "0", 10);
  return safe(v);
}
function getSafeInsetRight() {
  const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0", 10);
  return safe(v);
}

/* визуальный origin для ощущения раскрытия */
function applyOriginClass(dot) {
  dot.classList.remove("dot-origin-left", "dot-origin-right");
  if (dot.classList.contains("dot-docked-right")) dot.classList.add("dot-origin-right");
  else if (dot.classList.contains("dot-docked-left")) dot.classList.add("dot-origin-left");
}

/* вертикальный кламп при доке */
function clampTopIfDocked(dot, targetH, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();
  let top = r.top;
  top = Math.max(margin, Math.min(top, vh - targetH - margin));
  dot.style.top = `${top}px`;
}

/* Ключ: при доке справа считаем left от правого края с учётом safe-area и целевой ширины */
function adjustLeftForDock(dot, state, margin = 16) {
  if (!dot.classList.contains("dot-docked")) return;
  const tw = targetWidthPx(state);
  if (!tw) return;

  const vw = window.innerWidth;
  const leftInset  = getSafeInsetLeft();
  const rightInset = getSafeInsetRight();

  if (dot.classList.contains("dot-docked-right")) {
    const left = Math.max(8 + leftInset, vw - rightInset - tw - margin);
    dot.style.left = `${left}px`;
    dot.style.transform = "translate(0,0)";
  } else if (dot.classList.contains("dot-docked-left")) {
    const left = Math.max(8 + leftInset, margin + leftInset);
    dot.style.left = `${left}px`;
    dot.style.transform = "translate(0,0)";
  }
}

function sync(dot, state) {
  closePopover();

  // базовые классы
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // раскрываем прямоугольник: убираем док-скейл, настраиваем origin и координаты
  const isRect = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  if (isRect) {
    if (dot.classList.contains("dot-docked")) dot.classList.add("dot-expanding"); // отмена scale(.94)
    applyOriginClass(dot);
    adjustLeftForDock(dot, state, 16);
    clampTopIfDocked(dot, targetHeightPx(state), 8);
  } else {
    dot.classList.remove("dot-expanding");
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

    case "settings":
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;

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