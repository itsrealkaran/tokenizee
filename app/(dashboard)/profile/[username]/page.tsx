"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  RegisterModal,
  RegisterFormData,
} from "@/components/modals/register-modal";
import { toast } from "react-hot-toast";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { feedPosts, user, updateUser } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);

  // Filter posts by the profile username
  const userPosts = feedPosts.filter(
    (post) => post.author.username === params.username
  );

  // Get the profile user's info from the first post or use current user if it's their profile
  const profileUser =
    params.username === user?.username ? user : userPosts[0]?.author;

  const handleEditProfile = (data: RegisterFormData) => {
    if (!user) return;

    // Update user data
    updateUser({
      ...user,
      username: data.username,
      displayName: data.displayName,
      dateOfBirth: data.dateOfBirth,
    });

    // Show success message
    toast.success("Profile updated successfully!");

    // Close modal and redirect to new profile URL if username changed
    setIsEditing(false);
    if (data.username !== user.username) {
      router.push(`/profile/${data.username}`);
    }
  };

  if (!profileUser) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
            <p className="text-muted-foreground">@{profileUser.username}</p>
          </div>
          {params.username === user?.username && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
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
            No posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onViewPost={() => router.push(`/feed/${post.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <RegisterModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditProfile}
          initialData={{
            username: user.username,
            displayName: user.displayName,
            dateOfBirth: user.dateOfBirth || "",
          }}
        />
      )}
    </div>
  );
}
