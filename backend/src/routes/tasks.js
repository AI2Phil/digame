const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');
const { requireTier, addTierHeaders, logAccessControl } = require('../middleware/accessControl');

const router = express.Router();

// Add tier headers and access logging to all routes
router.use(addTierHeaders());
router.use(logAccessControl({ verbose: true }));

/**
 * GET /tasks
 * Get user's tasks
 */
router.get('/', authenticate, requireFeature('tasks.basic'), async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    // Mock tasks data
    const tasks = [
      {
        id: 1,
        title: 'Complete Q1 Performance Review',
        description: 'Prepare and submit quarterly performance metrics',
        status: 'in_progress',
        priority: 'high',
        category: 'work',
        dueDate: '2024-01-15',
        createdAt: '2024-01-10',
        estimatedTime: 120,
        completedTime: null,
        tags: ['review', 'quarterly', 'metrics']
      },
      {
        id: 2,
        title: 'Update project documentation',
        description: 'Review and update technical documentation for the new features',
        status: 'completed',
        priority: 'medium',
        category: 'development',
        dueDate: '2024-01-12',
        createdAt: '2024-01-08',
        estimatedTime: 90,
        completedTime: 85,
        tags: ['documentation', 'technical', 'features']
      },
      {
        id: 3,
        title: 'Team meeting preparation',
        description: 'Prepare agenda and materials for weekly team sync',
        status: 'pending',
        priority: 'medium',
        category: 'meetings',
        dueDate: '2024-01-16',
        createdAt: '2024-01-11',
        estimatedTime: 30,
        completedTime: null,
        tags: ['meeting', 'agenda', 'team']
      }
    ];

    // Filter tasks based on query parameters
    let filteredTasks = tasks;
    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }
    if (category) {
      filteredTasks = filteredTasks.filter(t => t.category === category);
    }

    res.json({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Tasks list error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tasks'
    });
  }
});

/**
 * GET /tasks/ai-suggestions
 * Get AI-powered task suggestions
 */
router.get('/ai-suggestions', authenticate, requireTier('individual_pro'), async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    // Mock AI suggestions data
    const suggestions = [
      {
        id: 1,
        type: 'task_creation',
        title: 'Review Q1 Performance Metrics',
        description: 'Based on your calendar, you have a performance review meeting next week. Consider creating a task to prepare the Q1 metrics analysis.',
        priority: 'high',
        estimatedTime: 120,
        confidence: 0.92,
        reasoning: 'Detected upcoming meeting in calendar and historical pattern of preparation tasks',
        category: 'productivity',
        suggestedDueDate: '2024-01-15',
        tags: ['review', 'metrics', 'Q1'],
        relatedTasks: ['Prepare presentation slides', 'Gather team feedback'],
        aiInsight: 'Users who prepare for performance reviews 3 days in advance report 40% higher satisfaction scores'
      },
      {
        id: 2,
        type: 'task_optimization',
        title: 'Batch Email Responses',
        description: 'You typically respond to emails throughout the day. Batching responses into 2-3 focused sessions could save 45 minutes daily.',
        priority: 'medium',
        estimatedTime: 30,
        confidence: 0.87,
        reasoning: 'Analysis of your email patterns shows frequent context switching',
        category: 'efficiency',
        suggestedDueDate: '2024-01-12',
        tags: ['email', 'batching', 'productivity'],
        relatedTasks: ['Set email schedule', 'Configure notifications'],
        aiInsight: 'Email batching reduces cognitive load and improves focus by 35%'
      },
      {
        id: 3,
        type: 'skill_development',
        title: 'Learn Advanced Analytics',
        description: 'Based on your recent tasks, learning advanced analytics could help automate 60% of your data analysis work.',
        priority: 'medium',
        estimatedTime: 300,
        confidence: 0.85,
        reasoning: 'Frequent manual data analysis tasks detected in your workflow',
        category: 'learning',
        suggestedDueDate: '2024-02-01',
        tags: ['learning', 'analytics', 'automation'],
        relatedTasks: ['Find online course', 'Schedule learning time', 'Practice with real data'],
        aiInsight: 'Professionals with advanced analytics skills report 50% faster decision-making'
      }
    ];

    // Filter suggestions based on category
    let filteredSuggestions = suggestions;
    if (filter !== 'all') {
      filteredSuggestions = suggestions.filter(s => s.category === filter);
    }

    res.json({
      success: true,
      data: { suggestions: filteredSuggestions },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch AI suggestions'
    });
  }
});

/**
 * POST /tasks/ai-suggestions/:id/accept
 * Accept an AI suggestion and create a task
 */
router.post('/ai-suggestions/:id/accept', authenticate, requireTier('individual_pro'), async (req, res) => {
  try {
    const { id } = req.params;

    // Mock accepting suggestion and creating task
    const newTask = {
      id: Date.now(),
      title: 'AI Suggested Task',
      description: 'Task created from AI suggestion',
      status: 'pending',
      priority: 'medium',
      category: 'ai_suggested',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      estimatedTime: 60,
      source: 'ai_suggestion',
      suggestionId: parseInt(id)
    };

    res.json({
      success: true,
      message: 'AI suggestion accepted and task created',
      data: newTask,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Accept suggestion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to accept AI suggestion'
    });
  }
});

/**
 * GET /tasks/analytics
 * Get task analytics and performance metrics
 */
router.get('/analytics', authenticate, requireTier('individual_pro'), async (req, res) => {
  try {
    const { range = '30d' } = req.query;

    // Mock task analytics data
    const analytics = {
      overview: {
        totalTasks: 247,
        completedTasks: 189,
        overdueTasks: 12,
        avgCompletionTime: 2.4,
        productivityScore: 87.3,
        completionRate: 76.5,
        onTimeRate: 94.2,
        trends: {
          tasksCreated: '+15.2%',
          tasksCompleted: '+12.8%',
          productivity: '+8.7%',
          onTime: '+3.2%'
        }
      },
      performance: {
        dailyCompletion: [
          { date: '2024-01-01', completed: 8, created: 12 },
          { date: '2024-01-02', completed: 12, created: 10 },
          { date: '2024-01-03', completed: 6, created: 8 },
          { date: '2024-01-04', completed: 15, created: 14 },
          { date: '2024-01-05', completed: 9, created: 11 },
          { date: '2024-01-06', completed: 11, created: 9 },
          { date: '2024-01-07', completed: 13, created: 15 }
        ],
        weeklyTrends: {
          thisWeek: { completed: 74, created: 79, productivity: 93.7 },
          lastWeek: { completed: 68, created: 82, productivity: 82.9 },
          change: { completed: '+8.8%', created: '-3.7%', productivity: '+13.0%' }
        }
      },
      categories: [
        { name: 'Development', tasks: 89, completed: 72, completionRate: 80.9, avgTime: 3.2 },
        { name: 'Design', tasks: 45, completed: 38, completionRate: 84.4, avgTime: 2.1 },
        { name: 'Marketing', tasks: 34, completed: 29, completionRate: 85.3, avgTime: 1.8 },
        { name: 'Research', tasks: 28, completed: 22, completionRate: 78.6, avgTime: 4.1 },
        { name: 'Admin', tasks: 51, completed: 48, completionRate: 94.1, avgTime: 0.8 }
      ],
      priorities: {
        high: { total: 67, completed: 58, overdue: 5, avgTime: 1.9 },
        medium: { total: 124, completed: 95, overdue: 4, avgTime: 2.8 },
        low: { total: 56, completed: 36, overdue: 3, avgTime: 4.2 }
      },
      timeAnalysis: {
        peakHours: [9, 10, 11, 14, 15, 16],
        peakDays: ['Tuesday', 'Wednesday', 'Thursday'],
        avgSessionLength: 45,
        focusTime: 6.2,
        distractionRate: 18.5
      },
      teamComparison: {
        userRank: 3,
        totalMembers: 12,
        userScore: 87.3,
        teamAverage: 78.9,
        topPerformers: [
          { name: 'Sarah Johnson', score: 94.2, completionRate: 89.1 },
          { name: 'Mike Chen', score: 91.7, completionRate: 85.6 },
          { name: 'You', score: 87.3, completionRate: 76.5 },
          { name: 'Lisa Brown', score: 84.1, completionRate: 78.2 }
        ]
      },
      insights: [
        {
          type: 'productivity',
          title: 'Peak Performance Window',
          description: 'You complete 40% more tasks between 9-11 AM. Consider scheduling important work during this time.',
          impact: 'high',
          actionable: true
        },
        {
          type: 'efficiency',
          title: 'Task Batching Opportunity',
          description: 'Grouping similar admin tasks could reduce completion time by 25%.',
          impact: 'medium',
          actionable: true
        }
      ],
      achievements: [
        { id: 1, name: 'Streak Master', description: '7-day completion streak', earned: true, date: 'Today' },
        { id: 2, name: 'Speed Demon', description: 'Completed 10 tasks in one day', earned: true, date: '3 days ago' },
        { id: 3, name: 'Consistency King', description: 'Meet daily goals for 30 days', earned: false, progress: 23 }
      ]
    };

    res.json({
      success: true,
      data: analytics,
      timeRange: range,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Task analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch task analytics'
    });
  }
});

/**
 * POST /tasks
 * Create a new task
 */
router.post('/', authenticate, requireFeature('tasks.basic'), async (req, res) => {
  try {
    const { title, description, priority = 'medium', category, dueDate, estimatedTime } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title is required'
      });
    }

    // Mock task creation
    const newTask = {
      id: Date.now(),
      title,
      description: description || '',
      status: 'pending',
      priority,
      category: category || 'general',
      dueDate,
      createdAt: new Date().toISOString(),
      estimatedTime: estimatedTime || 60,
      completedTime: null,
      tags: [],
      userId: req.user.id
    };

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create task'
    });
  }
});

/**
 * PUT /tasks/:id
 * Update a task
 */
router.put('/:id', authenticate, requireFeature('tasks.basic'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, dueDate } = req.body;

    // Mock task update
    const updatedTask = {
      id: parseInt(id),
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update task'
    });
  }
});

/**
 * DELETE /tasks/:id
 * Delete a task
 */
router.delete('/:id', authenticate, requireFeature('tasks.basic'), async (req, res) => {
  try {
    const { id } = req.params;

    // Mock task deletion
    res.json({
      success: true,
      message: 'Task deleted successfully',
      taskId: parseInt(id),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete task'
    });
  }
});

/**
 * GET /tasks/projects
 * Get project management data
 */
router.get('/projects', authenticate, requireTier('team'), async (req, res) => {
  try {
    // Mock projects data
    const projects = [
      {
        id: 1,
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        status: 'in_progress',
        progress: 68,
        startDate: '2024-01-01',
        dueDate: '2024-02-15',
        teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        tasks: {
          total: 24,
          completed: 16,
          inProgress: 5,
          pending: 3
        },
        priority: 'high',
        budget: 50000,
        spent: 32000
      },
      {
        id: 2,
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        status: 'planning',
        progress: 15,
        startDate: '2024-02-01',
        dueDate: '2024-06-30',
        teamMembers: ['Sarah Wilson', 'Tom Brown'],
        tasks: {
          total: 45,
          completed: 3,
          inProgress: 4,
          pending: 38
        },
        priority: 'medium',
        budget: 120000,
        spent: 8500
      }
    ];

    res.json({
      success: true,
      data: projects,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch projects'
    });
  }
});

module.exports = router;