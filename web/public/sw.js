const VERSION = "mt-sw-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const PRIVATE_PREFIXES = ["/api/", "/makteb", "/compte", "/checkout", "/panier", "/auth"];

// @ts-ignore
function isPrivate(pathname) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

self.addEventListener("install", (event) => {
  // @ts-ignore
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      await cache.addAll(["/", "/offline"]).catch(() => {
      });
      // @ts-ignore
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  // @ts-ignore
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE)
          .map((k) => caches.delete(k)),
      );
      // @ts-ignore
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  // @ts-ignore
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url.pathname)) return;

  if (req.headers.get("RSC") === "1" || req.headers.has("next-router-prefetch")) {
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    // @ts-ignore
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (
    /\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf|otf|css|js|json|webmanifest)$/i.test(
      url.pathname,
    )
  ) {
    // @ts-ignore
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  if (req.mode === "navigate") {
    // @ts-ignore
    event.respondWith(networkFirstNavigation(req));
    return;
  }
});

// @ts-ignore
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

// @ts-ignore
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || fetchPromise;
}

// @ts-ignore
async function networkFirstNavigation(req) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const shell = await cache.match("/");
    if (shell) return shell;
    const offline = await cache.match("/offline");
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("message", (event) => {
  // @ts-ignore
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
