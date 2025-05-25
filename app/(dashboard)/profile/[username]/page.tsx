"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { useGlobal } from "@/context/global-context";
import {
  Calendar,
  Users,
  UserPlus,
  PenSquare,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  RegisterModal,
  RegisterFormData,
} from "@/components/modals/register-modal";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CommentCard } from "@/components/comment-card";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const {
    user,
    profileUser,
    userPosts,
    userComments,
    loadProfileData,
    handleFollowUser,
    updateUserProfile,
  } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = useCallback(
    async (username: string) => {
      try {
        setIsLoading(true);
        await loadProfileData(username);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfileData]
  );

  useEffect(() => {
    const username = params.username as string;
    if (username && (!profileUser || profileUser.username !== username)) {
      fetchProfileData(username);
    } else {
      setIsLoading(false);
    }
  }, [params.username, profileUser, fetchProfileData]);

  const handleEditProfile = async (data: RegisterFormData) => {
    if (!user) return;

    try {
      const success = await updateUserProfile(
        data.displayName,
        data.dateOfBirth,
        data.bio
      );

      if (success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        if (data.username !== user.username) {
          router.push(`/profile/${data.username}`);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const isCurrentUser = user?.username === profileUser.username;
  const isFollowing = user?.following?.[profileUser.username] || false;

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
          {isCurrentUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="gap-2"
              onClick={() => handleFollowUser(profileUser.username)}
            >
              <UserPlus className="h-4 w-4" />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Profile Stats */}
        <div className="flex items-center gap-6 px-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {new Date(profileUser.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Object.keys(profileUser.followers || {}).length} followers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Object.keys(profileUser.following || {}).length} following
            </span>
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className="px-4">
            <p className="text-muted-foreground">{profileUser.bio}</p>
          </div>
        )}
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
            onClick={() => setActiveTab("comments")}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "comments"
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
            {userComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet.</p>
              </div>
            ) : (
              userComments.map((comment) => (
                <div key={comment.id} className="cursor-pointer">
                  <CommentCard comment={comment} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <RegisterModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditProfile}
          initialData={{
            username: profileUser.username,
            displayName: profileUser.displayName,
            dateOfBirth: profileUser.dateOfBirth,
            bio: profileUser.bio,
          }}
        />
      )}
    </div>
  );
}
