"use client";

import { useGlobal } from "@/context/global-context";
import { useRouter } from "next/navigation";

export default function TopicsPage() {
  const router = useRouter();
  const { topic } = useGlobal();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {topic.map((topic) => (
          <div
            onClick={() => router.push(`/feed/topic/${topic.toLowerCase()}`)}
            className="px-4 py-3 cursor-pointer rounded-lg bg-muted/60 hover:bg-primary/10 text-lg font-medium transition-colors border border-transparent hover:border-primary text-muted-foreground hover:text-primary"
          >
            #{topic}
          </div>
        ))}
      </div>
    </div>
  );
}
