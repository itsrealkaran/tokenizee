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
  const imageUrl = `https://picsum.photos/seed/${imageId}/1200/675`;

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
    <article className="space-y-6 sm:space-y-8 bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Featured Image */}
      <div className="w-full aspect-[16/9] relative group overflow-hidden">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>
          {/* Topics */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.topic.map((topic) => (
              <span
                key={topic}
                className="text-white/90 text-sm px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                #{topic}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="h-4 w-4" />
              <span className="text-sm">{post.bookmarks} Bookmarks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors ring-2 ring-primary/20">
              <span className="text-xl sm:text-2xl font-medium text-primary">
                {post.author.displayName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-lg sm:text-xl">
                {post.author.displayName}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>@{post.author.username}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
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
              className={cn("h-6 w-6", isBookmarked && "fill-current")}
            />
          </Button>
        </div>

        {/* Post Content */}
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-4"
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
              className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              #{topic}
            </span>
          ))}
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 hover:bg-primary/10",
                voteStatus === "up" && "text-primary hover:text-primary"
              )}
              onClick={() => handleVote("up")}
              disabled={isVoting}
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
                "h-9 w-9 p-0 hover:bg-destructive/10",
                voteStatus === "down" &&
                  "text-destructive hover:text-destructive"
              )}
              onClick={() => handleVote("down")}
              disabled={isVoting}
            >
              <ArrowBigDown
                className={cn(
                  "h-5 w-5",
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
            className="gap-2 hover:bg-primary/10 h-9"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{shares}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 h-9"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{comments.length}</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 sm:space-y-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold">Comments</h2>
            <span className="text-sm text-muted-foreground">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* Comment Input */}
          <div className="space-y-4 bg-accent/5 p-4 rounded-lg">
            <Textarea
              ref={commentInputRef}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none bg-background text-base"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleComment}
                disabled={isCommenting || !newComment.trim()}
                className="min-w-[120px] h-9 text-base"
              >
                {isCommenting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-base text-muted-foreground">
                  Loading comments...
                </p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-base text-muted-foreground">
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
