/* UK BSL Learn — app-shell offline cache.
   External SignBSL / YouTube / NDCS videos are NOT cached. */
var CACHE = "bsl-learn-shell-v4";
var SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./assets/app.js",
  "./assets/bsl-data.js",
  "./assets/media/demo-loop.mp4"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
