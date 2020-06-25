const CACHE_NAME = "mb-cache-V2";
const urlsToCache = [
  "/",
  "/dist/img/icons/favicon-16x16.png",
  "/dist/img/icons/favicon-32x32.png",
  "/dist/img/icons/iconfinder_walletmoneyshoppingatmcard_128.png",
  "/dist/img/icons/iconfinder_walletmoneyshoppingatmcard_192.png",
  "/dist/img/icons/iconfinder_walletmoneyshoppingatmcard_256.png",
  "/dist/img/icons/iconfinder_walletmoneyshoppingatmcard_512.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("An error occurred: " + err);
      })
  );
  console.log("MyBankSW installed");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!CACHE_NAME.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  console.log("MyBankSW " + event.request.url);
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
