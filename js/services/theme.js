
const THEMES = ["light", "dark"];
let idx = 0;

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
export function toggleTheme() {
  idx = (idx + 1) % THEMES.length;
  applyTheme(THEMES[idx]);
  return THEMES[idx];
}