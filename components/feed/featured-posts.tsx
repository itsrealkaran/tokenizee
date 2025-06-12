"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bookmark,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/lib/ao-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar } from "../ui/avatar";

interface FeaturedPostsProps {
  posts: Post[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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

  const handlePrevClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAutoPlaying(false);
      setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    },
    [posts.length]
  );

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAutoPlaying(false);
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    },
    [posts.length]
  );

  if (posts.length === 0) return null;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
        {/* Only render the active post */}
        {posts.length > 0 && (
          <div
            key={posts[currentIndex].id}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer opacity-100 scale-100 w-full h-full"
            )}
            onClick={() => router.push(`/feed/${posts[currentIndex].id}`)}
          >
            {(() => {
              const imageId =
                Math.abs(
                  posts[currentIndex].id
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                ) % 1000;
              const imageUrl =
                posts.length > 0
                  ? posts[currentIndex].media[0].url
                  : `https://picsum.photos/seed/${imageId}/800/450`;

              return (
                <Image
                  src={imageUrl}
                  alt={posts[currentIndex].title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              );
            })()}
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 sm:p-4 md:p-5 lg:p-6 w-full h-full">
              {/* Top Section: Author info and navigation arrows */}
              <div className="flex items-start justify-between w-full flex-col xs:flex-row sm:flex-row gap-2 xs:gap-0 sm:gap-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    displayName={posts[currentIndex].author.displayName}
                    profileImageUrl={posts[currentIndex].author.profileImageUrl}
                    size="sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-primary-foreground text-xs sm:text-sm font-bold line-clamp-1 break-words">
                      {posts[currentIndex].author.displayName}
                    </span>
                    <span className="text-primary-foreground text-[10px] sm:text-xs flex items-center gap-1 break-words">
                      @{posts[currentIndex].author.username}
                    </span>
                  </div>
                  <span className="text-primary-foreground text-[10px] sm:text-xs flex items-center gap-1 ml-1">
                    {` • `}
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                    {(() => {
                      // Show relative time (e.g., 4hr)
                      const now = new Date();
                      const created = new Date(posts[currentIndex].createdAt);
                      const diffMs = now.getTime() - created.getTime();
                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                      if (diffHrs < 1) return "<1hr";
                      if (diffHrs < 24) return `${diffHrs}hr`;
                      return `${Math.floor(diffHrs / 24)}d`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-2 xs:mt-0 sm:mt-0 self-end xs:self-auto">
                  <button
                    className="p-1.5 sm:p-1.5 rounded-full bg-primary/20 text-primary-foreground hover:bg-primary/40 transition-all backdrop-blur-sm shadow-md"
                    onClick={handlePrevClick}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    className="p-1.5 sm:p-1.5 rounded-full bg-primary/20 text-primary-foreground hover:bg-primary/40 transition-all backdrop-blur-sm shadow-md"
                    onClick={handleNextClick}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse xs:flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-full mt-2">
                {/* Share and Bookmark */}
                <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-start sm:justify-end order-2 sm:order-1">
                  <button
                    className="flex items-center gap-1 sm:gap-1.5 text-primary-foreground hover:text-primary transition-colors bg-primary/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm hover:bg-primary/20 border border-primary/20 shadow-sm w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement share functionality
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-[10px] sm:text-xs font-medium">
                      {posts[currentIndex].shares}
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-1 sm:gap-1.5 text-primary-foreground hover:text-primary transition-colors bg-primary/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm hover:bg-primary/20 border border-primary/20 shadow-sm w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement bookmark functionality
                    }}
                  >
                    <Bookmark
                      className={cn(
                        "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        posts[currentIndex].hasBookmarked && "fill-current"
                      )}
                    />
                    <span className="text-[10px] sm:text-xs font-medium">
                      {posts[currentIndex].bookmarks}
                    </span>
                  </button>
                </div>
                {/* Bottom Section: Title, description, tags */}
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full max-w-full order-1 sm:order-2">
                  <h2 className="text-primary-foreground text-lg sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg line-clamp-2 break-words">
                    {posts[currentIndex].title}
                  </h2>
                  {/* Description with Read More */}
                  {posts[currentIndex].content && (
                    <p className="text-muted-foreground text-xs sm:text-sm md:text-base line-clamp-2 break-words">
                      {posts[currentIndex].content}
                    </p>
                  )}
                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    {posts[currentIndex].topic.map((topic) => (
                      <span
                        key={topic}
                        className="text-primary-foreground/80 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-colors border border-primary/20 break-words"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/feed/topic/${topic}`);
                        }}
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Dots Indicator */}
      <div className="absolute bottom-1 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 z-10">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-white w-4 sm:w-6"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </div>
  );
}
