// js/ui/login.js
import { loginAnonymously, loginWithGoogle } from "../firebase/auth.js";

export function showLoginModal() {
  const modal = document.createElement("div");
 modal.className = "login-modal";
modal.innerHTML = `
  <div class="login-content">
    <svg class="dot-logo" width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" />
    </svg>
    <p class="slogan">Everything in one dot</p>
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

