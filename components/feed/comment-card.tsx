"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Comment } from "@/lib/ao-client";

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const router = useRouter();
  console.log(comment);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${comment.author.username}`);
  };

  return (
    <div className="group relative border rounded-lg p-3 sm:p-4 bg-card hover:bg-accent/5 transition-all duration-200">
      <div className="absolute -left-2 top-4 w-1 h-8 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all duration-200 hover:scale-105"
          onClick={handleProfileClick}
        >
          <span className="text-base sm:text-lg font-medium text-primary">
            {comment.author.displayName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              className="font-medium hover:underline text-sm sm:text-base text-foreground"
              onClick={handleProfileClick}
            >
              {comment.author.displayName}
            </button>
            <span className="text-muted-foreground text-xs sm:text-sm">
              @{comment.author.username}
            </span>
            <span className="text-muted-foreground text-xs sm:text-sm">•</span>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              {comment.content}
            </p>
            {comment.postTitle && (
              <div
                className="flex hover:underline items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground"
                onClick={() => router.push(`/feed/${comment.postId}`)}
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>On post: {comment.postTitle}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
