// js/core/state.js
// Минимальная стейт-машина для DOT
export const STATES = {
  IDLE: "idle",
  MENU: "menu",
  FUNCTIONS: "functions",
  THEME: "theme",
  CONTACTS: "contacts",
  SETTINGS: "settings",
  SETTINGS_FINE: "settingsFine",
};

const store = {
  state: STATES.IDLE,
  movable: false,         // можно ли перетаскивать дот (вкл. в Fine‑Tune)
  anchor: { x: null, y: null }, // если пользователь закрепил позицию
  peer: null,             // на будущее (чаты)
};

const listeners = new Set();

export function getState() { return store.state; }
export function setState(next) {
  if (next === store.state) return;
  store.state = next;
  emit();
}
export function onState(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => fn(store.state)); }

export function getMovable() { return store.movable; }
export function setMovable(v) { store.movable = !!v; }

export function getAnchor() { return { ...store.anchor }; }
export function setAnchor(x, y) { store.anchor = { x, y }; }

export function resetToCenter() { store.anchor = { x: null, y: null }; }