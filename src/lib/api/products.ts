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
  async getProducts(_filters?: Record<string, unknown>): Promise<ProductsResponse> {
    const response = await backendRequest<PaginatedProductsResponse>('/products/list');
    return {
      success: true,
      data: response.data.items,
      message: 'Success'
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
};
