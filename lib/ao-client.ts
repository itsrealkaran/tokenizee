import { createDataItemSigner, dryrun } from "@permaweb/aoconnect";

// Types
export interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  wallet: string;
  score: number;
  posts: string[];
}

export interface Post {
  author: string;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  username: string;
  displayName: string;
  score: number;
}

// Response types
interface AOResponse<T> {
  Messages: Array<{
    Tags: Array<{ name: string; value: string }>;
    Data: T;
  }>;
}

// Client class
export class AOClient {
  private processId: string;

  constructor(processId: string) {
    this.processId = processId;
  }

  private async call<T>(
    action: string,
    data: string = "",
    tags: Array<{ name: string; value: string }> = []
  ): Promise<T> {
    try {
      const result = await dryrun({
        process: this.processId,
        data,
        tags: [{ name: "Action", value: action }, ...tags],
      });

      if (!result.Messages?.[0]) {
        throw new Error(`No response from AO process for action: ${action}`);
      }

      const message = result.Messages[0];
      const status = message.Tags.find((tag: { name: string }) => tag.name === "Status")?.value;

      if (status === "Error") {
        throw new Error(message.Data as string);
      }

      return message.Data as T;
    } catch (error) {
      console.error(`Error in AO call ${action}:`, error);
      throw error;
    }
  }

  // User Management
  async registerUser(
    username: string,
    displayName: string,
    dateOfBirth: string,
    wallet: string
  ): Promise<string> {
    return this.call<string>("Register", "", [
      { name: "Username", value: username },
      { name: "DisplayName", value: displayName },
      { name: "DateOfBirth", value: dateOfBirth },
      { name: "Wallet", value: wallet },
    ]);
  }

  async getUser(wallet: string): Promise<User> {
    return this.call<User>("GetUser", "", [{ name: "Wallet", value: wallet }]);
  }

  // Post Management
  async createPost(username: string, content: string): Promise<string> {
    return this.call<string>("CreatePost", content, [
      { name: "Username", value: username },
    ]);
  }

  async upvotePost(postId: string): Promise<string> {
    return this.call<string>("Upvote", "", [{ name: "PostId", value: postId }]);
  }

  async downvotePost(postId: string): Promise<string> {
    return this.call<string>("Downvote", "", [{ name: "PostId", value: postId }]);
  }

  // Feed and Trending
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

// Create a singleton instance
let aoClient: AOClient | null = null;

export function getAOClient(processId: string): AOClient {
  if (!aoClient) {
    aoClient = new AOClient(processId);
  }
  return aoClient;
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