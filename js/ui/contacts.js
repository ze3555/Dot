// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";
import { setupDotCoreMenu } from "../handlers/coreHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Удаляем предыдущий ввод, если есть
  const existing = dot.querySelector(".dot-input-container");
  if (existing) existing.remove();

  // Создаём обёртку
  const wrapper = document.createElement("div");
  wrapper.className = "dot-input-container";

  // Ввод UID
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Кнопка "+"
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

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  dot.appendChild(wrapper);

  // Плавная капсульная анимация
  void dot.offsetWidth;
  dot.classList.add("dot-expanded", "active");
  input.focus();

  // Закрытие режима по клику вне или ESC
  function close() {
    dot.classList.remove("dot-expanded", "active");
    wrapper.remove();

    // Восстановить меню
    setupDotCoreMenu();

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