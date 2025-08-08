// js/handlers/swipeHandlers.js

import { renderContactsUI } from "../ui/contacts.js";
import { renderChatUI } from "../ui/chat.js";
import { addContact } from "./contactHandlers.js";

export function setupSwipeDrawer() {
  injectDrawerStylesOnce(); // ← критичные стили втыкаем через JS, чтобы точно применились

  const drawer = document.getElementById("contacts-drawer");
  const backdrop = document.getElementById("contacts-backdrop");
  const main = document.getElementById("main-content");

  if (!drawer || !backdrop || !main) return;

  let isOpen = false;

  // === Open / Close ==========================================================
  function openDrawer() {
    if (isOpen) return;

    drawer.innerHTML = "";
    renderContactsUI(drawer, handleSelectContact);

    // Кнопка Add Contact (в корне drawer)
    addDrawerAddBtn();

    // Плавное появление
    backdrop.style.display = "block";
    drawer.style.display = "flex";
    requestAnimationFrame(() => {
      drawer.classList.add("open");
      backdrop.classList.add("active");
    });

    isOpen = true;
  }

  function closeDrawer() {
    if (!isOpen) return;

    drawer.classList.remove("open");
    backdrop.classList.remove("active");

    setTimeout(() => {
      drawer.style.display = "none";
      backdrop.style.display = "none";
      drawer.innerHTML = "";
    }, 250);

    isOpen = false;
  }

  // === Drawer header button ==================================================
  function addDrawerAddBtn() {
    const btn = document.createElement("button");
    // ВАЖНО: класс совпадает с тем, что реально создаётся тут
    btn.className = "drawer-add-btn";
    btn.textContent = "Add Contact";
    btn.title = "Add new contact";
    btn.type = "button";
    btn.addEventListener("click", openAddContactModal);
    // точечно — в корень дровера (селектор в стилях: #contacts-drawer > .drawer-add-btn)
    drawer.prepend(btn);
  }

  // Реальная логика добавления контакта
  async function openAddContactModal() {
    const input = drawer.querySelector(".contacts-input");
    const uid = (input?.value || "").trim();
    if (!uid) {
      // Ненавязчиво подсветим инпут, без алертов
      input?.focus();
      input?.classList.add("dot-active");
      setTimeout(() => input?.classList.remove("dot-active"), 600);
      return;
    }

    try {
      await addContact(uid);
      // Очистим поле и перерисуем список контактов
      if (input) input.value = "";
      drawer.innerHTML = "";
      renderContactsUI(drawer, handleSelectContact);
      addDrawerAddBtn();
    } catch (err) {
      console.error("Add contact failed:", err);
      // Мягкий фолбек: визуально пульсануть кнопку
      const btn = drawer.querySelector(".drawer-add-btn");
      if (btn) {
        btn.disabled = true;
        setTimeout(() => (btn.disabled = false), 500);
      }
    }
  }

  // === Contacts select =======================================================
  function handleSelectContact(uid) {
    closeDrawer();
    renderChatUI(uid);
  }

  // === Close interactions ====================================================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeDrawer();
  });
  backdrop.addEventListener("click", closeDrawer);

  // === Touch: swipe from left to open =======================================
  let touchStartX = 0;
  let touchCurrentX = 0;
  const SWIPE_THRESHOLD = 60; // px
  const SWIPE_ZONE = 24;      // px от левого края

  function handleTouchStart(e) {
    if (isOpen) return;
    const x = e.touches[0].clientX;
    if (x > SWIPE_ZONE) return;
    touchStartX = x;
    touchCurrentX = x;
  }
  function handleTouchMove(e) {
    touchCurrentX = e.touches[0].clientX;
  }
  function handleTouchEnd() {
    if (touchCurrentX - touchStartX > SWIPE_THRESHOLD) {
      openDrawer();
    }
  }

  main.addEventListener("touchstart", handleTouchStart, { passive: true });
  main.addEventListener("touchmove", handleTouchMove, { passive: true });
  main.addEventListener("touchend", handleTouchEnd, { passive: true });

  // === Touch: swipe left inside drawer to close =============================
  let drawerStartX = 0;
  let drawerCurrentX = 0;

  drawer.addEventListener("touchstart", (e) => {
    drawerStartX = e.touches[0].clientX;
    drawerCurrentX = drawerStartX;
  });
  drawer.addEventListener("touchmove", (e) => {
    drawerCurrentX = e.touches[0].clientX;
  });
  drawer.addEventListener("touchend", () => {
    if (drawerStartX - drawerCurrentX > SWIPE_THRESHOLD) {
      closeDrawer();
    }
  });

  // === Desktop trigger (center-left) ========================================
  if (window.innerWidth >= 768) {
    const trigger = document.createElement("div");
    trigger.id = "drawer-trigger";
    trigger.className = "drawer-trigger";
    trigger.title = "Contacts";
    trigger.innerHTML = "&#x25B6;"; // ►
    trigger.addEventListener("click", () => {
      if (!isOpen) openDrawer();
    });
    document.body.appendChild(trigger);
  }
}

/**
 * Инжектим критичные стили для триггера и Add Contact,
 * чтобы гарантировать применение независимо от подключения CSS-файлов/кэша.
 */
function injectDrawerStylesOnce() {
  if (document.getElementById("drawer-inline-styles")) return;
  const style = document.createElement("style");
  style.id = "drawer-inline-styles";
  style.textContent = `
    /* Trigger: center-left */
    #drawer-trigger,
    .drawer-trigger {
      position: fixed;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: color-mix(in oklab, var(--panel-bg, #fff), transparent 10%);
      color: var(--panel-fg, #111);
      box-shadow: 0 2px 8px rgba(0,0,0,0.10);
      border: 1px solid color-mix(in oklab, var(--panel-fg, #111), transparent 92%);
      cursor: pointer;
      user-select: none;
      z-index: 999;
      opacity: .95;
      transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease, border-color .12s ease;
    }
    #drawer-trigger:hover { opacity: 1; }
    #drawer-trigger:active { transform: translateY(-50%) scale(.96); }

    /* Drawer base (safety if external CSS not loaded) */
    #contacts-drawer.contacts-drawer {
      position: fixed;
      left: 0;
      top: var(--topbar-h, 48px);
      bottom: 0;
      width: min(86vw, 360px);
      transform: translateX(-100%);
      will-change: transform;
      transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 12px;
      gap: 12px;
      background: var(--panel-bg, #fff);
      color: var(--panel-fg, #111);
      box-shadow: 0 6px 28px rgba(0,0,0,0.10);
      border-right: 1px solid rgba(0,0,0,0.06);
      z-index: 1001;
    }
    #contacts-drawer.open { transform: translateX(0); }

    /* Add Contact — sticky, full width, exactly how we prepend it */
    #contacts-drawer > .drawer-add-btn,
    .drawer-add-btn {
      position: sticky;
      top: 0;
      z-index: 2;
      display: block;
      width: 100%;
      appearance: none;
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      line-height: 1;
      cursor: pointer;
      background: var(--btn-bg, #111);
      color: var(--btn-fg, #fff);
      border: 1px solid var(--btn-bg, #111);
      transition: background-color .12s ease, border-color .12s ease, transform .12s ease, opacity .12s ease;
      opacity: .98;
    }
    #contacts-drawer > .drawer-add-btn:hover,
    .drawer-add-btn:hover { background: var(--btn-bg-hover, #333); border-color: var(--btn-bg-hover, #333); opacity: 1; }
    #contacts-drawer > .drawer-add-btn:active,
    .drawer-add-btn:active { transform: scale(.985); }

    /* Contacts wrapper & input safety */
    #contacts-drawer .contacts-wrapper {
      min-height: 0;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 10px;
      overflow: hidden;
    }
    #contacts-drawer .contacts-input {
      width: 100%;
      border-radius: 10px;
      border: var(--input-border, 1px solid rgba(0,0,0,0.12));
      background: var(--input-bg, #f1f1f3);
      color: var(--input-fg, #111);
      padding: 10px 12px;
      font: inherit;
    }
    #contacts-drawer .contacts-input::placeholder {
      color: var(--input-ph, rgba(0,0,0,0.45));
    }
    #contacts-drawer .contacts-list {
      list-style: none; margin: 0; padding: 0;
      overflow: auto; -webkit-overflow-scrolling: touch;
    }
    #contacts-drawer .contacts-list-item {
      padding: 10px 8px;
      border-radius: 8px;
      transition: background-color .12s ease, transform .08s ease;
    }
    #contacts-drawer .contacts-list-item:hover {
      background: color-mix(in oklab, var(--panel-fg, #111), transparent 93%);
    }

    /* Backdrop safety */
    #contacts-backdrop.contacts-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: var(--backdrop, rgba(0,0,0,0.15));
      opacity: 0;
      visibility: hidden;
      transition: opacity .2s ease, visibility .2s ease;
      z-index: 1000;
    }
    #contacts-backdrop.active { opacity: 1; visibility: visible; }
  `;
  document.head.appendChild(style);
}
