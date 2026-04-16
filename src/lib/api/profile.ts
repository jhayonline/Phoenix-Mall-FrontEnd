import { backendRequest } from './client';
import {
  ListingsResponse,
  ProfileResponse,
  ProfileResponseData,
  StatsResponse,
  StatsResponseData,
  UpdateProfileData,
} from './types';

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await backendRequest<ProfileResponseData>('/profile/me');

    return {
      success: true,
      message: 'Success',
      data: {
        id: response.data.pid,
        email: response.data.email,
        first_name: response.data.name.split(' ')[0] || '',
        last_name: response.data.name.split(' ')[1] || '',
        phone: response.data.phone_number,
        avatar_url: response.data.avatar_url,
        location: response.data.location,
        whatsapp_enabled: response.data.whatsapp_enabled,
        phone_enabled: response.data.phone_enabled,
        is_active: response.data.is_active,
        email_verified: response.data.email_verified
      }
    };
  },

  async updateProfile(profileData: UpdateProfileData): Promise<ProfileResponse> {
    const response = await backendRequest<ProfileResponseData>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: profileData.first_name && profileData.last_name
          ? `${profileData.first_name} ${profileData.last_name}`
          : undefined,
        phone_number: profileData.phone,
        location: profileData.location,
        whatsapp_enabled: profileData.whatsapp_enabled,
        phone_enabled: profileData.phone_enabled
      }),
    });

    return {
      success: true,
      message: 'Profile updated',
      data: {
        id: response.data.pid,
        email: response.data.email,
        first_name: response.data.name.split(' ')[0] || '',
        last_name: response.data.name.split(' ')[1] || '',
        phone: response.data.phone_number,
        avatar_url: response.data.avatar_url,
        location: response.data.location,
        whatsapp_enabled: response.data.whatsapp_enabled,
        phone_enabled: response.data.phone_enabled,
        is_active: response.data.is_active,
        email_verified: response.data.email_verified
      }
    };
  },

  async getStats(): Promise<StatsResponse> {
    const response = await backendRequest<StatsResponseData>('/profile/stats');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async getListings(): Promise<ListingsResponse> {
    const response = await backendRequest<ListingsResponse['data']>('/profile/listings');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async getSellerProducts(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await backendRequest<any[]>('/profile/seller/products');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },
};
