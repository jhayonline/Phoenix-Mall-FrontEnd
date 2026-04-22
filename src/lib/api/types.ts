// ============ BACKEND RESPONSE TYPES ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// Auth backend responses
export interface LoginResponseData {
  token: string;
  pid: string;
  id: number;
  name: string;
  is_verified: boolean;
  role?: string;
  email?: string;
}

export interface CurrentUserResponseData {
  id: number;
  pid: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: number;
  pid: string;
  username?: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  location?: string | null;
  bio?: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  product_count: number;
  created_at: string;
}

// Profile backend responses
export interface ProfileResponseData {
  pid: string;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  location: string | null;
  whatsapp_enabled: boolean | null;
  phone_enabled: boolean | null;
  is_active: boolean | null;
  email_verified: boolean;
  follower_count: number;
  following_count: number;
  role: string | null;
  created_at: string;
}

export interface StatsResponseData {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_favorites: number;
  total_views: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at?: string | null;
}

// Product backend responses
export interface ProductResponseData {
  id: string;
  pid: string;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  location: string | null;
  category_id: string | null;
  seller_id: number;
  status: string;
  whatsapp_contact: boolean;
  phone_contact: boolean;
  views_count: number;
  created_at: string | null;
  updated_at: string | null;
  images?: ProductImage[];
  wishlist_count?: number;
  average_rating?: number;
  total_reviews?: number;
}

export interface PaginatedProductsResponse {
  items: ProductResponseData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Category backend responses
export interface CategoryResponseData {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  display_order: number | null;
  is_active: boolean;
  created_at: string | null;
}

// ============ FRONTEND EXPECTED TYPES ============

export interface User {
  id: number;
  pid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    avatar_url: string | null;
    location: string | null;
    whatsapp_enabled: boolean;
    phone_enabled: boolean;
    is_active: boolean;
    email_verified: boolean;
  };
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: StatsResponseData;
}

export interface ListingsResponse {
  success: boolean;
  message: string;
  data: ProductResponseData[];
}

export interface PaginatedProductsResponse {
  items: ProductResponseData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: ProductResponseData[];
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: ProductResponseData;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: CategoryResponseData[];
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: CategoryResponseData;
}

// ============ API REQUEST TYPES ============

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  whatsapp_enabled?: boolean;
  phone_enabled?: boolean;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  condition?: string;
  location?: string;
  category_id?: string;
  whatsapp_contact?: boolean;
  phone_contact?: boolean;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  location?: string;
  category_id?: string;
  status?: string;
  whatsapp_contact?: boolean;
  phone_contact?: boolean;
}
