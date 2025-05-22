"use client";

import { ArrowBigUp, ArrowBigDown, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
  upvotes: number;
  downvotes: number;
  shares: number;
}

interface DetailedPostProps {
  post: Post;
}

export function DetailedPost({ post }: DetailedPostProps) {
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);

  const handleVote = (type: "up" | "down") => {
    if (voteStatus === type) {
      // Remove vote
      setVoteStatus(null);
      if (type === "up") {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
    } else {
      // Change vote
      const previousVote = voteStatus;
      setVoteStatus(type);

      if (previousVote === null) {
        // New vote
        if (type === "up") {
          setUpvotes(upvotes + 1);
        } else {
          setDownvotes(downvotes + 1);
        }
      } else {
        // Switch vote
        if (type === "up") {
          setUpvotes(upvotes + 1);
          setDownvotes(downvotes - 1);
        } else {
          setUpvotes(upvotes - 1);
          setDownvotes(downvotes + 1);
        }
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
      console.error(err);
    }
  };

  return (
    <article className="p-6 space-y-6">
      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-medium text-primary">
            {post.author.displayName[0]}
          </span>
        </div>
        <div>
          <p className="font-medium text-lg">{post.author.displayName}</p>
          <p className="text-sm text-muted-foreground">
            @{post.author.username}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
        {post.attachment && (
          <div className="rounded-lg overflow-hidden">
            <Image
              src={post.attachment}
              alt="Post attachment"
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
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
              voteStatus === "up" && "text-primary"
            )}
          >
            {upvotes}
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
          <span
            className={cn(
              "text-sm font-medium min-w-[1.5rem] text-center",
              voteStatus === "down" && "text-destructive"
            )}
          >
            {downvotes}
          </span>
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

        <p className="text-sm text-muted-foreground ml-auto">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}
