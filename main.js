import { onAuthStateChanged } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";
import { setupDotCoreMenu } from "./js/handlers/coreHandlers.js"; // ✅ актуальное имя

document.addEventListener("DOMContentLoaded", () => {
  renderDotCore();
  setupDotCoreMenu(); // ✅ подключаем меню

  const main = document.createElement("div");
  main.id = "main";
  document.body.appendChild(main);
});

onAuthStateChanged((user) => {
  const main = document.getElementById("main");
  if (!main) return;

  if (!user) {
    main.innerHTML = "";
    showLoginModal();
  } else {
    hideLoginModal();
    renderTopbar(user);
    renderChatUI();
  }
});
