// js/handlers/dotCoreDrag.js

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  const topbar = document.querySelector('.topbar');
  if (!dot || !topbar) return;

  let offsetX = 0, offsetY = 0;
  let isDragging = false;
  let dragReady = false;
  let holdTimer = null;

  // --- Стартовое положение: по центру topbar ---
  topbar.style.position = "relative";
  dot.style.position = "absolute";
  dot.style.left = "50%";
  dot.style.top = "50%";
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.transition = "top 0.25s, left 0.25s, transform 0.25s";

  // Центрирование в topbar
  function toTopbarCenter() {
    dot.style.position = "absolute";
    dot.style.left = "50%";
    dot.style.top = "50%";
    dot.style.transform = "translate(-50%, -50%)";
    topbar.appendChild(dot);
  }

  // Переводим DotCore в режим drag (fixed, поверх всего)
  function startDrag(clientX, clientY) {
    const rect = dot.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    dot.style.position = "fixed";
    dot.style.left = rect.left + "px";
    dot.style.top = rect.top + "px";
    dot.style.transform = "";
    document.body.appendChild(dot);

    document.body.classList.add('dragging-dotcore'); // Блокируем scroll страницы
    document.body.style.userSelect = "none";
  }

  // --- Drag с задержкой (hold-to-drag) ---
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
  });

  document.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.classList.remove('dragging-dotcore');
    document.body.style.userSelect = "";
    // Точка остаётся там, куда её бросили
  });

  // --- Тач поддержка ---
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
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.classList.remove('dragging-dotcore');
    document.body.style.userSelect = "";
  });

  // --- Вернуть в центр topbar по двойному клику ---
  dot.addEventListener('dblclick', toTopbarCenter);
}