importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC7WQ3ga-rsGwb4NNGBbnlFyc9iVQqw7Nk',
  authDomain: 'achados-e-perdidos-5ba1d.firebaseapp.com',
  projectId: 'achados-e-perdidos-5ba1d',
  storageBucket: 'achados-e-perdidos-5ba1d.firebasestorage.app',
  messagingSenderId: '527787767885',
  appId: '1:527787767885:web:bccacfd1b3ce4b41cd8404'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Nova mensagem — Encontrei';
  const options = {
    body: payload.data?.body || 'Você recebeu uma mensagem sobre um item.',
    data: { url: payload.data?.url || '/Achados/' },
    tag: payload.data?.tag || 'achados-nova-mensagem'
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = event.notification.data?.url || '/Achados/';
  const url = new URL(path, self.location.origin).href;
  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if (client.url.startsWith(self.location.origin + '/Achados/') && 'focus' in client) {
        await client.focus();
        client.navigate(url);
        return;
      }
    }
    await clients.openWindow(url);
  })());
});
