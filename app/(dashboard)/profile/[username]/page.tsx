"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { useGlobal } from "@/context/global-context";
import {
  Calendar,
  Users,
  PenSquare,
  MessageCircle,
  Loader2,
  UserPlus2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  RegisterModal,
  RegisterFormData,
} from "@/components/modals/register-modal";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CommentCard } from "@/components/feed/comment-card";
import { UserListModal } from "@/components/modals/user-list-modal";
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
  } = useGlobal();
  const [profileUser, setProfileUser] = useState<User | null>(
    initialProfileUser
  );
  const [userPosts, setUserPosts] = useState<Post[]>(initialUserPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Sync local state with global state
  useEffect(() => {
    setProfileUser(initialProfileUser);
    setUserPosts(initialUserPosts);
  }, [initialProfileUser, initialUserPosts]);

  const fetchProfileData = useCallback(
    async (username: string) => {
      try {
        setIsLoading(true);
        setIsLoadingContent(true);
        await loadProfileData(username);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
        setIsLoadingContent(false);
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
      setIsLoadingContent(false);
    }
  }, [params.username, profileUser, fetchProfileData]);

  const handleEditProfile = async (data: RegisterFormData) => {
    if (!user) return;

    try {
      // The updateUserProfile function is now called directly from the RegisterModal
      // This handler is kept for any additional profile-specific logic
      setIsEditing(false);
      if (data.newUsername !== user.username) {
        router.push(`/profile/${data.newUsername}`);
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
      const success = await handleFollowUser(profileUser.username);
      if (success) {
        toast.success(
          profileUser.isFollowing
            ? "Unfollowed successfully"
            : "Followed successfully"
        );
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShowFollowers = async () => {
    if (!profileUser) return;
    setFollowersList(profileUser.followersList || []);
    setShowFollowers(true);
  };

  const handleShowFollowing = async () => {
    if (!profileUser) return;
    setFollowingList(profileUser.followingList || []);
    setShowFollowing(true);
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

  return (
    <div className="max-w-2xl mx-auto pb-2 sm:px-6">
      {/* Profile Header */}
      <div className="space-y-4 sm:space-y-6">
        {/* Cover Image Placeholder */}
        <div
          className="flex h-24 mb-14 sm:mb-0 sm:h-44 items-center justify-center bg-primary/20 rounded-lg relative"
          style={{
            backgroundImage: profileUser.backgroundImageUrl
              ? `url(${profileUser.backgroundImageUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex sm:hidden -mb-32 sm:mb-0 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-avatar">
            <div
              className="flex sm:hidden h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-avatar items-center justify-center text-xl sm:text-2xl font-bold text-primary border-4 border-background"
              style={{
                backgroundImage: profileUser.profileImageUrl
                  ? `url(${profileUser.profileImageUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!profileUser.profileImageUrl && profileUser.displayName[0]}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-2 sm:px-4 -top-12 sm:top-0">
          <div className="flex flex-col items-center sm:-mt-16 gap-3 sm:items-start sm:gap-4">
            <div
              className="hidden sm:flex h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-avatar items-center justify-center text-xl sm:text-2xl font-bold text-primary border-4 border-background relative"
              style={{
                backgroundImage: profileUser.profileImageUrl
                  ? `url(${profileUser.profileImageUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!profileUser.profileImageUrl && profileUser.displayName[0]}
            </div>
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-lg sm:text-xl font-bold">
                {profileUser.displayName}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                @{profileUser.username}
              </p>
              {profileUser.bio && (
                <p className="text-sm text-foreground mt-4">
                  {profileUser.bio}
                </p>
              )}
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
                variant={profileUser.isFollowing ? "outline" : "default"}
                size="sm"
                className="gap-2 w-full sm:w-auto"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                <UserPlus2 className="h-4 w-4" />
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : profileUser.isFollowing ? (
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
            onClick={handleShowFollowers}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {profileUser.followers} followers
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleShowFollowing}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {profileUser.following} following
            </span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === "posts"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("posts")}
          >
            {`Posts (${profileUser.posts})`}
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === "comments"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("comments")}
          >
            {`Comments (${profileUser.comments})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoadingContent ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "posts" ? (
          userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onViewPost={() => router.push(`/feed/${post.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PenSquare className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No posts yet</p>
            </div>
          )
        ) : userComments.length > 0 ? (
          <div className="space-y-4">
            {userComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <p className="text-muted-foreground mt-2">No comments yet</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RegisterModal
        isOpen={isEditing}
        isEditing={true}
        onClose={() => setIsEditing(false)}
        onSubmit={handleEditProfile}
        initialData={{
          newUsername: profileUser.username,
          displayName: profileUser.displayName,
          dateOfBirth: profileUser.dateOfBirth,
          bio: profileUser.bio || "",
          profileImageUrl: profileUser.profileImageUrl,
          backgroundImageUrl: profileUser.backgroundImageUrl,
        }}
      />
      <UserListModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followersList}
        currentUsername={profileUser.username}
      />
      <UserListModal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={followingList}
        currentUsername={profileUser.username}
      />
    </div>
  );
}
