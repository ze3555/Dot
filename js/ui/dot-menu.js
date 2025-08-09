// js/ui/dotMenu.js
// Здесь только „Theme“ окно, потому что сами кнопки меню создаёт dot.js
import { el } from "../core/dom.js";
import { unmountMenu } from "./dot.js";

let themePanel = null;

export function openTheme() {
  unmountMenu();
  if (themePanel) return;
  themePanel = el("div", { class: "dot-panel dot-theme" }, [
    el("h3", { class: "dot-panel-title" }, "Theme"),
    el("div", { class: "dot-theme-row" }, [
      el("button", { class: "dot-theme-btn", "data-theme":"light" }, "Light"),
      el("button", { class: "dot-theme-btn", "data-theme":"dark" }, "Dark"),
      el("button", { class: "dot-theme-btn", "data-theme":"system" }, "System"),
    ])
  ]);
  document.body.append(themePanel);
  themePanel.addEventListener("pointerdown", (e)=>e.stopPropagation());
  themePanel.addEventListener("click", (e) => {
    const btn = e.target.closest(".dot-theme-btn");
    if (!btn) return;
    const t = btn.getAttribute("data-theme");
    document.documentElement.dataset.theme = t;
  });
}

export function closeTheme() {
  if (themePanel) { themePanel.remove(); themePanel = null; }
}