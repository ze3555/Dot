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

/* ---- helpers ---- */
const DOT_SIZE = 64;
const MARGIN = 16;

function safeInt(val) {
  const n = parseInt(val || "0", 10);
  return Number.isFinite(n) ? n : 0;
}
function safeInsetLeft() {
  return safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)"));
}
function safeInsetRight() {
  return safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)"));
}

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
  if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${Math.max(8 + safeInsetLeft(), vw - DOT_SIZE - MARGIN - safeInsetRight())}px`;
    dot.style.transform = "translate(0,0)";
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `${Math.max(8 + safeInsetLeft(), MARGIN + safeInsetLeft())}px`;
    dot.style.transform = "translate(0,0)";
  }
}

/** Жёстко удерживаем прямоугольник внутри экрана по горизонтали ПО ФАКТУ */
function clampLeftRightByRect(dot, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  const sr = safeInsetRight();
  const sl = safeInsetLeft();
  const r = dot.getBoundingClientRect();

  let left = r.left;

  // если вылезает вправо — сдвигаем влево
  const overflowRight = r.right - (vw - sr - margin);
  if (overflowRight > 0) {
    left -= overflowRight;
  }

  // если залез слишком влево — толкаем вправо
  if (left < margin + sl) {
    left = margin + sl;
  }

  dot.style.left = `${Math.round(left)}px`;
  dot.style.transform = "translate(0,0)";
}

/** Кламп по вертикали после рендера (учитывает реальную высоту) */
function clampTopByRect(dot, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();
  let top = r.top;
  const maxTop = vh - r.height - margin;
  if (top > maxTop) top = maxTop;
  if (top < margin) top = margin;
  dot.style.top = `${Math.round(top)}px`;
}

/* ---- core ---- */
function sync(dot, state) {
  closePopover();

  // сохранить флаги дока до сброса
  const dock = readDockFlags(dot);

  // сброс + стейт
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // вернуть док‑классы
  reapplyDockFlags(dot, dock);

  const isRect = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  const isMenuLike = (state === "menu" || state === "theme");

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  if (isRect && dock.docked) {
    dot.classList.add("dot-expanding");
    if (isMenuLike) dot.classList.add("dot-vert"); else dot.classList.remove("dot-vert");
    // первичная фиксация по X (позиция точки дока)
    fixLeftWhenDocked(dot);
  } else {
    dot.classList.remove("dot-expanding", "dot-vert");
  }

  // content
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

    case "settings":
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;

    case "theme": {
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

  // ВАЖНО: кламп по реальному размеру, когда layout устаканился.
  if (isRect && dock.docked) {
    // сразу после mount
    clampTopByRect(dot, 8);
    clampLeftRightByRect(dot, 8);

    // и ещё раз после следующего кадра (когда width/height доанимируются)
    requestAnimationFrame(() => {
      clampTopByRect(dot, 8);
      clampLeftRightByRect(dot, 8);
      // на всякий — второй rAF (некоторые мобильные браузеры доанимируют ещё)
      requestAnimationFrame(() => {
        clampTopByRect(dot, 8);
        clampLeftRightByRect(dot, 8);
      });
    });
  }
}