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

interface PostCardProps {
  post: Post;
  onViewPost: () => void;
}

const MAX_CONTENT_LENGTH = 200;

export function PostCard({ post, onViewPost }: PostCardProps) {
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
        // Remove vote
        await removeVote(post.id);
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
      className="group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 bg-card p-2"
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
        <div className="absolute top-2 left-4 space-x-2">
          {post.topic.map((topic) => (
            <span
              key={topic}
              className="bg-black/70 text-white text-[11px] px-2 py-0.5 rounded-full font-medium hover:bg-primary/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/feed/topic/${topic}`);
              }}
            >
              #{topic}
            </span>
          ))}
        </div>
        <div className="absolute top-2 right-2 z-10 items-center sm:hidden flex bg-white/80 backdrop-blur-sm rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-5 w-5 p-0 hover:bg-white/10 text-black hover:text-black/80",
              isBookmarked && "text-primary hover:text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark();
            }}
            disabled={isBookmarking}
          >
            <Bookmark
              className={cn("h-4 w-4", isBookmarked && "fill-current")}
            />
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        {/* Author and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
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
              <button
                className="font-medium hover:underline text-xs sm:text-sm text-left"
                onClick={handleProfileClick}
              >
                {post.author.displayName}
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Content */}
        <div className="space-y-1.5 sm:space-y-2">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold line-clamp-2">
            {post.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {truncatedContent}
          </p>
        </div>

        {/* Engagement Section */}
        <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-3 border-t">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10",
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
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
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

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10",
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
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
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

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10",
                  post.hasShared && "text-primary hover:text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={isSharing}
              >
                <Share2
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                    post.hasShared && "fill-current"
                  )}
                />
              </Button>
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center",
                  post.hasShared && "text-primary"
                )}
              >
                {shares}
              </span>
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10"
                onClick={handleCommentClick}
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[1.25rem] sm:min-w-[1.5rem] text-center">
                {post.comments.length}
              </span>
            </div>

            <div className="flex items-center hidden sm:flex">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 hover:bg-primary/10",
                  isBookmarked && "text-primary hover:text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark();
                }}
                disabled={isBookmarking}
              >
                <Bookmark
                  className={cn("h-4 w-4", isBookmarked && "fill-current")}
                />
              </Button>
              <span
                className={cn(
                  "text-sm font-medium min-w-[1.5rem] text-center",
                  isBookmarked && "text-primary"
                )}
              >
                {post.bookmarks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
