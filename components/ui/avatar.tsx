import { cn } from "@/lib/utils";
import Image from "next/image";
import { MouseEvent } from "react";

interface AvatarProps {
  displayName: string;
  profileImageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: (e: MouseEvent) => void;
}

export function Avatar({
  displayName,
  profileImageUrl,
  size = "md",
  className,
  onClick,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-14 h-14 text-xl",
  };

  const firstLetter = displayName?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 transition-colors",
        onClick && "cursor-pointer hover:bg-primary/20",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {profileImageUrl ? (
        <Image
          src={profileImageUrl}
          alt={displayName}
          width={size === "sm" ? 32 : size === "md" ? 40 : 48}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <span className="font-medium text-primary">{firstLetter}</span>
      )}
    </div>
  );
}
