const CACHE_NAME = "tokenizee-v0.9.7";
const urlsToCache = [
  "/",
  "/feed",
  "/profile",
  "/notifications",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response because it can only be used once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event received but no data");
    return;
  }

  try {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      // If JSON parsing fails, try to get text
      data = {
        title: "New Notification",
        body: event.data.text() || "You have a new notification",
        url: "/notifications",
      };
    }

    const options = {
      body: data.body || "You have a new notification",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: data.url || "/notifications",
      },
      actions: [
        {
          action: "open",
          title: "Open",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
      tag: data.tag || "default",
      renotify: true,
    };

    event.waitUntil(
      self.registration
        .showNotification(data.title || "New Notification", options)
        .catch((error) => {
          console.error("Error showing notification:", error);
        })
    );
  } catch (error) {
    console.error("Error handling push event:", error);
    // Show a fallback notification
    event.waitUntil(
      self.registration.showNotification("New Notification", {
        body: "You have a new notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        data: { url: "/notifications" },
      })
    );
  }
});

// Notification click event - handle user interaction with notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url || "/";

      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync event - handle offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }
});

// Function to sync notifications when back online
async function syncNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes("/api/notifications")) {
        await fetch(request);
      }
    }
  } catch (error) {
    console.error("Error syncing notifications:", error);
  }
}
