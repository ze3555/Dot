import { onAuthStateChanged, logout } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore, setupDotCoreFeatures } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";
import { setupDotCoreMenu } from "./js/handlers/coreHandlers.js";
import { initializeThemeOnStart, setupThemeSwitcher } from "./js/handlers/themeHandlers.js";
import { enableDotCoreDrag } from "./js/handlers/dotCoreDrag.js";
import { setupSwipeDrawer } from "./js/handlers/swipeHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeThemeOnStart();       // 1. Применяем тему
  renderDotCore();                // 2. Рендер DotCore
  setupDotCoreMenu();             // 3. Меню DotCore
  setupThemeSwitcher();           // 4. Переключатель темы
  enableDotCoreDrag();            // 5. Перетаскивание DotCore
  setupSwipeDrawer();             // 6. Свайп-дровер
  setupDotCoreFeatures();         // 7. Магнитная логика dot-core

  // Кнопка выхода
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});

// Стейт авторизации и отрисовка UI
onAuthStateChanged((user) => {
  const main = document.getElementById("main-content");
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