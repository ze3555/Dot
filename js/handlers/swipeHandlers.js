// js/handlers/swipeHandlers.js

import { renderContactsUI } from "../ui/contacts.js";
import { renderChatUI } from "../ui/chat.js";

export function setupSwipeDrawer() {
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

    // Добавляем «молочную» кнопку Add Contact в шапку дровера
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

    // Дождаться конца анимации
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
    btn.className = "drawer-add-btn"; // стили задашь в CSS
    btn.textContent = "Add Contact";
    btn.title = "Add new contact";
    btn.type = "button";
    btn.addEventListener("click", openAddContactModal);

    // Вставляем кнопу в начало контента дровера
    drawer.prepend(btn);
  }

  function openAddContactModal() {
    // TODO: подключи свою реальную логику добавления контакта
    console.log("Open Add Contact modal");
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

  // === Desktop trigger (transparent arrow on the left) ======================
  if (window.innerWidth >= 768) {
    const trigger = document.createElement("div");
    trigger.id = "drawer-trigger";
    trigger.className = "drawer-trigger"; // стилизуй в CSS
    trigger.title = "Contacts";
    trigger.innerHTML = "&#x25B6;"; // ►

    trigger.addEventListener("click", () => {
      if (!isOpen) openDrawer();
    });

    document.body.appendChild(trigger);
  }
}