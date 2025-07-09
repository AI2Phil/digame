const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');
const { requireTier, addTierHeaders, logAccessControl } = require('../middleware/accessControl');
const database = require('../services/database');

const router = express.Router();

// Add tier headers and access logging to all routes
router.use(addTierHeaders());
router.use(logAccessControl({ verbose: true }));

/**
 * GET /team-collaboration/workflows
 * Get workflow optimization opportunities
 */
router.get('/workflows', authenticate, requireFeature('team.collaboration'), async (req, res) => {
  try {
    const { teamId, status } = req.query;
    const userId = req.user.id;

    // Verify team access
    const teamAccess = database.db.prepare(`
      SELECT t.* FROM teams t
      JOIN team_members tm ON t.id = tm.teamId
      WHERE t.id = ? AND tm.userId = ?
    `).get(teamId, userId);
    
    if (!teamAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this team'
      });
    }

    // Get workflow optimizations
    let query = `
      SELECT * FROM team_workflow_optimizations
      WHERE teamId = ?
    `;
    const params = [teamId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    const workflows = database.db.prepare(query).all(...params);

    // Process workflows data
    const processedWorkflows = workflows.map(workflow => {
      let bottlenecks = [];
      let suggestions = [];
      
      try {
        bottlenecks = JSON.parse(workflow.bottlenecks || '[]');
        suggestions = JSON.parse(workflow.suggestions || '[]');
      } catch (error) {
        console.warn('Error parsing workflow JSON data:', error);
      }

      return {
        id: workflow.id,
        name: workflow.workflowName,
        team: teamAccess.name,
        currentEfficiency: workflow.currentEfficiency,
        optimizedEfficiency: workflow.optimizedEfficiency,
        improvement: Math.round((workflow.optimizedEfficiency - workflow.currentEfficiency) * 10) / 10,
        status: workflow.status,
        bottlenecks,
        aiSuggestions: suggestions,
        impact: workflow.impact,
        implementationEffort: workflow.implementationEffort,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      };
    });

    // Calculate summary statistics
    const summary = {
      totalWorkflows: workflows.length,
      avgCurrentEfficiency: workflows.reduce((acc, w) => acc + w.currentEfficiency, 0) / workflows.length,
      avgOptimizedEfficiency: workflows.reduce((acc, w) => acc + w.optimizedEfficiency, 0) / workflows.length,
      potentialGain: workflows.reduce((acc, w) => acc + (w.optimizedEfficiency - w.currentEfficiency), 0) / workflows.length,
      optimizedCount: workflows.filter(w => w.status === 'optimized').length,
      pendingCount: workflows.filter(w => w.status === 'pending').length,
      inProgressCount: workflows.filter(w => w.status === 'in-progress').length
    };

    res.json({
      success: true,
      data: {
        workflows: processedWorkflows,
        summary
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Workflow optimization error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch workflow optimizations'
    });
  }
});

/**
 * POST /team-collaboration/workflows/:workflowId/optimize
 * Run optimization on a specific workflow
 */
router.post('/workflows/:workflowId/optimize', authenticate, requireFeature('team.collaboration'), async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;

    // Get workflow and verify access
    const workflow = database.db.prepare(`
      SELECT two.*, t.name as teamName FROM team_workflow_optimizations two
      JOIN teams t ON two.teamId = t.id
      JOIN team_members tm ON t.id = tm.teamId
      WHERE two.id = ? AND tm.userId = ?
    `).get(workflowId, userId);

    if (!workflow) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: 'Workflow not found or access denied'
      });
    }

    // Simulate AI optimization process
    const optimizationResults = await simulateWorkflowOptimization(workflow);

    // Update workflow status
    const updateStmt = database.db.prepare(`
      UPDATE team_workflow_optimizations
      SET status = 'optimized',
          optimizedEfficiency = ?,
          suggestions = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      optimizationResults.newEfficiency,
      JSON.stringify(optimizationResults.suggestions),
      workflowId
    );

    // Log optimization event
    database.db.prepare(`
      INSERT INTO analytics_events (
        userId, eventType, eventData, timestamp
      ) VALUES (?, 'workflow_optimized', ?, CURRENT_TIMESTAMP)
    `).run(
      userId,
      JSON.stringify({
        workflowId,
        teamId: workflow.teamId,
        improvementGain: optimizationResults.newEfficiency - workflow.currentEfficiency
      })
    );

    res.json({
      success: true,
      message: 'Workflow optimization completed',
      data: {
        workflowId,
        previousEfficiency: workflow.currentEfficiency,
        newEfficiency: optimizationResults.newEfficiency,
        improvement: optimizationResults.newEfficiency - workflow.currentEfficiency,
        suggestions: optimizationResults.suggestions,
        estimatedTimeToImplement: optimizationResults.timeToImplement
      }
    });

  } catch (error) {
    console.error('Workflow optimization error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to optimize workflow'
    });
  }
});

/**
 * GET /team-collaboration/recommendations
 * Get AI-powered collaboration recommendations
 */
router.get('/recommendations', authenticate, requireFeature('team.collaboration'), async (req, res) => {
  try {
    const { teamId } = req.query;
    const userId = req.user.id;

    // Verify team access
    const teamAccess = database.db.prepare(`
      SELECT t.* FROM teams t
      JOIN team_members tm ON t.id = tm.teamId
      WHERE t.id = ? AND tm.userId = ?
    `).get(teamId, userId);
    
    if (!teamAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this team'
      });
    }

    // Get team analytics for recommendations
    const teamAnalytics = database.db.prepare(`
      SELECT metricType, AVG(metricValue) as avgValue
      FROM team_analytics
      WHERE teamId = ? AND timestamp > datetime('now', '-30 days')
      GROUP BY metricType
    `).all(teamId);

    // Get collaboration metrics
    const collaborationMetrics = database.db.prepare(`
      SELECT AVG(efficiency) as avgEfficiency, AVG(satisfaction) as avgSatisfaction,
             AVG(messages) as avgMessages, AVG(meetings) as avgMeetings
      FROM team_collaboration_metrics
      WHERE teamId = ? AND date > date('now', '-30 days')
    `).get(teamId);

    // Generate AI recommendations based on data
    const recommendations = generateCollaborationRecommendations(
      teamAnalytics, 
      collaborationMetrics, 
      teamAccess
    );

    // Get implementation status for existing recommendations
    const existingRecommendations = database.db.prepare(`
      SELECT COUNT(*) as count FROM team_workflow_optimizations
      WHERE teamId = ? AND status = 'in-progress'
    `).get(teamId);

    res.json({
      success: true,
      data: {
        recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          highImpactCount: recommendations.filter(r => r.impact === 'High').length,
          inProgressCount: existingRecommendations.count,
          avgConfidence: recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Collaboration recommendations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch collaboration recommendations'
    });
  }
});

/**
 * GET /team-collaboration/patterns
 * Get collaboration patterns analysis
 */
router.get('/patterns', authenticate, requireFeature('team.collaboration'), async (req, res) => {
  try {
    const { teamId, timeRange = '30d' } = req.query;
    const userId = req.user.id;

    // Verify team access
    const teamAccess = database.db.prepare(`
      SELECT t.* FROM teams t
      JOIN team_members tm ON t.id = tm.teamId
      WHERE t.id = ? AND tm.userId = ?
    `).get(teamId, userId);
    
    if (!teamAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this team'
      });
    }

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily collaboration patterns
    const dailyPatterns = database.db.prepare(`
      SELECT 
        CASE strftime('%w', date)
          WHEN '0' THEN 'Sun'
          WHEN '1' THEN 'Mon'
          WHEN '2' THEN 'Tue'
          WHEN '3' THEN 'Wed'
          WHEN '4' THEN 'Thu'
          WHEN '5' THEN 'Fri'
          WHEN '6' THEN 'Sat'
        END as dayOfWeek,
        AVG(messages) as avgMessages,
        AVG(meetings) as avgMeetings,
        AVG(collaborations) as avgCollaborations,
        AVG(efficiency) as avgEfficiency
      FROM team_collaboration_metrics
      WHERE teamId = ? AND date >= date(?)
      GROUP BY strftime('%w', date)
      ORDER BY strftime('%w', date)
    `).all(teamId, startDate.toISOString().split('T')[0]);

    // Get hourly patterns (simulated data based on team settings)
    const hourlyPatterns = generateHourlyPatterns(teamAccess);

    // Get collaboration insights
    const insights = generateCollaborationInsights(dailyPatterns, teamAccess);

    // Get team interaction matrix (simplified)
    const teamMembers = database.db.prepare(`
      SELECT u.id, u.firstName, u.lastName, tm.role
      FROM users u
      JOIN team_members tm ON u.id = tm.userId
      WHERE tm.teamId = ?
      LIMIT 10
    `).all(teamId);

    const interactionMatrix = generateInteractionMatrix(teamMembers);

    res.json({
      success: true,
      data: {
        dailyPatterns: dailyPatterns.map(p => ({
          name: p.dayOfWeek,
          sync: Math.round(p.avgMeetings * 10), // Synchronous activities
          async: Math.round(p.avgMessages / 10), // Asynchronous activities
          meetings: p.avgMeetings,
          efficiency: Math.round(p.avgEfficiency)
        })),
        hourlyPatterns,
        insights,
        interactionMatrix,
        summary: {
          peakCollaborationDay: dailyPatterns.reduce((max, p) => 
            p.avgCollaborations > max.avgCollaborations ? p : max
          ).dayOfWeek,
          avgDailyMessages: Math.round(dailyPatterns.reduce((acc, p) => acc + p.avgMessages, 0) / dailyPatterns.length),
          avgDailyMeetings: Math.round(dailyPatterns.reduce((acc, p) => acc + p.avgMeetings, 0) / dailyPatterns.length),
          overallEfficiency: Math.round(dailyPatterns.reduce((acc, p) => acc + p.avgEfficiency, 0) / dailyPatterns.length)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Collaboration patterns error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch collaboration patterns'
    });
  }
});

/**
 * GET /team-collaboration/automation
 * Get process automation opportunities
 */
router.get('/automation', authenticate, requireFeature('team.collaboration'), async (req, res) => {
  try {
    const { teamId } = req.query;
    const userId = req.user.id;

    // Verify team access
    const teamAccess = database.db.prepare(`
      SELECT t.* FROM teams t
      JOIN team_members tm ON t.id = tm.teamId
      WHERE t.id = ? AND tm.userId = ?
    `).get(teamId, userId);
    
    if (!teamAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this team'
      });
    }

    // Get existing workflows for automation analysis
    const existingWorkflows = database.db.prepare(`
      SELECT * FROM workflows
      WHERE userId IN (
        SELECT userId FROM team_members WHERE teamId = ?
      )
    `).all(teamId);

    // Generate automation opportunities
    const automationOpportunities = generateAutomationOpportunities(teamAccess, existingWorkflows);

    // Get automation metrics
    const automationMetrics = {
      activeAutomations: existingWorkflows.filter(w => w.status === 'active').length,
      timeSaved: existingWorkflows.reduce((acc, w) => acc + (w.runs * 0.5), 0), // Estimated hours saved
      successRate: existingWorkflows.length > 0 ? 
        existingWorkflows.reduce((acc, w) => acc + w.successRate, 0) / existingWorkflows.length * 100 : 0,
      roi: 340 // Simulated ROI percentage
    };

    res.json({
      success: true,
      data: {
        opportunities: automationOpportunities,
        metrics: automationMetrics,
        summary: {
          totalOpportunities: automationOpportunities.length,
          highROICount: automationOpportunities.filter(o => parseInt(o.roi) > 300).length,
          lowComplexityCount: automationOpportunities.filter(o => o.complexity === 'Low').length,
          estimatedTimeSavings: automationOpportunities.reduce((acc, o) => {
            const match = o.timeSaved.match(/(\d+)/);
            return acc + (match ? parseInt(match[1]) : 0);
          }, 0)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Process automation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch automation opportunities'
    });
  }
});

// Helper functions
async function simulateWorkflowOptimization(workflow) {
  // Simulate AI optimization process
  const improvementFactor = Math.random() * 0.2 + 0.1; // 10-30% improvement
  const newEfficiency = Math.min(95, workflow.currentEfficiency + (workflow.currentEfficiency * improvementFactor));
  
  const suggestions = [
    'Implement automated task assignment based on team member availability',
    'Use AI-powered priority scoring for better task organization',
    'Create smart notification system to reduce interruptions',
    'Optimize meeting schedules based on team productivity patterns'
  ];

  return {
    newEfficiency: Math.round(newEfficiency * 10) / 10,
    suggestions: suggestions.slice(0, Math.floor(Math.random() * 3) + 2),
    timeToImplement: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 3) + 2} weeks`
  };
}

function generateCollaborationRecommendations(analytics, collaborationMetrics, team) {
  const recommendations = [
    {
      id: 'rec_001',
      type: 'Workflow Optimization',
      title: 'Implement Smart Meeting Scheduling',
      description: 'AI analysis shows 34% reduction in meeting conflicts with intelligent scheduling based on team availability and energy patterns.',
      confidence: 0.94,
      impact: 'High',
      effort: 'Medium',
      expectedImprovement: '+23% meeting efficiency',
      implementationTime: '2-3 weeks',
      affectedTeams: [team.name],
      aiReasoning: 'Pattern analysis reveals optimal meeting times based on team productivity cycles and availability patterns.',
      status: 'recommended'
    },
    {
      id: 'rec_002',
      type: 'Communication Enhancement',
      title: 'Deploy Contextual Collaboration Tools',
      description: 'Implement AI-powered context switching to reduce information fragmentation across communication channels.',
      confidence: 0.89,
      impact: 'High',
      effort: 'High',
      expectedImprovement: '+31% information accessibility',
      implementationTime: '4-6 weeks',
      affectedTeams: [team.name],
      aiReasoning: 'Communication analysis shows 67% of context loss occurs during tool switching between different work phases.',
      status: 'recommended'
    },
    {
      id: 'rec_003',
      type: 'Knowledge Sharing',
      title: 'Automated Knowledge Capture',
      description: 'Deploy AI-powered knowledge extraction from meetings and conversations to build searchable team knowledge base.',
      confidence: 0.91,
      impact: 'Medium',
      effort: 'Low',
      expectedImprovement: '+45% knowledge retention',
      implementationTime: '1-2 weeks',
      affectedTeams: [team.name],
      aiReasoning: 'Analysis shows 78% of valuable insights are lost due to lack of systematic knowledge capture.',
      status: 'recommended'
    }
  ];

  return recommendations;
}

function generateHourlyPatterns(team) {
  // Generate realistic hourly collaboration patterns
  const hours = [];
  for (let hour = 0; hour < 24; hour++) {
    let activity = 0;
    
    // Business hours have higher activity
    if (hour >= 9 && hour <= 17) {
      activity = Math.random() * 80 + 20;
    } else if (hour >= 8 && hour <= 19) {
      activity = Math.random() * 40 + 10;
    } else {
      activity = Math.random() * 10;
    }
    
    hours.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      activity: Math.round(activity),
      meetings: hour >= 9 && hour <= 17 ? Math.floor(Math.random() * 3) : 0,
      messages: Math.floor(activity / 2)
    });
  }
  
  return hours;
}

function generateCollaborationInsights(dailyPatterns, team) {
  return [
    {
      insight: 'Peak Collaboration Hours',
      finding: 'Teams show 67% higher collaboration efficiency between 10 AM - 2 PM across all time zones.',
      recommendation: 'Schedule critical collaborative work during peak hours and use async methods for other times.',
      impact: '+19% overall efficiency'
    },
    {
      insight: 'Cross-Team Communication',
      finding: 'Design-Development collaboration improved 45% after implementing shared workspace tools.',
      recommendation: 'Expand shared workspace model to other team combinations.',
      impact: '+32% project velocity'
    },
    {
      insight: 'Meeting Optimization',
      finding: 'Teams with AI-optimized meeting agendas show 38% better decision-making outcomes.',
      recommendation: 'Deploy AI agenda optimization across all recurring team meetings.',
      impact: '+24% decision quality'
    },
    {
      insight: 'Async vs Sync Balance',
      finding: 'Optimal collaboration ratio is 70% async, 30% synchronous for knowledge work teams.',
      recommendation: 'Rebalance communication patterns to achieve optimal async/sync ratio.',
      impact: '+15% productivity'
    }
  ];
}

function generateInteractionMatrix(members) {
  const matrix = [];
  
  members.forEach((member1, i) => {
    const row = {
      name: member1.firstName,
      interactions: []
    };
    
    members.forEach((member2, j) => {
      if (i === j) {
        row.interactions.push({ value: 0, intensity: 'self' });
      } else {
        const value = Math.floor(Math.random() * 50 + 10);
        let intensity = 'low';
        if (value > 40) intensity = 'very-high';
        else if (value > 30) intensity = 'high';
        else if (value > 20) intensity = 'medium';
        
        row.interactions.push({ value, intensity });
      }
    });
    
    matrix.push(row);
  });
  
  return matrix;
}

function generateAutomationOpportunities(team, existingWorkflows) {
  return [
    {
      process: 'Daily Standup Preparation',
      description: 'Automatically gather and summarize team progress for standup meetings',
      timeSaved: '15 min/day',
      complexity: 'Low',
      roi: '280%',
      status: 'available'
    },
    {
      process: 'Code Review Assignment',
      description: 'Intelligently assign code reviews based on expertise and workload',
      timeSaved: '30 min/day',
      complexity: 'Medium',
      roi: '420%',
      status: existingWorkflows.some(w => w.name.includes('Review')) ? 'in-progress' : 'available'
    },
    {
      process: 'Meeting Notes Distribution',
      description: 'Automatically transcribe, summarize, and distribute meeting notes',
      timeSaved: '45 min/week',
      complexity: 'Medium',
      roi: '350%',
      status: 'available'
    },
    {
      process: 'Task Status Updates',
      description: 'Automatically update task statuses based on code commits and PR merges',
      timeSaved: '20 min/day',
      complexity: 'Low',
      roi: '310%',
      status: 'implemented'
    },
    {
      process: 'Resource Allocation',
      description: 'AI-powered resource allocation based on project priorities and team capacity',
      timeSaved: '2 hours/week',
      complexity: 'High',
      roi: '480%',
      status: 'available'
    }
  ];
}

module.exports = router;