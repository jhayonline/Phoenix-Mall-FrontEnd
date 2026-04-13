import { backendRequest } from './client';
import {
  CategoriesResponse,
  CategoryResponse,
  CategoryResponseData,
} from './types';

export const categoriesApi = {
  async getAllCategories(): Promise<CategoriesResponse> {
    const response = await backendRequest<CategoryResponseData[]>('/categories/list');
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
};
