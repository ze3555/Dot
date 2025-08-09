// js/ui/dotFunctions.js
import { el } from "../core/dom.js";
import { unmountMenu } from "./dot.js";

let fnPanel = null;

export function openFunctions() {
  unmountMenu();
  if (fnPanel) return;
  fnPanel = el("div", { class: "dot-panel dot-functions" }, [
    el("h3", { class: "dot-panel-title" }, "Functions"),
    el("div", { class: "dot-fn-card" }, [
      el("div", { class: "dot-fn-name" }, "ChatGPT"),
      el("div", { class: "dot-fn-desc" }, "Simple embedded chat (placeholder)"),
      el("textarea", { class: "dot-fn-input", placeholder: "Ask something…" }),
      el("div", { class: "dot-fn-actions" }, [
        el("button", { class:"dot-fn-run" }, "Send")
      ])
    ])
  ]);
  document.body.append(fnPanel);
  fnPanel.addEventListener("pointerdown", (e)=>e.stopPropagation());
}

export function closeFunctions() {
  if (fnPanel) { fnPanel.remove(); fnPanel = null; }
}