import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, Sale, ProxyPriceConfig, UploadResult, ApiResponse } from '@/types';

// Add new type for uploaded codes
export interface UploadedCode {
  id: number;
  code: string;
  category: 'FIFTY' | 'HUNDRED';
  uploadedAt: string | null;
  usedAt: string | null;
  used: boolean;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url, config.data || config.params);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url, response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing backend connection...');
      const response = await this.client.get('/admin/prices');
      console.log('Backend connection successful:', response.status);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/admin/login', credentials);
    return response.data;
  }

  // Sales endpoints - Note: This endpoint doesn't exist in your backend yet
  async getSales(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Sale[]> {
    console.warn('Sales endpoint not implemented yet. Please add /admin/sales endpoint to your backend.');
    // Return empty array since this endpoint doesn't exist
    return [];
  }

  // Codes endpoints
  async getUploadedCodes(filters?: { category?: string; isUsed?: boolean }): Promise<UploadedCode[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isUsed !== undefined) params.append('isUsed', filters.isUsed.toString());
      
      const response: AxiosResponse<UploadedCode[]> = await this.client.get(`/admin/codes?${params.toString()}`);
      console.log('Codes fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch codes:', error);
      // Return empty array if endpoint fails
      return [];
    }
  }

  // Categories endpoints
  async getCategories(): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await this.client.get('/admin/categories');
      console.log('Categories fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return default categories if endpoint fails
      return ['FIFTY', 'HUNDRED'];
    }
  }

  // Upload endpoints
  async uploadCodes(file: File, category: 'FIFTY' | 'HUNDRED'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<UploadResult> = await this.client.post(`/admin/upload?category=${category}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Price endpoints
  async getPrices(): Promise<ProxyPriceConfig[]> {
    try {
      const response: AxiosResponse<ProxyPriceConfig[]> = await this.client.get('/admin/prices');
      console.log('Prices fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      // Return default prices if endpoint fails
      return [
        { id: 1, category: 'FIFTY', price: 50.00 },
        { id: 2, category: 'HUNDRED', price: 100.00 }
      ];
    }
  }

  async updatePrice(category: 'FIFTY' | 'HUNDRED', newPrice: number): Promise<ProxyPriceConfig> {
    const response: AxiosResponse<ProxyPriceConfig> = await this.client.put(`/admin/price?category=${category}&newPrice=${newPrice}`);
    return response.data;
  }
}

export const apiClient = new ApiClient(); 