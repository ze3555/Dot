// js/ui/contacts.js

import { addContact, getContacts } from "../handlers/contactHandlers.js";

// Новый: принимает любой контейнер и callback выбора контакта
export async function renderContactsUI(container, onSelectContact) {
  if (!container) return;
  container.innerHTML = ""; // Очистка перед вставкой

  // Создание главного контейнера для поиска и списка контактов
  const wrapper = document.createElement("div");
  wrapper.className = "contacts-wrapper";
  wrapper.id = "contacts-wrapper";

  // Поле ввода для UID
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID to add";
  input.className = "contacts-input";

  // Кнопка добавления
  const button = document.createElement("button");
  button.textContent = "Add Contact";
  button.className = "contacts-add-btn";

  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    await renderContactsUI(container, onSelectContact);
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
      // Если передан callback — делаем элемент кликабельным
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

  // Собираем всё вместе
  wrapper.appendChild(input);
  wrapper.appendChild(button);
  wrapper.appendChild(list);
  container.appendChild(wrapper);
}