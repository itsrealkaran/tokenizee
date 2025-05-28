"use client";

import { useParams } from "next/navigation";

export default function TopicFeedPage() {
  const params = useParams();
  const topic = params?.topic as string;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">
        #{topic?.charAt(0).toUpperCase() + topic?.slice(1)}
      </h1>
      <div className="text-muted-foreground mb-4">
        Posts about <span className="font-semibold">{topic}</span> will appear
        here.
      </div>
      {/* TODO: Filter and render posts by topic */}
      <div className="rounded-lg bg-muted/50 p-6 text-center text-muted-foreground">
        No posts for this topic yet.
      </div>
    </div>
  );
}
