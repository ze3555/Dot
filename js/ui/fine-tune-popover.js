// js/ui/fine-tune-popover.js
// Fine‑Tune: оставлен только рубильник Drag. Dock/Snap/Animations — удалены.

import { closePopover } from "./dot-popover.js";

const LS_KEY = "dot.prefs";

function readPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch { return {}; }
}
function writePrefs(next) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(next || {})); } catch {}
  window.dispatchEvent(new CustomEvent("dot:prefs-changed", { detail: next || {} }));
}
function applyDrag(enabled) {
  document.body.classList.toggle("dot-drag-off", !enabled);
}

export function renderFineTunePopover({ onClose } = {}) {
  const prefs = readPrefs();
  const dragEnabled = prefs.drag !== false; // дефолт — ВКЛ

  // Применяем текущее состояние сразу
  applyDrag(dragEnabled);

  const el = document.createElement("div");
  el.className = "fine-tune-popover";
  el.innerHTML = `
    <div class="ftp-head">
      <strong>Fine‑Tune</strong>
      <button class="ftp-close" aria-label="Close" title="Close">×</button>
    </div>

    <div class="ftp-body">
      <div class="ftp-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div class="ftp-label">
          <div style="font-weight:600">Drag</div>
          <div style="opacity:.7;font-size:.9em">Перетаскивание DOT</div>
        </div>

        <!-- Рубильник (как был): input + визуальный тумблер -->
        <label class="ftp-switch" style="position:relative;display:inline-flex;align-items:center;cursor:pointer;">
          <input id="ftp-drag" type="checkbox" style="position:absolute;opacity:0;width:0;height:0;" />
          <span class="ftp-slider" aria-hidden="true"
                style="width:44px;height:24px;border-radius:12px;display:inline-block;box-sizing:border-box;border:1px solid currentColor;opacity:.9"></span>
        </label>
      </div>
    </div>
  `;

  const btnClose = el.querySelector(".ftp-close");
  const input = el.querySelector("#ftp-drag");
  const slider = el.querySelector(".ftp-slider");

  // sync visual
  function paintSwitch(on) {
    // без цветов — стилизуется CSS-ом проекта; тут только положения
    slider.style.padding = "2px";
    slider.style.position = "relative";
    slider.innerHTML = ""; // чистим
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
    input.checked = on;
    input.setAttribute("aria-checked", String(on));
    paintSwitch(on);
    const next = { ...readPrefs(), drag: !!on };
    writePrefs(next);
    applyDrag(!!on);
  }

  // init
  setDrag(dragEnabled);

  // handlers
  input.addEventListener("change", () => setDrag(!!input.checked));
  slider.addEventListener("click", () => setDrag(!input.checked));

  const stop = (e) => e.stopPropagation();
  el.addEventListener("pointerdown", stop);
  el.addEventListener("click", stop);

  btnClose.addEventListener("click", () =>
    (onClose ? onClose() : closePopover())
  );

  return el;
}

export default renderFineTunePopover;