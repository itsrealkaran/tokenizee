"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobal } from "@/context/global-context";
import { Sidebar } from "@/components/sidebar";
import { RankingList } from "@/components/ranking-card";

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
      <div className="max-w-[1400px] mx-auto">
        <div className="flex h-screen">
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <main className="max-w-2xl mx-auto p-4">{children}</main>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-4 hidden lg:block">
            <div className="sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Updates</h2>
              <RankingList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
