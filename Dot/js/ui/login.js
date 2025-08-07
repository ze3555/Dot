// js/ui/login.js
import { loginAnonymously, loginWithGoogle } from "../firebase/auth.js";

export function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "login-modal";
  modal.innerHTML = `
    <div class="login-content">
      <h2>Welcome to DOT</h2>
      <button class="login-btn" id="anon-login">Continue Anonymously</button>
      <button class="login-btn" id="google-login">Sign in with Google</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("anon-login").onclick = async () => {
    await loginAnonymously();
  };

  document.getElementById("google-login").onclick = async () => {
    await loginWithGoogle();
  };
}

export function hideLoginModal() {
  const modal = document.querySelector(".login-modal");
  if (modal) modal.remove();
}
