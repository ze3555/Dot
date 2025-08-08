
// js/handlers/swipeHandlers.js
// Left contacts drawer: edge-swipe only (from left edge), horizontal, below top-bar.
// Adds a simple gesture lock to avoid conflicts with profile drawer.

let wired = false;

export function setupSwipeHandlers() {
  if (wired) return;
  wired = true;

  const drawer = document.getElementById("contacts-drawer");
  const backdrop =
    document.getElementById("contacts-backdrop") ||
    document.getElementById("contacts-drawer-backdrop") ||
    document.querySelector(".contacts-drawer-backdrop");

  if (!drawer || !backdrop) return;

  // ---- Open/Close helpers
  function isOpen() { return drawer.classList.contains("open"); }
  function open() {
    if (isOpen()) return;
    drawer.classList.add("open");
    backdrop.classList.add("open");
    document.body.classList.add("no-scroll");
  }
  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  // Close interactions
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // ---- Gesture config
  const topBar = document.querySelector(".top-bar");
  const TOP_ZONE_PX = Math.max(48, (topBar?.offsetHeight || 64));
  const EDGE_ZONE_PX = 20;   // старт только из узкой левой кромки
  const MIN_SWIPE_X  = 60;   // порог открытия
  const ANGLE_RATIO  = 1.4;  // |dx| должен быть в 1.4x больше |dy|
  const MAX_DURATION = 800;  // мс

  let tracking = false, claimed = false;
  let x0 = 0, y0 = 0, x = 0, y = 0, t0 = 0;

  function cancel() { tracking = claimed = false; }

  function onTouchStart(e) {
    if (isOpen()) return; // не стартуем, если уже открыто
    const t = e.touches?.[0]; if (!t) return;

    // Старт ТОЛЬКО из левой кромки и НИЖЕ топ-бара (чтобы не конфликтовать с профилем)
    const fromLeftEdge = t.clientX <= EDGE_ZONE_PX;
    const belowTopBar  = t.clientY > TOP_ZONE_PX + 4;
    if (!fromLeftEdge || !belowTopBar) { cancel(); return; }

    // Игнорируем тач на элементах, где не хотим жестов
    if (e.target.closest(".dot-core, .profile-top-drawer, .profile-top-backdrop")) { cancel(); return; }

    // Ставим «готовность»
    tracking = true;
    claimed = false;
    x0 = x = t.clientX;
    y0 = y = t.clientY;
    t0 = Date.now();
  }

  function onTouchMove(e) {
    if (!tracking) return;
    const t = e.touches?.[0]; if (!t) return;
    x = t.clientX; y = t.clientY;

    const dx = x - x0;
    const dy = y - y0;

    // Если пошло явно по вертикали — отменяем распознавание
    if (!claimed && Math.abs(dy) > Math.abs(dx) * ANGLE_RATIO) { cancel(); return; }

    // Как только двинулись вправо достаточно ощутимо — «забираем» жест
    if (!claimed && dx > 10 && Math.abs(dx) > Math.abs(dy)) {
      claimed = true;
      // Блокируем страницы скролл только после признания жеста
      e.preventDefault(); // (работает потому что move слушаем с passive:false)
      // Лочим жест на время распознавания
      window.__gestureLock = "contacts";
      document.body.classList.add("gesture-contacts");
    }

    if (claimed) {
      // Можно добавить live-следование панели по dx (peek), но пока просто блокируем скролл
      e.preventDefault();
    }
  }

  function onTouchEnd() {
    if (!tracking) return;
    const dt = Date.now() - t0;
    const dx = x - x0;
    const dy = y - y0;

    if (claimed && dx >= MIN_SWIPE_X && Math.abs(dx) > Math.abs(dy) / 1.1 && dt <= MAX_DURATION) {
      open();
    }

    cancel();
    // Сбрасываем lock немного позже (даём шанc обработать open/close)
    setTimeout(() => {
      if (window.__gestureLock === "contacts") {
        window.__gestureLock = null;
        document.body.classList.remove("gesture-contacts");
      }
    }, 0);
  }

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  // Экспорт для отладки
  window.__contactsDrawer = { open, close, isOpen };
}
