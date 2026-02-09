const CACHE_NAME = 'amazon-support-tool-v1';
const URLS_TO_CACHE = ['/', '/index.html', '/manifest.webmanifest'];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Activate: take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch: handle share target + cache-first for everything else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle Web Share Target POST
  if (request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await request.formData();
          const sharedUrl =
            formData.get('url') || formData.get('text') || '';
          const redirectUrl = '/?shared=' + encodeURIComponent(sharedUrl || '');
          return Response.redirect(redirectUrl, 303);
        } catch (e) {
          // Fallback: just go to home if something fails
          return Response.redirect('/', 303);
        }
      })()
    );
    return;
  }

  // Default: cache-first strategy
  event.respondWith(
    caches.match(request).then((resp) => resp || fetch(request))
  );
});
