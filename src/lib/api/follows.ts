import { backendRequest } from './client';

export interface UserProfile {
  id: number;
  pid: string;
  username: string | null;
  name: string;
  email: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  product_count: number;
  created_at: string;
}

export interface FollowUser {
  id: number;
  pid: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export const followsApi = {
  // Follow a user
  async follow(userId: number): Promise<{ success: boolean; data: any }> {
    const response = await backendRequest<any>('/follows/follow', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
    return { success: true, data: response.data };
  },

  // Unfollow a user
  async unfollow(userId: number): Promise<{ success: boolean }> {
    await backendRequest<any>(`/follows/unfollow/${userId}`, {
      method: 'DELETE',
    });
    return { success: true };
  },

  // Check if following a user
  async checkFollowing(userId: number): Promise<{ success: boolean; following: boolean }> {
    const response = await backendRequest<{ following: boolean }>(`/follows/check/${userId}`);
    return { success: true, following: response.data.following };
  },

  // Get user profile by username
  async getProfile(username: string): Promise<{ success: boolean; data: UserProfile }> {
    const response = await backendRequest<UserProfile>(`/follows/profile/${username}`);
    return { success: true, data: response.data };
  },

  // Get user's listings by username
  async getUserListings(username: string): Promise<{ success: boolean; data: any[] }> {
    const response = await backendRequest<any[]>(`/follows/listings/${username}`);
    return { success: true, data: response.data };
  },

  // Get followers list
  async getFollowers(userId: number): Promise<{ success: boolean; data: FollowUser[] }> {
    const response = await backendRequest<FollowUser[]>(`/follows/followers/${userId}`);
    return { success: true, data: response.data };
  },

  // Get following list
  async getFollowing(userId: number): Promise<{ success: boolean; data: FollowUser[] }> {
    const response = await backendRequest<FollowUser[]>(`/follows/following/${userId}`);
    return { success: true, data: response.data };
  },

  // Get is following status for current user
  async getIsFollowing(userId: number): Promise<{ success: boolean; is_following: boolean }> {
    const response = await backendRequest<{ is_following: boolean }>(`/follows/is-following/${userId}`);
    return { success: true, is_following: response.data.is_following };
  },
};
