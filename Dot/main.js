import { initFirebase } from './js/firebase/config.js';
import { onAuthStateChanged } from './js/firebase/auth.js';
import { renderTopbar } from './js/ui/core.js';
import { showLoginModal, hideLoginModal } from './js/ui/login.js';
import { renderChatUI } from './js/ui/chat.js';

async function initApp() {
  initFirebase();

  onAuthStateChanged(async (user) => {
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (!user) {
      showLoginModal();
      return;
    }

    hideLoginModal();
    renderTopbar(user);
    renderChatUI(user);
  });
}

document.addEventListener('DOMContentLoaded', initApp);
