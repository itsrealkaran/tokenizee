"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  walletAddress: string;
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
  likes: number;
  shares: number;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  position: number;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  feedPosts: Post[];
  trendingPosts: Post[];
  myPosts: Post[];
  topCreators: Creator[];
  setFeedPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setMyPosts: (posts: Post[]) => void;
  setTopCreators: (creators: Creator[]) => void;
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
    likes: 42,
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
    likes: 89,
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
    likes: 156,
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
    likes: 234,
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
    likes: 178,
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
    likes: 312,
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
    likes: 145,
    shares: 56,
  },
];

const dummyCreators: Creator[] = [
  { id: "1", name: "John Doe", username: "johndoe", position: 1 },
  { id: "2", name: "Jane Smith", username: "janesmith", position: 2 },
  { id: "3", name: "Alice Johnson", username: "alicej", position: 3 },
  { id: "4", name: "Bob Brown", username: "bobbrown", position: 4 },
  { id: "5", name: "Charlie Davis", username: "charlied", position: 5 },
];

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<User | null>({
    username: "JohnDoe",
    displayName: "John Doe",
    dateOfBirth: "1990-01-01",
    walletAddress: "0x1234567890123456789012345678901234567890",
  });
  const [feedPosts, setFeedPosts] = useState<Post[]>(dummyPosts);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(dummyPosts);
  const [myPosts, setMyPosts] = useState<Post[]>(dummyPosts);
  const [topCreators, setTopCreators] = useState<Creator[]>(dummyCreators);

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        logout,
        feedPosts,
        trendingPosts,
        myPosts,
        topCreators,
        setFeedPosts,
        setTrendingPosts,
        setMyPosts,
        setTopCreators,
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
