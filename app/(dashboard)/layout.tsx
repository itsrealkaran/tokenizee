"use client";

import { Home, Search, User, PlusCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PostModal } from "@/components/modals/post-modal";
import { useGlobal } from "@/context/global-context";

const navigation = [
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, logout } = useGlobal();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-border p-4">
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Tokenizee</h1>
            </div>

            <nav className="space-y-2 flex-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4">
              <Button
                className="w-full gap-2"
                onClick={() => setIsPostModalOpen(true)}
              >
                <PlusCircle className="w-5 h-5" />
                Tokenizee
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-2xl mx-auto p-4">{children}</main>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border p-4 hidden lg:block">
          <div className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Trending</h2>
            {/* Add trending content here */}
          </div>
        </div>
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={() => {
          // Handle post submission
          setIsPostModalOpen(false);
        }}
      />
    </div>
  );
}
