// js/ui/dot.js
import { mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { closePopover } from "./dot-popover.js";

/** Геометрия DOT в idle (круг) и минимальные отступы */
const DOT_SIZE = 64;
const MARGIN = 8;

/** Безопасное чтение int из CSS env(...) */
const safeInt = (v) => {
  const n = parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : 0;
};
const safeLeft   = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)"));
const safeRight  = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)"));
const safeTop    = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)"));
const safeBottom = () => safeInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)"));

/** Прочитать/перекинуть док-флаги */
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

/** Зафиксировать X к стороне дока (до монтирования контента) */
function pinLeftByDock(dot){
  if (!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if (dot.classList.contains("dot-docked-right")) {
    dot.style.left = `${Math.max(MARGIN + safeLeft(), vw - DOT_SIZE - MARGIN - safeRight())}px`;
  } else if (dot.classList.contains("dot-docked-left")) {
    dot.style.left = `${Math.max(MARGIN + safeLeft(), MARGIN + safeLeft())}px`;
  }
  dot.style.transform = "translate(0,0)";
}

/** Жёсткий кламп по реальному прямоугольнику — никуда не выползает */
function clampByRect(dot, margin = MARGIN){
  // учитываем клавиатуру через visualViewport, если есть
  const vv = window.visualViewport;
  const vw = vv ? vv.width  : window.innerWidth;
  const vh = vv ? vv.height : window.innerHeight;

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

/** ===== core render/sync ===== */
function sync(dot, state){
  closePopover();

  // сохранить док-флаги до сброса классов
  const dock = readDockFlags(dot);

  // сброс + базовый стейт
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  // вернуть док-флаги
  reapplyDockFlags(dot, dock);

  const isRect     = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");
  const isMenuLike = (state === "menu" || state === "theme");

  // theme визуально = menu
  if (state === "theme") dot.classList.add("dot-menu");

  // если у края — делаем меню/тему вертикальными и убираем dock-scale
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
      host.appendChild(menu);
      break;
    }
    case "theme": {
      // визуально совпадает с menu, само переключение темы делает services/theme.js
      const menu = renderMenu({
        onTheme:    () => setState("menu"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts"),
      });
      if (dock.docked) menu.classList.add("is-vert");
      host.appendChild(menu);
      break;
    }
    case "contacts": {
      const m = renderContacts({ onBack: () => setState("idle") });
      if (dock.docked) m.classList.add("is-vert");
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
    case "settings": {
      const m = renderSettings({ onBack: () => setState("idle") });
      if (dock.docked) m.classList.add("is-vert");
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);

  // после монтирования: поджать внутрь экрана по фактическим размерам
  requestAnimationFrame(() => {
    clampByRect(dot, MARGIN);
    // ещё раз, если размеры доанимировались (тени/бордер/ширина)
    requestAnimationFrame(() => clampByRect(dot, MARGIN));
  });
}

/** ===== public ===== */
export function initDot() {
  const dot = document.getElementById("dot-core");
  if (!dot) throw new Error("#dot-core not found");

  /** Снимок позиции при выходе из idle → восстановление при возврате */
  /** @type {{left:number, top:number, leftDock:boolean, rightDock:boolean} | null} */
  let lastIdlePos = null;

  // --- подавление клампа вокруг фокуса/клавиатуры (ГЛОБАЛЬНО) ---
  let suppressUntil = 0;
  let suppress = false;
  const SUPPRESS_AFTER_BLUR_MS = 550;
  const now = () => performance.now();
  const canClamp = () => !suppress && now() > suppressUntil;
  const safeClamp = () => { if (canClamp()) clampByRect(dot, MARGIN); };

  // первый рендер
  sync(dot, getState());

  // реагируем на смену состояния
  subscribe(({ prev, next }) => {
    // Если выходим из idle — запоминаем точные координаты и док-флаги
    if (prev === "idle") {
      const r = dot.getBoundingClientRect();
      lastIdlePos = {
        left: Math.round(r.left),
        top: Math.round(r.top),
        leftDock: dot.classList.contains("dot-docked-left"),
        rightDock: dot.classList.contains("dot-docked-right"),
      };
    }

    // обычная синхронизация UI
    sync(dot, next);

    // Если возвращаемся в idle — восстановить ровно исходную позицию
    if (next === "idle" && lastIdlePos) {
      dot.style.left = `${lastIdlePos.left}px`;
      dot.style.top  = `${lastIdlePos.top}px`;
      dot.style.transform = "translate(0,0)";
      // док-флаги вернуть (на случай сбросов)
      dot.classList.toggle("dot-docked-left",  !!lastIdlePos.leftDock);
      dot.classList.toggle("dot-docked-right", !!lastIdlePos.rightDock);
      dot.classList.toggle("dot-docked", !!(lastIdlePos.leftDock || lastIdlePos.rightDock));

      // финальный кламп (если вьюпорт поменялся)
      requestAnimationFrame(safeClamp);
      lastIdlePos = null;
    } else {
      // в остальных состояниях — обычный кламп после раскладки контента
      requestAnimationFrame(() => {
        safeClamp();
        requestAnimationFrame(safeClamp);
      });
    }
  });

  // клампить на ресайз (без реснапа — только удерживаем в экране)
  window.addEventListener("resize", safeClamp);
  // визуальный вьюпорт (мобилки/клавиатура)
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", safeClamp);
    // ВАЖНО: НЕ клампим на scroll, чтобы дот не «ехал» со скроллом
    // window.visualViewport.addEventListener("scroll", safeClamp);
  }

  // ГЛОБАЛЬНО: на фокус любого поля (включая composer) — глушим кламп
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || t.getAttribute?.("role") === "textbox") {
      suppress = true;
    }
  }, true);

  // После блюра — даём клавиатуре схлопнуться, затем кламп
  document.addEventListener("focusout", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || t.getAttribute?.("role") === "textbox") {
      suppress = false;
      suppressUntil = now() + SUPPRESS_AFTER_BLUR_MS;
      setTimeout(() => { if (canClamp()) clampByRect(dot, MARGIN); }, SUPPRESS_AFTER_BLUR_MS + 16);
    }
  }, true);
}