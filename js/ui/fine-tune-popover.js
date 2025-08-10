// js/ui/fine-tune-popover.js
// Fine‑Tune без дока и анимаций. Никаких переключателей dock/snap/animations,
// никаких классов на body, никаких записей dot.prefs — чистый no-op UI.

import { closePopover } from "./dot-popover.js";

export function renderFineTunePopover({ onClose } = {}) {
  const el = document.createElement("div");
  el.className = "fine-tune-popover";

  el.innerHTML = `
    <div class="ftp-head">
      <strong>Fine‑Tune</strong>
      <button class="ftp-close" aria-label="Close" title="Close">×</button>
    </div>
    <div class="ftp-body">
      <p style="margin:0">
        Dock и анимации в этом билде отключены.
      </p>
    </div>
  `;

  const doClose = () => (onClose ? onClose() : closePopover());
  el.querySelector(".ftp-close").addEventListener("click", doClose);

  // Блокируем «сквозной» клик — поповер не закрывается от внутренних тапов
  const stop = (e) => e.stopPropagation();
  el.addEventListener("pointerdown", stop);
  el.addEventListener("click", stop);

  return el;
}

export default renderFineTunePopover;