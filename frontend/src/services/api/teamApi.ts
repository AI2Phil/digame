import { apiClient } from './client';

// Team interfaces matching backend schemas
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
}

export interface TeamMember {
  id: number;
  userId: number;
  role: string;
  joinedAt: string;
  isActive: boolean;
  permissions: string[];
  customAttributes?: any;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  memberDetails?: TeamMember[];
  projects: any[];
  invitations: any[];
  statistics: {
    totalMembers: number;
    pendingInvitations: number;
    activeProjects: number;
  };
}

export interface TeamPerformanceMetric {
  id: number;
  teamId: number;
  metricName: string;
  metricValue: any;
  recordedAt: string;
  notes?: string;
}

export interface TeamSkillGap {
  id: number;
  teamId: number;
  skillName: string;
  description?: string;
  identifiedAt: string;
  priority: number;
  suggestedDevelopmentPlan?: string;
}

export interface TeamWorkflow {
  id: number;
  teamId: number;
  workflowName: string;
  description?: string;
  steps: any[];
  isOptimized: number;
  optimizationSuggestions?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAnalyticsDashboard {
  teamId: number;
  performanceMetrics: TeamPerformanceMetric[];
  skillGaps: TeamSkillGap[];
  workflows: TeamWorkflow[];
  collaborationData: any;
  insights: any[];
  recommendations: any[];
}

export interface TeamCreate {
  name: string;
  description?: string;
  subscriptionTier?: string;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
}

export interface TeamMemberAction {
  userId: number;
  role?: string;
}

export interface TeamMemberUpdate {
  role?: string;
  customAttributes?: any;
}

export interface InviteRequest {
  email: string;
  role: string;
}

// Team API service class
export class TeamApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/teams${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Team CRUD operations
  async createTeam(teamData: TeamCreate): Promise<Team> {
    return this.request<Team>('', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async getTeams(skip = 0, limit = 100): Promise<Team[]> {
    return this.request<Team[]>(`?skip=${skip}&limit=${limit}`);
  }

  async getTeam(teamId: string): Promise<Team> {
    return this.request<Team>(`/${teamId}`);
  }

  async updateTeam(teamId: string, teamData: TeamUpdate): Promise<Team> {
    return this.request<Team>(`/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(teamId: string): Promise<void> {
    return this.request<void>(`/${teamId}`, {
      method: 'DELETE',
    });
  }

  // Team member operations
  async addTeamMember(teamId: string, memberData: TeamMemberAction): Promise<TeamMember> {
    return this.request<TeamMember>(`/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/${teamId}/members`);
  }

  async updateTeamMember(teamId: string, userId: number, memberData: TeamMemberUpdate): Promise<TeamMember> {
    return this.request<TeamMember>(`/${teamId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async removeTeamMember(teamId: string, userId: number): Promise<void> {
    return this.request<void>(`/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Team analytics operations
  async getTeamAnalytics(teamId: string): Promise<TeamAnalyticsDashboard> {
    return this.request<TeamAnalyticsDashboard>(`/${teamId}/analytics`);
  }

  async getTeamPerformance(teamId: string): Promise<TeamAnalyticsDashboard> {
    return this.request<TeamAnalyticsDashboard>(`/${teamId}/performance`);
  }

  // Team metrics operations
  async createTeamMetric(teamId: string, metric: Omit<TeamPerformanceMetric, 'id' | 'recordedAt'>): Promise<TeamPerformanceMetric> {
    return this.request<TeamPerformanceMetric>(`/${teamId}/metrics`, {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }

  async getTeamMetrics(teamId: string, skip = 0, limit = 100): Promise<TeamPerformanceMetric[]> {
    return this.request<TeamPerformanceMetric[]>(`/${teamId}/metrics?skip=${skip}&limit=${limit}`);
  }

  async updateTeamMetric(teamId: string, metricId: number, metricData: Partial<TeamPerformanceMetric>): Promise<TeamPerformanceMetric> {
    return this.request<TeamPerformanceMetric>(`/${teamId}/metrics/${metricId}`, {
      method: 'PUT',
      body: JSON.stringify(metricData),
    });
  }

  async deleteTeamMetric(teamId: string, metricId: number): Promise<void> {
    return this.request<void>(`/${teamId}/metrics/${metricId}`, {
      method: 'DELETE',
    });
  }

  // Team skill gaps operations
  async createSkillGap(teamId: string, skillGap: Omit<TeamSkillGap, 'id' | 'identifiedAt'>): Promise<TeamSkillGap> {
    return this.request<TeamSkillGap>(`/${teamId}/skillgaps`, {
      method: 'POST',
      body: JSON.stringify(skillGap),
    });
  }

  async getSkillGaps(teamId: string, skip = 0, limit = 100): Promise<TeamSkillGap[]> {
    return this.request<TeamSkillGap[]>(`/${teamId}/skillgaps?skip=${skip}&limit=${limit}`);
  }

  async updateSkillGap(teamId: string, skillGapId: number, skillGapData: Partial<TeamSkillGap>): Promise<TeamSkillGap> {
    return this.request<TeamSkillGap>(`/${teamId}/skillgaps/${skillGapId}`, {
      method: 'PUT',
      body: JSON.stringify(skillGapData),
    });
  }

  async deleteSkillGap(teamId: string, skillGapId: number): Promise<void> {
    return this.request<void>(`/${teamId}/skillgaps/${skillGapId}`, {
      method: 'DELETE',
    });
  }

  // Team workflows operations
  async createWorkflow(teamId: string, workflow: Omit<TeamWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamWorkflow> {
    return this.request<TeamWorkflow>(`/${teamId}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async getWorkflows(teamId: string, skip = 0, limit = 100): Promise<TeamWorkflow[]> {
    return this.request<TeamWorkflow[]>(`/${teamId}/workflows?skip=${skip}&limit=${limit}`);
  }

  async updateWorkflow(teamId: string, workflowId: number, workflowData: Partial<TeamWorkflow>): Promise<TeamWorkflow> {
    return this.request<TeamWorkflow>(`/${teamId}/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
  }

  async deleteWorkflow(teamId: string, workflowId: number): Promise<void> {
    return this.request<void>(`/${teamId}/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  // Team development planning
  async createDevelopmentPlan(teamId: string, planData: any): Promise<any> {
    return this.request<any>(`/${teamId}/development-plan`, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  // Invitation methods (for compatibility with existing component)
  async inviteMember(teamId: string, inviteData: InviteRequest): Promise<any> {
    return this.request<any>(`/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }
}

// Export singleton instance
export const teamApi = new TeamApiService();

// Export individual methods for easier importing
export const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
  getTeamAnalytics,
  getTeamPerformance,
  createTeamMetric,
  getTeamMetrics,
  updateTeamMetric,
  deleteTeamMetric,
  createSkillGap,
  getSkillGaps,
  updateSkillGap,
  deleteSkillGap,
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  createDevelopmentPlan,
  inviteMember,
} = teamApi;

export default teamApi;