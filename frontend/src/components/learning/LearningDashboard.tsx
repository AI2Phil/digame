import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
  BookmarkBorder as BookmarkIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';

// API service functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiService = {
  async fetchLearningDashboard() {
    const response = await fetch(`${API_BASE_URL}/api/learning/dashboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch learning dashboard data');
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
interface LearningProgressSummary {
  total_courses_enrolled: number;
  courses_completed: number;
  courses_in_progress: number;
  total_learning_hours: number;
  completion_rate: number;
  current_streak: number;
}

interface RecentLearningActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  course_title?: string;
}

interface SkillGapAnalysis {
  skill_name: string;
  current_level: string;
  target_level: string;
  gap_score: number;
  recommended_courses: string[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  tags: string[];
  instructor_id: number;
  enrollment_count: number;
  average_rating?: number;
}

interface LearningDashboardData {
  progress_summary: LearningProgressSummary;
  recent_activity: RecentLearningActivity[];
  skill_gaps: SkillGapAnalysis[];
  recommended_courses: Course[];
}

const LearningDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<LearningDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use actual API call
      const data = await apiService.fetchLearningDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learning dashboard data');
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockData: LearningDashboardData = {
          progress_summary: {
            total_courses_enrolled: 8,
            courses_completed: 3,
            courses_in_progress: 2,
            total_learning_hours: 45.5,
            completion_rate: 37.5,
            current_streak: 7
          },
          recent_activity: [
            {
              id: '1',
              type: 'enrollment',
              title: 'Course Enrollment',
              description: 'Enrolled in Advanced React Patterns',
              timestamp: new Date().toISOString(),
              course_title: 'Advanced React Patterns'
            },
            {
              id: '2',
              type: 'completion',
              title: 'Course Completed',
              description: 'Completed JavaScript Fundamentals',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              course_title: 'JavaScript Fundamentals'
            }
          ],
          skill_gaps: [
            {
              skill_name: 'TypeScript',
              current_level: 'beginner',
              target_level: 'advanced',
              gap_score: 60,
              recommended_courses: ['TypeScript Fundamentals', 'Advanced TypeScript']
            }
          ],
          recommended_courses: [
            {
              id: 1,
              title: 'Advanced React Patterns',
              description: 'Learn advanced React patterns and best practices',
              difficulty_level: 'advanced',
              estimated_duration_hours: 12,
              tags: ['React', 'JavaScript', 'Frontend'],
              instructor_id: 1,
              enrollment_count: 245,
              average_rating: 4.8
            }
          ]
        };
        setDashboardData(mockData);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInCourse = async (courseId: number) => {
    try {
      await apiService.enrollInCourse(courseId);
      await fetchDashboardData(); // Refresh the dashboard data
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (!dashboardData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No learning data available
      </Alert>
    );
  }

  const { progress_summary, recent_activity, skill_gaps, recommended_courses } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your learning progress and discover new opportunities
        </Typography>
      </Box>

      {/* Progress Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Enrolled Courses
                  </Typography>
                  <Typography variant="h4">
                    {progress_summary.total_courses_enrolled}
                  </Typography>
                </Box>
                <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {progress_summary.courses_completed}
                  </Typography>
                </Box>
                <TrophyIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Learning Hours
                  </Typography>
                  <Typography variant="h4">
                    {progress_summary.total_learning_hours}
                  </Typography>
                </Box>
                <TimelineIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Current Streak
                  </Typography>
                  <Typography variant="h4">
                    {progress_summary.current_streak} days
                  </Typography>
                </Box>
                <FireIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion Rate */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Progress
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <LinearProgress
              variant="determinate"
              value={progress_summary.completion_rate}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress_summary.completion_rate.toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {progress_summary.courses_in_progress} courses in progress
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recent_activity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {activity.type === 'enrollment' ? <SchoolIcon /> : <TrophyIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.description}
                            </Typography>
                            <br />
                            {formatDate(activity.timestamp)}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recent_activity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Skill Gaps */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skill Gap Analysis
              </Typography>
              {skill_gaps.map((gap, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">{gap.skill_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {gap.current_level} → {gap.target_level}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={100 - gap.gap_score}
                    color={gap.gap_score > 50 ? 'error' : gap.gap_score > 25 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Gap Score: {gap.gap_score}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Courses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommended Courses
              </Typography>
              <Grid container spacing={2}>
                {recommended_courses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {course.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={course.difficulty_level}
                          color={getDifficultyColor(course.difficulty_level) as any}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${course.estimated_duration_hours}h`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center">
                          <StarIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {course.average_rating?.toFixed(1) || 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {course.enrollment_count} enrolled
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          fullWidth
                        >
                          Enroll
                        </Button>
                        <Tooltip title="Save for later">
                          <IconButton size="small">
                            <BookmarkIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LearningDashboard;