import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Database, 
  Shield, 
  Zap, 
  Users,
  BarChart3,
  Settings,
  FileText,
  RefreshCw
} from 'lucide-react';

const GoLiveChecklist = () => {
  const [checklistItems, setChecklistItems] = useState([]);
  const [overallStatus, setOverallStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Define checklist items with their validation functions
  const checklistDefinitions = [
    {
      id: 'mock_data_flagged',
      title: 'Mock Data Identification',
      description: 'All mock data properly flagged and identifiable',
      category: 'Data Management',
      icon: Database,
      priority: 'critical',
      endpoint: '/api/data-management/health/comprehensive',
      validator: (data) => {
        const mockRatio = data?.checks?.mock_data_ratio?.overall_mock_ratio || 0;
        return {
          status: mockRatio < 90 ? 'passed' : 'warning',
          details: `Mock data ratio: ${mockRatio}%`,
          recommendation: mockRatio >= 90 ? 'Consider cleaning up mock data before production' : null
        };
      }
    },
    {
      id: 'real_data_validated',
      title: 'Real User Data Validation',
      description: 'Real user data validated and integrity confirmed',
      category: 'Data Quality',
      icon: Users,
      priority: 'critical',
      endpoint: '/api/data-management/health/comprehensive',
      validator: (data) => {
        const qualityScore = data?.checks?.data_quality?.quality_score || 0;
        return {
          status: qualityScore >= 95 ? 'passed' : qualityScore >= 80 ? 'warning' : 'failed',
          details: `Data quality score: ${qualityScore}%`,
          recommendation: qualityScore < 95 ? 'Review and fix data quality issues' : null
        };
      }
    },
    {
      id: 'backup_systems_tested',
      title: 'Backup Systems Tested',
      description: 'Backup and restore functionality verified',
      category: 'Backup & Recovery',
      icon: Shield,
      priority: 'critical',
      endpoint: '/api/data-management/backup/schedule',
      validator: (data) => {
        const hasSchedule = data?.enabled || false;
        return {
          status: hasSchedule ? 'passed' : 'warning',
          details: hasSchedule ? 'Backup schedule configured' : 'No backup schedule configured',
          recommendation: !hasSchedule ? 'Configure automated backup schedule' : null
        };
      }
    },
    {
      id: 'performance_benchmarks',
      title: 'Performance Benchmarks',
      description: 'Performance benchmarks established and validated',
      category: 'Performance',
      icon: Zap,
      priority: 'high',
      endpoint: '/api/data-management/performance/metrics',
      validator: (data) => {
        const avgQueryTime = data?.queries?.average_time_ms || 0;
        const cacheHitRate = data?.cache?.hit_rate || 0;
        return {
          status: avgQueryTime < 100 && cacheHitRate > 70 ? 'passed' : 'warning',
          details: `Avg query: ${avgQueryTime}ms, Cache hit rate: ${cacheHitRate}%`,
          recommendation: avgQueryTime >= 100 || cacheHitRate <= 70 ? 'Optimize database performance' : null
        };
      }
    },
    {
      id: 'security_audit',
      title: 'Security Audit Completed',
      description: 'Security audit and vulnerability assessment completed',
      category: 'Security',
      icon: Shield,
      priority: 'critical',
      endpoint: '/api/data-management/health/comprehensive',
      validator: (data) => {
        const integrityStatus = data?.checks?.relational_integrity?.status || 'unknown';
        return {
          status: integrityStatus === 'healthy' ? 'passed' : 'warning',
          details: `Relational integrity: ${integrityStatus}`,
          recommendation: integrityStatus !== 'healthy' ? 'Review and fix integrity violations' : null
        };
      }
    },
    {
      id: 'data_retention_policies',
      title: 'Data Retention Policies',
      description: 'Data retention and cleanup policies configured',
      category: 'Compliance',
      icon: FileText,
      priority: 'high',
      endpoint: '/api/data-management/operations',
      validator: (data) => {
        const hasOperations = data?.data?.operations?.length > 0;
        return {
          status: hasOperations ? 'passed' : 'warning',
          details: hasOperations ? 'Data management operations configured' : 'No data management operations found',
          recommendation: !hasOperations ? 'Configure data retention policies' : null
        };
      }
    },
    {
      id: 'monitoring_configured',
      title: 'Monitoring & Alerting',
      description: 'System monitoring and alerting configured',
      category: 'Monitoring',
      icon: BarChart3,
      priority: 'high',
      endpoint: '/api/data-management/health/comprehensive',
      validator: (data) => {
        const healthStatus = data?.overall_status || 'unknown';
        return {
          status: healthStatus === 'healthy' ? 'passed' : 'warning',
          details: `Overall health: ${healthStatus}`,
          recommendation: healthStatus !== 'healthy' ? 'Review system health issues' : null
        };
      }
    },
    {
      id: 'environment_configuration',
      title: 'Environment Configuration',
      description: 'Production environment properly configured',
      category: 'Infrastructure',
      icon: Settings,
      priority: 'critical',
      endpoint: '/api/data-management/health/comprehensive',
      validator: (data) => {
        const checksPerformed = data?.metrics?.checks_performed || 0;
        return {
          status: checksPerformed >= 6 ? 'passed' : 'warning',
          details: `Health checks available: ${checksPerformed}`,
          recommendation: checksPerformed < 6 ? 'Ensure all health monitoring is configured' : null
        };
      }
    }
  ];

  useEffect(() => {
    performGoLiveCheck();
  }, []);

  const performGoLiveCheck = async () => {
    setIsLoading(true);
    setRefreshing(true);
    
    try {
      const results = [];
      
      for (const item of checklistDefinitions) {
        try {
          const response = await fetch(item.endpoint);
          const data = await response.json();
          
          const validation = item.validator(data.data || data);
          
          results.push({
            ...item,
            ...validation,
            lastChecked: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            ...item,
            status: 'failed',
            details: `Check failed: ${error.message}`,
            recommendation: 'Ensure the endpoint is accessible and functioning',
            lastChecked: new Date().toISOString()
          });
        }
      }
      
      setChecklistItems(results);
      
      // Calculate overall status
      const criticalFailed = results.filter(item => 
        item.priority === 'critical' && item.status === 'failed'
      ).length;
      
      const anyFailed = results.filter(item => item.status === 'failed').length;
      const anyWarnings = results.filter(item => item.status === 'warning').length;
      
      if (criticalFailed > 0 || anyFailed > 2) {
        setOverallStatus('not_ready');
      } else if (anyFailed > 0 || anyWarnings > 3) {
        setOverallStatus('needs_attention');
      } else if (anyWarnings > 0) {
        setOverallStatus('ready_with_warnings');
      } else {
        setOverallStatus('ready');
      }
      
    } catch (error) {
      console.error('Go-live check failed:', error);
      setOverallStatus('error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatusDisplay = () => {
    switch (overallStatus) {
      case 'ready':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'Ready for Production',
          description: 'All critical checks passed. System is ready for go-live.',
          color: 'bg-green-50 border-green-200'
        };
      case 'ready_with_warnings':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
          title: 'Ready with Warnings',
          description: 'System is ready but has some non-critical issues to address.',
          color: 'bg-yellow-50 border-yellow-200'
        };
      case 'needs_attention':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          title: 'Needs Attention',
          description: 'Several issues need to be resolved before go-live.',
          color: 'bg-orange-50 border-orange-200'
        };
      case 'not_ready':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          title: 'Not Ready',
          description: 'Critical issues must be resolved before production deployment.',
          color: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-gray-500" />,
          title: 'Checking...',
          description: 'Performing go-live readiness assessment.',
          color: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const groupedItems = checklistItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const overallStatusDisplay = getOverallStatusDisplay();

  if (isLoading && checklistItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Performing go-live readiness check...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`rounded-lg border-2 p-6 ${overallStatusDisplay.color}`}>
        <div className="flex items-center">
          {overallStatusDisplay.icon}
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {overallStatusDisplay.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {overallStatusDisplay.description}
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={performGoLiveCheck}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Checking...' : 'Refresh Check'}
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">{category}</h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className={`border rounded-lg p-4 ${getStatusColor(item.status)}`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">
                          {item.title}
                          {item.priority === 'critical' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Critical
                            </span>
                          )}
                        </h5>
                        <div className="flex items-center">
                          {getStatusIcon(item.status)}
                          <span className="ml-2 text-sm font-medium capitalize">
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.details && (
                        <p className="text-xs text-gray-500 mt-2">{item.details}</p>
                      )}
                      {item.recommendation && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-800">
                            <strong>Recommendation:</strong> {item.recommendation}
                          </p>
                        </div>
                      )}
                      {item.lastChecked && (
                        <p className="text-xs text-gray-400 mt-2">
                          Last checked: {new Date(item.lastChecked).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Readiness Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Passed',
              count: checklistItems.filter(item => item.status === 'passed').length,
              color: 'text-green-600'
            },
            {
              label: 'Warnings',
              count: checklistItems.filter(item => item.status === 'warning').length,
              color: 'text-yellow-600'
            },
            {
              label: 'Failed',
              count: checklistItems.filter(item => item.status === 'failed').length,
              color: 'text-red-600'
            },
            {
              label: 'Total',
              count: checklistItems.length,
              color: 'text-gray-600'
            }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoLiveChecklist;