import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  TrendingUp, 
  Users, 
  Star, 
  CheckCircle, 
  Target, 
  Calendar,
  Filter,
  Search,
  Bookmark,
  Download,
  Share2,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", size = "default", variant = "default", onClick, disabled }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8"
  };
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700",
    destructive: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const CareerLearning: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
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
      },
      {
        id: 2,
        title: "Machine Learning Fundamentals",
        provider: "DataScience Pro",
        category: "Data Science",
        level: "Intermediate",
        duration: "12 weeks",
        rating: 4.9,
        students: 8900,
        price: "$299",
        progress: 0,
        status: "recommended",
        skills: ["Python", "TensorFlow", "Statistics"],
        description: "Learn the foundations of machine learning and AI",
        instructor: "Dr. Michael Chen",
        estimatedTime: "6-8 hours/week"
      },
      {
        id: 3,
        title: "Cloud Architecture Patterns",
        provider: "CloudMasters",
        category: "Cloud Computing",
        level: "Advanced",
        duration: "6 weeks",
        rating: 4.7,
        students: 5600,
        price: "$249",
        progress: 100,
        status: "completed",
        skills: ["AWS", "Kubernetes", "Microservices"],
        description: "Design and implement scalable cloud architectures",
        instructor: "Alex Rodriguez",
        completedDate: "Last week",
        certificate: true
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
      },
      {
        id: 2,
        title: "Data Science Specialist",
        description: "Master data analysis, machine learning, and AI",
        courses: 12,
        duration: "8 months",
        level: "Intermediate to Advanced",
        progress: 0,
        skills: ["Python", "R", "TensorFlow", "SQL"],
        students: 9500,
        rating: 4.9
      },
      {
        id: 3,
        title: "DevOps Engineer",
        description: "Learn modern DevOps practices and tools",
        courses: 10,
        duration: "5 months",
        level: "Intermediate",
        progress: 80,
        skills: ["Docker", "Kubernetes", "Jenkins", "Terraform"],
        students: 7200,
        rating: 4.7
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
      },
      {
        id: 2,
        title: "React Developer Certification",
        issuer: "Meta",
        earnedDate: "2024-01-20",
        expiryDate: "2026-01-20",
        credentialId: "META-REACT-2024-045",
        skills: ["React", "JavaScript", "Frontend"],
        verified: true
      }
    ],
    analytics: {
      learningTime: {
        thisWeek: 12,
        lastWeek: 8,
        thisMonth: 45,
        lastMonth: 38
      },
      skillProgress: [
        { skill: "React", current: 85, target: 95, trend: "up" },
        { skill: "Python", current: 70, target: 85, trend: "up" },
        { skill: "AWS", current: 60, target: 80, trend: "stable" },
        { skill: "Machine Learning", current: 40, target: 70, trend: "up" }
      ],
      completionRate: 78,
      averageRating: 4.6,
      streakDays: 15
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStartCourse = (courseId) => {
    console.log('Starting course:', courseId);
  };

  const handleContinueCourse = (courseId) => {
    console.log('Continuing course:', courseId);
  };

  const handleBookmarkCourse = (courseId) => {
    console.log('Bookmarking course:', courseId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'recommended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning & Development</h1>
            <p className="text-gray-600 mt-2">Advance your career with personalized learning paths</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Progress
            </Button>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentData.overview.totalCourses}</div>
            <div className="text-sm text-gray-600">Available Courses</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{currentData.overview.completedCourses}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{currentData.overview.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{currentData.overview.certificates}</div>
            <div className="text-sm text-gray-600">Certificates</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{currentData.overview.learningHours}</div>
            <div className="text-sm text-gray-600">Learning Hours</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{currentData.overview.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'paths', label: 'Learning Paths', icon: Target },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'courses' || activeTab === 'paths') && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="frontend">Frontend Development</option>
            <option value="backend">Backend Development</option>
            <option value="data-science">Data Science</option>
            <option value="cloud">Cloud Computing</option>
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {currentData.courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-gray-600">by {course.instructor} • {course.provider}</p>
                        </div>
                        
                        <p className="text-sm text-gray-700">{course.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status.replace('-', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{course.students.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {course.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        {course.status === 'in-progress' && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress: {course.progress}%</span>
                              <span>Next: {course.nextLesson}</span>
                            </div>
                            <Progress value={course.progress} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-lg font-bold text-blue-600">{course.price}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleBookmarkCourse(course.id)}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {course.status === 'in-progress' ? (
                      <Button size="sm" onClick={() => handleContinueCourse(course.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    ) : course.status === 'completed' ? (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleStartCourse(course.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.learningPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{path.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                  </div>
                  <Badge variant="outline">{path.level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Courses</div>
                      <div className="font-medium">{path.courses}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Duration</div>
                      <div className="font-medium">{path.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Students</div>
                      <div className="font-medium">{path.students.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rating</div>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {path.rating}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Skills You'll Learn</div>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {path.progress > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} />
                    </div>
                  )}
                  
                  <Button className="w-full">
                    {path.progress > 0 ? 'Continue Path' : 'Start Learning Path'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {currentData.certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{cert.title}</h3>
                        <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Earned</div>
                          <div className="font-medium">{new Date(cert.earnedDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Expires</div>
                          <div className="font-medium">{new Date(cert.expiryDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Credential ID</div>
                          <div className="font-medium font-mono text-xs">{cert.credentialId}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Status</div>
                          <Badge className={cert.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {cert.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Learning Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Learning Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.analytics.learningTime.thisWeek}h</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{currentData.analytics.learningTime.lastWeek}h</div>
                  <div className="text-sm text-gray-600">Last Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.learningTime.thisMonth}h</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{currentData.analytics.learningTime.lastMonth}h</div>
                  <div className="text-sm text-gray-600">Last Month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skill Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.analytics.skillProgress.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{skill.current}% / {skill.target}%</span>
                        {skill.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {skill.trend === 'stable' && <Zap className="h-4 w-4 text-blue-600" />}
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={skill.current} />
                      <div 
                        className="absolute top-0 h-2 w-1 bg-red-500 rounded-full"
                        style={{ left: `${skill.target}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{currentData.analytics.completionRate}%</div>
                  <div className="text-sm text-gray-600 mt-2">Above average</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{currentData.analytics.averageRating}</div>
                  <div className="text-sm text-gray-600 mt-2">Course ratings</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{currentData.analytics.streakDays}</div>
                  <div className="text-sm text-gray-600 mt-2">Days in a row</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerLearning;