"use client";

import { useRouter } from "next/navigation";
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
  upvotes: number;
  downvotes: number;
  shares: number;
}

interface PostCardProps {
  post: Post;
  onViewPost: () => void;
}

const MAX_CONTENT_LENGTH = 200;

export function PostCard({ post, onViewPost }: PostCardProps) {
  const router = useRouter();
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
        `${window.location.origin}/feed/${post.id}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link");
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.author.username}`);
  };

  const truncatedContent =
    post.content.length > MAX_CONTENT_LENGTH
      ? post.content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : post.content;

  return (
    <div
      className="border rounded-lg p-4 space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onViewPost}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={handleProfileClick}
        >
          <span className="text-lg font-medium text-primary">
            {post.author.displayName[0]}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              className="font-medium hover:underline"
              onClick={handleProfileClick}
            >
              {post.author.displayName}
            </button>
            <span className="text-muted-foreground">
              @{post.author.username}
            </span>
          </div>
          <h2 className="text-lg font-semibold mt-1">{post.title}</h2>
          <p className="text-muted-foreground mt-1 line-clamp-3">
            {truncatedContent}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              voteStatus === "up" && "text-primary hover:text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("up");
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              handleVote("down");
            }}
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
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
        >
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span>0</span>
        </Button>

        <p className="text-sm text-muted-foreground ml-auto">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
