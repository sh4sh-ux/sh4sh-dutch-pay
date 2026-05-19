const CACHE_NAME = "dutch-pay-v2-82-expense-entry-simplify";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.filter(Boolean)))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("dutch-pay") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const isPageRequest = request.mode === "navigate" || request.destination === "document";

  if (isPageRequest) {
    event.respondWith(
      fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
