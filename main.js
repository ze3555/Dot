// DOT-main/main.js  — только если он тебе действительно нужен
import { initGestures } from "./js/core/gestures.js";
import { initDot } from "./js/ui/dot.js";
import { applyTheme } from "./js/services/theme.js";

function boot() {
  applyTheme("dark");
  initGestures();
  initDot();
}
document.addEventListener("DOMContentLoaded", boot);