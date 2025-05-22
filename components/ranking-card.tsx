"use client";

import { User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";

export function RankingList() {
  const router = useRouter();
  const { topCreators } = useGlobal();

  const handleViewAll = () => {
    router.push("/explore?tab=creators");
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Top Creators</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
      <div className="px-2 pb-4">
        {topCreators.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted">
              <span className="text-sm font-bold text-muted-foreground">
                #{user.position}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
