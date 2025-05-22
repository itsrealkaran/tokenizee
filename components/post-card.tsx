"use client";

import { Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    // TODO: Update likes in Lua table
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  return (
    <article className="border border-border rounded-lg p-4 space-y-4">
      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-medium text-primary">
            {post.author.displayName[0]}
          </span>
        </div>
        <div>
          <p className="font-medium">{post.author.displayName}</p>
          <p className="text-sm text-muted-foreground">
            @{post.author.username}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className="text-muted-foreground">{post.content}</p>
        {post.attachment && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.attachment}
              alt="Post attachment"
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2", isLiked && "text-red-500 hover:text-red-500")}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          <span>{likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>0</span>
        </Button>
      </div>

      {/* Timestamp */}
      <p className="text-sm text-muted-foreground">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </article>
  );
}
