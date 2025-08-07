// js/ui/core.js
import { renderContactsUI } from "./contacts.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      renderContactsUI(); // Без UID — просто рендерим список
    });
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core";
}