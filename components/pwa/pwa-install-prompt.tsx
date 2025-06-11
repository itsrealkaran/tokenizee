"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/lib/notification-service";
import toast from "react-hot-toast";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

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

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
      const subscription =
        await notificationService.subscribeToPushNotifications();
      if (subscription) {
        setIsPushEnabled(true);
        addDebugInfo("Successfully subscribed to push notifications");
        toast.success("Push notifications have been enabled!");
      }
    } catch (error) {
      addDebugInfo(`Failed to subscribe to push notifications: ${error}`);
      toast.error("Failed to enable push notifications. Please try again.");
    }
  };

  if (isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-background p-4 rounded-lg shadow-lg border">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Install Tokenizee</h3>
        <p className="text-sm text-muted-foreground">
          Install Tokenizee for a better experience
        </p>
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
