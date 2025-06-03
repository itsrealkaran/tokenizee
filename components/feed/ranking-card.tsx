"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";

const RANKING_LIMIT = 5;

export function RankingList() {
  const router = useRouter();
  const { topCreators } = useGlobal();

  const handleViewAll = () => {
    router.push("/explore?tab=creators");
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-medium">Top Creators</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
      <div className="px-1.5 py-2">
        {topCreators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No creators found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Be the first to join!
            </p>
          </div>
        ) : (
          topCreators.slice(0, RANKING_LIMIT).map((entry, index) => (
            <div
              key={entry.user.username}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 transition-colors group cursor-pointer rounded-md"
              onClick={() => router.push(`/profile/${entry.user.username}`)}
            >
              <div className="flex items-center justify-center w-5 h-5">
                <span className="text-xs font-medium text-muted-foreground">
                  #{index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {entry.user.displayName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {entry.user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{entry.user.username}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
