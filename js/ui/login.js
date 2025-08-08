// js/ui/login.js
import {
  loginAnonymously,
  loginWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
} from "../firebase/auth.js";

export function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "login-modal";
  modal.innerHTML = `
    <div class="login-content">
      <svg class="dot-logo" width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" />
      </svg>
      <p class="slogan">Everything in one dot</p>

      <div class="email-auth-block">
        <input type="email" id="email-input" class="login-input" placeholder="Email" />
        <input type="password" id="password-input" class="login-input" placeholder="Пароль" />
        <div class="login-actions">
          <button class="login-btn" id="email-register">Зарегистрироваться</button>
          <button class="login-btn" id="email-login">Войти</button>
        </div>
        <button class="link-btn" id="reset-password">Забыли пароль?</button>
        <div id="login-status" class="login-status" aria-live="polite"></div>
      </div>

      <div class="divider">— или —</div>

      <button class="login-btn" id="anon-login">Продолжить анонимно</button>
      <button class="login-btn" id="google-login">Войти с Google</button>
    </div>
  `;

  document.body.appendChild(modal);

  const $ = (id) => document.getElementById(id);
  const statusEl = $("login-status");

  function setStatus(msg, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.style.color = isError ? "var(--danger, #e53935)" : "var(--ok, #6dd400)";
  }

  $("anon-login").onclick = async () => {
    try {
      setStatus("Входим анонимно…");
      await loginAnonymously();
      setStatus("");
    } catch (e) {
      setStatus(e.message || "Ошибка анонимного входа", true);
    }
  };

  $("google-login").onclick = async () => {
    try {
      setStatus("Открываем Google…");
      await loginWithGoogle();
      setStatus("");
    } catch (e) {
      setStatus(e.message || "Ошибка входа через Google", true);
    }
  };

  $("email-register").onclick = async () => {
    const email = $("email-input").value.trim();
    const password = $("password-input").value;
    try {
      setStatus("Создаём аккаунт…");
      await signUpWithEmail(email, password);
      setStatus("Готово!");
    } catch (e) {
      setStatus(mapFirebaseError(e), true);
    }
  };

  $("email-login").onclick = async () => {
    const email = $("email-input").value.trim();
    const password = $("password-input").value;
    try {
      setStatus("Входим…");
      await signInWithEmail(email, password);
      setStatus("");
    } catch (e) {
      setStatus(mapFirebaseError(e), true);
    }
  };

  $("reset-password").onclick = async () => {
    const email = $("email-input").value.trim();
    try {
      setStatus("Отправляем письмо для сброса…");
      await sendPasswordReset(email);
      setStatus("Письмо для сброса отправлено.");
    } catch (e) {
      setStatus(mapFirebaseError(e), true);
    }
  };

  // Простое приведение ошибок к понятному виду
  function mapFirebaseError(e) {
    const msg = e?.message || "";
    if (/auth\/invalid-email/.test(msg)) return "Неверный формат email";
    if (/auth\/missing-password/.test(msg)) return "Укажи пароль";
    if (/auth\/weak-password/.test(msg)) return "Слабый пароль (минимум 6 символов)";
    if (/auth\/email-already-in-use/.test(msg)) return "Такой email уже зарегистрирован";
    if (/auth\/user-not-found|auth\/wrong-password/.test(msg)) return "Неверный email или пароль";
    return msg || "Неизвестная ошибка";
  }
}

export function hideLoginModal() {
  const modal = document.querySelector(".login-modal");
  if (modal) modal.remove();
}
