importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

firebase.initializeApp({
  // Use aqui a mesma firebaseConfig do index.html
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Nova mensagem';
  const options = {
    body: payload.data?.body || 'Você recebeu uma mensagem sobre um item.',
    data: { url: payload.data?.url || '/Achados/' }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/Achados/';
  event.waitUntil(clients.openWindow(url));
});

