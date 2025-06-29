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
  MediaItem,
} from "@/lib/ao-client";
import { toast } from "react-hot-toast";
import { uploadFileTurbo } from "@/lib/turbo";
import { uploadFileAO } from "@/lib/aoupload";
import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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
    bio: string,
    profileImage?: File,
    backgroundImage?: File
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
  topic: string[];
  // AO API Methods
  registerUser: (
    username: string,
    displayName: string,
    dateOfBirth: string,
    bio: string,
    profileImage?: File,
    backgroundImage?: File
  ) => Promise<boolean>;
  createPost: (
    title: string,
    content: string,
    topics: string[],
    mediaFiles?: File[]
  ) => Promise<{ postId: string; post: Post }>;
  commentPost: (
    postId: string,
    content: string
  ) => Promise<{ commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<Comment[]>;
  upvotePost: (postId: string) => Promise<Post>;
  downvotePost: (postId: string) => Promise<Post>;
  removeVote: (postId: string) => Promise<Post>;
  sharePost: (postId: string) => Promise<Post>;
  followUser: (
    following: string
  ) => Promise<{ follower: User; following: User }>;
  search: (
    query: string,
    type?: "all" | "users" | "posts" | "comments"
  ) => Promise<{
    query: string;
    type: string;
    results: { users: User[]; posts: Post[]; comments: Comment[] };
  }>;
  refreshFeed: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  getUserPosts: (wallet: string) => Promise<Post[]>;
  getUserComments: (wallet: string) => Promise<Comment[]>;
  bookmarkPost: (
    postId: string,
    action: "add" | "remove"
  ) => Promise<{ message: string; bookmarkedPosts: string[]; post: Post }>;
  getPersonalizedFeed: () => Promise<Post[]>;
  getBookmarkedFeed: () => Promise<Post[]>;
  getTopicFeed: (topic: string) => Promise<Post[]>;
  getFollowersList: (wallet: string) => Promise<User[]>;
  getFollowingList: (wallet: string) => Promise<User[]>;
  uploadMedia: (file: File) => Promise<string>;
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
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const topic = [
    "web3",
    "arweave",
    "ao",
    "permaweb",
    "gaming",
    "nft",
    "art",
    "music",
    "defi",
    "video",
    "general",
    "crypto",
    "blockchain",
    "technology",
    "science",
    "politics",
    "economy",
    "business",
    "finance",
    "investment",
    "ai",
    "metaverse",
    "dao",
    "trading",
    "mining",
    "staking",
    "yield",
    "governance",
    "privacy",
    "security",
    "scaling",
    "layer2",
    "ml",
    "data",
    "cloud",
  ];

  // Initialize AO Client
  const aoClient = getAOClient(process.env.NEXT_PUBLIC_AO_PROCESS_ID || "");

  const checkUserExists = async (params: {
    wallet?: string;
    username?: string;
  }): Promise<boolean> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const userData = await aoClient.getUser(params, walletAddress);
      if (userData?.user) {
        setUser(userData.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      setUser(null);
      setIsLoggedIn(false);
      return false;
    }
  };

  // Check user session on mount
  useEffect(() => {
    let isSubscribed = true;
    // Initialize AO Client inside effect to prevent recreation on every render
    const aoClient = getAOClient(process.env.NEXT_PUBLIC_AO_PROCESS_ID || "");

    const checkUserSession = async () => {
      try {
        if (typeof window === "undefined" || !window.arweaveWallet) {
          if (isSubscribed) {
            setWalletConnected(false);
            setWalletAddress(null);
          }
          return;
        }

        const address = await window.arweaveWallet.getActiveAddress();
        if (address && isSubscribed) {
          setWalletAddress(address);
          setWalletConnected(true);

          // Get user data directly instead of checking existence first
          try {
            const userData = await aoClient.getUser(
              { wallet: address },
              address
            );
            if (userData?.user && isSubscribed) {
              setUser(userData.user);
              setIsLoggedIn(true);
            } else if (isSubscribed) {
              setUser(null);
              setIsLoggedIn(false);
            }
          } catch (error) {
            // If user doesn't exist, just set logged out state
            if (isSubscribed) {
              setUser(null);
              setIsLoggedIn(false);
            }
          }
        } else if (isSubscribed) {
          setWalletConnected(false);
          setWalletAddress(null);
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        if (isSubscribed) {
          setWalletConnected(false);
          setWalletAddress(null);
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };

    checkUserSession();

    return () => {
      isSubscribed = false;
    };
  }, []); // Remove aoClient from dependencies since it's now created inside the effect

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

    // Update user info in all relevant posts
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
    setUserPosts(updatePosts(userPosts));

    // Update profile user if it's the same user
    if (profileUser?.username === user?.username) {
      setProfileUser(updatedUser);
    }
  };

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        const baseURL = window.location.origin;

        // Load FFmpeg core files
        await ffmpegInstance.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
        });

        setFFmpeg(ffmpegInstance);
        setIsFFmpegLoaded(true);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
        toast.error("Failed to load media compression tools");
      }
    };

    loadFFmpeg();
  }, []);

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 0.1, // Target 100KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, { type: "image/jpeg" });
    } catch (error) {
      console.error("Image compression failed:", error);
      return file;
    }
  };

  const compressVideo = async (file: File): Promise<File> => {
    if (!ffmpeg || !isFFmpegLoaded) {
      console.warn("FFmpeg not loaded, skipping video compression");
      return file;
    }

    try {
      const inputFileName = "input.mp4";
      const outputFileName = "output.mp4";

      // Write input file to FFmpeg's virtual filesystem
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Run FFmpeg command to compress video
      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-c:v",
        "libx264",
        "-crf",
        "28", // Lower quality = smaller file (range: 0-51)
        "-preset",
        "medium",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outputFileName,
      ]);

      // Read the compressed file
      const data = await ffmpeg.readFile(outputFileName);
      const compressedBlob = new Blob([data], { type: "video/mp4" });

      return new File([compressedBlob], file.name, { type: "video/mp4" });
    } catch (error) {
      console.error("Video compression failed:", error);
      return file;
    }
  };

  const compressAudio = async (file: File): Promise<File> => {
    if (!ffmpeg || !isFFmpegLoaded) {
      console.warn("FFmpeg not loaded, skipping audio compression");
      return file;
    }

    try {
      const inputFileName = "input.mp3";
      const outputFileName = "output.mp3";

      // Write input file to FFmpeg's virtual filesystems
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Run FFmpeg command to compress audio
      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-c:a",
        "libmp3lame",
        "-q:a",
        "4", // Lower quality = smaller file (range: 0-9)
        outputFileName,
      ]);

      // Read the compressed file
      const data = await ffmpeg.readFile(outputFileName);
      const compressedBlob = new Blob([data], { type: "audio/mp3" });

      return new File([compressedBlob], file.name, { type: "audio/mp3" });
    } catch (error) {
      console.error("Audio compression failed:", error);
      return file;
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    try {
      // Check file size
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error("File size exceeds 100MB limit");
      }

      let compressedFile = file;
      const originalSize = file.size;

      // Compress based on file type
      if (file.type.startsWith("image/")) {
        compressedFile = await compressImage(file);
      } else if (file.type.startsWith("video/")) {
        compressedFile = await compressVideo(file);
      } else if (file.type.startsWith("audio/")) {
        compressedFile = await compressAudio(file);
      }

      const compressedSize = compressedFile.size;
      console.log(`Original size: ${originalSize} bytes`);
      console.log(`Compressed size: ${compressedSize} bytes`);
      console.log(
        `Compression ratio: ${((compressedSize / originalSize) * 100).toFixed(2)}%`
      );

      // Upload using appropriate method based on file size
      if (compressedSize > 5 * 1024 * 1024) {
        // 5MB
        console.log("Using AOUpload!");
        const xid = await uploadFileAO(
          compressedFile,
          "Media File",
          "User media file"
        );
        return `https://arweave.net/${xid}`;
      } else {
        console.log("Using Turbo!");
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("title", "Media File");
        formData.append("description", "User media file");
        const result = await uploadFileTurbo(formData);
        if (!result.success) {
          throw new Error(result.error || "Turbo upload failed");
        }
        return `https://arweave.net/${result.id}`;
      }
    } catch (error) {
      console.error("Media upload failed:", error);
      toast.error("Failed to upload media");
      throw error;
    }
  };

  const updateUserProfile = async (
    newUsername: string,
    displayName: string,
    dateOfBirth: string,
    bio: string,
    profileImage?: File,
    backgroundImage?: File
  ): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      let profileImageUrl = user.profileImageUrl;
      let backgroundImageUrl = user.backgroundImageUrl;

      // Upload images if provided
      if (profileImage) {
        console.log("Uploading profile image...");
        profileImageUrl = await uploadMedia(profileImage);
      }
      if (backgroundImage) {
        console.log("Uploading background image...");
        backgroundImageUrl = await uploadMedia(backgroundImage);
      }

      const response = await aoClient.updateUser(
        walletAddress,
        user.username,
        newUsername,
        displayName,
        dateOfBirth,
        bio,
        profileImageUrl,
        backgroundImageUrl
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
    bio: string,
    profileImage?: File,
    backgroundImage?: File
  ): Promise<boolean> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      let profileImageUrl: string | undefined;
      let backgroundImageUrl: string | undefined;

      // Upload images if provided
      if (profileImage) {
        console.log("Uploading profile image...");
        profileImageUrl = await uploadMedia(profileImage);
      }
      if (backgroundImage) {
        console.log("Uploading background image...");
        backgroundImageUrl = await uploadMedia(backgroundImage);
      }

      const response = await aoClient.registerUser(
        username,
        displayName,
        dateOfBirth,
        bio,
        walletAddress,
        profileImageUrl,
        backgroundImageUrl
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

  const createMediaItem = async (file: File): Promise<MediaItem> => {
    try {
      const fileType = file.type.split("/")[0]; // 'image', 'video', or 'audio'
      if (!["image", "video", "audio"].includes(fileType)) {
        throw new Error(
          "Unsupported file type. Only images, videos, and audio files are allowed."
        );
      }

      const url = await uploadMedia(file);
      return {
        url,
        alt: file.name,
        type: fileType as "image" | "video" | "audio",
      };
    } catch (error) {
      console.error("Error creating media item:", error);
      throw error;
    }
  };

  const createPost = async (
    title: string,
    content: string,
    topics: string[],
    mediaFiles?: File[]
  ): Promise<{ postId: string; post: Post }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      let mediaItems: MediaItem[] = [];
      if (mediaFiles && mediaFiles.length > 0) {
        console.log("Uploading media files...");
        mediaItems = await Promise.all(
          mediaFiles.map((file) => createMediaItem(file))
        );
      }

      const response = await aoClient.createPost(
        walletAddress,
        title,
        content,
        topics,
        mediaItems
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
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const response = await aoClient.commentPost(
        postId,
        walletAddress,
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

  const removeVote = async (postId: string): Promise<Post> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.removeVote(postId, walletAddress);
      await refreshFeed();
      await refreshTrending();
      toast.success(response.message);
      return response.post;
    } catch (error) {
      console.error("Error removing vote:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove vote"
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
      const followingUserData = await aoClient.getUser(
        { username: following },
        walletAddress
      );
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
      const response = await aoClient.getUserComments(wallet);
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
        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }

        // Load user data first
        const userData = await aoClient.getUser({ username }, walletAddress);

        console.log(walletAddress, userData);

        if (!userData?.user) {
          throw new Error("User not found");
        }

        // Update profile user with basic data first
        setProfileUser(userData.user);

        try {
          // Load all data in parallel with proper error handling
          const [posts, comments, followers, following] = await Promise.all([
            aoClient.getUserPosts(userData.user.wallet, walletAddress),
            aoClient.getUserComments(userData.user.wallet),
            aoClient.getFollowersList(userData.user.wallet),
            aoClient.getFollowingList(userData.user.wallet),
          ]);

          // Update all states atomically
          setUserPosts(posts.posts);
          setUserComments(comments.comments);
          setProfileUser((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              followersList: followers.users,
              followingList: following.users,
            };
          });
        } catch (error) {
          console.error("Error loading profile details:", error);
          // Keep the basic user data even if details fail to load
          toast.error("Some profile details failed to load");
        }
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load profile data"
      );
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
    let isSubscribed = true;
    let refreshTimeout: NodeJS.Timeout;

    const refreshData = async () => {
      if (!isLoggedIn || !walletAddress || !isSubscribed) return;

      try {
        await Promise.all([
          refreshFeed(),
          refreshTrending(),
          refreshLeaderboard(),
        ]);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }

      if (isSubscribed) {
        refreshTimeout = setTimeout(refreshData, 30000); // Refresh every 30 seconds
      }
    };

    refreshData();

    return () => {
      isSubscribed = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [isLoggedIn, walletAddress]);

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

  const getFollowersList = async (wallet: string): Promise<User[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getFollowersList(wallet);
      return response.users;
    } catch (error) {
      console.error("Error getting followers list:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get followers list"
      );
      return [];
    }
  };

  const getFollowingList = async (wallet: string): Promise<User[]> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.getFollowingList(wallet);
      return response.users;
    } catch (error) {
      console.error("Error getting following list:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get following list"
      );
      return [];
    }
  };
  const search = async (
    query: string,
    type: "all" | "users" | "posts" | "comments" = "all"
  ): Promise<{
    query: string;
    type: string;
    results: { users: User[]; posts: Post[]; comments: Comment[] };
  }> => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const response = await aoClient.search(query, walletAddress, type);
      return response;
    } catch (error) {
      console.error("Error searching:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search");
      return { query, type, results: { users: [], posts: [], comments: [] } };
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        topic,
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
        removeVote,
        sharePost,
        followUser,
        search,
        refreshFeed,
        refreshTrending,
        refreshLeaderboard,
        getUserPosts,
        getUserComments,
        bookmarkPost,
        getPersonalizedFeed,
        getBookmarkedFeed,
        getTopicFeed,
        getFollowersList,
        getFollowingList,
        uploadMedia,
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
