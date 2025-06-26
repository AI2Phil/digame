import { apiClient } from '../../../services/apiClient.ts';

interface Team {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
  members?: TeamMember[];
}

interface TeamMember {
  id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface CreateTeamData {
  name: string;
  description: string;
}

interface AddMemberData {
  email: string;
  role: string;
}

class TeamService {
  private baseUrl = '/api/teams';

  async getTeams(): Promise<Team[]> {
    try {
      const teams = await apiClient.get<Team[]>(this.baseUrl);
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }

  async getTeam(id: number): Promise<Team> {
    try {
      const team = await apiClient.get<Team>(`${this.baseUrl}/${id}`);
      return team;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw new Error('Failed to fetch team');
    }
  }

  async createTeam(data: CreateTeamData): Promise<Team> {
    try {
      const team = await apiClient.post<Team>(this.baseUrl, data);
      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  async updateTeam(id: number, data: Partial<CreateTeamData>): Promise<Team> {
    try {
      const team = await apiClient.put<Team>(`${this.baseUrl}/${id}`, data);
      return team;
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  }

  async deleteTeam(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    try {
      const members = await apiClient.get<TeamMember[]>(`${this.baseUrl}/${teamId}/members`);
      return members;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  async addTeamMember(teamId: number, data: AddMemberData): Promise<TeamMember> {
    try {
      const member = await apiClient.post<TeamMember>(`${this.baseUrl}/${teamId}/members`, data);
      return member;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  async removeTeamMember(teamId: number, memberId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${teamId}/members/${memberId}`);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  async updateMemberRole(teamId: number, memberId: number, role: string): Promise<TeamMember> {
    try {
      const member = await apiClient.put<TeamMember>(`${this.baseUrl}/${teamId}/members/${memberId}`, { role });
      return member;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error('Failed to update member role');
    }
  }

  async getTeamPerformance(teamId: number): Promise<any> {
    try {
      const performance = await apiClient.get<any>(`${this.baseUrl}/${teamId}/performance`);
      return performance;
    } catch (error) {
      console.error('Error fetching team performance:', error);
      throw new Error('Failed to fetch team performance');
    }
  }

  async getTeamSkillGaps(teamId: number): Promise<any> {
    try {
      const skillGaps = await apiClient.get<any>(`${this.baseUrl}/${teamId}/skill-gaps`);
      return skillGaps;
    } catch (error) {
      console.error('Error fetching team skill gaps:', error);
      throw new Error('Failed to fetch team skill gaps');
    }
  }

  async getTeamWorkflows(teamId: number): Promise<any> {
    try {
      const workflows = await apiClient.get<any>(`${this.baseUrl}/${teamId}/workflows`);
      return workflows;
    } catch (error) {
      console.error('Error fetching team workflows:', error);
      throw new Error('Failed to fetch team workflows');
    }
  }
}

export const teamService = new TeamService();