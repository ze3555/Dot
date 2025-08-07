import { setTheme, initTheme } from "../theme/index.js";

export function setupThemeSwitcher() {
  const themeBtn = document.getElementById("btn-theme");
  if (!themeBtn) return;

  themeBtn.onclick = () => {
    const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    setTheme(nextTheme);
  };
}

export function initializeThemeOnStart() {
  initTheme();
}
