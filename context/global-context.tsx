"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  getAOClient,
  User,
  Post,
  Comment,
  LeaderboardEntry,
  Notification,
  UserStats,
  PostStats,
} from "@/lib/ao-client";
import { toast } from "react-hot-toast";

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
  updateUserProfile: (
    newUsername: string,
    displayName: string,
    dateOfBirth: string,
    bio: string
  ) => Promise<boolean>;
  logout: () => void;
  feedPosts: Post[];
  trendingPosts: Post[];
  topCreators: LeaderboardEntry[];
  setFeedPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setTopCreators: (creators: LeaderboardEntry[]) => void;
  walletConnected: boolean;
  setWalletConnected: (value: boolean) => void;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  checkUserExists: (params: {
    wallet?: string;
    username?: string;
  }) => Promise<boolean>;
  // Profile related state and functions
  profileUser: User | null;
  setProfileUser: (user: User | null) => void;
  userPosts: Post[];
  setUserPosts: (posts: Post[]) => void;
  userComments: Comment[];
  setUserComments: (comments: Comment[]) => void;
  loadProfileData: (username: string) => Promise<void>;
  handleFollowUser: (username: string) => Promise<boolean>;
  // AO API Methods
  registerUser: (
    username: string,
    displayName: string,
    dateOfBirth: string,
    bio: string
  ) => Promise<boolean>;
  createPost: (
    title: string,
    content: string,
    topics: string[]
  ) => Promise<{ postId: string; post: Post }>;
  commentPost: (
    postId: string,
    content: string
  ) => Promise<{ commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<Comment[]>;
  upvotePost: (postId: string) => Promise<Post>;
  downvotePost: (postId: string) => Promise<Post>;
  sharePost: (postId: string) => Promise<Post>;
  followUser: (
    following: string
  ) => Promise<{ follower: User; following: User }>;
  searchUser: (searchTerm: string) => Promise<User[]>;
  refreshFeed: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  getUserPosts: (wallet: string) => Promise<Post[]>;
  getUserComments: (wallet: string) => Promise<Comment[]>;
  // New handlers
  getNotifications: () => Promise<{
    notifications: Notification[];
    unreadCount: number;
  }>;
  markNotificationsRead: () => Promise<{ message: string }>;
  bookmarkPost: (
    postId: string,
    action: "add" | "remove"
  ) => Promise<{ message: string; bookmarkedPosts: string[]; post: Post }>;
  getPersonalizedFeed: () => Promise<Post[]>;
  getBookmarkedFeed: () => Promise<Post[]>;
  getTopicFeed: (topic: string) => Promise<Post[]>;
  getUserStats: (wallet: string) => Promise<UserStats>;
  getPostStats: (postId: string) => Promise<PostStats>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [topCreators, setTopCreators] = useState<LeaderboardEntry[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);

  // Initialize AO Client
  const aoClient = getAOClient(process.env.NEXT_PUBLIC_AO_PROCESS_ID || "");

  const checkUserExists = async (params: {
    wallet?: string;
    username?: string;
  }): Promise<boolean> => {
    try {
      const userData = await aoClient.getUser(params);
      return !!userData;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      return false;
    }
  };

  // Check user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        if (typeof window !== "undefined" && window.arweaveWallet) {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setWalletAddress(address);
            setWalletConnected(true);

            const userExists = await checkUserExists({ wallet: address });
            if (userExists) {
              const userData = await aoClient.getUser({ wallet: address });
              setUser(userData.user);
              console.log("userData", userData, user);
              setIsLoggedIn(true);
            }
          } else {
            setWalletConnected(false);
            setWalletAddress(null);
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setWalletConnected(false);
        setWalletAddress(null);
      }
    };

    checkUserSession();
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setFeedPosts([]);
    setTrendingPosts([]);
    setTopCreators([]);
    setWalletConnected(false);
    setWalletAddress(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update user info in posts where they are the author
    const updatePosts = (posts: Post[]) =>
      posts.map((post) =>
        post.author.username === user?.username
          ? {
              ...post,
              author: {
                wallet: updatedUser.wallet,
                username: updatedUser.username,
                displayName: updatedUser.displayName,
              },
            }
          : post
      );

    setFeedPosts(updatePosts(feedPosts));
    setTrendingPosts(updatePosts(trendingPosts));

    // Update profile user if it's the same user
    if (profileUser?.username === user?.username) {
      setProfileUser(updatedUser);
    }
  };

  const updateUserProfile = async (
    newUsername: string,
    displayName: string,
    dateOfBirth: string,
    bio: string
  ): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const response = await aoClient.updateUser(
        user.username,
        newUsername,
        displayName,
        dateOfBirth,
        bio
      );

      // Update the user state with the new data
      setUser(response.user);

      // If we're viewing our own profile, update profileUser as well
      if (profileUser?.username === user.username) {
        setProfileUser(response.user);
      }

      toast.success(response.message);
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
      return false;
    }
  };

  // AO API Methods
  const registerUser = async (
    username: string,
    displayName: string,
    dateOfBirth: string,
    bio: string
  ): Promise<boolean> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const response = await aoClient.registerUser(
        username,
        displayName,
        dateOfBirth,
        bio,
        walletAddress
      );

      setUser(response.user);
      setIsLoggedIn(true);
      toast.success(response.message);
      return true;
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
      return false;
    }
  };

  const createPost = async (
    title: string,
    content: string,
    topics: string[]
  ): Promise<{ postId: string; post: Post }> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const response = await aoClient.createPost(
        user.username,
        title,
        content,
        topics
      );
      await refreshFeed();
      toast.success(response.message);
      return { postId: response.postId, post: response.post };
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
      throw error;
    }
  };

  const commentPost = async (
    postId: string,
    content: string
  ): Promise<{ commentId: string; comment: Comment }> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const response = await aoClient.commentPost(
        postId,
        user.username,
        content
      );

      // Update feed posts to include the new comment
      setFeedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, response.commentId] }
            : post
        )
      );

      // Update trending posts if the post exists there
      setTrendingPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, response.commentId] }
            : post
        )
      );

      toast.success(response.message);
      return { commentId: response.commentId, comment: response.comment };
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to comment on post"
      );
      throw error;
    }
  };

  const loadComments = async (postId: string): Promise<Comment[]> => {
    try {
      const response = await aoClient.loadComments(postId);
      // Sort comments by creation time (newest first)
      const sortedComments = response.comments.sort(
        (a, b) => b.createdAt - a.createdAt
      );
      return sortedComments;
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load comments"
      );
      return [];
    }
  };

  const upvotePost = async (postId: string): Promise<Post> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.upvotePost(postId, walletAddress);
      await refreshFeed();
      await refreshTrending();
      toast.success(response.message);
      return response.post;
    } catch (error) {
      console.error("Error upvoting post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upvote post"
      );
      throw error;
    }
  };

  const downvotePost = async (postId: string): Promise<Post> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.downvotePost(postId, walletAddress);
      await refreshFeed();
      await refreshTrending();
      toast.success(response.message);
      return response.post;
    } catch (error) {
      console.error("Error downvoting post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to downvote post"
      );
      throw error;
    }
  };

  const sharePost = async (postId: string): Promise<Post> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const response = await aoClient.sharePost(postId, walletAddress);
      await refreshFeed();
      toast.success(response.message);
      return response.post;
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to share post"
      );
      throw error;
    }
  };

  const followUser = async (
    following: string
  ): Promise<{ follower: User; following: User }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // First get the following user's wallet address
      const followingUserData = await aoClient.getUser({ username: following });
      const result = await aoClient.followUser(
        walletAddress,
        followingUserData.user.wallet
      );
      setUser(result.result.follower);
      await refreshFeed();
      toast.success("User followed successfully!");
      return result.result;
    } catch (error) {
      console.error("Error following user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to follow user"
      );
      throw error;
    }
  };

  const searchUser = async (searchTerm: string): Promise<User[]> => {
    try {
      const response = await aoClient.searchUser(searchTerm);
      return response.users;
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to search users"
      );
      return [];
    }
  };

  const refreshFeed = async (): Promise<void> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getFeed(walletAddress);
      setFeedPosts(response.posts);
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast.error("Failed to refresh feed");
    }
  };

  const refreshTrending = async (): Promise<void> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getTrending(walletAddress);
      setTrendingPosts(response.posts);
    } catch (error) {
      console.error("Error refreshing trending:", error);
      toast.error("Failed to refresh trending posts");
    }
  };

  const refreshLeaderboard = async (): Promise<void> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getLeaderboard(walletAddress);
      setTopCreators(response.users);
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    }
  };

  const getUserPosts = async (wallet: string): Promise<Post[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getUserPosts(wallet, walletAddress);
      return response.posts;
    } catch (error) {
      console.error("Error getting user posts:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get user posts"
      );
      return [];
    }
  };

  const getUserComments = async (wallet: string): Promise<Comment[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getUserComments(wallet, walletAddress);
      return response.comments;
    } catch (error) {
      console.error("Error getting user comments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get user comments"
      );
      return [];
    }
  };

  const loadProfileData = async (username: string) => {
    try {
      // Only fetch if the username is different from current profile user
      if (!profileUser || profileUser.username !== username) {
        // Load user data
        const userData = await aoClient.getUser({ username });
        setProfileUser(userData.user);

        // Load user posts using the wallet from userData
        const posts = await aoClient.getUserPosts(
          userData.user.wallet,
          walletAddress || ""
        );
        setUserPosts(posts.posts);

        // Load user comments using the wallet from userData
        const comments = await aoClient.getUserComments(
          userData.user.wallet,
          walletAddress || ""
        );
        setUserComments(comments.comments);

        // Load user stats using the wallet from userData
        const stats = await aoClient.getUserStats(
          userData.user.wallet,
          walletAddress || ""
        );
        // You might want to store stats in state if needed
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
      throw error;
    }
  };

  const handleFollowUser = async (username: string): Promise<boolean> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Use wallet from profileUser if available
      const followingWallet = profileUser?.wallet;
      if (!followingWallet) {
        throw new Error("User wallet not found");
      }

      const result = await aoClient.followUser(walletAddress, followingWallet);
      setUser(result.result.follower);

      // Update profile user's followers list if we're viewing their profile
      if (profileUser?.username === username) {
        setProfileUser(result.result.following);
      }

      await refreshFeed();
      toast.success("User followed successfully!");
      return true;
    } catch (error) {
      console.error("Error following user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to follow user"
      );
      return false;
    }
  };

  // Refresh data periodically
  useEffect(() => {
    if (isLoggedIn) {
      refreshFeed();
      refreshTrending();
      refreshLeaderboard();

      const interval = setInterval(() => {
        refreshFeed();
        refreshTrending();
        refreshLeaderboard();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Add new handler implementations
  const getNotifications = async (): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getNotifications(walletAddress);
      return response;
    } catch (error) {
      console.error("Error getting notifications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get notifications"
      );
      throw error;
    }
  };

  const markNotificationsRead = async (): Promise<{ message: string }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.markNotificationsRead(walletAddress);
      toast.success(response.message);
      return response;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read"
      );
      throw error;
    }
  };

  const bookmarkPost = async (
    postId: string,
    action: "add" | "remove"
  ): Promise<{ message: string; bookmarkedPosts: string[]; post: Post }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.bookmarkPost(
        walletAddress,
        postId,
        action
      );
      toast.success(response.message);
      return response;
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to bookmark post"
      );
      throw error;
    }
  };

  const getPersonalizedFeed = async (): Promise<Post[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getPersonalizedFeed(
        walletAddress,
        walletAddress
      );
      return response.posts;
    } catch (error) {
      console.error("Error getting personalized feed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to get personalized feed"
      );
      return [];
    }
  };

  const getBookmarkedFeed = async (): Promise<Post[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getBookmarkedFeed(
        walletAddress,
        walletAddress
      );
      return response.posts;
    } catch (error) {
      console.error("Error getting bookmarked feed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get bookmarked feed"
      );
      return [];
    }
  };

  const getTopicFeed = async (topic: string): Promise<Post[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getTopicFeed(topic, walletAddress);
      return response.posts;
    } catch (error) {
      console.error("Error getting topic feed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get topic feed"
      );
      return [];
    }
  };

  const getUserStats = async (wallet: string): Promise<UserStats> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getUserStats(wallet, walletAddress);
      return response;
    } catch (error) {
      console.error("Error getting user stats:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get user stats"
      );
      throw error;
    }
  };

  const getPostStats = async (postId: string): Promise<PostStats> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getPostStats(postId, walletAddress);
      return response;
    } catch (error) {
      console.error("Error getting post stats:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get post stats"
      );
      throw error;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        updateUser,
        updateUserProfile,
        logout,
        feedPosts,
        trendingPosts,
        topCreators,
        setFeedPosts,
        setTrendingPosts,
        setTopCreators,
        walletConnected,
        setWalletConnected,
        walletAddress,
        setWalletAddress,
        checkUserExists,
        profileUser,
        setProfileUser,
        userPosts,
        setUserPosts,
        userComments,
        setUserComments,
        loadProfileData,
        handleFollowUser,
        // AO API Methods
        registerUser,
        createPost,
        commentPost,
        loadComments,
        upvotePost,
        downvotePost,
        sharePost,
        followUser,
        searchUser,
        refreshFeed,
        refreshTrending,
        refreshLeaderboard,
        getUserPosts,
        getUserComments,
        // New handlers
        getNotifications,
        markNotificationsRead,
        bookmarkPost,
        getPersonalizedFeed,
        getBookmarkedFeed,
        getTopicFeed,
        getUserStats,
        getPostStats,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
