// js/handlers/dotCoreDrag.js

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  let offsetX = 0, offsetY = 0, isDragging = false;

  // Перевести DotCore в fixed (один раз)
  dot.style.position = "fixed";
  // Поставить на стартовую позицию (например, левый верхний угол)
  // dot.style.top = "16px"; dot.style.left = "16px";
  // Или оставить стартовую через CSS

  dot.addEventListener('mousedown', (e) => {
    isDragging = true;
    // Координаты курсора относительно точки
    const rect = dot.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.body.style.userSelect = "none"; // чтобы не выделялся текст
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    // Новое положение точки
    dot.style.top = (e.clientY - offsetY) + "px";
    dot.style.left = (e.clientX - offsetX) + "px";
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });

  // Для тач-устройств
  dot.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    const rect = dot.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    dot.style.top = (touch.clientY - offsetY) + "px";
    dot.style.left = (touch.clientX - offsetX) + "px";
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });
}