"use client";

import * as React from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
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
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        {trigger || <MoreVertical className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 bottom-full z-50 mb-2 w-56 rounded-xl border border-border bg-card shadow-xl focus:outline-none animate-fadeIn"
          style={{ minWidth: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          {/* Arrow pointer at the bottom right */}
          <div className="absolute -bottom-2 right-2 w-4 h-4 overflow-hidden">
            <ChevronDown className="w-5 h-5 fill-card text-card shadow-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
