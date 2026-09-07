const CACHE_NAME = 'pulse-shell-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/pulse-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'Pulse update', {
    body: data.body || 'Your circle has a new update.',
    icon: '/pulse-icon.svg',
    badge: '/pulse-icon.svg',
    tag: data.notificationId || 'pulse-update',
    data: { url: '/', notificationId: data.notificationId },
    actions: [{ action: 'open', title: 'Open Pulse' }],
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => 'focus' in client);
    if (existing) return existing.focus();
    return clients.openWindow(event.notification.data?.url || '/');
  }));
});
