// js/ui/core.js
import { renderContactsUI } from "./contacts.js";

let isMenuOpen = false;
let outsideClickListener = null;
let escKeyListener = null;

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }

  const dot = document.querySelector(".dot-core");
  const menu = document.getElementById("dot-core-menu");

  if (!dot || !menu) return;

  // Открытие/закрытие меню по клику на капсулу
  dot.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Обработчик клика по пункту «Contacts»
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // не прокидывать на .dot-core
      closeMenu();
      renderContactsUI();
    });
  }

  function openMenu() {
    menu.classList.add("visible");
    isMenuOpen = true;

    outsideClickListener = (e) => {
      if (!menu.contains(e.target) && !dot.contains(e.target)) {
        closeMenu();
      }
    };

    escKeyListener = (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    setTimeout(() => {
      document.addEventListener("click", outsideClickListener);
      document.addEventListener("keydown", escKeyListener);
    }, 0);
  }

  function closeMenu() {
    menu.classList.remove("visible");
    isMenuOpen = false;
    document.removeEventListener("click", outsideClickListener);
    document.removeEventListener("keydown", escKeyListener);
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;
  dot.id = "dot-core";
}