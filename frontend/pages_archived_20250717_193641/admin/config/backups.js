import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Database, Download, Upload, Calendar, Clock, CheckCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react';

export default function ConfigurationBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/config/backups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackups(result.data);
      } else {
        setBackups(getMockBackups());
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      setBackups(getMockBackups());
    } finally {
      setLoading(false);
    }
  };

  const getMockBackups = () => [
    {
      id: 1,
      name: 'Auto Backup - Daily',
      description: 'Automated daily configuration backup',
      createdAt: '2024-01-05T02:00:00Z',
      size: '2.4 MB',
      type: 'automatic',
      status: 'completed',
      configCount: 24,
      creator: 'system'
    },
    {
      id: 2,
      name: 'Pre-deployment Backup',
      description: 'Manual backup before production deployment',
      createdAt: '2024-01-04T14:30:00Z',
      size: '2.3 MB',
      type: 'manual',
      status: 'completed',
      configCount: 23,
      creator: 'admin@company.com'
    },
    {
      id: 3,
      name: 'Security Update Backup',
      description: 'Backup before security configuration changes',
      createdAt: '2024-01-03T10:15:00Z',
      size: '2.2 MB',
      type: 'manual',
      status: 'completed',
      configCount: 22,
      creator: 'admin@company.com'
    },
    {
      id: 4,
      name: 'Weekly Backup',
      description: 'Automated weekly configuration backup',
      createdAt: '2024-01-01T00:00:00Z',
      size: '2.1 MB',
      type: 'automatic',
      status: 'completed',
      configCount: 21,
      creator: 'system'
    }
  ];

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup = {
        id: Date.now(),
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        description: 'Manual configuration backup',
        createdAt: new Date().toISOString(),
        size: '2.5 MB',
        type: 'manual',
        status: 'completed',
        configCount: 24,
        creator: 'admin@company.com'
      };
      
      setBackups([newBackup, ...backups]);
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'automatic': return 'text-blue-600 bg-blue-100';
      case 'manual': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
        <title>Configuration Backups - Admin - Digame</title>
        <meta name="description" content="Manage configuration backups and restore points" />
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration Backups</h1>
                <p className="text-gray-600">Backup and restore system configuration settings</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={fetchBackups}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={createBackup}
                disabled={isCreatingBackup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreatingBackup ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
              </button>
            </div>
          </div>

          {/* Backup Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Backups</p>
                  <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Latest Backup</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {backups.length > 0 ? formatTimeAgo(backups[0].createdAt) : 'None'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {backups.reduce((total, backup) => {
                      const size = parseFloat(backup.size.replace(' MB', ''));
                      return total + size;
                    }, 0).toFixed(1)} MB
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {backups.map((backup) => (
                <div key={backup.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{backup.name}</h4>
                        <p className="text-sm text-gray-600">{backup.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDateTime(backup.createdAt)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Size: {backup.size}
                          </span>
                          <span className="text-xs text-gray-500">
                            Configs: {backup.configCount}
                          </span>
                          <span className="text-xs text-gray-500">
                            By: {backup.creator}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(backup.type)}`}>
                        {backup.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}