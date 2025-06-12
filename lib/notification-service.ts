export class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private vapidPublicKey: string;

  private constructor() {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) {
      throw new Error("VAPID Public Key is not set in environment variables");
    }
    this.vapidPublicKey = key;
    console.log("VAPID Public Key from env:", this.vapidPublicKey);
    
    if (!this.vapidPublicKey.startsWith('BL')) {
      console.error("VAPID Public Key format is incorrect. Should start with 'BL'");
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      console.log("Converting VAPID key to Uint8Array");
      console.log("Input base64 string:", base64String);
      
      // Remove any whitespace and ensure proper base64url format
      const base64 = base64String.trim()
        .replace(/\s/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Add padding if needed
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const paddedBase64 = base64 + padding;

      console.log("Padded base64:", paddedBase64);
      
      // Convert base64 to binary string
      const binaryString = window.atob(paddedBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      // Convert binary string to Uint8Array
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log("Output Uint8Array length:", bytes.length);
      return bytes;
    } catch (error: unknown) {
      console.error("Error converting VAPID key:", error);
      // Try alternative conversion method
      try {
        const base64 = base64String.trim()
          .replace(/\s/g, '')
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        const padding = '='.repeat((4 - base64.length % 4) % 4);
        const paddedBase64 = base64 + padding;
        
        const binaryString = window.atob(paddedBase64);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log("Alternative conversion successful");
        return bytes;
      } catch (fallbackError) {
        console.error("Fallback conversion failed:", fallbackError);
        throw new Error(`Failed to convert VAPID key: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!("serviceWorker" in navigator)) {
        console.log("Service Worker not supported");
        return null;
      }

      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      this.swRegistration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Wait for the service worker to be activated
      if (this.swRegistration.installing) {
        await new Promise<void>((resolve) => {
          const worker = this.swRegistration!.installing!;
          worker.addEventListener("statechange", () => {
            if (worker.state === "activated") {
              resolve();
            }
          });
        });
      }

      console.log("Service Worker registered and activated:", this.swRegistration);
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

      if (!this.vapidPublicKey) {
        throw new Error("VAPID public key is not set in environment variables");
      }

      // Ensure service worker is active
      if (this.swRegistration.active) {
        console.log("Service Worker is active");
      } else {
        console.log("Waiting for Service Worker to activate...");
        await new Promise<void>((resolve) => {
          if (this.swRegistration!.installing) {
            this.swRegistration!.installing.addEventListener("statechange", () => {
              if (this.swRegistration!.installing?.state === "activated") {
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      }

      const permission = await this.requestNotificationPermission();
      if (!permission) {
        console.log("Notification permission denied");
        return null;
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      console.log("Application Server Key length:", applicationServerKey.length);

      // Check for existing subscription
      let subscription = await this.swRegistration.pushManager.getSubscription();
      console.log("Existing subscription:", subscription);
      
      if (subscription) {
        // If there's an existing subscription, unsubscribe first
        console.log("Unsubscribing from existing subscription");
        await subscription.unsubscribe();
        subscription = null;
      }

      // Check if push service is available
      const pushManager = this.swRegistration.pushManager;
      const subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey,
      };

      // Check if push service is available
      const pushServiceAvailable = await pushManager.getSubscription()
        .then(sub => {
          if (sub) {
            return true;
          }
          // Try to subscribe with a minimal key to test availability
          return pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array(65)
          }).then(() => true)
            .catch(() => false);
        })
        .catch(() => false);

      if (!pushServiceAvailable) {
        console.log("Push service is not available");
        if (process.env.NODE_ENV === "development") {
          console.log("Running in development mode - push service may not be available");
          return null;
        }
        throw new Error("Push service is not available");
      }

      // Get the push subscription with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempting to subscribe (attempt ${retryCount + 1}/${maxRetries})`);
          subscription = await pushManager.subscribe(subscriptionOptions);
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          console.log(`Subscription attempt ${retryCount} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      this.pushSubscription = subscription;
      console.log("Push subscription successful:", subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
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