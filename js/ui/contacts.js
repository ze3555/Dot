// js/ui/contacts.js

import { getContacts } from "../handlers/contactHandlers.js";

export async function renderContactsUI(container, onSelectContact) {
  if (!container) return;
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "contacts-wrapper";
  wrapper.id = "contacts-wrapper";

  // Поле ввода UID
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID";
  input.className = "contacts-input";

  // Логика перемещения DOT при фокусе
  input.addEventListener("focus", () => {
    const dot = document.querySelector(".dot-core");
    if (dot) dot.classList.add("dot-add-mode");
  });

  input.addEventListener("blur", () => {
    const dot = document.querySelector(".dot-core");
    if (dot) dot.classList.remove("dot-add-mode");
  });

  // Список контактов
  const list = document.createElement("ul");
  list.className = "contacts-list";

  try {
    const contacts = await getContacts();
    contacts.forEach(uid => {
      const li = document.createElement("li");
      li.textContent = uid;
      li.className = "contacts-list-item";
      if (typeof onSelectContact === "function") {
        li.style.cursor = "pointer";
        li.addEventListener("click", () => onSelectContact(uid));
      }
      list.appendChild(li);
    });
  } catch (err) {
    const li = document.createElement("li");
    li.textContent = "Failed to load contacts";
    li.className = "contacts-list-item";
    list.appendChild(li);
  }

  wrapper.appendChild(input);
  wrapper.appendChild(list);
  container.appendChild(wrapper);
}

// Автоинициализация при клике на Contacts
document.addEventListener("DOMContentLoaded", () => {
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      const container = document.getElementById("main-content");
      renderContactsUI(container, uid => {
        console.log("Selected contact:", uid);
      });
    });
  }
});