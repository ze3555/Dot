[core.js] Итог после правки

Экспорты:
  ✓ renderDotCore()
  ✓ renderTopbar()
  ✓ setupDotCoreFeatures(dot)

Сохранено:
  ✓ Перетаскивание (mousedown/mousemove/mouseup)
  ✓ Клик-bounce (класс .pressed с авто-сбросом)
  ✓ Никаких изменений в других файлах проекта

Добавлено:
  + Автоконтраст DOT (updateDotContrast):
      — высчитывает яркость фона родителя
      — ставит #000 на светлом фоне и #fff на тёмном
      — слушает resize и смену темы (MutationObserver на class body)

Удалений: нет
Побочных эффектов: нет, inline-цвет DOT перекрывает наследование ::before → жёлтизны не будет