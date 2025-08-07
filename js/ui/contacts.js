// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";
import { setupDotCoreMenu } from "../handlers/coreHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Удаляем старый ввод, если уже есть
  const existing = dot.querySelector(".dot-input-container");
  if (existing) existing.remove();

  // Создаём контейнер для ввода
  const wrapper = document.createElement("div");
  wrapper.className = "dot-input-container";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

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

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  dot.appendChild(wrapper);

  // Плавная активация
  void dot.offsetWidth;
  dot.classList.add("dot-expanded", "active");
  input.focus();

  function close() {
    dot.classList.remove("dot-expanded", "active");
    wrapper.remove();

    // ❗ Вернуть контроль меню
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