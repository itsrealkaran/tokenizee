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
    content:
      "Welcome to Tokenizee, the revolutionary platform that's changing the way we think about digital ownership and creator economy! 🚀",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 89,
    shares: 34,
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
