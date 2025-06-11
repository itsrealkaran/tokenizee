"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Notification } from "@/lib/ao-client";
import { toast } from "react-hot-toast";
import { getAOClient } from "@/lib/ao-client";
import { NotificationService } from "@/lib/notification-service";
import { useGlobal } from "./global-context";

interface NotificationContextType {
  unreadNotifications: number;
  notifications: Notification[];
  setUnreadNotifications: (count: number) => void;
  getNotifications: () => Promise<{
    notifications: Notification[];
    unreadCount: number;
  }>;
  markNotificationsRead: () => Promise<{ message: string }>;
  initializeNotifications: () => Promise<void>;
  subscribeToNotifications: () => Promise<void>;
  unsubscribeFromNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationService] = useState(() =>
    NotificationService.getInstance()
  );
  const aoClient = getAOClient(process.env.NEXT_PUBLIC_AO_PROCESS_ID || "");
  const { walletAddress } = useGlobal();

  const initializeNotifications = async () => {
    try {
      await notificationService.registerServiceWorker();
      const permission =
        await notificationService.requestNotificationPermission();
      if (permission) {
        await subscribeToNotifications();
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const subscription =
        await notificationService.subscribeToPushNotifications();
      if (subscription) {
        // Here you would typically send the subscription to your backend
        console.log("Successfully subscribed to push notifications");
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const success =
        await notificationService.unsubscribeFromPushNotifications();
      if (success) {
        console.log("Successfully unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
    }
  };

  const getNotifications = async (): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getNotifications(walletAddress);
      setNotifications(response.notifications);
      setUnreadNotifications(response.unreadCount);
      return response;
    } catch (error) {
      console.error("Error getting notifications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get notifications"
      );
      return { notifications: [], unreadCount: 0 };
    }
  };

  const markNotificationsRead = async (): Promise<{ message: string }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.markNotificationsRead(walletAddress);
      setUnreadNotifications(0);
      return response;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read"
      );
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadNotifications,
        notifications,
        setUnreadNotifications,
        getNotifications,
        markNotificationsRead,
        initializeNotifications,
        subscribeToNotifications,
        unsubscribeFromNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
