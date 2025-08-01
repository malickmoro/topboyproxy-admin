'use client';

import { useState, useEffect } from 'react';
import { Globe, Filter, Download, Search, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient, UploadedCode } from '@/lib/api';
import { backendToDisplay, displayToBackend, DISPLAY_CATEGORIES } from '@/lib/categoryUtils';

export default function CodesPage() {
  const [codes, setCodes] = useState<UploadedCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    isUsed: '',
    search: ''
  });
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCodes();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      console.log('Categories fetched:', data);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories
      setCategories(['FIFTY', 'HUNDRED']);
    }
  };

  const fetchCodes = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching codes with filters:', filters);
      
      // Convert display category to backend category if needed
      const backendFilters = {
        category: filters.category ? displayToBackend(filters.category as any) : undefined,
        isUsed: filters.isUsed !== '' ? filters.isUsed === 'true' : undefined
      };
      console.log('Backend filters:', backendFilters);
      
      const data = await apiClient.getUploadedCodes(backendFilters);
      console.log('Codes data received:', data);
      setCodes(data);
    } catch (err: any) {
      console.error('Error fetching codes:', err);
      setError('Failed to fetch codes: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    console.log('Filter changed:', key, value);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      isUsed: '',
      search: ''
    });
    console.log('Clearing filters');
  };

  const exportCodes = () => {
    if (codes.length === 0) {
      alert('No codes to export');
      return;
    }
    
    const csvContent = [
      'Code,Category,Uploaded At,Status',
      ...codes.map(code => `${code.code},${backendToDisplay(code.category)},${code.uploadedAt || 'N/A'},${code.used ? 'Used' : 'Available'}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxy-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredCodes = codes.filter(code => {
    if (filters.search && !code.code.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && code.category !== displayToBackend(filters.category as any)) {
      return false;
    }
    if (filters.isUsed !== '' && code.used !== (filters.isUsed === 'true')) {
      return false;
    }
    return true;
  });

  const stats = {
    total: codes.length,
    available: codes.filter(c => !c.used).length,
    used: codes.filter(c => c.used).length,
    fifty: codes.filter(c => c.category === 'FIFTY').length,
    hundred: codes.filter(c => c.category === 'HUNDRED').length
  };

  console.log('Codes page render - codes:', codes, 'loading:', loading, 'error:', error);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proxy Unlocking Codes</h1>
              <p className="text-sm sm:text-base text-gray-600">View and manage all uploaded proxy unlocking codes</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowCodes(!showCodes)}
                className="btn-secondary flex items-center justify-center"
              >
                {showCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showCodes ? 'Hide Codes' : 'Show Codes'}
              </button>
              <button
                onClick={exportCodes}
                disabled={codes.length === 0}
                className="btn-secondary flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-2 text-sm text-red-600">{error}</p>
                </div>
                <button
                  onClick={fetchCodes}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Codes</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Available</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Used</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.used}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">50 Category</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.fifty}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">100 Category</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.hundred}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Code
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by code..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {backendToDisplay(cat as 'FIFTY' | 'HUNDRED')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.isUsed}
                    onChange={(e) => handleFilterChange('isUsed', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    <option value="false">Available</option>
                    <option value="true">Used</option>
                  </select>
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
          </div>

          {/* Codes Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Proxy Unlocking Codes</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Loading codes...
                  </p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchCodes}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              ) : codes.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Globe className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Codes Available</h3>
                  <p className="text-gray-600 mb-4">
                    {filters.category || filters.isUsed || filters.search
                      ? 'No codes found with the current filters. Try adjusting your search criteria.'
                      : 'No codes have been uploaded yet. Upload codes using the Upload page to see them here.'
                    }
                  </p>
                  {(filters.category || filters.isUsed || filters.search) && (
                    <button
                      onClick={clearFilters}
                      className="btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sold At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-mono text-sm text-gray-900">
                              {showCodes ? code.code : '••••••••••••••••'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.category === 'FIFTY'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {backendToDisplay(code.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {code.uploadedAt ? new Date(code.uploadedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.used
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {code.used ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Proxy Codes Management</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Use the "Show Codes" button to reveal or hide the actual proxy unlocking codes</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Filter codes by category, status, or search for specific proxy codes</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Export proxy codes to CSV for backup or analysis</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Proxy codes are automatically marked as "Used" when customers purchase them</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 