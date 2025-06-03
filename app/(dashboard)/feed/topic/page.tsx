"use client";

import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";

export default function TopicsPage() {
  const router = useRouter();
  const { topic } = useGlobal();

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center">
        {topic.map((topic) => (
          <div
            key={topic}
            onClick={() => router.push(`/feed/topic/${topic.toLowerCase()}`)}
            className="px-3 py-2 sm:px-4 sm:py-3 cursor-pointer rounded-lg bg-muted/60 hover:bg-primary/10 text-base sm:text-lg font-medium transition-colors border border-transparent hover:border-primary text-muted-foreground hover:text-primary min-w-[90px] text-center"
          >
            #{topic}
          </div>
        ))}
      </div>
    </div>
  );
}
