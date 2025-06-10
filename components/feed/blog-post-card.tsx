"use client";

import { useRouter } from "next/navigation";
import {
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  MessageCircle,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useGlobal } from "@/context/global-context";
import { Post } from "@/lib/ao-client";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";

interface BlogPostCardProps {
  post: Post;
  onViewPost?: () => void;
  className?: string;
}

const MAX_CONTENT_LENGTH = 150;

export function BlogPostCard({
  post,
  onViewPost,
  className,
}: BlogPostCardProps) {
  const router = useRouter();
  const {
    upvotePost,
    downvotePost,
    sharePost,
    bookmarkPost,
    walletAddress,
    removeVote,
  } = useGlobal();
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(
    post.hasUpvoted ? "up" : post.hasDownvoted ? "down" : null
  );
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [shares, setShares] = useState(post.shares);
  const [isBookmarked, setIsBookmarked] = useState(post.hasBookmarked);
  const [isVoting, setIsVoting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (isVoting) return;
    if (!walletAddress) {
      toast.error("Please connect your wallet to vote");
      return;
    }
    setIsVoting(true);
    const previousVote = voteStatus;
    try {
      if (voteStatus === type) {
        await removeVote(post.id);
        setVoteStatus(null);
        if (type === "up") {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
      } else {
        setVoteStatus(type);
        if (previousVote === null) {
          if (type === "up") {
            setUpvotes(upvotes + 1);
            await upvotePost(post.id);
          } else {
            setDownvotes(downvotes + 1);
            await downvotePost(post.id);
          }
        } else {
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
    if (!walletAddress) {
      toast.error("Please connect your wallet to share");
      return;
    }
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

  const handleBookmark = async () => {
    if (isBookmarking) return;
    if (!walletAddress) {
      toast.error("Please connect your wallet to bookmark");
      return;
    }
    setIsBookmarking(true);
    try {
      const action = isBookmarked ? "remove" : "add";
      await bookmarkPost(post.id, action);
      setIsBookmarked(!isBookmarked);
      toast.success(action === "add" ? "Post bookmarked" : "Post unbookmarked");
    } catch (err) {
      console.error(err);
      toast.error("Failed to bookmark post");
    } finally {
      setIsBookmarking(false);
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
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3 sm:gap-4 rounded-2xl hover:shadow-lg overflow-hidden transition-all border cursor-pointer p-3 sm:p-2",
        "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800",
        className
      )}
      onClick={onViewPost}
    >
      {/* Image Section */}
      <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg">
        {post.media && post.media.length > 0 ? (
          <Image
            src={post.media[0].url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No media</span>
          </div>
        )}
      </div>
      {/* Content Section */}
      <div
        className={cn(
          "grid grid-rows-[1fr_auto] gap-2 sm:gap-3 md:gap-4 p-2 px-4 sm:pl-0",
          "text-zinc-900 dark:text-white"
        )}
      >
        <div>
          <h2 className="font-bold mb-1 line-clamp-2 text-base sm:text-lg md:text-xl">
            {post.title}
          </h2>
          <p
            className={cn(
              "mb-2 line-clamp-3 text-xs sm:text-sm",
              "text-zinc-600 dark:text-zinc-300"
            )}
          >
            {truncatedContent}
          </p>
        </div>
        <div className="grid grid-rows-[auto_auto]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <div className="flex items-center gap-2">
              <Avatar
                displayName={post.author.displayName}
                profileImageUrl={post.author.profileImageUrl}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileClick(e);
                }}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-xs sm:text-sm">
                  {post.author.displayName}
                </span>
                <span className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                  @{post.author.username}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-2 transition-colors h-8 w-8 bg-primary hover:bg-primary/90 text-white hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={isSharing}
              >
                <Share2
                  className={cn("h-4 w-4", post.hasShared && "fill-current")}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full p-2 transition-colors h-8 w-8",
                  isBookmarked && "text-primary",
                  "text-primary dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white border-primary hover:text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark();
                }}
                disabled={isBookmarking}
              >
                <Bookmark
                  className={cn("w-4 h-4", isBookmarked && "fill-current")}
                />
              </Button>
            </div>
          </div>
          <div className="sm:hidden flex flex-wrap items-center gap-2 mt-2 border-t border-zinc-200 sm:border-none dark:border-zinc-800">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 p-0 hover:bg-primary/10",
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
                    "h-4 w-4",
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
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 p-0 hover:bg-destructive/10",
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
                  "text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center",
                  voteStatus === "down" && "text-destructive"
                )}
              >
                {downvotes}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-primary/10"
                onClick={handleCommentClick}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center">
                {post.comments.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
