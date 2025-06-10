"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/lib/ao-client";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/global-context";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Users2 } from "lucide-react";
import { Avatar } from "../ui/avatar";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  currentUsername: string;
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  currentUsername,
}: UserListModalProps) {
  const { followUser, user, profileUser } = useGlobal();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isFollowing, setIsFollowing] = useState<Record<string, boolean>>({});

  // Initialize following state
  useEffect(() => {
    const following: Record<string, boolean> = {};
    users.forEach((u) => {
      following[u.username] = u.isFollowing || false;
    });
    setFollowingMap(following);
  }, [users]);

  const handleFollow = async (targetUsername: string) => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }

    if (isFollowing[targetUsername]) return;
    setIsFollowing((prev) => ({ ...prev, [targetUsername]: true }));

    try {
      await followUser(targetUsername);
      setFollowingMap((prev) => ({
        ...prev,
        [targetUsername]: !prev[targetUsername],
      }));
      toast.success(
        followingMap[targetUsername]
          ? `Unfollowed ${targetUsername}`
          : `Following ${targetUsername}`
      );
    } catch (error) {
      toast.error("Failed to follow user");
      console.error(error);
    } finally {
      setIsFollowing((prev) => ({ ...prev, [targetUsername]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[600px] h-[80vh] sm:h-[70vh] max-w-[600px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[calc(80vh-80px)] sm:max-h-[calc(70vh-80px)] overflow-y-auto px-2 sm:px-4">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <Users2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-muted-foreground">
                No users found
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div
                  className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/profile/${user.username}`)
                  }
                >
                  <Avatar
                    displayName={user.displayName}
                    profileImageUrl={user.profileImageUrl}
                    size="sm"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  />
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-medium truncate group-hover:text-primary transition-colors">
                      {user.displayName}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>
                {user.username !== currentUsername &&
                  user.username !== profileUser?.username && (
                    <Button
                      variant={
                        followingMap[user.username] ? "secondary" : "default"
                      }
                      size="sm"
                      onClick={() => handleFollow(user.username)}
                      disabled={isFollowing[user.username]}
                      className="h-7 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
                    >
                      {isFollowing[user.username] ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : followingMap[user.username] ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
