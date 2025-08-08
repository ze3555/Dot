// js/handlers/themeHandlers.js
import { setTheme, initTheme } from "../theme/index.js";

/** One canonical toggle used across the app */
export function toggleTheme() {
  const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
  setTheme(next);
}

/** Wire the topbar button (supports both possible ids) */
export function setupThemeSwitcher() {
  const ids = ["theme-toggle-btn", "btn-theme"];
  const themeBtn = ids.map((id) => document.getElementById(id)).find(Boolean);
  if (!themeBtn) return;
  themeBtn.onclick = toggleTheme;
}

/** Apply saved theme at startup */
export function initializeThemeOnStart() {
  initTheme();
}
