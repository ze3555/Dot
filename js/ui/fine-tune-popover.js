// js/ui/fine-tune-popover.js
// Fine‑Tune: ONLY Drag toggle. No Dock/Snap/Animations. No close button.
// Inside clicks do NOT close the popover.

import { closePopover } from "./dot-popover.js";

const LS_KEY = "dot.prefs";

/* storage */
function readPrefs() {
  try { const v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : {}; }
  catch { return {}; }
}
function writePrefs(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj || {})); } catch {}
  window.dispatchEvent(new CustomEvent("dot:prefs-changed", { detail: obj || {} }));
}

/* apply */
function applyDrag(enabled) {
  document.body.classList.toggle("dot-drag-off", !enabled);
}

/* UI */
export function renderFineTunePopover({ onClose } = {}) {
  const prefs = readPrefs();
  const dragEnabled = prefs.drag !== false; // default: ON
  applyDrag(dragEnabled);

  const el = document.createElement("div");
  el.className = "fine-tune-popover";
  el.innerHTML = `
    <div class="ftp-head"><strong>Fine‑Tune</strong></div>
    <div class="ftp-body">
      <div class="ftp-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div class="ftp-label">
          <div style="font-weight:600">Drag</div>
          <div style="opacity:.7;font-size:.9em">Move DOT by dragging</div>
        </div>

        <label class="ftp-switch" style="position:relative;display:inline-flex;align-items:center;cursor:pointer;">
          <input id="ftp-drag" type="checkbox" style="position:absolute;opacity:0;width:0;height:0;" />
          <span class="ftp-slider" aria-hidden="true"
                style="width:44px;height:24px;border-radius:12px;display:inline-block;box-sizing:border-box;border:1px solid currentColor;opacity:.9"></span>
        </label>
      </div>
    </div>
  `;

  const input  = el.querySelector("#ftp-drag");
  const slider = el.querySelector(".ftp-slider");

  function paintSwitch(on) {
    slider.style.padding = "2px";
    slider.style.position = "relative";
    slider.innerHTML = "";
    const knob = document.createElement("span");
    knob.style.position = "absolute";
    knob.style.top = "2px";
    knob.style.width = "20px";
    knob.style.height = "20px";
    knob.style.borderRadius = "50%";
    knob.style.border = "1px solid currentColor";
    knob.style.boxSizing = "border-box";
    knob.style.left = on ? "22px" : "2px";
    slider.appendChild(knob);
  }
  function setDrag(on) {
    const next = { ...readPrefs(), drag: !!on };
    writePrefs(next);
    applyDrag(!!on);
    input.checked = !!on;
    input.setAttribute("aria-checked", String(!!on));
    paintSwitch(!!on);
    // do NOT close on toggle; popover closes only by outside tap
  }

  // init
  setDrag(dragEnabled);

  // interactions (both input and slider clickable)
  input.addEventListener("change", () => setDrag(!!input.checked));
  slider.addEventListener("click", (e) => { e.preventDefault(); setDrag(!input.checked); });

  // Block inside clicks on CAPTURE so the global outside-click closer can't see them
  const stopCap = (e) => { e.stopPropagation(); };
  el.addEventListener("pointerdown", stopCap, { capture: true });
  el.addEventListener("click",        stopCap, { capture: true });
  el.addEventListener("touchstart",   stopCap, { capture: true });
  el.addEventListener("mousedown",    stopCap, { capture: true });

  return el;
}

export default renderFineTunePopover;