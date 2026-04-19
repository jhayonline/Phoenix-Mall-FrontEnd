import { backendRequest } from './client';
import {
  ListingsResponse,
  ProfileResponseData,
  StatsResponse,
  StatsResponseData,
} from './types';

export interface ProfileApiResponse {
  success: boolean;
  message: string;
  data: ProfileResponseData;
}

export const profileApi = {
  async getProfile(): Promise<ProfileApiResponse> {
    const response = await backendRequest<ProfileResponseData>('/profile/me');
    return {
      success: true,
      message: 'Success',
      data: response.data,
    };
  },

  async updateProfile(data: Partial<ProfileResponseData>): Promise<ProfileApiResponse> {
    const response = await backendRequest<ProfileResponseData>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      message: 'Profile updated',
      data: response.data,
    };
  },

  async getStats(): Promise<StatsResponse> {
    const response = await backendRequest<StatsResponseData>('/profile/stats');
    return {
      success: true,
      data: response.data,
      message: 'Success',
    };
  },

  async getListings(): Promise<ListingsResponse> {
    const response = await backendRequest<ListingsResponse['data']>('/profile/listings');
    return {
      success: true,
      data: response.data,
      message: 'Success',
    };
  },

  async getSellerProducts(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await backendRequest<any[]>('/profile/seller/products');
    return {
      success: true,
      data: response.data,
      message: 'Success',
    };
  },

  async uploadAvatar(file: File): Promise<{ success: boolean; data: { avatar_url: string }; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('access_token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5150/api';

    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.description || 'Upload failed');
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData,
      message: 'Avatar uploaded successfully',
    };
  },
};
