// Service worker sencillo de AguaClara.
// Estrategia: red primero (siempre intenta traer la versión más reciente) y, si no hay conexión,
// usa la copia guardada. Así las actualizaciones se ven al recargar y la app abre sin internet.
const CACHE = 'aguaclara-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/', '/favicon.svg', '/manifest.webmanifest']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Solo archivos de la propia app; el mapa, las fuentes y Firebase van directo a la red.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copia));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(
          (r) => r || (req.mode === 'navigate' ? caches.match('/') : null) || Response.error()
        )
      )
  );
});
