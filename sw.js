'use strict';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.indexOf('ets-') === 0).map(key => caches.delete(key)));
    const registration = await self.registration.unregister();
    const clientsList = await self.clients.matchAll({ type: 'window' });
    clientsList.forEach(client => client.navigate(client.url));
    return registration;
  })());
});
