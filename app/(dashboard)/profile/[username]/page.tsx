"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import { Calendar, Users, UserPlus, PenSquare } from "lucide-react";
import { useState } from "react";
import {
  RegisterModal,
  RegisterFormData,
} from "@/components/modals/register-modal";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userPosts, user, updateUser } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");

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

  // Get follower and following counts safely
  const followersCount =
    "followers" in profileUser ? profileUser.followers?.length || 0 : 0;
  const followingCount =
    "following" in profileUser ? profileUser.following?.length || 0 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="space-y-6">
        {/* Cover Image Placeholder */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg" />

        {/* Profile Info */}
        <div className="flex items-start justify-between -mt-16 px-4">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-4 border-background">
              {profileUser.displayName[0]}
            </div>
            <div className="mb-2">
              <h1 className="text-xl font-bold">{profileUser.displayName}</h1>
              <p className="text-muted-foreground">@{profileUser.username}</p>
            </div>
          </div>
          {params.username === user?.username ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button variant="default" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Follow
            </Button>
          )}
        </div>

        {/* Profile Stats */}
        <div className="flex items-center gap-6 px-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {followersCount} followers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {followingCount} following
            </span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="border-b mt-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "posts"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "about"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            Comments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "posts" ? (
          userPosts.length === 0 ? (
            <div className="text-center py-12">
              <PenSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onViewPost={() => router.push(`/feed/${post.id}`)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6">
              <div className="text-center py-12">
                <PenSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet.</p>
              </div>
            </div>
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
