// DOT-main/main.js
import { mountDot } from "./js/ui/dot.js";
import { applyTheme } from "./js/services/theme.js";

document.addEventListener("DOMContentLoaded", () => {
  applyTheme("dark");  // начальная тема
  mountDot();          // инициализация DOT и всех его обработчиков
});