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

  // Актуализируем якорь при ресайзе экрана
  window.addEventListener("resize", () => {
    if (!anchorLock) return;
    if (!dot.classList.contains("dot-docked")) return;
    // под экран и перезапоминаем
    clampByRect(dot, 8);
    lockPosition(dot);
  });
}

/* ===== anchor lock (фиксация позиции на время открытого меню) ===== */
let anchorLock = null; // { left, top } | null

function lockPosition(dot) {
  const r = dot.getBoundingClientRect();
  anchorLock = { left: Math.round(r.left), top: Math.round(r.top) };
  dot.style.left = `${anchorLock.left}px`;
  dot.style.top  = `${anchorLock.top}px`;
  dot.style.transform = "translate(0,0)";
}

function applyLock(dot) {
  // Подтянуть внутрь экрана с учётом реального размера и пересохранить координаты
  clampByRect(dot, 8);
  const r = dot.getBoundingClientRect();
  anchorLock = { left: Math.round(r.left), top: Math.round(r.top) };
  dot.style.left = `${anchorLock.left}px`;
  dot.style.top  = `${anchorLock.top}px`;
  dot.style.transform = "translate(0,0)";
}

function releaseLock() { anchorLock = null; }

/* ===== helpers ===== */
const DOT_SIZE = 64; // sync с --dot-size в CSS
const MARGIN   = 16;

function readDockFlags(dot) {
  return {
    docked: dot.classList.contains("dot-docked"),
    left:   dot.classList.contains("dot-docked-left"),
    right:  dot.classList.contains("dot-docked-right"),
  };
}
function reapplyDockFlags(dot, f) {
  if (!f.docked) return;
  dot.classList.add("dot-docked");
  dot.classList.toggle("dot-docked-left",  !!f.left && !f.right);
  dot.classList.toggle("dot-docked-right", !!f.right && !f.left);
}

// первичная фиксация X к стороне дока (до рендера контента)
function pinLeftByDock(dot) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${Math.max(8, vw - DOT_SIZE - MARGIN)}px`;
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `${Math.max(8, MARGIN)}px`;
  }
  dot.style.transform = "translate(0,0)";
}

/** Жёсткий кламп по реальному прямоугольнику (учитывает safe-area) */
function clampByRect(dot, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const sl = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)")  || "0", 10) || 0;
  const sr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0", 10) || 0;

  const r = dot.getBoundingClientRect();

  // Горизонталь
  const minLeft = margin + sl;
  const maxLeft = vw - sr - r.width - margin;
  let left = Math.min(Math.max(r.left, minLeft), Math.max(minLeft, maxLeft));

  // Вертикаль
  const minTop = margin;
  const maxTop = vh - r.height - margin;
  let top = Math.min(Math.max(r.top, minTop), Math.max(minTop, maxTop));

  dot.style.left = `${Math.round(left)}px`;
  dot.style.top  = `${Math.round(top)}px`;
  dot.style.transform = "translate(0,0)";
}

/* ===== core ===== */
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

  const isRect     = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  const isMenuLike = (state === "menu" || state === "theme");

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // 4) У края: меню/тема → вертикальный режим + убираем dock-scale
  if (isRect && dock.docked) {
    dot.classList.add("dot-expanding");
    if (isMenuLike) dot.classList.add("dot-vert"); else dot.classList.remove("dot-vert");

    // Если якорь ещё не зафиксирован — прикидываем X по стороне дока до рендера
    if (!anchorLock) pinLeftByDock(dot);
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

  // 6) После монтирования: один раз выравниваем в экран и фиксируем позицию.
  //    Далее при переключениях — просто обновляем lock под текущие размеры.
  if (isRect && dock.docked) {
    if (!anchorLock) {
      requestAnimationFrame(() => {
        applyLock(dot);               // кламп + запись лока
        requestAnimationFrame(() => { // на случай доанимации ширины
          applyLock(dot);
        });
      });
    } else {
      requestAnimationFrame(() => applyLock(dot));
    }
  }

  // 7) Выход в idle — снимаем фикс
  if (state === "idle") releaseLock();
}