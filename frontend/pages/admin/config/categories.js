import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Edit, Trash2, Folder, Tag, Users, Database, Shield, Server } from 'lucide-react';

export default function ConfigurationCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/config/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data);
      } else {
        setCategories(getMockCategories());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(getMockCategories());
    } finally {
      setLoading(false);
    }
  };

  const getMockCategories = () => [
    {
      id: 1,
      name: 'Authentication',
      description: 'User authentication and authorization settings',
      icon: 'shield',
      color: 'blue',
      configCount: 12,
      lastModified: '2024-01-05T10:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      name: 'Database',
      description: 'Database connection and performance settings',
      icon: 'database',
      color: 'green',
      configCount: 8,
      lastModified: '2024-01-05T09:15:00Z',
      status: 'active'
    },
    {
      id: 3,
      name: 'API Settings',
      description: 'API rate limiting and endpoint configurations',
      icon: 'server',
      color: 'purple',
      configCount: 15,
      lastModified: '2024-01-05T08:45:00Z',
      status: 'active'
    },
    {
      id: 4,
      name: 'User Management',
      description: 'User roles, permissions, and profile settings',
      icon: 'users',
      color: 'orange',
      configCount: 6,
      lastModified: '2024-01-04T16:20:00Z',
      status: 'active'
    },
    {
      id: 5,
      name: 'System Performance',
      description: 'Caching, optimization, and performance tuning',
      icon: 'settings',
      color: 'red',
      configCount: 10,
      lastModified: '2024-01-04T14:10:00Z',
      status: 'draft'
    }
  ];

  const getIconComponent = (iconName) => {
    const icons = {
      shield: Shield,
      database: Database,
      server: Server,
      users: Users,
      settings: Settings,
      folder: Folder,
      tag: Tag
    };
    const IconComponent = icons[iconName] || Settings;
    return <IconComponent className="w-6 h-6" />;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
        <title>Configuration Categories - Admin - Digame</title>
        <meta name="description" content="Manage configuration categories and organization" />
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration Categories</h1>
                <p className="text-gray-600">Organize and manage configuration settings by category</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(category.color)}`}>
                    {getIconComponent(category.icon)}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{category.configCount}</span> configurations
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(category.status)}`}>
                    {category.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Last modified: {formatTimeAgo(category.lastModified)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Folder className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Configurations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories.reduce((sum, cat) => sum + cat.configCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories.filter(cat => cat.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}