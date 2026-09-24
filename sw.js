/* 离线缓存 + 更新策略
   页面、样式、脚本走「网络优先」：有网就用最新的，没网才用缓存。
   这样以后更新程序，手机上打开一次就是新版；离线也照常能用。 */
const CACHE = "my-timetable-v4";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
];
const NETWORK_FIRST = /\.(html|js|css|webmanifest)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // 逐个缓存：某一个失败也不会连累其它文件（否则离线会整页打不开）
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch (err) {
    return;
  }
  if (url.origin !== location.origin) return;

  const isDocument = request.mode === "navigate" || NETWORK_FIRST.test(url.pathname);

  if (isDocument) {
    // 网络优先：拿不到再退回缓存（离线可用）
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => null);
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match("./index.html"))
            .then((hit) => hit || caches.match("./"))
        )
    );
    return;
  }

  // 图片等静态资源：缓存优先
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => null);
            return response;
          })
          .catch(() => caches.match("./index.html"))
    )
  );
});
