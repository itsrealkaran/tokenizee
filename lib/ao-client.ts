import { connect, createDataItemSigner } from "@permaweb/aoconnect";

const { dryrun, message, result } = connect({
  CU_URL: "https://cu.arnode.asia",
  // GATEWAY_URL: "https://arnode.asia",
});

// Types
export interface User {
  wallet: string;
  username: string;
  displayName: string;
  bio: string;
  dateOfBirth: string;
  createdAt: number;
  followers: number;
  following: number;
  posts: number;
  comments: number;
  isFollowing: boolean;
  followersList?: User[];
  followingList?: User[];
}

export interface Post {
  id: string;
  author: {
    wallet: string;
    username: string;
    displayName: string;
  };
  title: string;
  content: string;
  topic: string[];
  upvotes: number;
  downvotes: number;
  shares: number;
  bookmarks: number;
  createdAt: number;
  comments: string[];
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  hasShared: boolean;
  hasBookmarked: boolean;
}

export interface Comment {
  id: string;
  author: {
    wallet: string;
    username: string;
    displayName: string;
  };
  content: string;
  createdAt: number;
  postId: string;
  postTitle?: string;
}

export interface LeaderboardEntry {
  user: User;
  score: number;
}

export interface Notification {
  id: string;
  type: 'follow' | 'comment' | 'upvote' | 'downvote' | 'share' | 'mention';
  createdAt: number;
  read: boolean;
  data: {
    message: string;
  };
  actor?: User;
  post?: Post;
}

export interface UserStats {
  user: User;
  activity: {
    totalPosts: number;
    totalComments: number;
    totalBookmarks: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  engagement: {
    totalUpvotes: number;
    totalDownvotes: number;
    totalShares: number;
  };
  recentActivity: {
    posts: Post[];
    comments: Comment[];
    bookmarks: Post[];
  };
}

export interface PostStats {
  post: Post;
  engagement: {
    upvotes: number;
    downvotes: number;
    shares: number;
    bookmarks: number;
    comments: number;
  };
  recentActivity: {
    comments: Comment[];
    upvoters: User[];
    downvoters: User[];
    sharers: User[];
    bookmarkers: User[];
  };
}

interface AOResponse {
  Data: string;
  Tags: Array<{ name: string; value: string }>;
}

export interface AOClient {
  getUser: (params: { wallet?: string; username?: string }, requestingWallet: string) => Promise<{ user: User }>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string) => Promise<{ message: string; user: User }>;
  updateUser: (username: string, newUsername: string, displayName: string, dateOfBirth: string, bio: string) => Promise<{ message: string; user: User }>;
  createPost: (username: string, title: string, content: string, topic: string[]) => Promise<{ message: string; postId: string; post: Post }>;
  commentPost: (postId: string, wallet: string, content: string) => Promise<{ message: string; commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<{ comments: Comment[] }>;
  upvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  downvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  sharePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  followUser: (followerWallet: string, followingWallet: string) => Promise<{ message: string; result: { follower: User; following: User } }>;
  searchUser: (searchTerm: string) => Promise<{ users: User[] }>;
  getFeed: (requestingWallet: string) => Promise<{ posts: Post[] }>;
  getTrending: (requestingWallet: string) => Promise<{ posts: Post[] }>;
  getLeaderboard: (requestingWallet: string) => Promise<{ users: LeaderboardEntry[] }>;
  getUserPosts: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getUserComments: (wallet: string) => Promise<{ comments: Comment[] }>;
  getNotifications: (wallet: string) => Promise<{ notifications: Notification[]; unreadCount: number }>;
  markNotificationsRead: (wallet: string) => Promise<{ message: string }>;
  bookmarkPost: (wallet: string, postId: string, action: 'add' | 'remove') => Promise<{ message: string; bookmarkedPosts: string[]; post: Post }>;
  getPersonalizedFeed: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getBookmarkedFeed: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getTopicFeed: (topic: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getPostStats: (postId: string, requestingWallet: string) => Promise<PostStats>;
  getFollowersList: (wallet: string) => Promise<{ users: User[] }>;
  getFollowingList: (wallet: string) => Promise<{ users: User[] }>;
}

export class AOClientImpl implements AOClient {
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
      "FollowUser",
      "BookmarkPost",
      "MarkNotificationsRead"
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

  async getUser(params: { wallet?: string; username?: string }, requestingWallet: string): Promise<{ user: User }> {
    if (!params.wallet && !params.username) {
      throw new Error("Either wallet or username must be provided");
    }

    const tags: Record<string, string> = {};
    if (params.wallet) tags.Wallet = params.wallet;
    if (params.username) tags.Username = params.username;
    tags.RequestingWallet = requestingWallet;

    return this.call<{ user: User }>("GetUser", tags);
  }

  async registerUser(username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string): Promise<{ message: string; user: User }> {
    return this.call<{ message: string; user: User }>("Register", {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio,
      Wallet: wallet
    });
  }

  async updateUser(username: string, newUsername: string, displayName: string, dateOfBirth: string, bio: string): Promise<{ message: string; user: User }> {
    return this.call<{ message: string; user: User }>("UpdateUser", {
      Username: username,
      NewUsername: newUsername,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio
    });
  }

  async createPost(username: string, title: string, content: string, topic: string[]): Promise<{ message: string; postId: string; post: Post }> {
    return this.call<{ message: string; postId: string; post: Post }>("CreatePost", {
      Username: username,
      Title: title,
      Content: content,
      Topic: JSON.stringify(topic)
    });
  }

  async commentPost(postId: string, wallet: string, content: string): Promise<{ message: string; commentId: string; comment: Comment }> {
    return this.call<{ message: string; commentId: string; comment: Comment }>("CommentPost", {
      PostId: postId,
      Wallet: wallet,
      Content: content
    });
  }

  async loadComments(postId: string): Promise<{ comments: Comment[] }> {
    return this.call<{ comments: Comment[] }>("LoadComments", { PostId: postId });
  }

  async upvotePost(postId: string, wallet: string): Promise<{ message: string; post: Post }> {
    return this.call<{ message: string; post: Post }>("Upvote", { 
      PostId: postId,
      Wallet: wallet
    });
  }

  async downvotePost(postId: string, wallet: string): Promise<{ message: string; post: Post }> {
    return this.call<{ message: string; post: Post }>("Downvote", { 
      PostId: postId,
      Wallet: wallet
    });
  }

  async sharePost(postId: string, wallet: string): Promise<{ message: string; post: Post }> {
    return this.call<{ message: string; post: Post }>("SharePost", {
      PostId: postId,
      Wallet: wallet
    });
  }

  async followUser(followerWallet: string, followingWallet: string): Promise<{ message: string; result: { follower: User; following: User } }> {
    return this.call<{ message: string; result: { follower: User; following: User } }>("FollowUser", {
      FollowerWallet: followerWallet,
      FollowingWallet: followingWallet
    });
  }

  async searchUser(searchTerm: string): Promise<{ users: User[] }> {
    return this.call<{ users: User[] }>("SearchUser", {
      SearchTerm: searchTerm
    });
  }

  async getFeed(requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetFeed", {
      RequestingWallet: requestingWallet
    });
  }

  async getTrending(requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetTrending", {
      RequestingWallet: requestingWallet
    });
  }

  async getLeaderboard(requestingWallet: string): Promise<{ users: LeaderboardEntry[] }> {
    return this.call<{ users: LeaderboardEntry[] }>("GetLeaderboard", {
      RequestingWallet: requestingWallet
    });
  }

  async getUserPosts(wallet: string, requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetUserPosts", {
      Wallet: wallet,
      RequestingWallet: requestingWallet
    });
  }

  async getUserComments(wallet: string): Promise<{ comments: Comment[] }> {
    return this.call<{ comments: Comment[] }>("GetUserComments", {
      Wallet: wallet
    });
  }

  async getNotifications(wallet: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.call<{ notifications: Notification[]; unreadCount: number }>("GetNotifications", {
      Wallet: wallet
    });
  }

  async markNotificationsRead(wallet: string): Promise<{ message: string }> {
    return this.call<{ message: string }>("MarkNotificationsRead", {
      Wallet: wallet
    });
  }

  async bookmarkPost(wallet: string, postId: string, action: 'add' | 'remove'): Promise<{ message: string; bookmarkedPosts: string[]; post: Post }> {
    return this.call<{ message: string; bookmarkedPosts: string[]; post: Post }>("BookmarkPost", {
      Wallet: wallet,
      PostId: postId,
      BookmarkAction: action
    });
  }

  async getPersonalizedFeed(wallet: string, requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetPersonalizedFeed", {
      Wallet: wallet,
      RequestingWallet: requestingWallet
    });
  }

  async getBookmarkedFeed(wallet: string, requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetBookmarkedFeed", {
      Wallet: wallet,
      RequestingWallet: requestingWallet
    });
  }

  async getTopicFeed(topic: string, requestingWallet: string): Promise<{ posts: Post[] }> {
    return this.call<{ posts: Post[] }>("GetTopicFeed", {
      Topic: topic,
      RequestingWallet: requestingWallet
    });
  }

  async getPostStats(postId: string, requestingWallet: string): Promise<PostStats> {
    return this.call<PostStats>("GetPostStats", {
      PostId: postId,
      RequestingWallet: requestingWallet
    });
  }

  async getFollowersList(wallet: string): Promise<{ users: User[] }> {
    const response = await this.call<{ users: User[] }>("GetFollowersList", {
      Wallet: wallet
    });
    return response;
  }

  async getFollowingList(wallet: string): Promise<{ users: User[] }> {
    const response = await this.call<{ users: User[] }>("GetFollowingList", {
      Wallet: wallet
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