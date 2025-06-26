import { apiClient } from '../../../services/apiClient';

interface CollaborationPattern {
  pattern_type: string;
  frequency: number;
  participants: string[];
  effectiveness_score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}

interface PerformancePrediction {
  team_id: number;
  prediction_period: string;
  predicted_metrics: {
    productivity_score: number;
    collaboration_index: number;
    delivery_probability: number;
    risk_factors: string[];
  };
  confidence_level: number;
  factors_considered: string[];
}

interface WorkflowOptimizationResult {
  workflow_id: number;
  current_efficiency: number;
  optimized_efficiency: number;
  optimization_steps: {
    step: string;
    impact: number;
    effort_required: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  estimated_time_savings: number;
  implementation_complexity: string;
}

interface TeamDevelopmentSuggestion {
  suggestion_type: 'skill_development' | 'process_improvement' | 'tool_adoption' | 'team_structure';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_impact: number;
  implementation_effort: string;
  timeline: string;
  success_metrics: string[];
  resources_needed: string[];
}

interface AnalyticsInsight {
  insight_type: string;
  title: string;
  description: string;
  data_points: any[];
  confidence_score: number;
  actionable_recommendations: string[];
  related_metrics: string[];
}

class AdvancedAnalyticsService {
  private baseUrl = '/api/analytics';

  // Collaboration Pattern Analysis
  async analyzeCollaborationPatterns(teamId: number, timeframe: string = '30d'): Promise<CollaborationPattern[]> {
    try {
      const patterns = await apiClient.get<CollaborationPattern[]>(
        `${this.baseUrl}/teams/${teamId}/collaboration-patterns?timeframe=${timeframe}`
      );
      return patterns;
    } catch (error) {
      console.error('Error analyzing collaboration patterns:', error);
      // Return mock data for development
      return this.generateMockCollaborationPatterns();
    }
  }

  // Performance Prediction
  async predictTeamPerformance(teamId: number, predictionPeriod: string = '30d'): Promise<PerformancePrediction> {
    try {
      const prediction = await apiClient.get<PerformancePrediction>(
        `${this.baseUrl}/teams/${teamId}/performance-prediction?period=${predictionPeriod}`
      );
      return prediction;
    } catch (error) {
      console.error('Error predicting team performance:', error);
      // Return mock data for development
      return this.generateMockPerformancePrediction(teamId, predictionPeriod);
    }
  }

  // Workflow Optimization
  async optimizeWorkflow(workflowId: number): Promise<WorkflowOptimizationResult> {
    try {
      const optimization = await apiClient.post<WorkflowOptimizationResult>(
        `${this.baseUrl}/workflows/${workflowId}/optimize`,
        {}
      );
      return optimization;
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      // Return mock data for development
      return this.generateMockWorkflowOptimization(workflowId);
    }
  }

  // AI-Powered Team Development Suggestions
  async getTeamDevelopmentSuggestions(teamId: number): Promise<TeamDevelopmentSuggestion[]> {
    try {
      const suggestions = await apiClient.get<TeamDevelopmentSuggestion[]>(
        `${this.baseUrl}/teams/${teamId}/development-suggestions`
      );
      return suggestions;
    } catch (error) {
      console.error('Error getting team development suggestions:', error);
      // Return mock data for development
      return this.generateMockDevelopmentSuggestions();
    }
  }

  // Advanced Analytics Insights
  async getAnalyticsInsights(teamId: number, categories: string[] = []): Promise<AnalyticsInsight[]> {
    try {
      const categoryParam = categories.length > 0 ? `?categories=${categories.join(',')}` : '';
      const insights = await apiClient.get<AnalyticsInsight[]>(
        `${this.baseUrl}/teams/${teamId}/insights${categoryParam}`
      );
      return insights;
    } catch (error) {
      console.error('Error getting analytics insights:', error);
      // Return mock data for development
      return this.generateMockAnalyticsInsights();
    }
  }

  // Trend Analysis
  async analyzeTrends(teamId: number, metrics: string[], timeframe: string = '90d'): Promise<any> {
    try {
      const trends = await apiClient.post<any>(
        `${this.baseUrl}/teams/${teamId}/trends`,
        { metrics, timeframe }
      );
      return trends;
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return this.generateMockTrendAnalysis(metrics);
    }
  }

  // Benchmarking
  async getBenchmarkData(teamId: number, benchmarkType: string = 'industry'): Promise<any> {
    try {
      const benchmark = await apiClient.get<any>(
        `${this.baseUrl}/teams/${teamId}/benchmark?type=${benchmarkType}`
      );
      return benchmark;
    } catch (error) {
      console.error('Error getting benchmark data:', error);
      return this.generateMockBenchmarkData();
    }
  }

  // Mock data generators for development
  private generateMockCollaborationPatterns(): CollaborationPattern[] {
    return [
      {
        pattern_type: 'Daily Standups',
        frequency: 5,
        participants: ['Alice', 'Bob', 'Charlie', 'Diana'],
        effectiveness_score: 85,
        trend: 'stable',
        recommendations: [
          'Consider rotating facilitator role',
          'Add async updates for remote members',
          'Focus on blockers and dependencies'
        ]
      },
      {
        pattern_type: 'Pair Programming',
        frequency: 3,
        participants: ['Bob', 'Charlie'],
        effectiveness_score: 92,
        trend: 'increasing',
        recommendations: [
          'Expand pair programming to other team members',
          'Document knowledge sharing outcomes',
          'Track skill transfer metrics'
        ]
      },
      {
        pattern_type: 'Code Reviews',
        frequency: 8,
        participants: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
        effectiveness_score: 78,
        trend: 'decreasing',
        recommendations: [
          'Implement automated code quality checks',
          'Reduce review turnaround time',
          'Provide reviewer training'
        ]
      }
    ];
  }

  private generateMockPerformancePrediction(teamId: number, period: string): PerformancePrediction {
    return {
      team_id: teamId,
      prediction_period: period,
      predicted_metrics: {
        productivity_score: 82,
        collaboration_index: 76,
        delivery_probability: 88,
        risk_factors: [
          'Upcoming sprint has 20% more story points than average',
          'Two team members have overlapping vacation',
          'New technology adoption may slow initial velocity'
        ]
      },
      confidence_level: 78,
      factors_considered: [
        'Historical velocity trends',
        'Team member availability',
        'Complexity of upcoming work',
        'Recent performance metrics',
        'External dependencies'
      ]
    };
  }

  private generateMockWorkflowOptimization(workflowId: number): WorkflowOptimizationResult {
    return {
      workflow_id: workflowId,
      current_efficiency: 72,
      optimized_efficiency: 89,
      optimization_steps: [
        {
          step: 'Parallelize testing and documentation phases',
          impact: 8,
          effort_required: 'Medium',
          priority: 'high'
        },
        {
          step: 'Implement automated deployment pipeline',
          impact: 12,
          effort_required: 'High',
          priority: 'high'
        },
        {
          step: 'Add automated code quality gates',
          impact: 5,
          effort_required: 'Low',
          priority: 'medium'
        },
        {
          step: 'Optimize handoff procedures between phases',
          impact: 3,
          effort_required: 'Low',
          priority: 'low'
        }
      ],
      estimated_time_savings: 240, // minutes per workflow execution
      implementation_complexity: 'Medium - requires process changes and tool setup'
    };
  }

  private generateMockDevelopmentSuggestions(): TeamDevelopmentSuggestion[] {
    return [
      {
        suggestion_type: 'skill_development',
        title: 'Advanced React Patterns Training',
        description: 'Team would benefit from learning advanced React patterns like render props, compound components, and custom hooks to improve code reusability and maintainability.',
        priority: 'high',
        estimated_impact: 85,
        implementation_effort: 'Medium',
        timeline: '4-6 weeks',
        success_metrics: [
          'Reduced code duplication by 30%',
          'Improved component reusability score',
          'Faster feature development velocity'
        ],
        resources_needed: [
          'Online training platform subscription',
          '2 hours per week dedicated learning time',
          'Senior developer mentorship'
        ]
      },
      {
        suggestion_type: 'process_improvement',
        title: 'Implement Continuous Integration',
        description: 'Setting up automated testing and deployment pipelines will reduce manual errors and speed up delivery cycles.',
        priority: 'critical',
        estimated_impact: 92,
        implementation_effort: 'High',
        timeline: '2-3 weeks',
        success_metrics: [
          'Zero manual deployment errors',
          '50% reduction in deployment time',
          '90% automated test coverage'
        ],
        resources_needed: [
          'CI/CD platform setup',
          'DevOps engineer consultation',
          'Team training on new processes'
        ]
      },
      {
        suggestion_type: 'tool_adoption',
        title: 'Adopt Design System Components',
        description: 'Using a standardized design system will improve UI consistency and reduce development time for new features.',
        priority: 'medium',
        estimated_impact: 70,
        implementation_effort: 'Medium',
        timeline: '3-4 weeks',
        success_metrics: [
          '80% of UI components use design system',
          '25% faster UI development',
          'Improved design-dev handoff efficiency'
        ],
        resources_needed: [
          'Design system library setup',
          'Component migration plan',
          'Designer-developer collaboration time'
        ]
      }
    ];
  }

  private generateMockAnalyticsInsights(): AnalyticsInsight[] {
    return [
      {
        insight_type: 'productivity_trend',
        title: 'Productivity Peak on Tuesdays',
        description: 'Team consistently shows 23% higher productivity on Tuesdays compared to other weekdays. This correlates with Monday planning sessions and fewer meetings.',
        data_points: [
          { day: 'Monday', productivity: 72 },
          { day: 'Tuesday', productivity: 95 },
          { day: 'Wednesday', productivity: 78 },
          { day: 'Thursday', productivity: 74 },
          { day: 'Friday', productivity: 68 }
        ],
        confidence_score: 87,
        actionable_recommendations: [
          'Schedule complex tasks on Tuesdays',
          'Minimize Tuesday meetings',
          'Use Tuesday productivity for sprint planning'
        ],
        related_metrics: ['velocity', 'story_completion_rate', 'code_quality']
      },
      {
        insight_type: 'collaboration_pattern',
        title: 'Knowledge Silos Detected',
        description: 'Analysis shows that 60% of code changes are made by only 2 team members, indicating potential knowledge silos that could impact team resilience.',
        data_points: [
          { member: 'Alice', contribution: 35 },
          { member: 'Bob', contribution: 25 },
          { member: 'Charlie', contribution: 20 },
          { member: 'Diana', contribution: 15 },
          { member: 'Eve', contribution: 5 }
        ],
        confidence_score: 92,
        actionable_recommendations: [
          'Implement pair programming rotation',
          'Cross-train team members on critical components',
          'Document tribal knowledge'
        ],
        related_metrics: ['code_ownership_distribution', 'knowledge_sharing_index']
      }
    ];
  }

  private generateMockTrendAnalysis(metrics: string[]): any {
    return {
      timeframe: '90d',
      trends: metrics.map(metric => ({
        metric_name: metric,
        trend_direction: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        trend_strength: Math.random() * 100,
        data_points: Array.from({ length: 12 }, (_, i) => ({
          week: i + 1,
          value: 50 + Math.random() * 50
        }))
      }))
    };
  }

  private generateMockBenchmarkData(): any {
    return {
      team_metrics: {
        velocity: 42,
        cycle_time: 5.2,
        defect_rate: 2.1,
        team_satisfaction: 8.3
      },
      industry_benchmarks: {
        velocity: 38,
        cycle_time: 6.8,
        defect_rate: 3.5,
        team_satisfaction: 7.8
      },
      percentile_ranking: {
        velocity: 75,
        cycle_time: 82,
        defect_rate: 88,
        team_satisfaction: 71
      }
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();