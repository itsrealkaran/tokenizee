"use client";

import {
  LayoutDashboard,
  Compass as Search,
  User2 as User,
  LogOut,
  Bolt,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PostModal } from "@/components/modals/post-modal";
import { useGlobal } from "@/context/global-context";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

export function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn, user, logout, topic, getNotifications } = useGlobal();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ unreadCount: number }>({
    unreadCount: 0,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await getNotifications();
      setNotifications(result);
    };
    fetchNotifications();
  }, [getNotifications]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const navigation = [
    { name: "Feed", href: "/feed", icon: LayoutDashboard },
    { name: "Explore", href: "/explore", icon: Search },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge:
        notifications.unreadCount > 0 ? notifications.unreadCount : undefined,
    },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="w-72 border-r border-border h-screen flex flex-col">
      <div className="p-4 flex items-center gap-1">
        <Bolt className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Tokenizee</h1>
      </div>

      <nav className="px-2 flex-1">
        {navigation.map((item) => {
          const isActive =
            item.name === "Profile"
              ? pathname.includes(`/profile/${user.username}`)
              : pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 group",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-lg">{item.name}</span>
            </Link>
          );
        })}

        {/* Topics Navigation */}
        <div className="mt-4">
          <div className="border-t border-border mb-4" />
          <div className="px-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Topics
          </div>
          <ul className="flex flex-col gap-1 px-2">
            {/* TODO: show only 5 topics */}
            {topic.slice(0, 3).map((topic) => {
              const topicPath = `/feed/topic/${topic.toLowerCase()}`;
              const isActive = pathname === topicPath;
              return (
                <li key={topic}>
                  <Link
                    href={topicPath}
                    className={cn(
                      "flex items-center gap-2 pl-6 pr-3 py-2 rounded-md text-sm font-medium transition-all border-l-4 border-transparent",
                      isActive
                        ? "bg-primary/10 border-primary text-primary"
                        : "hover:bg-muted/70 hover:border-primary/50 hover:text-primary text-muted-foreground"
                    )}
                  >
                    <span className="font-bold text-base">#</span>
                    <span>{topic}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={"/feed/topic"}
                className={cn(
                  "flex items-center gap-2 pl-6 pr-3 py-2 rounded-md text-sm font-medium transition-all border-l-4 border-transparent",
                  pathname === "/feed/topic"
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-muted/70 hover:border-primary/50 hover:text-primary text-muted-foreground"
                )}
              >
                <span>Explore Topics</span>
                <span className="font-bold text-base">{` >>`}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-4 space-y-6">
        <Button
          size="lg"
          className="w-full h-14 gap-2 bg-primary hover:bg-primary/90 text-lg font-bold rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => setIsPostModalOpen(true)}
        >
          Tokenize
        </Button>

        <div className="flex items-center justify-between p-3 rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {user.displayName[0]}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold truncate max-w-[120px]">
                {user.displayName}
              </span>
              {/* <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                @{user.username}
              </span> */}
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => {
                  const address = user.wallet;
                  navigator.clipboard.writeText(address);
                  toast.success("Address Copied");
                }}
              >
                {`${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <div className="p-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive dark:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </DropdownMenu>
        </div>
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
}
