"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/feed/post-card";
import { useGlobal } from "@/context/global-context";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Post, User, Comment } from "@/lib/ao-client";

type TabType = "trending" | "creators" | "search";
type SearchTabType = "all" | "users" | "posts" | "comments";

export default function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("trending");
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    posts: Post[];
    comments: Comment[];
  }>({ users: [], posts: [], comments: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTabType>("all");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { trendingPosts, topCreators, search } = useGlobal();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "creators") {
      setActiveTab("creators");
    } else if (tab === "search") {
      setActiveTab("search");
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        if (!searchQuery.trim()) {
          setActiveTab("trending");
          setSearchResults({ users: [], posts: [], comments: [] });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveTab("trending");
      setSearchResults({ users: [], posts: [], comments: [] });
      return;
    }

    setIsSearching(true);
    try {
      const results = await search(searchQuery, activeSearchTab);
      setSearchResults(results.results);
      setActiveTab("search");
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveTab("trending");
      setSearchResults({ users: [], posts: [], comments: [] });
    }
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    if (!searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mb-4" />
          <p>Enter a search term to find users, posts, and comments</p>
        </div>
      );
    }

    const hasResults =
      searchResults.users.length > 0 ||
      searchResults.posts.length > 0 ||
      searchResults.comments.length > 0;

    if (!hasResults) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>No results found for &quot;{searchQuery}&quot;</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activeSearchTab === "all" || activeSearchTab === "users"
          ? searchResults.users.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Users
                </h3>
                {searchResults.users.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center cursor-pointer justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/profile/${user.username}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {user.displayName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">
                          {user.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          : null}

        {activeSearchTab === "all" || activeSearchTab === "posts"
          ? searchResults.posts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Posts
                </h3>
                {searchResults.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewPost={() => router.push(`/feed/${post.id}`)}
                  />
                ))}
              </div>
            )
          : null}

        {activeSearchTab === "all" || activeSearchTab === "comments"
          ? searchResults.comments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Comments
                </h3>
                {searchResults.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/feed/${comment.postId}`)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">
                        {comment.author.displayName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        @{comment.author.username}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )
          : null}
      </div>
    );
  };

  const renderTabs = () => {
    if (activeTab === "search") {
      return (
        <div className="border-b">
          <nav className="flex space-x-4 sm:space-x-8" aria-label="Search Tabs">
            {(["all", "users", "posts", "comments"] as SearchTabType[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSearchTab(tab)}
                  className={cn(
                    "py-2.5 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap",
                    activeSearchTab === tab
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </nav>
        </div>
      );
    }

    return (
      <div className="border-b">
        <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("trending")}
            className={cn(
              "py-2.5 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap",
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
              "py-2.5 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap",
              activeTab === "creators"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            Top Creators
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-none space-y-2 pb-2 sm:pb-4">
        <div ref={searchContainerRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute z-10 left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <Input
              type="text"
              placeholder="Search users, posts, or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
            />
          </form>
        </div>

        {renderTabs()}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        {activeTab === "trending" ? (
          <div className="space-y-3 sm:space-y-4">
            {trendingPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onViewPost={() => router.push(`/feed/${post.id}`)}
              />
            ))}
          </div>
        ) : activeTab === "creators" ? (
          <div className="space-y-3 sm:space-y-4">
            {topCreators.map((creator, index) => (
              <div
                key={creator.user.username}
                className="flex items-center cursor-pointer justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/profile/${creator.user.username}`)}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-medium text-primary">
                      {creator.user.displayName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base line-clamp-1">
                      {creator.user.displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      @{creator.user.username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base sm:text-lg text-muted-foreground">
                    #{index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderSearchResults()
        )}
      </div>
    </div>
  );
}
