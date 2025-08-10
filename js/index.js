
// js/index.js
// Entry: apply prefs -> init DOT UI -> gestures -> drag

import initDot from "./ui/dot.js";
import initGestures from "./core/gestures.js";
import initDotDrag from "./core/drag.js";

const LS_KEY = "dot.prefs";

function readPrefs() {
  try { const v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : {}; }
  catch { return {}; }
}
function applyInitialPrefs() {
  const prefs = readPrefs();
  const dragEnabled = prefs.drag !== false; // default ON
  document.body.classList.toggle("dot-drag-off", !dragEnabled);
}

function boot() {
  applyInitialPrefs();
  initDot();
  initGestures();
  initDotDrag();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}