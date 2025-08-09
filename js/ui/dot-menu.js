// js/ui/dot-menu.js
// Минимальное, без внешних зависимостей. Делает 4 действия через колбэки.

export function renderMenu(callbacks = {}) {
  const { onFunction, onTheme, onSettings, onContacts } = callbacks;

  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" class="dot-menu__btn" data-act="function" aria-label="Functions">
      <span class="dot-menu__icon" aria-hidden="true">⚙️</span>
      <span class="dot-menu__label">Function</span>
    </button>
    <button type="button" class="dot-menu__btn" data-act="theme" aria-label="Theme">
      <span class="dot-menu__icon" aria-hidden="true">🎨</span>
      <span class="dot-menu__label">Theme</span>
    </button>
    <button type="button" class="dot-menu__btn" data-act="settings" aria-label="Settings">
      <span class="dot-menu__icon" aria-hidden="true">🛠</span>
      <span class="dot-menu__label">Settings</span>
    </button>
    <button type="button" class="dot-menu__btn" data-act="contacts" aria-label="Contacts">
      <span class="dot-menu__icon" aria-hidden="true">👥</span>
      <span class="dot-menu__label">Contacts</span>
    </button>
  `;

  // Делегирование кликов
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    switch (act) {
      case "function":
        onFunction && onFunction();
        break;
      case "theme":
        onTheme && onTheme();
        break;
      case "settings":
        onSettings && onSettings();
        break;
      case "contacts":
        onContacts && onContacts();
        break;
    }
  });

  // Простейшая клавиатурная навигация
  wrap.addEventListener("keydown", (e) => {
    const items = Array.from(wrap.querySelectorAll('.dot-menu__btn'));
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1 + items.length) % items.length]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      // Нажать активную
      const el = document.activeElement;
      if (el && el.matches('.dot-menu__btn')) el.click();
    }
  });

  // Ориентация: горизонтальная/вертикальная
  const dot = document.getElementById("dot-core");
  const setOrientation = () => {
    const vert =
      dot?.classList.contains("dot-vert") ||
      dot?.classList.contains("dot-docked") ||
      dot?.classList.contains("dot-docked-left") ||
      dot?.classList.contains("dot-docked-right");
    wrap.classList.toggle("is-vert", !!vert);
  };
  setOrientation();

  // Следим за изменением классов DOT (при смене состояния/дока)
  if (dot) {
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "class") {
          setOrientation();
        }
      }
    });
    mo.observe(dot, { attributes: true });
  }

  // Автофокус на первую кнопку при показе меню
  queueMicrotask(() => {
    const first = wrap.querySelector(".dot-menu__btn");
    first?.focus();
  });

  return wrap;
}