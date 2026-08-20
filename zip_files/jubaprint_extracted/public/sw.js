// Service Worker for ARK ERP
// Strictly online pass-through to ensure fresh, real-time data sync with zero local asset caching.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// PASS-THROUGH ONLY: Forces strictly online network operation
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

