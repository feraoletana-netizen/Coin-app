// Reward Game Service Worker

const CACHE = "reward-game-v4";
const offlineFallbackPage = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Always get the latest HTML from GitHub Pages
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() =>
          caches.open(CACHE).then((cache) =>
            cache.match(offlineFallbackPage)
          )
        )
    );
  }
});
