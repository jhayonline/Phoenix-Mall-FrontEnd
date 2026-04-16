import { backendRequest } from './client';
import { CategoriesResponse, CategoryResponse, CategoryResponseData } from './types';

export const categoriesApi = {
  async getAllCategories(): Promise<CategoriesResponse> {
    const response = await backendRequest<CategoryResponseData[]>('/categories/list');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async getCategoryTree(): Promise<CategoriesResponse> {
    const response = await backendRequest<CategoryResponseData[]>('/categories/tree');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    const response = await backendRequest<CategoryResponseData>(`/categories/${slug}`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  // Admin only - Create category
  async createCategory(data: {
    name: string;
    slug: string;
    parent_id: string | null;
    level: number;
    display_order: number;
  }): Promise<CategoryResponse> {
    const response = await backendRequest<CategoryResponseData>('/categories/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      data: response.data,
      message: 'Category created'
    };
  },

  // Admin only - Update category
  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      parent_id?: string | null;
      level?: number;
      display_order?: number;
      is_active?: boolean;
    }
  ): Promise<CategoryResponse> {
    const response = await backendRequest<CategoryResponseData>(`/categories/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      data: response.data,
      message: 'Category updated'
    };
  },

  // Admin only - Delete category
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    await backendRequest<unknown>(`/categories/admin/${id}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      message: 'Category deleted'
    };
  },
};
