
import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { applyTheme } from "./services/theme.js";

function boot() {
  applyTheme("dark");
  initGestures();
  initDot();
}
document.addEventListener("DOMContentLoaded", boot);