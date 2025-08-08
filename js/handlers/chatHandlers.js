// js/handlers/swipeHandlers.js
// Contacts drawer: открытие — edge-swipe с левого края; закрытие — тап по бэкдропу
// или свайп влево внутри открытой панели. Gesture-lock, чтобы не конфликтовать с профилем.

let WIRED = false;

export function setupSwipeHandlers() {
  if (WIRED) return;
  WIRED = true;

  const drawer = document.getElementById("contacts-drawer");
  const backdrop =
    document.getElementById("contacts-backdrop") ||
    document.getElementById("contacts-drawer-backdrop") ||
    document.querySelector(".contacts-drawer-backdrop");

  if (!drawer || !backdrop) {
    console.warn("[ContactsSwipe] missing drawer/backdrop");
    return;
  }

  function isOpen() { return drawer.classList.contains("open"); }
  function open() {
    if (isOpen()) return;
    drawer.classList.add("open");
    // Совместимость: включаем обе схемы (.open и .active)
    backdrop.classList.add("open", "active");
    document.body.classList.add("no-scroll");
  }
  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("open");
    // Совместимость: снимаем обе
    backdrop.classList.remove("open", "active");
    document.body.classList.remove("no-scroll");
  }

  // Закрытие по клику вне панели и по ESC
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // ---- Жесты
  const topBar = document.querySelector(".top-bar");
  const TOP_Y = Math.max(48, (topBar?.offsetHeight || 64));

  // Пороговые значения
  const EDGE_X = 20;   // старт открытия только с левого края
  const MIN_X  = 60;   // порог по горизонтали
  const ANGLE  = 1.4;  // |dx| > 1.4*|dy|
  const MAX_DT = 800;  // мс

  let mode = "closed"; // "opening" | "closing" | "closed"
  let track = false, claim = false, x0 = 0, y0 = 0, x = 0, y = 0, t0 = 0;

  function reset() { track = false; claim = false; mode = "closed"; }

  function onStart(e) {
    const t = e.touches?.[0]; if (!t) return;

    if (isOpen()) {
      // Закрываем свайпом влево — старт только внутри самой панели
      const r = drawer.getBoundingClientRect();
      const inDrawer = t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
      if (!inDrawer) { reset(); return; }
      track = true; claim = false; mode = "closing";
      x0 = x = t.clientX; y0 = y = t.clientY; t0 = Date.now();
      return;
    }

    // Открытие — только из левой кромки и ниже топ-бара
    const fromEdge = t.clientX <= EDGE_X;
    const belowTop = t.clientY > TOP_Y + 4;
    if (!fromEdge || !belowTop) { reset(); return; }

    // Избегаем конфликтов (дот/профиль)
    if (e.target?.closest(".dot-core, .profile-top-drawer, .profile-top-backdrop")) { reset(); return; }

    track = true; claim = false; mode = "opening";
    x0 = x = t.clientX; y0 = y = t.clientY; t0 = Date.now();
  }

  function onMove(e) {
    if (!track) return;
    const t = e.touches?.[0]; if (!t) return;
    x = t.clientX; y = t.clientY;

    const dx = x - x0, dy = y - y0;

    if (!claim && Math.abs(dy) > Math.abs(dx) * ANGLE) { reset(); return; }

    if (!claim) {
      if (mode === "opening" && dx > 10 && Math.abs(dx) > Math.abs(dy)) {
        claim = true; e.preventDefault();
        window.__gestureLock = "contacts";
        document.body.classList.add("gesture-contacts");
      }
      if (mode === "closing" && dx < -10 && Math.abs(dx) > Math.abs(dy)) {
        claim = true; e.preventDefault();
        window.__gestureLock = "contacts";
        document.body.classList.add("gesture-contacts");
      }
    } else {
      e.preventDefault();
    }
  }

  function onEnd() {
    if (!track) return;
    const dt = Date.now() - t0, dx = x - x0, dy = y - y0;

    if (mode === "opening" && claim && dx >= MIN_X && Math.abs(dx) > Math.abs(dy) / 1.1 && dt <= MAX_DT) {
      open();
    } else if (mode === "closing" && claim && -dx >= MIN_X && Math.abs(dx) > Math.abs(dy) / 1.1 && dt <= MAX_DT) {
      close();
    }

    reset();
    setTimeout(() => {
      if (window.__gestureLock === "contacts") {
        window.__gestureLock = null;
        document.body.classList.remove("gesture-contacts");
      }
    }, 0);
  }

  window.addEventListener("touchstart", onStart, { passive: true });
  window.addEventListener("touchmove",  onMove,  { passive: false });
  window.addEventListener("touchend",   onEnd,   { passive: true });

  // Debug API
  window.__contactsDrawer = { open, close, isOpen };
}

// Алиас под старое имя (если где-то остался импорт setupSwipeDrawer)
export function setupSwipeDrawer() { return setupSwipeHandlers(); }