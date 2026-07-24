const CACHE = "ebrulife-v1.2.2";
const CORE = [
  "/",
  "/index.html",
  "/app.html",
  "/gorevler.html",
  "/aliskanliklar.html",
  "/hedefler.html",
  "/butce.html",
  "/abonelikler.html",
  "/ozel-gunler.html",
  "/ev-garanti.html",
  "/araclar.html",
  "/notlar.html",
  "/ayarlar.html",
  "/offline.html",
  "/assets/css/life.css",
  "/assets/js/app.js",
  "/assets/js/ads.js",
  "/assets/js/store.js",
  "/assets/js/config.js",
];
self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("ebrulife-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || caches.match("/offline.html")),
      ),
  );
});
