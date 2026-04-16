import { backendRequest } from './client';
import {
  CreateProductData,
  ProductResponse,
  ProductResponseData,
  ProductsResponse,
  UpdateProductData,
  PaginatedProductsResponse,
} from './types';

export const productsApi = {
  async getProducts(filters?: Record<string, unknown>): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/products/list${queryString ? `?${queryString}` : ''}`;

    const response = await backendRequest<PaginatedProductsResponse>(endpoint);

    return {
      success: true,
      data: response.data.items,
      message: 'Success',
      pagination: {
        total: response.data.total,
        page: response.data.page,
        per_page: response.data.per_page,
        total_pages: response.data.total_pages,
      }
    };
  },

  async getProduct(pid: string): Promise<ProductResponse> {
    const response = await backendRequest<ProductResponseData>(`/products/get/${pid}`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async createProduct(productData: CreateProductData): Promise<ProductResponse> {
    const response = await backendRequest<ProductResponseData>('/products/create', {
      method: 'POST',
      body: JSON.stringify({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        condition: productData.condition,
        location: productData.location,
        category_id: productData.category_id,
        whatsapp_contact: productData.whatsapp_contact,
        phone_contact: productData.phone_contact
      }),
    });

    return {
      success: true,
      data: response.data,
      message: 'Product created'
    };
  },

  async updateProduct(pid: string, productData: UpdateProductData): Promise<ProductResponse> {
    const response = await backendRequest<ProductResponseData>(`/products/update/${pid}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        condition: productData.condition,
        location: productData.location,
        category_id: productData.category_id,
        status: productData.status,
        whatsapp_contact: productData.whatsapp_contact,
        phone_contact: productData.phone_contact
      }),
    });

    return {
      success: true,
      data: response.data,
      message: 'Product updated'
    };
  },

  async deleteProduct(pid: string): Promise<{ success: boolean; data: null; message: string }> {
    await backendRequest<unknown>(`/products/delete/${pid}`, {
      method: 'DELETE',
    });

    return {
      success: true,
      data: null,
      message: 'Product deleted'
    };
  },

  async markAsSold(pid: string): Promise<ProductResponse> {
    const response = await backendRequest<ProductResponseData>(`/products/${pid}/mark-sold`, {
      method: 'POST',
    });

    return {
      success: true,
      data: response.data,
      message: 'Product marked as sold'
    };
  },

  async getSearchSuggestions(searchTerm: string): Promise<{ success: boolean; data: string[]; message: string }> {
    const response = await backendRequest<string[]>(`/products/search/suggestions?search=${encodeURIComponent(searchTerm)}`);
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },
};
