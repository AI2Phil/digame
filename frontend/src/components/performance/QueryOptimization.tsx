import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

import {
  Database,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Activity,
  Settings,
  Settings2,
  Eye,
  Code
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';

interface QueryMetric {
  id: string;
  query: string;
  executionTime: number;
  frequency: number;
  lastExecuted: Date;
  status: 'optimal' | 'slow' | 'critical';
  database: string;
  table: string;
  indexUsage: boolean;
  rowsExamined: number;
  rowsReturned: number;
  cacheHitRate: number;
  optimizationSuggestions: string[];
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  status: 'connected' | 'disconnected' | 'error';
  activeConnections: number;
  maxConnections: number;
  avgResponseTime: number;
  queriesPerSecond: number;
  cacheHitRate: number;
}

interface OptimizationRecommendation {
  id: string;
  type: 'index' | 'query_rewrite' | 'caching' | 'partitioning';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  affectedQueries: string[];
  implementation: string;
}

interface QueryOptimizationProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const QueryOptimization: React.FC<QueryOptimizationProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes instead of 10 seconds
}) => {
  const [queries, setQueries] = useState<QueryMetric[]>([]);
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'executionTime' | 'frequency' | 'lastExecuted'>('executionTime');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { success, error: showError, warning, info } = useToastHelpers();

  // Fetch query performance data from database-driven API
  const fetchQueryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallbackData(false);

      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');

      if (!token) {
        console.log('No authentication token found, using fallback data');
        setUsingFallbackData(true);
        // Don't throw error, just use fallback data
      } else {
        // Fetch query optimization data from database-driven API
        const response = await fetch(`${replaceApiUrl("")}/api/performance/query-optimization?database=${selectedDatabase}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQueries(data.queries || []);
          setDatabases(data.databases || []);
          setRecommendations(data.recommendations || []);
          success('Query optimization data loaded successfully');
          return; // Exit early on success
        } else if (response.status === 429) {
          console.log('Rate limited, using fallback data');
          setUsingFallbackData(true);
        } else {
          console.log(`API error ${response.status}, using fallback data`);
          setUsingFallbackData(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch query optimization data:', err);
      setUsingFallbackData(true);
      warning(`Using sample data: ${err.message}`);
      
      // Enhanced fallback data with realistic database patterns
      const fallbackQueries: QueryMetric[] = [
        {
          id: 'query_001',
          query: 'SELECT dt.*, u.name FROM digital_twins dt JOIN users u ON dt.user_id = u.id WHERE dt.created_at > ? AND dt.status = ?',
          executionTime: 2847,
          frequency: 1456,
          lastExecuted: new Date(Date.now() - 180000),
          status: 'critical',
          database: 'digame_main',
          table: 'digital_twins',
          indexUsage: false,
          rowsExamined: 75000,
          rowsReturned: 1847,
          cacheHitRate: 0.18,
          optimizationSuggestions: [
            'Add composite index on (created_at, status, user_id)',
            'Consider query rewrite to use EXISTS instead of JOIN',
            'Implement Redis caching for frequent twin queries',
            'Add covering index for commonly selected columns'
          ]
        },
        {
          id: 'query_002',
          query: 'SELECT * FROM analytics_metrics WHERE metric_date BETWEEN ? AND ? AND metric_type IN (?, ?, ?) ORDER BY timestamp DESC',
          executionTime: 1234,
          frequency: 3421,
          lastExecuted: new Date(Date.now() - 90000),
          status: 'slow',
          database: 'digame_analytics',
          table: 'analytics_metrics',
          indexUsage: true,
          rowsExamined: 28000,
          rowsReturned: 892,
          cacheHitRate: 0.72,
          optimizationSuggestions: [
            'Consider partitioning by metric_date for better range queries',
            'Add covering index for metric_type and timestamp columns',
            'Implement query result caching with 5-minute TTL'
          ]
        },
        {
          id: 'query_003',
          query: 'SELECT COUNT(*) FROM user_activities WHERE activity_type = ? AND user_id = ? AND created_at > ?',
          executionTime: 67,
          frequency: 8934,
          lastExecuted: new Date(Date.now() - 15000),
          status: 'optimal',
          database: 'digame_main',
          table: 'user_activities',
          indexUsage: true,
          rowsExamined: 234,
          rowsReturned: 1,
          cacheHitRate: 0.94,
          optimizationSuggestions: []
        },
        {
          id: 'query_004',
          query: 'UPDATE user_sessions SET last_activity = NOW(), activity_count = activity_count + 1 WHERE session_token = ?',
          executionTime: 89,
          frequency: 12456,
          lastExecuted: new Date(Date.now() - 8000),
          status: 'optimal',
          database: 'digame_sessions',
          table: 'user_sessions',
          indexUsage: true,
          rowsExamined: 1,
          rowsReturned: 1,
          cacheHitRate: 0.98,
          optimizationSuggestions: []
        },
        {
          id: 'query_005',
          query: 'SELECT w.*, u.name, u.email FROM workflows w LEFT JOIN users u ON w.created_by = u.id WHERE w.status IN (?, ?, ?) AND w.tenant_id = ?',
          executionTime: 1789,
          frequency: 678,
          lastExecuted: new Date(Date.now() - 420000),
          status: 'slow',
          database: 'digame_main',
          table: 'workflows',
          indexUsage: false,
          rowsExamined: 34000,
          rowsReturned: 267,
          cacheHitRate: 0.41,
          optimizationSuggestions: [
            'Add composite index on (status, tenant_id)',
            'Consider denormalizing user name/email into workflows table',
            'Implement query result caching with tenant-specific keys',
            'Add partial index for active workflow statuses'
          ]
        },
        {
          id: 'query_006',
          query: 'SELECT bp.*, dt.name FROM behavioral_patterns bp JOIN digital_twins dt ON bp.twin_id = dt.id WHERE bp.confidence_score > ? ORDER BY bp.discovered_at DESC',
          executionTime: 2156,
          frequency: 234,
          lastExecuted: new Date(Date.now() - 720000),
          status: 'critical',
          database: 'digame_main',
          table: 'behavioral_patterns',
          indexUsage: false,
          rowsExamined: 45000,
          rowsReturned: 89,
          cacheHitRate: 0.12,
          optimizationSuggestions: [
            'Add index on confidence_score for filtering',
            'Create composite index on (confidence_score, discovered_at)',
            'Implement materialized view for high-confidence patterns',
            'Add Redis caching for pattern discovery queries'
          ]
        }
      ];

      const fallbackDatabases: DatabaseConnection[] = [
        {
          id: 'digame_main',
          name: 'Digame Main Database',
          type: 'postgresql',
          status: 'connected',
          activeConnections: 67,
          maxConnections: 150,
          avgResponseTime: 189,
          queriesPerSecond: 234,
          cacheHitRate: 0.82
        },
        {
          id: 'digame_analytics',
          name: 'Analytics Database',
          type: 'postgresql',
          status: 'connected',
          activeConnections: 34,
          maxConnections: 75,
          avgResponseTime: 456,
          queriesPerSecond: 123,
          cacheHitRate: 0.71
        },
        {
          id: 'digame_sessions',
          name: 'Session Store',
          type: 'redis',
          status: 'connected',
          activeConnections: 18,
          maxConnections: 40,
          avgResponseTime: 8,
          queriesPerSecond: 567,
          cacheHitRate: 0.97
        },
        {
          id: 'digame_cache',
          name: 'Application Cache',
          type: 'redis',
          status: 'connected',
          activeConnections: 12,
          maxConnections: 30,
          avgResponseTime: 5,
          queriesPerSecond: 789,
          cacheHitRate: 0.93
        }
      ];

      const fallbackRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec_001',
          type: 'index',
          priority: 'high',
          description: 'Add composite index on digital_twins table for frequent JOIN and filtering operations',
          estimatedImprovement: '70-85% faster execution for twin queries',
          effort: 'low',
          affectedQueries: ['query_001'],
          implementation: 'CREATE INDEX idx_digital_twins_composite ON digital_twins(created_at, status, user_id);'
        },
        {
          id: 'rec_002',
          type: 'caching',
          priority: 'high',
          description: 'Implement Redis caching layer for frequently accessed digital twin and user profile data',
          estimatedImprovement: '90% reduction in database load for read operations',
          effort: 'medium',
          affectedQueries: ['query_001', 'query_005'],
          implementation: 'Add Redis cache with 30-minute TTL for twin profiles and 1-hour TTL for user data'
        },
        {
          id: 'rec_003',
          type: 'partitioning',
          priority: 'medium',
          description: 'Partition analytics_metrics table by metric_date for improved time-range query performance',
          estimatedImprovement: '50-60% faster analytics queries with date filtering',
          effort: 'high',
          affectedQueries: ['query_002'],
          implementation: 'Implement monthly partitioning on metric_date column with automatic partition management'
        },
        {
          id: 'rec_004',
          type: 'query_rewrite',
          priority: 'medium',
          description: 'Optimize behavioral pattern queries using materialized views and selective indexing',
          estimatedImprovement: '60-75% performance improvement for pattern discovery',
          effort: 'medium',
          affectedQueries: ['query_006'],
          implementation: 'Create materialized view for high-confidence patterns with refresh strategy'
        },
        {
          id: 'rec_005',
          type: 'index',
          priority: 'medium',
          description: 'Add covering indexes for workflow queries to eliminate table lookups',
          estimatedImprovement: '40-55% faster workflow listing and filtering',
          effort: 'low',
          affectedQueries: ['query_005'],
          implementation: 'CREATE INDEX idx_workflows_covering ON workflows(status, tenant_id) INCLUDE (created_by, name, updated_at);'
        }
      ];

      setQueries(fallbackQueries);
      setDatabases(fallbackDatabases);
      setRecommendations(fallbackRecommendations);
      setError(`Failed to load query optimization data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedDatabase, success, warning]);

  useEffect(() => {
    fetchQueryData();

    if (autoRefresh) {
      const interval = setInterval(fetchQueryData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchQueryData, autoRefresh, refreshInterval]);

  // Filter and sort queries
  const filteredQueries = useMemo(() => {
    let filtered = queries;

    // Filter by database
    if (selectedDatabase !== 'all') {
      filtered = filtered.filter(q => q.database === selectedDatabase);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(q => q.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.table.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort queries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'executionTime':
          return b.executionTime - a.executionTime;
        case 'frequency':
          return b.frequency - a.frequency;
        case 'lastExecuted':
          return b.lastExecuted.getTime() - a.lastExecuted.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [queries, selectedDatabase, filterStatus, searchTerm, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-600 bg-green-100';
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'slow':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return <Database className="w-4 h-4" />;
      case 'mongodb':
        return <Database className="w-4 h-4" />;
      case 'redis':
        return <Zap className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatQuery = (query: string, maxLength: number = 80) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Query Optimization</h2>
              <p className="text-sm text-gray-600">Monitor and optimize database query performance</p>
              {usingFallbackData && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  Demo Data
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowOptimizations(!showOptimizations)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                showOptimizations 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings2 className="w-4 h-4 mr-1 inline" />
              Recommendations
            </button>
            <button
              onClick={fetchQueryData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Database Status */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Database Connections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {databases.map((db) => (
              <div key={db.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getDatabaseIcon(db.type)}
                    <span className="text-sm font-medium text-gray-900">{db.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    db.status === 'connected' ? 'text-green-600 bg-green-100' :
                    db.status === 'error' ? 'text-red-600 bg-red-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {db.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Connections: {db.activeConnections}/{db.maxConnections}</div>
                  <div>Avg Response: {db.avgResponseTime}ms</div>
                  <div>QPS: {db.queriesPerSecond}</div>
                  <div>Cache Hit: {(db.cacheHitRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Databases</option>
              {databases.map((db) => (
                <option key={db.id} value={db.id}>{db.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="optimal">Optimal</option>
              <option value="slow">Slow</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="executionTime">Execution Time</option>
              <option value="frequency">Frequency</option>
              <option value="lastExecuted">Last Executed</option>
            </select>
          </div>
        </div>

        {/* Query List */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Query Performance</h3>
          <div className="space-y-3">
            {filteredQueries.map((query) => (
              <div key={query.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(query.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(query.status)}`}>
                        {query.status}
                      </span>
                      <span className="text-xs text-gray-500">{query.database} • {query.table}</span>
                    </div>
                    <div className="font-mono text-sm text-gray-800 bg-gray-50 p-2 rounded">
                      {formatQuery(query.query)}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatExecutionTime(query.executionTime)}
                    </div>
                    <div className="text-xs text-gray-500">execution time</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Frequency</div>
                    <div className="font-medium">{query.frequency.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Rows Examined</div>
                    <div className="font-medium">{query.rowsExamined.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Rows Returned</div>
                    <div className="font-medium">{query.rowsReturned.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Index Usage</div>
                    <div className={`font-medium ${query.indexUsage ? 'text-green-600' : 'text-red-600'}`}>
                      {query.indexUsage ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Cache Hit Rate</div>
                    <div className="font-medium">{(query.cacheHitRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Last Executed</div>
                    <div className="font-medium">{query.lastExecuted.toLocaleTimeString()}</div>
                  </div>
                </div>

                {query.optimizationSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-2">Optimization Suggestions:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {query.optimizationSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Recommendations */}
        {showOptimizations && (
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Optimization Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {rec.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Effort: {rec.effort}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{rec.description}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Expected improvement: {rec.estimatedImprovement}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">Implementation:</div>
                    <div className="font-mono text-sm text-gray-800">{rec.implementation}</div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Affects {rec.affectedQueries.length} quer{rec.affectedQueries.length === 1 ? 'y' : 'ies'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Queries</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{queries.length}</div>
            <div className="text-xs text-blue-700">monitored queries</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Critical Queries</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {queries.filter(q => q.status === 'critical').length}
            </div>
            <div className="text-xs text-red-700">need immediate attention</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Avg Execution Time</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {formatExecutionTime(queries.reduce((sum, q) => sum + q.executionTime, 0) / queries.length)}
            </div>
            <div className="text-xs text-yellow-700">across all queries</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Optimization Potential</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {recommendations.filter(r => r.priority === 'high').length}
            </div>
            <div className="text-xs text-green-700">high-impact optimizations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryOptimization;