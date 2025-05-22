"use client";

import { ArrowBigUp, ArrowBigDown, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState(post.likes);

  const handleVote = (type: "up" | "down") => {
    if (voteStatus === type) {
      // Remove vote
      setVoteStatus(null);
      setVotes(votes - (type === "up" ? 1 : -1));
    } else {
      // Change vote
      const previousVote = voteStatus;
      setVoteStatus(type);
      if (previousVote === null) {
        setVotes(votes + (type === "up" ? 1 : -1));
      } else {
        setVotes(votes + (type === "up" ? 2 : -2));
      }
    }
    // TODO: Update votes in Lua table
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              voteStatus === "up" && "text-primary hover:text-primary"
            )}
            onClick={() => handleVote("up")}
          >
            <ArrowBigUp
              className={cn("h-5 w-5", voteStatus === "up" && "fill-current")}
            />
          </Button>
          <span
            className={cn(
              "text-sm font-medium min-w-[1.5rem] text-center",
              votes > 0 && "text-primary",
              votes < 0 && "text-destructive"
            )}
          >
            {votes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              voteStatus === "down" && "text-destructive hover:text-destructive"
            )}
            onClick={() => handleVote("down")}
          >
            <ArrowBigDown
              className={cn("h-5 w-5", voteStatus === "down" && "fill-current")}
            />
          </Button>
        </div>

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
        {/* Timestamp */}
        <p className="text-sm text-muted-foreground ml-auto">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}
