// js/ui/core.js

export function renderDotButton() {
  const dot = document.createElement('div');
  dot.id = 'dot-core';

  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dot.classList.contains('pressed')) return;

    dot.classList.add('pressed');

    // Удаляем класс после завершения анимации
    setTimeout(() => {
      dot.classList.remove('pressed');
    }, 200);
  });

  return dot;
}
