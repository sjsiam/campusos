// Service worker for push (CO-26). FCM delivers the webpush payload sent by app/api/cron/notify;
// we show it ourselves instead of loading the Firebase SDK here.
self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { /* not JSON: ignore */ }
  const n = d.notification || d.data || {};
  if (!n.title) return;
  const link = (d.fcmOptions && d.fcmOptions.link) || (d.data && d.data.link) || "/today";
  event.waitUntil(self.registration.showNotification(n.title, { body: n.body, tag: n.tag, icon: "/icons/icon-192.png", data: { link } }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/today", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => c.url.startsWith(self.location.origin));
    return open ? open.navigate(url).then((c) => c && c.focus()) : clients.openWindow(url);
  }));
});
