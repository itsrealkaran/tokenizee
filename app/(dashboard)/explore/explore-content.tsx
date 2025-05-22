"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "creators">(
    "trending"
  );
  const { trendingPosts, topCreators } = useGlobal();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "creators") {
      setActiveTab("creators");
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="space-y-2">
      <div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users, posts, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("trending")}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "trending"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Trending Posts
          </button>
          <button
            onClick={() => setActiveTab("creators")}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "creators"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Top Creators
          </button>
        </nav>
      </div>

      {activeTab === "trending" ? (
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <PostCard key={post.id} post={post} onViewPost={() => {}} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {topCreators.map((creator) => (
            <div
              key={creator.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {creator.name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{creator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{creator.username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">#{creator.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
