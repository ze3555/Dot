// js/ui/core.js
import { renderContactsUI } from "./contacts.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  const menu = document.getElementById("dot-core-menu");
  if (!menu) return;

  // 📌 Клик по DOT открывает/закрывает меню
  dot.addEventListener("click", () => {
    const isVisible = menu.classList.contains("visible");
    menu.classList.toggle("visible", !isVisible);
  });

  // 📌 Клик по пункту «Contacts» → скрыть меню и запустить UI
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // чтобы клик не прокинулся на dot-core
      menu.classList.remove("visible");
      renderContactsUI();
    });
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;
  dot.id = "dot-core";
}