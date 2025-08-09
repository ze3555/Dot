import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { applyTheme } from "./services/theme.js";

function boot() {
  // Initial theme
  applyTheme("dark");

  initGestures();
  initDot();
}

document.addEventListener("DOMContentLoaded", boot);