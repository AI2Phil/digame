const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Team Dashboard endpoints
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    // Mock team dashboard data
    const dashboardData = {
      overview: {
        totalMembers: 12,
        activeMembers: 10,
        teamProductivity: 87.3,
        completedTasks: 156,
        ongoingProjects: 4,
        teamSatisfaction: 4.2,
        collaborationScore: 92.1,
        trends: {
          productivity: '+12.5%',
          tasks: '+8.7%',
          satisfaction: '+0.3',
          collaboration: '+5.2%'
        }
      },
      members: [
        {
          id: 1,
          name: 'Sarah Johnson',
          role: 'Team Lead',
          avatar: 'SJ',
          status: 'online',
          productivity: 94.2,
          tasksCompleted: 23,
          currentTasks: 5,
          lastActive: 'now',
          skills: ['Leadership', 'Project Management', 'Strategy'],
          workload: 85,
          satisfaction: 4.5
        },
        {
          id: 2,
          name: 'Mike Chen',
          role: 'Senior Developer',
          avatar: 'MC',
          status: 'online',
          productivity: 91.7,
          tasksCompleted: 28,
          currentTasks: 4,
          lastActive: '5 min ago',
          skills: ['React', 'Node.js', 'Database'],
          workload: 92,
          satisfaction: 4.3
        }
      ],
      projects: [
        {
          id: 1,
          name: 'Website Redesign',
          progress: 68,
          status: 'on_track',
          dueDate: '2024-02-15',
          teamMembers: 4,
          tasksCompleted: 16,
          totalTasks: 24,
          priority: 'high'
        }
      ],
      activities: [
        {
          id: 1,
          type: 'task_completed',
          user: 'Mike Chen',
          action: 'completed task',
          target: 'User Authentication Module',
          timestamp: '5 minutes ago'
        }
      ],
      metrics: {
        weeklyStats: {
          tasksCompleted: [12, 15, 18, 22, 19, 16, 14],
          productivity: [85, 87, 89, 91, 88, 86, 87],
          collaboration: [78, 82, 85, 88, 90, 87, 92]
        },
        topPerformers: [
          { name: 'Sarah Johnson', score: 94.2, improvement: '+2.1%' },
          { name: 'Mike Chen', score: 91.7, improvement: '+1.8%' },
          { name: 'Emma Garcia', score: 89.2, improvement: '+3.2%' }
        ]
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching team dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Social endpoints
router.get('/social', auth, async (req, res) => {
  try {
    const socialData = {
      feed: [
        {
          id: 1,
          type: 'achievement',
          user: {
            name: 'Sarah Johnson',
            avatar: 'SJ',
            role: 'Team Lead',
            status: 'online'
          },
          content: 'Just completed the Q1 project milestone! 🎉 Thanks to everyone for the amazing teamwork.',
          timestamp: '2 hours ago',
          likes: 12,
          comments: 5,
          shares: 2,
          tags: ['milestone', 'teamwork'],
          attachments: [],
          reactions: {
            like: 8,
            celebrate: 3,
            heart: 1
          }
        }
      ],
      channels: [
        {
          id: 'general',
          name: 'General',
          description: 'Team-wide discussions',
          members: 12,
          unread: 3,
          lastActivity: '5 min ago',
          type: 'public'
        }
      ],
      events: [
        {
          id: 1,
          title: 'Team Lunch',
          date: '2024-01-15',
          time: '12:00 PM',
          location: 'Conference Room A',
          attendees: 8,
          type: 'social',
          organizer: 'Sarah Johnson'
        }
      ],
      leaderboard: [
        {
          id: 1,
          user: 'Sarah Johnson',
          avatar: 'SJ',
          points: 1250,
          badges: ['Team Player', 'Mentor', 'Leader'],
          level: 'Gold',
          achievements: 15
        }
      ],
      stats: {
        totalPosts: 156,
        totalLikes: 892,
        totalComments: 234,
        activeUsers: 10,
        topHashtags: ['teamwork', 'development', 'coffee', 'milestone', 'help']
      }
    };

    res.json(socialData);
  } catch (error) {
    console.error('Error fetching social data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/social/posts', auth, async (req, res) => {
  try {
    const { content, channel } = req.body;
    
    // Mock post creation
    const newPost = {
      id: Date.now(),
      type: 'social',
      user: {
        name: 'Current User',
        avatar: 'CU',
        role: 'Team Member',
        status: 'online'
      },
      content,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      tags: [],
      attachments: [],
      reactions: {}
    };

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/social/posts/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Mock like functionality
    res.json({ success: true, postId, liked: true });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Mentorship endpoints
router.get('/mentorship', auth, async (req, res) => {
  try {
    const mentorshipData = {
      overview: {
        totalMentors: 8,
        totalMentees: 15,
        activePairings: 12,
        completedSessions: 89,
        averageRating: 4.7,
        successRate: 92.3,
        totalHours: 156,
        programSatisfaction: 4.6
      },
      mentors: [
        {
          id: 1,
          name: 'Sarah Johnson',
          avatar: 'SJ',
          role: 'Senior Team Lead',
          department: 'Engineering',
          experience: '8 years',
          expertise: ['Leadership', 'Project Management', 'Career Development', 'Team Building'],
          rating: 4.9,
          totalMentees: 5,
          activeMentees: 3,
          completedSessions: 24,
          availability: 'Available',
          bio: 'Passionate about developing the next generation of tech leaders.',
          achievements: ['Top Mentor 2023', 'Leadership Excellence', 'Team Builder'],
          languages: ['English', 'Spanish'],
          timezone: 'PST',
          preferredMeetingStyle: 'Video calls'
        }
      ],
      mentees: [
        {
          id: 1,
          name: 'Alex Rodriguez',
          avatar: 'AR',
          role: 'Junior Developer',
          department: 'Engineering',
          mentor: 'Mike Chen',
          startDate: '2024-01-15',
          goals: ['Learn system design', 'Improve coding skills', 'Understand architecture patterns'],
          progress: 75,
          sessionsCompleted: 8,
          nextSession: '2024-01-20',
          status: 'Active',
          satisfaction: 4.8
        }
      ],
      sessions: [
        {
          id: 1,
          mentor: 'Sarah Johnson',
          mentee: 'Emma Garcia',
          date: '2024-01-15',
          time: '2:00 PM',
          duration: 60,
          type: 'Video Call',
          topic: 'Leadership Development',
          status: 'Completed',
          rating: 5,
          notes: 'Great discussion about team dynamics and leadership styles.',
          nextActions: ['Read "The First 90 Days"', 'Practice delegation techniques']
        }
      ],
      programs: [
        {
          id: 1,
          name: 'Technical Leadership Track',
          description: 'Develop technical leadership skills for senior engineers',
          duration: '6 months',
          participants: 8,
          mentors: 3,
          status: 'Active',
          startDate: '2024-01-01',
          completionRate: 85,
          topics: ['Technical Strategy', 'Team Leadership', 'Architecture Decisions']
        }
      ],
      resources: [
        {
          id: 1,
          title: 'Mentorship Best Practices Guide',
          type: 'PDF',
          category: 'Guidelines',
          downloads: 45,
          rating: 4.8,
          description: 'Comprehensive guide for effective mentoring relationships'
        }
      ]
    };

    res.json(mentorshipData);
  } catch (error) {
    console.error('Error fetching mentorship data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/mentorship/request', auth, async (req, res) => {
  try {
    const { mentorId } = req.body;
    
    // Mock mentorship request
    const request = {
      id: Date.now(),
      mentorId,
      menteeId: req.user.id,
      status: 'pending',
      requestDate: new Date().toISOString(),
      message: 'I would like to request mentorship to improve my skills.'
    };

    res.status(201).json(request);
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Skills endpoints
router.get('/skills', auth, async (req, res) => {
  try {
    const skillsData = {
      overview: {
        totalSkills: 156,
        teamMembers: 12,
        skillCategories: 8,
        averageSkillLevel: 3.4,
        topSkills: 25,
        skillGaps: 8,
        learningPaths: 15,
        completedTraining: 89
      },
      categories: [
        {
          id: 'technical',
          name: 'Technical Skills',
          color: 'blue',
          skillCount: 45,
          avgLevel: 3.6,
          topSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
        },
        {
          id: 'design',
          name: 'Design Skills',
          color: 'purple',
          skillCount: 18,
          avgLevel: 3.2,
          topSkills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping']
        }
      ],
      teamSkills: [
        {
          id: 1,
          name: 'Sarah Johnson',
          avatar: 'SJ',
          role: 'Team Lead',
          department: 'Engineering',
          totalSkills: 28,
          topSkills: [
            { name: 'Leadership', level: 5, category: 'leadership' },
            { name: 'Project Management', level: 5, category: 'project-management' },
            { name: 'Strategic Planning', level: 4, category: 'leadership' }
          ],
          skillGaps: ['Data Analysis', 'Machine Learning'],
          learningGoals: ['Advanced Analytics', 'AI/ML Fundamentals'],
          lastUpdated: '2024-01-15'
        }
      ],
      skillMatrix: [
        {
          skill: 'JavaScript',
          category: 'technical',
          teamLevel: 4.2,
          required: 4,
          gap: -0.2,
          members: [
            { name: 'Sarah Johnson', level: 4 },
            { name: 'Mike Chen', level: 5 }
          ]
        }
      ],
      learningPaths: [
        {
          id: 1,
          title: 'Frontend Development Mastery',
          description: 'Complete path to become a frontend expert',
          duration: '6 months',
          difficulty: 'Intermediate',
          skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Testing'],
          enrolled: 5,
          completed: 2,
          rating: 4.7,
          category: 'technical'
        }
      ],
      recommendations: [
        {
          id: 1,
          type: 'skill_gap',
          title: 'Address React Skills Gap',
          description: 'Team needs stronger React skills to meet project requirements',
          priority: 'high',
          affectedMembers: 3,
          suggestedAction: 'Enroll in React training program',
          timeline: '2 weeks'
        }
      ]
    };

    res.json(skillsData);
  } catch (error) {
    console.error('Error fetching skills data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team Workflows endpoints
router.get('/workflows', auth, async (req, res) => {
  try {
    const workflowsData = {
      overview: {
        totalWorkflows: 24,
        activeWorkflows: 18,
        completedToday: 156,
        averageExecutionTime: '2.3 min',
        successRate: 94.7,
        totalExecutions: 1247,
        automationSavings: '45.2 hours',
        errorRate: 2.1
      },
      categories: [
        { id: 'development', name: 'Development', count: 8, color: 'blue' },
        { id: 'deployment', name: 'Deployment', count: 6, color: 'green' },
        { id: 'testing', name: 'Testing', count: 4, color: 'purple' },
        { id: 'communication', name: 'Communication', count: 3, color: 'orange' },
        { id: 'monitoring', name: 'Monitoring', count: 3, color: 'red' }
      ],
      workflows: [
        {
          id: 1,
          name: 'Code Review Process',
          description: 'Automated code review workflow with quality checks and notifications',
          category: 'development',
          status: 'active',
          trigger: 'Pull Request',
          owner: 'Mike Chen',
          team: ['Sarah Johnson', 'Alex Rodriguez', 'Tom Wilson'],
          created: '2024-01-10',
          lastRun: '2024-01-15 14:30',
          executions: 89,
          successRate: 96.6,
          avgDuration: '3.2 min',
          steps: [
            { id: 1, name: 'Code Analysis', type: 'automated', status: 'completed' },
            { id: 2, name: 'Security Scan', type: 'automated', status: 'completed' },
            { id: 3, name: 'Assign Reviewers', type: 'automated', status: 'completed' },
            { id: 4, name: 'Send Notifications', type: 'automated', status: 'completed' },
            { id: 5, name: 'Manual Review', type: 'manual', status: 'pending' }
          ],
          metrics: {
            timesSaved: '12.4 hours',
            errorReduction: '34%',
            teamSatisfaction: 4.7
          }
        }
      ],
      templates: [
        {
          id: 1,
          name: 'Code Review Template',
          description: 'Standard code review workflow template',
          category: 'development',
          uses: 15,
          rating: 4.8,
          steps: 5
        }
      ],
      analytics: {
        executionTrends: [45, 52, 48, 61, 55, 67, 72],
        successRates: [94, 96, 93, 95, 97, 94, 95],
        categories: {
          development: 45,
          deployment: 25,
          testing: 15,
          communication: 10,
          monitoring: 5
        }
      }
    };

    res.json(workflowsData);
  } catch (error) {
    console.error('Error fetching workflows data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/workflows/:workflowId/pause', auth, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Mock workflow pause
    res.json({ success: true, workflowId, status: 'paused' });
  } catch (error) {
    console.error('Error pausing workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/workflows/:workflowId/resume', auth, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Mock workflow resume
    res.json({ success: true, workflowId, status: 'active' });
  } catch (error) {
    console.error('Error resuming workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/workflows/:workflowId/stop', auth, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Mock workflow stop
    res.json({ success: true, workflowId, status: 'stopped' });
  } catch (error) {
    console.error('Error stopping workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;