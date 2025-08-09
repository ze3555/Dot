const THEMES = ["light", "dark"];
let idx = 0;

function setBodyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(`theme-${theme}`);
}

export function applyTheme(theme) {
  setBodyTheme(theme);
  try { localStorage.setItem("dot.theme", theme); } catch {}
  idx = THEMES.indexOf(theme);
  if (idx < 0) idx = 0;
  return theme;
}

export function toggleTheme() {
  idx = (idx + 1) % THEMES.length;
  return applyTheme(THEMES[idx]);
}

export function initTheme() {
  let theme = "dark";
  try {
    const saved = localStorage.getItem("dot.theme");
    if (saved && THEMES.includes(saved)) theme = saved;
    else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
    else theme = "light";
  } catch {}
  return applyTheme(theme);
}