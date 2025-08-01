'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomDropdown from '@/components/CustomDropdown';
import { apiClient } from '@/lib/api';
import { Sale } from '@/types';
import { backendToDisplay } from '@/lib/categoryUtils';

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchSales();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      console.log('Categories fetched for dashboard:', data);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories
      setCategories(['FIFTY', 'HUNDRED']);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getSales();
      console.log('Sales data received:', data);
      setSales(data);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
    });
  };

  const exportData = () => {
    if (sales.length === 0) {
      return;
    }
    
    const csvContent = [
      'Date,Phone Number,Proxy Code,Category',
      ...sales.map(sale => `${sale.date},${sale.phoneNumber},${sale.proxyCode},${backendToDisplay(sale.category)}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  console.log('Dashboard render - sales:', sales, 'loading:', loading, 'error:', error);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Monitor your proxy sales and customer data</p>
            </div>
            <button
              onClick={exportData}
              disabled={sales.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sales.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">50 Category</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sales.filter(s => s.category === 'FIFTY').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">100 Category</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sales.filter(s => s.category === 'HUNDRED').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map((cat) => ({
                      value: cat,
                      label: backendToDisplay(cat as 'FIFTY' | 'HUNDRED')
                    }))
                  ]}
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  placeholder="All Categories"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sales Data</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Loading sales data...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchSales}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              ) : sales.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Sales Data Available</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {filters.startDate || filters.endDate || filters.category 
                      ? 'No sales found with the current filters. Try adjusting your search criteria.'
                      : 'No sales data has been recorded yet. Sales will appear here once customers make purchases.'
                    }
                  </p>
                  {(filters.startDate || filters.endDate || filters.category) && (
                    <button
                      onClick={clearFilters}
                      className="btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Proxy Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {sale.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                          {sale.proxyCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sale.category === 'FIFTY' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            {backendToDisplay(sale.category)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 