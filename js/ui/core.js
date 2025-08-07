// js/ui/core.js
import { renderContactsUI } from "./contacts.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  // Подключаем обработчик на кнопку Contacts
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", async () => {
      let wrapper = document.getElementById("contacts-wrapper");

      if (wrapper) {
        // Переключаем видимость
        wrapper.classList.toggle("hidden");
      } else {
        // Вставляем впервые
        await renderContactsUI();
      }
    });
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core";
}