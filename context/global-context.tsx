"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { getAOClient } from "@/lib/ao-client";
import { toast } from "react-hot-toast";

interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  walletAddress: string;
  followers: string[];
  following: string[];
  score: number;
}

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string;
  content: string;
  attachment?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  shares: number;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  position: number;
  score: number;
}

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
  topCreators: Creator[];
  setFeedPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setUserPosts: (posts: Post[]) => void;
  setTopCreators: (creators: Creator[]) => void;
  walletConnected: boolean;
  setWalletConnected: (value: boolean) => void;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  // AO API Methods
  registerUser: (
    username: string,
    displayName: string,
    dateOfBirth: string
  ) => Promise<boolean>;
  createPost: (content: string) => Promise<boolean>;
  upvotePost: (postId: string) => Promise<boolean>;
  downvotePost: (postId: string) => Promise<boolean>;
  refreshFeed: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const dummyPosts: Post[] = [
  {
    id: "1",
    author: {
      username: "johndoe",
      displayName: "John Doe",
    },
    title: "Welcome to Tokenizee",
    content: `Welcome to Tokenizee, the revolutionary platform that's changing the way we think about digital ownership and creator economy! 🚀

In this post, I want to share my vision for Tokenizee and how it's going to transform the creator economy landscape.

What is Tokenizee?
Tokenizee is a decentralized platform that enables creators to tokenize their content, build their community, and monetize their work in ways never before possible. We're leveraging blockchain technology to create a fair and transparent ecosystem where creators have full control over their content and earnings.

Key Features:
1. Content Tokenization: Convert your digital assets into NFTs
2. Community Building: Create and manage your own token-gated communities
3. Revenue Sharing: Implement smart contracts for automatic revenue distribution
4. Creator Tools: Access powerful analytics and engagement metrics
5. Cross-platform Integration: Seamlessly connect with other Web3 platforms

The Future of Creator Economy:
We believe that the future of the creator economy lies in decentralization and direct creator-fan relationships. Tokenizee is building the infrastructure to make this vision a reality. Our platform removes intermediaries, reduces fees, and puts power back in the hands of creators.

Join us on this journey to revolutionize the creator economy! Whether you're a creator looking to tokenize your content, a fan wanting to support your favorite creators, or a developer interested in building on our platform, there's a place for you in the Tokenizee community.

Stay tuned for more updates, and don't forget to follow us for the latest news and features! 🌟`,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    upvotes: 42,
    downvotes: 12,
    shares: 12,
  },
  {
    id: "2",
    author: {
      username: "alicej",
      displayName: "Alice Johnson",
    },
    title: "My First NFT Collection",
    content:
      "Just minted my first NFT collection! Check out my profile to see the artwork. Would love to hear your thoughts and feedback. 🎨✨",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    upvotes: 89,
    downvotes: 34,
    shares: 34,
  },
  {
    id: "3",
    author: {
      username: "bobbrown",
      displayName: "Bob Brown",
    },
    title: "Web3 Development Tips",
    content:
      "Sharing some tips for developers getting started with Web3. The key is to understand the fundamentals of blockchain technology first. Here's a thread...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    upvotes: 156,
    downvotes: 45,
    shares: 78,
  },
  {
    id: "4",
    author: {
      username: "sarahsmith",
      displayName: "Sarah Smith",
    },
    title: "Digital Art Showcase",
    content:
      "My latest digital art piece is now available as an NFT! This piece represents the intersection of traditional art and blockchain technology. 🖼️",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    upvotes: 234,
    downvotes: 45,
    shares: 45,
  },
  {
    id: "5",
    author: {
      username: "mikechen",
      displayName: "Mike Chen",
    },
    title: "DeFi Project Update",
    content:
      "Big update on our DeFi project! We've implemented new features and improved security measures. Check out our latest documentation...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    upvotes: 178,
    downvotes: 45,
    shares: 67,
  },
  {
    id: "6",
    author: {
      username: "emilydavis",
      displayName: "Emily Davis",
    },
    title: "Community Event",
    content:
      "Join us this weekend for our first Tokenizee community meetup! We'll be discussing the future of NFTs and digital ownership. RSVP now! 🎉",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    upvotes: 312,
    downvotes: 45,
    shares: 98,
  },
  {
    id: "7",
    author: {
      username: "davidwilson",
      displayName: "David Wilson",
    },
    title: "Blockchain Education",
    content:
      "Starting a new series on blockchain education. First post covers the basics of smart contracts. Let me know if you have any questions! 📚",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
    upvotes: 145,
    downvotes: 45,
    shares: 56,
  },
];

const dummyCreators: Creator[] = [
  { id: "1", name: "John Doe", username: "johndoe", position: 1, score: 100 },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    position: 2,
    score: 90,
  },
  {
    id: "3",
    name: "Alice Johnson",
    username: "alicej",
    position: 3,
    score: 80,
  },
  { id: "4", name: "Bob Brown", username: "bobbrown", position: 4, score: 70 },
  {
    id: "5",
    name: "Charlie Davis",
    username: "charlied",
    position: 5,
    score: 60,
  },
];

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [topCreators, setTopCreators] = useState<Creator[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Initialize AO Client
  const aoClient = getAOClient(
    process.env.NEXT_PUBLIC_AO_PROCESS_ID ||
      "A5Dq5kMTq0ACMwsvPR_PIJO14UFhE1y3GYho9pu6LII"
  );

  // Check user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        if (typeof window !== "undefined" && window.arweaveWallet) {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setWalletAddress(address);
            setWalletConnected(true);
            const userData = await aoClient.getUser(address);
            if (userData) {
              setUser({
                username: userData.username,
                displayName: userData.displayName,
                dateOfBirth: userData.dateOfBirth,
                walletAddress: userData.wallet,
                followers: [],
                following: [],
                score: userData.score,
              });
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
        post.author.username === user?.username
          ? {
              ...post,
              author: {
                ...post.author,
                username: updatedUser.username,
                displayName: updatedUser.displayName,
              },
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
      if (!user?.walletAddress) {
        throw new Error("Wallet not connected");
      }

      await aoClient.registerUser(
        username,
        displayName,
        dateOfBirth,
        user.walletAddress
      );

      const userData = await aoClient.getUser(user.walletAddress);
      setUser({
        username: userData.username,
        displayName: userData.displayName,
        dateOfBirth: userData.dateOfBirth,
        walletAddress: userData.wallet,
        followers: [],
        following: [],
        score: userData.score,
      });
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

  const createPost = async (content: string): Promise<boolean> => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in");
      }

      await aoClient.createPost(user.username, content);
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

  const refreshFeed = async (): Promise<void> => {
    try {
      const feed = await aoClient.getFeed();
      setFeedPosts(
        feed.map((post) => ({
          id: post.author + "-" + post.timestamp,
          author: {
            username: post.author,
            displayName: post.author, // TODO: Get display name from user data
          },
          title: post.content.substring(0, 50) + "...",
          content: post.content,
          createdAt: new Date(post.timestamp * 1000).toISOString(),
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          shares: 0,
        }))
      );
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast.error("Failed to refresh feed");
    }
  };

  const refreshTrending = async (): Promise<void> => {
    try {
      const trending = await aoClient.getTrending();
      setTrendingPosts(
        trending.map((post) => ({
          id: post.author + "-" + post.timestamp,
          author: {
            username: post.author,
            displayName: post.author, // TODO: Get display name from user data
          },
          title: post.content.substring(0, 50) + "...",
          content: post.content,
          createdAt: new Date(post.timestamp * 1000).toISOString(),
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          shares: 0,
        }))
      );
    } catch (error) {
      console.error("Error refreshing trending:", error);
      toast.error("Failed to refresh trending posts");
    }
  };

  const refreshLeaderboard = async (): Promise<void> => {
    try {
      const leaderboard = await aoClient.getLeaderboard();
      setTopCreators(
        leaderboard.map((entry, index) => ({
          id: entry.username,
          name: entry.displayName,
          username: entry.username,
          position: index + 1,
          score: entry.score,
        }))
      );
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
        // AO API Methods
        registerUser,
        createPost,
        upvotePost,
        downvotePost,
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
