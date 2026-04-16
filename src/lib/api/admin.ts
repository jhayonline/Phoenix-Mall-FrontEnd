import { backendRequest } from './client';

export const adminApi = {
  async getStats(): Promise<{ success: boolean; data: any; message: string }> {
    const response = await backendRequest<any>('/admin/stats');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async getUsers(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await backendRequest<any[]>('/admin/users');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ success: boolean; message: string }> {
    await backendRequest<unknown>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
    return {
      success: true,
      message: 'User status updated'
    };
  },

  async updateUserRole(userId: number, role: string): Promise<{ success: boolean; message: string }> {
    await backendRequest<unknown>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return {
      success: true,
      message: 'User role updated'
    };
  },

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    await backendRequest<unknown>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      message: 'User deleted'
    };
  },

  async getProducts(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await backendRequest<any[]>('/admin/products');
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    await backendRequest<unknown>(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      message: 'Product deleted'
    };
  },
};
