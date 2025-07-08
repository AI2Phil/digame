import { apiClient } from './apiClient';

export interface TwinInitRequest {
  name?: string;
}

export interface ActivityDataRequest {
  activities: Array<Record<string, any>>;
  timestamp?: string;
  productivity_score?: number;
  duration?: number;
  context?: Record<string, any>;
}

export interface PredictionRequest {
  prediction_type: 'productivity' | 'tasks' | 'energy' | 'comprehensive';
  time_horizon?: number;
}

export interface TwinInteractionRequest {
  query: string;
  context?: Record<string, any>;
}

export interface TwinResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TwinStatus {
  twin_id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version: string;
  last_training: string | null;
  created_at: string;
  statistics: {
    pattern_count: number;
    interaction_count: number;
    learning_count: number;
    recent_interactions: number;
    recent_patterns: number;
  };
}

export interface TwinHealth {
  health_score: number;
  health_status: string;
  twin_id: string;
  last_updated: string;
}

export interface TwinInsights {
  twin_status: {
    id: string;
    name: string;
    status: string;
    learning_progress: number;
    accuracy_score: number;
    model_version: string;
    last_training: string | null;
    health_score: number;
  };
  discovered_patterns: Array<{
    id: string;
    type: string;
    description: string;
    confidence: number;
    discovered_at: string;
  }>;
  recent_predictions: Array<{
    id: string;
    type: string;
    prediction: string;
    confidence: number;
    generated_at: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    confidence: number;
  }>;
  insights_generated_at: string;
}

export interface TwinPattern {
  id: string;
  pattern_type: string;
  pattern_data: Record<string, any>;
  confidence_score: number | null;
  frequency_score: number | null;
  impact_score: number | null;
  discovered_at: string | null;
  validated_at: string | null;
}

export interface TwinInteraction {
  id: string;
  interaction_type: string;
  input_data: Record<string, any> | null;
  response_data: Record<string, any> | null;
  processing_time_ms: number | null;
  user_feedback: number | null;
  created_at: string | null;
}

class DigitalTwinApi {
  private baseUrl = 'http://localhost:8001/api/digital-twin';

  async initializeTwin(request: TwinInitRequest): Promise<TwinResponse> {
    return await apiClient.post<TwinResponse>(`${this.baseUrl}/initialize`, request);
  }

  async getTwinStatus(): Promise<TwinResponse<TwinStatus>> {
    return await apiClient.get<TwinResponse<TwinStatus>>(`${this.baseUrl}/status`);
  }

  async processActivityData(request: ActivityDataRequest): Promise<TwinResponse> {
    return await apiClient.post<TwinResponse>(`${this.baseUrl}/activity`, request);
  }

  async generatePredictions(request: PredictionRequest): Promise<TwinResponse> {
    return await apiClient.post<TwinResponse>(`${this.baseUrl}/predictions`, request);
  }

  async getTwinInsights(): Promise<TwinResponse<TwinInsights>> {
    return await apiClient.get<TwinResponse<TwinInsights>>(`${this.baseUrl}/insights`);
  }

  async interactWithTwin(request: TwinInteractionRequest): Promise<TwinResponse> {
    return await apiClient.post<TwinResponse>(`${this.baseUrl}/interact`, request);
  }

  async getTwinHealth(): Promise<TwinResponse<TwinHealth>> {
    return await apiClient.get<TwinResponse<TwinHealth>>(`${this.baseUrl}/health`);
  }

  async deleteTwin(): Promise<TwinResponse> {
    return await apiClient.delete<TwinResponse>(`${this.baseUrl}/`);
  }

  async getTwinPatterns(
    patternType?: string,
    limit?: number
  ): Promise<TwinResponse<{ patterns: TwinPattern[]; total_count: number }>> {
    const params = new URLSearchParams();
    if (patternType) params.append('pattern_type', patternType);
    if (limit) params.append('limit', limit.toString());
    
    return await apiClient.get<TwinResponse<{ patterns: TwinPattern[]; total_count: number }>>(`${this.baseUrl}/patterns?${params}`);
  }

  async getTwinInteractions(
    interactionType?: string,
    limit?: number
  ): Promise<TwinResponse<{ interactions: TwinInteraction[]; total_count: number }>> {
    const params = new URLSearchParams();
    if (interactionType) params.append('interaction_type', interactionType);
    if (limit) params.append('limit', limit.toString());
    
    return await apiClient.get<TwinResponse<{ interactions: TwinInteraction[]; total_count: number }>>(`${this.baseUrl}/interactions?${params}`);
  }

  // Utility methods for activity data processing
  async processProductivityData(data: {
    tasks_completed: number;
    focus_time: number;
    interruptions: number;
    energy_level: number;
  }): Promise<TwinResponse> {
    return this.processActivityData({
      activities: [
        {
          type: 'productivity_session',
          tasks_completed: data.tasks_completed,
          focus_time: data.focus_time,
          interruptions: data.interruptions,
          energy_level: data.energy_level,
        }
      ],
      productivity_score: this.calculateProductivityScore(data),
      duration: data.focus_time,
      context: {
        session_type: 'work_session',
        data_source: 'manual_input'
      }
    });
  }

  private calculateProductivityScore(data: {
    tasks_completed: number;
    focus_time: number;
    interruptions: number;
    energy_level: number;
  }): number {
    // Simple productivity score calculation
    const taskScore = Math.min(data.tasks_completed * 2, 4); // Max 4 points
    const focusScore = Math.min(data.focus_time / 30, 3); // Max 3 points for 90+ min focus
    const interruptionPenalty = Math.max(0, 2 - data.interruptions * 0.5); // Max 2 points penalty
    const energyScore = data.energy_level; // 1-10 scale
    
    return Math.min(10, taskScore + focusScore + interruptionPenalty + (energyScore / 10));
  }

  // Quick prediction methods
  async getProductivityPrediction(days: number = 7): Promise<TwinResponse> {
    return this.generatePredictions({
      prediction_type: 'productivity',
      time_horizon: days
    });
  }

  async getTaskCompletionForecast(days: number = 7): Promise<TwinResponse> {
    return this.generatePredictions({
      prediction_type: 'tasks',
      time_horizon: days
    });
  }

  async getEnergyLevelPrediction(days: number = 7): Promise<TwinResponse> {
    return this.generatePredictions({
      prediction_type: 'energy',
      time_horizon: days
    });
  }

  async getComprehensiveInsights(): Promise<TwinResponse> {
    return this.generatePredictions({
      prediction_type: 'comprehensive'
    });
  }

  // Real-time dashboard methods
  async getRealTimeAnalytics(): Promise<TwinResponse> {
    return await apiClient.get<TwinResponse>(`${this.baseUrl}/real-time/analytics`);
  }

  async getRealTimeNotifications(limit?: number): Promise<TwinResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    return await apiClient.get<TwinResponse>(`${this.baseUrl}/real-time/notifications?${params}`);
  }

  async getRealTimeHealthMetrics(): Promise<TwinResponse> {
    return await apiClient.get<TwinResponse>(`${this.baseUrl}/real-time/health-metrics`);
  }

  // Analytics methods for TwinAnalytics component
  async getTwinAnalyticsStatistics(timeRange?: number): Promise<TwinResponse> {
    const params = new URLSearchParams();
    if (timeRange) params.append('time_range', timeRange.toString());
    
    return await apiClient.get<TwinResponse>(`${this.baseUrl}/analytics/statistics?${params}`);
  }

  async getTwinAnalyticsPatterns(
    patternType?: string,
    timeRange?: number,
    limit?: number
  ): Promise<TwinResponse> {
    const params = new URLSearchParams();
    if (patternType) params.append('pattern_type', patternType);
    if (timeRange) params.append('time_range', timeRange.toString());
    if (limit) params.append('limit', limit.toString());
    
    return await apiClient.get<TwinResponse>(`${this.baseUrl}/analytics/patterns?${params}`);
  }
}

export const digitalTwinApi = new DigitalTwinApi();