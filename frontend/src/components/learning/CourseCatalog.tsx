import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayArrowIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// API service functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiService = {
  async fetchCourses(params: {
    limit?: number;
    offset?: number;
    difficulty_level?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.difficulty_level) queryParams.append('difficulty_level', params.difficulty_level);

    const response = await fetch(`${API_BASE_URL}/api/learning/courses?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return response.json();
  },

  async enrollInCourse(courseId: number) {
    const response = await fetch(`${API_BASE_URL}/api/learning/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course_id: courseId }),
    });
    if (!response.ok) {
      throw new Error('Failed to enroll in course');
    }
    return response.json();
  }
};

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  tags: string[];
  prerequisites: string[];
  instructor_id: number;
  instructor_name?: string;
  instructor_avatar?: string;
  status: string;
  enrollment_count: number;
  average_rating?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
  is_enrolled?: boolean;
}

interface CourseFilters {
  search: string;
  difficulty_level: string;
  tags: string[];
  duration_range: string;
  rating_min: number;
}

const CourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    difficulty_level: '',
    tags: [],
    duration_range: '',
    rating_min: 0
  });

  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const durationRanges = [
    { label: 'Under 5 hours', value: '0-5' },
    { label: '5-10 hours', value: '5-10' },
    { label: '10-20 hours', value: '10-20' },
    { label: '20+ hours', value: '20+' }
  ];

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use actual API call
      const data = await apiService.fetchCourses({
        limit: 50,
        difficulty_level: filters.difficulty_level || undefined
      });
      
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockCourses: Course[] = [
        {
          id: 1,
          title: 'Advanced React Patterns',
          description: 'Master advanced React patterns including render props, higher-order components, and hooks patterns. Learn to build scalable and maintainable React applications.',
          difficulty_level: 'advanced',
          estimated_duration_hours: 12,
          tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
          prerequisites: ['Basic React', 'JavaScript ES6'],
          instructor_id: 1,
          instructor_name: 'Sarah Chen',
          status: 'published',
          enrollment_count: 245,
          average_rating: 4.8,
          rating_count: 89,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: false,
          is_enrolled: false
        },
        {
          id: 2,
          title: 'TypeScript Fundamentals',
          description: 'Learn TypeScript from the ground up. Understand types, interfaces, generics, and how to integrate TypeScript into your existing JavaScript projects.',
          difficulty_level: 'intermediate',
          estimated_duration_hours: 8,
          tags: ['TypeScript', 'JavaScript', 'Programming'],
          prerequisites: ['JavaScript Basics'],
          instructor_id: 2,
          instructor_name: 'Marcus Johnson',
          status: 'published',
          enrollment_count: 189,
          average_rating: 4.6,
          rating_count: 67,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: true,
          is_enrolled: false
        },
        {
          id: 3,
          title: 'Python for Data Science',
          description: 'Comprehensive introduction to Python for data science. Learn pandas, numpy, matplotlib, and scikit-learn to analyze and visualize data.',
          difficulty_level: 'beginner',
          estimated_duration_hours: 15,
          tags: ['Python', 'Data Science', 'Analytics', 'Machine Learning'],
          prerequisites: [],
          instructor_id: 3,
          instructor_name: 'Elena Rodriguez',
          status: 'published',
          enrollment_count: 312,
          average_rating: 4.7,
          rating_count: 124,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: false,
          is_enrolled: true
        },
        {
          id: 4,
          title: 'System Design Fundamentals',
          description: 'Learn the fundamentals of system design including scalability, reliability, and performance. Perfect for technical interviews and real-world applications.',
          difficulty_level: 'advanced',
          estimated_duration_hours: 20,
          tags: ['System Design', 'Architecture', 'Scalability'],
          prerequisites: ['Programming Experience', 'Database Knowledge'],
          instructor_id: 4,
          instructor_name: 'David Kim',
          status: 'published',
          enrollment_count: 156,
          average_rating: 4.9,
          rating_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: false,
          is_enrolled: false
        },
        {
          id: 5,
          title: 'Docker & Kubernetes',
          description: 'Master containerization with Docker and orchestration with Kubernetes. Learn to deploy and manage applications at scale.',
          difficulty_level: 'intermediate',
          estimated_duration_hours: 14,
          tags: ['Docker', 'Kubernetes', 'DevOps', 'Containers'],
          prerequisites: ['Linux Basics', 'Command Line'],
          instructor_id: 5,
          instructor_name: 'Jennifer Wu',
          status: 'published',
          enrollment_count: 203,
          average_rating: 4.5,
          rating_count: 78,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: true,
          is_enrolled: false
        },
        {
          id: 6,
          title: 'UI/UX Design Principles',
          description: 'Learn the fundamentals of user interface and user experience design. Create beautiful and functional designs that users love.',
          difficulty_level: 'beginner',
          estimated_duration_hours: 10,
          tags: ['UI/UX', 'Design', 'Figma', 'User Research'],
          prerequisites: [],
          instructor_id: 6,
          instructor_name: 'Alex Thompson',
          status: 'published',
          enrollment_count: 278,
          average_rating: 4.4,
          rating_count: 92,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bookmarked: false,
          is_enrolled: false
        }
      ];

        setCourses(mockCourses);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.difficulty_level]);

  const applyFilters = useCallback(() => {
    let filtered = [...courses];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Difficulty filter
    if (filters.difficulty_level) {
      filtered = filtered.filter(course => course.difficulty_level === filters.difficulty_level);
    }

    // Duration filter
    if (filters.duration_range) {
      const [min, max] = filters.duration_range.split('-').map(v => v === '+' ? Infinity : parseInt(v));
      filtered = filtered.filter(course => {
        const duration = course.estimated_duration_hours;
        return duration >= min && (max === Infinity || duration <= max);
      });
    }

    // Rating filter
    if (filters.rating_min > 0) {
      filtered = filtered.filter(course =>
        course.average_rating && course.average_rating >= filters.rating_min
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [courses, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      difficulty_level: '',
      tags: [],
      duration_range: '',
      rating_min: 0
    });
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCourseDetailOpen(true);
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await apiService.enrollInCourse(courseId);
      
      // Update local state
      setCourses(prev => prev.map(course =>
        course.id === courseId
          ? { ...course, is_enrolled: true, enrollment_count: course.enrollment_count + 1 }
          : course
      ));
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course');
    }
  };

  const handleBookmark = async (courseId: number) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Toggling bookmark for course:', courseId);
      
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, is_bookmarked: !course.is_bookmarked }
          : course
      ));
    } catch (err) {
      console.error('Error bookmarking course:', err);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      case 'expert': return 'secondary';
      default: return 'default';
    }
  };

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover courses to advance your skills and career
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty_level}
                onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="">All Levels</MenuItem>
                {difficultyLevels.map(level => (
                  <MenuItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={filters.duration_range}
                onChange={(e) => handleFilterChange('duration_range', e.target.value)}
                label="Duration"
              >
                <MenuItem value="">Any Duration</MenuItem>
                {durationRanges.map(range => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Min Rating</InputLabel>
              <Select
                value={filters.rating_min}
                onChange={(e) => handleFilterChange('rating_min', e.target.value)}
                label="Min Rating"
              >
                <MenuItem value={0}>Any Rating</MenuItem>
                <MenuItem value={4}>4+ Stars</MenuItem>
                <MenuItem value={4.5}>4.5+ Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {currentCourses.length} of {filteredCourses.length} courses
        </Typography>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {currentCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1 }}>
                    {course.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleBookmark(course.id)}
                    color={course.is_bookmarked ? 'primary' : 'default'}
                  >
                    {course.is_bookmarked ? <BookmarkedIcon /> : <BookmarkIcon />}
                  </IconButton>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.description.length > 120 
                    ? `${course.description.substring(0, 120)}...`
                    : course.description
                  }
                </Typography>

                {/* Metadata */}
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.estimated_duration_hours} hours
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.instructor_name || 'Instructor'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <SchoolIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.enrollment_count} enrolled
                    </Typography>
                  </Box>

                  {course.average_rating && (
                    <Box display="flex" alignItems="center">
                      <Rating value={course.average_rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {course.average_rating.toFixed(1)} ({course.rating_count})
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Tags */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={course.difficulty_level}
                    color={getDifficultyColor(course.difficulty_level) as any}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  {course.tags.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                  {course.tags.length > 2 && (
                    <Chip
                      label={`+${course.tags.length - 2}`}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  onClick={() => handleCourseClick(course)}
                >
                  View Details
                </Button>
                {course.is_enrolled ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    disabled
                  >
                    Enrolled
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Course Detail Dialog */}
      <Dialog
        open={courseDetailOpen}
        onClose={() => setCourseDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {selectedCourse.title}
                <IconButton onClick={() => setCourseDetailOpen(false)}>
                  <ClearIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedCourse.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Course Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Duration"
                        secondary={`${selectedCourse.estimated_duration_hours} hours`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Difficulty"
                        secondary={selectedCourse.difficulty_level}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Enrolled Students"
                        secondary={selectedCourse.enrollment_count}
                      />
                    </ListItem>
                    {selectedCourse.average_rating && (
                      <ListItem>
                        <ListItemText
                          primary="Rating"
                          secondary={
                            <Box display="flex" alignItems="center">
                              <Rating value={selectedCourse.average_rating} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {selectedCourse.average_rating.toFixed(1)} ({selectedCourse.rating_count} reviews)
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Skills & Prerequisites
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Skills you'll learn:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedCourse.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>

                  {selectedCourse.prerequisites.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Prerequisites:
                      </Typography>
                      <List dense>
                        {selectedCourse.prerequisites.map((prereq, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={prereq} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCourseDetailOpen(false)}>
                Close
              </Button>
              {!selectedCourse.is_enrolled && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => {
                    handleEnroll(selectedCourse.id);
                    setCourseDetailOpen(false);
                  }}
                >
                  Enroll Now
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CourseCatalog;