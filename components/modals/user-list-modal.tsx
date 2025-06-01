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
import { Loader2 } from "lucide-react";

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
  const { followUser, user } = useGlobal();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isFollowing, setIsFollowing] = useState<Record<string, boolean>>({});

  // Initialize following state
  useEffect(() => {
    const following: Record<string, boolean> = {};
    users.forEach((u) => {
      // Check if the current user is following this user
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No users found
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {user.displayName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                {user.username !== currentUsername && (
                  <Button
                    variant={
                      followingMap[user.username] ? "secondary" : "default"
                    }
                    size="sm"
                    onClick={() => handleFollow(user.username)}
                    disabled={isFollowing[user.username]}
                  >
                    {isFollowing[user.username] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
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
