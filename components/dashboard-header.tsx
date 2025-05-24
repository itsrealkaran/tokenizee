"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGlobal } from "@/context/global-context";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { profileUser } = useGlobal();

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-semibold">
          {pathname.startsWith("/feed/") ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>Article</span>
            </div>
          ) : pathname.startsWith("/profile/") ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>{profileUser?.displayName}</span>
            </div>
          ) : (
            (() => {
              const lastSegment = pathname?.split("/").pop() || "";
              return (
                lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) ||
                "Dashboard"
              );
            })()
          )}
        </h1>
      </div>
    </div>
  );
}
