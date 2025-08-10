// js/ui/fine-tune-popover.js
// Fine‑Tune: оставлен только рубильник Drag (включить/выключить перетаскивание DOT).
// Dock/Snap/Animations полностью удалены.

import { closePopover } from "./dot-popover.js";

const LS_KEY = "dot.prefs";

/* ------------------ Storage ------------------ */
function readPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}
function writePrefs(nextObj) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(nextObj || {}));
  } catch {}
  window.dispatchEvent(new CustomEvent("dot:prefs-changed", { detail: nextObj || {} }));
}

/* ------------------ Apply ------------------ */
function applyDrag(enabled) {
  document.body.classList.toggle("dot-drag-off", !enabled);
}

/* ------------------ UI ------------------ */
export function renderFineTunePopover({ onClose } = {}) {
  const prefs = readPrefs();

  // дефолт: drag включён
  const dragEnabled = prefs.drag !== false;
  applyDrag(dragEnabled);

  const el = document.createElement("div");
  el.className = "fine-tune-popover";

  el.innerHTML = `
    <div class="ftp-head">
      <strong>Fine‑Tune</strong>
      <button class="ftp-close" aria-label="Close" title="Close">×</button>
    </div>

    <div class="ftp-body">
      <!-- Ряд: Drag (как в оригинале, только один) -->
      <div class="ftp-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div class="ftp-label">
          <div style="font-weight:600">Drag</div>
          <div style="opacity:.7;font-size:.9em">Перетаскивание DOT</div>
        </div>

        <!-- Переключатель: checkbox + визуальный слайдер -->
        <label class="ftp-switch" style="position:relative;display:inline-flex;align-items:center;cursor:pointer;">
          <input id="ftp-drag" type="checkbox"
                 style="position:absolute;opacity:0;width:0;height:0;" />
          <span class="ftp-slider" aria-hidden="true"
                style="width:44px;height:24px;border-radius:12px;display:inline-block;box-sizing:border-box;border:1px solid currentColor;opacity:.9"></span>
        </label>
      </div>

      <div class="ftp-note" style="margin-top:8px;opacity:.7;font-size:.9em;line-height:1.3">
        Dock и анимации удалены из этого поповера.
      </div>
    </div>
  `;

  const btnClose = el.querySelector(".ftp-close");
  const input    = el.querySelector("#ftp-drag");
  const slider   = el.querySelector(".ftp-slider");

  // Рисуем «шайбу»
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
    input.checked = !!on;
    input.setAttribute("aria-checked", String(!!on));
    paintSwitch(!!on);
    const next = { ...readPrefs(), drag: !!on };
    writePrefs(next);
    applyDrag(!!on);
  }

  // init
  setDrag(dragEnabled);

  // handlers (кликается и по input, и по самому слайдеру)
  input.addEventListener("change", () => setDrag(!!input.checked));
  slider.addEventListener("click", (e) => {
    e.preventDefault();
    setDrag(!input.checked);
  });

  // Закрыть
  const doClose = () => (onClose ? onClose() : closePopover());
  btnClose.addEventListener("click", doClose);

  // Внутренние клики не должны закрывать поповер
  const stop = (e) => e.stopPropagation();
  el.addEventListener("pointerdown", stop);
  el.addEventListener("click", stop);

  return el;
}

export default renderFineTunePopover;