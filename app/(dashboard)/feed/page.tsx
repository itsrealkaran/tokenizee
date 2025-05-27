"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";
import { FeaturedPosts } from "@/components/featured-posts";
import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";
import { Loader2, Bookmark, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/lib/ao-client";

type FeedType = "top" | "for-you" | "bookmarked";

export default function DashboardPage() {
  const router = useRouter();
  const { feedPosts } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState<FeedType>("top");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);

  useEffect(() => {
    // TODO: Fetch posts from Lua table
    setLoading(false);
  }, []);

  useEffect(() => {
    // Filter posts based on active feed type
    switch (activeFeed) {
      case "top":
        // Sort by upvotes + shares
        const sortedPosts = [...feedPosts].sort(
          (a, b) => b.upvotes + b.shares - (a.upvotes + a.shares)
        );
        setFilteredPosts(sortedPosts);
        // Set top 3 posts as featured
        setFeaturedPosts(sortedPosts.slice(0, 3));
        break;
      case "for-you":
        // TODO: Implement personalized feed algorithm
        setFilteredPosts(feedPosts);
        setFeaturedPosts([]);
        break;
      case "bookmarked":
        // TODO: Implement bookmarked posts filtering
        setFilteredPosts(feedPosts);
        setFeaturedPosts([]);
        break;
    }
  }, [activeFeed, feedPosts]);

  const handleViewPost = (postId: string) => {
    router.push(`/feed/${postId}`);
  };

  const feedTypes: { id: FeedType; label: string; icon: React.ReactNode }[] = [
    {
      id: "top",
      label: "Top Stories",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    { id: "for-you", label: "For You", icon: <Sparkles className="h-4 w-4" /> },
    {
      id: "bookmarked",
      label: "Bookmarked",
      icon: <Bookmark className="h-4 w-4" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-none">
        <div className="border-b">
          <nav className="flex space-x-6 px-4 sm:px-6" aria-label="Tabs">
            {feedTypes.map((feed) => (
              <button
                key={feed.id}
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2 whitespace-nowrap",
                  activeFeed === feed.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                {feed.icon}
                <span>{feed.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Featured Posts Carousel */}
        {activeFeed === "top" && featuredPosts.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <FeaturedPosts posts={featuredPosts} />
          </div>
        )}

        {/* Regular Posts */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <div className="flex flex-col items-center gap-3">
                {activeFeed === "bookmarked" ? (
                  <Bookmark className="h-8 w-8 text-muted-foreground/50" />
                ) : activeFeed === "for-you" ? (
                  <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                )}
                <p className="text-muted-foreground text-sm sm:text-base">
                  {activeFeed === "bookmarked"
                    ? "No bookmarked posts yet"
                    : activeFeed === "for-you"
                      ? "No personalized posts yet"
                      : "No posts yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onViewPost={() => handleViewPost(post.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
