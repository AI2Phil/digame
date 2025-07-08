import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Target,
  BarChart3,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Calendar,
  Database,
  Brain
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi, TwinPattern } from '../../services/digitalTwinApi';

interface TwinPatternsPanelProps {
  twinId: string;
}

export const TwinPatternsPanel: React.FC<TwinPatternsPanelProps> = ({ twinId }) => {
  const [patterns, setPatterns] = useState<TwinPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const toast = useToastHelpers();

  useEffect(() => {
    loadPatterns();
  }, [twinId, selectedType, limit]);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await digitalTwinApi.getTwinPatterns(
        selectedType === 'all' ? undefined : selectedType,
        limit
      );
      
      if (response.success && response.data) {
        setPatterns(response.data.patterns);
        setUsingFallbackData(false);
        toast.success("Patterns loaded successfully");
      } else {
        throw new Error(response.message || 'Failed to load patterns');
      }
    } catch (error: any) {
      console.error('Failed to load patterns:', error);
      setError(error.message || "Failed to load twin patterns");
      
      // Load enhanced fallback patterns
      loadFallbackPatterns();
      toast.warning("Using demo patterns - Digital Twin API currently unavailable");
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackPatterns = () => {
    // Enhanced fallback patterns with realistic data
    const fallbackPatterns: TwinPattern[] = [
      {
        id: `pattern_${Date.now()}_1`,
        pattern_type: 'productivity',
        pattern_data: {
          peak_hours: ['9:00-11:00', '14:00-16:00'],
          average_score: 0.85,
          trend: 'increasing',
          factors: ['focus_time', 'task_complexity', 'energy_level']
        },
        confidence_score: 87.5,
        frequency_score: 92.3,
        impact_score: 78.9,
        discovered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        validated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `pattern_${Date.now()}_2`,
        pattern_type: 'time_management',
        pattern_data: {
          optimal_block_size: 90,
          break_frequency: 'every_90_minutes',
          context_switch_cost: 0.23,
          efficiency_score: 0.76
        },
        confidence_score: 82.1,
        frequency_score: 88.7,
        impact_score: 85.4,
        discovered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        validated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `pattern_${Date.now()}_3`,
        pattern_type: 'focus',
        pattern_data: {
          deep_work_duration: 120,
          distraction_triggers: ['notifications', 'meetings', 'email'],
          focus_score: 0.81,
          improvement_potential: 0.15
        },
        confidence_score: 79.6,
        frequency_score: 85.2,
        impact_score: 91.3,
        discovered_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        validated_at: null
      },
      {
        id: `pattern_${Date.now()}_4`,
        pattern_type: 'energy',
        pattern_data: {
          energy_peaks: ['10:00', '15:00'],
          energy_dips: ['13:00', '17:00'],
          recovery_time: 15,
          sustainability_score: 0.73
        },
        confidence_score: 84.7,
        frequency_score: 90.1,
        impact_score: 77.8,
        discovered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        validated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `pattern_${Date.now()}_5`,
        pattern_type: 'activity',
        pattern_data: {
          most_productive_activities: ['coding', 'writing', 'analysis'],
          least_productive_activities: ['email', 'meetings', 'admin'],
          activity_transitions: 12,
          efficiency_rating: 0.68
        },
        confidence_score: 76.3,
        frequency_score: 83.9,
        impact_score: 82.5,
        discovered_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        validated_at: null
      }
    ];

    // Filter patterns based on selected type
    const filteredPatterns = selectedType === 'all'
      ? fallbackPatterns
      : fallbackPatterns.filter(p => p.pattern_type === selectedType);

    // Apply limit
    const limitedPatterns = filteredPatterns.slice(0, limit);
    
    setPatterns(limitedPatterns);
    setUsingFallbackData(true);
  };

  const refreshPatterns = async () => {
    try {
      setRefreshing(true);
      toast.info("Refreshing patterns...");
      await loadPatterns();
    } catch (error) {
      // Error already handled in loadPatterns
    } finally {
      setRefreshing(false);
    }
  };

  const getPatternTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'time_management': return <Clock className="h-4 w-4" />;
      case 'activity': return <BarChart3 className="h-4 w-4" />;
      case 'focus': return <Target className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'bg-gray-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreDisplay = (score: number | null) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const patternTypes = [
    { value: 'all', label: 'All Patterns' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'time_management', label: 'Time Management' },
    { value: 'activity', label: 'Activity' },
    { value: 'focus', label: 'Focus' },
    { value: 'energy', label: 'Energy' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin mr-2" />
            <span>Loading patterns...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-500" />
            Discovered Patterns
            {usingFallbackData && (
              <Badge variant="secondary" className="ml-2">
                Demo Data
              </Badge>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Behavioral patterns identified by your digital twin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshPatterns}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {patternTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 patterns</option>
                <option value={20}>20 patterns</option>
                <option value={50}>50 patterns</option>
                <option value={100}>100 patterns</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patterns List */}
      {patterns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No patterns discovered yet</p>
            <p className="text-sm text-gray-500 text-center">
              Your digital twin needs more data to identify behavioral patterns. 
              Keep using the platform and patterns will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getPatternTypeIcon(pattern.pattern_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg capitalize">
                          {pattern.pattern_type.replace('_', ' ')} Pattern
                        </h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          ID: {pattern.id.slice(0, 8)}...
                        </span>
                      </div>
                      
                      {/* Pattern Scores */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getConfidenceColor(pattern.confidence_score)}`}></div>
                            <span className="text-sm font-medium">Confidence</span>
                          </div>
                          <div className="text-lg font-bold">
                            {getScoreDisplay(pattern.confidence_score)}%
                          </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getConfidenceColor(pattern.frequency_score)}`}></div>
                            <span className="text-sm font-medium">Frequency</span>
                          </div>
                          <div className="text-lg font-bold">
                            {getScoreDisplay(pattern.frequency_score)}%
                          </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getConfidenceColor(pattern.impact_score)}`}></div>
                            <span className="text-sm font-medium">Impact</span>
                          </div>
                          <div className="text-lg font-bold">
                            {getScoreDisplay(pattern.impact_score)}%
                          </div>
                        </div>
                      </div>

                      {/* Pattern Data Preview */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Pattern Data:</h4>
                        <div className="text-sm text-gray-600">
                          {pattern.pattern_data ? (
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(pattern.pattern_data, null, 2).slice(0, 200)}
                              {JSON.stringify(pattern.pattern_data, null, 2).length > 200 && '...'}
                            </pre>
                          ) : (
                            <span className="italic">No pattern data available</span>
                          )}
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Discovered: {formatDate(pattern.discovered_at)}</span>
                        </div>
                        {pattern.validated_at && (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Validated: {formatDate(pattern.validated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Pattern Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {patterns.length}
                </div>
                <div className="text-sm text-gray-600">Total Patterns</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {patterns.filter(p => (p.confidence_score || 0) >= 80).length}
                </div>
                <div className="text-sm text-gray-600">High Confidence</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {patterns.filter(p => p.validated_at).length}
                </div>
                <div className="text-sm text-gray-600">Validated</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(patterns.map(p => p.pattern_type)).size}
                </div>
                <div className="text-sm text-gray-600">Pattern Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};