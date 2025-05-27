"use client";

import { useRouter } from "next/navigation";
import { ArrowBigUp, ArrowBigDown, Share2, MessageCircle } from "lucide-react";
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
      className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onViewPost}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={handleProfileClick}
        >
          <span className="text-base sm:text-lg font-medium text-primary">
            {post.author.displayName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              className="font-medium hover:underline text-sm sm:text-base"
              onClick={handleProfileClick}
            >
              {post.author.displayName}
            </button>
            <span className="text-muted-foreground text-xs sm:text-sm">
              @{post.author.username}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold mt-0.5 sm:mt-1">
            {post.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-0.5 sm:mt-1 line-clamp-3">
            {truncatedContent}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 p-0",
              voteStatus === "up" && "text-primary hover:text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("up");
            }}
            disabled={isVoting}
          >
            <ArrowBigUp
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                voteStatus === "up" && "fill-current"
              )}
            />
          </Button>
          <span
            className={cn(
              "text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center",
              voteStatus === "up" && "text-primary"
            )}
          >
            {upvotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 p-0",
              voteStatus === "down" && "text-destructive hover:text-destructive"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleVote("down");
            }}
            disabled={isVoting}
          >
            <ArrowBigDown
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                voteStatus === "down" && "fill-current"
              )}
            />
          </Button>
          <span
            className={cn(
              "text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center",
              voteStatus === "down" && "text-destructive"
            )}
          >
            {downvotes}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 sm:gap-2 h-7 sm:h-8 px-2 sm:px-3"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          disabled={isSharing}
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">{shares}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 sm:gap-2 h-7 sm:h-8 px-2 sm:px-3"
          onClick={handleCommentClick}
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">{post.comments.length}</span>
        </Button>

        <p className="text-xs sm:text-sm text-muted-foreground ml-auto">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
