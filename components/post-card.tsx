"use client";

import { useRouter } from "next/navigation";
import {
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useGlobal } from "@/context/global-context";
import { Post } from "@/lib/ao-client";

interface PostCardProps {
  post: Post;
  onViewPost: () => void;
}

const MAX_CONTENT_LENGTH = 200;

export function PostCard({ post, onViewPost }: PostCardProps) {
  const router = useRouter();
  const { upvotePost, downvotePost, sharePost } = useGlobal();
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [shares, setShares] = useState(post.shares);
  const [isVoting, setIsVoting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate a consistent image ID based on post ID
  const imageId =
    Math.abs(
      post.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % 1000;
  const imageUrl = `https://picsum.photos/seed/${imageId}/800/450`;

  const handleVote = async (type: "up" | "down") => {
    if (isVoting) return;
    setIsVoting(true);

    const previousVote = voteStatus;

    try {
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
        setVoteStatus(type);

        if (previousVote === null) {
          // New vote
          if (type === "up") {
            setUpvotes(upvotes + 1);
            await upvotePost(post.id);
          } else {
            setDownvotes(downvotes + 1);
            await downvotePost(post.id);
          }
        } else {
          // Switch vote
          if (type === "up") {
            setUpvotes(upvotes + 1);
            setDownvotes(downvotes - 1);
            await upvotePost(post.id);
          } else {
            setUpvotes(upvotes - 1);
            setDownvotes(downvotes + 1);
            await downvotePost(post.id);
          }
        }
      }
    } catch (error) {
      console.error(error);
      // Revert UI state on error
      if (type === "up") {
        setUpvotes(upvotes);
      } else {
        setDownvotes(downvotes);
      }
      setVoteStatus(previousVote);
      toast.error("Failed to vote on post");
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      await sharePost(post.id);
      setShares(shares + 1);
      await navigator.clipboard.writeText(
        `${window.location.origin}/feed/${post.id}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.author.username}`);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/feed/${post.id}?focus=comment`);
  };

  const truncatedContent =
    post.content.length > MAX_CONTENT_LENGTH
      ? post.content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : post.content;

  return (
    <div
      className="group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 bg-card"
      onClick={onViewPost}
    >
      {/* Image Section */}
      <div className="w-full aspect-[16/9] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Author and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors ring-2 ring-primary/20"
              onClick={handleProfileClick}
            >
              <span className="text-base font-medium text-primary">
                {post.author.displayName[0]}
              </span>
            </div>
            <div className="flex flex-col">
              <button
                className="font-medium hover:underline text-sm text-left"
                onClick={handleProfileClick}
              >
                {post.author.displayName}
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{post.author.username}</span>
                <span>•</span>
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {truncatedContent}
          </p>
        </div>

        {/* Engagement Section */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 hover:bg-primary/10",
                voteStatus === "up" && "text-primary hover:text-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleVote("up");
              }}
              disabled={isVoting}
            >
              <ArrowBigUp
                className={cn("h-4 w-4", voteStatus === "up" && "fill-current")}
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
                "h-8 w-8 p-0 hover:bg-destructive/10",
                voteStatus === "down" &&
                  "text-destructive hover:text-destructive"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleVote("down");
              }}
              disabled={isVoting}
            >
              <ArrowBigDown
                className={cn(
                  "h-4 w-4",
                  voteStatus === "down" && "fill-current"
                )}
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
            className="gap-1.5 h-8 px-3 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{shares}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 px-3 hover:bg-primary/10"
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comments.length}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
