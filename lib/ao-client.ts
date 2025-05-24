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
  bio: string;
  wallet: string;
  followers: Record<string, boolean>;
  following: Record<string, boolean>;
  score: number;
  posts: string[];
  createdAt: number;
}

export interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
  };
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  shares: number;
  comments: string[];
}

export interface Comment {
  id: string;
  author: {
    username: string;
    displayName: string;
  };
  content: string;
  createdAt: number;
  postId?: string;    // Added for user comments
  postTitle?: string; // Added for user comments
}

export interface LeaderboardEntry {
  username: string;
  displayName: string;
  score: number;
}

interface AOResponse {
  Data: string; // JSON string containing the actual response data
}

interface AOClient {
  getUser: (params: { wallet?: string; username?: string }) => Promise<User>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string) => Promise<string>;
  updateUser: (username: string, displayName: string, dateOfBirth: string, bio: string) => Promise<string>;
  createPost: (username: string, title: string, content: string) => Promise<{ postId: string; post: Post }>;
  commentPost: (postId: string, username: string, content: string) => Promise<{ commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<Comment[]>;
  upvotePost: (postId: string) => Promise<Post>;
  downvotePost: (postId: string) => Promise<Post>;
  sharePost: (postId: string, username: string) => Promise<Post>;
  followUser: (follower: string, following: string) => Promise<{ follower: User; following: User }>;
  searchUser: (searchTerm: string) => Promise<User[]>;
  getFeed: () => Promise<Post[]>;
  getTrending: () => Promise<Post[]>;
  getLeaderboard: () => Promise<LeaderboardEntry[]>;
  getUserPosts: (username: string) => Promise<Post[]>;
  getUserComments: (username: string) => Promise<Comment[]>;
}

class AOClientImpl implements AOClient {
  private processId: string;

  constructor(processId: string) {
    this.processId = processId;
  }

  private async call<T>(action: string, tags: Record<string, string> = {}, data?: string): Promise<T> {
    const result = await dryrun({
      process: this.processId,
      data: data || '',
      tags: [{ name: 'Action', value: action }, ...Object.entries(tags).map(([name, value]) => ({ name, value }))]
    });

    if (!result.Messages?.[0]) {
      throw new Error(`No response from AO process for action: ${action}`);
    }

    const response = result.Messages[0] as AOResponse;
    
    try {
      const parsedData = JSON.parse(response.Data);
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }
      return parsedData as T;
    } catch (error) {
      console.error("Error parsing response data:", error);
      throw new Error("Invalid response data format");
    }
  }

  async getUser(params: { wallet?: string; username?: string }): Promise<User> {
    if (!params.wallet && !params.username) {
      throw new Error("Either wallet or username must be provided");
    }

    const tags: Record<string, string> = {};
    if (params.wallet) tags.Wallet = params.wallet;
    if (params.username) tags.Username = params.username;

    const response = await this.call<{ user: User }>("GetUser", tags);
    return response.user;
  }

  async registerUser(username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string): Promise<string> {
    const response = await this.call<{ message: string }>("Register", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio,
      Wallet: wallet
    });
    return response.message;
  }

  async updateUser(username: string, displayName: string, dateOfBirth: string, bio: string): Promise<string> {
    const response = await this.call<{ message: string }>("UpdateUser", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio
    });
    return response.message;
  }

  async createPost(username: string, title: string, content: string): Promise<{ postId: string; post: Post }> {
    const response = await this.call<{ postId: string; post: Post; message: string }>("CreatePost", {
      Username: username,
      Data: `${title}:${content}`
    });
    return { postId: response.postId, post: response.post };
  }

  async commentPost(postId: string, username: string, content: string): Promise<{ commentId: string; comment: Comment }> {
    const response = await this.call<{ commentId: string; comment: Comment; message: string }>("CommentPost", {
      PostId: postId,
      Username: username,
      Data: content
    });
    return { commentId: response.commentId, comment: response.comment };
  }

  async loadComments(postId: string): Promise<Comment[]> {
    const response = await this.call<{ comments: Comment[] }>("LoadComments", { PostId: postId });
    return response.comments;
  }

  async upvotePost(postId: string): Promise<Post> {
    const response = await this.call<{ post: Post; message: string }>("Upvote", { PostId: postId });
    return response.post;
  }

  async downvotePost(postId: string): Promise<Post> {
    const response = await this.call<{ post: Post; message: string }>("Downvote", { PostId: postId });
    return response.post;
  }

  async sharePost(postId: string, username: string): Promise<Post> {
    const response = await this.call<{ post: Post; message: string }>("SharePost", {
      PostId: postId,
      Username: username
    });
    return response.post;
  }

  async followUser(follower: string, following: string): Promise<{ follower: User; following: User }> {
    const response = await this.call<{ follower: User; following: User; message: string }>("FollowUser", {
      Follower: follower,
      Following: following
    });
    return { follower: response.follower, following: response.following };
  }

  async searchUser(searchTerm: string): Promise<User[]> {
    const response = await this.call<{ users: User[] }>("SearchUser", {
      SearchTerm: searchTerm
    });
    return response.users;
  }

  async getFeed(): Promise<Post[]> {
    const response = await this.call<{ posts: Post[] }>("GetFeed");
    return response.posts;
  }

  async getTrending(): Promise<Post[]> {
    const response = await this.call<{ posts: Post[] }>("GetTrending");
    return response.posts;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await this.call<{ users: LeaderboardEntry[] }>("GetLeaderboard");
    return response.users;
  }

  async getUserPosts(username: string): Promise<Post[]> {
    const response = await this.call<{ posts: Post[] }>("GetUserPosts", {
      Username: username
    });
    return response.posts;
  }

  async getUserComments(username: string): Promise<Comment[]> {
    const response = await this.call<{ comments: Comment[] }>("GetUserComments", {
      Username: username
    });
    return response.comments;
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