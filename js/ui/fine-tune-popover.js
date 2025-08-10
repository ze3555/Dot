// js/ui/fine-tune-popover.js
// Fine‑Tune: только переключатель Drag. Dock/Snap/Animations — удалены.
import { closePopover } from "./dot-popover.js";

const LS_KEY = "dot.prefs";

function readPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return (obj && typeof obj === "object") ? obj : {};
  } catch {
    return {};
  }
}
function writePrefs(next) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next || {}));
  } catch {}
}

function applyDragEnabled(enabled) {
  document.body.classList.toggle("dot-drag-off", !enabled);
}

export function renderFineTunePopover({ onClose } = {}) {
  const prefs = readPrefs();
  // По умолчанию драг включён
  const dragEnabled = prefs.drag !== false;

  // Применяем текущее состояние
  applyDragEnabled(dragEnabled);

  const el = document.createElement("div");
  el.className = "fine-tune-popover";

  el.innerHTML = `
    <div class="ftp-head">
      <strong>Fine‑Tune</strong>
      <button class="ftp-close" aria-label="Close" title="Close">×</button>
    </div>
    <div class="ftp-body">
      <label class="ftp-row" style="display:flex;align-items:center;gap:8px;user-select:none">
        <input type="checkbox" id="ftp-drag" />
        <span>Enable drag</span>
      </label>

      <div class="ftp-note" style="margin-top:8px;opacity:.7;font-size:.9em;line-height:1.3">
        Dock и анимации отключены в этом билде.
      </div>
    </div>
  `;

  // Устанавливаем чекбокс
  const dragEl = el.querySelector("#ftp-drag");
  dragEl.checked = dragEnabled;

  // Слушатели
  dragEl.addEventListener("change", () => {
    const nextEnabled = !!dragEl.checked;
    const next = { ...readPrefs(), drag: nextEnabled };
    writePrefs(next);
    applyDragEnabled(nextEnabled);
  });

  const doClose = () => (onClose ? onClose() : closePopover());
  el.querySelector(".ftp-close").addEventListener("click", doClose);

  // Блокируем сквозные клики
  const stop = (e) => e.stopPropagation();
  el.addEventListener("pointerdown", stop);
  el.addEventListener("click", stop);

  return el;
}

export default renderFineTunePopover;