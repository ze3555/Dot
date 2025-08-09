import { $, mount } from "../core/dom.js";
import { getState, setState, subscribe } from "../core/state.js";
import { renderMenu } from "./dot-menu.js";
import { renderContacts } from "./dot-contacts.js";
import { renderSettings } from "./dot-settings.js";
import { renderFunctions } from "./dot-functions.js";

export function initDot() {
  const dot = $("#dot-core");
  if (!dot) throw new Error("#dot-core not found");

  // initial
  sync(dot, getState());

  // react to state changes
  subscribe(({ next }) => sync(dot, next));
}

function sync(dot, state) {
  dot.className = ""; // reset
  dot.id = "dot-core";
  dot.classList.add(`dot-${state}`);

  const host = document.createElement("div");
  host.className = "dot-content dot-fade-in";

  switch (state) {
    case "idle":
      host.innerHTML = ""; // pure circle, no UI
      break;

    case "menu":
      host.appendChild(renderMenu({
        onFunction: () => setState("function"),
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
      }));
      break;

    case "contacts":
      host.appendChild(renderContacts({ onBack: () => setState("menu") }));
      break;

    case "settings":
      host.appendChild(renderSettings({ onBack: () => setState("menu") }));
      break;

    case "function":
      host.appendChild(renderFunctions({ onBack: () => setState("menu") }));
      break;

    case "theme":
      // Theme is instant action; after pulse we return to menu
      // Keep minimal pulse UI here; actual theme switch handled in dot-menu
      setTimeout(() => { /* visual pulse only */ }, 0);
      // fall-through to menu UI so buttons remain visible
      host.appendChild(renderMenu({
        onFunction: () => setState("function"),
        onTheme:    () => setState("theme"),
        onSettings: () => setState("settings"),
        onContacts: () => setState("contacts")
      }));
      break;
  }

  mount(dot, host);
}