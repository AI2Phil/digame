import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Shield, AlertTriangle, Eye, Activity, Clock, 
  MapPin, Filter, RefreshCw, Download, Search,
  TrendingUp, TrendingDown, Minus, ChevronRight
} from 'lucide-react';

interface ThreatData {
  id: number;
  detection_type: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  target_resource: string;
  description: string;
  detected_at: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  location?: string;
  user_agent?: string;
  attack_vector?: string;
  confidence_score: number;
}

interface ThreatMetrics {
  total_threats_24h: number;
  critical_threats: number;
  blocked_attempts: number;
  threat_trend: number;
  top_attack_types: Array<{ type: string; count: number }>;
  geographic_distribution: Array<{ country: string; count: number }>;
  hourly_distribution: Array<{ hour: number; count: number }>;
}

export const ThreatMonitoringDashboard: React.FC = () => {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [metrics, setMetrics] = useState<ThreatMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchThreatData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchThreatData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchThreatData = async () => {
    try {
      setLoading(true);
      
      const [threatsResponse, metricsResponse] = await Promise.all([
        fetch('/api/security/threats?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/threat-metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!threatsResponse.ok || !metricsResponse.ok) {
        throw new Error('Failed to fetch threat data');
      }

      const [threatsData, metricsData] = await Promise.all([
        threatsResponse.json(),
        metricsResponse.json()
      ]);

      setThreats(threatsData);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threat data');
    } finally {
      setLoading(false);
    }
  };

  const handleThreatAction = async (threatId: number, action: string) => {
    try {
      const response = await fetch(`/api/security/threats/${threatId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error('Failed to update threat status');
      
      await fetchThreatData(); // Refresh data
    } catch (err) {
      console.error('Error updating threat:', err);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesLevel = filterLevel === 'all' || threat.threat_level === filterLevel;
    const matchesStatus = filterStatus === 'all' || threat.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.source_ip.includes(searchTerm) ||
      threat.detection_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesStatus && matchesSearch;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Threat Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Real-time security threat detection and response</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchThreatData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threats (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_threats_24h}</p>
                </div>
                <div className="flex items-center text-sm">
                  {metrics.threat_trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : metrics.threat_trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                  )}
                  <span className={metrics.threat_trend > 0 ? 'text-red-500' : 'text-green-500'}>
                    {Math.abs(metrics.threat_trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Threats</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.critical_threats}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Attempts</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.blocked_attempts}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Detection Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {((metrics.blocked_attempts / (metrics.total_threats_24h + metrics.blocked_attempts)) * 100).toFixed(1)}%
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search threats by IP, description, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Threats List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Threats ({filteredThreats.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredThreats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No threats found matching your criteria</p>
                </div>
              ) : (
                filteredThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={getThreatLevelColor(threat.threat_level)}
                            icon={null}
                            onRemove={() => {}}
                          >
                            {threat.threat_level.toUpperCase()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getStatusColor(threat.status)}
                            icon={null}
                            onRemove={() => {}}
                          >
                            {threat.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {threat.confidence_score}% confidence
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {threat.detection_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{threat.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {threat.source_ip}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(threat.detected_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Threat Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedThreat ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getThreatLevelColor(selectedThreat.threat_level)}
                    icon={null}
                    onRemove={() => {}}
                  >
                    {selectedThreat.threat_level.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedThreat.status)}
                    icon={null}
                    onRemove={() => {}}
                  >
                    {selectedThreat.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {selectedThreat.detection_type.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedThreat.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Source IP:</span>
                    <p className="text-gray-600 font-mono">{selectedThreat.source_ip}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Target:</span>
                    <p className="text-gray-600">{selectedThreat.target_resource}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Detected:</span>
                    <p className="text-gray-600">{new Date(selectedThreat.detected_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Confidence:</span>
                    <p className="text-gray-600">{selectedThreat.confidence_score}%</p>
                  </div>
                  {selectedThreat.location && (
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-600">{selectedThreat.location}</p>
                    </div>
                  )}
                  {selectedThreat.attack_vector && (
                    <div>
                      <span className="font-medium text-gray-700">Attack Vector:</span>
                      <p className="text-gray-600">{selectedThreat.attack_vector}</p>
                    </div>
                  )}
                </div>

                {selectedThreat.status === 'active' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleThreatAction(selectedThreat.id, 'investigate')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Investigate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleThreatAction(selectedThreat.id, 'block')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Block IP
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleThreatAction(selectedThreat.id, 'false_positive')}
                    >
                      Mark False Positive
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a threat to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attack Types and Geographic Distribution */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Attack Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.top_attack_types.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {type.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(type.count / Math.max(...metrics.top_attack_types.map(t => t.count))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{type.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.geographic_distribution.map((location) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{location.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(location.count / Math.max(...metrics.geographic_distribution.map(l => l.count))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThreatMonitoringDashboard;