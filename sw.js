// À incrémenter à chaque déploiement (bandhiit-v1.1, v1.2…) pour que les mises à jour arrivent chez les utilisateurs
const CACHE_NAME = 'bandhiit-v1.0';
const CACHE_PREFIX = 'bandhiit-';
const ASSETS = [
  '/nano-BandHIIT/',
  '/nano-BandHIIT/index.html',
  '/nano-BandHIIT/manifest.json',
  '/nano-BandHIIT/icon-192.png',
  '/nano-BandHIIT/icon-512.png',
  '/nano-BandHIIT/BandHIIT.svg'
];

// Installation : mise en cache + skipWaiting chaîné correctement
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(ASSETS.map(url =>
        cache.add(url).catch(err => console.log("Fichier non bloquant manquant :", url))
      ));
    }).then(() => self.skipWaiting()) // ← chaîné après la mise en cache complète
  );
});

// Activation : nettoyage des anciennes versions de CETTE appli uniquement
// (les autres PWA de brunolaforet.github.io partagent la même origine, on ne touche pas à leurs caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Stratégie : CACHE-FIRST (priorité absolue au local pour la vitesse)
// On interroge uniquement le cache de cette appli, pas tous les caches de l'origine
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(e.request, { ignoreSearch: true }))
      .then(res => {
        return res || fetch(e.request).catch(() => {
          if (e.request.mode === 'navigate') return caches.match('/nano-BandHIIT/index.html');
        });
      })
  );
});
