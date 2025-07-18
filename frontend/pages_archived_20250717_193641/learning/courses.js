import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Play, Clock, Users, Star, Filter, Search, Award, CheckCircle, BarChart3 } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    duration: 'all',
    price: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchCourses();
  }, [filters, sortBy]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/learning/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCourses(result.data);
      } else {
        setCourses(getMockCourses());
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(getMockCourses());
    } finally {
      setLoading(false);
    }
  };

  const getMockCourses = () => [
    {
      id: 1,
      title: 'Advanced React Development',
      description: 'Master advanced React concepts including hooks, context, performance optimization, and testing.',
      instructor: 'Sarah Chen',
      instructorAvatar: '/avatars/sarah.jpg',
      category: 'Programming',
      level: 'Advanced',
      duration: '8 hours',
      lessons: 24,
      students: 1247,
      rating: 4.8,
      reviews: 156,
      price: 99,
      currency: 'USD',
      thumbnail: '/courses/react-advanced.jpg',
      tags: ['React', 'JavaScript', 'Frontend'],
      enrolled: false,
      completed: false,
      progress: 0,
      featured: true,
      lastUpdated: '2024-01-05T10:30:00Z'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      description: 'Learn the basics of data science including Python, statistics, and machine learning.',
      instructor: 'David Kim',
      instructorAvatar: '/avatars/david.jpg',
      category: 'Data Science',
      level: 'Beginner',
      duration: '12 hours',
      lessons: 36,
      students: 892,
      rating: 4.6,
      reviews: 89,
      price: 0,
      currency: 'USD',
      thumbnail: '/courses/data-science.jpg',
      tags: ['Python', 'Statistics', 'Machine Learning'],
      enrolled: true,
      completed: false,
      progress: 45,
      featured: false,
      lastUpdated: '2024-01-04T14:20:00Z'
    },
    {
      id: 3,
      title: 'UX Design Masterclass',
      description: 'Complete guide to user experience design from research to prototyping.',
      instructor: 'Elena Rodriguez',
      instructorAvatar: '/avatars/elena.jpg',
      category: 'Design',
      level: 'Intermediate',
      duration: '10 hours',
      lessons: 28,
      students: 634,
      rating: 4.9,
      reviews: 67,
      price: 149,
      currency: 'USD',
      thumbnail: '/courses/ux-design.jpg',
      tags: ['UX Design', 'Prototyping', 'User Research'],
      enrolled: false,
      completed: false,
      progress: 0,
      featured: true,
      lastUpdated: '2024-01-03T09:15:00Z'
    },
    {
      id: 4,
      title: 'Digital Marketing Strategy',
      description: 'Learn modern digital marketing techniques and growth strategies.',
      instructor: 'Priya Patel',
      instructorAvatar: '/avatars/priya.jpg',
      category: 'Marketing',
      level: 'Intermediate',
      duration: '6 hours',
      lessons: 18,
      students: 456,
      rating: 4.7,
      reviews: 45,
      price: 79,
      currency: 'USD',
      thumbnail: '/courses/digital-marketing.jpg',
      tags: ['Marketing', 'SEO', 'Social Media'],
      enrolled: true,
      completed: true,
      progress: 100,
      featured: false,
      lastUpdated: '2024-01-02T16:45:00Z'
    },
    {
      id: 5,
      title: 'Project Management Essentials',
      description: 'Master project management methodologies and tools for successful project delivery.',
      instructor: 'Marcus Johnson',
      instructorAvatar: '/avatars/marcus.jpg',
      category: 'Business',
      level: 'Beginner',
      duration: '5 hours',
      lessons: 15,
      students: 789,
      rating: 4.5,
      reviews: 78,
      price: 0,
      currency: 'USD',
      thumbnail: '/courses/project-management.jpg',
      tags: ['Project Management', 'Agile', 'Leadership'],
      enrolled: false,
      completed: false,
      progress: 0,
      featured: false,
      lastUpdated: '2024-01-01T11:30:00Z'
    },
    {
      id: 6,
      title: 'Cloud Computing with AWS',
      description: 'Learn cloud computing fundamentals and AWS services for modern applications.',
      instructor: 'Alex Thompson',
      instructorAvatar: '/avatars/alex.jpg',
      category: 'Technology',
      level: 'Intermediate',
      duration: '14 hours',
      lessons: 42,
      students: 567,
      rating: 4.8,
      reviews: 92,
      price: 199,
      currency: 'USD',
      thumbnail: '/courses/aws-cloud.jpg',
      tags: ['AWS', 'Cloud Computing', 'DevOps'],
      enrolled: true,
      completed: false,
      progress: 25,
      featured: true,
      lastUpdated: '2023-12-28T08:20:00Z'
    }
  ];

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-600',
      'Intermediate': 'bg-yellow-100 text-yellow-600',
      'Advanced': 'bg-red-100 text-red-600'
    };
    return colors[level] || colors.Beginner;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-600',
      'Data Science': 'bg-purple-100 text-purple-600',
      'Design': 'bg-pink-100 text-pink-600',
      'Marketing': 'bg-orange-100 text-orange-600',
      'Business': 'bg-indigo-100 text-indigo-600',
      'Technology': 'bg-gray-100 text-gray-600'
    };
    return colors[category] || colors.Technology;
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const enrollInCourse = (courseId) => {
    console.log(`Enrolling in course ${courseId}`);
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, enrolled: true, students: course.students + 1 }
        : course
    ));
    alert('Successfully enrolled in course!');
  };

  const continueCourse = (courseId) => {
    console.log(`Continuing course ${courseId}`);
    // Navigate to course content
    alert('Redirecting to course content...');
  };

  const filteredCourses = courses.filter(course => {
    if (filters.category !== 'all' && course.category !== filters.category) return false;
    if (filters.level !== 'all' && course.level !== filters.level) return false;
    if (filters.price !== 'all') {
      if (filters.price === 'free' && course.price > 0) return false;
      if (filters.price === 'paid' && course.price === 0) return false;
    }
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Course Catalog - Learning - Digame</title>
        <meta name="description" content="Explore our comprehensive course catalog and enhance your skills" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/learning" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Learning Hub</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
              <p className="text-gray-600">Explore our comprehensive course catalog and enhance your skills</p>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.enrolled).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.completed).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Free Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.price === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                </select>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({...filters, level: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={filters.price}
                  onChange={(e) => setFilters({...filters, price: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${course.featured ? 'ring-2 ring-blue-200' : ''}`}>
                {/* Course Thumbnail */}
                <div className="relative">
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  {course.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                  {course.enrolled && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-white rounded-full p-2">
                        {course.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{course.instructor}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{course.rating} ({course.reviews})</span>
                    </div>
                  </div>

                  {course.enrolled && course.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </div>
                  </div>

                  {/* Action Button */}
                  {course.enrolled ? (
                    course.completed ? (
                      <button className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                        Completed
                      </button>
                    ) : (
                      <button 
                        onClick={() => continueCourse(course.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Continue Learning
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => enrollInCourse(course.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}