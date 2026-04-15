import { backendRequest, getImageUrl } from './client';
import type { ProductImage } from './types';

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5150/api';
const API_BASE_URL_WITHOUT_API = API_BASE_URL.replace('/api', '');

export const imagesApi = {
  async getImages(productPid: string): Promise<{ success: boolean; data: ProductImage[]; message: string }> {
    const response = await backendRequest<ProductImage[]>(`/products/${productPid}/images`);
    // Transform image URLs to full URLs
    const imagesWithFullUrls = response.data.map(img => ({
      ...img,
      image_url: getImageUrl(img.image_url)
    }));
    return {
      success: true,
      data: imagesWithFullUrls,
      message: 'Success'
    };
  },

  // Also update the upload response
  async upload(productPid: string, file: File): Promise<{ success: boolean; data: ProductImage; message: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL_WITHOUT_API}/api/products/${productPid}/images`;

    const response = await fetch(url, {
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

    const data = await response.json();
    return {
      success: true,
      data: {
        ...data,
        image_url: getImageUrl(data.image_url)
      },
      message: 'Image uploaded'
    };
  },

  async setPrimary(productPid: string, imageId: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/products/${productPid}/images/${imageId}/primary`, {
      method: 'PUT',
    });
    return {
      success: true,
      data: null,
      message: 'Primary image set'
    };
  },

  async deleteImage(productPid: string, imageId: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/products/${productPid}/images/${imageId}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: null,
      message: 'Image deleted'
    };
  },
};
