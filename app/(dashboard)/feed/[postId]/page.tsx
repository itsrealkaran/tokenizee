"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailedPost } from "@/components/detailed-post";
import { useGlobal } from "@/context/global-context";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { feedPosts } = useGlobal();

  const post = feedPosts.find((p) => p.id === params.postId);

  if (!post) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Post not found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Button>
      <DetailedPost post={post} />
    </div>
  );
}
