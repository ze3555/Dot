self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
});

self.addEventListener('fetch', (event) => {
  // Could add cache strategies here
});