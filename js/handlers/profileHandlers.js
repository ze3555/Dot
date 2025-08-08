// js/handlers/profileHandlers.js
// Profile Top Drawer: swipe-down (top zone) mobile, "P" on desktop.
// Без top-level импортов; usernames.js подгружается лениво.

(function () {
  'use strict';

  // Ленивый импорт usernames.js (чтобы не рвало модуль при любой ошибке внутри него)
  let __namesMod = null;
  async function getUsernamesMod() {
    if (__namesMod) return __namesMod;
    try {
      __namesMod = await import('../firebase/usernames.js');
      return __namesMod;
    } catch (e) {
      console.error('[Profile] usernames.js import failed:', e);
      throw new Error('Usernames module not available');
    }
  }

  // Безопасные геттеры firebase
  const $auth = () => window.firebase && window.firebase.auth && window.firebase.auth();
  const $db   = () => window.firebase && window.firebase.firestore && window.firebase.firestore();

  let wired = false;

  function setupProfileDrawer() {
    if (wired) return;
    wired = true;

    // ==== Гарантируем DOM (автомонтаж) ====
    let drawer = document.getElementById('profile-top');
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'profile-top';
      drawer.className = 'profile-top-drawer';
      drawer.setAttribute('aria-hidden', 'true');
      drawer.innerHTML = `
        <div class="profile-grabber" aria-hidden="true"></div>
        <div class="profile-sheet-scroll">
          <header class="profile-header">
            <div class="avatar" aria-hidden="true">P</div>
            <div class="user-meta">
              <div class="username-row">
                <span id="profile-username" class="username-chip">—</span>
                <button id="edit-username-btn" class="profile-action">Edit</button>
              </div>
              <button id="copy-id-btn" class="profile-action subtle">Copy ID</button>
            </div>
            <button id="close-profile-top" class="profile-action subtle" aria-label="Close">Close</button>
          </header>

          <section class="profile-section">
            <label class="section-title">Contacts</label>
            <div class="add-username-row">
              <input id="add-username-input" class="profile-input" type="text"
                     placeholder="Add by username" autocomplete="off">
              <button id="add-username-btn" class="profile-action">Add</button>
            </div>
          </section>
        </div>`;
      document.body.appendChild(drawer);
    } else if (!drawer.querySelector('.profile-grabber')) {
      const g = document.createElement('div');
      g.className = 'profile-grabber';
      g.setAttribute('aria-hidden', 'true');
      drawer.prepend(g);
    }

    let backdrop = document.getElementById('profile-top-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'profile-top-backdrop';
      backdrop.className = 'profile-top-backdrop';
      document.body.appendChild(backdrop);
    }

    const closeBtn        = drawer.querySelector('#close-profile-top');
    const copyIdBtn       = drawer.querySelector('#copy-id-btn');
    const editUsernameBtn = drawer.querySelector('#edit-username-btn');
    const unameChip       = drawer.querySelector('#profile-username');
    const addBtn          = drawer.querySelector('#add-username-btn');
    const addInput        = drawer.querySelector('#add-username-input');
    const topBar          = document.querySelector('.top-bar');

    function isOpen() { return drawer.classList.contains('open'); }
    function open() {
      if (isOpen()) return;
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      populate().catch(err => console.warn('[Profile] populate error:', err));
    }
    function close() {
      if (!isOpen()) return;
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }

    async function populate() {
      try {
        const auth = $auth(); const db = $db();
        const user = auth && auth.currentUser;
        if (!user || !db) return;
        const snap = await db.doc(`users/${user.uid}`).get();
        const data = snap.exists ? snap.data() : null;
        const uname = (data && (data.username || data.usernameLower)) || '';
        if (unameChip) unameChip.textContent = uname || '—';
        const avatar = drawer.querySelector('.avatar');
        if (avatar) {
          const initial = String((user.displayName && user.displayName[0]) || (uname && uname[0]) || (user.email && user.email[0]) || 'U').toUpperCase();
          avatar.textContent = initial;
        }
      } catch (e) {
        console.error('[Profile] populate failed:', e);
      }
    }

    // === Controls
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    copyIdBtn && copyIdBtn.addEventListener('click', async () => {
      try {
        const user = $auth() && $auth().currentUser;
        if (!user) return;
        try { await navigator.clipboard.writeText(user.uid); toast('ID copied'); }
        catch { window.prompt('Copy your ID:', user.uid); }
      } catch (e) { console.warn('[Profile] copy id error:', e); }
    });

    editUsernameBtn && editUsernameBtn.addEventListener('click', async () => {
      const current = (unameChip && unameChip.textContent || '').trim();
      const next = window.prompt('Set username (3–20, a–z, 0–9, _):', current);
      if (next == null) return;
      try {
        const mod = await getUsernamesMod();
        const u = await mod.setMyUsername(next);
        if (unameChip) unameChip.textContent = u;
        toast('Username updated');
      } catch (e) {
        toast(e && e.message ? e.message : 'Failed to set username');
      }
    });

    addBtn && addBtn.addEventListener('click', async () => {
      try {
        const mod = await getUsernamesMod();
        const val = mod.normalizeUsername((addInput && addInput.value) || '');
        if (!val) return;
        addBtn.disabled = true;
        try {
          const res = await mod.addContactByUsername(val);
          if (res && res.status === 'added')      { toast('Contact added'); addInput && (addInput.value = ''); }
          else if (res && res.status === 'already'){ toast('Already in contacts'); }
          else                                     { toast('Not found'); }
        } finally {
          addBtn.disabled = false;
        }
      } catch (e) {
        toast(e && e.message ? e.message : 'Failed to add');
      }
    });

    // === Triggers: swipe-down (в верхней зоне) + "P" на десктопе
    const TOP_ZONE_PX = Math.max(48, (topBar && topBar.offsetHeight) || 64);
    const EDGE_LEFT_PX = 22; // запрещаем старт профиля с самого левого края (там контакты)
    const SWIPE_MIN_Y = 50, SWIPE_MAX_X = 60, MAX_DT = 800;

    let tracking = false, x0 = 0, y0 = 0, x = 0, y = 0, t0 = 0;

    function onTouchStart(e) {
      if (isOpen()) return;
      if (window.__gestureLock === 'contacts') return;           // лочит контактный жест
      const t = e.touches && e.touches[0]; if (!t) return;
      const fromTop = t.clientY <= TOP_ZONE_PX || (e.target && e.target.closest && e.target.closest('.top-bar'));
      const fromLeftEdge = t.clientX <= EDGE_LEFT_PX;
      const onDot = e.target && e.target.closest && e.target.closest('.dot-core');
      if (!fromTop || fromLeftEdge || onDot) return;
      tracking = true; x0 = x = t.clientX; y0 = y = t.clientY; t0 = Date.now();
    }

    function onTouchMove(e) {
      if (!tracking) return;
      const t = e.touches && e.touches[0]; if (!t) return;
      x = t.clientX; y = t.clientY;
      const dx = x - x0, dy = y - y0;
      if (Math.abs(dy) > 8 && dy > 0 && Math.abs(dy) > Math.abs(dx)) e.preventDefault();
    }

    function onTouchEnd() {
      if (!tracking) return;
      const dt = Date.now() - t0, dx = x - x0, dy = y - y0;
      if (dy >= SWIPE_MIN_Y && Math.abs(dx) <= SWIPE_MAX_X && dt <= MAX_DT) open();
      tracking = false;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // Desktop: P (когда не печатаем)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const ce = e.target && e.target.isContentEditable;
      if (ce) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); open(); }
    });

    // Debug API
    window.__profileDrawer = { open, close };
    console.debug('[Profile] wired');
  }

  // Экспорт и автозапуск
  window.setupProfileDrawer = setupProfileDrawer;
  try { setupProfileDrawer(); } catch (e) { console.error('[Profile] setup error:', e); }
})();