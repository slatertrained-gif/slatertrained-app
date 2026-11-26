/* The Tradie Transformation: offline cache. Build 6.1 (Archivo fonts). */
const CACHE = 'tt-v6-2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const LIBS = /^https:\/\/(unpkg\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  // The app page: try the network first so updates show up, fall back to the saved copy offline.
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; }).catch(() => caches.match('./index.html'))); return; }
  // Own files, fonts and the barcode scanner library: saved copy first, refreshed in the background.
  if (url.origin === location.origin || LIBS.test(r.url)) { e.respondWith(caches.match(r).then(hit => { const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => hit); return hit || net; })); return; }
  // Everything else (the UK food database) goes straight to the network.
});
