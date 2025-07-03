const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /team/members
 * Get team members and their information
 */
router.get('/members', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { team_id, status } = req.query;

    // Mock team members data
    const teamMembers = [
      {
        id: 1,
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'Engineering Lead',
        team: 'engineering',
        avatar_url: null,
        status: 'online',
        last_active: new Date().toISOString(),
        skills: ['React', 'Node.js', 'Python'],
        current_project: 'Platform Architecture',
        subscription: 'platform_owner',
        joined_at: '2023-06-15T09:00:00Z'
      },
      {
        id: 2,
        name: 'Marcus Johnson',
        email: 'marcus.johnson@company.com',
        role: 'Senior Designer',
        team: 'design',
        avatar_url: null,
        status: 'away',
        last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        skills: ['UI/UX', 'Figma', 'Prototyping'],
        current_project: 'Mobile App Redesign',
        subscription: 'professional',
        joined_at: '2023-08-20T10:30:00Z'
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        role: 'Marketing Manager',
        team: 'marketing',
        avatar_url: null,
        status: 'online',
        last_active: new Date().toISOString(),
        skills: ['Content Strategy', 'SEO', 'Analytics'],
        current_project: 'Q1 Campaign',
        subscription: 'professional',
        joined_at: '2023-07-10T14:00:00Z'
      },
      {
        id: 4,
        name: 'David Kim',
        email: 'david.kim@company.com',
        role: 'Sales Director',
        team: 'sales',
        avatar_url: null,
        status: 'busy',
        last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        skills: ['Enterprise Sales', 'CRM', 'Negotiation'],
        current_project: 'Enterprise Deals',
        subscription: 'platform_owner',
        joined_at: '2023-05-01T08:00:00Z'
      }
    ];

    // Filter by team if specified
    let filteredMembers = teamMembers;
    if (team_id && team_id !== 'all') {
      filteredMembers = teamMembers.filter(member => member.team === team_id);
    }
    if (status) {
      filteredMembers = filteredMembers.filter(member => member.status === status);
    }

    res.json({
      success: true,
      data: filteredMembers,
      total: filteredMembers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team members error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team members'
    });
  }
});

/**
 * GET /team/projects
 * Get team projects and their status
 */
router.get('/projects', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { team_id, status } = req.query;

    // Mock projects data
    const projects = [
      {
        id: 1,
        name: 'Platform Architecture',
        description: 'Redesign core platform architecture for scalability',
        team: 'engineering',
        progress: 75,
        members: 4,
        deadline: '2024-02-15',
        status: 'on_track',
        priority: 'high',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-29T16:30:00Z'
      },
      {
        id: 2,
        name: 'Mobile App Redesign',
        description: 'Complete UI/UX overhaul of mobile application',
        team: 'design',
        progress: 60,
        members: 3,
        deadline: '2024-02-28',
        status: 'on_track',
        priority: 'medium',
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-28T14:20:00Z'
      },
      {
        id: 3,
        name: 'Q1 Marketing Campaign',
        description: 'Launch comprehensive marketing campaign for Q1',
        team: 'marketing',
        progress: 40,
        members: 5,
        deadline: '2024-03-01',
        status: 'at_risk',
        priority: 'high',
        created_at: '2024-01-10T11:00:00Z',
        updated_at: '2024-01-27T13:45:00Z'
      },
      {
        id: 4,
        name: 'Enterprise Sales Push',
        description: 'Focus on acquiring enterprise clients',
        team: 'sales',
        progress: 85,
        members: 6,
        deadline: '2024-01-31',
        status: 'ahead',
        priority: 'high',
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-29T17:00:00Z'
      }
    ];

    // Filter by team if specified
    let filteredProjects = projects;
    if (team_id && team_id !== 'all') {
      filteredProjects = projects.filter(project => project.team === team_id);
    }
    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }

    res.json({
      success: true,
      data: filteredProjects,
      total: filteredProjects.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team projects error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team projects'
    });
  }
});

/**
 * GET /team/activity
 * Get recent team activity and updates
 */
router.get('/activity', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { team_id, limit = 20 } = req.query;

    // Mock activity data
    const activities = [
      {
        id: 1,
        type: 'message',
        user_id: 1,
        user_name: 'Sarah Chen',
        action: 'shared a document',
        target: 'Architecture Review.pdf',
        team: 'engineering',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'meeting',
        user_id: 3,
        user_name: 'Emily Rodriguez',
        action: 'scheduled a meeting',
        target: 'Q1 Planning Session',
        team: 'marketing',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'project',
        user_id: 2,
        user_name: 'Marcus Johnson',
        action: 'updated project status',
        target: 'Mobile App Redesign',
        team: 'design',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        type: 'comment',
        user_id: 4,
        user_name: 'David Kim',
        action: 'commented on',
        target: 'Enterprise Sales Strategy',
        team: 'sales',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter by team if specified
    let filteredActivities = activities;
    if (team_id && team_id !== 'all') {
      filteredActivities = activities.filter(activity => activity.team === team_id);
    }

    // Apply limit
    filteredActivities = filteredActivities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredActivities,
      total: filteredActivities.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team activity error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team activity'
    });
  }
});

/**
 * GET /team/meetings
 * Get upcoming team meetings
 */
router.get('/meetings', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { team_id, date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Mock meetings data
    const meetings = [
      {
        id: 1,
        title: 'Daily Standup',
        description: 'Daily team sync and updates',
        team: 'engineering',
        start_time: new Date(targetDate.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 9 AM
        duration: 15,
        attendees: 8,
        type: 'recurring',
        meeting_url: 'https://meet.company.com/standup-eng',
        organizer: 'Sarah Chen'
      },
      {
        id: 2,
        title: 'Design Review',
        description: 'Review latest design mockups and prototypes',
        team: 'design',
        start_time: new Date(targetDate.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 2 PM
        duration: 60,
        attendees: 6,
        type: 'scheduled',
        meeting_url: 'https://meet.company.com/design-review',
        organizer: 'Marcus Johnson'
      },
      {
        id: 3,
        title: 'Sales Pipeline Review',
        description: 'Weekly sales pipeline and forecast review',
        team: 'sales',
        start_time: new Date(targetDate.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 4 PM
        duration: 45,
        attendees: 4,
        type: 'scheduled',
        meeting_url: 'https://meet.company.com/sales-pipeline',
        organizer: 'David Kim'
      }
    ];

    // Filter by team if specified
    let filteredMeetings = meetings;
    if (team_id && team_id !== 'all') {
      filteredMeetings = meetings.filter(meeting => meeting.team === team_id);
    }

    res.json({
      success: true,
      data: filteredMeetings,
      total: filteredMeetings.length,
      date: targetDate.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team meetings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team meetings'
    });
  }
});

/**
 * POST /team/meetings
 * Schedule a new team meeting
 */
router.post('/meetings', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { title, description, team, start_time, duration, attendees } = req.body;

    if (!title || !start_time || !duration) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title, start time, and duration are required'
      });
    }

    // Mock meeting creation
    const newMeeting = {
      id: Date.now(),
      title,
      description: description || '',
      team: team || 'general',
      start_time,
      duration,
      attendees: attendees || [],
      type: 'scheduled',
      meeting_url: `https://meet.company.com/meeting-${Date.now()}`,
      organizer: req.user.firstName + ' ' + req.user.lastName,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    console.log(`Meeting scheduled: ${title} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: newMeeting,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Meeting creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to schedule meeting'
    });
  }
});

/**
 * GET /team/analytics
 * Get team collaboration analytics
 */
router.get('/analytics', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { team_id, timeRange = '30d' } = req.query;

    // Mock analytics data
    const analytics = {
      overview: {
        total_members: 24,
        active_members: 18,
        total_projects: 4,
        completed_projects: 12,
        meetings_this_week: 15,
        collaboration_score: 8.7
      },
      team_performance: {
        productivity_trend: 'increasing',
        project_completion_rate: 0.89,
        meeting_efficiency: 0.82,
        communication_frequency: 'high'
      },
      activity_metrics: {
        messages_sent: 1247,
        documents_shared: 89,
        meetings_attended: 156,
        projects_updated: 67
      },
      team_breakdown: [
        { team: 'Engineering', members: 8, projects: 1, activity_score: 9.2 },
        { team: 'Design', members: 4, projects: 1, activity_score: 8.8 },
        { team: 'Marketing', members: 6, projects: 1, activity_score: 8.5 },
        { team: 'Sales', members: 6, projects: 1, activity_score: 8.9 }
      ],
      timeRange
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team analytics'
    });
  }
});

/**
 * POST /team/invite
 * Invite a new team member
 */
router.post('/invite', authenticate, requireFeature('collaboration.basic'), async (req, res) => {
  try {
    const { email, role, team, message } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and role are required'
      });
    }

    // Mock invitation
    const invitation = {
      id: Date.now(),
      email,
      role,
      team: team || 'general',
      message: message || '',
      invited_by: req.user.id,
      invited_by_name: req.user.firstName + ' ' + req.user.lastName,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: new Date().toISOString()
    };

    console.log(`Team invitation sent to: ${email} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team invitation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send invitation'
    });
  }
});

module.exports = router;