import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { initTheme } from "./services/theme.js";

function boot() {
  initTheme();        // ← вместо applyTheme("dark")
  initGestures();
  initDot();
}
document.addEventListener("DOMContentLoaded", boot);