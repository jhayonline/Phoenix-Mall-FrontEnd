import { backendRequest } from './client';
import type { ProductResponseData } from './types';

export interface CartItem {
  id: string;
  product_id: string;
  product_pid: string;
  title: string;
  price: number;
  quantity: number;
  image_url?: string;
  condition?: string | null;
  location?: string | null;
}

export const cartApi = {
  async getCart(): Promise<{ success: boolean; data: CartItem[]; message: string }> {
    const response = await backendRequest<CartItem[]>('/cart');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async addToCart(productPid: string, quantity: number = 1): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_pid: productPid, quantity }),
    });
    return {
      success: true,
      data: null,
      message: 'Added to cart'
    };
  },

  async updateQuantity(productPid: string, quantity: number): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/cart/${productPid}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return {
      success: true,
      data: null,
      message: 'Cart updated'
    };
  },

  async removeItem(productPid: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/cart/${productPid}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Item removed'
    };
  },

  async clearCart(): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>('/cart/clear', {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Cart cleared'
    };
  },
};
