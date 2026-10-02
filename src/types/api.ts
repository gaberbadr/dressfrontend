export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginationResponse<T> {
  pageSize: number;
  pageIndex: number;
  count: number;
  data: T[];
}

export interface GetProductsQuery {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: number;
  categoryIds?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
  };
  banMinutes?: number;
}
