import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  GpsFixed as TargetIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';

interface LearningRecommendation {
  id: number;
  type: 'course' | 'skill' | 'project' | 'resource' | 'pathway';
  title: string;
  description: string;
  reason: string;
  confidenceScore: number;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  provider?: string;
  rating?: number;
  completionRate?: number;
  prerequisites?: string[];
  outcomes?: string[];
  isBookmarked: boolean;
  aiInsight: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  difficulty: string;
  steps: LearningStep[];
  completionRate: number;
  estimatedCompletion: string;
  skillsGained: string[];
  careerOutcomes: string[];
}

interface LearningStep {
  id: number;
  title: string;
  type: 'course' | 'project' | 'assessment' | 'practice';
  duration: string;
  isCompleted: boolean;
  isOptional: boolean;
  description: string;
}

interface AIInsight {
  id: number;
  type: 'strength' | 'gap' | 'opportunity' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  recommendations: string[];
  impact: 'high' | 'medium' | 'low';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-assistant-tabpanel-${index}`}
      aria-labelledby={`ai-assistant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AILearningAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', message: string}>>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<LearningRecommendation | null>(null);
  const [recommendationDetailsOpen, setRecommendationDetailsOpen] = useState(false);

  // Mock data - replace with actual AI API calls
  useEffect(() => {
    const fetchAIRecommendations = async () => {
      setLoading(true);
      
      // Simulate AI API call
      setTimeout(() => {
        setRecommendations([
          {
            id: 1,
            type: 'course',
            title: 'Advanced React Patterns and Performance',
            description: 'Master advanced React patterns including render props, higher-order components, and performance optimization techniques.',
            reason: 'Based on your current React skills and recent project work, this course will help you advance to senior-level React development.',
            confidenceScore: 92,
            priority: 'high',
            estimatedTime: '6 weeks',
            difficulty: 'advanced',
            tags: ['React', 'JavaScript', 'Performance', 'Patterns'],
            provider: 'TechEd Pro',
            rating: 4.8,
            completionRate: 87,
            prerequisites: ['Intermediate React', 'JavaScript ES6+'],
            outcomes: ['Advanced React patterns', 'Performance optimization', 'Code architecture'],
            isBookmarked: false,
            aiInsight: 'This course aligns perfectly with your career goal of becoming a senior frontend developer. The advanced patterns covered will directly apply to your current project challenges.'
          },
          {
            id: 2,
            type: 'skill',
            title: 'TypeScript for React Developers',
            description: 'Learn TypeScript fundamentals and how to effectively use it in React applications for better code quality and developer experience.',
            reason: 'Your recent code reviews show interest in type safety. TypeScript will significantly improve your code quality and make you more marketable.',
            confidenceScore: 88,
            priority: 'high',
            estimatedTime: '4 weeks',
            difficulty: 'intermediate',
            tags: ['TypeScript', 'React', 'Type Safety', 'Development'],
            provider: 'CodeMaster',
            rating: 4.7,
            completionRate: 91,
            prerequisites: ['JavaScript fundamentals', 'React basics'],
            outcomes: ['TypeScript proficiency', 'Better code quality', 'Enhanced debugging'],
            isBookmarked: true,
            aiInsight: 'TypeScript adoption is growing rapidly in the industry. Adding this skill will make you 40% more competitive in the job market.'
          },
          {
            id: 3,
            type: 'project',
            title: 'Build a Full-Stack E-commerce Platform',
            description: 'Create a complete e-commerce solution using React, Node.js, and MongoDB with payment integration and admin dashboard.',
            reason: 'Hands-on projects are the best way to solidify your full-stack skills. This project covers all the technologies in your learning plan.',
            confidenceScore: 85,
            priority: 'medium',
            estimatedTime: '8 weeks',
            difficulty: 'advanced',
            tags: ['Full-Stack', 'React', 'Node.js', 'MongoDB', 'E-commerce'],
            provider: 'Project-Based Learning',
            rating: 4.6,
            completionRate: 78,
            prerequisites: ['React intermediate', 'Node.js basics', 'Database fundamentals'],
            outcomes: ['Full-stack portfolio project', 'Real-world experience', 'Deployment skills'],
            isBookmarked: false,
            aiInsight: 'Portfolio projects like this are highly valued by employers. This project will demonstrate your ability to build complete applications.'
          }
        ]);

        setLearningPaths([
          {
            id: 1,
            title: 'Frontend Developer to Full-Stack Engineer',
            description: 'A comprehensive path to transition from frontend development to full-stack engineering with modern technologies.',
            totalDuration: '6 months',
            difficulty: 'Intermediate to Advanced',
            completionRate: 35,
            estimatedCompletion: 'July 2024',
            skillsGained: ['Node.js', 'Database Design', 'API Development', 'DevOps Basics'],
            careerOutcomes: ['Full-Stack Developer', 'Software Engineer', 'Technical Lead'],
            steps: [
              {
                id: 1,
                title: 'Node.js Fundamentals',
                type: 'course',
                duration: '3 weeks',
                isCompleted: true,
                isOptional: false,
                description: 'Learn server-side JavaScript with Node.js'
              },
              {
                id: 2,
                title: 'Express.js and REST APIs',
                type: 'course',
                duration: '4 weeks',
                isCompleted: true,
                isOptional: false,
                description: 'Build RESTful APIs with Express.js'
              },
              {
                id: 3,
                title: 'Database Design and MongoDB',
                type: 'course',
                duration: '3 weeks',
                isCompleted: false,
                isOptional: false,
                description: 'Learn database design principles and MongoDB'
              },
              {
                id: 4,
                title: 'Full-Stack Project',
                type: 'project',
                duration: '6 weeks',
                isCompleted: false,
                isOptional: false,
                description: 'Build a complete full-stack application'
              }
            ]
          }
        ]);

        setAiInsights([
          {
            id: 1,
            type: 'strength',
            title: 'Strong Frontend Foundation',
            description: 'Your React and JavaScript skills are well-developed, placing you in the top 25% of frontend developers.',
            actionable: true,
            recommendations: ['Consider mentoring junior developers', 'Apply for senior frontend positions', 'Contribute to open source React projects'],
            impact: 'high'
          },
          {
            id: 2,
            type: 'gap',
            title: 'Backend Development Skills',
            description: 'To achieve your full-stack developer goal, you need to strengthen your backend development skills.',
            actionable: true,
            recommendations: ['Start with Node.js fundamentals', 'Learn database design principles', 'Practice API development'],
            impact: 'high'
          },
          {
            id: 3,
            type: 'opportunity',
            title: 'TypeScript Adoption',
            description: 'TypeScript demand has increased 60% in the past year. Adding this skill will significantly boost your marketability.',
            actionable: true,
            recommendations: ['Take TypeScript course', 'Convert existing projects to TypeScript', 'Practice with TypeScript challenges'],
            impact: 'medium'
          }
        ]);

        setChatHistory([
          {
            role: 'assistant',
            message: 'Hello! I\'m your AI Learning Assistant. I\'ve analyzed your learning profile and have some personalized recommendations for you. How can I help you today?'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchAIRecommendations();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRecommendationClick = (recommendation: LearningRecommendation) => {
    setSelectedRecommendation(recommendation);
    setRecommendationDetailsOpen(true);
  };

  const handleBookmarkToggle = (recommendationId: number) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, isBookmarked: !rec.isBookmarked }
          : rec
      )
    );
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', message: aiResponse }]);
    }, 1000);
  };

  const generateAIResponse = (message: string): string => {
    // Simple mock AI responses - replace with actual AI integration
    const responses = [
      "Based on your learning profile, I recommend focusing on TypeScript next. It will complement your React skills perfectly.",
      "That's a great question! Let me analyze your current progress and suggest the best next steps for your learning journey.",
      "I see you're interested in full-stack development. Your frontend skills are strong, so backend development would be the logical next step.",
      "Your learning pace is excellent! You're 35% ahead of the average learner in your cohort. Keep up the great work!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircleIcon color="success" />;
      case 'gap': return <WarningIcon color="warning" />;
      case 'opportunity': return <LightbulbIcon color="info" />;
      case 'warning': return <WarningIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>AI Learning Assistant</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Analyzing your learning profile and generating personalized recommendations...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PsychologyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4">AI Learning Assistant</Typography>
          <Typography variant="body2" color="text.secondary">
            Personalized recommendations powered by artificial intelligence
          </Typography>
        </Box>
      </Box>

      {/* AI Insights Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Strengths Identified</Typography>
              <Typography variant="h4">
                {aiInsights.filter(insight => insight.type === 'strength').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Skill Gaps</Typography>
              <Typography variant="h4">
                {aiInsights.filter(insight => insight.type === 'gap').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LightbulbIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Opportunities</Typography>
              <Typography variant="h4">
                {aiInsights.filter(insight => insight.type === 'opportunity').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Recommendations" />
          <Tab label="Learning Paths" />
          <Tab label="AI Insights" />
          <Tab label="Chat Assistant" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {recommendations.map((recommendation) => (
            <Grid item xs={12} md={6} key={recommendation.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => handleRecommendationClick(recommendation)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{recommendation.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={recommendation.priority}
                        color={getPriorityColor(recommendation.priority) as any}
                        size="small"
                      />
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(recommendation.id);
                        }}
                      >
                        <BookmarkIcon color={recommendation.isBookmarked ? 'primary' : 'disabled'} />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {recommendation.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      AI Confidence: {recommendation.confidenceScore}%
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {recommendation.aiInsight}
                    </Typography>
                  </Alert>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {recommendation.estimatedTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {recommendation.difficulty}
                      </Typography>
                    </Grid>
                  </Grid>

                  {recommendation.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={recommendation.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {recommendation.rating} ({recommendation.completionRate}% completion rate)
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {recommendation.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" size="small">
                      Start Learning
                    </Button>
                    <Button size="small" startIcon={<ShareIcon />}>
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {learningPaths.map((path) => (
          <Card key={path.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{path.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {path.description}
                  </Typography>
                </Box>
                <Chip label={`${path.completionRate}% Complete`} color="primary" />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {path.totalDuration}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Difficulty: {path.difficulty}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Est. Completion: {path.estimatedCompletion}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Skills: {path.skillsGained.length}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={path.completionRate} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Stepper orientation="vertical">
                {path.steps.map((step) => (
                  <Step key={step.id} active={!step.isCompleted}>
                    <StepLabel 
                      optional={step.isOptional ? <Typography variant="caption">Optional</Typography> : null}
                      StepIconComponent={() => 
                        step.isCompleted ? 
                          <CheckCircleIcon color="success" /> : 
                          <SchoolIcon color="primary" />
                      }
                    >
                      {step.title}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {step.duration}
                      </Typography>
                      {!step.isCompleted && (
                        <Button variant="contained" size="small" sx={{ mt: 1 }}>
                          Start Step
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {aiInsights.map((insight) => (
          <Accordion key={insight.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {getInsightIcon(insight.type)}
                <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
                  {insight.title}
                </Typography>
                <Chip 
                  label={`${insight.impact} impact`} 
                  size="small" 
                  color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'info'}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {insight.description}
              </Typography>
              
              {insight.actionable && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Actions:
                  </Typography>
                  <List dense>
                    {insight.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Paper sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
            {chatHistory.map((chat, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: chat.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper 
                  sx={{ 
                    p: 2, 
                    maxWidth: '70%',
                    bgcolor: chat.role === 'user' ? 'primary.main' : 'grey.100',
                    color: chat.role === 'user' ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">{chat.message}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask your AI learning assistant..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </TabPanel>

      {/* Recommendation Details Dialog */}
      <Dialog 
        open={recommendationDetailsOpen} 
        onClose={() => setRecommendationDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecommendation && (
          <>
            <DialogTitle>{selectedRecommendation.title}</DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedRecommendation.description}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>AI Recommendation:</strong> {selectedRecommendation.reason}
                </Typography>
              </Alert>

              {selectedRecommendation.prerequisites && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Prerequisites</Typography>
                  <List dense>
                    {selectedRecommendation.prerequisites.map((prereq, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={prereq} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedRecommendation.outcomes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Learning Outcomes</Typography>
                  <List dense>
                    {selectedRecommendation.outcomes.map((outcome, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={outcome} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRecommendationDetailsOpen(false)}>Close</Button>
              <Button variant="contained">Start Learning</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AILearningAssistant;