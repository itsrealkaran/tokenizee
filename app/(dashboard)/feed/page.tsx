"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { feedPosts } = useGlobal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch posts from Lua table
    setLoading(false);
  }, []);

  const handleViewPost = (postId: string) => {
    router.push(`/feed/${postId}`);
  };

  return (
    <div className="space-y-4">
      {feedPosts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onViewPost={() => handleViewPost(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
