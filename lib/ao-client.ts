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
  profileImageUrl?: string;
  backgroundImageUrl?: string;
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

export interface MediaItem {
  url: string;
  alt: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

export interface Post {
  id: string;
  author: {
    wallet: string;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  title: string;
  content: string;
  topic: string[];
  media: MediaItem[];
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

export interface SearchResults {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

interface AOResponse {
  Data: string;
  Tags: Array<{ name: string; value: string }>;
}

export interface AOClient {
  getUser: (params: { wallet?: string; username?: string }, requestingWallet: string) => Promise<{ user: User }>;
  registerUser: (username: string, displayName: string, dateOfBirth: string, bio: string, wallet: string, profileImageUrl?: string, backgroundImageUrl?: string) => Promise<{ message: string; user: User }>;
  updateUser: (wallet: string, username: string, newUsername: string, displayName: string, dateOfBirth: string, bio: string, profileImageUrl?: string, backgroundImageUrl?: string) => Promise<{ message: string; user: User }>;
  createPost: (wallet: string, title: string, content: string, topic: string[], media?: MediaItem[]) => Promise<{ message: string; postId: string; post: Post }>;
  commentPost: (postId: string, wallet: string, content: string) => Promise<{ message: string; commentId: string; comment: Comment }>;
  loadComments: (postId: string) => Promise<{ comments: Comment[] }>;
  upvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  downvotePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  removeVote: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  sharePost: (postId: string, wallet: string) => Promise<{ message: string; post: Post }>;
  followUser: (followerWallet: string, followingWallet: string) => Promise<{ message: string; result: { follower: User; following: User } }>;
  search: (query: string, requestingWallet: string, type?: 'all' | 'users' | 'posts' | 'comments') => Promise<{ query: string; type: string; results: SearchResults }>;
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
      "RemoveVote",
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

  async registerUser(
    username: string, 
    displayName: string, 
    dateOfBirth: string, 
    bio: string, 
    wallet: string,
    profileImageUrl?: string,
    backgroundImageUrl?: string
  ): Promise<{ message: string; user: User }> {
    const tags: Record<string, string> = {
      Username: username,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio,
      Wallet: wallet
    };

    if (profileImageUrl) tags.ProfileImageUrl = profileImageUrl;
    if (backgroundImageUrl) tags.BackgroundImageUrl = backgroundImageUrl;

    return this.call<{ message: string; user: User }>("Register", tags);
  }

  async updateUser(
    wallet: string, 
    username: string, 
    newUsername: string, 
    displayName: string, 
    dateOfBirth: string, 
    bio: string,
    profileImageUrl?: string,
    backgroundImageUrl?: string
  ): Promise<{ message: string; user: User }> {
    const tags: Record<string, string> = {
      Wallet: wallet,
      Username: username,
      NewUsername: newUsername,
      DisplayName: displayName,
      DateOfBirth: dateOfBirth,
      Bio: bio
    };

    if (profileImageUrl) tags.ProfileImageUrl = profileImageUrl;
    if (backgroundImageUrl) tags.BackgroundImageUrl = backgroundImageUrl;

    return this.call<{ message: string; user: User }>("UpdateUser", tags);
  }

  async createPost(
    wallet: string, 
    title: string, 
    content: string, 
    topic: string[],
    media?: MediaItem[]
  ): Promise<{ message: string; postId: string; post: Post }> {
    const tags: Record<string, string> = {
      Wallet: wallet,
      Title: title,
      Content: content,
      Topic: JSON.stringify(topic)
    };

    if (media) tags.Media = JSON.stringify(media);

    return this.call<{ message: string; postId: string; post: Post }>("CreatePost", tags);
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

  async removeVote(postId: string, wallet: string): Promise<{ message: string; post: Post }> {
    return this.call<{ message: string; post: Post }>("RemoveVote", { 
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

  async search(query: string, requestingWallet: string, type: 'all' | 'users' | 'posts' | 'comments' = 'all'): Promise<{ query: string; type: string; results: SearchResults }> {
    return this.call<{ query: string; type: string; results: SearchResults }>("Search", {
      Query: query,
      Type: type,
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