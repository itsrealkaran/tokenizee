"use client";

import {
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  MessageCircle,
  Calendar,
  Clock,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useGlobal } from "@/context/global-context";
import { CommentCard } from "./comment-card";
import { Textarea } from "@/components/ui/textarea";
import { Post, Comment } from "@/lib/ao-client";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";

interface DetailedPostProps {
  post: Post;
}

export function DetailedPost({ post }: DetailedPostProps) {
  const searchParams = useSearchParams();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const {
    upvotePost,
    downvotePost,
    sharePost,
    loadComments,
    commentPost,
    bookmarkPost,
    user,
    removeVote,
  } = useGlobal();
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [shares, setShares] = useState(post.shares);
  const [isBookmarked, setIsBookmarked] = useState(post.hasBookmarked);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Calculate reading time (assuming average reading speed of 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Generate a consistent image ID based on post ID
  const imageId =
    Math.abs(
      post.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % 1000;
  const imageUrl =
    post.media && post.media.length > 0
      ? post.media[0].url
      : `https://picsum.photos/seed/${imageId}/800/450`;

  // Initialize vote status based on post data
  useEffect(() => {
    if (post.hasUpvoted) {
      setVoteStatus("up");
    } else if (post.hasDownvoted) {
      setVoteStatus("down");
    }
  }, [post.hasUpvoted, post.hasDownvoted]);

  // Update interaction counts when post data changes
  useEffect(() => {
    setUpvotes(post.upvotes);
    setDownvotes(post.downvotes);
    setShares(post.shares);
    setIsBookmarked(post.hasBookmarked);
  }, [post.upvotes, post.downvotes, post.shares, post.hasBookmarked]);

  useEffect(() => {
    loadPostComments();
  }, [post.id]);

  // Focus comment input if focus=comment is in URL
  useEffect(() => {
    if (searchParams.get("focus") === "comment" && commentInputRef.current) {
      commentInputRef.current.focus();
      commentInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchParams]);

  const loadPostComments = async () => {
    setIsLoadingComments(true);
    try {
      const postComments = await loadComments(post.id);
      // Sort comments by creation time (newest first)
      const sortedComments = postComments.sort(
        (a, b) => b.createdAt - a.createdAt
      );
      setComments(sortedComments);
    } catch (error) {
      toast.error("Failed to load comments");
      console.error(error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleVote = async (type: "up" | "down") => {
    if (isVoting) return;
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
    setIsSharing(true);

    try {
      await sharePost(post.id);
      setShares(shares + 1);
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to share post");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (isCommenting) return;
    setIsCommenting(true);

    try {
      const { comment } = await commentPost(post.id, trimmedComment);
      setNewComment("");
      // Add the new comment to the beginning of the comments list
      setComments((prevComments) => [comment, ...prevComments]);
      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark posts");
      return;
    }

    try {
      const action = isBookmarked ? "remove" : "add";
      await bookmarkPost(post.id, action);
      setIsBookmarked(!isBookmarked);
      toast.success(
        isBookmarked
          ? "Post removed from bookmarks"
          : "Post bookmarked successfully"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to bookmark post");
    }
  };

  return (
    <article className="p-2 overflow-hidden">
      {/* Featured Image */}
      <div className="w-full aspect-[16/9] relative group overflow-hidden rounded-lg">
        {post.media.length > 0 && (
          <>
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Avatar
                    displayName={post.author.displayName}
                    profileImageUrl={post.author.profileImageUrl}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-base sm:text-lg md:text-xl">
                      {post.author.displayName}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <span>@{post.author.username}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {post.topic.map((topic) => (
                  <span
                    key={topic}
                    className="text-white/90 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">
                    {post.bookmarks} Bookmarks
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-3 sm:p-4 md:p-6 space-y-2">
        {/* Author Info */}
        <div className="flex flex-row justify-between">
          <h1 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4">
            {post.title}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-2 gap-2 hover:bg-primary/10",
              isBookmarked && "text-primary hover:text-primary"
            )}
            onClick={handleBookmark}
          >
            <Bookmark
              className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                isBookmarked && "fill-current"
              )}
            />
          </Button>
        </div>

        {/* Post Content */}
        <div className="prose prose-xs sm:prose-sm md:prose-base dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="text-xs sm:text-base text-foreground/90 leading-relaxed mb-3 sm:mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Topics (Mobile View) */}
        <div className="flex flex-wrap gap-2 sm:hidden">
          {post.topic.map((topic) => (
            <span
              key={topic}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              #{topic}
            </span>
          ))}
        </div>

        {/* Post Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary/10",
                voteStatus === "up" && "text-primary hover:text-primary"
              )}
              onClick={() => handleVote("up")}
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
                "h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10",
                voteStatus === "down" &&
                  "text-destructive hover:text-destructive"
              )}
              onClick={() => handleVote("down")}
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
            className="gap-2 hover:bg-primary/10 h-8 sm:h-9"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{shares}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 h-8 sm:h-9"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{comments.length}</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
              Comments
            </h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* Comment Input */}
          <div className="space-y-3 bg-accent/5 p-3 sm:p-4 rounded-lg">
            <Textarea
              ref={commentInputRef}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] resize-none bg-background text-xs sm:text-base"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleComment}
                disabled={isCommenting || !newComment.trim()}
                className="min-w-[100px] sm:min-w-[120px] h-8 sm:h-9 text-xs sm:text-base"
              >
                {isCommenting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 sm:space-y-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <p className="text-xs sm:text-base text-muted-foreground">
                  Loading comments...
                </p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-base text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
