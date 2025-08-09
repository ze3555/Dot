import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { initTheme } from "./services/theme.js";
import { initDotDrag } from "./core/drag.js";
import { initDotBadge } from "./ui/dot-badge.js"
function boot() {
  initTheme();
  initGestures();
  initDot();
  initDotDrag(); // ← drag + snap
  initDotBadge();
}
document.addEventListener("DOMContentLoaded", boot);