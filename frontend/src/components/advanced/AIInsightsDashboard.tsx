import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Insights as InsightsIcon,
  SmartToy as SmartToyIcon,
  Analytics as AnalyticsIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { Line, Bar, Radar } from 'react-chartjs-2';

interface AIInsight {
  id: string;
  type: 'performance' | 'user_behavior' | 'business' | 'technical' | 'predictive';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data: any;
  recommendations: string[];
  actionable: boolean;
  timestamp: Date;
  source: 'ml_model' | 'analytics' | 'user_feedback' | 'performance_data';
}

interface PredictiveAnalysis {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface UserBehaviorPattern {
  pattern: string;
  frequency: number;
  impact: string;
  userSegment: string;
  recommendation: string;
}

interface BusinessInsight {
  metric: string;
  value: number;
  change: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
  insight: string;
}

const AIInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserBehaviorPattern[]>([]);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [insightFilter, setInsightFilter] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Mock data generation for demonstration
  const generateMockInsights = (): AIInsight[] => {
    return [
      {
        id: '1',
        type: 'performance',
        title: 'Bundle Size Optimization Opportunity',
        description: 'AI analysis detected that 35% of your JavaScript bundle consists of unused code, primarily from lodash and moment.js libraries.',
        confidence: 92,
        impact: 'high',
        category: 'Performance',
        data: {
          currentBundleSize: 850000,
          potentialReduction: 297500,
          affectedLibraries: ['lodash', 'moment.js', '@mui/icons-material'],
        },
        recommendations: [
          'Replace moment.js with date-fns for 67% size reduction',
          'Use tree shaking for lodash imports',
          'Implement dynamic imports for @mui/icons-material',
        ],
        actionable: true,
        timestamp: new Date(),
        source: 'ml_model',
      },
      {
        id: '2',
        type: 'user_behavior',
        title: 'User Engagement Drop Pattern Detected',
        description: 'Machine learning analysis identified a 23% drop in user engagement on dashboard pages during 2-4 PM timeframe.',
        confidence: 87,
        impact: 'medium',
        category: 'User Experience',
        data: {
          engagementDrop: 23,
          timeframe: '2-4 PM',
          affectedPages: ['dashboard', 'analytics'],
          userSegment: 'power_users',
        },
        recommendations: [
          'Implement progressive loading for dashboard widgets',
          'Add personalized content recommendations',
          'Optimize for mobile users during lunch hours',
        ],
        actionable: true,
        timestamp: new Date(),
        source: 'analytics',
      },
      {
        id: '3',
        type: 'predictive',
        title: 'Memory Usage Trend Alert',
        description: 'Predictive model forecasts memory usage will exceed 150MB within 2 weeks based on current growth patterns.',
        confidence: 78,
        impact: 'critical',
        category: 'Performance',
        data: {
          currentMemory: 89000000,
          predictedMemory: 156000000,
          growthRate: 12,
          timeframe: '2 weeks',
        },
        recommendations: [
          'Implement memory profiling and cleanup',
          'Add virtual scrolling for large lists',
          'Optimize component re-renders',
        ],
        actionable: true,
        timestamp: new Date(),
        source: 'ml_model',
      },
      {
        id: '4',
        type: 'business',
        title: 'Feature Adoption Opportunity',
        description: 'AI analysis shows 67% of users haven\'t discovered the advanced analytics features, representing significant value unlock potential.',
        confidence: 94,
        impact: 'high',
        category: 'Business Growth',
        data: {
          featureAdoption: 33,
          potentialUsers: 1247,
          estimatedValueIncrease: 45,
        },
        recommendations: [
          'Implement guided onboarding for analytics features',
          'Add contextual tooltips and feature highlights',
          'Create video tutorials for advanced features',
        ],
        actionable: true,
        timestamp: new Date(),
        source: 'user_feedback',
      },
      {
        id: '5',
        type: 'technical',
        title: 'API Response Time Optimization',
        description: 'Machine learning detected correlation between specific query patterns and 300ms+ response times.',
        confidence: 85,
        impact: 'medium',
        category: 'Backend Performance',
        data: {
          slowQueries: 12,
          averageDelay: 340,
          affectedEndpoints: ['/api/analytics', '/api/dashboard'],
        },
        recommendations: [
          'Implement query result caching',
          'Add database indexing for frequent queries',
          'Use pagination for large datasets',
        ],
        actionable: true,
        timestamp: new Date(),
        source: 'performance_data',
      },
    ];
  };

  const generatePredictiveAnalysis = (): PredictiveAnalysis[] => {
    return [
      {
        metric: 'User Growth',
        currentValue: 1247,
        predictedValue: 1580,
        trend: 'increasing',
        confidence: 89,
        timeframe: '30 days',
        factors: ['Feature adoption', 'Marketing campaigns', 'User referrals'],
      },
      {
        metric: 'Page Load Time',
        currentValue: 2.3,
        predictedValue: 2.8,
        trend: 'increasing',
        confidence: 76,
        timeframe: '14 days',
        factors: ['Bundle size growth', 'New features', 'Third-party scripts'],
      },
      {
        metric: 'Error Rate',
        currentValue: 2.1,
        predictedValue: 1.6,
        trend: 'decreasing',
        confidence: 82,
        timeframe: '7 days',
        factors: ['Bug fixes', 'Code quality improvements', 'Testing coverage'],
      },
    ];
  };

  const generateUserPatterns = (): UserBehaviorPattern[] => {
    return [
      {
        pattern: 'Mobile users prefer simplified dashboard view',
        frequency: 78,
        impact: 'High engagement increase',
        userSegment: 'Mobile users',
        recommendation: 'Implement responsive dashboard layouts',
      },
      {
        pattern: 'Power users access analytics features 3x more on Mondays',
        frequency: 65,
        impact: 'Peak usage optimization opportunity',
        userSegment: 'Power users',
        recommendation: 'Pre-cache analytics data on Sunday nights',
      },
      {
        pattern: 'New users drop off at onboarding step 3',
        frequency: 42,
        impact: 'User retention risk',
        userSegment: 'New users',
        recommendation: 'Simplify onboarding step 3 or add guidance',
      },
    ];
  };

  const generateBusinessInsights = (): BusinessInsight[] => {
    return [
      {
        metric: 'Feature Engagement',
        value: 67,
        change: 12,
        period: 'Last 30 days',
        significance: 'high',
        insight: 'Advanced analytics features showing strong adoption growth',
      },
      {
        metric: 'User Satisfaction',
        value: 4.2,
        change: 0.3,
        period: 'Last 7 days',
        significance: 'medium',
        insight: 'Performance improvements correlate with satisfaction increase',
      },
      {
        metric: 'Time to Value',
        value: 3.2,
        change: -0.8,
        period: 'Last 14 days',
        significance: 'high',
        insight: 'Users reaching value faster due to onboarding improvements',
      },
    ];
  };

  const loadInsights = useCallback(async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setInsights(generateMockInsights());
    setPredictiveAnalysis(generatePredictiveAnalysis());
    setUserPatterns(generateUserPatterns());
    setBusinessInsights(generateBusinessInsights());
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInsights();
    
    if (autoRefresh) {
      const interval = setInterval(loadInsights, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadInsights, autoRefresh]);

  const filteredInsights = insights.filter(insight => {
    if (insightFilter === 'all') return insight.confidence >= confidenceThreshold;
    return insight.type === insightFilter && insight.confidence >= confidenceThreshold;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'error';
  };

  const handleInsightClick = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setDetailsDialogOpen(true);
  };

  const formatValue = (value: number, metric: string): string => {
    if (metric.includes('Time')) return `${value}s`;
    if (metric.includes('Rate')) return `${value}%`;
    if (metric.includes('Growth')) return value.toLocaleString();
    return value.toString();
  };

  // Chart data for predictive analysis
  const predictiveChartData = {
    labels: predictiveAnalysis.map(p => p.metric),
    datasets: [
      {
        label: 'Current',
        data: predictiveAnalysis.map(p => p.currentValue),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
      },
      {
        label: 'Predicted',
        data: predictiveAnalysis.map(p => p.predictedValue),
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
      },
    ],
  };

  // Radar chart for AI confidence across categories
  const confidenceRadarData = {
    labels: ['Performance', 'User Behavior', 'Business', 'Technical', 'Predictive'],
    datasets: [
      {
        label: 'AI Confidence',
        data: [92, 87, 94, 85, 78],
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
      },
    ],
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          AI is analyzing your data...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generating insights and recommendations
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <PsychologyIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h1">
            AI Insights Dashboard
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={insightFilter}
              label="Filter"
              onChange={(e) => setInsightFilter(e.target.value)}
            >
              <MenuItem value="all">All Insights</MenuItem>
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="user_behavior">User Behavior</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="predictive">Predictive</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInsights}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* AI Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <InsightsIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {filteredInsights.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Insights
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SmartToyIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Confidence
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <RecommendIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {insights.filter(i => i.actionable).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actionable Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AnalyticsIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {insights.filter(i => i.impact === 'critical' || i.impact === 'high').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Impact
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predictive Analysis
              </Typography>
              <Box height={300}>
                <Bar
                  data={predictiveChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Confidence by Category
              </Typography>
              <Box height={300}>
                <Radar
                  data={confidenceRadarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI-Generated Insights
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Confidence Threshold: {confidenceThreshold}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={confidenceThreshold}
              sx={{ mt: 1, mb: 2 }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Insight</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInsights.map((insight) => (
                  <TableRow key={insight.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {insight.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {insight.description.substring(0, 100)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={insight.type.replace('_', ' ')} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={insight.impact}
                        color={getImpactColor(insight.impact) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color={getConfidenceColor(insight.confidence)}>
                          {insight.confidence}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={insight.confidence}
                          color={getConfidenceColor(insight.confidence) as any}
                          sx={{ width: 50, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleInsightClick(insight)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Behavior Patterns */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Behavior Patterns
              </Typography>
              <List>
                {userPatterns.map((pattern, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PeopleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={pattern.pattern}
                      secondary={`${pattern.frequency}% frequency • ${pattern.userSegment}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Insights
              </Typography>
              <List>
                {businessInsights.map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${insight.metric}: ${formatValue(insight.value, insight.metric)}`}
                      secondary={insight.insight}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insight Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <AutoAwesomeIcon />
            {selectedInsight?.title}
            <Chip
              label={`${selectedInsight?.confidence}% confidence`}
              color={selectedInsight ? getConfidenceColor(selectedInsight.confidence) as any : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInsight && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedInsight.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Impact Level
                  </Typography>
                  <Chip
                    label={selectedInsight.impact}
                    color={getImpactColor(selectedInsight.impact) as any}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Data Source
                  </Typography>
                  <Typography variant="body1">
                    {selectedInsight.source.replace('_', ' ')}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedInsight.category}
                  </Typography>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">AI Recommendations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedInsight.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <LightbulbIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {selectedInsight.data && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Supporting Data</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                      {JSON.stringify(selectedInsight.data, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedInsight?.actionable && (
            <Button variant="contained">
              Implement Recommendations
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIInsightsDashboard;