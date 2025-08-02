'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, AlertCircle, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomDropdown from '@/components/CustomDropdown';
import { apiClient } from '@/lib/api';
import { Sale } from '@/types';
import { backendToDisplay } from '@/lib/categoryUtils';

type SalesPeriod = 'daily' | 'monthly' | 'total';

interface SalesStatistics {
  total: number;
  daily: number;
  monthly: number;
  revenue: {
    total: number;
    daily: number;
    monthly: number;
  };
  byCategory: {
    [key: string]: number;
  };
}

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [statistics, setStatistics] = useState<SalesStatistics | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePeriod, setActivePeriod] = useState<SalesPeriod>('total');
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
      
      // Pass filters to the API
      const response = await apiClient.getSales({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        category: filters.category || undefined
      });
      
      console.log('Sales response received:', response);
      setSales(response.sales || []);
      setStatistics(response.statistics || null);
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
      'Date,Phone Number,Proxy Code,Category,Amount',
      ...sales.map(sale => `${sale.date},${sale.phoneNumber},${sale.proxyCode},${backendToDisplay(sale.category)},${sale.amount || 0}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get statistics based on active period
  const getStatsForPeriod = () => {
    if (!statistics) {
      return {
        total: 0,
        fifty: 0,
        hundred: 0,
        other: 0,
        revenue: 0
      };
    }

    const periodStats = {
      total: activePeriod === 'daily' ? statistics.daily : 
             activePeriod === 'monthly' ? statistics.monthly : 
             statistics.total,
      fifty: statistics.byCategory?.FIFTY || 0,
      hundred: statistics.byCategory?.HUNDRED || 0,
      other: Object.entries(statistics.byCategory || {})
        .filter(([key]) => key !== 'FIFTY' && key !== 'HUNDRED')
        .reduce((sum, [, count]) => sum + count, 0),
      revenue: activePeriod === 'daily' ? statistics.revenue?.daily || 0 :
               activePeriod === 'monthly' ? statistics.revenue?.monthly || 0 :
               statistics.revenue?.total || 0
    };

    return periodStats;
  };

  const stats = getStatsForPeriod();

  console.log('Dashboard render - sales:', sales, 'statistics:', statistics, 'loading:', loading, 'error:', error);

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

          {/* Sales Period Tabs */}
          <div className="card p-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActivePeriod('total')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === 'total'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Total Sales
              </button>
              <button
                onClick={() => setActivePeriod('monthly')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === 'monthly'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Monthly Sales
              </button>
              <button
                onClick={() => setActivePeriod('daily')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === 'daily'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Daily Sales
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {activePeriod === 'daily' ? 'Today' : activePeriod === 'monthly' ? 'This Month' : 'Total'} Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.fifty}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hundred}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Other Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.other}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₵{stats.revenue}</p>
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
                      label: backendToDisplay(cat as any)
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
                              : sale.category === 'HUNDRED'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : sale.category === 'TWO_HUNDRED'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                              : sale.category === 'THREE_HUNDRED'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : sale.category === 'FOUR_HUNDRED'
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
                              : sale.category === 'SIX_HUNDRED'
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                              : sale.category === 'EIGHT_HUNDRED'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                              : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
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