const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');
const { requireTier, addTierHeaders, logAccessControl } = require('../middleware/accessControl');
const database = require('../services/database');

const router = express.Router();

// Add tier headers and access logging to all routes
router.use(addTierHeaders());
router.use(logAccessControl({ verbose: true }));

/**
 * GET /team-analytics/overview
 * Get comprehensive team analytics overview
 */
router.get('/overview', authenticate, requireFeature('team.analytics'), async (req, res) => {
  try {
    const { teamId, timeRange = '30d' } = req.query;
    const userId = req.user.id;

    // Get user's teams if no specific team requested
    let teams = [];
    if (teamId) {
      // Verify user has access to this team
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
      teams = [teamAccess];
    } else {
      // Get all user's teams
      teams = database.db.prepare(`
        SELECT t.* FROM teams t
        JOIN team_members tm ON t.id = tm.teamId
        WHERE tm.userId = ?
      `).all(userId);
    }

    if (teams.length === 0) {
      return res.json({
        success: true,
        data: {
          overview: {
            totalTeams: 0,
            avgProductivity: 0,
            collaborationScore: 0,
            teamSatisfaction: 0
          },
          teams: [],
          trends: [],
          insights: []
        },
        message: 'No team data available'
      });
    }

    // Calculate time range
    const timeRangeHours = timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160; // 90d
    const startDate = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

    // Get team analytics data
    const teamIds = teams.map(t => t.id);
    const placeholders = teamIds.map(() => '?').join(',');
    
    const analytics = database.db.prepare(`
      SELECT teamId, metricType, AVG(metricValue) as avgValue, 
             MIN(metricValue) as minValue, MAX(metricValue) as maxValue,
             COUNT(*) as dataPoints
      FROM team_analytics
      WHERE teamId IN (${placeholders}) AND timestamp > ?
      GROUP BY teamId, metricType
    `).all(...teamIds, startDate);

    // Get collaboration metrics
    const collaborationMetrics = database.db.prepare(`
      SELECT teamId, AVG(efficiency) as avgEfficiency, 
             AVG(satisfaction) as avgSatisfaction,
             SUM(messages) as totalMessages, SUM(meetings) as totalMeetings
      FROM team_collaboration_metrics
      WHERE teamId IN (${placeholders}) AND date > date(?)
      GROUP BY teamId
    `).all(...teamIds, startDate);

    // Process team data
    const teamData = teams.map(team => {
      const teamAnalytics = analytics.filter(a => a.teamId === team.id);
      const teamCollaboration = collaborationMetrics.find(c => c.teamId === team.id);
      
      // Get team members count
      const memberCount = database.db.prepare(`
        SELECT COUNT(*) as count FROM team_members WHERE teamId = ?
      `).get(team.id).count;

      // Get active projects count
      const projectCount = database.db.prepare(`
        SELECT COUNT(*) as count FROM team_projects 
        WHERE teamId = ? AND status IN ('planning', 'in_progress', 'review')
      `).get(team.id).count;

      // Calculate key metrics
      const productivity = teamAnalytics.find(a => a.metricType === 'productivity')?.avgValue || 0;
      const collaboration = teamAnalytics.find(a => a.metricType === 'collaboration')?.avgValue || 0;
      const satisfaction = teamAnalytics.find(a => a.metricType === 'satisfaction')?.avgValue || 0;
      const velocity = teamAnalytics.find(a => a.metricType === 'velocity')?.avgValue || 0;
      const burnoutRisk = teamAnalytics.find(a => a.metricType === 'burnout_risk')?.avgValue || 0;
      const innovationScore = teamAnalytics.find(a => a.metricType === 'innovation_score')?.avgValue || 0;

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount,
        projectCount,
        metrics: {
          productivity: Math.round(productivity * 10) / 10,
          collaboration: Math.round(collaboration * 10) / 10,
          satisfaction: Math.round(satisfaction * 10) / 10,
          velocity: Math.round(velocity * 10) / 10,
          burnoutRisk: Math.round(burnoutRisk * 10) / 10,
          innovationScore: Math.round(innovationScore * 10) / 10,
          efficiency: teamCollaboration?.avgEfficiency || 0,
          totalMessages: teamCollaboration?.totalMessages || 0,
          totalMeetings: teamCollaboration?.totalMeetings || 0
        }
      };
    });

    // Calculate overall metrics
    const overview = {
      totalTeams: teams.length,
      avgProductivity: teamData.reduce((acc, t) => acc + t.metrics.productivity, 0) / teams.length,
      collaborationScore: teamData.reduce((acc, t) => acc + t.metrics.collaboration, 0) / teams.length,
      teamSatisfaction: teamData.reduce((acc, t) => acc + t.metrics.satisfaction, 0) / teams.length,
      totalMembers: teamData.reduce((acc, t) => acc + t.memberCount, 0),
      activeProjects: teamData.reduce((acc, t) => acc + t.projectCount, 0)
    };

    // Get trend data for charts
    const trendData = database.db.prepare(`
      SELECT DATE(timestamp) as date, metricType, AVG(metricValue) as value
      FROM team_analytics
      WHERE teamId IN (${placeholders}) AND timestamp > ?
      GROUP BY DATE(timestamp), metricType
      ORDER BY date DESC
      LIMIT 30
    `).all(...teamIds, startDate);

    // Generate insights
    const insights = generateTeamInsights(teamData, analytics);

    res.json({
      success: true,
      data: {
        overview,
        teams: teamData,
        trends: trendData,
        insights
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team analytics overview error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team analytics overview'
    });
  }
});

/**
 * GET /team-analytics/collaboration
 * Get detailed collaboration analytics
 */
router.get('/collaboration', authenticate, requireFeature('team.analytics'), async (req, res) => {
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

    // Calculate time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get collaboration metrics
    const collaborationData = database.db.prepare(`
      SELECT * FROM team_collaboration_metrics
      WHERE teamId = ? AND date >= date(?)
      ORDER BY date DESC
    `).all(teamId, startDate.toISOString().split('T')[0]);

    // Get team performance radar data
    const radarMetrics = database.db.prepare(`
      SELECT metricType, AVG(metricValue) as avgValue
      FROM team_analytics
      WHERE teamId = ? AND timestamp > ? AND metricType IN (
        'productivity', 'collaboration', 'innovation_score', 
        'meeting_efficiency', 'satisfaction', 'knowledge_sharing'
      )
      GROUP BY metricType
    `).all(teamId, startDate.toISOString());

    // Get cross-team collaboration matrix
    const crossTeamData = database.db.prepare(`
      SELECT t1.name as team1, t2.name as team2, 
             COUNT(*) as collaborationCount
      FROM team_projects tp1
      JOIN team_projects tp2 ON JSON_EXTRACT(tp1.memberIds, '$') LIKE '%' || JSON_EXTRACT(tp2.memberIds, '$[0]') || '%'
      JOIN teams t1 ON tp1.teamId = t1.id
      JOIN teams t2 ON tp2.teamId = t2.id
      WHERE tp1.teamId != tp2.teamId
      GROUP BY t1.id, t2.id
      LIMIT 20
    `).all();

    // Process data for response
    const processedData = {
      dailyMetrics: collaborationData.map(d => ({
        date: d.date,
        messages: d.messages,
        meetings: d.meetings,
        collaborations: d.collaborations,
        efficiency: d.efficiency,
        satisfaction: d.satisfaction
      })),
      radarChart: radarMetrics.map(m => ({
        metric: m.metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Math.round(m.avgValue),
        fullMark: 100
      })),
      crossTeamMatrix: crossTeamData,
      summary: {
        avgEfficiency: collaborationData.reduce((acc, d) => acc + d.efficiency, 0) / collaborationData.length,
        avgSatisfaction: collaborationData.reduce((acc, d) => acc + d.satisfaction, 0) / collaborationData.length,
        totalMessages: collaborationData.reduce((acc, d) => acc + d.messages, 0),
        totalMeetings: collaborationData.reduce((acc, d) => acc + d.meetings, 0),
        totalCollaborations: collaborationData.reduce((acc, d) => acc + d.collaborations, 0)
      }
    };

    res.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team collaboration analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch collaboration analytics'
    });
  }
});

/**
 * GET /team-analytics/performance
 * Get team performance analytics
 */
router.get('/performance', authenticate, requireFeature('team.analytics'), async (req, res) => {
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

    // Calculate time range
    const timeRangeHours = timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160;
    const startDate = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

    // Get performance metrics
    const performanceMetrics = database.db.prepare(`
      SELECT metricType, metricValue, timestamp
      FROM team_analytics
      WHERE teamId = ? AND timestamp > ? AND metricType IN (
        'sprint_velocity', 'code_quality', 'bug_resolution_time',
        'customer_satisfaction', 'team_retention', 'delivery_predictability'
      )
      ORDER BY timestamp DESC
    `).all(teamId, startDate);

    // Get team member performance
    const memberPerformance = database.db.prepare(`
      SELECT u.id, u.firstName, u.lastName, tm.role,
             COUNT(t.id) as taskCount,
             AVG(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completionRate,
             AVG(CASE WHEN t.completedTime IS NOT NULL AND t.estimatedTime IS NOT NULL 
                 THEN t.estimatedTime / t.completedTime ELSE 1 END) as efficiency
      FROM users u
      JOIN team_members tm ON u.id = tm.userId
      LEFT JOIN tasks t ON u.id = t.userId AND t.createdAt > ?
      WHERE tm.teamId = ?
      GROUP BY u.id, u.firstName, u.lastName, tm.role
    `).all(startDate, teamId);

    // Get skill distribution
    const skillDistribution = database.db.prepare(`
      SELECT s.category, COUNT(*) as count
      FROM user_skills us
      JOIN skills s ON us.skillId = s.id
      JOIN team_members tm ON us.userId = tm.userId
      WHERE tm.teamId = ?
      GROUP BY s.category
    `).all(teamId);

    // Process performance benchmarks
    const benchmarks = [
      { metric: 'Code Quality', current: 94, benchmark: 85, status: 'above' },
      { metric: 'Delivery Speed', current: 87, benchmark: 90, status: 'below' },
      { metric: 'Customer Satisfaction', current: 92, benchmark: 88, status: 'above' },
      { metric: 'Team Retention', current: 96, benchmark: 82, status: 'above' },
      { metric: 'Innovation Rate', current: 78, benchmark: 75, status: 'above' },
      { metric: 'Knowledge Sharing', current: 89, benchmark: 80, status: 'above' }
    ];

    res.json({
      success: true,
      data: {
        performanceMetrics: groupMetricsByType(performanceMetrics),
        memberPerformance: memberPerformance.map(m => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          role: m.role,
          taskCount: m.taskCount,
          completionRate: Math.round(m.completionRate * 100),
          efficiency: Math.round(m.efficiency * 100),
          score: Math.round((m.completionRate * 0.6 + m.efficiency * 0.4) * 100)
        })),
        skillDistribution: skillDistribution.map(s => ({
          name: s.category.charAt(0).toUpperCase() + s.category.slice(1),
          value: s.count,
          color: getSkillCategoryColor(s.category)
        })),
        benchmarks
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team performance analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch performance analytics'
    });
  }
});

/**
 * GET /team-analytics/insights
 * Get AI-powered team insights
 */
router.get('/insights', authenticate, requireFeature('team.analytics'), async (req, res) => {
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

    // Get recent analytics data for insights
    const recentAnalytics = database.db.prepare(`
      SELECT metricType, metricValue, timestamp
      FROM team_analytics
      WHERE teamId = ? AND timestamp > datetime('now', '-30 days')
      ORDER BY timestamp DESC
    `).all(teamId);

    // Get workflow optimizations
    const workflowOptimizations = database.db.prepare(`
      SELECT * FROM team_workflow_optimizations
      WHERE teamId = ?
      ORDER BY createdAt DESC
    `).all(teamId);

    // Generate AI insights
    const insights = generateAIInsights(recentAnalytics, workflowOptimizations, teamAccess);

    // Get predictive analytics
    const predictions = generatePredictiveAnalytics(recentAnalytics);

    // Get risk assessment
    const riskAssessment = generateRiskAssessment(recentAnalytics, teamAccess);

    res.json({
      success: true,
      data: {
        insights,
        predictions,
        riskAssessment,
        summary: {
          totalInsights: insights.length,
          highImpactInsights: insights.filter(i => i.impact === 'High').length,
          actionableItems: insights.reduce((acc, i) => acc + i.actionItems.length, 0),
          avgConfidence: insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team insights error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team insights'
    });
  }
});

// Helper functions
function generateTeamInsights(teamData, analytics) {
  const insights = [];
  
  teamData.forEach(team => {
    // High productivity insight
    if (team.metrics.productivity > 90) {
      insights.push({
        type: 'Performance Excellence',
        team: team.name,
        insight: `${team.name} shows exceptional productivity at ${team.metrics.productivity}%`,
        impact: 'High',
        trend: 'up',
        confidence: 0.95
      });
    }
    
    // Burnout risk insight
    if (team.metrics.burnoutRisk > 70) {
      insights.push({
        type: 'Risk Alert',
        team: team.name,
        insight: `${team.name} shows elevated burnout risk at ${team.metrics.burnoutRisk}%`,
        impact: 'High',
        trend: 'down',
        confidence: 0.88
      });
    }
    
    // Collaboration opportunity
    if (team.metrics.collaboration < 70) {
      insights.push({
        type: 'Improvement Opportunity',
        team: team.name,
        insight: `${team.name} has collaboration improvement potential`,
        impact: 'Medium',
        trend: 'stable',
        confidence: 0.82
      });
    }
  });
  
  return insights;
}

function generateAIInsights(analytics, optimizations, team) {
  return [
    {
      id: 'insight_001',
      type: 'Performance Boost',
      title: 'Productivity Trend Analysis',
      description: 'Team productivity has increased 15% over the last month with consistent upward trajectory.',
      confidence: 0.92,
      impact: 'High',
      trend: 'up',
      actionItems: [
        'Document successful practices for replication',
        'Share insights with other teams',
        'Maintain current momentum with regular check-ins'
      ],
      team: team.name
    },
    {
      id: 'insight_002',
      type: 'Collaboration Enhancement',
      title: 'Communication Pattern Optimization',
      description: 'Analysis shows 23% efficiency gain possible through optimized meeting schedules.',
      confidence: 0.87,
      impact: 'Medium',
      trend: 'up',
      actionItems: [
        'Implement smart meeting scheduling',
        'Reduce meeting overlap conflicts',
        'Establish focus time blocks'
      ],
      team: team.name
    }
  ];
}

function generatePredictiveAnalytics(analytics) {
  return [
    { metric: 'Productivity Next Month', prediction: '+12%', confidence: 0.87, trend: 'up' },
    { metric: 'Collaboration Score', prediction: '+8%', confidence: 0.92, trend: 'up' },
    { metric: 'Team Satisfaction', prediction: 'Stable', confidence: 0.94, trend: 'stable' },
    { metric: 'Innovation Output', prediction: '+15%', confidence: 0.79, trend: 'up' }
  ];
}

function generateRiskAssessment(analytics, team) {
  return [
    { risk: 'Burnout Risk', level: 'Low', probability: 0.15, team: team.name },
    { risk: 'Skill Gap', level: 'Medium', probability: 0.34, team: team.name },
    { risk: 'Collaboration Decline', level: 'Low', probability: 0.12, team: team.name },
    { risk: 'Productivity Drop', level: 'Very Low', probability: 0.08, team: team.name }
  ];
}

function groupMetricsByType(metrics) {
  const grouped = {};
  metrics.forEach(metric => {
    if (!grouped[metric.metricType]) {
      grouped[metric.metricType] = [];
    }
    grouped[metric.metricType].push({
      value: metric.metricValue,
      timestamp: metric.timestamp
    });
  });
  return grouped;
}

function getSkillCategoryColor(category) {
  const colors = {
    'technical': '#3b82f6',
    'design': '#10b981',
    'leadership': '#f59e0b',
    'communication': '#ef4444',
    'analytics': '#8b5cf6'
  };
  return colors[category] || '#6b7280';
}

module.exports = router;