// Minimal placeholder service worker for local dev/runtime fetch compatibility.
// We intentionally keep this no-op to avoid changing app behavior.
self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // no-op
});
