"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobal } from "@/context/global-context";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useGlobal();

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
        <Sidebar />

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
    </div>
  );
}
