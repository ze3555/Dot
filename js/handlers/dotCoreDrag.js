// js/handlers/dotCoreDrag.js
//
// High-perf drag + автоконтраст по фону под центром DOT.
// Теперь выставляем И цвет, И заливку (background-color) под фон.
//
// Публичная функция: enableDotCoreDrag()

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  dot.style.touchAction = 'none';

  let dragging = false;
  let pointerId = null;

  let commitLeft = null;
  let commitTop  = null;

  let latestClientX = 0;
  let latestClientY = 0;

  let offsetX = 0;
  let offsetY = 0;

  let dotW = 0, dotH = 0;

  let rafId = 0;
  let rafPending = false;

  const Z_DRAG = 2147483647;
  let prevZ = '';

  // запомним последнее решение, чтобы не дергать стили зря
  let lastIsDarkBg = null;

  function ensureFixedPosition() {
    const rect = dot.getBoundingClientRect();
    const computed = getComputedStyle(dot);
    const wasFixed = computed.position === 'fixed';

    if (!wasFixed) {
      dot.style.width = rect.width + 'px';
      dot.style.height = rect.height + 'px';
    }

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
    if (x < pad) x = pad;
    else if (x > maxX) x = maxX;
    if (y < pad) y = pad;
    else if (y > maxY) y = maxY;
    return [x, y];
  }

  function onPointerDown(e) {
    if (dragging || (e.isPrimary === false)) return;

    pointerId = e.pointerId;
    dot.setPointerCapture?.(pointerId);

    ensureFixedPosition();
    const rect = dot.getBoundingClientRect();
    dotW = rect.width;
    dotH = rect.height;

    latestClientX = e.clientX;
    latestClientY = e.clientY;
    offsetX = latestClientX - rect.left;
    offsetY = latestClientY - rect.top;

    prevZ = dot.style.zIndex;
    dot.style.zIndex = String(Z_DRAG);
    dot.style.willChange = 'transform';
    dot.classList.add('is-dragging');

    dragging = true;
    rafPending = false;

    // сразу проверить контраст в текущей точке
    updateDotContrast(dot);

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

    // Закоммитить позицию
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
    updateDotContrast(dot);
  }

  function tick() {
    rafPending = false;

    let x = latestClientX - offsetX;
    let y = latestClientY - offsetY;
    [x, y] = clampToViewport(x, y);

    const dx = x - commitLeft;
    const dy = y - commitTop;
    dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

    // обновляем контраст во время перетаскивания
    updateDotContrast(dot);

    if (dragging) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // ===== Автоконтраст (фон и цвет Дота) =====
  function updateDotContrast(dotEl) {
    const rect = dotEl.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    // временно отключим хит-тест, чтобы увидеть, что под DOT
    const prevPE = dotEl.style.pointerEvents;
    dotEl.style.pointerEvents = 'none';
    let behind = document.elementFromPoint(cx, cy);
    dotEl.style.pointerEvents = prevPE;

    // ищем ближайший непрозрачный фон вверх по дереву
    let rgba = null;
    let guard = 0;
    while (behind && guard++ < 20) {
      const bg = getComputedStyle(behind).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { // alpha > 0
        rgba = parsed;
        break;
      }
      behind = behind.parentElement;
    }

    // дефолт — белый фон
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b,a] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const isDarkBg = lum < 0.5; // тёмным считаем ниже 0.5

    if (isDarkBg !== lastIsDarkBg) {
      lastIsDarkBg = isDarkBg;
      if (isDarkBg) {
        setDotColorAndFill(dotEl, '#fff'); // на тёмном фоне — белый
      } else {
        setDotColorAndFill(dotEl, '#000'); // на светлом — чёрный
      }
    }
  }

  function setDotColorAndFill(el, hex) {
    // Текст/иконки, бордер-переменные и ЗАЛИВКА
    el.style.color = hex;
    el.style.backgroundColor = hex;
    el.style.setProperty('--dot-core-fg', hex);
    el.style.setProperty('--dot-core-border', hex);

    // Если внутри есть SVG без currentColor — подсветим stroke/fill
    try {
      el.querySelectorAll('svg').forEach(svg => {
        svg.style.stroke = 'currentColor';
        svg.style.fill = 'currentColor';
      });
    } catch(_) {}
  }

  // helpers цветов
  function srgb(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function parseCssColor(color) {
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

  // Поддержка актуальности без драга
  const refresh = () => updateDotContrast(dot);
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll',  refresh, { passive: true });

  // стартовый апдейт
  updateDotContrast(dot);
}
