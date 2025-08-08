// js/ui/login.js
import { loginAnonymously, loginWithGoogle } from "../firebase/auth.js";

/**
 * Локальный маркер: пользователь уже установил PWA или осознанно продолжил
 */
const ACK_KEY = "dot:a2hs-ack";

let deferredPrompt = null; // beforeinstallprompt (Android/Chrome)
let installed = false;

function isStandalone() {
  // iOS Safari: window.navigator.standalone, PWA/desktop: display-mode
  const dm = window.matchMedia?.("(display-mode: standalone)")?.matches;
  return !!(dm || window.navigator.standalone);
}

function markInstalled(reason = "ack") {
  installed = true;
  try { localStorage.setItem(ACK_KEY, reason); } catch (_) {}
  document.dispatchEvent(new CustomEvent("dot:pwa-installed"));
}

window.addEventListener("beforeinstallprompt", (e) => {
  // Блокируем авто-баннер, сохраняем ивент для ручного вызова
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener("appinstalled", () => {
  markInstalled("appinstalled");
});

function hasAck() {
  try { return !!localStorage.getItem(ACK_KEY); } catch (_) { return false; }
}

export function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "login-modal";
  modal.innerHTML = `
    <div class="login-content">
      <svg class="dot-logo" width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="8" cy="8" r="8" />
      </svg>
      <p class="slogan">Everything in one dot</p>

      <!-- A2HS блок -->
      <div class="a2hs" id="a2hs">
        <div class="a2hs-card" style="display:flex;flex-direction:column;gap:.5rem;align-items:center;text-align:center">
          <div class="a2hs-title" style="font-weight:600">Добавь DOT на экран «Домой»</div>
          <div class="a2hs-sub" style="opacity:.75;font-size:.9em">Чтобы получить полноэкранный опыт и быстрый запуск</div>
          <div class="a2hs-actions" style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;justify-content:center">
            <button id="btn-a2hs-add" class="login-btn" style="min-width:120px;display:none">Add</button>
            <button id="btn-a2hs-how" class="login-btn" style="min-width:120px;opacity:.9">Как?</button>
            <button id="btn-a2hs-continue" class="link-btn" style="text-decoration:underline">Уже добавил — продолжить</button>
          </div>
          <div id="a2hs-hint" class="a2hs-hint" style="display:none;opacity:.9;font-size:.9em;line-height:1.4">
            <div data-hint="ios" style="display:none">
              iOS: нажми <strong>Поделиться</strong> <span aria-hidden="true">▵</span> → <strong>На экран «Домой»</strong>.
            </div>
            <div data-hint="android" style="display:none">
              Android Chrome: меню <strong>⋮</strong> → <strong>Добавить на главный экран</strong>.
            </div>
          </div>
        </div>
      </div>

      <!-- Блок логина (скрыт, пока не установлено/не подтверждено) -->
      <div class="auth-block" id="auth-block" style="display:none">
        <button class="login-btn" id="anon-login">Continue Anonymously</button>
        <button class="login-btn" id="google-login">Sign in with Google</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const btnAdd = document.getElementById("btn-a2hs-add");
  const btnHow = document.getElementById("btn-a2hs-how");
  const btnContinue = document.getElementById("btn-a2hs-continue");
  const hintBox = document.getElementById("a2hs-hint");
  const authBlock = document.getElementById("auth-block");
  const a2hsBlock = document.getElementById("a2hs");

  // Платформенные подсказки
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  const iosHint = hintBox?.querySelector('[data-hint="ios"]');
  const androidHint = hintBox?.querySelector('[data-hint="android"]');
  if (isIOS && iosHint) iosHint.style.display = "block";
  if (isAndroid && androidHint) androidHint.style.display = "block";
  if (!isIOS && !isAndroid && androidHint) androidHint.style.display = "block"; // дефолт

  // Если уже standalone или было подтверждение ранее — показываем логин сразу
  if (isStandalone() || hasAck()) {
    revealAuth();
  } else {
    setupA2HS();
  }

  function setupA2HS() {
    // Показываем кнопку Add, если доступен beforeinstallprompt
    if (deferredPrompt && btnAdd) {
      btnAdd.style.display = "inline-flex";
      btnAdd.onclick = async () => {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
          if (outcome === "accepted") {
            // На некоторых девайсах appinstalled приходит не сразу. Даем путь продолжить вручную.
            markInstalled("prompt-accepted");
            revealAuth();
          }
        } catch {
          // тишина; пользователь мог закрыть диалог
        }
      };
    }

    // «Как?» — показать подсказку лаконично
    if (btnHow && hintBox) {
      btnHow.onclick = () => {
        hintBox.style.display = hintBox.style.display === "none" ? "block" : "none";
      };
    }

    // «Уже добавил» — ручное подтверждение
    if (btnContinue) {
      btnContinue.onclick = () => {
        markInstalled("manual-continue");
        revealAuth();
      };
    }

    // Если система уже в standalone, переключим UI мгновенно
    document.addEventListener("dot:pwa-installed", revealAuth, { once: true });
  }

  function revealAuth() {
    if (a2hsBlock) a2hsBlock.style.display = "none";
    if (authBlock) authBlock.style.display = "block";
  }

  // Обработчики логина
  const anon = document.getElementById("anon-login");
  const google = document.getElementById("google-login");

  if (anon) {
    anon.onclick = async () => {
      await loginAnonymously();
    };
  }
  if (google) {
    google.onclick = async () => {
      await loginWithGoogle();
    };
  }
}

export function hideLoginModal() {
  const modal = document.querySelector(".login-modal");
  if (modal) modal.remove();
}
