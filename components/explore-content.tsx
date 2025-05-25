"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/ao-client";

export default function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "creators">(
    "trending"
  );
  const { trendingPosts, topCreators } = useGlobal();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-none space-y-2 pb-4">
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
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
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
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
              )}
            >
              Top Creators
            </button>
          </nav>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === "trending" ? (
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onViewPost={() => router.push(`/feed/${post.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topCreators.map((creator, index) => (
              <div
                key={creator.username}
                className="flex items-center cursor-pointer justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/profile/${creator.username}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {creator.displayName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{creator.displayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{creator.username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    {creator.score} pts
                  </p>
                  <p className="text-sm text-muted-foreground">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
