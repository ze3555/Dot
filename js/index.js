import { initGestures } from "./core/gestures.js";
import { initDot } from "./ui/dot.js";
import { initTheme } from "./services/theme.js";
import { initDotDrag } from "./core/drag.js";

function applyInitialPrefs() {
  // Жёстко применяем «тихий» режим, если в localStorage ещё не было настроек
  try {
    const raw = localStorage.getItem("dot.prefs");
    const saved = raw ? JSON.parse(raw) : null;

    // Значения по умолчанию (минимум движения)
    const drag = saved?.drag ?? false;
    const dock = saved?.dock ?? true;
    const animations = saved?.animations ?? false;

    document.body.classList.toggle("dot-drag-off", !drag);
    document.body.classList.toggle("dot-dock-off", !dock);
    document.body.classList.toggle("dot-anim-off", !animations);
  } catch {
    // В случае ошибки — всё выключено кроме дока
    document.body.classList.add("dot-drag-off", "dot-anim-off");
    document.body.classList.remove("dot-dock-off");
  }
}

function boot() {
  initTheme();
  applyInitialPrefs();        // ← включаем «статичный» режим до инициализации DOT
  initGestures();
  initDot();
  initDotDrag(); // ← drag + snap (drag будет отключён классом .dot-drag-off)
}
document.addEventListener("DOMContentLoaded", boot);