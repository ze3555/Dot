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
  }

  function startDrag(clientX, clientY) {
    // Получаем позицию dot относительно окна
    const rect = dot.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    // Переводим dot в fixed (поверх всех)
    dot.style.position = "fixed";
    dot.style.left = rect.left + "px";
    dot.style.top = rect.top + "px";
    dot.style.transform = "";
    document.body.appendChild(dot);
    document.body.style.userSelect = "none";
    document.body.classList.add('dragging-dotcore');
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
  });

  document.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
    document.body.classList.remove('dragging-dotcore');
    // Dot остаётся где отпустили
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
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
    document.body.classList.remove('dragging-dotcore');
  });

  // Вернуть в центр topbar по двойному клику
  dot.addEventListener('dblclick', toTopbarCenter);
}