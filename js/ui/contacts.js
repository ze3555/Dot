// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Удаляем старый контейнер ввода, если уже есть
  const existing = dot.querySelector(".dot-input-container");
  if (existing) existing.remove();

  // Создаём контейнер для ввода
  const wrapper = document.createElement("div");
  wrapper.className = "dot-input-container";

  // Поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Кнопка +
  const button = document.createElement("button");
  button.innerHTML = "+";
  button.className = "dot-add-btn";

  // Логика добавления контакта
  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    input.focus();
  });

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  dot.appendChild(wrapper);

  // 💥 Плавная анимация раскрытия
  void dot.offsetWidth;
  dot.classList.add("dot-expanded", "active");
  input.focus();

  // Закрытие режима ввода
  function close() {
    dot.classList.remove("dot-expanded", "active");
    wrapper.remove();
    document.removeEventListener("click", onClickOutside);
    document.removeEventListener("keydown", onEsc);
  }

  const onClickOutside = (e) => {
    if (!dot.contains(e.target)) close();
  };

  const onEsc = (e) => {
    if (e.key === "Escape") close();
  };

  setTimeout(() => {
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onEsc);
  }, 50);
}