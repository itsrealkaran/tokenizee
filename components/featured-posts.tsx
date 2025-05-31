"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Clock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/lib/ao-client";
import { useRouter } from "next/navigation";

interface FeaturedPostsProps {
  posts: Post[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Generate consistent image IDs for each post
  const getImageUrl = (postId: string) => {
    const imageId =
      Math.abs(
        postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % 1000;
    return `https://picsum.photos/seed/${imageId}/1200/600`;
  };

  // Auto-play functionality with pause on hover
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, posts.length, isHovered]);

  const handleDotClick = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  }, []);

  if (posts.length === 0) return null;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
            onClick={() => router.push(`/feed/${post.id}`)}
          >
            <img
              src={getImageUrl(post.id)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            {post.author && (
              <span className="absolute top-4 left-4 bg-white/80 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                {post.author.username}
              </span>
            )}
            {/* Title */}
            <div className="absolute left-0 right-0 bottom-16 sm:bottom-18 px-4 sm:px-8">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-md line-clamp-2">
                {post.title}
              </h2>
            </div>
            {/* Bottom bar: author and actions */}
            <div className="absolute left-0 right-0 bottom-2 sm:bottom-4 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {post.author.displayName[0]}
                  </span>
                </div>
                <span className="text-white/90 text-sm font-medium">
                  {post.author.displayName}
                </span>
                <span className="text-white/60 text-xs ml-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />1 min ago
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">{post.shares}</span>
                </button>
                <button className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span className="text-xs">{post.bookmarkCount}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </div>
  );
}
