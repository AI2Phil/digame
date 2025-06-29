import { useState, useEffect } from 'react';
import { CoordinationType, CoordinationResult, TeamCoordinationRequest } from '../types/team';

interface UseTeamCoordinationReturn {
  startCoordination: (request: TeamCoordinationRequest) => Promise<void>;
  coordinationResult: CoordinationResult | null;
  isCoordinating: boolean;
  coordinationHistory: any[];
  error: string | null;
}

export const useTeamCoordination = (teamId: string): UseTeamCoordinationReturn => {
  const [coordinationResult, setCoordinationResult] = useState<CoordinationResult | null>(null);
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [coordinationHistory, setCoordinationHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load coordination history on mount
  useEffect(() => {
    loadCoordinationHistory();
  }, [teamId]);

  const loadCoordinationHistory = async () => {
    try {
      const response = await fetch(`/api/twin/phase3/teams/${teamId}/status`);
      if (response.ok) {
        const data = await response.json();
        setCoordinationHistory(data.recent_coordinations || []);
      }
    } catch (err) {
      console.error('Failed to load coordination history:', err);
    }
  };

  const startCoordination = async (request: TeamCoordinationRequest) => {
    setIsCoordinating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/twin/phase3/coordination/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          coordination_type: request.coordinationType,
          target_twins: request.targetTwins,
          parameters: request.parameters,
          goals: request.goals,
          priority: request.priority || 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error(`Coordination failed: ${response.statusText}`);
      }

      const result = await response.json();
      setCoordinationResult(result);
      
      // Reload history to include the new coordination
      await loadCoordinationHistory();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Coordination error:', err);
    } finally {
      setIsCoordinating(false);
    }
  };

  return {
    startCoordination,
    coordinationResult,
    isCoordinating,
    coordinationHistory,
    error
  };
};

// Specialized hooks for specific coordination types
export const useWorkloadBalancing = (teamId: string) => {
  const [result, setResult] = useState<any>(null);
  const [isBalancing, setIsBalancing] = useState(false);

  const balanceWorkload = async (targetTwins: string[], parameters?: any) => {
    setIsBalancing(true);
    
    try {
      const response = await fetch('/api/twin/phase3/coordination/workload-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          target_twins: targetTwins,
          parameters: parameters || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`Workload balancing failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Workload balancing error:', err);
      throw err;
    } finally {
      setIsBalancing(false);
    }
  };

  return {
    balanceWorkload,
    result,
    isBalancing
  };
};

export const useSkillOptimization = (teamId: string) => {
  const [result, setResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeSkills = async (targetTwins: string[], parameters?: any) => {
    setIsOptimizing(true);
    
    try {
      const response = await fetch('/api/twin/phase3/coordination/skill-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          target_twins: targetTwins,
          parameters: parameters || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`Skill optimization failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Skill optimization error:', err);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizeSkills,
    result,
    isOptimizing
  };
};

export const useMeetingOptimization = (teamId: string) => {
  const [result, setResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeMeetings = async (targetTwins: string[], parameters?: any) => {
    setIsOptimizing(true);
    
    try {
      const response = await fetch('/api/twin/phase3/coordination/meeting-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          target_twins: targetTwins,
          parameters: parameters || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`Meeting optimization failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Meeting optimization error:', err);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizeMeetings,
    result,
    isOptimizing
  };
};

export const useAbsencePlanning = (teamId: string) => {
  const [result, setResult] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const planAbsence = async (targetTwins: string[], absenceInfo: any, coverageRequirements?: string[]) => {
    setIsPlanning(true);
    
    try {
      const response = await fetch('/api/twin/phase3/coordination/absence-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          target_twins: targetTwins,
          absence_info: absenceInfo,
          coverage_requirements: coverageRequirements || []
        }),
      });

      if (!response.ok) {
        throw new Error(`Absence planning failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('Absence planning error:', err);
      throw err;
    } finally {
      setIsPlanning(false);
    }
  };

  return {
    planAbsence,
    result,
    isPlanning
  };
};