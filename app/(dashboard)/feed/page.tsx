"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";

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

const dummyPosts: Post[] = [
  {
    id: "1",
    author: {
      username: "johndoe",
      displayName: "John Doe",
    },
    title: "Welcome to Tokenizee",
    content:
      "Excited to be part of this amazing community! Looking forward to connecting with fellow creators and sharing our journey together. 🚀",
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

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch posts from Lua table
    // For now, using dummy data
    setPosts(dummyPosts);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Feed</h1>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
