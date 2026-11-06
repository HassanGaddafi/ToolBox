// Service worker: يخزّن هيكل التطبيق للعمل بدون إنترنت. الشبكة أولًا (دائمًا أحدث نسخة) والكاش عند الانقطاع.
const V = "toolbox-v1";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  // لا نتدخل في الطلبات الخارجية (أيقونات المواقع، الـ Worker) ولا في POST
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); }
        return res;
      })
      .catch(() =>
        caches.match(r, { ignoreSearch: true }).then(m =>
          m || (r.mode === "navigate" ? caches.match("index.html") : Response.error())
        )
      )
  );
});
