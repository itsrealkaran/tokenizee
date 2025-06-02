"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/global-context";
import { Notification } from "@/lib/ao-client";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Loader2,
  MessageCircle,
  Share2,
  ArrowBigUp,
  ArrowBigDown,
  UserPlus2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "follow":
      return <UserPlus2 className="h-4 w-4 text-blue-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case "upvote":
      return <ArrowBigUp className="h-4 w-4 text-purple-500" />;
    case "downvote":
      return <ArrowBigDown className="h-4 w-4 text-red-500" />;
    case "share":
      return <Share2 className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  const { getNotifications, markNotificationsRead } = useGlobal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markNotificationsRead();
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl -m-4">
        {notifications.length > 0 && (
          <div 
            className={cn(
              "flex justify-end transition-all duration-300",
              notifications.every(n => n.read) ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Mark all as read
            </Button>
          </div>
        )}

      <div className="divide-y">
        {notifications.length === 0 ? (
          <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center space-y-4 text-muted-foreground px-4">
            <Bell className="h-12 w-12" />
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm text-center">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "group relative transition-colors hover:bg-muted/50",
                notification.read ? "bg-background" : "bg-primary/5"
              )}
            >
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.actor && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-background">
                        <span className="text-sm font-medium">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap items-baseline gap-1">
                            {notification.actor && (
                              <Link
                                href={`/profile/${notification.actor.username}`}
                                className="font-medium hover:underline truncate"
                              >
                                {notification.actor.displayName}
                              </Link>
                            )}
                            <p className="text-sm text-muted-foreground truncate">
                              {notification.data.message}
                              {notification.post && (
                                <Link
                                  href={`/feed/post/${notification.post.id}`}
                                  className="ml-1 font-medium text-primary hover:underline truncate"
                                >
                                  {notification.post.title}
                                </Link>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
