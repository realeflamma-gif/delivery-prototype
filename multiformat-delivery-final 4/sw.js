const entry = new URL('./', self.registration.scope);
const shell = new URL('index.html', entry);
const cacheName = 'magnit-prototype-shell:' + entry.pathname;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.mode !== 'navigate' || request.method !== 'GET' || url.origin !== entry.origin ||
      (url.pathname !== entry.pathname && url.pathname !== shell.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok && response.headers.get('Content-Type')?.includes('text/html')) {
        await cache.put(shell, response.clone());
      }
      return response;
    } catch {
      return (await cache.match(shell)) || Response.error();
    }
  })());
});
