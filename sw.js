// Cada vez que cambies cualquier archivo del juego, sube este número (v2, v3...)
const V = 'impostor-v1';
const FILES = [
  './', 'index.html', 'admin.html', 'manifest.json',
  'css/style.css',
  'js/storage.js', 'js/game.js', 'js/admin.js', 'js/pwa.js',
  'data/words-default.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});