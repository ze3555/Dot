// main.js
import { onAuthStateChanged, logout } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";
import { setupDotCoreMenu } from "./js/handlers/coreHandlers.js";
import { initializeThemeOnStart, setupThemeSwitcher } from "./js/handlers/themeHandlers.js"; // импорт нового обработчика

document.addEventListener("DOMContentLoaded", () => {
  initializeThemeOnStart();   // 1. Инициализация темы — всегда первой
  renderDotCore();
  setupDotCoreMenu();
  setupThemeSwitcher();       // 2. навешиваем обработчик темы

  // Создаём основной контейнер, если нужен
  let main = document.getElementById("main");
  if (!main) {
    main = document.createElement("div");
    main.id = "main";
    document.body.appendChild(main);
  }

  // Логаут-кнопка
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});

// Стейт авторизации и отрисовка UI
onAuthStateChanged((user) => {
  const main = document.getElementById("main");
  const logoutBtn = document.getElementById("logout-btn");

  if (!main) return;

  if (!user) {
    main.innerHTML = "";
    showLoginModal();
    if (logoutBtn) logoutBtn.style.display = "none";
  } else {
    hideLoginModal();
    renderTopbar(user);
    renderChatUI();
    if (logoutBtn) logoutBtn.style.display = "block";
  }
});
