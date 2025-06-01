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
  const {
    feedPosts,
    trendingPosts,
    getPersonalizedFeed,
    getBookmarkedFeed,
    walletAddress,
  } = useGlobal();
  const [loading, setLoading] = useState<Record<FeedType, boolean>>({
    top: false,
    "for-you": false,
    bookmarked: false,
  });
  const [activeFeed, setActiveFeed] = useState<FeedType>("top");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading((prev) => ({ ...prev, [activeFeed]: true }));
        switch (activeFeed) {
          case "top":
            // Use trending posts for top stories
            setFilteredPosts(feedPosts);
            setFeaturedPosts(trendingPosts.slice(0, 5));
            break;
          case "for-you":
            if (walletAddress) {
              const personalizedPosts = await getPersonalizedFeed();
              setFilteredPosts(personalizedPosts);
              setFeaturedPosts([]);
            }
            break;
          case "bookmarked":
            if (walletAddress) {
              const bookmarkedPosts = await getBookmarkedFeed();
              setFilteredPosts(bookmarkedPosts);
              setFeaturedPosts([]);
            }
            break;
        }
      } catch (error) {
        console.error("Error loading feed:", error);
      } finally {
        setLoading((prev) => ({ ...prev, [activeFeed]: false }));
      }
    };

    loadFeed();
  }, [
    activeFeed,
    trendingPosts,
    getPersonalizedFeed,
    getBookmarkedFeed,
    walletAddress,
  ]);

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
                  "pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2 whitespace-nowrap",
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
          <div className="py-4">
            <FeaturedPosts posts={featuredPosts} />
          </div>
        )}

        {/* Regular Posts */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {loading[activeFeed] ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
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
