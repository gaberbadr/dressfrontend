import api from '../../../services/api/axios';
import type { Product } from '../../../types/models';
import type { ApiResponse, PaginationResponse, GetProductsQuery } from '../../../types/api';

export const productsApi = {
  getProducts: async (query: GetProductsQuery, config?: any): Promise<ApiResponse<PaginationResponse<Product>>> => {
    const response = await api.get('/products', { params: query, ...config });
    return response.data;
  },
  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (data: FormData | Partial<Product>): Promise<ApiResponse<Product>> => {
    const isFormData = data instanceof FormData;
    // Explicitly set to undefined so Axios removes the default application/json and lets the browser calculate the boundary
    const response = await api.post('/products', data, isFormData ? {
      headers: { 'Content-Type': undefined }
    } : undefined);
    return response.data;
  },
  updateProduct: async (id: number, data: FormData | Partial<Product>): Promise<ApiResponse<Product>> => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/products/${id}`, data, isFormData ? {
      headers: { 'Content-Type': undefined }
    } : undefined);
    return response.data;
  },
  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
