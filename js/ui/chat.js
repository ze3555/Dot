// js/ui/chat.js — Chat composer (ChatGPT-style docked DOT)
(() => {
  const body = document.body;
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.chat-send-btn');
  const DOT = document.querySelector('.dot-core'); // ваш квадрат

  // --- Safety: стартовое состояние
  body.classList.remove('dot-dock');     // ничего не докнуто изначально
  body.classList.remove('dot-send-ready');
  if (!DOT) body.classList.add('no-dot-core'); else body.classList.remove('no-dot-core');

  // --- iOS zoom fix (без приближения)
  if (input) input.style.fontSize = '16px';

  // --- Авто‑рост textarea + ready‑state
  const syncReadyState = () => {
    const hasText = !!input.value.trim();
    body.classList.toggle('dot-send-ready', hasText);
  };
  const autoresize = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  };

  // --- Отправка
  const doSend = () => {
    const text = input.value.trim();
    if (!text) return;
    // здесь остаётся ваша фактическая отправка сообщения
    form?.dispatchEvent(new Event('dot:send', { bubbles: true })); // хук, если нужен
    form?.submit?.(); // если у вас перехват onsubmit — он сработает

    input.value = '';
    autoresize();
    syncReadyState();

    // Опционально: оставляем фокус и док‑режим активным, как в ChatGPT
    input.focus();
  };

  // --- Dock: активируем ТОЛЬКО на фокусе, снимаем на blur
  let blurTimer = null;
  const enableDock = () => {
    if (!DOT) return;
    body.classList.add('dot-dock');
  };
  const disableDock = () => {
    if (!DOT) return;
    body.classList.remove('dot-dock');
  };

  input?.addEventListener('focus', () => {
    clearTimeout(blurTimer);
    enableDock();
  });

  // даём 120мс, чтобы тап по ДОТ/кнопке не терялся
  input?.addEventListener('blur', () => {
    clearTimeout(blurTimer);
    blurTimer = setTimeout(disableDock, 120);
  });

  // --- Слушатель на ДОТ: один раз, работает каждый клик в док‑режиме
  if (DOT) {
    DOT.addEventListener('click', (e) => {
      if (!body.classList.contains('dot-dock')) return; // только когда докнут
      e.preventDefault();
      doSend();
    });
  }

  // --- Кнопка Send (fallback / desktop)
  sendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    doSend();
  });

  // --- Форма
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    doSend();
  });

  // --- Ввод
  input?.addEventListener('input', () => {
    autoresize();
    syncReadyState();
  });

  // --- Тап по зоне сообщений снимает фокус (если у вас есть #main-content)
  const main = document.getElementById('main-content');
  main?.addEventListener('pointerdown', () => {
    // задержка, чтобы не мешать клику по ДОТ
    setTimeout(() => input?.blur(), 0);
  });

  // Initial layout sync
  requestAnimationFrame(() => { autoresize(); syncReadyState(); });
})();