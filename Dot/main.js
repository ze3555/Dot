// main.js
import { initFirebase } from "./js/firebase/config.js";
import { onAuthStateChanged } from "./js/firebase/auth.js";
import { renderTopbar, renderDotCore } from "./js/ui/core.js";
import { renderChatUI } from "./js/ui/chat.js";
import { showLoginModal, hideLoginModal } from "./js/ui/login.js";

// Инициализация Firebase
initFirebase();

// Рендер dot-core и main-контейнера
document.addEventListener("DOMContentLoaded", () => {
  renderDotCore();

  const main = document.createElement("div");
  main.id = "main";
  document.body.appendChild(main);
});

// Слежение за авторизацией
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
