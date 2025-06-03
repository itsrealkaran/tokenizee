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
      <DialogContent className="sm:max-w-[425px] h-[50vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto p-2">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div
                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/profile/${user.username}`)
                  }
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {user.displayName[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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
                    className="h-7 px-2 text-xs"
                  >
                    {isFollowing[user.username] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
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
