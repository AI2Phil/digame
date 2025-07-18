import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Settings, Server, Network, Zap, Activity, Shield } from 'lucide-react';

export default function GlobalSystemOrchestration() {
  const [orchestrationData, setOrchestrationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading system orchestration data
    setTimeout(() => {
      setOrchestrationData({
        activeServices: 24,
        healthyNodes: 18,
        loadBalancerStatus: 'Optimal',
        autoScalingEvents: 12,
        networkLatency: 45,
        systemUptime: 99.97
      });
      setLoading(false);
    }, 1000);
  }, []);

  const services = [
    {
      id: 1,
      name: "API Gateway",
      status: "Healthy",
      instances: 3,
      cpu: 45,
      memory: 62,
      requests: 1250
    },
    {
      id: 2,
      name: "Database Cluster",
      status: "Healthy",
      instances: 5,
      cpu: 38,
      memory: 71,
      requests: 890
    },
    {
      id: 3,
      name: "Cache Layer",
      status: "Warning",
      instances: 2,
      cpu: 78,
      memory: 85,
      requests: 2100
    },
    {
      id: 4,
      name: "AI Processing",
      status: "Healthy",
      instances: 4,
      cpu: 52,
      memory: 68,
      requests: 340
    }
  ];

  const autoScalingEvents = [
    {
      id: 1,
      service: "API Gateway",
      action: "Scale Up",
      trigger: "CPU > 80%",
      time: "2 hours ago",
      status: "Completed"
    },
    {
      id: 2,
      service: "Cache Layer",
      action: "Scale Out",
      trigger: "Memory > 85%",
      time: "45 minutes ago",
      status: "In Progress"
    },
    {
      id: 3,
      service: "Database Cluster",
      action: "Scale Down",
      trigger: "Low utilization",
      time: "1 hour ago",
      status: "Completed"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Platform Owner</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400">/</span>
                    <span className="ml-4 text-sm font-medium text-gray-900">System Orchestration</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Global System Orchestration</h1>
                <p className="text-gray-600 mt-1">Cross-system coordination, service mesh management, load balancing, and auto-scaling controls</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* System Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Services Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Server className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Services</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.activeServices}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>All services operational</span>
                    </div>
                  </div>
                </div>

                {/* Healthy Nodes Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Healthy Nodes</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.healthyNodes}/20</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>90% health score</span>
                    </div>
                  </div>
                </div>

                {/* Load Balancer Status Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Network className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Load Balancer</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.loadBalancerStatus}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <Network className="w-4 h-4 mr-1" />
                      <span>Traffic distributed evenly</span>
                    </div>
                  </div>
                </div>

                {/* Auto-scaling Events Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Zap className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Auto-scaling Events</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.autoScalingEvents}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Zap className="w-4 h-4 mr-1" />
                      <span>Last 24 hours</span>
                    </div>
                  </div>
                </div>

                {/* Network Latency Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Network Latency</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.networkLatency}ms</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>Within optimal range</span>
                    </div>
                  </div>
                </div>

                {/* System Uptime Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">{orchestrationData.systemUptime}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Exceeding SLA targets</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Mesh Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Service Mesh Status</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Server className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.instances} instances running</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          service.status === 'Healthy' 
                            ? 'bg-green-100 text-green-800' 
                            : service.status === 'Warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">CPU Usage</p>
                          <div className="flex items-center mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  service.cpu > 70 ? 'bg-red-500' : service.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${service.cpu}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{service.cpu}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Memory Usage</p>
                          <div className="flex items-center mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  service.memory > 80 ? 'bg-red-500' : service.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${service.memory}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{service.memory}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Requests/min</p>
                          <p className="text-lg font-bold text-gray-900">{service.requests.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Scale
                          </button>
                          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                            Logs
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-scaling Events */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Auto-scaling Events</h2>
                <div className="space-y-4">
                  {autoScalingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Zap className="w-6 h-6 text-orange-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{event.service}</h3>
                          <p className="text-sm text-gray-600">{event.action} - {event.trigger}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{event.time}</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Zap className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Auto-scale All</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <Shield className="w-6 h-6 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Health Check</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                    <Network className="w-6 h-6 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Load Balance</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                    <Settings className="w-6 h-6 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-900">Configure</span>
                  </button>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Orchestration Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered auto-scaling, predictive load balancing, intelligent service mesh optimization, and automated failover management coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}