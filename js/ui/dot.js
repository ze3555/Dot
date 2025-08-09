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
    leftDock: dot.classList.contains("dot-docked-left"),
    rightDock: dot.classList.contains("dot-docked-right"),
  };
}
function applyDockFlags(dot, flags){
  dot.classList.toggle("dot-docked", !!flags.docked);
  dot.classList.toggle("dot-docked-left", !!flags.leftDock);
  dot.classList.toggle("dot-docked-right", !!flags.rightDock);
}

/** Кламп по rect (чтобы не выходить за экран и safe areas) */
function clampByRect(dot, margin = MARGIN) {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const rect = dot.getBoundingClientRect();

  const leftMin = margin + safeLeft();
  const leftMax = vw - margin - safeRight() - rect.width;

  const topMin = margin + safeTop();
  const topMax = vh - margin - safeBottom() - rect.height;

  let left = rect.left;
  let top  = rect.top;

  if (left < leftMin) left = leftMin;
  if (left > leftMax) left = leftMax;
  if (top  < topMin)  top  = topMin;
  if (top  > topMax)  top  = topMax;

  // переносим абсолютными координатами
  dot.style.left = `${Math.round(left)}px`;
  dot.style.top  = `${Math.round(top)}px`;
  dot.style.transform = "translate(0,0)";
}

/** Синхронизация классов по состоянию */
function sync(dot, state){
  dot.classList.remove("dot-menu", "dot-theme", "dot-contacts", "dot-settings", "dot-vert");
  switch(state){
    case "menu":
      dot.classList.add("dot-menu");
      break;
    case "theme":
      dot.classList.add("dot-theme");
      break;
    case "contacts":
      dot.classList.add("dot-contacts");
      break;
    case "settings":
      dot.classList.add("dot-settings");
      break;
    default:
      // idle / function
      break;
  }
}

/** Содержимое внутри дота (меню/контакты/настройки) */
function renderInner(state, onBack){
  if (state === "menu") {
    return renderMenu({
      onFunction: () => setState("function"),
      onTheme:    () => setState("theme"),
      onSettings: () => setState("settings"),
      onContacts: () => setState("contacts"),
      onBack
    });
  }
  if (state === "contacts") {
    return renderContacts({ onBack });
  }
  if (state === "settings") {
    return renderSettings({ onBack });
  }
  // theme → тут визуально форма, само применение темы в другом модуле (по клику из меню)
  const p = document.createElement("div");
  p.style.padding = "8px";
  p.textContent = "Theme…";
  return p;
}

export function initDot() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  // Внутренний контейнер
  let host = dot.querySelector(".dot-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "dot-host";
    dot.appendChild(host);
  }

  // Возврат в idle по клику вне (глобально)
  document.addEventListener("click", (e) => {
    if (!dot.contains(e.target)) {
      closePopover();
      setState("idle");
    }
  }, true);

  // Память позиции при выходе из idle
  let lastIdlePos = null;

  // Управление клампом при фокусе инпутов (моб. клавиатура)
  let suppressUntil = 0;
  let suppress = false;
  const SUPPRESS_AFTER_BLUR_MS = 550;
  const now = () => performance.now();
  const canClamp = () => !suppress && now() > suppressUntil;
  const safeClamp = () => { if (canClamp()) clampByRect(dot, MARGIN); };

  // На входе — привести DOT в штатное состояние
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.left = "50%";
  dot.style.top = "50%";

  // синхронизация со стейтом
  subscribe(({ prev, next }) => {
    // перед уходом из idle — запомнить позицию (для возврата)
    if (prev === "idle") {
      const r = dot.getBoundingClientRect();
      lastIdlePos = {
        left: r.left, top: r.top,
        leftDock: dot.classList.contains("dot-docked-left"),
        rightDock: dot.classList.contains("dot-docked-right"),
      };
    }

    sync(dot, next);

    // Возврат в idle — восстановить позицию
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

    // Контент внутри дота
    host.textContent = "";
    if (next !== "idle") {
      const onBack = () => setState("menu");
      const node = renderInner(next, onBack);
      mount(host, node);
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