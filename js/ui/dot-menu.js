import { toggleTheme } from "../services/theme.js";
import { attachLongPress } from "../core/gestures.js";
import { showPopover, closePopover } from "./dot-popover.js";
import { renderThemeGallery } from "./theme-gallery.js";
import { renderQuickTools } from "./quick-tools.js";

export function renderMenu(callbacks) {
  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" data-act="function" aria-label="Functions">Function</button>
    <button type="button" data-act="theme" aria-label="Toggle theme">Theme</button>
    <button type="button" data-act="settings" aria-label="Settings">Settings</button>
    <button type="button" data-act="contacts" aria-label="Contacts">Contacts</button>
  `;

  // clicks
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "theme") {
      toggleTheme();
      // pulse on host
      const dot = document.getElementById("dot-core");
      dot?.classList.add("dot-pulse");
      setTimeout(() => dot?.classList.remove("dot-pulse"), 240);
    }

    if (act === "function") callbacks.onFunction?.();
    if (act === "settings") callbacks.onSettings?.();
    if (act === "contacts") callbacks.onContacts?.();
    if (act === "theme")    callbacks.onTheme?.();
  });

  // long-press on Theme -> theme gallery
  const btnTheme = wrap.querySelector('[data-act="theme"]');
  attachLongPress(btnTheme, {
    onLongPress: () => {
      const content = renderThemeGallery({
        onPicked: () => {
          // маленький фидбек и закрытие
          const dot = document.getElementById("dot-core");
          dot?.classList.add("dot-pulse");
          setTimeout(() => dot?.classList.remove("dot-pulse"), 240);
          closePopover();
        }
      });
      showPopover(content, { side: "top", offset: 12 });
    }
  });

  // long-press on Function -> quick tools pop
  const btnFunc = wrap.querySelector('[data-act="function"]');
  attachLongPress(btnFunc, {
    onLongPress: () => {
      const content = renderQuickTools({
        onPick: (key) => {
          console.log("[QuickTool]", key);
          closePopover();
          // можно сразу открывать Function и переходить на Tools,
          // но без бэкенда пока просто лог
          callbacks.onFunction?.();
        }
      });
      showPopover(content, { side: "top", offset: 12 });
    }
  });

  return wrap;
}