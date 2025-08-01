import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, Sale, ProxyPriceConfig, UploadResult } from '@/types';

// Add UploadedCode interface here since it's not in types
export interface UploadedCode {
  id: number;
  code: string;
  category: 'FIFTY' | 'HUNDRED';
  uploadedAt: string | null;
  usedAt: string | null;
  used: boolean;
}

// Get API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/admin/prices');
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/admin/login`);
      const response: AxiosResponse<LoginResponse> = await this.client.post('/admin/login', credentials);
      console.log('Login response received:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Sales endpoints
  async getSales(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Sale[]> {
    try {
      console.log('Fetching sales with filters:', filters);
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.category) params.append('category', filters.category);
      
      const response: AxiosResponse<Sale[]> = await this.client.get(`/admin/sales?${params.toString()}`);
      console.log('Sales data received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch sales:', error);
      // Return empty array if endpoint doesn't exist (not implemented in backend)
      if (error.response?.status === 404) {
        console.warn('Sales endpoint not implemented yet. Please add /admin/sales endpoint to your backend.');
        return [];
      }
      throw error;
    }
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
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      console.log('Uploading codes to:', `${API_BASE_URL}/admin/upload?category=${category}`);
      const response: AxiosResponse<UploadResult> = await this.client.post(`/admin/upload?category=${category}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Price endpoints
  async getPrices(): Promise<ProxyPriceConfig[]> {
    try {
      console.log('Fetching prices from:', `${API_BASE_URL}/admin/prices`);
      const response: AxiosResponse<ProxyPriceConfig[]> = await this.client.get('/admin/prices');
      console.log('Prices data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      // Return default prices if API fails
      return [
        { id: 1, category: 'FIFTY', price: 50 },
        { id: 2, category: 'HUNDRED', price: 100 }
      ];
    }
  }

  async updatePrice(category: 'FIFTY' | 'HUNDRED', newPrice: number): Promise<ProxyPriceConfig> {
    try {
      console.log('Updating price for', category, 'to', newPrice);
      const response: AxiosResponse<ProxyPriceConfig> = await this.client.put(`/admin/price?category=${category}&newPrice=${newPrice}`);
      console.log('Price update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Price update failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 