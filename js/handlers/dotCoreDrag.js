// js/handlers/dotCoreDrag.js
//
// High-perf drag + автоконтраст (фон+цвет) без дёрганий на отпускании.
// Ключевые фиксы:
//  • Во время драга отключаем transition (transition: none), на отпускании возвращаем.
//  • Не читаем computed transform — используем lastDx/lastDy (без reflow).
//  • Коммитим left/top до сброса transform (FLIP без анимации на релизе).

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  dot.style.touchAction = 'none';

  let dragging = false;
  let pointerId = null;

  let commitLeft = 0;
  let commitTop  = 0;

  let latestClientX = 0;
  let latestClientY = 0;

  let offsetX = 0;
  let offsetY = 0;

  let dotW = 0, dotH = 0;

  let rafId = 0;
  let rafPending = false;

  const Z_DRAG = 2147483647;
  let prevZ = '';

  // кэш состояния
  let lastIsDarkBg = null;
  let lastHex = '';
  let lastDx = 0, lastDy = 0;
  let frameCounter = 0;

  // отключаем/возвращаем transition
  let savedTransition = '';

  function ensureFixedPosition() {
    const rect = dot.getBoundingClientRect();
    dotW = rect.width;
    dotH = rect.height;

    dot.style.position = 'fixed';
    dot.style.left = rect.left + 'px';
    dot.style.top  = rect.top  + 'px';
    dot.style.transform = 'translate3d(0,0,0)';

    commitLeft = rect.left;
    commitTop  = rect.top;
  }

  function clampToViewport(x, y) {
    const pad = 6;
    const maxX = window.innerWidth  - dotW - pad;
    const maxY = window.innerHeight - dotH - pad;
    if (x < pad) x = pad; else if (x > maxX) x = maxX;
    if (y < pad) y = pad; else if (y > maxY) y = maxY;
    return [x, y];
  }

  function onPointerDown(e) {
    if (dragging || (e.isPrimary === false)) return;

    pointerId = e.pointerId;
    dot.setPointerCapture?.(pointerId);

    ensureFixedPosition();

    latestClientX = e.clientX;
    latestClientY = e.clientY;
    offsetX = latestClientX - commitLeft;
    offsetY = latestClientY - commitTop;

    // временно отключаем любые переходы — двигаем «сырым» transform’ом
    savedTransition = dot.style.transition || '';
    dot.style.transition = 'none';

    prevZ = dot.style.zIndex;
    dot.style.zIndex = String(Z_DRAG);
    dot.style.willChange = 'transform';
    dot.classList.add('is-dragging');

    dragging = true;
    rafPending = false;

    // стартовый апдейт контраста
    updateDotContrast(commitLeft, commitTop, 0, 0, /*force*/true);

    tick();

    document.body.style.userSelect = 'none';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    latestClientX = e.clientX;
    latestClientY = e.clientY;

    if (!rafPending) {
      rafPending = true;
      rafId = requestAnimationFrame(tick);
    }
    e.preventDefault();
  }

  function onPointerUpOrCancel(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    dot.releasePointerCapture?.(pointerId);
    pointerId = null;
    dragging = false;

    // 1) Коммитим абсолютную позицию (без чтения computed transform)
    commitLeft += lastDx;
    commitTop  += lastDy;
    dot.style.left = commitLeft + 'px';
    dot.style.top  = commitTop  + 'px';

    // 2) Сбрасываем transform в 0 — переходы выключены, рывка нет
    dot.style.transform = 'translate3d(0,0,0)';

    // 3) Убираем «режим драга»
    dot.style.willChange = '';
    dot.classList.remove('is-dragging');
    dot.style.zIndex = prevZ || '';
    document.body.style.userSelect = '';

    // 4) Возвращаем transition в следующий кадр (чтобы не поймать промежуточный стейт)
    requestAnimationFrame(() => {
      dot.style.transition = savedTransition;
    });

    // финальный апдейт контраста
    updateDotContrast(commitLeft, commitTop, 0, 0, /*force*/true);
  }

  function tick() {
    rafPending = false;

    let x = latestClientX - offsetX;
    let y = latestClientY - offsetY;
    [x, y] = clampToViewport(x, y);

    const dx = x - commitLeft;
    const dy = y - commitTop;

    if (dx !== lastDx || dy !== lastDy) {
      lastDx = dx; lastDy = dy;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    if ((frameCounter++ & 1) === 0) {
      updateDotContrast(commitLeft, commitTop, dx, dy, /*force*/false);
    }

    if (dragging) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // ===== Автоконтраст (фон+цвет, лёгкий) =====
  function updateDotContrast(left, top, dx, dy, force) {
    const cx = Math.round(left + dx + dotW / 2);
    const cy = Math.round(top  + dy + dotH / 2);

    const prevPE = dot.style.pointerEvents;
    dot.style.pointerEvents = 'none';
    let behind = document.elementFromPoint(cx, cy);
    dot.style.pointerEvents = prevPE;

    let rgba = null;
    for (let i = 0; i < 10 && behind; i++) {
      const bg = getComputedStyle(behind).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { rgba = parsed; break; }
      behind = behind.parentElement;
    }
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const isDarkBg = lum < 0.5;
    if (!force && isDarkBg === lastIsDarkBg) return;

    lastIsDarkBg = isDarkBg;
    const hex = isDarkBg ? '#fff' : '#000';
    if (hex !== lastHex) {
      lastHex = hex;
      dot.style.color = hex;
      dot.style.backgroundColor = hex;
      dot.style.setProperty('--dot-core-fg', hex);
      dot.style.setProperty('--dot-core-border', hex);
      try {
        dot.querySelectorAll('svg').forEach(svg => {
          svg.style.stroke = 'currentColor';
          svg.style.fill = 'currentColor';
        });
      } catch(_) {}
    }
  }

  // helpers
  function srgb(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  function parseCssColor(color){
    if (!color) return null;
    if (color === 'transparent') return [0,0,0,0];
    if (color.startsWith('rgb')) {
      const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/i);
      if (!m) return null;
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), m[4] ? parseFloat(m[4]) : 1];
    }
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return [r,g,b,1];
    }
    return null;
  }

  // listeners
  dot.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
  window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });

  // актуальность без драга
  const refresh = () => updateDotContrast(commitLeft, commitTop, 0, 0, /*force*/true);
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll',  refresh, { passive: true });

  // стартовый стейт
  const rect0 = dot.getBoundingClientRect();
  commitLeft = rect0.left; commitTop = rect0.top; dotW = rect0.width; dotH = rect0.height;
  refresh();
}
