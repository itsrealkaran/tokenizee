import { connect } from "@permaweb/aoconnect";

const { dryrun } = connect({
  CU_URL: "https://cu.arnode.asia",
  // GATEWAY_URL: "https://arnode.asia",
});

// Types
export interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  wallet: string;
  followers: Record<string, boolean>;
  following: Record<string, boolean>;
  score: number;
  posts: string[];
  createdAt: number;
}

export interface Post {
  author: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  shares: number;
  comments: string[];
}

export interface Comment {
  author: string;
  content: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  username: string;
  displayName: string;
  score: number;
}

interface AOClient {
  getUser: (wallet: string) => Promise<User>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, wallet: string) => Promise<void>;
  createPost: (username: string, title: string, content: string) => Promise<void>;
  commentPost: (postId: string, username: string, content: string) => Promise<void>;
  upvotePost: (postId: string) => Promise<void>;
  downvotePost: (postId: string) => Promise<void>;
  sharePost: (postId: string, username: string) => Promise<void>;
  followUser: (follower: string, following: string) => Promise<void>;
  searchUser: (searchTerm: string) => Promise<User[]>;
  getFeed: () => Promise<Post[]>;
  getTrending: () => Promise<Post[]>;
  getLeaderboard: () => Promise<LeaderboardEntry[]>;
}

class AOClientImpl implements AOClient {
  private processId: string;

  constructor(processId: string) {
    this.processId = processId;
  }

  private async call<T>(action: string, tags: Record<string, string> = {}): Promise<T> {
    const message = {
      Target: this.processId,
      Tags: { Action: action, ...tags }
    };

    const result = await dryrun({
      process: this.processId,
      data: JSON.stringify(message),
      tags: Object.entries(tags).map(([name, value]) => ({ name, value }))
    });

    if (!result.Messages?.[0]) {
      throw new Error(`No response from AO process for action: ${action}`);
    }

    const messageData = result.Messages[0].Data;
    try {
      return JSON.parse(messageData) as T;
    } catch (error) {
      console.error("Error parsing response data:", error);
      throw new Error("Invalid response data format");
    }
  }

  async getUser(wallet: string): Promise<User> {
    return this.call<User>("GetUser", { Wallet: wallet });
  }

  async registerUser(username: string, displayName: string, dateOfBirth: string, wallet: string): Promise<void> {
    await this.call("Register", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Wallet: wallet
    });
  }

  async createPost(username: string, title: string, content: string): Promise<void> {
    await this.call("CreatePost", {
      Username: username,
      Data: `${title}:${content}`
    });
  }

  async commentPost(postId: string, username: string, content: string): Promise<void> {
    await this.call("CommentPost", {
      PostId: postId,
      Username: username,
      Data: content
    });
  }

  async upvotePost(postId: string): Promise<void> {
    await this.call("Upvote", { PostId: postId });
  }

  async downvotePost(postId: string): Promise<void> {
    await this.call("Downvote", { PostId: postId });
  }

  async sharePost(postId: string, username: string): Promise<void> {
    await this.call("SharePost", {
      PostId: postId,
      Username: username
    });
  }

  async followUser(follower: string, following: string): Promise<void> {
    await this.call("FollowUser", {
      Follower: follower,
      Following: following
    });
  }

  async searchUser(searchTerm: string): Promise<User[]> {
    return this.call<User[]>("SearchUser", {
      SearchTerm: searchTerm
    });
  }

  async getFeed(): Promise<Post[]> {
    return this.call<Post[]>("GetFeed");
  }

  async getTrending(): Promise<Post[]> {
    return this.call<Post[]>("GetTrending");
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.call<LeaderboardEntry[]>("GetLeaderboard");
  }
}

export function getAOClient(processId: string): AOClient {
  return new AOClientImpl(processId);
}

// Example usage:
/*
const client = getAOClient('YOUR_PROCESS_ID');

// Register a user
await client.registerUser('username', 'Display Name', '2000-01-01', 'wallet-address');

// Create a post
await client.createPost('username', 'Hello, world!');

// Get feed
const feed = await client.getFeed();

// Get trending posts
const trending = await client.getTrending();

// Get leaderboard
const leaderboard = await client.getLeaderboard();
*/ 