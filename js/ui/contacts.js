// js/ui/contacts.js
import { getContacts } from "../handlers/contactHandlers.js";

export async function renderContactsUI(container, onSelectContact) {
  if (!container) return;
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "contacts-wrapper";
  wrapper.id = "contacts-wrapper";

  // Поле ввода UID
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID";
  input.className = "contacts-input";

  // Список контактов
  const list = document.createElement("ul");
  list.className = "contacts-list";

  // ===== DOT позиционирование справа от инпута =====
  const dot = document.querySelector(".dot-core");

  function storeOriginalDotPosition() {
    if (!dot) return;
    if (!dot.dataset.originalPosition) {
      dot.dataset.originalPosition = JSON.stringify({
        left: dot.style.left,
        top: dot.style.top,
        position: dot.style.position,
        transform: dot.style.transform,
      });
    }
  }

  function restoreDotPosition() {
    if (!dot) return;
    if (dot.dataset.originalPosition) {
      const pos = JSON.parse(dot.dataset.originalPosition);
      dot.style.left = pos.left;
      dot.style.top = pos.top;
      dot.style.position = pos.position;
      dot.style.transform = pos.transform;
      delete dot.dataset.originalPosition;
    }
    dot?.classList.remove("dot-add-mode");
  }

  function positionDotNextToInput() {
    if (!dot || !input.isConnected) return;

    // Сохраняем изначку один раз
    storeOriginalDotPosition();

    // Вычисляем позицию
    const rect = input.getBoundingClientRect();
    // Если высота DOT ещё 0 — попробуем измерить после кадра
    const ensure = () => {
      const h = dot.offsetHeight || 32; // дефолт на всякий
      const top = rect.top + rect.height / 2 - h / 2;

      dot.style.position = "fixed";
      dot.style.left = `${rect.right + 8}px`;
      dot.style.top = `${Math.max(0, top)}px`;
      dot.style.transform = "translate3d(0,0,0)";
      dot.classList.add("dot-add-mode");
    };

    // Первый кадр для корректного layout
    if (dot.offsetHeight === 0) {
      requestAnimationFrame(ensure);
    } else {
      ensure();
    }
  }

  // При фокусе — закрепляем DOT у инпута
  input.addEventListener("focus", () => {
    positionDotNextToInput();
  });

  // При потере фокуса — возвращаем DOT на место
  input.addEventListener("blur", () => {
    restoreDotPosition();
  });

  // Поддержка при ресайзе/скролле, пока инпут в фокусе
  const onViewportChange = () => {
    if (document.activeElement === input) {
      positionDotNextToInput();
    }
  };
  window.addEventListener("resize", onViewportChange, { passive: true });
  window.addEventListener("scroll", onViewportChange, { passive: true });

  // Сигнал от дровера: "только что перенесли DOT внутрь — прижми к инпуту"
  const ensureDotHandler = () => positionDotNextToInput();
  window.addEventListener("contacts:ensureDotAtInput", ensureDotHandler);

  // Очистка слушателей при повторном рендере
  wrapper.addEventListener("DOMNodeRemoved", (e) => {
    if (e.target === wrapper) {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("contacts:ensureDotAtInput", ensureDotHandler);
    }
  });

  // Заполнение списка контактов
  try {
    const contacts = await getContacts();
    contacts.forEach((uid) => {
      const li = document.createElement("li");
      li.textContent = uid;
      li.className = "contacts-list-item";
      if (typeof onSelectContact === "function") {
        li.style.cursor = "pointer";
        li.addEventListener("click", () => onSelectContact(uid));
      }
      list.appendChild(li);
    });
  } catch (err) {
    const li = document.createElement("li");
    li.textContent = "Failed to load contacts";
    li.className = "contacts-list-item";
    list.appendChild(li);
  }

  wrapper.appendChild(input);
  wrapper.appendChild(list);
  container.appendChild(wrapper);

  // Сразу после вставки — прижать DOT к инпуту (без ожидания фокуса)
  requestAnimationFrame(positionDotNextToInput);
}

// Автоинициализация при клике на Contacts (как было)
document.addEventListener("DOMContentLoaded", () => {
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      const container = document.getElementById("main-content");
      renderContactsUI(container, (uid) => {
        console.log("Selected contact:", uid);
      });
    });
  }
});