// js/handlers/swipeHandlers.js

import { renderContactsUI } from "../ui/contacts.js";
import { renderChatUI } from "../ui/chat.js";

// Настройка drawer
export function setupSwipeDrawer() {
  const drawer = document.getElementById("contacts-drawer");
  const backdrop = document.getElementById("contacts-backdrop");
  const main = document.getElementById("main-content");

  if (!drawer || !backdrop || !main) return;

  let startX = 0;
  let currentX = 0;
  let touching = false;
  let open = false;
  const THRESHOLD = 60; // px свайпа для открытия/закрытия
  const EDGE_ZONE = 32; // px от левого края, где активен свайп

  // === Открыть drawer ===
  function openDrawer() {
    drawer.classList.add("open");
    backdrop.style.display = "block";
    setTimeout(() => backdrop.style.opacity = "1", 0);
    renderContactsUI(drawer, onSelectContact);
    open = true;
  }

  // === Закрыть drawer ===
  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.style.opacity = "0";
    setTimeout(() => backdrop.style.display = "none", 220);
    drawer.innerHTML = ""; // Очищаем контакты
    open = false;
  }

  // === Обработка свайпа ===
  function onTouchStart(e) {
    // Только если drawer закрыт и свайп начинается у левого края
    if (open) return;
    if (e.touches && e.touches[0].clientX > EDGE_ZONE) return;
    touching = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX = startX;
  }

  function onTouchMove(e) {
    if (!touching) return;
    currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    // Можно добавить кастомную анимацию drawer-а по дельте, но base-вариант — просто детект.
  }

  function onTouchEnd(e) {
    if (!touching) return;
    touching = false;
    const deltaX = currentX - startX;
    if (deltaX > THRESHOLD) {
      openDrawer();
    }
  }

  // Свайп для закрытия drawer (по drawer-у)
  let drawerStartX = 0, drawerCurrentX = 0, drawerTouching = false;
  drawer.addEventListener("touchstart", (e) => {
    drawerTouching = true;
    drawerStartX = e.touches[0].clientX;
    drawerCurrentX = drawerStartX;
  });
  drawer.addEventListener("touchmove", (e) => {
    if (!drawerTouching) return;
    drawerCurrentX = e.touches[0].clientX;
  });
  drawer.addEventListener("touchend", (e) => {
    if (!drawerTouching) return;
    drawerTouching = false;
    const deltaX = drawerCurrentX - drawerStartX;
    if (deltaX < -THRESHOLD) {
      closeDrawer();
    }
  });

  // === Навешиваем слушатели на main-content для свайпа вправо (открыть) ===
  main.addEventListener("touchstart", onTouchStart, { passive: true });
  main.addEventListener("touchmove", onTouchMove, { passive: true });
  main.addEventListener("touchend", onTouchEnd, { passive: true });

  // === Overlay/backdrop: клик — закрыть ===
  backdrop.addEventListener("click", closeDrawer);

  // === Клавиша ESC — закрыть drawer ===
  document.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") closeDrawer();
  });

  // === По клику на контакт — закрыть drawer, открыть чат ===
  function onSelectContact(uid) {
    closeDrawer();
    renderChatUI(uid);
  }

  // (Для тестов/десктопа: можно добавить обработку по кнопке-гамбургеру, если потребуется)
}