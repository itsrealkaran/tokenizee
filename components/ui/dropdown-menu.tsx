"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function DropdownMenu({
  children,
  trigger,
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {trigger || <MoreVertical className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-48 rounded-md border border-border bg-background shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
