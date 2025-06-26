import { useState, useCallback } from 'react';
import { teamService } from '../services/teamService';

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

interface UseTeamManagementReturn {
  teams: Team[];
  selectedTeam: Team | null;
  isLoading: boolean;
  error: Error | null;
  fetchTeams: () => Promise<void>;
  createTeam: (data: CreateTeamData) => Promise<void>;
  updateTeam: (id: number, data: Partial<CreateTeamData>) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  addTeamMember: (teamId: number, data: AddMemberData) => Promise<void>;
  removeTeamMember: (teamId: number, memberId: number) => Promise<void>;
  updateMemberRole: (teamId: number, memberId: number, role: string) => Promise<void>;
  setSelectedTeam: (team: Team | null) => void;
}

export const useTeamManagement = (): UseTeamManagementReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTeams = await teamService.getTeams();
      setTeams(fetchedTeams);
      
      // Update selected team if it exists in the new data
      if (selectedTeam) {
        const updatedSelectedTeam = fetchedTeams.find(team => team.id === selectedTeam.id);
        if (updatedSelectedTeam) {
          setSelectedTeam(updatedSelectedTeam);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeam]);

  const createTeam = useCallback(async (data: CreateTeamData) => {
    setError(null);
    try {
      await teamService.createTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create team'));
      throw err;
    }
  }, []);

  const updateTeam = useCallback(async (id: number, data: Partial<CreateTeamData>) => {
    setError(null);
    try {
      await teamService.updateTeam(id, data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update team'));
      throw err;
    }
  }, []);

  const deleteTeam = useCallback(async (id: number) => {
    setError(null);
    try {
      await teamService.deleteTeam(id);
      setTeams(prev => prev.filter(team => team.id !== id));
      if (selectedTeam?.id === id) {
        setSelectedTeam(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete team'));
      throw err;
    }
  }, [selectedTeam]);

  const addTeamMember = useCallback(async (teamId: number, data: AddMemberData) => {
    setError(null);
    try {
      await teamService.addTeamMember(teamId, data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add team member'));
      throw err;
    }
  }, []);

  const removeTeamMember = useCallback(async (teamId: number, memberId: number) => {
    setError(null);
    try {
      await teamService.removeTeamMember(teamId, memberId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove team member'));
      throw err;
    }
  }, []);

  const updateMemberRole = useCallback(async (teamId: number, memberId: number, role: string) => {
    setError(null);
    try {
      await teamService.updateMemberRole(teamId, memberId, role);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update member role'));
      throw err;
    }
  }, []);

  return {
    teams,
    selectedTeam,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    setSelectedTeam
  };
};