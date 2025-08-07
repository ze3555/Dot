import { applyDarkTheme } from './dark.js';
import { applyLightTheme } from './light.js';

export function setTheme(theme) {
  if (theme === 'dark') {
    applyDarkTheme();
    localStorage.setItem('dot-theme', 'dark');
  } else {
    applyLightTheme();
    localStorage.setItem('dot-theme', 'light');
  }
}

export function getSavedTheme() {
  return localStorage.getItem('dot-theme') || 'dark';
}

// При инициализации приложения
export function initTheme() {
  setTheme(getSavedTheme());
}
