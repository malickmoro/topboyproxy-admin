export interface User {
  id: string;
  email: string;
  role: 'admin';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Sale {
  id: string;
  date: string;
  phoneNumber: string;
  proxyCode: string;
  category: 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND';
}

export interface ProxyPriceConfig {
  id?: number;
  category: 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND';
  price: number;
}

export interface UploadResult {
  totalUploaded: number;
  duplicates: string[];
  blankLines: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 