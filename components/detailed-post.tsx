"use client";

import {
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useGlobal } from "@/context/global-context";
import { CommentCard } from "./comment-card";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/lib/ao-client";

interface DetailedPostProps {
  post: Post;
}

export function DetailedPost({ post }: DetailedPostProps) {
  const {
    upvotePost,
    downvotePost,
    sharePost,
    loadComments,
    commentPost,
    user,
  } = useGlobal();
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [shares, setShares] = useState(post.shares);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    loadPostComments();
  }, [post.id]);

  const loadPostComments = async () => {
    setIsLoadingComments(true);
    try {
      const postComments = await loadComments(post.id);
      setComments(postComments);
    } catch (error) {
      toast.error("Failed to load comments");
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

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (isCommenting) return;
    setIsCommenting(true);

    try {
      await commentPost(post.id, newComment);
      setNewComment("");
      await loadPostComments();
      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <article className="p-6 space-y-8 bg-card rounded-lg shadow-sm">
      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
          <span className="text-2xl font-medium text-primary">
            {post.author.displayName[0]}
          </span>
        </div>
        <div>
          <p className="font-medium text-xl">{post.author.displayName}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>@{post.author.username}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        {/* {post.attachment && (
          <div className="rounded-lg overflow-hidden border">
            <Image
              src={post.attachment}
              alt="Post attachment"
              className="w-full h-auto"
            />
          </div>
        )} */}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
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
              voteStatus === "down" && "text-destructive hover:text-destructive"
            )}
            onClick={() => handleVote("down")}
            disabled={isVoting}
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
          className="gap-2 hover:bg-accent"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className="h-4 w-4" />
          <span>{shares}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent">
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
      </div>

      {/* Comments Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Comments</h2>
          <span className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Comment Input */}
        <div className="space-y-4 bg-accent/5 p-4 rounded-lg">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none bg-background"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleComment}
              disabled={isCommenting || !newComment.trim()}
              className="min-w-[120px]"
            >
              {isCommenting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
