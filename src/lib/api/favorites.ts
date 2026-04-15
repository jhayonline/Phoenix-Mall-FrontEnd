import { backendRequest } from './client';
import { ProductResponseData } from './types';

export const favoritesApi = {
  async list(): Promise<{ success: boolean; data: ProductResponseData[]; message: string }> {
    const response = await backendRequest<ProductResponseData[]>('/favorites');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async add(productPid: string): Promise<{ success: boolean; data: unknown; message: string }> {
    const response = await backendRequest<unknown>(`/favorites/${productPid}`, {
      method: 'POST',
    });
    return {
      success: true,
      data: response.data,
      message: 'Added to favorites'
    };
  },

  async remove(productPid: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/favorites/${productPid}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Removed from favorites'
    };
  },

  async check(productPid: string): Promise<{ success: boolean; data: { favorited: boolean }; message: string }> {
    const response = await backendRequest<{ favorited: boolean }>(`/favorites/${productPid}/check`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },
};
