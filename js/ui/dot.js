import { mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { closePopover } from "./dot-popover.js";

export function initDot(){
  const dot = document.getElementById("dot-core");
  if(!dot) throw new Error("#dot-core not found");
  sync(dot, getState());
  subscribe(({ next }) => sync(dot, next));
}

/* Константы для позиционирования у края */
const DOT_SIZE = 64;     // синхронизирован с --dot-size
const MARGIN   = 16;

/* Клампим top, чтобы вертикальный блок влезал в экран */
function clampTop(dot, targetH, margin = 8){
  const vh = window.innerHeight;
  const r  = dot.getBoundingClientRect();
  let top  = r.top;
  top = Math.max(margin, Math.min(top, vh - targetH - margin));
  dot.style.top = `${top}px`;
}

/* Фиксируем left при доке (узкая ширина = DOT_SIZE) */
function fixLeftWhenDocked(dot){
  if(!dot.classList.contains("dot-docked")) return;
  const vw = window.innerWidth;
  if(dot.classList.contains("dot-docked-right")){
    dot.style.left = `${Math.max(8, vw - DOT_SIZE - MARGIN)}px`;
    dot.style.transform = "translate(0,0)";
  }else if(dot.classList.contains("dot-docked-left")){
    dot.style.left = `${Math.max(8, MARGIN)}px`;
    dot.style.transform = "translate(0,0)";
  }
}

function sync(dot, state){
  closePopover();

  // базовые классы
  dot.className = "";
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`, "dot-morph");
  setTimeout(() => dot.classList.remove("dot-morph"), 240);

  const docked = dot.classList.contains("dot-docked");
  const isRect = (state === "menu" || state === "theme" || state === "contacts" || state === "settings");

  // theme визуально = menu
  if(state === "theme") dot.classList.add("dot-menu");

  // Включаем вертикальный режим ТОЛЬКО для главного меню/темы, когда докнуты
  if(isRect){
    if(docked){
      dot.classList.add("dot-expanding"); // убираем док-скейл
      // вертикальный режим только для menu/theme
      if(state === "menu" || state === "theme"){
        dot.classList.add("dot-vert");
        fixLeftWhenDocked(dot);
        // высота из CSS переменной, но ограничим в JS тоже (не обязательно, просто безопасно)
        const computedH = Math.min(
          // Примерно тот же расчёт, что в CSS
          (8*2) + (40 * 4) + (6 * 3),
          window.innerHeight - 16
        );
        clampTop(dot, computedH, 8);
      }else{
        dot.classList.remove("dot-vert");
      }
    }else{
      dot.classList.remove("dot-expanding","dot-vert");
    }
  }else{
    dot.classList.remove("dot-expanding","dot-vert");
  }

  const host = document.createElement("div");
  host.className = "dot-content dot-swap-in";
  if(state !== "idle") host.addEventListener("click", (e) => e.stopPropagation());

  switch(state){
    case "idle":{
      host.innerHTML = "";
      break;
    }
    case "menu":{
      const menu = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
      });
      if(docked) menu.classList.add("is-vert");  // вертикальное расположение кнопок
      queueMicrotask(() => menu.classList.add("is-live"));
      host.appendChild(menu);
      break;
    }
    case "contacts":{
      const c = renderContacts({ onBack: () => setState("menu") });
      queueMicrotask(() => c.classList.add("is-live"));
      host.appendChild(c);
      break;
    }
    case "settings":{
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;
    }
    case "theme":{
      const m = renderMenu({
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
      });
      if(docked) m.classList.add("is-vert");
      queueMicrotask(() => m.classList.add("is-live"));
      host.appendChild(m);
      break;
    }
  }

  mount(dot, host);
}