'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomDropdown from '@/components/CustomDropdown';
import { apiClient } from '@/lib/api';
import { UploadResult } from '@/types';
import { CategoryDisplay, displayToBackend, backendToDisplay } from '@/lib/categoryUtils';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<CategoryDisplay>('50');
  const [categories, setCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      console.log('Categories fetched for upload page:', data);
      setCategories(data);
      // Set default category to first available category
      if (data.length > 0) {
        setCategory(backendToDisplay(data[0] as 'FIFTY' | 'HUNDRED'));
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories
      setCategories(['FIFTY', 'HUNDRED']);
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.csv', '.xlsx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid file type (.csv, .xlsx, or .txt)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const backendCategory = displayToBackend(category);
      const result = await apiClient.uploadCodes(selectedFile, backendCategory);
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearResult = () => {
    setUploadResult(null);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const allowedTypes = ['.csv', '.xlsx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid file type (.csv, .xlsx, or .txt)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Codes</h1>
            <p className="text-gray-600 dark:text-gray-300">Upload proxy codes from CSV, Excel, or text files</p>
          </div>

          {/* Upload Form */}
          <div className="card p-6">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    selectedFile
                      ? 'border-primary-300 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="mt-4">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Drag and drop a file here, or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Supports .csv, .xlsx, and .txt files (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <CustomDropdown
                  options={categories.map((cat) => ({
                    value: backendToDisplay(cat as 'FIFTY' | 'HUNDRED'),
                    label: backendToDisplay(cat as 'FIFTY' | 'HUNDRED')
                  }))}
                  value={category}
                  onChange={(value) => setCategory(value as CategoryDisplay)}
                  placeholder="Select category"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="ml-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                        Upload completed successfully!
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Uploaded:</span> {uploadResult.totalUploaded}
                          </div>
                          <div>
                            <span className="font-medium">Duplicates:</span> {uploadResult.duplicates.length}
                          </div>
                          <div>
                            <span className="font-medium">Blank lines:</span> {uploadResult.blankLines}
                          </div>
                          <div>
                            <span className="font-medium">Total processed:</span> {uploadResult.totalUploaded + uploadResult.duplicates.length + uploadResult.blankLines}
                          </div>
                        </div>
                        {uploadResult.duplicates.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-xs">Duplicate codes:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{uploadResult.duplicates.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={clearResult}
                        className="mt-3 text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                      >
                        Clear result
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload Codes'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Supported file formats: CSV, Excel (.xlsx), and Text (.txt)</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Maximum file size: 10MB</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Each line should contain one proxy code</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Blank lines and duplicates will be automatically filtered out</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Select the appropriate category (50 or 100) for your codes</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 