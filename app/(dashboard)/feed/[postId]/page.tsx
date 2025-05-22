"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailedPost } from "@/components/detailed-post";
import { useGlobal } from "@/context/global-context";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { feedPosts, isLoggedIn } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
      return;
    }

    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  const post = feedPosts.find((p) => p.id === params.postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/feed")}>Return to Feed</Button>
        </div>
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
