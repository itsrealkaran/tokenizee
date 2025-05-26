import { connect, createDataItemSigner } from "@permaweb/aoconnect";

const { dryrun, message, result } = connect({
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
  Tags: Array<{ name: string; value: string }>;
}

interface AOClient {
  getUser: (params: { wallet?: string; username?: string }) => Promise<{ user: User }>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string) => Promise<{ message: string; user: User }>;
  updateUser: (username: string, displayName: string, dateOfBirth: string, bio: string) => Promise<{ message: string; user: User }>;
  createPost: (username: string, title: string, content: string) => Promise<{ message: string; postId: string; post: Post }>;
  commentPost: (postId: string, username: string, content: string) => Promise<{ message: string; commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<{ comments: Comment[] }>;
  upvotePost: (postId: string) => Promise<{ message: string; post: Post }>;
  downvotePost: (postId: string) => Promise<{ message: string; post: Post }>;
  sharePost: (postId: string, username: string) => Promise<{ message: string; post: Post }>;
  followUser: (follower: string, following: string) => Promise<{ message: string; follower: User; following: User }>;
  searchUser: (searchTerm: string) => Promise<{ users: User[] }>;
  getFeed: () => Promise<{ posts: Post[] }>;
  getTrending: () => Promise<{ posts: Post[] }>;
  getLeaderboard: () => Promise<{ users: LeaderboardEntry[] }>;
  getUserPosts: (username: string) => Promise<{ posts: Post[] }>;
  getUserComments: (username: string) => Promise<{ comments: Comment[] }>;
}

class AOClientImpl implements AOClient {
  private processId: string;

  constructor(processId: string) {
    this.processId = processId;
  }

  private async call<T>(action: string, tags: Record<string, string> = {}, data?: string): Promise<T> {
    const isWriteOperation = [
      "Register",
      "UpdateUser",
      "CreatePost",
      "CommentPost",
      "Upvote",
      "Downvote",
      "SharePost",
      "FollowUser"
    ].includes(action);

    let response;
    if (isWriteOperation) {
      const res = await message({
        process: this.processId,
        tags: [{ name: 'Action', value: action }, ...Object.entries(tags).map(([name, value]) => ({ name, value }))],
        data: data || '',
        signer: createDataItemSigner(window.arweaveWallet),
      });
      
      const resultData = await result({
        message: res,
        process: this.processId,
      });
      
      response = resultData.Messages[0] as AOResponse;
    } else {
      const dryrunResult = await dryrun({
        process: this.processId,
        data: data || '',
        tags: [{ name: 'Action', value: action }, ...Object.entries(tags).map(([name, value]) => ({ name, value }))]
      });
      response = dryrunResult.Messages[0];
    }

    if (!response) {
      throw new Error(`No response from AO process for action: ${action}`);
    }
    
    try {
      const parsedData = JSON.parse(response.Data);
      
      // Check for error in the response data
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      // For responses that have a specific structure like { message: string, user: User }
      if (action === "Register" || action === "UpdateUser") {
        return {
          message: parsedData.message,
          user: parsedData.user
        } as T;
      }

      // For responses that have a specific structure like { message: string, post: Post }
      if (action === "CreatePost") {
        return {
          message: parsedData.message,
          postId: parsedData.postId,
          post: parsedData.post
        } as T;
      }

      // For responses that have a specific structure like { message: string, comment: Comment }
      if (action === "CommentPost") {
        return {
          message: parsedData.message,
          commentId: parsedData.commentId,
          comment: parsedData.comment
        } as T;
      }

      // For responses that have a specific structure like { message: string, post: Post }
      if (action === "Upvote" || action === "Downvote" || action === "SharePost") {
        return {
          message: parsedData.message,
          post: parsedData.post
        } as T;
      }

      // For responses that have a specific structure like { message: string, follower: User, following: User }
      if (action === "FollowUser") {
        return {
          message: parsedData.message,
          follower: parsedData.follower,
          following: parsedData.following
        } as T;
      }

      // For responses that have a specific structure like { users: User[] }
      if (action === "SearchUser") {
        return {
          users: parsedData.users
        } as T;
      }

      // For responses that have a specific structure like { posts: Post[] }
      if (action === "GetFeed" || action === "GetTrending") {
        return {
          posts: parsedData.posts
        } as T;
      }

      // For responses that have a specific structure like { users: LeaderboardEntry[] }
      if (action === "GetLeaderboard") {
        return {
          users: parsedData.users
        } as T;
      }

      // For responses that have a specific structure like { posts: Post[] }
      if (action === "GetUserPosts") {
        return {
          posts: parsedData.posts
        } as T;
      }

      // For responses that have a specific structure like { comments: Comment[] }
      if (action === "GetUserComments" || action === "LoadComments") {
        return {
          comments: parsedData.comments
        } as T;
      }

      // For responses that have a specific structure like { user: User }
      if (action === "GetUser") {
        return parsedData as T;
      }

      // If no specific structure is matched, return the parsed data as is
      return parsedData as T;
    } catch (error) {
      // If it's already an Error object (from our error check above), re-throw it
      if (error instanceof Error) {
        throw error;
      }
      
      // If it's a JSON parse error, try to parse the error message
      try {
        const errorData = JSON.parse(response.Data);
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      } catch (parseError) {
        console.error("Error parsing response data:", parseError);
        throw new Error("Invalid response data format");
      }
    }

    // This line will never be reached due to the error handling above,
    // but it satisfies the TypeScript compiler
    throw new Error("Unexpected response format");
  }

  async getUser(params: { wallet?: string; username?: string }): Promise<{ user: User }> {
    if (!params.wallet && !params.username) {
      throw new Error("Either wallet or username must be provided");
    }

    const tags: Record<string, string> = {};
    if (params.wallet) tags.Wallet = params.wallet;
    if (params.username) tags.Username = params.username;

    const response = await this.call<{ user: User }>("GetUser", tags);
    return response;
  }

  async registerUser(username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string): Promise<{ message: string; user: User }> {
    const response = await this.call<{ message: string; user: User }>("Register", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio,
      Wallet: wallet
    });
    return response;
  }

  async updateUser(username: string, displayName: string, dateOfBirth: string, bio: string): Promise<{ message: string; user: User }> {
    const response = await this.call<{ message: string; user: User }>("UpdateUser", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio
    });
    return response;
  }

  async createPost(username: string, title: string, content: string): Promise<{ message: string; postId: string; post: Post }> {
    const response = await this.call<{ message: string; postId: string; post: Post }>("CreatePost", {
      Username: username,
      Title: title,
      Content: content
    });
    return response;
  }

  async commentPost(postId: string, username: string, content: string): Promise<{ message: string; commentId: string; comment: Comment }> {
    const response = await this.call<{ message: string; commentId: string; comment: Comment }>("CommentPost", {
      PostId: postId,
      Username: username,
      Content: content
    });
    return response;
  }

  async loadComments(postId: string): Promise<{ comments: Comment[] }> {
    const response = await this.call<{ comments: Comment[] }>("LoadComments", { PostId: postId });
    return response;
  }

  async upvotePost(postId: string): Promise<{ message: string; post: Post }> {
    const response = await this.call<{ message: string; post: Post }>("Upvote", { PostId: postId });
    return response;
  }

  async downvotePost(postId: string): Promise<{ message: string; post: Post }> {
    const response = await this.call<{ message: string; post: Post }>("Downvote", { PostId: postId });
    return response;
  }

  async sharePost(postId: string, username: string): Promise<{ message: string; post: Post }> {
    const response = await this.call<{ message: string; post: Post }>("SharePost", {
      PostId: postId,
      Username: username
    });
    return response;
  }

  async followUser(follower: string, following: string): Promise<{ message: string; follower: User; following: User }> {
    const response = await this.call<{ message: string; follower: User; following: User }>("FollowUser", {
      Follower: follower,
      Following: following
    });
    return response;
  }

  async searchUser(searchTerm: string): Promise<{ users: User[] }> {
    const response = await this.call<{ users: User[] }>("SearchUser", {
      SearchTerm: searchTerm
    });
    return response;
  }

  async getFeed(): Promise<{ posts: Post[] }> {
    const response = await this.call<{ posts: Post[] }>("GetFeed");
    return response;
  }

  async getTrending(): Promise<{ posts: Post[] }> {
    const response = await this.call<{ posts: Post[] }>("GetTrending");
    return response;
  }

  async getLeaderboard(): Promise<{ users: LeaderboardEntry[] }> {
    const response = await this.call<{ users: LeaderboardEntry[] }>("GetLeaderboard");
    return response;
  }

  async getUserPosts(username: string): Promise<{ posts: Post[] }> {
    const response = await this.call<{ posts: Post[] }>("GetUserPosts", {
      Username: username
    });
    return response;
  }

  async getUserComments(username: string): Promise<{ comments: Comment[] }> {
    const response = await this.call<{ comments: Comment[] }>("GetUserComments", {
      Username: username
    });
    return response;
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