"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch posts from Lua table
    // For now, using dummy data
    setPosts([
      {
        id: "1",
        author: {
          username: "johndoe",
          displayName: "John Doe",
        },
        title: "Welcome to Tokenizee",
        content: "This is the first post on Tokenizee!",
        createdAt: new Date().toISOString(),
        likes: 0,
        shares: 0,
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Home</h1>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
