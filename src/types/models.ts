export interface ProductFeature {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  description: string;
  price: number;
  mainImage: string;
  additionalImages: string[];
  isAvailable: boolean;
  categoryId: number;
  categoryName: string;
  sizes: string[];
  features: ProductFeature[];
}

export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
  children: Category[];
}

export interface Settings {
  id: number;
  storeName: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  phoneNumber?: string;
  location?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  roles: string[];
}
