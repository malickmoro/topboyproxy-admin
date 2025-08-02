'use client';

import { useState, useEffect } from 'react';
import { Globe, Eye, EyeOff, Download, Search, AlertCircle, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomDropdown from '@/components/CustomDropdown';
import { apiClient } from '@/lib/api';
import { UploadedCode } from '@/lib/api';
import { backendToDisplay } from '@/lib/categoryUtils';

export default function CodesPage() {
  const [codes, setCodes] = useState<UploadedCode[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [deletingCodeId, setDeletingCodeId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; codeId: number | null; codeValue: string }>({
    show: false,
    codeId: null,
    codeValue: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isUsed: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchCodes();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      console.log('Categories fetched for codes page:', data);
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
      
      // Convert display category to backend category if needed
      const backendFilters = {
        category: filters.category ? (filters.category === '50' ? 'FIFTY' : 'HUNDRED') : undefined,
        isUsed: filters.isUsed ? (filters.isUsed === 'true') : undefined
      };
      
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
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      isUsed: '',
    });
  };

  const exportCodes = () => {
    if (codes.length === 0) {
      return;
    }
    
    const csvContent = [
      'Code,Category,Status,Uploaded At,Used At',
      ...filteredCodes.map(code => [
        code.code,
        backendToDisplay(code.category),
        code.used ? 'Used' : 'Available',
        code.uploadedAt ? new Date(code.uploadedAt).toLocaleDateString() : 'N/A',
        code.usedAt ? new Date(code.usedAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (codeId: number, codeValue: string) => {
    setDeleteConfirm({
      show: true,
      codeId,
      codeValue
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.codeId) return;

    try {
      setDeletingCodeId(deleteConfirm.codeId);
      await apiClient.deleteCode(deleteConfirm.codeId);
      
      // Remove the deleted code from the local state
      setCodes(prevCodes => prevCodes.filter(code => code.id !== deleteConfirm.codeId));
      
      // Close the confirmation dialog
      setDeleteConfirm({ show: false, codeId: null, codeValue: '' });
    } catch (err: any) {
      console.error('Error deleting code:', err);
      setError('Failed to delete code: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setDeletingCodeId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, codeId: null, codeValue: '' });
  };

  const filteredCodes = codes.filter(code => {
    // Search filter
    if (filters.search && !code.code.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category) {
      const displayCategory = backendToDisplay(code.category);
      if (displayCategory !== filters.category) {
        return false;
      }
    }
    
    // Status filter
    if (filters.isUsed) {
      const isUsed = filters.isUsed === 'true';
      if (code.used !== isUsed) {
        return false;
      }
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Proxy Unlocking Codes</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">View and manage all uploaded proxy unlocking codes</p>
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <button
                  onClick={fetchCodes}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
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
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Total Codes</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Available</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.available}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Used</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.used}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">50 Category</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.fifty}</p>
                </div>
              </div>
            </div>
            <div className="card p-4 md:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">100 Category</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.hundred}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Code
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((cat) => ({
                        value: backendToDisplay(cat as 'FIFTY' | 'HUNDRED'),
                        label: backendToDisplay(cat as 'FIFTY' | 'HUNDRED')
                      }))
                    ]}
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                    placeholder="All Categories"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'false', label: 'Available' },
                      { value: 'true', label: 'Used' }
                    ]}
                    value={filters.isUsed}
                    onChange={(value) => handleFilterChange('isUsed', value)}
                    placeholder="All Status"
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
          </div>

          {/* Codes Table */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Proxy Unlocking Codes</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Loading codes...
                  </p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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
                    <Globe className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Codes Available</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uploaded At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {showCodes ? code.code : '••••••••••••••••'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.category === 'FIFTY'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            {backendToDisplay(code.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {code.uploadedAt ? new Date(code.uploadedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.used
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          }`}>
                            {code.used ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <button
                            onClick={() => handleDeleteClick(code.id, code.code)}
                            disabled={deletingCodeId === code.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete code"
                          >
                            {deletingCodeId === code.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proxy Codes Management</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Use the "Show Codes" button to reveal or hide the actual proxy unlocking codes</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Filter codes by category, status, or search for specific proxy codes</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Export proxy codes to CSV for backup or analysis</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Proxy codes are automatically marked as "Used" when customers purchase them</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Use the delete button to remove incorrect or invalid proxy codes from the system</p>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Delete Proxy Code
                    </h3>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Are you sure you want to delete this proxy code? This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {deleteConfirm.codeValue}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deletingCodeId !== null}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deletingCodeId !== null}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors disabled:cursor-not-allowed"
                  >
                    {deletingCodeId !== null ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 