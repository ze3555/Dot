// js/index.js
// Точка входа: инициализация DOT, жестов и драга + применение prefs.

import initDot from "./ui/dot.js";
import { initGestures } from "./core/gestures.js";
import initDotDrag from "./core/drag.js";
import { getState, setState } from "./core/state.js";

const LS_KEY = "dot.prefs";

function readPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return (obj && typeof obj === "object") ? obj : {};
  } catch {
    return {};
  }
}
function writePrefs(next) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(next || {})); } catch {}
}

/** Применяем prefs к DOM; дефолт: drag = true */
function applyInitialPrefs() {
  const prefs = readPrefs();

  // Миграция: сносим старые ключи, связанные с доком/анимациями
  if ("dock" in prefs || "snap" in prefs || "animations" in prefs) {
    delete prefs.dock;
    delete prefs.snap;
    delete prefs.animations;
    writePrefs(prefs);
  }

  const dragEnabled = prefs.drag !== false; // по умолчанию ВКЛ
  document.body.classList.toggle("dot-drag-off", !dragEnabled);
}

function boot() {
  applyInitialPrefs();
  initDot();
  initGestures();
  initDotDrag();

  // Экспорт для дебага
  window.DOT = {
    getState,
    setState,
    prefs: {
      get: readPrefs,
      set(p) { writePrefs(p); applyInitialPrefs(); },
      enableDrag() { const p = { ...readPrefs(), drag: true }; writePrefs(p); applyInitialPrefs(); },
      disableDrag() { const p = { ...readPrefs(), drag: false }; writePrefs(p); applyInitialPrefs(); },
      clear() { localStorage.removeItem(LS_KEY); applyInitialPrefs(); },
    },
  };
}

document.addEventListener("DOMContentLoaded", boot);