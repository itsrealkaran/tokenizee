"use client";

import { usePathname, useRouter } from "next/navigation";
import { Compass, User2, Bell, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobal } from "@/context/global-context";
import { useNotifications } from "@/context/notification-context";
import { useEffect } from "react";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useGlobal();
  const { unreadNotifications, getNotifications } = useNotifications();

  useEffect(() => {
    const fetchNotifications = async () => {
      await getNotifications();
    };
    fetchNotifications();
  }, [getNotifications]);

  const navItems = [
    {
      name: "Feed",
      href: "/feed",
      icon: LayoutDashboard,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User2,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.name === "Profile"
              ? pathname.includes(`/profile/${user?.username}`)
              : pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "relative flex w-full flex-col items-center justify-center gap-1 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
