const express = require('express');
const router = express.Router();

// Mock data for career endpoints
const mockCareerData = {
  modeling: {
    currentProfile: {
      name: "Alex Johnson",
      currentRole: "Senior Software Engineer",
      experience: "5 years",
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
      strengths: ["Problem Solving", "Team Leadership", "Technical Architecture"],
      improvementAreas: ["Public Speaking", "Product Strategy", "Data Analysis"]
    },
    careerPaths: [
      {
        id: 1,
        title: "Engineering Manager",
        probability: 85,
        timeframe: "2-3 years",
        salaryRange: "$140k - $180k",
        requiredSkills: ["Leadership", "Project Management", "Strategic Planning"],
        milestones: [
          { title: "Lead a team of 3+ engineers", completed: true, deadline: "Q2 2024" },
          { title: "Complete management training", completed: false, deadline: "Q4 2024" },
          { title: "Deliver major product milestone", completed: false, deadline: "Q1 2025" }
        ]
      },
      {
        id: 2,
        title: "Principal Engineer",
        probability: 75,
        timeframe: "3-4 years",
        salaryRange: "$160k - $220k",
        requiredSkills: ["System Design", "Mentoring", "Technical Strategy"],
        milestones: [
          { title: "Design system architecture", completed: true, deadline: "Q3 2024" },
          { title: "Mentor junior engineers", completed: true, deadline: "Ongoing" },
          { title: "Lead technical initiatives", completed: false, deadline: "Q2 2025" }
        ]
      }
    ],
    marketTrends: {
      demandGrowth: 23,
      salaryTrend: "increasing",
      topSkills: ["Cloud Computing", "AI/ML", "DevOps", "Cybersecurity"],
      emergingRoles: ["AI Engineer", "DevOps Architect", "Data Engineer"]
    }
  },
  jobs: {
    recommended: [
      {
        id: 1,
        title: "Senior Full Stack Developer",
        company: "TechCorp Inc",
        location: "San Francisco, CA",
        type: "Full-time",
        remote: true,
        salary: "$130k - $160k",
        matchScore: 92,
        postedDate: "2024-03-01",
        description: "Join our team building next-generation web applications",
        requirements: ["React", "Node.js", "AWS", "5+ years experience"],
        benefits: ["Health Insurance", "401k", "Flexible Hours", "Remote Work"]
      },
      {
        id: 2,
        title: "Lead Frontend Engineer",
        company: "StartupXYZ",
        location: "Austin, TX",
        type: "Full-time",
        remote: false,
        salary: "$120k - $150k",
        matchScore: 88,
        postedDate: "2024-02-28",
        description: "Lead our frontend team in building innovative user experiences",
        requirements: ["React", "TypeScript", "Leadership", "4+ years experience"],
        benefits: ["Equity", "Health Insurance", "Learning Budget"]
      }
    ],
    applications: [
      {
        id: 1,
        jobTitle: "Senior Software Engineer",
        company: "MegaTech Corp",
        appliedDate: "2024-02-15",
        status: "interview_scheduled",
        stage: "Technical Interview",
        nextStep: "System Design Interview on March 20th",
        recruiterContact: "sarah.johnson@megatech.com"
      },
      {
        id: 2,
        jobTitle: "Full Stack Developer",
        company: "InnovateCo",
        appliedDate: "2024-02-10",
        status: "under_review",
        stage: "Application Review",
        nextStep: "Waiting for initial screening",
        recruiterContact: "mike.chen@innovateco.com"
      }
    ],
    saved: [
      {
        id: 1,
        title: "Principal Engineer",
        company: "CloudTech",
        savedDate: "2024-03-05",
        notes: "Great company culture, interesting technical challenges",
        expiryDate: "2024-04-01"
      }
    ],
    marketInsights: {
      averageSalary: "$145k",
      salaryTrend: "+12% YoY",
      jobGrowth: "+18% in last 6 months",
      topCompanies: ["Google", "Meta", "Amazon", "Microsoft"],
      inDemandSkills: ["React", "Python", "AWS", "Kubernetes"]
    }
  },
  skills: {
    overview: {
      totalSkills: 24,
      expertLevel: 8,
      intermediateLevel: 12,
      beginnerLevel: 4,
      marketDemandScore: 78
    },
    categories: [
      {
        name: "Frontend Development",
        skills: [
          {
            name: "React",
            level: "Expert",
            proficiency: 90,
            marketDemand: "High",
            endorsements: 23,
            lastUsed: "Currently using"
          },
          {
            name: "TypeScript",
            level: "Advanced",
            proficiency: 80,
            marketDemand: "High",
            endorsements: 18,
            lastUsed: "2 weeks ago"
          }
        ]
      },
      {
        name: "Backend Development",
        skills: [
          {
            name: "Node.js",
            level: "Advanced",
            proficiency: 85,
            marketDemand: "High",
            endorsements: 20,
            lastUsed: "Currently using"
          },
          {
            name: "Python",
            level: "Intermediate",
            proficiency: 70,
            marketDemand: "Very High",
            endorsements: 15,
            lastUsed: "1 month ago"
          }
        ]
      }
    ],
    gaps: [
      {
        id: 1,
        skill: "Machine Learning",
        category: "Data Science",
        priority: 1,
        marketDemand: "Very High",
        salaryImpact: "+$25k",
        timeToLearn: "6-8 months",
        difficulty: "Advanced",
        relatedJobs: "45+ matches",
        learningPath: ["Python Basics", "Statistics", "ML Algorithms", "TensorFlow"]
      },
      {
        id: 2,
        skill: "Kubernetes",
        category: "DevOps",
        priority: 2,
        marketDemand: "High",
        salaryImpact: "+$15k",
        timeToLearn: "3-4 months",
        difficulty: "Intermediate",
        relatedJobs: "32+ matches",
        learningPath: ["Docker", "Container Orchestration", "K8s Fundamentals", "Production Deployment"]
      }
    ],
    recommendations: [
      {
        id: 1,
        type: "Skill Development",
        title: "Learn Machine Learning Fundamentals",
        description: "High demand skill that could increase your salary by $25k+",
        timeframe: "6 months",
        impact: "High",
        difficulty: "Advanced",
        action: "Start Learning Path"
      },
      {
        id: 2,
        type: "Certification",
        title: "AWS Solutions Architect Certification",
        description: "Validate your cloud skills with industry-recognized certification",
        timeframe: "3 months",
        impact: "Medium",
        difficulty: "Intermediate",
        action: "Begin Preparation"
      }
    ],
    analytics: {
      marketComparison: {
        yourLevel: "85th",
        industryAverage: "65th",
        topPercentile: "95th",
        targetLevel: "90th"
      },
      skillTrends: {
        growing: ["AI/ML", "Cloud Computing", "Cybersecurity", "Data Science"],
        stable: ["JavaScript", "Python", "SQL", "Git"],
        declining: ["jQuery", "PHP", "Flash", "Perl"]
      },
      salaryProjection: {
        current: "$135k",
        withGaps: "$160k",
        topTier: "$200k+",
        timeline: "2-3 years"
      }
    }
  },
  learning: {
    overview: {
      totalCourses: 156,
      completedCourses: 23,
      inProgress: 5,
      certificates: 12,
      learningHours: 247,
      currentStreak: 15
    },
    courses: [
      {
        id: 1,
        title: "Advanced React Development",
        provider: "TechAcademy",
        category: "Frontend Development",
        level: "Advanced",
        duration: "8 weeks",
        rating: 4.8,
        students: 12500,
        price: "$199",
        progress: 65,
        status: "in-progress",
        skills: ["React", "Redux", "TypeScript"],
        description: "Master advanced React patterns and build scalable applications",
        instructor: "Sarah Johnson",
        lastAccessed: "2 hours ago",
        nextLesson: "Context API Deep Dive"
      }
    ],
    learningPaths: [
      {
        id: 1,
        title: "Full Stack Developer",
        description: "Complete path from frontend to backend development",
        courses: 8,
        duration: "6 months",
        level: "Beginner to Advanced",
        progress: 37,
        skills: ["React", "Node.js", "MongoDB", "AWS"],
        students: 15000,
        rating: 4.8
      }
    ],
    certificates: [
      {
        id: 1,
        title: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        earnedDate: "2024-02-15",
        expiryDate: "2027-02-15",
        credentialId: "AWS-SA-2024-001",
        skills: ["AWS", "Cloud Architecture", "Security"],
        verified: true
      }
    ]
  },
  network: {
    overview: {
      totalConnections: 847,
      newRequests: 12,
      mutualConnections: 156,
      networkGrowth: 23,
      profileViews: 89,
      messagesSent: 34
    },
    connections: [
      {
        id: 1,
        name: "Sarah Johnson",
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        mutualConnections: 23,
        connectionDate: "2024-01-15",
        status: "connected",
        skills: ["React", "TypeScript", "Node.js"],
        lastActivity: "2 hours ago"
      }
    ],
    events: [
      {
        id: 1,
        title: "Tech Leaders Networking Mixer",
        date: "2024-03-15",
        time: "6:00 PM - 9:00 PM",
        location: "Downtown Convention Center",
        type: "In-person",
        attendees: 156,
        price: "Free",
        organizer: "Tech Community SF",
        description: "Connect with fellow tech professionals and industry leaders",
        tags: ["Networking", "Technology", "Leadership"],
        registered: false
      }
    ],
    mentorship: [
      {
        id: 1,
        name: "Dr. James Wilson",
        title: "VP of Engineering",
        company: "MegaTech Corp",
        expertise: ["Technical Leadership", "System Architecture", "Team Management"],
        experience: "15+ years",
        rating: 4.9,
        sessions: 127,
        price: "$150/hour",
        availability: "Available",
        bio: "Experienced engineering leader with expertise in scaling teams and systems"
      }
    ]
  }
};

// Career Modeling Routes
router.get('/modeling/profile', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.modeling.currentProfile
  });
});

router.get('/modeling/paths', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.modeling.careerPaths
  });
});

router.get('/modeling/trends', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.modeling.marketTrends
  });
});

router.post('/modeling/paths/:pathId/milestones/:milestoneId/complete', (req, res) => {
  const { pathId, milestoneId } = req.params;
  
  res.json({
    success: true,
    message: 'Milestone marked as completed',
    data: { pathId, milestoneId, completed: true }
  });
});

// Job Opportunities Routes
router.get('/jobs/recommended', (req, res) => {
  const { location, remote, salary_min, salary_max } = req.query;
  
  let jobs = mockCareerData.jobs.recommended;
  
  // Apply filters
  if (location) {
    jobs = jobs.filter(job => job.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (remote !== undefined) {
    jobs = jobs.filter(job => job.remote === (remote === 'true'));
  }
  
  res.json({
    success: true,
    data: jobs,
    total: jobs.length
  });
});

router.get('/jobs/applications', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.jobs.applications
  });
});

router.get('/jobs/saved', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.jobs.saved
  });
});

router.post('/jobs/:jobId/apply', (req, res) => {
  const { jobId } = req.params;
  const { coverLetter, resume } = req.body;
  
  res.json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      jobId,
      applicationId: `app_${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }
  });
});

router.post('/jobs/:jobId/save', (req, res) => {
  const { jobId } = req.params;
  const { notes } = req.body;
  
  res.json({
    success: true,
    message: 'Job saved successfully',
    data: {
      jobId,
      savedAt: new Date().toISOString(),
      notes
    }
  });
});

router.get('/jobs/market-insights', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.jobs.marketInsights
  });
});

// Skills Routes
router.get('/skills/overview', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.skills.overview
  });
});

router.get('/skills/categories', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.skills.categories
  });
});

router.get('/skills/gaps', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.skills.gaps
  });
});

router.get('/skills/recommendations', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.skills.recommendations
  });
});

router.get('/skills/analytics', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.skills.analytics
  });
});

router.post('/skills/:skillId/endorse', (req, res) => {
  const { skillId } = req.params;
  
  res.json({
    success: true,
    message: 'Skill endorsed successfully',
    data: { skillId, endorsed: true }
  });
});

router.post('/skills/gaps/:gapId/start-learning', (req, res) => {
  const { gapId } = req.params;
  
  res.json({
    success: true,
    message: 'Learning path started',
    data: { gapId, status: 'learning_started' }
  });
});

// Learning Routes
router.get('/learning/overview', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.learning.overview
  });
});

router.get('/learning/courses', (req, res) => {
  const { category, level, status } = req.query;
  
  let courses = mockCareerData.learning.courses;
  
  // Apply filters
  if (category) {
    courses = courses.filter(course => course.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (level) {
    courses = courses.filter(course => course.level.toLowerCase() === level.toLowerCase());
  }
  if (status) {
    courses = courses.filter(course => course.status === status);
  }
  
  res.json({
    success: true,
    data: courses,
    total: courses.length
  });
});

router.get('/learning/paths', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.learning.learningPaths
  });
});

router.get('/learning/certificates', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.learning.certificates
  });
});

router.post('/learning/courses/:courseId/enroll', (req, res) => {
  const { courseId } = req.params;
  
  res.json({
    success: true,
    message: 'Enrolled in course successfully',
    data: {
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'enrolled'
    }
  });
});

router.post('/learning/courses/:courseId/progress', (req, res) => {
  const { courseId } = req.params;
  const { progress, lessonId } = req.body;
  
  res.json({
    success: true,
    message: 'Progress updated',
    data: {
      courseId,
      progress,
      lessonId,
      updatedAt: new Date().toISOString()
    }
  });
});

// Network Routes
router.get('/network/overview', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.network.overview
  });
});

router.get('/network/connections', (req, res) => {
  const { status, company, location } = req.query;
  
  let connections = mockCareerData.network.connections;
  
  // Apply filters
  if (status) {
    connections = connections.filter(conn => conn.status === status);
  }
  if (company) {
    connections = connections.filter(conn => conn.company.toLowerCase().includes(company.toLowerCase()));
  }
  if (location) {
    connections = connections.filter(conn => conn.location.toLowerCase().includes(location.toLowerCase()));
  }
  
  res.json({
    success: true,
    data: connections,
    total: connections.length
  });
});

router.get('/network/events', (req, res) => {
  const { type, location, date } = req.query;
  
  let events = mockCareerData.network.events;
  
  // Apply filters
  if (type) {
    events = events.filter(event => event.type.toLowerCase() === type.toLowerCase());
  }
  if (location) {
    events = events.filter(event => event.location.toLowerCase().includes(location.toLowerCase()));
  }
  
  res.json({
    success: true,
    data: events,
    total: events.length
  });
});

router.get('/network/mentorship', (req, res) => {
  res.json({
    success: true,
    data: mockCareerData.network.mentorship
  });
});

router.post('/network/connections/:userId/connect', (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;
  
  res.json({
    success: true,
    message: 'Connection request sent',
    data: {
      userId,
      status: 'pending',
      sentAt: new Date().toISOString()
    }
  });
});

router.post('/network/connections/:userId/message', (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;
  
  res.json({
    success: true,
    message: 'Message sent successfully',
    data: {
      userId,
      messageId: `msg_${Date.now()}`,
      sentAt: new Date().toISOString()
    }
  });
});

router.post('/network/events/:eventId/register', (req, res) => {
  const { eventId } = req.params;
  
  res.json({
    success: true,
    message: 'Registered for event successfully',
    data: {
      eventId,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    }
  });
});

router.post('/network/mentorship/:mentorId/book', (req, res) => {
  const { mentorId } = req.params;
  const { date, time, topic } = req.body;
  
  res.json({
    success: true,
    message: 'Mentorship session booked',
    data: {
      mentorId,
      sessionId: `session_${Date.now()}`,
      date,
      time,
      topic,
      status: 'booked'
    }
  });
});

// Analytics Routes
router.get('/analytics/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      profileViews: { thisWeek: 23, lastWeek: 18, growth: 27.8 },
      connectionGrowth: { thisMonth: 15, lastMonth: 12, growth: 25.0 },
      networkReach: 12500,
      industryRanking: "Top 15%",
      skillsGrowth: { newSkills: 3, improvedSkills: 8 },
      learningProgress: { hoursThisMonth: 45, coursesCompleted: 2 }
    }
  });
});

module.exports = router;