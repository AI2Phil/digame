"""
Simulation Engine - Basic simulation capabilities for digital twin scenario testing
Implements schedule optimization and scenario simulation for Phase 1C
"""

import asyncio
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)

class SimulationType(str, Enum):
    SCHEDULE_OPTIMIZATION = "schedule_optimization"
    PRODUCTIVITY_SCENARIO = "productivity_scenario"
    WORKLOAD_ANALYSIS = "workload_analysis"
    ENERGY_MANAGEMENT = "energy_management"

@dataclass
class SimulationParameters:
    """Parameters for running simulations"""
    simulation_type: SimulationType
    time_horizon: int  # days
    optimization_target: str  # productivity, efficiency, balance
    constraints: Dict[str, Any]
    variables: Dict[str, Any]

@dataclass
class SimulationResult:
    """Results from a simulation run"""
    simulation_id: str
    simulation_type: SimulationType
    parameters: SimulationParameters
    results: Dict[str, Any]
    metrics: Dict[str, float]
    recommendations: List[Dict[str, Any]]
    confidence_score: float
    execution_time_ms: int
    created_at: datetime

class ScheduleOptimizer:
    """Schedule optimization component"""
    
    def __init__(self):
        self.optimization_algorithms = {
            'productivity': self._optimize_for_productivity,
            'efficiency': self._optimize_for_efficiency,
            'balance': self._optimize_for_balance
        }
    
    async def schedule_optimization(self, parameters: SimulationParameters) -> Dict[str, Any]:
        """
        Optimize schedule based on parameters and constraints
        
        Args:
            parameters: Simulation parameters including constraints and targets
            
        Returns:
            Optimized schedule with recommendations
        """
        try:
            # Extract schedule data and constraints
            current_schedule = parameters.variables.get('current_schedule', [])
            work_hours = parameters.constraints.get('work_hours', {'start': 9, 'end': 17})
            break_preferences = parameters.constraints.get('breaks', {'duration': 15, 'frequency': 2})
            energy_patterns = parameters.variables.get('energy_patterns', {})
            
            # Run optimization algorithm
            optimizer = self.optimization_algorithms.get(
                parameters.optimization_target, 
                self._optimize_for_productivity
            )
            
            optimized_schedule = await optimizer(
                current_schedule, 
                work_hours, 
                break_preferences, 
                energy_patterns,
                parameters.time_horizon
            )
            
            # Calculate improvement metrics
            metrics = self._calculate_schedule_metrics(current_schedule, optimized_schedule)
            
            # Generate recommendations
            recommendations = self._generate_schedule_recommendations(
                optimized_schedule, 
                metrics,
                parameters.optimization_target
            )
            
            return {
                'optimized_schedule': optimized_schedule,
                'metrics': metrics,
                'recommendations': recommendations,
                'improvement_percentage': metrics.get('improvement', 0)
            }
            
        except Exception as e:
            logger.error(f"Schedule optimization failed: {str(e)}")
            raise
    
    async def _optimize_for_productivity(self, current_schedule: List[Dict], work_hours: Dict, 
                                       breaks: Dict, energy_patterns: Dict, horizon: int) -> List[Dict]:
        """Optimize schedule for maximum productivity"""
        optimized = []
        
        # Get peak energy hours (default to morning if no data)
        peak_hours = energy_patterns.get('peak_hours', [9, 10, 11])
        
        for day in range(horizon):
            daily_schedule = []
            current_hour = work_hours['start']
            
            # Schedule high-priority tasks during peak hours
            for hour in range(work_hours['start'], work_hours['end']):
                if hour in peak_hours:
                    task_type = 'high_priority'
                    productivity_multiplier = 1.3
                elif hour in range(14, 16):  # Post-lunch dip
                    task_type = 'low_priority'
                    productivity_multiplier = 0.8
                else:
                    task_type = 'medium_priority'
                    productivity_multiplier = 1.0
                
                # Add breaks
                if (hour - work_hours['start']) % (breaks['frequency'] + 1) == breaks['frequency']:
                    daily_schedule.append({
                        'time': f"{hour:02d}:00",
                        'type': 'break',
                        'duration': breaks['duration'],
                        'description': f"{breaks['duration']}-minute break"
                    })
                
                daily_schedule.append({
                    'time': f"{hour:02d}:00",
                    'type': task_type,
                    'duration': 60 - (breaks['duration'] if hour % (breaks['frequency'] + 1) == 0 else 0),
                    'productivity_multiplier': productivity_multiplier,
                    'description': f"{task_type.replace('_', ' ').title()} work block"
                })
            
            optimized.append({
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'schedule': daily_schedule
            })
        
        return optimized
    
    async def _optimize_for_efficiency(self, current_schedule: List[Dict], work_hours: Dict, 
                                     breaks: Dict, energy_patterns: Dict, horizon: int) -> List[Dict]:
        """Optimize schedule for maximum efficiency"""
        # Similar to productivity but focuses on minimizing context switching
        optimized = []
        
        for day in range(horizon):
            daily_schedule = []
            
            # Group similar tasks together
            morning_block = {
                'time': f"{work_hours['start']:02d}:00",
                'type': 'focused_work',
                'duration': 120,  # 2-hour focused block
                'description': 'Deep work session - similar tasks grouped'
            }
            
            break_block = {
                'time': f"{work_hours['start'] + 2:02d}:00",
                'type': 'break',
                'duration': 30,
                'description': 'Extended break for mental reset'
            }
            
            afternoon_block = {
                'time': f"{work_hours['start'] + 3:02d}:00",
                'type': 'collaborative_work',
                'duration': 180,  # 3-hour collaborative block
                'description': 'Meetings and collaborative tasks'
            }
            
            daily_schedule = [morning_block, break_block, afternoon_block]
            
            optimized.append({
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'schedule': daily_schedule
            })
        
        return optimized
    
    async def _optimize_for_balance(self, current_schedule: List[Dict], work_hours: Dict, 
                                  breaks: Dict, energy_patterns: Dict, horizon: int) -> List[Dict]:
        """Optimize schedule for work-life balance"""
        optimized = []
        
        for day in range(horizon):
            daily_schedule = []
            
            # Shorter work blocks with more breaks
            work_duration = work_hours['end'] - work_hours['start']
            block_duration = 90  # 90-minute work blocks
            break_duration = 20  # 20-minute breaks
            
            current_time = work_hours['start']
            while current_time < work_hours['end']:
                # Work block
                if current_time + (block_duration / 60) <= work_hours['end']:
                    daily_schedule.append({
                        'time': f"{current_time:02d}:00",
                        'type': 'balanced_work',
                        'duration': block_duration,
                        'description': f"{block_duration}-minute focused work block"
                    })
                    current_time += block_duration / 60
                
                # Break block
                if current_time + (break_duration / 60) <= work_hours['end']:
                    daily_schedule.append({
                        'time': f"{current_time:02d}:00",
                        'type': 'break',
                        'duration': break_duration,
                        'description': f"{break_duration}-minute wellness break"
                    })
                    current_time += break_duration / 60
                else:
                    break
            
            optimized.append({
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'schedule': daily_schedule
            })
        
        return optimized
    
    def _calculate_schedule_metrics(self, current: List[Dict], optimized: List[Dict]) -> Dict[str, float]:
        """Calculate metrics comparing current vs optimized schedule"""
        # Simplified metrics calculation
        current_productivity = len(current) * 0.7 if current else 0.5  # Baseline
        optimized_productivity = len(optimized) * 0.85  # Optimized assumption
        
        improvement = ((optimized_productivity - current_productivity) / max(current_productivity, 0.1)) * 100
        
        return {
            'current_productivity_score': current_productivity,
            'optimized_productivity_score': optimized_productivity,
            'improvement': max(0.0, improvement),
            'efficiency_gain': 15.0,  # Estimated efficiency gain
            'stress_reduction': 20.0,  # Estimated stress reduction
            'focus_time_increase': 25.0  # Estimated focus time increase
        }
    
    def _generate_schedule_recommendations(self, schedule: List[Dict], metrics: Dict[str, float], 
                                         target: str) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on optimized schedule"""
        recommendations = []
        
        if target == 'productivity':
            recommendations.extend([
                {
                    'type': 'schedule_adjustment',
                    'title': 'Optimize Peak Hours',
                    'description': 'Schedule your most important tasks during 9-11 AM when your energy is highest.',
                    'priority': 'high',
                    'impact': 'high'
                },
                {
                    'type': 'break_optimization',
                    'title': 'Strategic Breaks',
                    'description': 'Take 15-minute breaks every 2 hours to maintain peak performance.',
                    'priority': 'medium',
                    'impact': 'medium'
                }
            ])
        
        elif target == 'efficiency':
            recommendations.extend([
                {
                    'type': 'task_grouping',
                    'title': 'Batch Similar Tasks',
                    'description': 'Group similar tasks together to reduce context switching overhead.',
                    'priority': 'high',
                    'impact': 'high'
                },
                {
                    'type': 'communication_blocks',
                    'title': 'Dedicated Communication Time',
                    'description': 'Set specific times for emails and meetings to avoid interruptions.',
                    'priority': 'medium',
                    'impact': 'medium'
                }
            ])
        
        elif target == 'balance':
            recommendations.extend([
                {
                    'type': 'work_life_balance',
                    'title': 'Shorter Work Blocks',
                    'description': 'Use 90-minute work blocks with 20-minute breaks for better balance.',
                    'priority': 'high',
                    'impact': 'high'
                },
                {
                    'type': 'wellness_integration',
                    'title': 'Wellness Breaks',
                    'description': 'Include mindfulness or physical activity in your break times.',
                    'priority': 'medium',
                    'impact': 'medium'
                }
            ])
        
        # Add general recommendations
        if metrics.get('improvement', 0) > 10:
            recommendations.append({
                'type': 'implementation',
                'title': 'Gradual Implementation',
                'description': f'Implement changes gradually to achieve {metrics["improvement"]:.1f}% improvement.',
                'priority': 'low',
                'impact': 'high'
            })
        
        return recommendations

class SimulationEngine:
    """
    Main simulation engine for digital twin scenario testing
    """
    
    def __init__(self):
        self.schedule_optimizer = ScheduleOptimizer()
        self.simulation_cache = {}
        
    async def run_simulation(self, parameters: SimulationParameters) -> SimulationResult:
        """
        Run a simulation based on the provided parameters
        
        Args:
            parameters: Simulation parameters and configuration
            
        Returns:
            SimulationResult with outcomes and recommendations
        """
        start_time = datetime.now()
        simulation_id = f"sim_{int(start_time.timestamp())}"
        
        try:
            # Route to appropriate simulation type
            if parameters.simulation_type == SimulationType.SCHEDULE_OPTIMIZATION:
                results = await self.schedule_optimizer.schedule_optimization(parameters)
                confidence_score = 0.85
                
            elif parameters.simulation_type == SimulationType.PRODUCTIVITY_SCENARIO:
                results = await self._run_productivity_scenario(parameters)
                confidence_score = 0.75
                
            elif parameters.simulation_type == SimulationType.WORKLOAD_ANALYSIS:
                results = await self._run_workload_analysis(parameters)
                confidence_score = 0.80
                
            elif parameters.simulation_type == SimulationType.ENERGY_MANAGEMENT:
                results = await self._run_energy_management(parameters)
                confidence_score = 0.70
                
            else:
                raise ValueError(f"Unsupported simulation type: {parameters.simulation_type}")
            
            # Calculate execution time
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Create simulation result
            simulation_result = SimulationResult(
                simulation_id=simulation_id,
                simulation_type=parameters.simulation_type,
                parameters=parameters,
                results=results,
                metrics=results.get('metrics', {}),
                recommendations=results.get('recommendations', []),
                confidence_score=confidence_score,
                execution_time_ms=execution_time,
                created_at=start_time
            )
            
            # Cache result
            self.simulation_cache[simulation_id] = simulation_result
            
            logger.info(f"Simulation {simulation_id} completed in {execution_time}ms")
            return simulation_result
            
        except Exception as e:
            logger.error(f"Simulation {simulation_id} failed: {str(e)}")
            raise
    
    async def _run_productivity_scenario(self, parameters: SimulationParameters) -> Dict[str, Any]:
        """Run productivity scenario simulation"""
        # Simulate different productivity scenarios
        scenarios = parameters.variables.get('scenarios', ['baseline', 'optimized', 'stressed'])
        results = {}
        
        for scenario in scenarios:
            if scenario == 'baseline':
                productivity_score = 70
                task_completion = 75
                stress_level = 50
            elif scenario == 'optimized':
                productivity_score = 85
                task_completion = 90
                stress_level = 30
            elif scenario == 'stressed':
                productivity_score = 45
                task_completion = 60
                stress_level = 80
            else:
                productivity_score = 65
                task_completion = 70
                stress_level = 55
            
            results[scenario] = {
                'productivity_score': productivity_score,
                'task_completion_rate': task_completion,
                'stress_level': stress_level,
                'focus_time': productivity_score * 0.8,
                'interruptions': max(1, 10 - (productivity_score // 10))
            }
        
        # Generate comparison metrics
        baseline = results.get('baseline', results[list(results.keys())[0]])
        best_scenario = max(results.keys(), key=lambda k: results[k]['productivity_score'])
        
        best_score = results[best_scenario].get('productivity_score', 0)
        baseline_score = baseline.get('productivity_score', 0) if baseline else 0
        best_stress = results[best_scenario].get('stress_level', 0)
        baseline_stress = baseline.get('stress_level', 0) if baseline else 0
        
        metrics = {
            'best_scenario': best_scenario,
            'max_improvement': best_score - baseline_score,
            'stress_reduction': baseline_stress - best_stress
        }
        
        recommendations = [
            {
                'type': 'scenario_optimization',
                'title': f'Adopt {best_scenario.title()} Approach',
                'description': f'The {best_scenario} scenario shows {metrics["max_improvement"]:.1f}% productivity improvement.',
                'priority': 'high',
                'impact': 'high'
            }
        ]
        
        return {
            'scenario_results': results,
            'metrics': metrics,
            'recommendations': recommendations
        }
    
    async def _run_workload_analysis(self, parameters: SimulationParameters) -> Dict[str, Any]:
        """Run workload analysis simulation"""
        current_workload = parameters.variables.get('current_workload', 100)
        capacity = parameters.variables.get('capacity', 120)
        
        # Analyze different workload levels
        workload_scenarios = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2]
        analysis_results = {}
        
        for multiplier in workload_scenarios:
            test_workload = current_workload * multiplier
            utilization = min(100, (test_workload / capacity) * 100)
            
            if utilization <= 70:
                efficiency = 95
                quality = 90
                stress = 20
            elif utilization <= 85:
                efficiency = 90
                quality = 85
                stress = 40
            elif utilization <= 100:
                efficiency = 80
                quality = 75
                stress = 70
            else:
                efficiency = 60
                quality = 60
                stress = 90
            
            analysis_results[f"{int(multiplier * 100)}%"] = {
                'workload': test_workload,
                'utilization': utilization,
                'efficiency': efficiency,
                'quality': quality,
                'stress_level': stress
            }
        
        # Find optimal workload
        optimal = max(analysis_results.items(), 
                     key=lambda x: x[1]['efficiency'] * x[1]['quality'] / max(x[1]['stress_level'], 1))
        
        metrics = {
            'optimal_workload': optimal[0],
            'current_utilization': (current_workload / capacity) * 100,
            'recommended_adjustment': optimal[1]['workload'] - current_workload
        }
        
        recommendations = [
            {
                'type': 'workload_optimization',
                'title': 'Optimize Workload Distribution',
                'description': f'Adjust workload to {optimal[0]} for optimal efficiency and quality.',
                'priority': 'high',
                'impact': 'high'
            }
        ]
        
        return {
            'workload_analysis': analysis_results,
            'optimal_scenario': optimal[1],
            'metrics': metrics,
            'recommendations': recommendations
        }
    
    async def _run_energy_management(self, parameters: SimulationParameters) -> Dict[str, Any]:
        """Run energy management simulation"""
        energy_patterns = parameters.variables.get('energy_patterns', {
            'morning': 80,
            'afternoon': 60,
            'evening': 40
        })
        
        # Simulate energy optimization strategies
        strategies = {
            'current': energy_patterns,
            'optimized_breaks': {k: min(100, v * 1.15) for k, v in energy_patterns.items()},
            'task_alignment': {k: min(100, v * 1.25) for k, v in energy_patterns.items()},
            'wellness_focused': {k: min(100, v * 1.35) for k, v in energy_patterns.items()}
        }
        
        # Calculate productivity impact
        results = {}
        for strategy, energy_levels in strategies.items():
            avg_energy = sum(energy_levels.values()) / len(energy_levels)
            productivity_impact = (avg_energy / 100) * 85  # Max productivity of 85
            
            results[strategy] = {
                'energy_levels': energy_levels,
                'average_energy': avg_energy,
                'productivity_impact': productivity_impact,
                'sustainability_score': min(100.0, avg_energy * 1.1)
            }
        
        best_strategy = max(results.keys(), key=lambda k: results[k]['productivity_impact'])
        
        metrics = {
            'best_strategy': best_strategy,
            'energy_improvement': results[best_strategy]['average_energy'] - results['current']['average_energy'],
            'productivity_gain': results[best_strategy]['productivity_impact'] - results['current']['productivity_impact']
        }
        
        recommendations = [
            {
                'type': 'energy_optimization',
                'title': f'Implement {best_strategy.replace("_", " ").title()} Strategy',
                'description': f'This approach can improve your energy levels by {metrics["energy_improvement"]:.1f}%.',
                'priority': 'high',
                'impact': 'high'
            }
        ]
        
        return {
            'energy_strategies': results,
            'metrics': metrics,
            'recommendations': recommendations
        }
    
    def get_simulation_result(self, simulation_id: str) -> Optional[SimulationResult]:
        """Retrieve a cached simulation result"""
        return self.simulation_cache.get(simulation_id)
    
    def list_simulations(self) -> List[str]:
        """List all cached simulation IDs"""
        return list(self.simulation_cache.keys())
    
    def clear_cache(self) -> None:
        """Clear the simulation cache"""
        self.simulation_cache.clear()
        logger.info("Simulation cache cleared")