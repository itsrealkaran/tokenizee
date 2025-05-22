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
  likes: number;
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
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowBigUp
            className={cn("h-4 w-4", voteStatus === "up" && "fill-current")}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("up");
            }}
          />
          <span>{votes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowBigDown
            className={cn("h-4 w-4", voteStatus === "down" && "fill-current")}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("down");
            }}
          />
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>0</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </Button>
      </div>
    </div>
  );
}
