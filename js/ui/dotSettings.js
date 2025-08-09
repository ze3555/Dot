// js/ui/dotSettings.js
import { el, $ } from "../core/dom.js";
import { getMovable, setMovable, resetToCenter } from "../core/state.js";

let settingsPanel = null;
let finePanel = null;

export function openSettings() {
  if (finePanel) { finePanel.remove(); finePanel = null; }
  if (settingsPanel) return;
  settingsPanel = el("div", { class: "dot-panel dot-settings" }, [
    el("h3", { class: "dot-panel-title" }, "Settings"),
    el("div", { class: "dot-set-row" }, [
      el("label", { class: "dot-set-label" }, "Density"),
      el("select", { class: "dot-set-select" }, [
        el("option", { value:"compact" }, "Compact"),
        el("option", { value:"cozy", selected: true }, "Cozy"),
        el("option", { value:"comfortable" }, "Comfortable"),
      ])
    ]),
    el("div", { class: "dot-set-row" }, [
      el("label", { class: "dot-set-label" }, "Notifications"),
      el("input", { type:"checkbox", class:"dot-set-checkbox" })
    ])
  ]);
  document.body.append(settingsPanel);
  settingsPanel.addEventListener("pointerdown", (e)=>e.stopPropagation());
}

export function openSettingsFine() {
  if (settingsPanel) { settingsPanel.remove(); settingsPanel = null; }
  if (finePanel) return;
  finePanel = el("div", { class: "dot-panel dot-settings dot-settings-fine" }, [
    el("h3", { class: "dot-panel-title" }, "Fine‑Tune"),
    el("div", { class: "dot-set-row" }, [
      el("label", { class: "dot-set-label" }, "Allow free move"),
      (() => {
        const cb = el("input", { type:"checkbox", class:"dot-set-checkbox" });
        cb.checked = getMovable();
        cb.addEventListener("change", () => {
          setMovable(cb.checked);
        });
        return cb;
      })()
    ]),
    el("div", { class: "dot-set-actions" }, [
      (() => {
        const b = el("button", { class:"dot-set-btn" }, "Center DOT");
        b.addEventListener("click", () => {
          resetToCenter();
          const dot = $("#dot-core");
          if (dot) {
            dot.removeAttribute("style");
            dot.classList.add("dot-snap-center");
            setTimeout(()=>dot.classList.remove("dot-snap-center"), 400);
          }
        });
        return b;
      })()
    ])
  ]);
  document.body.append(finePanel);
  finePanel.addEventListener("pointerdown", (e)=>e.stopPropagation());
}

export function closeSettings() {
  if (settingsPanel) { settingsPanel.remove(); settingsPanel = null; }
  if (finePanel) { finePanel.remove(); finePanel = null; }
}