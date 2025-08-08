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

  let isOpen = false;

  function openDrawer() {
    if (isOpen) return;

    drawer.innerHTML = "";
    renderContactsUI(drawer, handleSelectContact);

    backdrop.style.display = "block";
    drawer.style.display = "flex";

    requestAnimationFrame(() => {
      drawer.classList.add("open");
      backdrop.classList.add("active");
    });

    moveDotToDrawer();
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

    moveDotToBottomPanel();
    isOpen = false;
  }

  function moveDotToDrawer() {
    if (!drawer.contains(dot)) {
      drawer.appendChild(dot);
      dot.classList.add("dot-in-drawer");
      dot.classList.remove("dot-in-bottom-panel");
      dot.title = "Add Contact";
      dot.onclick = openAddContactModal;
    }
  }

  function moveDotToBottomPanel() {
    if (!bottomPanel.contains(dot)) {
      bottomPanel.appendChild(dot);
      dot.classList.add("dot-in-bottom-panel");
      dot.classList.remove("dot-in-drawer");
      dot.title = "Send Message";
      dot.onclick = sendMessageFromInput;
    }
  }

  function sendMessageFromInput() {
    const input = bottomPanel.querySelector(".chat-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = "";
  }

  function openAddContactModal() {
    console.log("Открытие модалки добавления контакта");
    // TODO: Здесь может быть реальная логика
  }

  function handleSelectContact(uid) {
    closeDrawer();
    renderChatUI(uid);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeDrawer();
  });

  backdrop.addEventListener("click", closeDrawer);

  main.addEventListener("touchstart", handleTouchStart, { passive: true });
  main.addEventListener("touchmove", handleTouchMove, { passive: true });
  main.addEventListener("touchend", handleTouchEnd, { passive: true });

  drawer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
  });

  drawer.addEventListener("touchmove", (e) => {
    touchCurrentX = e.touches[0].clientX;
  });

  drawer.addEventListener("touchend", () => {
    if (touchStartX - touchCurrentX > SWIPE_THRESHOLD) {
      closeDrawer();
    }
  });

  // === ПК: прозрачная стрелка-триггер слева ===
  if (window.innerWidth >= 768) {
    const trigger = document.createElement("div");
    trigger.id = "drawer-trigger";
    trigger.className = "drawer-trigger";
    trigger.title = "Contacts";
    trigger.innerHTML = "&#x25B6;"; // ►

    trigger.onclick = () => {
      if (!isOpen) openDrawer();
    };

    document.body.appendChild(trigger);
  }

  // === Swipe logic ===
  let touchStartX = 0;
  let touchCurrentX = 0;
  const SWIPE_THRESHOLD = 60;
  const SWIPE_ZONE = 24;

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
}
