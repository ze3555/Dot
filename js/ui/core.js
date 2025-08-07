// js/ui/core.js
import { renderContactsUI } from "./contacts.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  // Только логика вызова UI на кнопку меню
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // блок всплытия в меню
      renderContactsUI();
    });
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;
  dot.id = "dot-core";
}