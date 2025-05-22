"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";

// Define enum for AO process status
export enum AOProcessStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

// Define enum for connection results
export enum AOConnectionResult {
  CONNECTED = "connected",
  USER_CANCELLED = "cancelled",
  ERROR = "error",
}

// Define interface for AO connection response
export interface AOConnectionResponse {
  status: AOConnectionResult;
  message?: string;
  error?: Error;
}

// Define interfaces for AO data
export interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  wallet: string;
  score: number;
  posts: Record<string, Post>;
  createdAt: number;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: number;
}

// Update the context type with the enum
interface AOContextType {
  processId: string;
  processStatus: AOProcessStatus;
  isConnecting: boolean;
  error: string | null;
  user: User | null;
  posts: Post[];
  connectToProcess: () => Promise<boolean>;
  disconnectProcess: () => void;
  createPost: (content: string) => Promise<boolean>;
  upvotePost: (postId: string) => Promise<boolean>;
  downvotePost: (postId: string) => Promise<boolean>;
  getFeed: () => Promise<Post[]>;
  getTrending: () => Promise<Post[]>;
  getLeaderboard: () => Promise<User[]>;
}

const AOContext = createContext<AOContextType | undefined>(undefined);

export function AOProvider({ children }: { children: ReactNode }) {
  const [processId, setProcessId] = useState<string>("");
  const [processStatus, setProcessStatus] = useState<AOProcessStatus>(
    AOProcessStatus.DISCONNECTED
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  /**
   * Checks if the AO process is already connected
   */
  const checkProcessConnection = async (): Promise<void> => {
    try {
      // TODO: Implement AO process connection check
      // This will be similar to checkWalletConnection but for AO
      setProcessStatus(AOProcessStatus.DISCONNECTED);
    } catch (err) {
      console.error("Error checking AO process connection:", err);
      setProcessStatus(AOProcessStatus.ERROR);
      setError("Failed to check AO process connection");
    }
  };

  // Check process connection on component mount
  useEffect(() => {
    checkProcessConnection();
  }, []);

  /**
   * Connect to AO process and handle different connection scenarios
   */
  const connectToProcess = async (): Promise<boolean> => {
    if (processStatus === AOProcessStatus.CONNECTED) {
      return true; // Already connected
    }

    try {
      setIsConnecting(true);
      setProcessStatus(AOProcessStatus.CONNECTING);
      setError(null);

      // TODO: Implement AO process connection
      // This will be similar to connectToWallet but for AO

      setProcessStatus(AOProcessStatus.CONNECTED);
      return true;
    } catch (err) {
      console.error("Error connecting to AO process:", err);
      setProcessStatus(AOProcessStatus.ERROR);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to AO process";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect the AO process
   */
  const handleDisconnectProcess = (): void => {
    try {
      // TODO: Implement AO process disconnection
      setProcessId("");
      setProcessStatus(AOProcessStatus.DISCONNECTED);
      setUser(null);
      setPosts([]);
      toast("AO process disconnected", {
        icon: "🔌",
      });
    } catch (err) {
      console.error("Error disconnecting AO process:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disconnect AO process";
      toast.error(errorMessage);
    }
  };

  /**
   * Create a new post
   */
  const createPost = async (content: string): Promise<boolean> => {
    try {
      // TODO: Implement post creation
      return true;
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create post";
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Upvote a post
   */
  const upvotePost = async (postId: string): Promise<boolean> => {
    try {
      // TODO: Implement post upvoting
      return true;
    } catch (err) {
      console.error("Error upvoting post:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upvote post";
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Downvote a post
   */
  const downvotePost = async (postId: string): Promise<boolean> => {
    try {
      // TODO: Implement post downvoting
      return true;
    } catch (err) {
      console.error("Error downvoting post:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to downvote post";
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Get the feed of posts
   */
  const getFeed = async (): Promise<Post[]> => {
    try {
      // TODO: Implement feed fetching
      return [];
    } catch (err) {
      console.error("Error getting feed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get feed";
      toast.error(errorMessage);
      return [];
    }
  };

  /**
   * Get trending posts
   */
  const getTrending = async (): Promise<Post[]> => {
    try {
      // TODO: Implement trending posts fetching
      return [];
    } catch (err) {
      console.error("Error getting trending posts:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get trending posts";
      toast.error(errorMessage);
      return [];
    }
  };

  /**
   * Get leaderboard
   */
  const getLeaderboard = async (): Promise<User[]> => {
    try {
      // TODO: Implement leaderboard fetching
      return [];
    } catch (err) {
      console.error("Error getting leaderboard:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get leaderboard";
      toast.error(errorMessage);
      return [];
    }
  };

  return (
    <AOContext.Provider
      value={{
        processId,
        processStatus,
        isConnecting,
        error,
        user,
        posts,
        connectToProcess,
        disconnectProcess: handleDisconnectProcess,
        createPost,
        upvotePost,
        downvotePost,
        getFeed,
        getTrending,
        getLeaderboard,
      }}
    >
      {children}
    </AOContext.Provider>
  );
}

/**
 * Custom hook to use the AO context
 */
export function useAO(): AOContextType {
  const context = useContext(AOContext);
  if (context === undefined) {
    throw new Error("useAO must be used within an AOProvider");
  }
  return context;
}
