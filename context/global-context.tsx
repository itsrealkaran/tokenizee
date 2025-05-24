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
} from "@/lib/ao-client";
import { toast } from "react-hot-toast";

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
  updateUserProfile: (
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
  // AO API Methods
  registerUser: (
    username: string,
    displayName: string,
    dateOfBirth: string,
    bio: string
  ) => Promise<boolean>;
  createPost: (title: string, content: string) => Promise<boolean>;
  commentPost: (postId: string, content: string) => Promise<boolean>;
  loadComments: (postId: string) => Promise<Comment[]>;
  upvotePost: (postId: string) => Promise<boolean>;
  downvotePost: (postId: string) => Promise<boolean>;
  sharePost: (postId: string) => Promise<boolean>;
  followUser: (following: string) => Promise<boolean>;
  searchUser: (searchTerm: string) => Promise<User[]>;
  refreshFeed: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  getUserPosts: (username: string) => Promise<Post[]>;
  getUserComments: (username: string) => Promise<Comment[]>;
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
              setUser(userData);
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
                username: updatedUser.username,
                displayName: updatedUser.displayName,
              },
            }
          : post
      );

    setFeedPosts(updatePosts(feedPosts));
    setTrendingPosts(updatePosts(trendingPosts));
  };

  const updateUserProfile = async (
    displayName: string,
    dateOfBirth: string,
    bio: string
  ): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      await aoClient.updateUser(user.username, displayName, dateOfBirth, bio);

      const userData = await aoClient.getUser({ username: user.username });
      setUser(userData);
      toast.success("Profile updated successfully!");
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
      if (!user?.wallet) {
        throw new Error("Wallet not connected");
      }

      await aoClient.registerUser(
        username,
        displayName,
        dateOfBirth,
        bio,
        user.wallet
      );

      const userData = await aoClient.getUser({ username });
      setUser(userData);
      setIsLoggedIn(true);
      toast.success("Registration successful!");
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
    content: string
  ): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      await aoClient.createPost(user.username, title, content);
      await refreshFeed();
      toast.success("Post created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
      return false;
    }
  };

  const commentPost = async (
    postId: string,
    content: string
  ): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      await aoClient.commentPost(postId, user.username, content);
      await refreshFeed();
      toast.success("Comment posted successfully!");
      return true;
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to comment on post"
      );
      return false;
    }
  };

  const loadComments = async (postId: string): Promise<Comment[]> => {
    try {
      return await aoClient.loadComments(postId);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load comments"
      );
      return [];
    }
  };

  const upvotePost = async (postId: string): Promise<boolean> => {
    try {
      await aoClient.upvotePost(postId);
      await refreshFeed();
      await refreshTrending();
      return true;
    } catch (error) {
      console.error("Error upvoting post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upvote post"
      );
      return false;
    }
  };

  const downvotePost = async (postId: string): Promise<boolean> => {
    try {
      await aoClient.downvotePost(postId);
      await refreshFeed();
      await refreshTrending();
      return true;
    } catch (error) {
      console.error("Error downvoting post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to downvote post"
      );
      return false;
    }
  };

  const sharePost = async (postId: string): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      await aoClient.sharePost(postId, user.username);
      await refreshFeed();
      toast.success("Post shared successfully!");
      return true;
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to share post"
      );
      return false;
    }
  };

  const followUser = async (following: string): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const { follower, following: followedUser } = await aoClient.followUser(
        user.username,
        following
      );
      setUser(follower);
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

  const searchUser = async (searchTerm: string): Promise<User[]> => {
    try {
      return await aoClient.searchUser(searchTerm);
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
      const feed = await aoClient.getFeed();
      setFeedPosts(feed);
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast.error("Failed to refresh feed");
    }
  };

  const refreshTrending = async (): Promise<void> => {
    try {
      const trending = await aoClient.getTrending();
      setTrendingPosts(trending);
    } catch (error) {
      console.error("Error refreshing trending:", error);
      toast.error("Failed to refresh trending posts");
    }
  };

  const refreshLeaderboard = async (): Promise<void> => {
    try {
      const leaderboard = await aoClient.getLeaderboard();
      setTopCreators(leaderboard);
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    }
  };

  const getUserPosts = async (username: string): Promise<Post[]> => {
    try {
      return await aoClient.getUserPosts(username);
    } catch (error) {
      console.error("Error getting user posts:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get user posts"
      );
      return [];
    }
  };

  const getUserComments = async (username: string): Promise<Comment[]> => {
    try {
      return await aoClient.getUserComments(username);
    } catch (error) {
      console.error("Error getting user comments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get user comments"
      );
      return [];
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
