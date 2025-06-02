"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bolt } from "lucide-react";
import { useGlobal } from "@/context/global-context";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { profileUser } = useGlobal();

  const getTopicName = (path: string) => {
    const topic = path.split("/").pop() || "";
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-2xl mx-auto px-3 sm:px-0 py-3.5 sm:py-4">
        {pathname.startsWith("/feed/") ? (
          <h1 className="text-lg sm:text-xl font-semibold">
            <div className="flex items-center gap-2 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="w-8 h-auto sm:w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {pathname === "/feed/topic" ? (
                <span className="line-clamp-1">Topics</span>
              ) : pathname.startsWith("/feed/topic/") ? (
                <span className="line-clamp-1">#{getTopicName(pathname)}</span>
              ) : (
                <span className="line-clamp-1">Article</span>
              )}
            </div>
          </h1>
        ) : pathname.startsWith("/profile/") ? (
          <h1 className="text-lg sm:text-xl font-semibold">
            <div className="flex items-center gap-2 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className=" w-8 h-auto sm:w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <span className="line-clamp-1">{profileUser?.displayName}</span>
            </div>
          </h1>
        ) : pathname === "/feed" ? (
          <h1 className="pl-4 text-lg sm:text-xl font-semibold flex items-center">
            <div className="flex items-center gap-1 block sm:hidden">
              <Bolt className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-primary">Tokenizee</span>
            </div>
            <span className="line-clamp-1 hidden sm:block">Feed</span>
          </h1>
        ) : (
          (() => {
            const lastSegment = pathname?.split("/").pop() || "";
            return (
              <h1 className="pl-4 text-lg sm:text-xl font-semibold">
                <span className="line-clamp-1">
                  {lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) ||
                    "Dashboard"}
                </span>
              </h1>
            );
          })()
        )}
      </div>
    </div>
  );
}
