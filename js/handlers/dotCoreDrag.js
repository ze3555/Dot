// js/handlers/dotCoreDrag.js
//
// High-perf drag + авто-контраст по фону под центром DOT.
// Оптимизации:
//  – без getBoundingClientRect() на каждом кадре;
//  – центр считаем из commitLeft/Top + dx/dy;
//  – пересчёт контраста не каждый кадр (каждые 2 кадра + только при изменении положения);
//  – не пишем стили, если цвет не менялся.

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

  // кэш последнего решения
  let lastIsDarkBg = null;
  let lastHex = '';
  let lastDx = 0, lastDy = 0;
  let frameCounter = 0;

  function ensureFixedPosition() {
    const rect = dot.getBoundingClientRect();
    // фиксируем стартовую геометрию один раз
    dotW = rect.width;
    dotH = rect.height;

    // не вызываем layout снова: копируем текущее положение
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

    const rect = { left: commitLeft, top: commitTop }; // уже знаем
    offsetX = latestClientX - rect.left;
    offsetY = latestClientY - rect.top;

    prevZ = dot.style.zIndex;
    dot.style.zIndex = String(Z_DRAG);
    dot.style.willChange = 'transform';
    dot.classList.add('is-dragging');

    dragging = true;
    rafPending = false;

    // стартовый апдейт контраста
    updateDotContrast(commitLeft, commitTop, 0, 0, /*force*/true);

    tick();

    // отключим выделение текста
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
    // не блокируем скролл глобально, но preventDefault оставляем для перетаскивания
    e.preventDefault();
  }

  function onPointerUpOrCancel(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    dot.releasePointerCapture?.(pointerId);
    pointerId = null;
    dragging = false;

    // Закоммитить позицию из transform (dx,dy)
    const transform = getComputedStyle(dot).transform;
    let tx = 0, ty = 0;
    if (transform && transform !== 'none') {
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(',').map(s => parseFloat(s));
        if (parts.length >= 6) {
          tx = parts[4] || 0;
          ty = parts[5] || 0;
        }
      }
    }
    if (tx || ty) {
      commitLeft += tx;
      commitTop  += ty;
      dot.style.left = commitLeft + 'px';
      dot.style.top  = commitTop  + 'px';
    }
    dot.style.transform = 'translate3d(0,0,0)';
    dot.style.willChange = '';
    dot.classList.remove('is-dragging');
    dot.style.zIndex = prevZ || '';
    document.body.style.userSelect = '';

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

    // если движение микроскопическое — не дёргаем стили
    if (dx !== lastDx || dy !== lastDy) {
      lastDx = dx; lastDy = dy;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    // контраст не на каждом кадре
    if ((frameCounter++ & 1) === 0) {
      updateDotContrast(commitLeft, commitTop, dx, dy, /*force*/false);
    }

    if (dragging) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // ===== Автоконтраст (без layout-удара) =====
  function updateDotContrast(left, top, dx, dy, force) {
    // Центр круга в экранных координатах
    const cx = Math.round(left + dx + dotW / 2);
    const cy = Math.round(top  + dy + dotH / 2);

    // Временно выключим хит-тест, чтобы увидеть, что под DOT
    const prevPE = dot.style.pointerEvents;
    dot.style.pointerEvents = 'none';
    let behind = document.elementFromPoint(cx, cy);
    dot.style.pointerEvents = prevPE;

    // подбираем непрозрачный фон вверх по дереву (макс 10 шагов)
    let rgba = null;
    for (let i = 0; i < 10 && behind; i++) {
      const bg = getComputedStyle(behind).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { rgba = parsed; break; }
      behind = behind.parentElement;
    }
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b,a] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const isDarkBg = lum < 0.5;

    if (!force && isDarkBg === lastIsDarkBg) return; // ничего не меняем

    lastIsDarkBg = isDarkBg;
    const hex = isDarkBg ? '#fff' : '#000';
    if (hex !== lastHex) {
      lastHex = hex;
      // Ставим И цвет, И фон — визуально цельный "шар"
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

  // актуальность без драга (resize/scroll)
  const refresh = () => updateDotContrast(commitLeft, commitTop, 0, 0, /*force*/true);
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll',  refresh, { passive: true });

  // стартовый апдейт
  // commitLeft/Top установятся после первого pointerdown; до этого берём текущий rect
  const rect0 = dot.getBoundingClientRect();
  commitLeft = rect0.left; commitTop = rect0.top; dotW = rect0.width; dotH = rect0.height;
  refresh();
}
