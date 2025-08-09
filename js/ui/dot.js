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

  // при ресайзе актуализируем якорь, если есть
  window.addEventListener("resize", () => {
    if (anchorLock && dot.classList.contains("dot-docked")) {
      clampByRect(dot, 8);
      lockPosition(dot); // обновляем сохранённые координаты
    }
  });
}

/* ===== anchor lock ===== */
let anchorLock = null; // { left, top } | null

function lockPosition(dot) {
  const r = dot.getBoundingClientRect();
  anchorLock = { left: Math.round(r.left), top: Math.round(r.top) };
  dot.style.left = `${anchorLock.left}px`;
  dot.style.top  = `${anchorLock.top}px`;
  dot.style.transform = "translate(0,0)";
}

function applyLock(dot) {
  if (!anchorLock) return;
  dot.style.left = `${anchorLock.left}px`;
  dot.style.top  = `${anchorLock.top}px`;
  dot.style.transform = "translate(0,0)";
}

function releaseLock() {
  anchorLock = null;
}

/* ===== helpers ===== */
const DOT_SIZE = 64;
const MARGIN = 16;

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

/** первичная фиксация X по стороне дока (до рендера контента) */
function fixLeftWhenDocked(dot) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${Math.max(8, vw - DOT_SIZE - MARGIN)}px`;
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `${Math.max(8, MARGIN)}px`;
  }
  dot.style.transform = "translate(0,0)";
}

/** жёсткий кламп по реальному прямоугольнику */
function clampByRect(dot, margin = 8) {
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = dot.getBoundingClientRect();

  let left = r.left;
  let top  = r.top;

  const overflowRight = r.right - (vw - margin);
  if (overflowRight > 0) left -= overflowRight;
  if (left < margin) left = margin;

  const maxTop = vh - r.height - margin;
  if (top > maxTop) top = maxTop;
  if (top < margin) top = margin;

  dot.style.left = `${Math.round(left)}px`;
  dot.style.top  = `${Math.round(top)}px`;
  dot.style.transform = "translate(0,0)";
}

/* ===== core ===== */
function sync(dot, state) {
  closePopover();

  const dock = readDockFlags(dot);

  // сброс + базовые классы
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // вернуть док‑флаги
  reapplyDockFlags(dot, dock);

  const isRect = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  const isMenuLike = (state === "menu" || state === "theme");

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // док → вертикальный режим ТОЛЬКО для меню/темы, убираем скейл
  if (isRect && dock.docked) {
    dot.classList.add("dot-expanding");
    if (isMenuLike) dot.classList.add("dot-vert"); else dot.classList.remove("dot-vert");

    // если лок ещё не установлен — один раз вычисляем корректную позицию и фиксируем
    if (!anchorLock) {
      fixLeftWhenDocked(dot);   // прикинуть X до рендера
    }
  } else {
    dot.classList.remove("dot-expanding", "dot-vert");
  }

  // монтируем контент
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
      });
      if (dock.docked) m.classList.add("is-vert");
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);

  // после рендера контента
  if (isRect && dock.docked) {
    if (!anchorLock) {
      // первый раз: точно в экран → и зафиксировать
      clampByRect(dot, 8);
      // ещё кадр на доанимацию ширины, потом лочим
      requestAnimationFrame(() => {
        clampByRect(dot, 8);
        lockPosition(dot); // ← с этого момента координаты стабильны
      });
    } else {
      // последующие открытия/переключения: просто применять фикс
      applyLock(dot);
    }
  }

  // выход в idle — снимаем фикс
  if (state === "idle") {
    releaseLock();
  }
}