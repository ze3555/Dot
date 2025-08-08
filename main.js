import { onAuthStateChanged, logout } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore, setupDotCoreFeatures } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";
import { setupDotCoreMenu } from "./js/handlers/coreHandlers.js";
import { initializeThemeOnStart } from "./js/handlers/themeHandlers.js";
import { enableDotCoreDrag } from "./js/handlers/dotCoreDrag.js";
import { setupSwipeDrawer } from "./js/handlers/swipeHandlers.js";
import { setupProfileDrawer } from "./js/handlers/profileHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeThemeOnStart();       // 1. Apply saved theme
  renderDotCore();                // 2. Ensure Dot exists/mounted
  setupDotCoreMenu();             // 3. Dot expansion with Function/Theme
  // (no topbar theme toggle anymore)
  enableDotCoreDrag();            // 4. Drag
  setupSwipeDrawer();             // 5. Contacts drawer
  setupDotCoreFeatures();         // 6. Legacy extras
  setupProfileDrawer();            // 6. Profile top drawer

  // Logout in drawer
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => logout());
});

// Auth state
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
