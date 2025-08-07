// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Скрыть dot-меню
  const menu = document.getElementById("dot-core-menu");
  if (menu) menu.style.display = "none";

  // Очистить DOT и включить расширенный режим
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  // Поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID";
  input.className = "dot-contact-input";

  // Плюс-кнопка
  const button = document.createElement("button");
  button.innerHTML = "+";
  button.className = "dot-add-btn";

  // Добавление контакта
  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    input.focus();
  });

  // Добавить в капсулу
  dot.appendChild(input);
  dot.appendChild(button);

  // Фокус + scroll
  setTimeout(() => {
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);

  // Сворачивание при клике вне DOT
  const handleOutsideClick = (e) => {
    if (!dot.contains(e.target)) {
      dot.classList.remove("dot-expanded");
      dot.innerHTML = "";
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    }
  };

  // Сворачивание по ESC
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      dot.classList.remove("dot-expanded");
      dot.innerHTML = "";
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    }
  };

  // Навешиваем слушатели
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }, 50);
}
