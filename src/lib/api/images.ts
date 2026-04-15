import { backendRequest } from './client';

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export const imagesApi = {
  async upload(productPid: string, file: File): Promise<{ success: boolean; data: ProductImage; message: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('access_token');
    const url = `${import.meta.env.VITE_API_BASE_URL}/products/${productPid}/images`;

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
      data,
      message: 'Image uploaded'
    };
  },

  async getImages(productPid: string): Promise<{ success: boolean; data: ProductImage[]; message: string }> {
    const response = await backendRequest<ProductImage[]>(`/products/${productPid}/images`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
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
