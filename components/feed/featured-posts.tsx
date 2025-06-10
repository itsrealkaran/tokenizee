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
              "absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer opacity-100 scale-100"
            )}
            onClick={() => router.push(`/feed/${posts[currentIndex].id}`)}
          >
            <Image
              src={getImageUrl(posts[currentIndex].id)}
              alt={posts[currentIndex].title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 md:p-5 lg:p-6">
              {/* Top Section */}
              <div className="flex items-start justify-between">
                {posts[currentIndex].author && (
                  <span className="bg-white/90 text-black text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-sm backdrop-blur-sm hover:bg-white transition-colors">
                    @{posts[currentIndex].author.username}
                  </span>
                )}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    className="p-1.5 sm:p-1.5 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
                    onClick={handlePrevClick}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    className="p-1.5 sm:p-1.5 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
                    onClick={handleNextClick}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                {/* Middle Section */}
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-lg line-clamp-2">
                    {posts[currentIndex].title}
                  </h2>
                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {posts[currentIndex].topic.map((topic) => (
                      <span
                        key={topic}
                        className="text-white/90 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
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

                {/* Bottom Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Avatar
                      displayName={posts[currentIndex].author.displayName}
                      profileImageUrl={posts[currentIndex].author.profileImageUrl}
                      size="sm"
                    />
                    <div className="flex flex-col">
                      <span className="text-white/90 text-xs sm:text-sm font-medium line-clamp-1">
                        {posts[currentIndex].author.displayName}
                      </span>
                      <span className="text-white/60 text-[10px] sm:text-xs flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {new Date(
                          posts[currentIndex].createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      className="flex items-center gap-1 sm:gap-1.5 text-white/80 hover:text-white transition-colors bg-black/30 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm hover:bg-black/40"
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
                      className="flex items-center gap-1 sm:gap-1.5 text-white/80 hover:text-white transition-colors bg-black/30 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm hover:bg-black/40"
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Dots Indicator */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full transition-all duration-300",
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
