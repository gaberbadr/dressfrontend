import api from '../../../services/api/axios';
import type { Category } from '../../../types/models';
import type { ApiResponse } from '../../../types/api';

let categoriesCache: ApiResponse<Category[]> | null = null;
let categoriesCachePromise: Promise<ApiResponse<Category[]>> | null = null;

export const categoriesApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    if (categoriesCache) return categoriesCache;
    if (categoriesCachePromise) return categoriesCachePromise;

    categoriesCachePromise = api.get('/categories').then(res => {
      categoriesCache = res.data;
      categoriesCachePromise = null;
      return res.data;
    }).catch(err => {
      categoriesCachePromise = null;
      throw err;
    });
    return categoriesCachePromise;
  },
  getHierarchy: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories/hierarchy');
    return response.data;
  },
  createCategory: async (data: { name: string; parentCategoryId?: number }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', data);
    categoriesCache = null; // Invalidate
    return response.data;
  },
  updateCategory: async (id: number, data: { id: number; name: string; parentCategoryId?: number }): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, data);
    categoriesCache = null; // Invalidate
    return response.data;
  },
  deleteCategory: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete(`/categories/${id}`);
    categoriesCache = null; // Invalidate
    return response.data;
  }
};
