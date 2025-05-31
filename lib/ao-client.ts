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
  followers: Record<string, boolean>;
  following: Record<string, boolean>;
  posts: string[];
  bookmarkedPosts: string[];
  comments: string[];
  createdAt: number;
}

export interface Post {
  id: string;
  authorWallet: string;
  title: string;
  content: string;
  topic: string[];
  upvotedBy: Record<string, boolean>;
  downvotedBy: Record<string, boolean>;
  sharedBy: Record<string, boolean>;
  bookmarkedBy: Record<string, boolean>;
  createdAt: number;
  comments: string[];
}

export interface Comment {
  id: string;
  authorWallet: string;
  content: string;
  createdAt: number;
  postId?: string;
  postTitle?: string;
}

export interface LeaderboardEntry {
  user: User;
  score: number;
}

export interface Notification {
  id: string;
  type: 'follow' | 'comment' | 'upvote' | 'downvote' | 'share' | 'mention';
  actorWallet?: string;
  postId?: string;
  data: {
    message: string;
  };
  createdAt: number;
  read: boolean;
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

interface AOClient {
  getUser: (params: { wallet: string; requestingWallet: string }) => Promise<{ user: User }>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string) => Promise<{ message: string; user: User }>;
  updateUser: (wallet: string, newUsername: string, displayName: string, dateOfBirth: string, bio: string) => Promise<{ message: string; user: User }>;
  createPost: (wallet: string, title: string, content: string, topic: string[]) => Promise<{ message: string; postId: string; post: Post }>;
  commentPost: (postId: string, wallet: string, content: string) => Promise<{ message: string; commentId: string; comment: Comment }>;
  loadComments: (postId: string, requestingWallet: string) => Promise<{ comments: Comment[] }>;
  upvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  downvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  sharePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  followUser: (followerWallet: string, followingWallet: string) => Promise<{ message: string; result: { follower: User; following: User } }>;
  searchUser: (searchTerm: string, requestingWallet: string) => Promise<{ users: User[] }>;
  getFeed: (requestingWallet: string) => Promise<{ posts: Post[] }>;
  getTrending: (requestingWallet: string) => Promise<{ posts: Post[] }>;
  getLeaderboard: (requestingWallet: string) => Promise<{ users: LeaderboardEntry[] }>;
  getUserPosts: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getUserComments: (wallet: string, requestingWallet: string) => Promise<{ comments: Comment[] }>;
  bookmarkPost: (wallet: string, postId: string, action: 'add' | 'remove') => Promise<{ message: string; bookmarkedPosts: string[]; post: Post }>;
  getPersonalizedFeed: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getBookmarkedFeed: (wallet: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getTopicFeed: (topic: string, requestingWallet: string) => Promise<{ posts: Post[] }>;
  getNotifications: (wallet: string) => Promise<{ notifications: Notification[]; unreadCount: number }>;
  markNotificationsRead: (wallet: string) => Promise<{ message: string }>;
  getUserStats: (wallet: string, requestingWallet: string) => Promise<UserStats>;
  getPostStats: (postId: string, requestingWallet: string) => Promise<PostStats>;
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
          result: parsedData.result
        } as T;
      }

      // For responses that have a specific structure like { users: User[] }
      if (action === "SearchUser") {
        return {
          users: parsedData.users
        } as T;
      }

      // For responses that have a specific structure like { posts: Post[] }
      if (action === "GetFeed" || action === "GetTrending" || action === "GetUserPosts" || 
          action === "GetPersonalizedFeed" || action === "GetBookmarkedFeed" || action === "GetTopicFeed") {
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

      // For responses that have a specific structure like { comments: Comment[] }
      if (action === "GetUserComments" || action === "LoadComments") {
        return {
          comments: parsedData.comments
        } as T;
      }

      // For responses that have a specific structure like { notifications: Notification[], unreadCount: number }
      if (action === "GetNotifications") {
        return {
          notifications: parsedData.notifications,
          unreadCount: parsedData.unreadCount
        } as T;
      }

      // For responses that have a specific structure like { message: string }
      if (action === "MarkNotificationsRead") {
        return {
          message: parsedData.message
        } as T;
      }

      // For responses that have a specific structure like { user: User }
      if (action === "GetUser") {
        return parsedData as T;
      }

      // For responses that have a specific structure like UserStats
      if (action === "GetUserStats") {
        return parsedData as T;
      }

      // For responses that have a specific structure like PostStats
      if (action === "GetPostStats") {
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

  async getUser(params: { wallet: string; requestingWallet: string }): Promise<{ user: User }> {
    return this.call<{ user: User }>("GetUser", {
      Wallet: params.wallet,
      RequestingWallet: params.requestingWallet
    });
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

  async updateUser(wallet: string, newUsername: string, displayName: string, dateOfBirth: string, bio: string): Promise<{ message: string; user: User }> {
    return this.call<{ message: string; user: User }>("UpdateUser", {
      Wallet: wallet,
      NewUsername: newUsername,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio
    });
  }

  async createPost(wallet: string, title: string, content: string, topic: string[]): Promise<{ message: string; postId: string; post: Post }> {
    return this.call<{ message: string; postId: string; post: Post }>("CreatePost", {
      Wallet: wallet,
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

  async loadComments(postId: string, requestingWallet: string): Promise<{ comments: Comment[] }> {
    return this.call<{ comments: Comment[] }>("LoadComments", {
      PostId: postId,
      RequestingWallet: requestingWallet
    });
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

  async searchUser(searchTerm: string, requestingWallet: string): Promise<{ users: User[] }> {
    return this.call<{ users: User[] }>("SearchUser", {
      SearchTerm: searchTerm,
      RequestingWallet: requestingWallet
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

  async getUserComments(wallet: string, requestingWallet: string): Promise<{ comments: Comment[] }> {
    return this.call<{ comments: Comment[] }>("GetUserComments", {
      Wallet: wallet,
      RequestingWallet: requestingWallet
    });
  }

  async bookmarkPost(wallet: string, postId: string, action: 'add' | 'remove'): Promise<{ message: string; bookmarkedPosts: string[]; post: Post }> {
    return this.call<{ message: string; bookmarkedPosts: string[]; post: Post }>("BookmarkPost", {
      Wallet: wallet,
      PostId: postId,
      Action: action
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

  async getUserStats(wallet: string, requestingWallet: string): Promise<UserStats> {
    return this.call<UserStats>("GetUserStats", {
      Wallet: wallet,
      RequestingWallet: requestingWallet
    });
  }

  async getPostStats(postId: string, requestingWallet: string): Promise<PostStats> {
    return this.call<PostStats>("GetPostStats", {
      PostId: postId,
      RequestingWallet: requestingWallet
    });
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

// Create a post with topics
await client.createPost('username', 'Hello, world!', 'Content here', ['tech', 'art']);

// Bookmark a post
await client.bookmarkPost('username', 'post-id', 'add');

// Get personalized feed
const personalizedFeed = await client.getPersonalizedFeed('username');

// Get bookmarked feed
const bookmarkedFeed = await client.getBookmarkedFeed('username');

// Get topic feed
const topicFeed = await client.getTopicFeed('tech');

// Get feed
const feed = await client.getFeed();

// Get trending posts
const trending = await client.getTrending();

// Get leaderboard
const leaderboard = await client.getLeaderboard();
*/ 