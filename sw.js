// Offline cache: the app works without internet once it has been opened once.
const CACHE = "gym-1793396321";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "cards/card-fri.png",
  "cards/card-locked.png",
  "cards/card-mon.png",
  "cards/card-sat.png",
  "cards/card-tue.png",
  "cards/card-wed.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// serve from cache right away, refresh the cache in the background (also caches the Google fonts)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => {
      if (r.ok || r.type === "opaque") c.put(e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
