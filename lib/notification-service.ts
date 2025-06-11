export class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!("serviceWorker" in navigator)) {
        console.log("Service Worker not supported");
        return null;
      }

      this.swRegistration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", this.swRegistration);
      return this.swRegistration;
    } catch (error) {
      console.error("Error registering service worker:", error);
      return null;
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        console.log("Service Worker not registered");
        return null;
      }

      const permission = await this.requestNotificationPermission();
      if (!permission) {
        console.log("Notification permission denied");
        return null;
      }

      // Get the push subscription
      this.pushSubscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      console.log("Push subscription:", this.pushSubscription);
      return this.pushSubscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }

  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      if (!this.pushSubscription) {
        console.log("No push subscription found");
        return false;
      }

      await this.pushSubscription.unsubscribe();
      this.pushSubscription = null;
      console.log("Unsubscribed from push notifications");
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }

  public async sendNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    try {
      if (!this.swRegistration) {
        console.log("Service Worker not registered");
        return;
      }

      await this.swRegistration.showNotification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        ...options,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  public async isPushNotificationSupported(): Promise<boolean> {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  public async isPushNotificationEnabled(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    return Notification.permission === "granted";
  }

  public async getPushSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        console.log("Service Worker not registered");
        return null;
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error("Error getting push subscription:", error);
      return null;
    }
  }

  public async updatePushSubscription(): Promise<PushSubscription | null> {
    try {
      const currentSubscription = await this.getPushSubscription();
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
      }
      return await this.subscribeToPushNotifications();
    } catch (error) {
      console.error("Error updating push subscription:", error);
      return null;
    }
  }

  public async sendTestNotification(): Promise<void> {
    try {
      if (!this.swRegistration) {
        console.log("Service Worker not registered");
        return;
      }

      await this.swRegistration.showNotification("Test Notification", {
        body: "This is a test notification to verify push notifications are working.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        data: {
          url: "/",
        },
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 