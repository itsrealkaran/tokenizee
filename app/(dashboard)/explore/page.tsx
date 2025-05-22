"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string;
  content: string;
  attachment?: string;
  createdAt: string;
  likes: number;
  shares: number;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        username: "johndoe",
        displayName: "John Doe",
      },
      title: "Most Liked Post",
      content: "This is a trending post!",
      createdAt: new Date().toISOString(),
      likes: 100,
      shares: 50,
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users, posts, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Trending Posts</h2>
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <PostCard key={post.id} post={post} onViewPost={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}
