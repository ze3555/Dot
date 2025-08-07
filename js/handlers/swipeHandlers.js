// js/handlers/swipeHandlers.js

import { renderContactsUI } from "../ui/contacts.js";
import { renderChatUI } from "../ui/chat.js";

export function setupSwipeDrawer() {
  const drawer = document.getElementById("contacts-drawer");
  const backdrop = document.getElementById("contacts-backdrop");
  const main = document.getElementById("main-content");
  const dot = document.querySelector(".dot-core");
  const bottomPanel = document.querySelector(".bottom-panel");

  if (!drawer || !backdrop || !main || !dot || !bottomPanel) return;

  let startX = 0;
  let currentX = 0;
  let touching = false;
  let open = false;
  const THRESHOLD = 60; // px свайпа для открытия/закрытия
  const EDGE_ZONE = 32; // px от левого края, где активен свайп

  // Переместить dot в drawer и настроить как кнопку "Add Contact"
  function moveDotToDrawer() {
    if (drawer.contains(dot)) return;
    drawer.appendChild(dot);
    dot.classList.add("dot-in-drawer");
    dot.classList.remove("dot-in-bottom-panel");
    dot.title = "Add Contact";
    dot.onclick = () => {
      // Здесь открываем модалку добавления контакта или нужную логику
      openAddContactModal();
    };
  }

  // Вернуть dot обратно в нижнюю панель как кнопку отправки
  function moveDotToBottomPanel() {
    if (bottomPanel.contains(dot)) return;
    bottomPanel.appendChild(dot);
    dot.classList.add("dot-in-bottom-panel");
    dot.classList.remove("dot-in-drawer");
    dot.title = "Send Message";
    dot.onclick = () => {
      const input = bottomPanel.querySelector(".chat-input");
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      sendMessageFromInput(text);
      input.value = "";
    };
  }

  // Открыть drawer с контактами
  function openDrawer() {
    drawer.classList.add("open");
    backdrop.style.display = "block";
    setTimeout(() => (backdrop.style.opacity = "1"), 0);
    renderContactsUI(drawer, onSelectContact);
    moveDotToDrawer();
    open = true;
  }

  // Закрыть drawer
  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.style.opacity = "0";
    setTimeout(() => {
      backdrop.style.display = "none";
      drawer.innerHTML = "";
    }, 220);
    moveDotToBottomPanel();
    open = false;
  }

  // Обработка свайпа вправо для открытия drawer
  function onTouchStart(e) {
    if (open) return;
    if (e.touches && e.touches[0].clientX > EDGE_ZONE) return;
    touching = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX = startX;
  }

  function onTouchMove(e) {
    if (!touching) return;
    currentX = e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onTouchEnd() {
    if (!touching) return;
    touching = false;
    const deltaX = currentX - startX;
    if (deltaX > THRESHOLD) {
      openDrawer();
    }
  }

  // Обработка свайпа влево внутри drawer для закрытия
  let drawerStartX = 0,
    drawerCurrentX = 0,
    drawerTouching = false;

  drawer.addEventListener("touchstart", (e) => {
    drawerTouching = true;
    drawerStartX = e.touches[0].clientX;
    drawerCurrentX = drawerStartX;
  });

  drawer.addEventListener("touchmove", (e) => {
    if (!drawerTouching) return;
    drawerCurrentX = e.touches[0].clientX;
  });

  drawer.addEventListener("touchend", () => {
    if (!drawerTouching) return;
    drawerTouching = false;
    const deltaX = drawerCurrentX - drawerStartX;
    if (deltaX < -THRESHOLD) {
      closeDrawer();
    }
  });

  // Навешиваем слушатели свайпа на main-content
  main.addEventListener("touchstart", onTouchStart, { passive: true });
  main.addEventListener("touchmove", onTouchMove, { passive: true });
  main.addEventListener("touchend", onTouchEnd, { passive: true });

  // Закрытие drawer по клику на overlay
  backdrop.addEventListener("click", closeDrawer);

  // Закрытие drawer по ESC
  document.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") closeDrawer();
  });

  // При выборе контакта — закрыть drawer и открыть чат
  function onSelectContact(uid) {
    closeDrawer();
    renderChatUI(uid);
  }

  // Функции заглушки — замени на реальные реализации
  function openAddContactModal() {
    console.log("Открываем модалку добавления контакта");
    // TODO: добавь реальную логику
  }

  function sendMessageFromInput(text) {
    console.log("Отправляем сообщение:", text);
    // TODO: добавь реальную логику отправки сообщения
  }
}