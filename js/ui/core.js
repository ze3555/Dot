// js/ui/core.js

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  // ❌ Удалено: старая привязка renderContactsUI()
  // Теперь обработка кнопки "Contacts" происходит через coreHandlers.js
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core";
}
