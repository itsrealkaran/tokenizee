"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";

export default function ProfilePage() {
  const { user, myPosts } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user?.displayName}</h1>
            <p className="text-muted-foreground">@{user?.username}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>

        {/* Profile Stats */}
        <div className="flex gap-6 mt-4">
          <div>
            <span className="font-semibold">{myPosts.length}</span>{" "}
            <span className="text-muted-foreground">Posts</span>
          </div>
          <div>
            <span className="font-semibold">0</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div>
            <span className="font-semibold">0</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {myPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet. Create your first post!
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} onViewPost={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
