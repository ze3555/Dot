import { onAuthStateChanged, logout } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";
import { setupDotCoreMenu } from "./js/handlers/coreHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  renderDotCore();
  setupDotCoreMenu();

  const main = document.createElement("div");
  main.id = "main";
  document.body.appendChild(main);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});

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
