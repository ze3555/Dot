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

  // Перемещаем DOT при фокусе
  input.addEventListener("focus", () => {
    const dot = document.querySelector(".dot-core");
    input.classList.add("dot-active");
    if (dot) {
      const rect = input.getBoundingClientRect();
      dot.dataset.originalPosition = JSON.stringify({
        left: dot.style.left,
        top: dot.style.top,
        position: dot.style.position,
        transform: dot.style.transform
      });
      dot.style.position = "fixed";
      dot.style.left = `${rect.right + 8}px`;
      dot.style.top = `${rect.top + rect.height / 2 - dot.offsetHeight / 2}px`;
      dot.style.transform = "none";
      dot.classList.add("dot-add-mode");
    }
  });

  // Возвращаем DOT при потере фокуса
  input.addEventListener("blur", () => {
    const dot = document.querySelector(".dot-core");
    input.classList.remove("dot-active");
    if (dot && dot.dataset.originalPosition) {
      const pos = JSON.parse(dot.dataset.originalPosition);
      dot.style.left = pos.left;
      dot.style.top = pos.top;
      dot.style.position = pos.position;
      dot.style.transform = pos.transform;
      dot.classList.remove("dot-add-mode");
    }
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