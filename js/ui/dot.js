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

  // первый рендер
  sync(dot, getState());

  // реагируем на смену состояния
  subscribe(({ next }) => sync(dot, next));

  // при изменении вьюпорта тоже держим в экране
  window.addEventListener("resize", () => clampByRect(dot, 8));
}

/* ===== helpers ===== */
const DOT_SIZE = 64; // синхронизирован с --dot-size в CSS
const MARGIN   = 16;

const safeInt = v => {
  const n = parseInt(v || "0", 10);
  return Number.isFinite(n) ? n : 0;
};
const safeLeft   = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)"));
const safeRight  = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)"));
const safeTop    = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)"));
const safeBottom = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)"));

function readDockFlags(dot){
  return {
    docked: dot.classList.contains("dot-docked"),
    left:   dot.classList.contains("dot-docked-left"),
    right:  dot.classList.contains("dot-docked-right"),
  };
}
function reapplyDockFlags(dot, f){
  if (!f.docked) return;
  dot.classList.add("dot-docked");
  dot.classList.toggle("dot-docked-left",  !!f.left && !f.right);
  dot.classList.toggle("dot-docked-right", !!f.right && !f.left);
}

/* первичная фиксация X к стороне дока до монтирования контента */
function pinLeftByDock(dot){
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${Math.max(8 + safeLeft(), vw - DOT_SIZE - MARGIN - safeRight())}px`;
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `${Math.max(8 + safeLeft(), MARGIN + safeLeft())}px`;
  }
  dot.style.transform = "translate(0,0)";
}

/* жёсткий кламп по реальному прямоугольнику — никуда не выползает */
function clampByRect(dot, margin = 8){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const sl = safeLeft();
  const sr = safeRight();
  const st = safeTop();
  const sb = safeBottom();

  const r = dot.getBoundingClientRect();

  // горизонталь
  const minLeft = margin + sl;
  const maxLeft = vw - sr - r.width - margin;
  let left = Math.min(Math.max(r.left, minLeft), Math.max(minLeft, maxLeft));

  // вертикаль
  const minTop = margin + st;
  const maxTop = vh - sb - r.height - margin;
  let top = Math.min(Math.max(r.top, minTop), Math.max(minTop, maxTop));

  dot.style.left = `${Math.round(left)}px`;
  dot.style.top  = `${Math.round(top)}px`;
  dot.style.transform = "translate(0,0)";
}

/* ===== core ===== */
function sync(dot, state){
  closePopover();

  // сохранить док‑флаги до сброса классов
  const dock = readDockFlags(dot);

  // сброс + базовый стейт
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // вернуть док‑флаги
  reapplyDockFlags(dot, dock);

  const isRect     = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  const isMenuLike = (state === "menu" || state === "theme");

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // если у края — делаем меню/тему вертикальными и убираем dock‑scale
  if (isRect && dock.docked) {
    dot.classList.add("dot-expanding");
    if (isMenuLike) dot.classList.add("dot-vert"); else dot.classList.remove("dot-vert");
    // зафиксировать X к стороне до монтирования
    pinLeftByDock(dot);
  } else {
    dot.classList.remove("dot-expanding", "dot-vert");
  }

  // содержимое
  const host = document.createElement("div");
  host.className = "dot-content dot-swap-in";
  if (state !== "idle") host.addEventListener("click", (e) => e.stopPropagation());

  switch (state){
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
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;
    }
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

  // после монтирования: поджать внутрь экрана по фактическим размерам
  requestAnimationFrame(() => {
    clampByRect(dot, 8);
    // ещё раз, если размеры доанимировались (тени/бордер/ширина)
    requestAnimationFrame(() => clampByRect(dot, 8));
  });
}