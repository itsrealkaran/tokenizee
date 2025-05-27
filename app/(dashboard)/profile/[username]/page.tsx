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
import { UserListModal } from "@/components/user-list-modal";
import { User, Post } from "@/lib/ao-client";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const {
    user,
    profileUser: initialProfileUser,
    userPosts: initialUserPosts,
    userComments,
    loadProfileData,
    handleFollowUser,
    updateUserProfile,
  } = useGlobal();
  const [profileUser, setProfileUser] = useState<User | null>(
    initialProfileUser
  );
  const [userPosts, setUserPosts] = useState<Post[]>(initialUserPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Sync local state with global state
  useEffect(() => {
    setProfileUser(initialProfileUser);
    setUserPosts(initialUserPosts);
  }, [initialProfileUser, initialUserPosts]);

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
        data.newUsername,
        data.displayName,
        data.dateOfBirth,
        data.bio
      );

      if (success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        if (data.newUsername !== user.username) {
          router.push(`/profile/${data.newUsername}`);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFollow = async () => {
    if (!user || !profileUser) return;

    setIsFollowLoading(true);
    try {
      await handleFollowUser(profileUser.username);
      setFollowStatus(!followStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFollowLoading(false);
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

  const followers = Object.keys(profileUser.followers || {}).map(
    (username) => ({
      username,
      displayName: username, // You might want to fetch actual display names
      followers: {},
      following: {},
      score: 0,
      posts: [],
      createdAt: 0,
      dateOfBirth: "",
      bio: "",
      wallet: "",
    })
  );

  const following = Object.keys(profileUser.following || {}).map(
    (username) => ({
      username,
      displayName: username, // You might want to fetch actual display names
      followers: {},
      following: {},
      score: 0,
      posts: [],
      createdAt: 0,
      dateOfBirth: "",
      bio: "",
      wallet: "",
    })
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Profile Header */}
      <div className="space-y-4 sm:space-y-6">
        {/* Cover Image Placeholder */}
        <div className="flex h-24 mb-14 sm:mb-0 sm:h-32 bg-gradient-to-r items-center justify-center from-primary/20 to-primary/10 rounded-lg">
          <div className="flex sm:hidden -mb-28 sm:mb-0 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white">
            <div className="flex sm:hidden h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/10 items-center justify-center text-xl sm:text-2xl font-bold text-primary border-4 border-background">
              {profileUser.displayName[0]}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-2 sm:px-4 -top-12 sm:top-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
            <div className="hidden sm:flex h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/10 items-center justify-center text-xl sm:text-2xl font-bold text-primary border-4 border-background relative">
              {profileUser.displayName[0]}
            </div>
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-lg sm:text-xl font-bold">
                {profileUser.displayName}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                @{profileUser.username}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            {isCurrentUser ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="gap-2 w-full sm:w-auto"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                <UserPlus className="h-4 w-4" />
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="flex flex-wrap flex-start items-center gap-4 sm:gap-6 px-2 sm:px-4 text-sm">
          <div className="items-center gap-2 hidden sm:flex">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {new Date(profileUser.createdAt).toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowFollowers(true)}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Object.keys(profileUser.followers || {}).length} followers
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowFollowing(true)}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Object.keys(profileUser.following || {}).length} following
            </span>
          </Button>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className="px-2 sm:px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              {profileUser.bio}
            </p>
          </div>
        )}
      </div>

      {/* Profile Tabs */}
      <div className="border-b mt-4 sm:mt-6">
        <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors",
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
              "py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors",
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
      <div className="mt-4 sm:mt-6">
        {activeTab === "posts" ? (
          userPosts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <PenSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">
                No posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
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
          <div className="space-y-3 sm:space-y-4">
            {userComments.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  No comments yet.
                </p>
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
          isEditing={true}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditProfile}
          initialData={{
            newUsername: profileUser.username,
            displayName: profileUser.displayName,
            dateOfBirth: profileUser.dateOfBirth,
            bio: profileUser.bio,
          }}
        />
      )}

      {/* Modals */}
      <UserListModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followers}
        currentUsername={profileUser.username}
      />
      <UserListModal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={following}
        currentUsername={profileUser.username}
      />
    </div>
  );
}
