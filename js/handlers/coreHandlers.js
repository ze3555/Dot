// js/handlers/coreHandlers.js

import { renderContactsUI } from "../ui/contacts.js";

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    menu.style.display = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.position = "";
    menu.style.visibility = "";
    menu.style.zIndex = "";
  }

  function positionMenu() {
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    const dotRect = dot.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
    let top = dotRect.bottom + 8;

    const padding = 8;
    if (left < padding) left = padding;
    if (left + menuRect.width > window.innerWidth - padding)
      left = window.innerWidth - menuRect.width - padding;
    if (top + menuRect.height > window.innerHeight - padding)
      top = dotRect.top - menuRect.height - 8;

    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.position = "fixed";
    menu.style.visibility = "visible";
    menu.style.zIndex = 99999;
  }

  dot.addEventListener('click', (e) => {
    if (document.body.classList.contains('dragging-dotcore')) return;
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    if (isOpen) {
      positionMenu();
    } else {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });

  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !dot.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === "Escape") {
      closeMenu();
    }
  });

  // Закрытие меню по клику на любую кнопку
  menu.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Contacts: превращение DOT в contacts-режим
  const btnContacts = document.getElementById("btn-contacts");
  if (btnContacts) {
    btnContacts.addEventListener("click", () => {
      dot.classList.add("dot-expanded");
      dot.innerHTML = `
        <input type="text" placeholder="User UID" class="contacts-input-inline" />
        <button class="contacts-add-inline">+</button>
      `;
      const input = dot.querySelector("input");
      const button = dot.querySelector("button");

      button.addEventListener("click", async () => {
        const uid = input.value.trim();
        if (!uid) return;
        await renderContactsUI(uid); // Передаём uid для добавления
        dot.classList.remove("dot-expanded");
        dot.innerHTML = "";
      });
    });
  }
}