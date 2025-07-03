const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /career/profile
 * Get user's career profile and statistics
 */
router.get('/profile', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    // Mock career profile data
    const careerProfile = {
      user_id: req.user.id,
      current_level: 'Senior Developer',
      experience_years: 5.2,
      skills_mastered: 23,
      certifications: 4,
      career_score: 847,
      next_milestone: 'Tech Lead',
      progress_to_next: 0.68,
      industry: 'Technology',
      specialization: 'Full Stack Development',
      location: 'San Francisco, CA',
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: careerProfile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch career profile'
    });
  }
});

/**
 * GET /career/skills
 * Get user's skills assessment and development tracking
 */
router.get('/skills', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { category } = req.query;

    // Mock skills data
    const skillCategories = [
      {
        category: 'Technical Skills',
        skills: [
          { 
            name: 'JavaScript', 
            level: 9, 
            trend: '+0.5', 
            demand: 'high', 
            salary_impact: '+15%',
            last_assessed: '2024-01-25T10:00:00Z'
          },
          { 
            name: 'React', 
            level: 8, 
            trend: '+0.3', 
            demand: 'high', 
            salary_impact: '+12%',
            last_assessed: '2024-01-20T14:30:00Z'
          },
          { 
            name: 'Node.js', 
            level: 7, 
            trend: '+0.8', 
            demand: 'high', 
            salary_impact: '+10%',
            last_assessed: '2024-01-22T09:15:00Z'
          },
          { 
            name: 'Python', 
            level: 6, 
            trend: '+1.2', 
            demand: 'very high', 
            salary_impact: '+18%',
            last_assessed: '2024-01-28T16:45:00Z'
          },
          { 
            name: 'AWS', 
            level: 5, 
            trend: '+1.5', 
            demand: 'very high', 
            salary_impact: '+22%',
            last_assessed: '2024-01-26T11:20:00Z'
          }
        ]
      },
      {
        category: 'Leadership Skills',
        skills: [
          { 
            name: 'Team Management', 
            level: 6, 
            trend: '+0.7', 
            demand: 'high', 
            salary_impact: '+25%',
            last_assessed: '2024-01-24T13:00:00Z'
          },
          { 
            name: 'Project Planning', 
            level: 7, 
            trend: '+0.4', 
            demand: 'high', 
            salary_impact: '+15%',
            last_assessed: '2024-01-23T15:30:00Z'
          },
          { 
            name: 'Mentoring', 
            level: 5, 
            trend: '+0.6', 
            demand: 'medium', 
            salary_impact: '+12%',
            last_assessed: '2024-01-21T10:45:00Z'
          }
        ]
      },
      {
        category: 'Business Skills',
        skills: [
          { 
            name: 'Product Strategy', 
            level: 5, 
            trend: '+0.5', 
            demand: 'high', 
            salary_impact: '+18%',
            last_assessed: '2024-01-27T12:00:00Z'
          },
          { 
            name: 'Data Analysis', 
            level: 6, 
            trend: '+0.3', 
            demand: 'very high', 
            salary_impact: '+16%',
            last_assessed: '2024-01-25T14:15:00Z'
          },
          { 
            name: 'Communication', 
            level: 8, 
            trend: '+0.2', 
            demand: 'high', 
            salary_impact: '+10%',
            last_assessed: '2024-01-29T09:30:00Z'
          }
        ]
      }
    ];

    // Filter by category if specified
    let filteredCategories = skillCategories;
    if (category) {
      filteredCategories = skillCategories.filter(cat => 
        cat.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredCategories,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career skills error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch career skills'
    });
  }
});

/**
 * GET /career/goals
 * Get user's career goals and progress
 */
router.get('/goals', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { status, priority } = req.query;

    // Mock career goals data
    const careerGoals = [
      {
        id: 1,
        title: 'Become Tech Lead',
        description: 'Lead a team of 5-8 developers and drive technical decisions',
        target_date: '2024-06-01',
        progress: 0.68,
        priority: 'high',
        category: 'promotion',
        status: 'in_progress',
        milestones: [
          { task: 'Complete leadership training', completed: true, due_date: '2024-01-15' },
          { task: 'Lead 2 major projects', completed: true, due_date: '2024-02-28' },
          { task: 'Mentor 3 junior developers', completed: false, due_date: '2024-03-15' },
          { task: 'Present technical strategy to executives', completed: false, due_date: '2024-04-30' },
          { task: 'Get 360-degree feedback score >4.5', completed: false, due_date: '2024-05-15' }
        ],
        required_skills: ['Team Management', 'Strategic Thinking', 'Mentoring'],
        estimated_salary_increase: '25-35%',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-29T16:30:00Z'
      },
      {
        id: 2,
        title: 'Master Cloud Architecture',
        description: 'Become proficient in AWS/Azure cloud architecture and DevOps',
        target_date: '2024-04-15',
        progress: 0.45,
        priority: 'high',
        category: 'skill',
        status: 'in_progress',
        milestones: [
          { task: 'Complete AWS Solutions Architect certification', completed: false, due_date: '2024-02-29' },
          { task: 'Design and implement microservices architecture', completed: false, due_date: '2024-03-15' },
          { task: 'Set up CI/CD pipeline for 3 projects', completed: true, due_date: '2024-01-31' },
          { task: 'Lead cloud migration project', completed: false, due_date: '2024-04-10' }
        ],
        required_skills: ['AWS', 'Docker', 'System Design'],
        estimated_salary_increase: '20-30%',
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-28T14:20:00Z'
      },
      {
        id: 3,
        title: 'Expand Network in Tech Industry',
        description: 'Build relationships with 50+ industry professionals',
        target_date: '2024-12-31',
        progress: 0.32,
        priority: 'medium',
        category: 'networking',
        status: 'in_progress',
        milestones: [
          { task: 'Attend 6 tech conferences', completed: false, due_date: '2024-11-30' },
          { task: 'Speak at 2 industry events', completed: false, due_date: '2024-10-15' },
          { task: 'Connect with 20 senior engineers', completed: true, due_date: '2024-03-31' },
          { task: 'Join 3 professional communities', completed: true, due_date: '2024-02-28' },
          { task: 'Publish 5 technical articles', completed: false, due_date: '2024-09-30' }
        ],
        required_skills: ['Communication', 'Personal Branding'],
        estimated_salary_increase: '10-15%',
        created_at: '2024-01-10T11:00:00Z',
        updated_at: '2024-01-27T13:45:00Z'
      }
    ];

    // Filter goals based on query parameters
    let filteredGoals = careerGoals;
    if (status) {
      filteredGoals = filteredGoals.filter(goal => goal.status === status);
    }
    if (priority) {
      filteredGoals = filteredGoals.filter(goal => goal.priority === priority);
    }

    res.json({
      success: true,
      data: filteredGoals,
      total: filteredGoals.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career goals error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch career goals'
    });
  }
});

/**
 * POST /career/goals
 * Create a new career goal
 */
router.post('/goals', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { title, description, target_date, priority, category, milestones } = req.body;

    if (!title || !target_date) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and target date are required'
      });
    }

    // Mock goal creation
    const newGoal = {
      id: Date.now(),
      title,
      description: description || '',
      target_date,
      progress: 0,
      priority: priority || 'medium',
      category: category || 'general',
      status: 'not_started',
      milestones: milestones || [],
      required_skills: [],
      estimated_salary_increase: 'TBD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: req.user.id
    };

    console.log(`Career goal created: ${title} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Career goal created successfully',
      data: newGoal,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career goal creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create career goal'
    });
  }
});

/**
 * GET /career/opportunities
 * Get career opportunities and job recommendations
 */
router.get('/opportunities', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { location, salary_min, remote_ok } = req.query;

    // Mock career opportunities data
    const opportunities = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        remote_ok: true,
        salary_range: '$120,000 - $150,000',
        match_score: 0.92,
        skills_match: ['JavaScript', 'React', 'Node.js', 'AWS'],
        missing_skills: ['Kubernetes'],
        description: 'Join our growing engineering team to build scalable web applications',
        posted_date: '2024-01-25T10:00:00Z',
        application_deadline: '2024-02-25T23:59:59Z'
      },
      {
        id: 2,
        title: 'Technical Lead',
        company: 'Innovation Labs',
        location: 'Austin, TX',
        remote_ok: false,
        salary_range: '$130,000 - $160,000',
        match_score: 0.85,
        skills_match: ['Team Management', 'Python', 'System Design'],
        missing_skills: ['Strategic Planning', 'Budget Management'],
        description: 'Lead a team of engineers in developing cutting-edge AI solutions',
        posted_date: '2024-01-28T14:30:00Z',
        application_deadline: '2024-03-01T23:59:59Z'
      },
      {
        id: 3,
        title: 'Cloud Solutions Architect',
        company: 'CloudFirst Solutions',
        location: 'Remote',
        remote_ok: true,
        salary_range: '$140,000 - $170,000',
        match_score: 0.78,
        skills_match: ['AWS', 'Docker', 'System Design'],
        missing_skills: ['Azure', 'Terraform', 'Security Architecture'],
        description: 'Design and implement cloud infrastructure for enterprise clients',
        posted_date: '2024-01-26T09:15:00Z',
        application_deadline: '2024-02-28T23:59:59Z'
      }
    ];

    // Filter opportunities based on query parameters
    let filteredOpportunities = opportunities;
    if (location) {
      filteredOpportunities = filteredOpportunities.filter(opp => 
        opp.location.toLowerCase().includes(location.toLowerCase()) || opp.remote_ok
      );
    }
    if (remote_ok === 'true') {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.remote_ok);
    }
    if (salary_min) {
      const minSalary = parseInt(salary_min);
      filteredOpportunities = filteredOpportunities.filter(opp => {
        const salaryMatch = opp.salary_range.match(/\$(\d+),(\d+)/);
        if (salaryMatch) {
          const oppMinSalary = parseInt(salaryMatch[1] + salaryMatch[2]);
          return oppMinSalary >= minSalary;
        }
        return true;
      });
    }

    res.json({
      success: true,
      data: filteredOpportunities,
      total: filteredOpportunities.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career opportunities error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch career opportunities'
    });
  }
});

/**
 * GET /career/learning-paths
 * Get recommended learning paths and courses
 */
router.get('/learning-paths', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { skill, difficulty } = req.query;

    // Mock learning paths data
    const learningPaths = [
      {
        id: 1,
        title: 'Leadership Excellence Track',
        description: 'Comprehensive program for technical leaders',
        duration: '6 months',
        modules: 8,
        difficulty: 'advanced',
        provider: 'Tech Leadership Institute',
        rating: 4.8,
        enrolled: 1247,
        skills_covered: ['Team Management', 'Strategic Thinking', 'Communication'],
        certification: true,
        price: '$299',
        estimated_completion: '2024-07-30'
      },
      {
        id: 2,
        title: 'Cloud Architecture Mastery',
        description: 'Deep dive into modern cloud architecture patterns',
        duration: '4 months',
        modules: 12,
        difficulty: 'intermediate',
        provider: 'Cloud Academy',
        rating: 4.9,
        enrolled: 2156,
        skills_covered: ['AWS', 'System Design', 'DevOps'],
        certification: true,
        price: '$199',
        estimated_completion: '2024-05-30'
      },
      {
        id: 3,
        title: 'Data Science for Engineers',
        description: 'Apply data science techniques to engineering problems',
        duration: '3 months',
        modules: 10,
        difficulty: 'intermediate',
        provider: 'DataCamp Pro',
        rating: 4.7,
        enrolled: 892,
        skills_covered: ['Python', 'Data Analysis', 'Machine Learning'],
        certification: true,
        price: '$149',
        estimated_completion: '2024-04-30'
      }
    ];

    // Filter learning paths based on query parameters
    let filteredPaths = learningPaths;
    if (skill) {
      filteredPaths = filteredPaths.filter(path => 
        path.skills_covered.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }
    if (difficulty) {
      filteredPaths = filteredPaths.filter(path => path.difficulty === difficulty);
    }

    res.json({
      success: true,
      data: filteredPaths,
      total: filteredPaths.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Learning paths error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch learning paths'
    });
  }
});

/**
 * GET /career/analytics
 * Get career development analytics and insights
 */
router.get('/analytics', authenticate, requireFeature('career.basic'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    // Mock analytics data
    const analytics = {
      overview: {
        career_score: 847,
        skills_growth: '+12%',
        goals_completed: 8,
        certifications_earned: 2,
        network_connections: 156,
        learning_hours: 47
      },
      salary_insights: {
        current_range: '$95,000',
        market_average: '$98,500',
        top_10_percent: '$135,000',
        growth_projection: '+8% annually',
        skill_impact: {
          'AWS': '+22%',
          'Team Management': '+25%',
          'Python': '+18%'
        }
      },
      skill_trends: [
        { skill: 'JavaScript', level: 9, trend: '+0.5', market_demand: 'high' },
        { skill: 'AWS', level: 5, trend: '+1.5', market_demand: 'very high' },
        { skill: 'Team Management', level: 6, trend: '+0.7', market_demand: 'high' }
      ],
      goal_progress: {
        total_goals: 3,
        completed_goals: 0,
        in_progress_goals: 3,
        average_progress: 0.48,
        on_track_goals: 2,
        at_risk_goals: 1
      },
      recommendations: [
        'Focus on AWS certification to increase salary potential by 22%',
        'Complete leadership training to advance to Tech Lead role',
        'Expand professional network through industry events'
      ],
      timeRange
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch career analytics'
    });
  }
});

module.exports = router;