"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";
import { Loader2, Hash } from "lucide-react";
import { Post } from "@/lib/ao-client";

export default function TopicPage({ params }: { params: { topic: string } }) {
  const router = useRouter();
  const { getTopicFeed, walletAddress } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadTopicFeed = async () => {
      try {
        setLoading(true);
        const topicPosts = await getTopicFeed(params.topic);
        setPosts(topicPosts);
      } catch (error) {
        console.error("Error loading topic feed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopicFeed();
  }, [params.topic, getTopicFeed]);

  const handleViewPost = (postId: string) => {
    router.push(`/feed/${postId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Hash className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  No posts found for #{params.topic}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
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
