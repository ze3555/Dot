import { toggleTheme } from "../services/theme.js";
import { attachLongPress } from "../core/gestures.js";
import { showPopover, closePopover } from "./dot-popover.js";
import { renderThemeGallery } from "./theme-gallery.js";
import { renderQuickTools } from "./quick-tools.js";
import { renderFineTunePopover } from "./fine-tune-popover.js";

export function renderMenu(callbacks) {
  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" data-act="function" aria-label="Functions">Function</button>
    <button type="button" data-act="theme" aria-label="Toggle theme">Theme</button>
    <button type="button" data-act="settings" aria-label="Settings">Settings</button>
    <button type="button" data-act="contacts" aria-label="Contacts">Contacts</button>
  `;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "theme") {
      toggleTheme();
      callbacks.onTheme?.();
    }

    if (act === "function") {
      const content = renderQuickTools({
        onPick: (key) => { console.log("[QuickTool]", key); closePopover(); }
      });
      showPopover(content, { side: "top", offset: 12 });
    }

    if (act === "settings") callbacks.onSettings?.();
    if (act === "contacts") callbacks.onContacts?.();
  });

  // long-press on Theme → gallery (без пульса)
  const btnTheme = wrap.querySelector('[data-act="theme"]');
  attachLongPress(btnTheme, {
    onLongPress: () => {
      const content = renderThemeGallery({
        onPicked: () => { closePopover(); }
      });
      showPopover(content, { side: "top", offset: 12 });
    }
  });

  // long-press on Function → FineTune popover (снизу)
  const btnFunc = wrap.querySelector('[data-act="function"]');
  attachLongPress(btnFunc, {
    onLongPress: () => {
      const content = renderFineTunePopover();
      showPopover(content, { side: "bottom", offset: 12 });
    }
  });

  return wrap;
}