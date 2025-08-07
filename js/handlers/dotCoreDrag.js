// js/handlers/dotCoreDrag.js

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  const topbar = document.querySelector('.topbar');
  if (!dot || !topbar) return;

  let offsetX = 0, offsetY = 0;
  let isDragging = false;
  let dragReady = false;
  let holdTimer = null;

  // --- Исходная позиция: по центру topbar ---
  topbar.style.position = "relative";
  dot.style.position = "absolute";
  dot.style.left = "50%";
  dot.style.top = "50%";
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.transition = "top 0.25s, left 0.25s, transform 0.25s";

  function toTopbarCenter() {
    dot.style.position = "absolute";
    dot.style.left = "50%";
    dot.style.top = "50%";
    dot.style.transform = "translate(-50%, -50%)";
    topbar.appendChild(dot);
    updateDotContrast(dot);
  }

  // --- Новый метод: реально определяем фон под центром DotCore, игнорируя саму точку и меню ---
  function getRealBgElem(x, y, dot) {
    let elem = document.elementFromPoint(x, y);
    const hidden = [];
    // Пропускаем dot-core, меню и вложенное, временно скрывая pointer-events
    while (
      elem &&
      (elem === dot || dot.contains(elem) || elem.id === "dot-core-menu" || elem.closest && elem.closest("#dot-core-menu"))
    ) {
      elem.style.pointerEvents = "none";
      hidden.push(elem);
      elem = document.elementFromPoint(x, y);
    }
    // Возвращаем pointer-events обратно
    for (const el of hidden) el.style.pointerEvents = "";
    return elem;
  }

  function isDarkBgUnderDot(dot) {
    const rect = dot.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    // Безопасно убираем pointer-events с DotCore только для поиска подложки
    dot.style.pointerEvents = "none";
    const elem = getRealBgElem(x, y, dot);
    dot.style.pointerEvents = "";

    if (!elem) return false;
    const bg = window.getComputedStyle(elem).backgroundColor;
    if (!bg || bg === 'transparent') return false;
    const rgb = bg.match(/\d+/g);
    if (!rgb) return false;
    const [r, g, b] = rgb.map(Number);
    const brightness = (299 * r + 587 * g + 114 * b) / 1000;
    return brightness < 130;
  }

  function updateDotContrast(dot) {
    if (isDarkBgUnderDot(dot)) {
      dot.classList.add('dot-invert');
    } else {
      dot.classList.remove('dot-invert');
    }
  }

  // --- Drag & Drop с hold ---
  function startDrag(clientX, clientY) {
    const rect = dot.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    dot.style.position = "fixed";
    dot.style.left = rect.left + "px";
    dot.style.top = rect.top + "px";
    dot.style.transform = "";
    document.body.appendChild(dot);
    document.body.style.userSelect = "none";
    document.body.classList.add('dragging-dotcore');
    updateDotContrast(dot);
  }

  dot.addEventListener('mousedown', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      startDrag(e.clientX, e.clientY);
    }, 400);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragReady) return;
    dot.style.top = (e.clientY - offsetY) + "px";
    dot.style.left = (e.clientX - offsetX) + "px";
    updateDotContrast(dot);
  });

  document.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
    document.body.classList.remove('dragging-dotcore');
    updateDotContrast(dot);
  });

  dot.addEventListener('touchstart', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    }, 400);
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !dragReady) return;
    e.preventDefault();
    const touch = e.touches[0];
    dot.style.top = (touch.clientY - offsetY) + "px";
    dot.style.left = (touch.clientX - offsetX) + "px";
    updateDotContrast(dot);
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
    document.body.classList.remove('dragging-dotcore');
    updateDotContrast(dot);
  });

  // Вернуть в центр topbar по двойному клику
  dot.addEventListener('dblclick', toTopbarCenter);

  // Проверяем контраст при инициализации и при ресайзе
  updateDotContrast(dot);
  window.addEventListener('resize', () => updateDotContrast(dot));
  window.addEventListener('scroll', () => updateDotContrast(dot));
}