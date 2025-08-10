import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { initTheme } from "./services/theme.js";
import { initDotDrag } from "./core/drag.js";

function boot() {
  initTheme();
  initGestures();
  initDot();
  initDotDrag(); // ← drag + snap
}
document.addEventListener("DOMContentLoaded", boot);