'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, X, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { ProxyPriceConfig } from '@/types';
import { backendToDisplay } from '@/lib/categoryUtils';

export default function PricesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [prices, setPrices] = useState<ProxyPriceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategoriesAndPrices();
  }, []);

  const fetchCategoriesAndPrices = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching categories and prices...');
      
      // Fetch categories from backend
      const categoryData = await apiClient.getCategories();
      console.log('Categories fetched:', categoryData);
      setCategories(categoryData);
      
      // Fetch current prices for each category
      const pricePromises = categoryData.map(async (category) => {
        try {
          const response = await apiClient.getPrices();
          const categoryPrice = response.find(p => p.category === category);
          return categoryPrice || { id: undefined, category: category as 'FIFTY' | 'HUNDRED', price: 0 };
        } catch (err) {
          console.warn(`Failed to fetch price for ${category}:`, err);
          return { id: undefined, category: category as 'FIFTY' | 'HUNDRED', price: 0 };
        }
      });
      
      const priceData = await Promise.all(pricePromises);
      console.log('Prices data received:', priceData);
      setPrices(priceData as ProxyPriceConfig[]);
      
    } catch (err: any) {
      console.error('Error fetching categories and prices:', err);
      setError('Failed to fetch data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category: string) => {
    console.log('Starting to edit category:', category);
    const currentPrice = prices.find(p => p.category === category)?.price || 0;
    setEditingCategory(category);
    setEditValue(currentPrice.toString());
    setSuccessMessage('');
  };

  const cancelEditing = () => {
    console.log('Canceling edit');
    setEditingCategory(null);
    setEditValue('');
  };

  const savePrice = async (categoryName: string) => {
    const newPrice = parseInt(editValue);
    
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      console.log('Updating price for', categoryName, 'to', newPrice);
      const updatedCategory = await apiClient.updatePrice(categoryName as 'FIFTY' | 'HUNDRED', newPrice);
      console.log('Price updated successfully:', updatedCategory);
      
      // Update the local state
      setPrices(prev => 
        prev.map(cat => 
          cat.category === categoryName ? { ...cat, price: newPrice } : cat
        )
      );
      
      setEditingCategory(null);
      setEditValue('');
      const displayName = backendToDisplay(categoryName as 'FIFTY' | 'HUNDRED');
      setSuccessMessage(`Price for ${displayName} updated successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating price:', err);
      setError(err.response?.data?.message || 'Failed to update price');
    } finally {
      setUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, categoryName: string) => {
    if (e.key === 'Enter') {
      savePrice(categoryName);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  console.log('Prices page render - categories:', categories, 'prices:', prices, 'loading:', loading, 'error:', error);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Update Prices</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage pricing for different proxy categories</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-2 text-sm text-green-800 dark:text-green-300">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <button
                  onClick={fetchCategoriesAndPrices}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Prices Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Category Prices</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Loading prices...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Categories Available</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No categories found. This might be because:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-left max-w-md mx-auto">
                    <li>• No categories have been configured yet</li>
                    <li>• The backend database is empty</li>
                    <li>• There's a connection issue</li>
                  </ul>
                  <button
                    onClick={fetchCategoriesAndPrices}
                    className="btn-primary"
                  >
                    Refresh Data
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => {
                      const priceInfo = prices.find(p => p.category === category);
                      const currentPrice = priceInfo?.price || 0;
                      
                      return (
                        <tr key={category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${
                                category === 'FIFTY' 
                                  ? 'bg-green-100 dark:bg-green-900/30' 
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                <Globe className={`h-5 w-5 ${
                                  category === 'FIFTY' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                {backendToDisplay(category as 'FIFTY' | 'HUNDRED')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCategory === category ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e, category)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  min="0"
                                  autoFocus
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">GHS</span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {currentPrice} GHS
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCategory === category ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => savePrice(category)}
                                  disabled={updating}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1"
                                  title="Save"
                                >
                                  {updating ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={updating}
                                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 p-1"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(category)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1"
                                title="Edit price"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Price Management</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Click the edit icon to modify prices for each category</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Press Enter to save or Escape to cancel editing</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Prices are updated immediately and will affect new sales</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>All prices are in GHS (Ghanaian Cedi)</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 