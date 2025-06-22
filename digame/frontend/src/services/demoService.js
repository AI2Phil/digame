/**
 * Comprehensive Demo Service for Digame Platform
 * Provides extensive mock data for all dashboard areas and features
 * Ensures demo mode is fully functional without backend dependencies
 */

class DemoService {
  constructor() {
    this.isDemo = false;
    this.demoData = this.initializeDemoData();
  }

  setDemoMode(enabled) {
    this.isDemo = enabled;
    if (enabled) {
      localStorage.setItem('demo_mode', 'true');
    } else {
      localStorage.removeItem('demo_mode');
    }
  }

  isDemoMode() {
    return this.isDemo || localStorage.getItem('demo_mode') === 'true';
  }

  initializeDemoData() {
    return {
      // User Profile Data
      currentUser: {
        id: 'demo_user_001',
        username: 'demo_user',
        email: 'demo@digame.com',
        firstName: 'Alex',
        lastName: 'Demo',
        role: 'Professional',
        avatar: null,
        detailedBio: 'Experienced software engineer passionate about AI and digital transformation. Currently exploring how digital twins can enhance professional development and productivity.',
        contactInfo: {
          linkedin: 'linkedin.com/in/alexdemo',
          website: 'alexdemo.dev',
          professionalEmail: 'alex.demo@company.com',
          phone: '+1 (555) 123-4567'
        },
        projects: [
          {
            id: 'proj_001',
            title: 'AI-Powered Analytics Dashboard',
            description: 'Built a comprehensive analytics platform using React, Python, and machine learning algorithms to provide real-time business insights.',
            url: 'https://github.com/alexdemo/analytics-dashboard',
            technologiesUsed: ['React', 'Python', 'TensorFlow', 'PostgreSQL', 'Docker'],
            status: 'Completed',
            startDate: '2024-01-15',
            endDate: '2024-06-30'
          },
          {
            id: 'proj_002',
            title: 'Mobile Productivity App',
            description: 'Developed a cross-platform mobile application for task management and productivity tracking with AI-powered recommendations.',
            url: 'https://github.com/alexdemo/productivity-app',
            technologiesUsed: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
            status: 'In Progress',
            startDate: '2024-07-01',
            endDate: null
          },
          {
            id: 'proj_003',
            title: 'Blockchain Supply Chain',
            description: 'Implemented a blockchain-based supply chain tracking system for enhanced transparency and security.',
            url: 'https://github.com/alexdemo/blockchain-supply',
            technologiesUsed: ['Solidity', 'Web3.js', 'Ethereum', 'React'],
            status: 'Completed',
            startDate: '2023-09-01',
            endDate: '2023-12-15'
          }
        ],
        experience: [
          {
            id: 'exp_001',
            jobTitle: 'Senior Software Engineer',
            company: 'TechCorp Solutions',
            duration: '2022-Present',
            description: 'Leading development of enterprise-scale applications, mentoring junior developers, and implementing AI-driven solutions for business optimization.',
            location: 'San Francisco, CA',
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Machine Learning']
          },
          {
            id: 'exp_002',
            jobTitle: 'Full Stack Developer',
            company: 'Innovation Labs',
            duration: '2020-2022',
            description: 'Developed and maintained multiple web applications, collaborated with cross-functional teams, and contributed to architectural decisions.',
            location: 'Austin, TX',
            skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes']
          },
          {
            id: 'exp_003',
            jobTitle: 'Software Developer',
            company: 'StartupXYZ',
            duration: '2018-2020',
            description: 'Built MVP products from scratch, worked in agile environment, and gained experience in rapid prototyping and deployment.',
            location: 'Remote',
            skills: ['JavaScript', 'Python', 'MongoDB', 'React', 'Express.js']
          }
        ],
        education: [
          {
            id: 'edu_001',
            institution: 'Stanford University',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            graduationYear: '2018',
            gpa: '3.8',
            achievements: ['Dean\'s List', 'AI Research Assistant', 'Thesis: "Machine Learning in Real-time Systems"']
          },
          {
            id: 'edu_002',
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Engineering',
            graduationYear: '2016',
            gpa: '3.7',
            achievements: ['Magna Cum Laude', 'IEEE Student Chapter President']
          }
        ],
        skills: [
          { name: 'JavaScript', level: 95, category: 'Programming' },
          { name: 'Python', level: 90, category: 'Programming' },
          { name: 'React', level: 92, category: 'Frontend' },
          { name: 'Node.js', level: 88, category: 'Backend' },
          { name: 'Machine Learning', level: 85, category: 'AI/ML' },
          { name: 'AWS', level: 82, category: 'Cloud' },
          { name: 'Docker', level: 80, category: 'DevOps' },
          { name: 'PostgreSQL', level: 78, category: 'Database' }
        ],
        kudosCount: 47,
        is_active: true,
        verified: true,
        joinDate: '2024-01-01',
        lastActive: new Date().toISOString()
      },

      // Dashboard Analytics Data
      dashboardMetrics: {
        productivityScore: {
          current: 87,
          target: 90,
          change: 5,
          trend: [75, 78, 82, 85, 87, 89, 87],
          insights: [
            'Peak performance between 9-11 AM',
            'Consistent improvement over 7 days',
            '3% above team average'
          ]
        },
        focusTime: {
          current: 6.2,
          target: 8,
          change: 0.8,
          trend: [5.2, 5.8, 6.1, 5.9, 6.4, 6.0, 6.2],
          insights: [
            'Longest focus session: 2.5h',
            'Best focus day: Tuesday',
            'Distraction rate decreased 15%'
          ]
        },
        collaboration: {
          current: 8.4,
          target: 10,
          trend: [7.8, 8.1, 8.3, 8.0, 8.6, 8.2, 8.4],
          insights: [
            'Strong team communication',
            'Balanced meeting schedule',
            'High engagement in discussions'
          ]
        },
        growthRate: {
          current: 12,
          trend: [8, 9, 10, 11, 12, 11, 12],
          insights: [
            'Skill development accelerating',
            'Learning goals on track',
            'Knowledge sharing increased'
          ]
        }
      },

      // Productivity Chart Data
      productivityData: {
        daily: [
          { date: '2024-12-16', productivity: 75, focus: 5.2, collaboration: 7.8, tasks: 12 },
          { date: '2024-12-17', productivity: 78, focus: 5.8, collaboration: 8.1, tasks: 15 },
          { date: '2024-12-18', productivity: 82, focus: 6.1, collaboration: 8.3, tasks: 18 },
          { date: '2024-12-19', productivity: 85, focus: 5.9, collaboration: 8.0, tasks: 16 },
          { date: '2024-12-20', productivity: 87, focus: 6.4, collaboration: 8.6, tasks: 20 },
          { date: '2024-12-21', productivity: 89, focus: 6.0, collaboration: 8.2, tasks: 17 },
          { date: '2024-12-22', productivity: 87, focus: 6.2, collaboration: 8.4, tasks: 19 }
        ],
        weekly: [
          { week: 'Week 1', productivity: 78, focus: 5.5, collaboration: 7.9 },
          { week: 'Week 2', productivity: 82, focus: 5.8, collaboration: 8.1 },
          { week: 'Week 3', productivity: 85, focus: 6.0, collaboration: 8.3 },
          { week: 'Week 4', productivity: 87, focus: 6.2, collaboration: 8.4 }
        ]
      },

      // Activity Breakdown Data
      activityBreakdown: {
        categories: [
          { name: 'Development', value: 45, color: '#3B82F6', hours: 36 },
          { name: 'Meetings', value: 20, color: '#10B981', hours: 16 },
          { name: 'Learning', value: 15, color: '#F59E0B', hours: 12 },
          { name: 'Planning', value: 10, color: '#EF4444', hours: 8 },
          { name: 'Documentation', value: 10, color: '#8B5CF6', hours: 8 }
        ],
        totalHours: 80,
        efficiency: 92
      },

      // Recent Activities
      recentActivities: [
        {
          id: 'act_001',
          type: 'task_completed',
          title: 'Completed API Integration',
          description: 'Successfully integrated third-party payment API with error handling',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          category: 'Development',
          impact: 'high'
        },
        {
          id: 'act_002',
          type: 'meeting_attended',
          title: 'Sprint Planning Meeting',
          description: 'Participated in sprint planning for Q1 2025 roadmap',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          category: 'Meetings',
          impact: 'medium'
        },
        {
          id: 'act_003',
          type: 'skill_learned',
          title: 'Completed React Advanced Patterns Course',
          description: 'Finished advanced React patterns course with 95% score',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          category: 'Learning',
          impact: 'high'
        },
        {
          id: 'act_004',
          type: 'code_review',
          title: 'Reviewed Pull Request #247',
          description: 'Provided detailed feedback on authentication module improvements',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          category: 'Development',
          impact: 'medium'
        },
        {
          id: 'act_005',
          type: 'documentation',
          title: 'Updated API Documentation',
          description: 'Added comprehensive examples and error codes to API docs',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          category: 'Documentation',
          impact: 'medium'
        }
      ],

      // Analytics Data
      webAnalytics: {
        pageViews: {
          total: 15420,
          change: 12.5,
          data: [
            { date: '2024-12-16', views: 2100 },
            { date: '2024-12-17', views: 2250 },
            { date: '2024-12-18', views: 2180 },
            { date: '2024-12-19', views: 2300 },
            { date: '2024-12-20', views: 2400 },
            { date: '2024-12-21', views: 2190 },
            { date: '2024-12-22', views: 2000 }
          ]
        },
        userSessions: {
          total: 8750,
          change: 8.3,
          avgDuration: '4m 32s',
          bounceRate: 23.4
        },
        topPages: [
          { page: '/dashboard', views: 4200, change: 15.2 },
          { page: '/analytics', views: 3100, change: 8.7 },
          { page: '/social', views: 2800, change: 12.1 },
          { page: '/ai-tools', views: 2400, change: 18.5 },
          { page: '/tasks', views: 1900, change: 5.3 }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 65, users: 5687 },
          { device: 'Mobile', percentage: 28, users: 2450 },
          { device: 'Tablet', percentage: 7, users: 613 }
        ]
      },

      mobileAnalytics: {
        appSessions: {
          total: 12300,
          change: 15.7,
          avgDuration: '6m 45s',
          retention: 78.5
        },
        deviceMetrics: {
          crashRate: 0.02,
          loadTime: 1.8,
          batteryImpact: 'Low',
          memoryUsage: '45MB'
        },
        featureUsage: [
          { feature: 'Dashboard', usage: 89, engagement: 'High' },
          { feature: 'Notifications', usage: 76, engagement: 'High' },
          { feature: 'AI Tools', usage: 65, engagement: 'Medium' },
          { feature: 'Social', usage: 58, engagement: 'Medium' },
          { feature: 'Analytics', usage: 42, engagement: 'Low' }
        ],
        platformBreakdown: [
          { platform: 'iOS', percentage: 58, users: 7134 },
          { platform: 'Android', percentage: 42, users: 5166 }
        ]
      },

      // Behavioral Analytics
      behaviorAnalytics: {
        patterns: [
          {
            pattern: 'Morning Productivity Peak',
            description: 'Highest productivity observed between 9-11 AM',
            confidence: 94,
            impact: 'High',
            recommendation: 'Schedule complex tasks during morning hours'
          },
          {
            pattern: 'Collaboration Preference',
            description: 'Prefers small group discussions over large meetings',
            confidence: 87,
            impact: 'Medium',
            recommendation: 'Optimize meeting sizes for better engagement'
          },
          {
            pattern: 'Learning Style',
            description: 'Visual learner with preference for hands-on practice',
            confidence: 91,
            impact: 'High',
            recommendation: 'Provide visual aids and practical exercises'
          }
        ],
        workPatterns: {
          peakHours: ['9:00-11:00', '14:00-16:00'],
          preferredBreaks: 15,
          focusBlocks: 90,
          multitaskingTendency: 'Low'
        }
      },

      // Predictive Analytics
      predictiveAnalytics: {
        goalCompletion: {
          probability: 85,
          timeToCompletion: '3 weeks',
          riskFactors: ['Scope creep', 'Resource availability'],
          recommendations: [
            'Break down large tasks into smaller milestones',
            'Allocate buffer time for unexpected challenges'
          ]
        },
        skillDevelopment: {
          nextSkill: 'Machine Learning',
          readiness: 78,
          estimatedTime: '6 months',
          prerequisites: ['Statistics', 'Python Advanced']
        },
        careerPath: {
          nextRole: 'Tech Lead',
          probability: 72,
          timeframe: '12-18 months',
          skillGaps: ['Team Management', 'System Architecture']
        }
      },

      // AI Tools Data
      aiTools: {
        recommendations: [
          {
            id: 'rec_001',
            type: 'skill_development',
            title: 'Learn Advanced React Patterns',
            description: 'Based on your current projects, learning advanced React patterns would enhance your frontend development capabilities.',
            priority: 'High',
            estimatedTime: '2 weeks',
            resources: ['React Documentation', 'Advanced React Course', 'Practice Projects']
          },
          {
            id: 'rec_002',
            type: 'networking',
            title: 'Connect with ML Engineers',
            description: 'Expand your network in machine learning to support your AI project goals.',
            priority: 'Medium',
            estimatedTime: '1 week',
            resources: ['LinkedIn', 'ML Conferences', 'Online Communities']
          },
          {
            id: 'rec_003',
            type: 'productivity',
            title: 'Optimize Morning Routine',
            description: 'Your productivity peaks in the morning. Consider restructuring your schedule to maximize this time.',
            priority: 'Medium',
            estimatedTime: '3 days',
            resources: ['Time Blocking', 'Calendar Optimization', 'Focus Techniques']
          }
        ],
        insights: [
          {
            category: 'Performance',
            insight: 'Your coding velocity has increased 23% over the past month',
            actionable: true,
            action: 'Consider taking on more complex challenges'
          },
          {
            category: 'Learning',
            insight: 'You learn best through hands-on practice rather than theoretical study',
            actionable: true,
            action: 'Prioritize project-based learning approaches'
          },
          {
            category: 'Collaboration',
            insight: 'Your code reviews receive consistently positive feedback',
            actionable: true,
            action: 'Consider mentoring junior developers'
          }
        ],
        coaching: [
          {
            area: 'Technical Leadership',
            currentLevel: 'Intermediate',
            targetLevel: 'Advanced',
            plan: [
              'Lead a small team project',
              'Practice architectural decision making',
              'Develop communication skills',
              'Study system design patterns'
            ],
            timeline: '6 months'
          }
        ]
      },

      // Social Collaboration Data
      socialData: {
        connections: [
          {
            id: 'user_002',
            name: 'Sarah Chen',
            role: 'UX Designer',
            company: 'DesignCorp',
            skills: ['UI/UX', 'Figma', 'User Research'],
            connectionStrength: 'Strong',
            lastInteraction: '2 days ago',
            avatar: null
          },
          {
            id: 'user_003',
            name: 'Michael Rodriguez',
            role: 'Data Scientist',
            company: 'DataTech',
            skills: ['Python', 'Machine Learning', 'Statistics'],
            connectionStrength: 'Medium',
            lastInteraction: '1 week ago',
            avatar: null
          },
          {
            id: 'user_004',
            name: 'Emily Johnson',
            role: 'Product Manager',
            company: 'ProductCo',
            skills: ['Product Strategy', 'Agile', 'Analytics'],
            connectionStrength: 'Strong',
            lastInteraction: '3 days ago',
            avatar: null
          }
        ],
        peerMatches: [
          {
            id: 'user_005',
            name: 'David Kim',
            role: 'Senior Developer',
            company: 'TechStart',
            matchScore: 92,
            commonSkills: ['React', 'Node.js', 'AWS'],
            reason: 'Similar technical background and career trajectory'
          },
          {
            id: 'user_006',
            name: 'Lisa Wang',
            role: 'AI Engineer',
            company: 'AI Solutions',
            matchScore: 88,
            commonSkills: ['Python', 'Machine Learning', 'TensorFlow'],
            reason: 'Shared interest in AI and machine learning applications'
          }
        ],
        mentorshipOpportunities: [
          {
            id: 'mentor_001',
            name: 'Robert Thompson',
            role: 'Engineering Director',
            company: 'MegaCorp',
            expertise: ['Technical Leadership', 'System Architecture', 'Team Management'],
            availability: 'Available',
            rating: 4.9
          }
        ],
        collaborationProjects: [
          {
            id: 'proj_collab_001',
            title: 'Open Source Analytics Library',
            description: 'Building a comprehensive analytics library for React applications',
            participants: 8,
            skills: ['React', 'TypeScript', 'Data Visualization'],
            status: 'Active',
            progress: 65
          }
        ]
      },

      // Task Management Data
      tasks: [
        {
          id: 'task_001',
          title: 'Implement user authentication',
          description: 'Add OAuth2 authentication with Google and GitHub providers',
          priority: 'High',
          status: 'In Progress',
          dueDate: '2024-12-28',
          estimatedHours: 8,
          completedHours: 5,
          tags: ['Backend', 'Security', 'Authentication'],
          assignee: 'demo_user_001'
        },
        {
          id: 'task_002',
          title: 'Design mobile app wireframes',
          description: 'Create wireframes for the mobile application user interface',
          priority: 'Medium',
          status: 'Todo',
          dueDate: '2024-12-30',
          estimatedHours: 12,
          completedHours: 0,
          tags: ['Design', 'Mobile', 'UI/UX'],
          assignee: 'demo_user_001'
        },
        {
          id: 'task_003',
          title: 'Write API documentation',
          description: 'Document all REST API endpoints with examples and error codes',
          priority: 'Medium',
          status: 'Completed',
          dueDate: '2024-12-20',
          estimatedHours: 6,
          completedHours: 6,
          tags: ['Documentation', 'API'],
          assignee: 'demo_user_001'
        }
      ],

      // Enterprise Data
      enterpriseData: {
        tenants: [
          {
            id: 'tenant_001',
            name: 'TechCorp Solutions',
            users: 150,
            status: 'Active',
            plan: 'Enterprise',
            usage: 85,
            lastActivity: '2 hours ago'
          },
          {
            id: 'tenant_002',
            name: 'Innovation Labs',
            users: 75,
            status: 'Active',
            plan: 'Professional',
            usage: 72,
            lastActivity: '1 day ago'
          }
        ],
        security: {
          threatLevel: 'Low',
          lastScan: '2024-12-22T10:30:00Z',
          vulnerabilities: 0,
          compliance: 98.5
        },
        integrations: [
          { name: 'Slack', status: 'Connected', users: 120 },
          { name: 'Microsoft Teams', status: 'Connected', users: 95 },
          { name: 'Jira', status: 'Connected', users: 80 },
          { name: 'GitHub', status: 'Connected', users: 110 }
        ]
      },

      // Notifications
      notifications: [
        {
          id: 'notif_001',
          type: 'achievement',
          title: 'Productivity Milestone Reached!',
          message: 'You\'ve maintained 85%+ productivity for 7 consecutive days',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium'
        },
        {
          id: 'notif_002',
          type: 'recommendation',
          title: 'New Learning Opportunity',
          message: 'Based on your interests, we recommend the "Advanced React Patterns" course',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'low'
        },
        {
          id: 'notif_003',
          type: 'social',
          title: 'New Connection Request',
          message: 'David Kim wants to connect with you',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'medium'
        },
        {
          id: 'notif_004',
          type: 'system',
          title: 'Weekly Report Ready',
          message: 'Your weekly productivity report is now available',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low'
        }
      ],

      // Reports Data
      reports: {
        weekly: {
          productivity: 87,
          focusTime: 42.5,
          tasksCompleted: 23,
          meetingsAttended: 8,
          learningHours: 6.5,
          collaborationScore: 8.4
        },
        monthly: {
          productivity: 85,
          focusTime: 168,
          tasksCompleted: 95,
          meetingsAttended: 32,
          learningHours: 24,
          collaborationScore: 8.2
        },
        goals: [
          {
            id: 'goal_001',
            title: 'Complete React Certification',
            progress: 75,
            target: 100,
            deadline: '2024-12-31',
            status: 'On Track'
          },
          {
            id: 'goal_002',
            title: 'Improve Code Review Quality',
            progress: 90,
            target: 100,
            deadline: '2024-12-25',
            status: 'Ahead'
          }
        ]
      },

      // Additional comprehensive demo data for all features
      aiToolsData: {
        writingAssistance: {
          suggestions: [
            {
              id: 'suggestion_001',
              type: 'grammar',
              original: 'The team are working on the project.',
              suggestion: 'The team is working on the project.',
              confidence: 95,
              explanation: 'Collective nouns like "team" typically take singular verbs.'
            },
            {
              id: 'suggestion_002',
              type: 'clarity',
              original: 'We need to optimize the performance of the application.',
              suggestion: 'We need to improve the application\'s speed and efficiency.',
              confidence: 88,
              explanation: 'More specific language helps readers understand exactly what needs improvement.'
            }
          ],
          templates: [
            {
              id: 'template_001',
              name: 'Project Status Update',
              category: 'Business Communication',
              content: 'Hi team,\n\nHere\'s our weekly project update:\n\n**Completed:**\n- [List completed tasks]\n\n**In Progress:**\n- [List ongoing tasks]\n\n**Upcoming:**\n- [List planned tasks]\n\n**Blockers:**\n- [List any issues]\n\nBest regards,\n[Your name]'
            },
            {
              id: 'template_002',
              name: 'Meeting Follow-up',
              category: 'Business Communication',
              content: 'Hi everyone,\n\nThank you for attending today\'s meeting. Here are the key takeaways:\n\n**Decisions Made:**\n- [List decisions]\n\n**Action Items:**\n- [List action items with owners]\n\n**Next Steps:**\n- [List next steps]\n\nPlease let me know if I missed anything.\n\nBest,\n[Your name]'
            }
          ]
        },
        insights: [
          {
            id: 'insight_001',
            category: 'Productivity',
            title: 'Peak Performance Hours Identified',
            description: 'Your productivity is 23% higher between 9-11 AM compared to other times.',
            actionable: true,
            actions: ['Schedule important tasks during morning hours', 'Block calendar for deep work'],
            confidence: 92
          },
          {
            id: 'insight_002',
            category: 'Collaboration',
            title: 'Meeting Efficiency Opportunity',
            description: 'You spend 35% of your time in meetings, but only 60% are rated as productive.',
            actionable: true,
            actions: ['Implement meeting agendas', 'Set clear objectives', 'Consider async alternatives'],
            confidence: 87
          }
        ],
        coaching: [
          {
            id: 'coaching_001',
            area: 'Time Management',
            level: 'Intermediate',
            recommendations: [
              'Use time-blocking for better focus',
              'Implement the Pomodoro Technique',
              'Set boundaries for interruptions'
            ],
            progress: 65,
            nextMilestone: 'Complete 5 consecutive days of time-blocking'
          },
          {
            id: 'coaching_002',
            area: 'Communication Skills',
            level: 'Advanced',
            recommendations: [
              'Practice active listening in meetings',
              'Provide more specific feedback',
              'Use data to support arguments'
            ],
            progress: 80,
            nextMilestone: 'Lead a cross-functional project presentation'
          }
        ]
      },

      // Enhanced analytics data
      advancedAnalytics: {
        heatmapData: [
          { hour: '9:00', day: 'Monday', value: 85 },
          { hour: '10:00', day: 'Monday', value: 92 },
          { hour: '11:00', day: 'Monday', value: 88 },
          { hour: '14:00', day: 'Monday', value: 75 },
          { hour: '15:00', day: 'Monday', value: 70 },
          { hour: '9:00', day: 'Tuesday', value: 90 },
          { hour: '10:00', day: 'Tuesday', value: 95 },
          { hour: '11:00', day: 'Tuesday', value: 85 },
          { hour: '14:00', day: 'Tuesday', value: 78 },
          { hour: '15:00', day: 'Tuesday', value: 72 }
        ],
        userJourney: [
          { step: 'Login', users: 1000, conversion: 100 },
          { step: 'Dashboard View', users: 950, conversion: 95 },
          { step: 'Feature Usage', users: 800, conversion: 80 },
          { step: 'Task Creation', users: 600, conversion: 60 },
          { step: 'Goal Setting', users: 400, conversion: 40 },
          { step: 'Report Generation', users: 300, conversion: 30 }
        ],
        performanceMetrics: {
          pageLoadTime: 1.2,
          apiResponseTime: 250,
          errorRate: 0.02,
          uptime: 99.9,
          userSatisfaction: 4.6
        }
      },

      // Social collaboration enhancements
      enhancedSocialData: {
        networkAnalysis: {
          connectionStrength: 85,
          networkSize: 127,
          influenceScore: 72,
          collaborationIndex: 8.4
        },
        skillMatching: [
          {
            skill: 'React Development',
            yourLevel: 92,
            demandLevel: 88,
            matchingPeers: 15,
            learningOpportunities: 3
          },
          {
            skill: 'Machine Learning',
            yourLevel: 65,
            demandLevel: 95,
            matchingPeers: 8,
            learningOpportunities: 12
          }
        ],
        industryInsights: [
          {
            trend: 'AI Integration in Development',
            relevance: 95,
            growth: '+45%',
            timeframe: '6 months',
            recommendation: 'Consider upskilling in AI/ML tools'
          },
          {
            trend: 'Remote Collaboration Tools',
            relevance: 88,
            growth: '+32%',
            timeframe: '3 months',
            recommendation: 'Explore advanced collaboration platforms'
          }
        ]
      }
    };
  }

  // Getter methods for different data types
  getCurrentUser() {
    return this.demoData.currentUser;
  }

  getDashboardMetrics() {
    return this.demoData.dashboardMetrics;
  }

  getProductivityData(timeRange = 'daily') {
    return this.demoData.productivityData[timeRange] || this.demoData.productivityData.daily;
  }

  getActivityBreakdown() {
    return this.demoData.activityBreakdown;
  }

  getRecentActivities(limit = 10) {
    return this.demoData.recentActivities.slice(0, limit);
  }

  getWebAnalytics() {
    return this.demoData.webAnalytics;
  }

  getMobileAnalytics() {
    return this.demoData.mobileAnalytics;
  }

  getBehaviorAnalytics() {
    return this.demoData.behaviorAnalytics;
  }

  getPredictiveAnalytics() {
    return this.demoData.predictiveAnalytics;
  }

  getAIRecommendations() {
    return this.demoData.aiTools.recommendations;
  }

  getAIInsights() {
    return this.demoData.aiTools.insights;
  }

  getCoachingPlans() {
    return this.demoData.aiTools.coaching;
  }

  getSocialConnections() {
    return this.demoData.socialData.connections;
  }

  getPeerMatches() {
    return this.demoData.socialData.peerMatches;
  }

  getMentorshipOpportunities() {
    return this.demoData.socialData.mentorshipOpportunities;
  }

  getCollaborationProjects() {
    return this.demoData.socialData.collaborationProjects;
  }

  getTasks(status = null) {
    if (status) {
      return this.demoData.tasks.filter(task => task.status === status);
    }
    return this.demoData.tasks;
  }

  getEnterpriseData() {
    return this.demoData.enterpriseData;
  }

  getNotifications(unreadOnly = false) {
    if (unreadOnly) {
      return this.demoData.notifications.filter(notif => !notif.read);
    }
    return this.demoData.notifications;
  }

  getReports() {
    return this.demoData.reports;
  }

  // New getter methods for enhanced demo data
  getAIToolsData() {
    return this.demoData.aiToolsData;
  }

  getWritingAssistance() {
    return this.demoData.aiToolsData.writingAssistance;
  }

  getAICoaching() {
    return this.demoData.aiToolsData.coaching;
  }

  getAdvancedAnalytics() {
    return this.demoData.advancedAnalytics;
  }

  getEnhancedSocialData() {
    return this.demoData.enhancedSocialData;
  }

  getHeatmapData() {
    return this.demoData.advancedAnalytics.heatmapData;
  }

  getUserJourneyData() {
    return this.demoData.advancedAnalytics.userJourney;
  }

  getPerformanceMetrics() {
    return this.demoData.advancedAnalytics.performanceMetrics;
  }

  getNetworkAnalysis() {
    return this.demoData.enhancedSocialData.networkAnalysis;
  }

  getSkillMatching() {
    return this.demoData.enhancedSocialData.skillMatching;
  }

  getIndustryInsights() {
    return this.demoData.enhancedSocialData.industryInsights;
  }

  // Utility methods for demo interactions
  markNotificationAsRead(notificationId) {
    const notification = this.demoData.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return Promise.resolve({ success: true });
  }

  updateTaskStatus(taskId, status) {
    const task = this.demoData.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'Completed') {
        task.completedHours = task.estimatedHours;
      }
    }
    return Promise.resolve({ success: true });
  }

  addConnection(userId) {
    // Simulate adding a connection
    return Promise.resolve({ success: true, message: 'Connection request sent' });
  }

  // Method to simulate API calls with demo data
  async simulateApiCall(endpoint, options = {}) {
    // Add realistic delay to simulate network requests
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    // Route to appropriate demo data based on endpoint
    switch (endpoint) {
      case '/auth/me':
        return this.getCurrentUser();
      case '/api/dashboard':
        return this.getDashboardMetrics();
      case '/analytics/web':
        return this.getWebAnalytics();
      case '/analytics/mobile':
        return this.getMobileAnalytics();
      case '/behavior/analysis':
        return this.getBehaviorAnalytics();
      case '/predictive/insights':
        return this.getPredictiveAnalytics();
      case '/ai/recommendations':
        return this.getAIRecommendations();
      case '/social/connections':
        return this.getSocialConnections();
      case '/social/peer-matches':
        return this.getPeerMatches();
      case '/tasks':
        return this.getTasks();
      case '/enterprise':
        return this.getEnterpriseData();
      case '/api/notifications':
        return this.getNotifications();
      case '/reports':
        return this.getReports();
      default:
        return { message: 'Demo data not available for this endpoint' };
    }
  }

  // Generate realistic time-series data
  generateTimeSeriesData(days = 7, baseValue = 50, variance = 20) {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.round(value * 100) / 100)
      });
    }
    
    return data;
  }

  // Update demo data dynamically (for interactive demo features)
  updateDemoData(path, newData) {
    const pathArray = path.split('.');
    let current = this.demoData;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = newData;
  }

  // Reset demo data to initial state
  resetDemoData() {
    this.demoData = this.initializeDemoData();
  }
}

// Create and export a singleton instance
const demoService = new DemoService();

export default demoService;
export { DemoService };