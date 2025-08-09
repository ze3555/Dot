// js/ui/dot.js
import { $, el } from "../core/dom.js";
import { STATES, getState, setState, onState } from "../core/state.js";
import { bindPress } from "../core/gestures.js";
import { initDotDrag } from "../core/drag.js";
import { openFunctions, closeFunctions } from "./dotFunctions.js";
import { openTheme, closeTheme } from "./dotMenu.js";
import { openContacts, closeContacts } from "./dotContacts.js";
import { openSettings, openSettingsFine, closeSettings } from "./dotSettings.js";

export function mountDot() {
  const host = $("#dot-core") || createDot();
  wirePress(host);
  initDotDrag(host);
  onState(syncByState);
  syncByState(getState());
}

function createDot() {
  const host = el("div", { id: "dot-core", class: "dot-core", role: "button", "aria-label": "DOT" });
  document.body.append(host);
  return host;
}

function wirePress(host) {
  bindPress(host, {
    onTap: () => {
      const s = getState();
      if (s === STATES.MENU) setState(STATES.IDLE);
      else if (s !== STATES.IDLE) setState(STATES.IDLE);
      else setState(STATES.MENU);
    },
    onLong: () => {
      // Долгое по самому доту — просто пульс/ничего не открываем (минимализм)
      host.classList.add("dot-pulse");
      setTimeout(() => host.classList.remove("dot-pulse"), 300);
    }
  });
}

function syncByState(s) {
  // Закрываем всё, потом открываем нужное
  closeFunctions(); closeTheme(); closeContacts(); closeSettings();
  document.body.dataset.dotState = s;

  switch (s) {
    case STATES.MENU: {
      // меню рисуется в dotMenu.js (как оверлей)
      ensureMenu();
      break;
    }
    case STATES.FUNCTIONS: openFunctions(); break;
    case STATES.THEME:     openTheme();     break;
    case STATES.CONTACTS:  openContacts();  break;
    case STATES.SETTINGS:  openSettings();  break;
    case STATES.SETTINGS_FINE: openSettingsFine(); break;
    default: break;
  }
}

function ensureMenu() {
  let menu = document.getElementById("dot-menu");
  if (!menu) {
    const wrap = el("div", { id: "dot-menu", class: "dot-menu" }, [
      el("button", { class: "dot-menu-btn", id:"btn-function", "aria-label":"Functions" }, "Function"),
      el("button", { class: "dot-menu-btn", id:"btn-contacts", "aria-label":"Contacts" }, "Contacts"),
      el("button", { class: "dot-menu-btn", id:"btn-settings", "aria-label":"Settings" }, "Settings"),
    ]);
    document.body.append(wrap);

    // Тапы/лонги:
    // Function: tap -> FUNCTIONS, long -> THEME
    wrap.querySelector("#btn-function").addEventListener("pointerdown", (e)=>e.stopPropagation());
    wrap.querySelector("#btn-contacts").addEventListener("pointerdown", (e)=>e.stopPropagation());
    wrap.querySelector("#btn-settings").addEventListener("pointerdown", (e)=>e.stopPropagation());

    const bind = (btn, onTap, onLong) => bindButtonPress(wrap.querySelector(btn), onTap, onLong);

    bind("#btn-function",
      () => setState(STATES.FUNCTIONS),
      () => setState(STATES.THEME)
    );

    bind("#btn-contacts",
      () => setState(STATES.CONTACTS),
      null // у Contacts долгого нет по ТЗ
    );

    bind("#btn-settings",
      () => setState(STATES.SETTINGS),
      () => setState(STATES.SETTINGS_FINE)
    );

    // клик вне — закрыть
    setTimeout(() => {
      const off = (ev) => {
        if (!wrap.contains(ev.target)) setState(STATES.IDLE);
      };
      document.addEventListener("pointerdown", off, { capture: true });
      wrap.addEventListener("DOT:detach", () => {
        document.removeEventListener("pointerdown", off, { capture: true });
      });
    });
  }
}

function bindButtonPress(node, onTap, onLong) {
  bindPress(node, { onTap, onLong, delay: 420 });
}

export function unmountMenu() {
  const wrap = document.getElementById("dot-menu");
  if (wrap) {
    wrap.dispatchEvent(new Event("DOT:detach"));
    wrap.remove();
  }
}