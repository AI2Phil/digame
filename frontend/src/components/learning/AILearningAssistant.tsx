import React, { useState, useEffect } from 'react';
import {
  Box,
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  School,
  AutoAwesome,
  Chat,
  Lightbulb,
  GpsFixed,
  Timeline,
  Assessment,
  Recommend,
  SmartToy,
  ExpandMore,
  Send,
  ThumbUp,
  ThumbDown,
  Bookmark,
  Share,
  PlayArrow,
  CheckCircle,
  Schedule,
  Star,
  EmojiObjects,
  TipsAndUpdates
} from '@mui/icons-material';

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

interface Recommendation {
  id: string;
  type: 'course' | 'skill' | 'project' | 'resource';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  provider?: string;
  rating?: number;
  prerequisites?: string[];
  outcomes?: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  completedSteps: number;
  estimatedDuration: string;
  difficulty: string;
  skills: string[];
  progress: number;
  nextMilestone: string;
  aiConfidence: number;
}

interface AIInsight {
  id: string;
  type: 'strength' | 'gap' | 'opportunity';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  actionable: boolean;
  recommendations: string[];
  confidence: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  helpful?: boolean;
}

const AILearningAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock data for AI recommendations
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'course',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including render props, higher-order components, and custom hooks.',
      confidence: 92,
      reasoning: 'Based on your current React skills and recent project work, this course will help you write more maintainable code.',
      estimatedTime: '6 weeks',
      difficulty: 'Advanced',
      tags: ['React', 'JavaScript', 'Frontend'],
      provider: 'Tech Academy',
      rating: 4.8,
      prerequisites: ['React Fundamentals', 'JavaScript ES6+'],
      outcomes: ['Advanced component patterns', 'Performance optimization', 'Code reusability']
    },
    {
      id: '2',
      type: 'skill',
      title: 'TypeScript Mastery',
      description: 'Develop expertise in TypeScript for better code quality and developer experience.',
      confidence: 88,
      reasoning: 'Your JavaScript skills are strong, and TypeScript will enhance your development workflow significantly.',
      estimatedTime: '4 weeks',
      difficulty: 'Intermediate',
      tags: ['TypeScript', 'JavaScript', 'Development'],
      prerequisites: ['JavaScript Fundamentals'],
      outcomes: ['Type safety', 'Better IDE support', 'Reduced runtime errors']
    },
    {
      id: '3',
      type: 'project',
      title: 'Build a Real-time Dashboard',
      description: 'Create a comprehensive dashboard with real-time data visualization and user interactions.',
      confidence: 85,
      reasoning: 'This project combines your frontend skills with new backend technologies, perfect for skill expansion.',
      estimatedTime: '8 weeks',
      difficulty: 'Advanced',
      tags: ['Full-stack', 'Real-time', 'Data Visualization'],
      outcomes: ['Full-stack development', 'WebSocket implementation', 'Data visualization']
    }
  ];

  // Mock data for learning paths
  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Full-Stack Developer Path',
      description: 'Comprehensive journey from frontend to backend development',
      totalSteps: 12,
      completedSteps: 7,
      estimatedDuration: '6 months',
      difficulty: 'Intermediate to Advanced',
      skills: ['React', 'Node.js', 'Database Design', 'API Development'],
      progress: 58,
      nextMilestone: 'Complete REST API module',
      aiConfidence: 94
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Build foundation in data analysis and machine learning',
      totalSteps: 10,
      completedSteps: 3,
      estimatedDuration: '4 months',
      difficulty: 'Beginner to Intermediate',
      skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
      progress: 30,
      nextMilestone: 'Complete Python basics',
      aiConfidence: 87
    }
  ];

  // Mock data for AI insights
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'strength',
      title: 'Strong Frontend Foundation',
      description: 'You have excellent React and JavaScript skills with consistent learning progress.',
      impact: 'High',
      actionable: true,
      recommendations: ['Consider mentoring others', 'Explore advanced patterns', 'Build complex projects'],
      confidence: 95
    },
    {
      id: '2',
      type: 'gap',
      title: 'Backend Development Skills',
      description: 'Limited experience with server-side technologies and database management.',
      impact: 'Medium',
      actionable: true,
      recommendations: ['Start with Node.js basics', 'Learn database fundamentals', 'Practice API development'],
      confidence: 89
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Growing Demand for TypeScript',
      description: 'TypeScript adoption is increasing rapidly in the job market.',
      impact: 'High',
      actionable: true,
      recommendations: ['Prioritize TypeScript learning', 'Convert existing projects', 'Practice with complex types'],
      confidence: 92
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(newMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Based on your learning history, I'd recommend focusing on TypeScript next. It will complement your JavaScript skills perfectly.",
      "That's a great question! For your current skill level, I suggest starting with practical projects to reinforce your learning.",
      "I can see you're making excellent progress. Consider exploring advanced React patterns to take your skills to the next level.",
      "Your learning pace is impressive! To maintain momentum, try setting smaller, achievable goals for each week.",
      "Based on market trends, the skills you're developing are in high demand. Keep up the excellent work!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <TrendingUp color="success" />;
      case 'gap': return <GpsFixed color="warning" />;
      case 'opportunity': return <EmojiObjects color="info" />;
      default: return <Lightbulb />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'success';
      case 'gap': return 'warning';
      case 'opportunity': return 'info';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Psychology color="primary" sx={{ fontSize: 40 }} />
          AI Learning Assistant
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Personalized learning recommendations powered by artificial intelligence
        </Typography>
      </Box>

      {/* AI Insights Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp color="success" />
                <Typography variant="h6">Strengths</Typography>
              </Box>
              <Typography variant="h4" color="success.main">1</Typography>
              <Typography variant="body2" color="text.secondary">
                Areas where you excel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <GpsFixed color="warning" />
                <Typography variant="h6">Skill Gaps</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">1</Typography>
              <Typography variant="body2" color="text.secondary">
                Areas for improvement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EmojiObjects color="info" />
                <Typography variant="h6">Opportunities</Typography>
              </Box>
              <Typography variant="h4" color="info.main">1</Typography>
              <Typography variant="body2" color="text.secondary">
                Market opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="AI assistant tabs">
            <Tab icon={<Recommend />} label="Recommendations" />
            <Tab icon={<Timeline />} label="Learning Paths" />
            <Tab icon={<Assessment />} label="AI Insights" />
            <Tab icon={<Chat />} label="Chat Assistant" />
          </Tabs>
        </Box>

        {/* Recommendations Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Personalized Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            AI-curated learning suggestions based on your progress and goals
          </Typography>

          <Grid container spacing={3}>
            {recommendations.map((rec) => (
              <Grid item xs={12} md={6} lg={4} key={rec.id}>
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setSelectedRecommendation(rec)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={rec.type} 
                        size="small" 
                        color={rec.type === 'course' ? 'primary' : rec.type === 'skill' ? 'secondary' : 'default'}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AutoAwesome fontSize="small" color="primary" />
                        <Typography variant="caption" color="primary">
                          {rec.confidence}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {rec.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {rec.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={rec.difficulty} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {rec.estimatedTime}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {rec.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Learning Paths Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            AI-Curated Learning Paths
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Structured learning journeys tailored to your goals
          </Typography>

          <Grid container spacing={3}>
            {learningPaths.map((path) => (
              <Grid item xs={12} md={6} key={path.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{path.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SmartToy fontSize="small" color="primary" />
                        <Typography variant="caption" color="primary">
                          {path.aiConfidence}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {path.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{path.completedSteps}/{path.totalSteps} steps</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={path.progress} />
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Next:</strong> {path.nextMilestone}
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {path.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                    
                    <Button variant="contained" startIcon={<PlayArrow />} fullWidth>
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* AI Insights Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            AI-Powered Learning Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Intelligent analysis of your learning patterns and opportunities
          </Typography>

          <Grid container spacing={3}>
            {aiInsights.map((insight) => (
              <Grid item xs={12} key={insight.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {getInsightIcon(insight.type)}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{insight.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {insight.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={insight.impact} 
                          size="small" 
                          color={getInsightColor(insight.type) as any}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {insight.confidence}% confidence
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" gutterBottom>
                      AI Recommendations:
                    </Typography>
                    <List dense>
                      {insight.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Chat Assistant Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            AI Learning Assistant Chat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ask questions about your learning journey and get personalized guidance
          </Typography>

          <Paper sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
              {chatMessages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SmartToy sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Start a conversation with your AI assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ask about learning recommendations, career advice, or skill development
                  </Typography>
                </Box>
              ) : (
                chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                        color: message.type === 'user' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              {isTyping && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <SmartToy />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    AI is typing...
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider />
            
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask your AI assistant..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                variant="outlined"
                size="small"
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </Paper>
        </TabPanel>
      </Card>

      {/* Recommendation Detail Dialog */}
      <Dialog 
        open={!!selectedRecommendation} 
        onClose={() => setSelectedRecommendation(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecommendation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedRecommendation.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome color="primary" />
                  <Typography variant="body2" color="primary">
                    {selectedRecommendation.confidence}% match
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedRecommendation.description}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>AI Reasoning:</strong> {selectedRecommendation.reasoning}
                </Typography>
              </Alert>
              
              {selectedRecommendation.prerequisites && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Prerequisites:</Typography>
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
                  <Typography variant="subtitle2" gutterBottom>Learning Outcomes:</Typography>
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
              <Button onClick={() => setSelectedRecommendation(null)}>Close</Button>
              <Button variant="contained" startIcon={<Bookmark />}>
                Save for Later
              </Button>
              <Button variant="contained" startIcon={<PlayArrow />}>
                Start Learning
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AILearningAssistant;