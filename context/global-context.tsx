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
  logout: () => void;
  feedPosts: Post[];
  trendingPosts: Post[];
  userPosts: Post[];
  topCreators: LeaderboardEntry[];
  setFeedPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setUserPosts: (posts: Post[]) => void;
  setTopCreators: (creators: LeaderboardEntry[]) => void;
  walletConnected: boolean;
  setWalletConnected: (value: boolean) => void;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  checkUserExists: (walletAddress: string) => Promise<boolean>;
  // AO API Methods
  registerUser: (
    username: string,
    displayName: string,
    dateOfBirth: string
  ) => Promise<boolean>;
  createPost: (title: string, content: string) => Promise<boolean>;
  commentPost: (postId: string, content: string) => Promise<boolean>;
  upvotePost: (postId: string) => Promise<boolean>;
  downvotePost: (postId: string) => Promise<boolean>;
  sharePost: (postId: string) => Promise<boolean>;
  followUser: (following: string) => Promise<boolean>;
  searchUser: (searchTerm: string) => Promise<User[]>;
  refreshFeed: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [topCreators, setTopCreators] = useState<LeaderboardEntry[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Initialize AO Client
  const aoClient = getAOClient(
    process.env.NEXT_PUBLIC_AO_PROCESS_ID ||
      "UXCykyuzt_aHqn50GtOk9qDa4BicuLyPKIF_mmrNW-M"
  );

  const checkUserExists = async (walletAddress: string): Promise<boolean> => {
    try {
      const userData = await aoClient.getUser(walletAddress);
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

            const userExists = await checkUserExists(address);
            if (userExists) {
              const userData = await aoClient.getUser(address);
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
    setUserPosts([]);
    setTopCreators([]);
    setWalletConnected(false);
    setWalletAddress(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update user info in all posts where they are the author
    const updatePosts = (posts: Post[]) =>
      posts.map((post) =>
        post.author === user?.username
          ? {
              ...post,
              author: updatedUser.username,
            }
          : post
      );

    setFeedPosts(updatePosts(feedPosts));
    setTrendingPosts(updatePosts(trendingPosts));
    setUserPosts(updatePosts(userPosts));
  };

  // AO API Methods
  const registerUser = async (
    username: string,
    displayName: string,
    dateOfBirth: string
  ): Promise<boolean> => {
    try {
      if (!user?.wallet) {
        throw new Error("Wallet not connected");
      }

      await aoClient.registerUser(
        username,
        displayName,
        dateOfBirth,
        user.wallet
      );

      const userData = await aoClient.getUser(user.wallet);
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

      await aoClient.followUser(user.username, following);
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
      const results = await aoClient.searchUser(searchTerm);
      return results;
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
        logout,
        feedPosts,
        trendingPosts,
        userPosts,
        topCreators,
        setFeedPosts,
        setTrendingPosts,
        setUserPosts,
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
        upvotePost,
        downvotePost,
        sharePost,
        followUser,
        searchUser,
        refreshFeed,
        refreshTrending,
        refreshLeaderboard,
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
