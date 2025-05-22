"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string;
  content: string;
  attachment?: string;
  createdAt: string;
  likes: number;
  shares: number;
}

export default function ProfilePage() {
  const { user } = useGlobal();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Fetch user posts from Lua table
  // For now, using dummy data
  const userPosts: Post[] = [
    {
      id: "1",
      author: {
        username: user?.username || "user",
        displayName: user?.displayName || "User",
      },
      title: "My First Post",
      content: "This is my first post on Tokenizee!",
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
    },
  ];

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
            <span className="font-semibold">{userPosts.length}</span>{" "}
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
        {userPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet. Create your first post!
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
