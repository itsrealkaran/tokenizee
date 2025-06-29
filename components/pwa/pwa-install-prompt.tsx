"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/lib/notification-service";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toISOString()}: ${info}`]);
    console.log(info);
  };

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsInstalled(isStandalone);
    addDebugInfo(`App is ${isStandalone ? "installed" : "not installed"}`);

    // Register service worker
    const registerSW = async () => {
      const registration = await notificationService.registerServiceWorker();
      if (registration) {
        addDebugInfo("Service worker registered on mount");
      } else {
        addDebugInfo("Failed to register service worker on mount");
      }
    };
    registerSW();

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      addDebugInfo("Install prompt is available");
    });

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      addDebugInfo("App was successfully installed");
    });

    // Check push notification support
    const checkPushSupport = async () => {
      const supported = await notificationService.isPushNotificationSupported();
      setIsPushSupported(supported);
      addDebugInfo(
        `Push notifications are ${supported ? "supported" : "not supported"}`
      );

      if (supported) {
        const enabled = await notificationService.isPushNotificationEnabled();
        setIsPushEnabled(enabled);
        addDebugInfo(
          `Push notifications are ${enabled ? "enabled" : "not enabled"}`
        );
      }
    };

    checkPushSupport();

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    addDebugInfo("Install prompt triggered");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    addDebugInfo(`Install prompt outcome: ${outcome}`);
    if (outcome === "accepted") {
      setIsInstalled(true);
      toast.success("Tokenizee has been installed successfully!");
    }

    setDeferredPrompt(null);
  };

  const handlePushSubscription = async () => {
    try {
      addDebugInfo("Attempting to subscribe to push notifications");

      // First, ensure service worker is registered and activated
      const registration = await notificationService.registerServiceWorker();
      if (!registration) {
        addDebugInfo("Failed to register service worker");
        toast.error("Failed to enable notifications. Please try again.");
        return;
      }

      // Wait for service worker to be active
      if (registration.active) {
        addDebugInfo("Service worker is active");
      } else {
        addDebugInfo("Waiting for service worker to activate...");
        await new Promise<void>((resolve) => {
          if (registration.installing) {
            registration.installing.addEventListener("statechange", () => {
              if (registration.installing?.state === "activated") {
                addDebugInfo("Service worker activated");
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      }

      // Then attempt to subscribe
      const subscription =
        await notificationService.subscribeToPushNotifications();

      if (subscription) {
        setIsPushEnabled(true);
        addDebugInfo("Successfully subscribed to push notifications");
        toast.success("Push notifications have been enabled!");
      } else if (process.env.NODE_ENV === "development") {
        addDebugInfo("Push notifications not available in development mode");
        toast("Push notifications are not available in development mode", {
          icon: "ℹ️",
        });
      } else {
        addDebugInfo("Failed to subscribe to push notifications");
        toast.error("Failed to enable push notifications. Please try again.");
      }
    } catch (error) {
      addDebugInfo(`Failed to subscribe to push notifications: ${error}`);
      if (process.env.NODE_ENV === "development") {
        toast("Push notifications are not available in development mode", {
          icon: "ℹ️",
        });
      } else {
        toast.error("Failed to enable push notifications. Please try again.");
      }
    }
  };

  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-background p-4 rounded-lg shadow-lg border">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Install Tokenizee</h3>
          <p className="text-sm text-muted-foreground">
            Install Tokenizee for a better experience
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {deferredPrompt && (
          <Button onClick={handleInstall} size="sm">
            Install App
          </Button>
        )}
        {isPushSupported && !isPushEnabled && (
          <Button onClick={handlePushSubscription} size="sm" variant="outline">
            Enable Notifications
          </Button>
        )}
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 p-2 bg-muted rounded text-xs max-h-32 overflow-y-auto">
          <h4 className="font-semibold mb-1">Debug Info:</h4>
          {debugInfo.map((info, index) => (
            <div key={index} className="text-muted-foreground">
              {info}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
