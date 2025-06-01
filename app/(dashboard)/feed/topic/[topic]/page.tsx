"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";
import { Loader2, Hash } from "lucide-react";
import { Post } from "@/lib/ao-client";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export default function TopicPage({ params }: TopicPageProps) {
  const router = useRouter();
  const { getTopicFeed } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const unwrappedParams = use(params);

  useEffect(() => {
    const loadTopicFeed = async () => {
      try {
        setLoading(true);
        const topicPosts = await getTopicFeed(unwrappedParams.topic);
        setPosts(topicPosts);
      } catch (error) {
        console.error("Error loading topic feed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopicFeed();
  }, [unwrappedParams.topic, getTopicFeed]);

  const handleViewPost = (postId: string) => {
    router.push(`/feed/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Hash className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  No posts found for #{unwrappedParams.topic}
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
