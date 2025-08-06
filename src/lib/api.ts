import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, Sale, ProxyPriceConfig, UploadResult } from '@/types';

// Add UploadedCode interface here since it's not in types
export interface UploadedCode {
  id: number;
  code: string;
  category: 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND';
  uploadedAt: string | null;
  usedAt: string | null;
  used: boolean;
}

// Get API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://topboyproxy-backend-d7f79039f73a.herokuapp.com';

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
  async getSales(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<{ sales: Sale[]; statistics?: any }> {
    try {
      console.log('🔍 Frontend: Fetching sales with filters:', filters);
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.category) params.append('category', filters.category);
      
      const url = `/admin/sales?${params.toString()}`;
      console.log('🔍 Frontend: Making API call to:', url);
      
      const response: AxiosResponse<{ sales: Sale[]; statistics?: any }> = await this.client.get(url);
      console.log('🔍 Frontend: Sales data received from backend:', response.data);
      console.log('🔍 Frontend: Number of sales returned:', response.data.sales?.length || 0);
      
      return response.data;
    } catch (error: any) { // Fixed error type
      console.error('❌ Frontend: Failed to fetch sales:', error);
      if (error.response?.status === 404) {
        console.warn('⚠️ Frontend: Sales endpoint not implemented yet. Please add /admin/sales endpoint to your backend.');
        return { sales: [] };
      }
      throw error;
    }
  }

  // Aggregated sales data for charts
  async getAggregatedSales(period: 'daily' | 'weekly' | 'monthly', filters?: { startDate?: string; endDate?: string; category?: string }): Promise<{ data: Array<{ label: string; sales: number; revenue: number }> }> {
    try {
      console.log('🔍 Frontend: Fetching aggregated sales for period:', period);
      const params = new URLSearchParams();
      params.append('period', period);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.category) params.append('category', filters.category);
      
      const url = `/admin/sales/aggregated?${params.toString()}`;
      console.log('🔍 Frontend: Making API call to:', url);
      
      const response: AxiosResponse<{ data: Array<{ label: string; sales: number; revenue: number }> }> = await this.client.get(url);
      console.log('🔍 Frontend: Aggregated sales data received:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Frontend: Failed to fetch aggregated sales:', error);
      if (error.response?.status === 404) {
        console.warn('⚠️ Frontend: Aggregated sales endpoint not implemented yet. Please add /admin/sales/aggregated endpoint to your backend.');
        // Return mock data for development
        return { data: this.getMockAggregatedData(period) };
      }
      throw error;
    }
  }

  // Mock data for development when backend endpoint is not available
  private getMockAggregatedData(period: 'daily' | 'weekly' | 'monthly'): Array<{ label: string; sales: number; revenue: number }> {
    switch (period) {
      case 'daily':
        return [
          { label: 'Sunday', sales: 12, revenue: 1200 },
          { label: 'Monday', sales: 18, revenue: 1800 },
          { label: 'Tuesday', sales: 15, revenue: 1500 },
          { label: 'Wednesday', sales: 22, revenue: 2200 },
          { label: 'Thursday', sales: 19, revenue: 1900 },
          { label: 'Friday', sales: 25, revenue: 2500 },
          { label: 'Saturday', sales: 30, revenue: 3000 },
        ];
      case 'weekly':
        return [
          { label: 'Week 1', sales: 85, revenue: 8500 },
          { label: 'Week 2', sales: 92, revenue: 9200 },
          { label: 'Week 3', sales: 78, revenue: 7800 },
          { label: 'Week 4', sales: 105, revenue: 10500 },
        ];
      case 'monthly':
        return [
          { label: 'January', sales: 320, revenue: 32000 },
          { label: 'February', sales: 285, revenue: 28500 },
          { label: 'March', sales: 310, revenue: 31000 },
          { label: 'April', sales: 295, revenue: 29500 },
          { label: 'May', sales: 340, revenue: 34000 },
          { label: 'June', sales: 365, revenue: 36500 },
        ];
      default:
        return [];
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
      return ['FIFTY', 'HUNDRED', 'TWO_HUNDRED', 'THREE_HUNDRED', 'FOUR_HUNDRED', 'SIX_HUNDRED', 'EIGHT_HUNDRED', 'THOUSAND'];
    }
  }

  // Upload endpoints
  async uploadCodes(file: File, category: 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND'): Promise<UploadResult> {
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
        { id: 2, category: 'HUNDRED', price: 100 },
        { id: 3, category: 'TWO_HUNDRED', price: 200 },
        { id: 4, category: 'THREE_HUNDRED', price: 300 },
        { id: 5, category: 'FOUR_HUNDRED', price: 400 },
        { id: 6, category: 'SIX_HUNDRED', price: 600 },
        { id: 7, category: 'EIGHT_HUNDRED', price: 800 },
        { id: 8, category: 'THOUSAND', price: 1000 }
      ];
    }
  }

  async updatePrice(category: 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND', newPrice: number): Promise<ProxyPriceConfig> {
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

  // Delete code endpoint
  async deleteCode(codeId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Deleting code with ID:', codeId);
      const response: AxiosResponse<{ success: boolean; message: string }> = await this.client.delete(`/admin/codes/${codeId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete code failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 