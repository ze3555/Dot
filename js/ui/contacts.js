// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Скрыть dot-меню при клике
  const menu = document.getElementById("dot-core-menu");
  if (menu) menu.style.display = "none";

  // Очистить DOT и активировать расширенный режим
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  // Поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID";
  input.className = "dot-contact-input";

  // Плюсик
  const button = document.createElement("button");
  button.innerHTML = "+";
  button.className = "dot-add-btn";

  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    input.focus();
  });

  // Добавить элементы в DOT
  dot.appendChild(input);
  dot.appendChild(button);

  // Фокус + scroll
  setTimeout(() => {
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}
