import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, FileText, Copy, Edit, Trash2, Plus, Download, Upload, Star } from 'lucide-react';

export default function ConfigurationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/config/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTemplates(result.data);
      } else {
        setTemplates(getMockTemplates());
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  };

  const getMockTemplates = () => [
    {
      id: 1,
      name: 'Production Environment',
      description: 'Standard production environment configuration template',
      category: 'Environment',
      configCount: 24,
      usageCount: 12,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-05T10:30:00Z',
      author: 'admin@company.com',
      isDefault: true,
      tags: ['production', 'secure', 'optimized']
    },
    {
      id: 2,
      name: 'Development Setup',
      description: 'Development environment with debugging enabled',
      category: 'Environment',
      configCount: 18,
      usageCount: 8,
      createdAt: '2024-01-02T14:00:00Z',
      updatedAt: '2024-01-04T16:20:00Z',
      author: 'dev@company.com',
      isDefault: false,
      tags: ['development', 'debug', 'testing']
    },
    {
      id: 3,
      name: 'High Security Config',
      description: 'Enhanced security configuration for sensitive environments',
      category: 'Security',
      configCount: 15,
      usageCount: 5,
      createdAt: '2024-01-03T09:00:00Z',
      updatedAt: '2024-01-03T09:00:00Z',
      author: 'security@company.com',
      isDefault: false,
      tags: ['security', 'compliance', 'audit']
    },
    {
      id: 4,
      name: 'Performance Optimized',
      description: 'Configuration optimized for high performance workloads',
      category: 'Performance',
      configCount: 20,
      usageCount: 15,
      createdAt: '2024-01-04T11:00:00Z',
      updatedAt: '2024-01-05T08:15:00Z',
      author: 'admin@company.com',
      isDefault: false,
      tags: ['performance', 'optimization', 'caching']
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Environment': 'bg-blue-100 text-blue-600',
      'Security': 'bg-red-100 text-red-600',
      'Performance': 'bg-green-100 text-green-600',
      'Database': 'bg-purple-100 text-purple-600',
      'API': 'bg-orange-100 text-orange-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configuration Templates - Admin - Digame</title>
        <meta name="description" content="Create and manage configuration templates" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/admin/config" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to System Configuration</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration Templates</h1>
                <p className="text-gray-600">Create and manage configuration templates</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>
          </div>

          {/* Template Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Default Templates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter(t => t.isDefault).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Copy className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Configurations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.reduce((sum, t) => sum + t.configCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Configurations:</span>
                    <span className="text-sm font-medium text-gray-900">{template.configCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usage Count:</span>
                    <span className="text-sm font-medium text-gray-900">{template.usageCount}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <div>Created: {formatTimeAgo(template.createdAt)}</div>
                  <div>Updated: {formatTimeAgo(template.updatedAt)}</div>
                  <div>By: {template.author}</div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}