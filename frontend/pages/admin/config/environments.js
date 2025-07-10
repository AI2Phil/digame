import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Server, Globe, Settings, Copy, Edit, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function EnvironmentManagement() {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEnv, setActiveEnv] = useState('production');

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      const response = await fetch('/api/admin/config/environments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEnvironments(result.data);
      } else {
        setEnvironments(getMockEnvironments());
      }
    } catch (error) {
      console.error('Error fetching environments:', error);
      setEnvironments(getMockEnvironments());
    } finally {
      setLoading(false);
    }
  };

  const getMockEnvironments = () => [
    {
      id: 1,
      name: 'Production',
      slug: 'production',
      description: 'Live production environment',
      url: 'https://app.digame.com',
      status: 'active',
      configCount: 24,
      lastDeployment: '2024-01-05T10:30:00Z',
      version: 'v2.1.0',
      health: 'healthy'
    },
    {
      id: 2,
      name: 'Staging',
      slug: 'staging',
      description: 'Pre-production testing environment',
      url: 'https://staging.digame.com',
      status: 'active',
      configCount: 23,
      lastDeployment: '2024-01-05T08:15:00Z',
      version: 'v2.1.1-rc.1',
      health: 'healthy'
    },
    {
      id: 3,
      name: 'Development',
      slug: 'development',
      description: 'Development and testing environment',
      url: 'https://dev.digame.com',
      status: 'active',
      configCount: 22,
      lastDeployment: '2024-01-05T14:45:00Z',
      version: 'v2.2.0-dev',
      health: 'warning'
    },
    {
      id: 4,
      name: 'Testing',
      slug: 'testing',
      description: 'Automated testing environment',
      url: 'https://test.digame.com',
      status: 'inactive',
      configCount: 20,
      lastDeployment: '2024-01-04T16:20:00Z',
      version: 'v2.0.8',
      health: 'offline'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
        <title>Environment Management - Admin - Digame</title>
        <meta name="description" content="Manage different environment configurations" />
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
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Environment Management</h1>
                <p className="text-gray-600">Manage different environment configurations</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Environment</span>
            </button>
          </div>

          {/* Environment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Environments</p>
                  <p className="text-2xl font-bold text-gray-900">{environments.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Environments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {environments.filter(env => env.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Healthy Environments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {environments.filter(env => env.health === 'healthy').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Configurations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {environments.reduce((sum, env) => sum + env.configCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Environments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {environments.map((env) => (
              <div key={env.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                      <p className="text-sm text-gray-600">{env.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL:</span>
                    <a href={env.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700">
                      {env.url}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version:</span>
                    <span className="text-sm font-medium text-gray-900">{env.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Configurations:</span>
                    <span className="text-sm font-medium text-gray-900">{env.configCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Deployment:</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(env.lastDeployment)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(env.status)}`}>
                      {env.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getHealthColor(env.health)}`}>
                      {getHealthIcon(env.health)}
                      <span>{env.health}</span>
                    </span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Configure →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}