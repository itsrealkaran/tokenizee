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
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "follow":
      return (
        <div className="flex p-1 bg-blue-500/10 rounded-full">
          <UserPlus2 className="h-4 w-4 text-blue-500 fill-blue-500/20" />
        </div>
      );
    case "comment":
      return (
        <div className="flex p-1 bg-green-500/10 rounded-full">
          <MessageCircle className="h-4 w-4 text-green-500 fill-green-500/20" />
        </div>
      );
    case "upvote":
      return (
        <div className="flex p-1 bg-purple-500/10 rounded-full">
          <ArrowBigUp className="h-5 w-5 text-purple-500 fill-purple-500/20" />
        </div>
      );
    case "downvote":
      return (
        <div className="flex p-1 bg-red-500/10 rounded-full">
          <ArrowBigDown className="h-5 w-5 text-red-500 fill-red-500/20" />
        </div>
      );
    case "share":
      return (
        <div className="flex p-1 bg-orange-500/10 rounded-full">
          <Share2 className="h-4 w-4 text-orange-500 fill-orange-500/20" />
        </div>
      );
    default:
      return (
        <div className="flex p-1 bg-muted-500/10 rounded-full">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      );
  }
};

export default function NotificationsPage() {
  const { getNotifications, markNotificationsRead } = useGlobal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleMarkSingleAsRead = async () => {
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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl -m-4">
      {notifications.length > 0 && (
        <div
          className={cn(
            "flex justify-end transition-all duration-300",
            notifications.every((n) => n.read)
              ? "opacity-0 h-0 overflow-hidden"
              : "opacity-100 h-auto"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkSingleAsRead}
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Mark all as read
          </Button>
        </div>
      )}

      <div role="list" className="space-y-1">
        {notifications.length === 0 ? (
          <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center space-y-3 sm:space-y-4 text-muted-foreground px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
              <Bell className="h-12 w-12 sm:h-16 sm:w-16 relative z-10" />
            </div>
            <p className="text-lg sm:text-xl font-medium">
              No notifications yet
            </p>
            <p className="text-xs sm:text-sm text-center max-w-[280px] sm:max-w-sm">
              When you get notifications about follows, comments, or
              interactions, they&apos;ll show up here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              role="listitem"
              className={cn(
                "group cursor-pointer relative border-b transition-all duration-200 hover:bg-muted/50 flex items-stretch overflow-hidden",
                notification.read
                  ? "bg-background"
                  : "bg-primary/5 border-l-4 border-primary"
              )}
              onClick={async () => {
                if (!notification.read) {
                  await handleMarkSingleAsRead();
                }
                if (notification.post) {
                  router.push(`/feed/${notification.post.id}`);
                } else if (notification?.actor?.username) {
                  router.push(`/profile/${notification.actor.username}`);
                }
              }}
              tabIndex={0}
              aria-label={
                notification.post
                  ? `View post: ${notification.post.title}`
                  : notification?.actor?.displayName
                    ? `View profile: ${notification.actor.displayName}`
                    : "View notification"
              }
            >
              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 w-full">
                <div className="flex items-center relative gap-2">
                  <Avatar
                    displayName={notification.actor?.displayName || ""}
                    profileImageUrl={notification.actor?.profileImageUrl}
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                  />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background text-[10px] text-primary-foreground flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap items-baseline gap-1">
                          {notification.actor && (
                            <Link
                              href={`/profile/${notification.actor.username}`}
                              className="text-sm sm:text-base font-medium hover:underline truncate text-foreground"
                              tabIndex={-1}
                            >
                              {notification.actor.displayName}
                            </Link>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                        {notification.data.message}
                      </p>
                      {notification.post && (
                        <Link
                          href={`/feed/${notification.post.id}`}
                          className="ml-1 text-xs sm:text-sm font-medium text-muted-foreground truncate"
                          tabIndex={-1}
                        >
                          {notification.post.title}
                        </Link>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary shrink-0 mt-2 animate-pulse" />
                    )}
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
