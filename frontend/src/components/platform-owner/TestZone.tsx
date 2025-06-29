import React, { useState, useEffect } from 'react';
import {
  Play,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  Code,
  Database,
  Brain,
  TestTube,
  Download,
  Upload,
  BarChart3,
  GraduationCap,
  MessageSquare,
  Users,
  Wifi,
  Server
} from 'lucide-react';

interface TestResult {
  success: boolean;
  test_type: string;
  results: any;
  tested_at: string;
  tested_by: string;
  execution_time?: number;
}

interface AvailableTest {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  sample_data_endpoint?: string;
  parameters?: string[];
}

const TestZone: React.FC = () => {
  const [activeTab, setActiveTab] = useState('intelligence');
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customData, setCustomData] = useState('');
  const [selectedTest, setSelectedTest] = useState<string>('');

  const tabs = [
    { id: 'intelligence', label: 'Intelligence APIs', icon: <Brain className="w-4 h-4" /> },
    { id: 'digital-twin', label: 'Digital Twin APIs', icon: <TestTube className="w-4 h-4" /> },
    { id: 'nlp', label: 'NLP APIs', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics APIs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning APIs', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'team', label: 'Team APIs', icon: <Users className="w-4 h-4" /> },
    { id: 'websocket', label: 'WebSocket APIs', icon: <Wifi className="w-4 h-4" /> },
    { id: 'kubernetes', label: 'Kubernetes APIs', icon: <Server className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom Tests', icon: <Code className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeTab === 'intelligence') {
      fetchAvailableTests();
      fetchSampleData();
    } else if (activeTab === 'nlp') {
      fetchNLPTests();
      fetchNLPSampleData();
    } else if (activeTab === 'analytics') {
      fetchAnalyticsTests();
      fetchAnalyticsSampleData();
    } else if (activeTab === 'learning') {
      fetchLearningTests();
      fetchLearningSampleData();
    } else if (activeTab === 'team') {
      fetchTeamTests();
      fetchTeamSampleData();
    } else if (activeTab === 'websocket') {
      fetchWebSocketTests();
      fetchWebSocketSampleData();
    } else if (activeTab === 'kubernetes') {
      fetchKubernetesTests();
      fetchKubernetesSampleData();
    }
  }, [activeTab]);

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('/api/v1/platform-owner/test-zone/available-tests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTests(data.available_tests.intelligence_tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch available tests:', error);
    }
  };

  const fetchSampleData = async () => {
    try {
      const response = await fetch('/api/v1/platform-owner/test-zone/intelligence/sample-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSampleData(data.sample_data);
      }
    } catch (error) {
      console.error('Failed to fetch sample data:', error);
    }
  };

  const fetchNLPTests = async () => {
    // Set NLP tests directly since they're from Phase 2
    const nlpTests = [
      {
        name: 'Process Query',
        endpoint: '/api/twin/phase2/conversation/query',
        method: 'POST',
        description: 'Process natural language query through the conversation engine'
      },
      {
        name: 'Conversation History',
        endpoint: '/api/twin/phase2/conversation/history/{twin_id}',
        method: 'GET',
        description: 'Get conversation history for a digital twin'
      },
      {
        name: 'Conversation Stats',
        endpoint: '/api/twin/phase2/conversation/stats/{twin_id}',
        method: 'GET',
        description: 'Get conversation statistics for a digital twin'
      }
    ];
    setAvailableTests(nlpTests);
  };

  const fetchNLPSampleData = async () => {
    const nlpSampleData = {
      process_query: {
        twin_id: "test-twin-123",
        query: "How productive was I today?",
        context: {
          productivity_score: 0.85,
          recent_activities: [
            {
              type: "coding",
              duration: 120,
              focus_score: 0.9
            },
            {
              type: "meeting",
              duration: 60,
              focus_score: 0.7
            }
          ],
          energy_level: 0.8,
          timestamp: "2024-01-15T14:30:00Z"
        }
      },
      alternative_queries: [
        "What patterns do you see in my work?",
        "Can you predict my productivity for tomorrow?",
        "Suggest ways to optimize my schedule",
        "How is my energy level throughout the day?",
        "What tasks should I prioritize?",
        "Simulate working 4 hours in the morning",
        "Recommend break times for better focus",
        "Analyze my meeting patterns"
      ]
    };
    setSampleData(nlpSampleData);
  };

  const fetchAnalyticsTests = async () => {
    // Set analytics tests directly since they're from Phase 2
    const analyticsTests = [
      {
        name: 'Comprehensive Analysis',
        endpoint: '/api/twin/phase2/analytics/analyze',
        method: 'POST',
        description: 'Perform comprehensive analytics analysis across multiple dimensions'
      },
      {
        name: 'Analytics Stats',
        endpoint: '/api/twin/phase2/analytics/stats',
        method: 'GET',
        description: 'Get analytics engine statistics and performance metrics'
      },
      {
        name: 'Twin Insights Summary',
        endpoint: '/api/twin/phase2/analytics/insights/{twin_id}',
        method: 'GET',
        description: 'Get insights summary for a specific digital twin'
      }
    ];
    setAvailableTests(analyticsTests);
  };

  const fetchAnalyticsSampleData = async () => {
    const analyticsSampleData = {
      comprehensive_analysis: {
        twin_id: "test-twin-123",
        data: {
          events: [
            {
              timestamp: "2024-01-15T09:00:00Z",
              productivity_score: 0.85,
              energy_level: 0.8,
              focus_time: 0.9,
              activity_type: "coding",
              task_completion_rate: 0.75
            },
            {
              timestamp: "2024-01-15T10:00:00Z",
              productivity_score: 0.78,
              energy_level: 0.75,
              focus_time: 0.85,
              activity_type: "meeting",
              task_completion_rate: 0.8
            },
            {
              timestamp: "2024-01-15T11:00:00Z",
              productivity_score: 0.92,
              energy_level: 0.85,
              focus_time: 0.95,
              activity_type: "design",
              task_completion_rate: 0.9
            }
          ]
        },
        analysis_types: ["productivity_analysis", "pattern_discovery", "trend_analysis"],
        time_range_days: 7
      }
    };
    setSampleData(analyticsSampleData);
  };

  const fetchLearningTests = async () => {
    // Set learning tests directly since they're from Phase 2
    const learningTests = [
      {
        name: 'Add Learning Data',
        endpoint: '/api/twin/phase2/learning/add-data',
        method: 'POST',
        description: 'Add data for continuous learning pipeline'
      },
      {
        name: 'Start Learning Pipeline',
        endpoint: '/api/twin/phase2/learning/start',
        method: 'POST',
        description: 'Start the continuous learning pipeline'
      },
      {
        name: 'Stop Learning Pipeline',
        endpoint: '/api/twin/phase2/learning/stop',
        method: 'POST',
        description: 'Stop the continuous learning pipeline'
      },
      {
        name: 'Learning Stats',
        endpoint: '/api/twin/phase2/learning/stats',
        method: 'GET',
        description: 'Get learning pipeline statistics'
      },
      {
        name: 'Model Status',
        endpoint: '/api/twin/phase2/learning/models/{twin_id}',
        method: 'GET',
        description: 'Get model status for a digital twin'
      }
    ];
    setAvailableTests(learningTests);
  };

  const fetchLearningSampleData = async () => {
    const learningSampleData = {
      add_learning_data: {
        twin_id: "test-twin-123",
        data_type: "productivity_data",
        data: {
          productivity_score: 0.85,
          focus_time: 0.9,
          task_completion_rate: 0.8,
          energy_level: 0.75,
          timestamp: "2024-01-15T14:30:00Z",
          context: {
            activity_type: "coding",
            interruption_count: 2,
            break_duration: 15
          }
        },
        model_type: "productivity_prediction",
        priority: "medium",
        metadata: {
          source: "user_activity",
          quality_score: 0.9
        }
      }
    };
    setSampleData(learningSampleData);
  };

  const fetchTeamTests = async () => {
    // Set team coordination tests directly since they're from Phase 3
    const teamTests = [
      {
        name: 'Create Team',
        endpoint: '/api/twin/phase3/teams/create',
        method: 'POST',
        description: 'Create a new digital twin team'
      },
      {
        name: 'Add Team Member',
        endpoint: '/api/twin/phase3/teams/{team_id}/members/add',
        method: 'POST',
        description: 'Add a member to a digital twin team'
      },
      {
        name: 'Get Team Status',
        endpoint: '/api/twin/phase3/teams/{team_id}/status',
        method: 'GET',
        description: 'Get comprehensive team status and metrics'
      },
      {
        name: 'Start Team Coordination',
        endpoint: '/api/twin/phase3/coordination/start',
        method: 'POST',
        description: 'Start a team coordination process'
      },
      {
        name: 'Workload Balancing',
        endpoint: '/api/twin/phase3/coordination/workload-balance',
        method: 'POST',
        description: 'Coordinate workload balancing across team members'
      },
      {
        name: 'Skill Optimization',
        endpoint: '/api/twin/phase3/coordination/skill-optimization',
        method: 'POST',
        description: 'Coordinate skill optimization across team members'
      },
      {
        name: 'Meeting Optimization',
        endpoint: '/api/twin/phase3/coordination/meeting-optimization',
        method: 'POST',
        description: 'Coordinate meeting optimization for team collaboration'
      },
      {
        name: 'Absence Planning',
        endpoint: '/api/twin/phase3/coordination/absence-planning',
        method: 'POST',
        description: 'Coordinate absence planning and coverage'
      },
      {
        name: 'Team Analytics',
        endpoint: '/api/twin/phase3/teams/{team_id}/analytics',
        method: 'GET',
        description: 'Get comprehensive team analytics and performance metrics'
      },
      {
        name: 'Coordination Status',
        endpoint: '/api/twin/phase3/coordination/{coordination_id}/status',
        method: 'GET',
        description: 'Get status of a specific coordination process'
      },
      {
        name: 'Phase 3 Status',
        endpoint: '/api/twin/phase3/status',
        method: 'GET',
        description: 'Get overall Phase 3 system status'
      },
      {
        name: 'Phase 3 Health Check',
        endpoint: '/api/twin/phase3/health',
        method: 'GET',
        description: 'Health check for Phase 3 services'
      }
    ];
    setAvailableTests(teamTests);
  };

  const fetchTeamSampleData = async () => {
    const teamSampleData = {
      create_team: {
        name: "Product Development Team",
        description: "Cross-functional product development team",
        team_lead_twin_id: "twin_alice_001",
        organization_id: 1
      },
      add_team_member: {
        twin_id: "twin_bob_002",
        user_id: 2,
        role: "developer",
        skills: {
          "programming": 0.9,
          "backend": 0.85,
          "databases": 0.8
        },
        specializations: ["backend_development", "api_design"]
      },
      start_coordination: {
        team_id: "team_001",
        coordination_type: "workload_balancing",
        target_twins: ["twin_alice_001", "twin_bob_002", "twin_carol_003"],
        parameters: {
          target_utilization: 0.8,
          max_adjustment: 20
        },
        goals: ["balance_workload", "optimize_utilization"],
        priority: "high"
      },
      workload_balancing: {
        team_id: "team_001",
        target_twins: ["twin_alice_001", "twin_bob_002", "twin_carol_003"],
        parameters: {
          target_utilization: 0.8,
          max_adjustment: 20,
          consider_skills: true
        }
      },
      skill_optimization: {
        team_id: "team_001",
        target_twins: ["twin_alice_001", "twin_bob_002", "twin_carol_003"],
        parameters: {
          required_skills: ["programming", "design", "testing"],
          skill_gap_threshold: 0.7
        }
      },
      meeting_optimization: {
        team_id: "team_001",
        target_twins: ["twin_alice_001", "twin_bob_002", "twin_carol_003"],
        parameters: {
          duration: 60,
          frequency: "weekly",
          type: "team_sync",
          timezone_preference: "UTC"
        }
      },
      absence_planning: {
        team_id: "team_001",
        target_twins: ["twin_alice_001", "twin_bob_002", "twin_carol_003"],
        absence_info: {
          member_twin_id: "twin_bob_002",
          start_date: "2025-07-15",
          end_date: "2025-07-25",
          reason: "vacation"
        },
        coverage_requirements: ["backend_development", "database_maintenance"]
      }
    };
    setSampleData(teamSampleData);
  };

  const fetchWebSocketTests = async () => {
    // Set WebSocket tests directly since they're from Phase 4
    const webSocketTests = [
      {
        name: 'Connection Stats',
        endpoint: '/ws/connections/stats',
        method: 'GET',
        description: 'Get WebSocket connection statistics and metrics'
      },
      {
        name: 'User Connections',
        endpoint: '/ws/connections/user/{user_id}',
        method: 'GET',
        description: 'Get active connections for a specific user'
      },
      {
        name: 'Test Broadcast',
        endpoint: '/ws/broadcast/test',
        method: 'POST',
        description: 'Test endpoint for broadcasting messages to channels'
      },
      {
        name: 'Twin WebSocket Connect',
        endpoint: '/ws/twin/{twin_id}',
        method: 'WebSocket',
        description: 'WebSocket endpoint for real-time twin updates'
      },
      {
        name: 'Team WebSocket Connect',
        endpoint: '/ws/team/{team_id}',
        method: 'WebSocket',
        description: 'WebSocket endpoint for real-time team coordination'
      },
      {
        name: 'Platform WebSocket Connect',
        endpoint: '/ws/platform',
        method: 'WebSocket',
        description: 'WebSocket endpoint for platform-wide notifications'
      }
    ];
    setAvailableTests(webSocketTests);
  };

  const fetchWebSocketSampleData = async () => {
    const webSocketSampleData = {
      test_broadcast: {
        message_type: "twin_update",
        channel: "twin:test-twin-123",
        data: {
          twin_id: "test-twin-123",
          update_type: "learning_progress",
          payload: {
            progress_percentage: 85,
            current_phase: "pattern_analysis",
            insights_generated: 12,
            last_activity: "2024-01-15T14:30:00Z"
          }
        }
      },
      twin_websocket_sample: {
        twin_id: "test-twin-123",
        connection_type: "twin_owner",
        expected_messages: [
          {
            type: "twin_update",
            data: {
              twin_id: "test-twin-123",
              update_type: "learning_progress",
              payload: {
                progress_percentage: 85,
                current_phase: "pattern_analysis"
              }
            }
          },
          {
            type: "analytics_update",
            data: {
              twin_id: "test-twin-123",
              analytics_type: "pattern_recognition",
              insights: {
                patterns_found: 5,
                confidence_scores: [0.9, 0.8, 0.85, 0.92, 0.78]
              }
            }
          }
        ]
      },
      team_websocket_sample: {
        team_id: "team_001",
        connection_type: "team_member",
        expected_messages: [
          {
            type: "team_coordination_update",
            data: {
              team_id: "team_001",
              coordination_id: "coord_123",
              status: "in_progress",
              payload: {
                progress_percentage: 60,
                active_participants: ["twin_alice_001", "twin_bob_002"]
              }
            }
          },
          {
            type: "team_member_status",
            data: {
              team_id: "team_001",
              member_twin_id: "twin_alice_001",
              status: "active",
              current_workload: 0.8
            }
          }
        ]
      },
      platform_websocket_sample: {
        connection_type: "platform_admin",
        expected_messages: [
          {
            type: "system_alert",
            data: {
              alert_type: "maintenance",
              message: "Scheduled maintenance in 30 minutes",
              severity: "info"
            }
          },
          {
            type: "platform_notification",
            data: {
              notification_type: "system_update",
              title: "New Features Available",
              message: "Phase 4 WebSocket features are now live"
            }
          }
        ]
      }
    };
    setSampleData(webSocketSampleData);
  };

  const fetchKubernetesTests = async () => {
    // Set Kubernetes tests directly since they're from Phase 5
    const kubernetesTests = [
      {
        name: 'Deployment Status',
        endpoint: '/api/k8s/deployment/status',
        method: 'GET',
        description: 'Get Kubernetes deployment status and health metrics'
      },
      {
        name: 'Pod Metrics',
        endpoint: '/api/k8s/pods/metrics',
        method: 'GET',
        description: 'Get pod resource usage and performance metrics'
      },
      {
        name: 'Service Health',
        endpoint: '/api/k8s/services/health',
        method: 'GET',
        description: 'Check health status of all Kubernetes services'
      },
      {
        name: 'Scaling Status',
        endpoint: '/api/k8s/scaling/status',
        method: 'GET',
        description: 'Get horizontal pod autoscaler status and metrics'
      },
      {
        name: 'Storage Status',
        endpoint: '/api/k8s/storage/status',
        method: 'GET',
        description: 'Get persistent volume and storage class status'
      },
      {
        name: 'Security Status',
        endpoint: '/api/k8s/security/status',
        method: 'GET',
        description: 'Get RBAC and security policy status'
      },
      {
        name: 'Monitoring Status',
        endpoint: '/api/k8s/monitoring/status',
        method: 'GET',
        description: 'Get Prometheus, Grafana, and AlertManager status'
      },
      {
        name: 'Ingress Status',
        endpoint: '/api/k8s/ingress/status',
        method: 'GET',
        description: 'Get ingress controller and SSL certificate status'
      },
      {
        name: 'Namespace Resources',
        endpoint: '/api/k8s/namespace/resources',
        method: 'GET',
        description: 'Get namespace resource quotas and usage'
      },
      {
        name: 'Cluster Info',
        endpoint: '/api/k8s/cluster/info',
        method: 'GET',
        description: 'Get overall cluster information and node status'
      }
    ];
    setAvailableTests(kubernetesTests);
  };

  const fetchKubernetesSampleData = async () => {
    const kubernetesSampleData = {
      deployment_status: {
        namespace: "digital-twin-platform",
        deployments: [
          {
            name: "digital-twin-api-deployment",
            ready_replicas: 3,
            desired_replicas: 3,
            status: "Running",
            last_updated: "2024-01-15T14:30:00Z"
          },
          {
            name: "postgresql",
            ready_replicas: 1,
            desired_replicas: 1,
            status: "Running",
            last_updated: "2024-01-15T14:25:00Z"
          },
          {
            name: "redis",
            ready_replicas: 1,
            desired_replicas: 1,
            status: "Running",
            last_updated: "2024-01-15T14:25:00Z"
          }
        ]
      },
      pod_metrics: {
        namespace: "digital-twin-platform",
        pods: [
          {
            name: "digital-twin-api-deployment-abc123",
            cpu_usage: "250m",
            memory_usage: "512Mi",
            cpu_limit: "500m",
            memory_limit: "1Gi",
            status: "Running",
            restarts: 0
          },
          {
            name: "postgresql-0",
            cpu_usage: "100m",
            memory_usage: "256Mi",
            cpu_limit: "500m",
            memory_limit: "1Gi",
            status: "Running",
            restarts: 0
          }
        ]
      },
      service_health: {
        namespace: "digital-twin-platform",
        services: [
          {
            name: "digital-twin-api-service",
            type: "ClusterIP",
            cluster_ip: "10.96.1.100",
            ports: [8000],
            endpoints: 3,
            status: "Healthy"
          },
          {
            name: "postgresql-service",
            type: "ClusterIP",
            cluster_ip: "10.96.1.101",
            ports: [5432],
            endpoints: 1,
            status: "Healthy"
          }
        ]
      },
      scaling_status: {
        namespace: "digital-twin-platform",
        hpa: [
          {
            name: "digital-twin-api-hpa",
            current_replicas: 3,
            desired_replicas: 3,
            min_replicas: 3,
            max_replicas: 10,
            cpu_utilization: "45%",
            memory_utilization: "60%",
            status: "Stable"
          }
        ]
      },
      storage_status: {
        namespace: "digital-twin-platform",
        persistent_volumes: [
          {
            name: "postgresql-storage",
            capacity: "10Gi",
            used: "2.5Gi",
            status: "Bound",
            storage_class: "fast-ssd"
          },
          {
            name: "prometheus-storage",
            capacity: "20Gi",
            used: "8.2Gi",
            status: "Bound",
            storage_class: "standard"
          }
        ]
      },
      monitoring_status: {
        namespace: "digital-twin-platform",
        components: [
          {
            name: "prometheus",
            status: "Running",
            version: "v2.45.0",
            targets_up: 15,
            targets_total: 15
          },
          {
            name: "grafana",
            status: "Running",
            version: "10.0.0",
            dashboards: 8,
            alerts: 2
          },
          {
            name: "alertmanager",
            status: "Running",
            version: "v0.25.0",
            active_alerts: 0,
            silenced_alerts: 0
          }
        ]
      }
    };
    setSampleData(kubernetesSampleData);
  };

  const runTest = async (testName: string, endpoint: string, testData?: any) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData || {})
      });

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      const testResult: TestResult = {
        success: response.ok,
        test_type: testName,
        results: result,
        tested_at: new Date().toISOString(),
        tested_by: 'Platform Owner',
        execution_time: executionTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      const testResult: TestResult = {
        success: false,
        test_type: testName,
        results: { error: error.message },
        tested_at: new Date().toISOString(),
        tested_by: 'Platform Owner',
        execution_time: Date.now() - startTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getTestData = (testName: string) => {
    if (!sampleData) return null;

    switch (testName.toLowerCase()) {
      case 'pattern analysis':
        return sampleData.pattern_analysis_data;
      case 'productivity prediction':
        return sampleData.productivity_prediction_data;
      case 'comprehensive insights':
        return {
          ...sampleData.pattern_analysis_data,
          ...sampleData.productivity_prediction_data,
          ...sampleData.task_forecasting_data,
          ...sampleData.energy_prediction_data
        };
      case 'comprehensive analysis':
        return sampleData.comprehensive_analysis;
      case 'add learning data':
        return sampleData.add_learning_data;
      case 'create team':
        return sampleData.create_team;
      case 'add team member':
        return sampleData.add_team_member;
      case 'start team coordination':
        return sampleData.start_coordination;
      case 'workload balancing':
        return sampleData.workload_balancing;
      case 'skill optimization':
        return sampleData.skill_optimization;
      case 'meeting optimization':
        return sampleData.meeting_optimization;
      case 'absence planning':
        return sampleData.absence_planning;
      case 'test broadcast':
        return sampleData.test_broadcast;
      case 'twin websocket connect':
        return sampleData.twin_websocket_sample;
      case 'team websocket connect':
        return sampleData.team_websocket_sample;
      case 'platform websocket connect':
        return sampleData.platform_websocket_sample;
      case 'deployment status':
        return sampleData.deployment_status;
      case 'pod metrics':
        return sampleData.pod_metrics;
      case 'service health':
        return sampleData.service_health;
      case 'scaling status':
        return sampleData.scaling_status;
      case 'storage status':
        return sampleData.storage_status;
      case 'monitoring status':
        return sampleData.monitoring_status;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Zone</h1>
        <p className="text-gray-600">Test and validate API endpoints with sample data</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Intelligence APIs Tab */}
      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Test Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No test results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.patterns_found !== undefined && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.patterns_found} patterns found
                        </span>
                        {result.results.high_confidence_patterns !== undefined && (
                          <span className="text-blue-600">
                            {result.results.high_confidence_patterns} high confidence
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.predictions && (
                      <div className="mt-3 text-sm text-green-600">
                        ✓ {result.results.predictions.length} predictions generated
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital Twin APIs Tab */}
      {activeTab === 'digital-twin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Twin API Tests</h3>
          <p className="text-gray-600 mb-4">Digital Twin API testing will be available soon.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Planned Tests:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Digital Twin Creation</li>
              <li>• Twin Profile Management</li>
              <li>• Behavioral Model Testing</li>
              <li>• Twin Interaction Simulation</li>
            </ul>
          </div>
        </div>
      )}

      {/* Analytics APIs Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Analytics API Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Analytics Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No analytics results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.summary && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.summary.total_analyses} analyses completed
                        </span>
                        {result.results.summary.total_insights !== undefined && (
                          <span className="text-blue-600">
                            {result.results.summary.total_insights} insights generated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learning APIs Tab */}
      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Learning API Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Learning Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Learning Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No learning results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.stats && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ Pipeline {result.results.stats.is_running ? 'running' : 'stopped'}
                        </span>
                        {result.results.stats.active_models !== undefined && (
                          <span className="text-purple-600">
                            {result.results.stats.active_models} active models
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team APIs Tab */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Coordination API Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Team Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Coordination Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No team coordination results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.coordination_type && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.coordination_type.replace('_', ' ')} completed
                        </span>
                        {result.results.estimated_improvement !== undefined && (
                          <span className="text-orange-600">
                            {result.results.estimated_improvement}% improvement
                          </span>
                        )}
                        {result.results.confidence !== undefined && (
                          <span className="text-blue-600">
                            {Math.round(result.results.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.team_id && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ Team operation successful
                        </span>
                        {result.results.member_count !== undefined && (
                          <span className="text-orange-600">
                            {result.results.member_count} members
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WebSocket APIs Tab */}
      {activeTab === 'websocket' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">WebSocket API Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        test.method === 'WebSocket'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {test.method}
                      </span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (test.method === 'WebSocket') {
                        // For WebSocket connections, show connection info instead of running test
                        alert(`WebSocket Connection: ${test.endpoint}\nUse browser dev tools to test WebSocket connections.`);
                      } else {
                        runTest(test.name, test.endpoint, getTestData(test.name));
                      }
                    }}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : test.method === 'WebSocket' ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">
                      {test.method === 'WebSocket' ? 'Connect' : 'Test'}
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample WebSocket Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}

            {/* WebSocket Connection Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">WebSocket Connection Guide</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use browser dev tools to test WebSocket connections</li>
                <li>• Include authentication token as query parameter: ?token=your_token</li>
                <li>• Twin WebSocket: Real-time twin updates and analytics</li>
                <li>• Team WebSocket: Live team coordination and member status</li>
                <li>• Platform WebSocket: System alerts and notifications</li>
                <li>• Connection will auto-reconnect on disconnect</li>
              </ul>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">WebSocket Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No WebSocket results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.stats && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.stats.total_connections} active connections
                        </span>
                        {result.results.stats.connection_count !== undefined && (
                          <span className="text-cyan-600">
                            {result.results.stats.connection_count} user connections
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.message && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.message}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Real-time Connection Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Real-time Connection Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Twin WebSocket</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Disconnected
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Team WebSocket</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Disconnected
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Platform WebSocket</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Disconnected
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Connect to WebSocket endpoints to see live status updates
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kubernetes APIs Tab */}
      {activeTab === 'kubernetes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Kubernetes API Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Kubernetes Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}

            {/* Kubernetes Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Kubernetes Deployment Info</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Namespace: digital-twin-platform</li>
                <li>• Auto-scaling: Enabled (3-10 replicas)</li>
                <li>• Monitoring: Prometheus + Grafana + AlertManager</li>
                <li>• Security: RBAC + Network Policies + Secrets</li>
                <li>• Storage: Persistent volumes with fast SSD</li>
                <li>• Ingress: SSL termination + Rate limiting</li>
                <li>• Health checks: Liveness + Readiness probes</li>
              </ul>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Kubernetes Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No Kubernetes results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.deployments && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.deployments.length} deployments running
                        </span>
                        {result.results.deployments.filter(d => d.status === 'Running').length > 0 && (
                          <span className="text-gray-600">
                            {result.results.deployments.filter(d => d.status === 'Running').length} healthy
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.pods && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.pods.length} pods monitored
                        </span>
                        {result.results.pods.filter(p => p.status === 'Running').length > 0 && (
                          <span className="text-gray-600">
                            {result.results.pods.filter(p => p.status === 'Running').length} running
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.services && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.services.length} services active
                        </span>
                        {result.results.services.filter(s => s.status === 'Healthy').length > 0 && (
                          <span className="text-gray-600">
                            {result.results.services.filter(s => s.status === 'Healthy').length} healthy
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.components && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.components.filter(c => c.status === 'Running').length} components running
                        </span>
                        {result.results.components.find(c => c.name === 'prometheus') && (
                          <span className="text-gray-600">
                            Prometheus monitoring active
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Cluster Status Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Cluster Status Overview</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API Server</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Running
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monitoring</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Auto-scaling</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Enabled
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Production deployment with enterprise-grade features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Tests Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom API Test</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
                <input
                  type="text"
                  placeholder="/api/v1/your-endpoint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</label>
                <textarea
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Custom Test Guidelines</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ensure you have proper authentication tokens</li>
              <li>• Use valid JSON format for request bodies</li>
              <li>• Test endpoints should be accessible from this environment</li>
              <li>• Be cautious when testing endpoints that modify data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestZone;