// sw.js

const CACHE_NAME = 'dot-app-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/main.js',
  '/css/index.css',
  '/css/drawer.css',
  '/css/core/dot-core.css',
  '/css/layout/topbar.css',
  '/css/layout/main.css',
  '/css/ui/login-modal.css',
  '/css/theme/light-dark.css',
  '/js/handlers/swipeHandlers.js',
  '/js/handlers/coreHandlers.js',
  '/js/handlers/themeHandlers.js',
  '/js/handlers/contactHandlers.js',
  '/js/ui/chat.js',
  '/js/ui/core.js',
  '/js/ui/login.js',
  '/js/ui/contacts.js',
  '/manifest.json',
  '/dot192.png',
  '/dot512.png'
];

// Установка SW и кеширование shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Активация SW и очистка старого кеша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Перехват запросов: кеш + fallback в сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
  );
});
