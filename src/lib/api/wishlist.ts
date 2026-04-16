import { backendRequest } from './client';

export interface WishlistItem {
  id: string;
  product_id: string;
  product_pid: string;
  title: string;
  price: number;
  image_url?: string;
  condition?: string | null;
  location?: string | null;
}

export const wishlistApi = {
  async getWishlist(): Promise<{ success: boolean; data: WishlistItem[]; message: string }> {
    const response = await backendRequest<WishlistItem[]>('/wishlist');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async addToWishlist(productPid: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_pid: productPid }),
    });
    return {
      success: true,
      data: null,
      message: 'Added to wishlist'
    };
  },

  async removeFromWishlist(productPid: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/wishlist/${productPid}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Removed from wishlist'
    };
  },

  async clearWishlist(): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>('/wishlist/clear', {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Wishlist cleared'
    };
  },

  async checkInWishlist(productPid: string): Promise<{ success: boolean; data: { favorited: boolean }; message: string }> {
    const response = await backendRequest<{ favorited: boolean }>(`/wishlist/${productPid}/check`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },
};
