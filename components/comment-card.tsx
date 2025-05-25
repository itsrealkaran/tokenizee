"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  postId?: string;
  postTitle?: string;
}

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const router = useRouter();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${comment.author.username}`);
  };

  return (
    <div className="group relative border rounded-lg p-4 bg-card hover:bg-accent/5 transition-all duration-200">
      <div className="absolute -left-2 top-4 w-1 h-8 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all duration-200 hover:scale-105"
          onClick={handleProfileClick}
        >
          <span className="text-lg font-medium text-primary">
            {comment.author.displayName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="font-medium hover:underline text-foreground"
              onClick={handleProfileClick}
            >
              {comment.author.displayName}
            </button>
            <span className="text-muted-foreground text-sm">
              @{comment.author.username}
            </span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            <p className="text-foreground/90 leading-relaxed">
              {comment.content}
            </p>
            {comment.postTitle && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>On post: {comment.postTitle}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
