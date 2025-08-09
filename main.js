import { mountDot } from "./js/ui/dot.js";
import { applyTheme } from "./js/services/theme.js";

function boot() {
  applyTheme("dark");
  mountDot();
}

document.addEventListener("DOMContentLoaded", boot);