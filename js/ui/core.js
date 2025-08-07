// js/ui/core.js

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  // Кнопка логаута всегда показывает/прячет по факту авторизации, сам logout делается в main.js или handlers

  if (logoutBtn) {
    // Здесь оставляем только логику показа/скрытия
    logoutBtn.style.display = user ? "block" : "none";
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core"; // если нужен id для доступа из других скриптов
}
