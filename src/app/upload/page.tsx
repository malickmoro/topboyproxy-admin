'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
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
      // Validate file type
      const allowedTypes = ['.csv', '.xlsx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid file type (.csv, .xlsx, or .txt)');
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
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
    setUploadResult(null);

    try {
      // Convert display category to backend category
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
            <h1 className="text-2xl font-bold text-gray-900">Upload Codes</h1>
            <p className="text-gray-600">Upload proxy codes from CSV, Excel, or text files</p>
          </div>

          {/* Upload Form */}
          <div className="card p-6">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    selectedFile
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400'
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
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-medium text-primary-600">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Drag and drop a file here, or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary-600 hover:text-primary-500 font-medium"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: CSV, Excel (.xlsx), Text (.txt) - Max 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryDisplay)}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={backendToDisplay(cat as 'FIFTY' | 'HUNDRED')}>
                      {backendToDisplay(cat as 'FIFTY' | 'HUNDRED')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="ml-2 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Upload completed successfully!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
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
                            <p className="text-xs text-gray-600">{uploadResult.duplicates.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={clearResult}
                        className="mt-3 text-sm text-green-600 hover:text-green-500"
                      >
                        Clear result
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="btn-primary w-full flex justify-center items-center py-3"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Codes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Supported file formats: CSV, Excel (.xlsx), and Text (.txt)</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Maximum file size: 10MB</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Each line should contain one proxy code</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Blank lines and duplicates will be automatically filtered out</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Select the appropriate category (50 or 100) for your codes</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 