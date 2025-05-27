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
    content: string
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
    content: string
  ): Promise<{ postId: string; post: Post }> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const response = await aoClient.createPost(user.username, title, content);
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
      const response = await aoClient.upvotePost(postId);
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
      const response = await aoClient.downvotePost(postId);
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
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const response = await aoClient.sharePost(postId, user.username);
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
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const result = await aoClient.followUser(user.username, following);
      setUser(result.follower);
      await refreshFeed();
      toast.success("User followed successfully!");
      return result;
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
      const response = await aoClient.getFeed();
      setFeedPosts(response.posts);
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast.error("Failed to refresh feed");
    }
  };

  const refreshTrending = async (): Promise<void> => {
    try {
      const response = await aoClient.getTrending();
      setTrendingPosts(response.posts);
    } catch (error) {
      console.error("Error refreshing trending:", error);
      toast.error("Failed to refresh trending posts");
    }
  };

  const refreshLeaderboard = async (): Promise<void> => {
    try {
      const response = await aoClient.getLeaderboard();
      setTopCreators(response.users);
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    }
  };

  const getUserPosts = async (username: string): Promise<Post[]> => {
    try {
      const response = await aoClient.getUserPosts(username);
      return response.posts;
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
      const response = await aoClient.getUserComments(username);
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

        // Load user posts
        const posts = await getUserPosts(username);
        setUserPosts(posts);

        // Load user comments
        const comments = await getUserComments(username);
        setUserComments(comments);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
      throw error;
    }
  };

  const handleFollowUser = async (username: string): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      const result = await aoClient.followUser(user.username, username);
      setUser(result.follower);

      // Update profile user's followers list if we're viewing their profile
      if (profileUser?.username === username) {
        setProfileUser(result.following);
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
