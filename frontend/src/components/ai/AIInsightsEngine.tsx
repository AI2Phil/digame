import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  GpsFixed as TargetIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Tune as TuneIcon,
  Science as ScienceIcon,
  ModelTraining as ModelTrainingIcon
} from '@mui/icons-material';
import { api } from '../../services/api/EnhancedApiService';
import { useAdvancedLoading } from '../ui/AdvancedLoadingStates';
import { useErrorRecovery } from '../error/ErrorRecoverySystem';

// Types for AI/ML features
export interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'trend' | 'optimization';
  category: 'performance' | 'learning' | 'collaboration' | 'productivity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  timestamp: number;
  data: any;
  actionable: boolean;
  actions?: AIAction[];
  metadata: {
    modelId: string;
    modelVersion: string;
    dataPoints: number;
    accuracy: number;
    features: string[];
  };
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
  type: 'navigate' | 'execute' | 'configure' | 'learn_more';
  confidence: number;
  estimatedImpact: string;
  action: () => Promise<void> | void;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation';
  status: 'training' | 'ready' | 'updating' | 'error';
  accuracy: number;
  lastTrained: number;
  nextUpdate: number;
  dataPoints: number;
  features: string[];
  predictions: number;
  description: string;
}

export interface AIConfiguration {
  enableRealTimeInsights: boolean;
  insightFrequency: number;
  confidenceThreshold: number;
  enablePredictions: boolean;
  enableRecommendations: boolean;
  enableAnomalyDetection: boolean;
  autoExecuteActions: boolean;
  notificationLevel: 'all' | 'high' | 'critical';
  modelPreferences: {
    [key: string]: boolean;
  };
}

export interface TabPanelProps {
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
      id={`ai-insights-tabpanel-${index}`}
      aria-labelledby={`ai-insights-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// AI Insights Engine Component
export const AIInsightsEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [configuration, setConfiguration] = useState<AIConfiguration>({
    enableRealTimeInsights: true,
    insightFrequency: 300000, // 5 minutes
    confidenceThreshold: 0.7,
    enablePredictions: true,
    enableRecommendations: true,
    enableAnomalyDetection: true,
    autoExecuteActions: false,
    notificationLevel: 'high',
    modelPreferences: {}
  });
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [insightDetailsOpen, setInsightDetailsOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const { loading, error, startLoading, stopLoading, setLoadingError } = useAdvancedLoading();
  const { addError } = useErrorRecovery();

  // Fetch AI insights and models
  const fetchAIData = useCallback(async () => {
    startLoading('Loading AI insights...');
    
    try {
      const [insightsResponse, modelsResponse] = await Promise.all([
        api.get<AIInsight[]>('/api/ai/insights', {}, { enableCache: true, cacheTimeout: 60000 }),
        api.get<PredictiveModel[]>('/api/ai/models', {}, { enableCache: true, cacheTimeout: 300000 })
      ]);

      setInsights(insightsResponse);
      setModels(modelsResponse);
      stopLoading();
    } catch (error: any) {
      setLoadingError('Failed to load AI insights');
      addError({
        type: 'api',
        severity: 'medium',
        message: 'Failed to load AI insights',
        details: error,
        recoverable: true,
        autoRetryable: true,
        maxRetries: 3
      });
    }
  }, [startLoading, stopLoading, setLoadingError, addError]);

  // Real-time insights polling
  useEffect(() => {
    if (!realTimeEnabled || !configuration.enableRealTimeInsights) return;

    const interval = setInterval(fetchAIData, configuration.insightFrequency);
    return () => clearInterval(interval);
  }, [fetchAIData, realTimeEnabled, configuration.enableRealTimeInsights, configuration.insightFrequency]);

  // Initial data load
  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);

  // Filter insights based on configuration
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (insight.confidence < configuration.confidenceThreshold) return false;
      
      switch (configuration.notificationLevel) {
        case 'critical':
          return insight.impact === 'critical';
        case 'high':
          return insight.impact === 'critical' || insight.impact === 'high';
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => b.priority - a.priority);
  }, [insights, configuration]);

  // Execute AI action
  const executeAction = async (action: AIAction) => {
    try {
      await action.action();
      // Refresh insights after action execution
      await fetchAIData();
    } catch (error: any) {
      addError({
        type: 'api',
        severity: 'medium',
        message: `Failed to execute action: ${action.label}`,
        details: error,
        recoverable: true,
        autoRetryable: false,
        maxRetries: 1
      });
    }
  };

  // Train or retrain model
  const trainModel = async (modelId: string) => {
    try {
      startLoading(`Training model ${modelId}...`);
      await api.post(`/api/ai/models/${modelId}/train`);
      await fetchAIData();
      stopLoading();
    } catch (error: any) {
      setLoadingError('Failed to train model');
      addError({
        type: 'api',
        severity: 'high',
        message: 'Model training failed',
        details: error,
        recoverable: true,
        autoRetryable: false,
        maxRetries: 1
      });
    }
  };

  // Get insight icon
  const getInsightIcon = (insight: AIInsight) => {
    switch (insight.type) {
      case 'prediction':
        return <TimelineIcon />;
      case 'recommendation':
        return <LightbulbIcon />;
      case 'anomaly':
        return <WarningIcon />;
      case 'trend':
        return <TrendingUpIcon />;
      case 'optimization':
        return <TuneIcon />;
      default:
        return <AutoAwesomeIcon />;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get model status color
  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'training':
        return 'info';
      case 'updating':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading AI insights...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">AI Insights Engine</Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time AI-powered insights and recommendations
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={realTimeEnabled}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
              />
            }
            label="Real-time"
          />
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setConfigDialogOpen(true)}
          >
            Configure
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchAIData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4">{filteredInsights.length}</Typography>
              <Typography variant="body2" color="text.secondary">Active Insights</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ModelTrainingIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
              <Typography variant="h4">{models.filter(m => m.status === 'ready').length}</Typography>
              <Typography variant="body2" color="text.secondary">Active Models</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
              <Typography variant="h4">
                {filteredInsights.filter(i => i.impact === 'critical' || i.impact === 'high').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">High Priority</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SpeedIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
              <Typography variant="h4">
                {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Avg Confidence</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Insights" />
          <Tab label="Predictions" />
          <Tab label="Models" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Insights List */}
        <Grid container spacing={3}>
          {filteredInsights.map((insight) => (
            <Grid item xs={12} md={6} key={insight.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => {
                  setSelectedInsight(insight);
                  setInsightDetailsOpen(true);
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getInsightIcon(insight)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {insight.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={insight.impact} 
                        size="small" 
                        color={getImpactColor(insight.impact) as any}
                      />
                      <Chip 
                        label={`${Math.round(insight.confidence * 100)}%`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {insight.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={insight.confidence * 100}
                      sx={{ flexGrow: 1, mr: 2 }}
                    />
                    <Typography variant="caption">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={insight.category}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(insight.timestamp).toLocaleString()}
                    </Typography>
                  </Box>

                  {insight.actionable && insight.actions && insight.actions.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {insight.actions.slice(0, 2).map((action) => (
                        <Button
                          key={action.id}
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            executeAction(action);
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                      {insight.actions.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{insight.actions.length - 2} more actions
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredInsights.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No insights available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI insights will appear here as they are generated
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Predictions */}
        <Grid container spacing={3}>
          {insights.filter(i => i.type === 'prediction').map((prediction) => (
            <Grid item xs={12} md={6} lg={4} key={prediction.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{prediction.title}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {prediction.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Confidence: {Math.round(prediction.confidence * 100)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={prediction.confidence * 100}
                      color={prediction.confidence > 0.8 ? 'success' : prediction.confidence > 0.6 ? 'warning' : 'error'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={prediction.metadata.modelId}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {prediction.metadata.dataPoints} data points
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Models Management */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Last Trained</TableCell>
                <TableCell>Predictions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {model.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={model.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={model.status}
                      size="small"
                      color={getModelStatusColor(model.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {Math.round(model.accuracy * 100)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={model.accuracy * 100}
                        sx={{ width: 60 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(model.lastTrained).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.predictions.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Retrain Model">
                        <IconButton 
                          size="small"
                          onClick={() => trainModel(model.id)}
                          disabled={model.status === 'training'}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Analytics Dashboard */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Insight Generation Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Chart visualization would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Model Performance</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Performance metrics chart would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Insight Categories</Typography>
                <Grid container spacing={2}>
                  {['performance', 'learning', 'collaboration', 'productivity', 'risk'].map((category) => {
                    const categoryInsights = insights.filter(i => i.category === category);
                    const avgConfidence = categoryInsights.length > 0 
                      ? categoryInsights.reduce((sum, i) => sum + i.confidence, 0) / categoryInsights.length 
                      : 0;
                    
                    return (
                      <Grid item xs={12} md={2.4} key={category}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <AssessmentIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                            {category}
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {categoryInsights.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(avgConfidence * 100)}% avg confidence
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Insight Details Dialog */}
      <Dialog 
        open={insightDetailsOpen} 
        onClose={() => setInsightDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedInsight && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getInsightIcon(selectedInsight)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedInsight.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedInsight.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Confidence</Typography>
                  <Typography variant="h6" color="primary">
                    {Math.round(selectedInsight.confidence * 100)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Impact</Typography>
                  <Chip 
                    label={selectedInsight.impact}
                    color={getImpactColor(selectedInsight.impact) as any}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom>Model Information</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Model ID" 
                    secondary={selectedInsight.metadata.modelId} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Accuracy" 
                    secondary={`${Math.round(selectedInsight.metadata.accuracy * 100)}%`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Data Points" 
                    secondary={selectedInsight.metadata.dataPoints.toLocaleString()} 
                  />
                </ListItem>
              </List>

              {selectedInsight.actions && selectedInsight.actions.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Recommended Actions</Typography>
                  {selectedInsight.actions.map((action) => (
                    <Box key={action.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {action.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estimated Impact: {action.estimatedImpact}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInsightDetailsOpen(false)}>Close</Button>
              {selectedInsight.actions && selectedInsight.actions.length > 0 && (
                <Button 
                  variant="contained"
                  onClick={() => {
                    if (selectedInsight.actions && selectedInsight.actions[0]) {
                      executeAction(selectedInsight.actions[0]);
                    }
                    setInsightDetailsOpen(false);
                  }}
                >
                  Execute Primary Action
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog 
        open={configDialogOpen} 
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>AI Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={configuration.enableRealTimeInsights}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    enableRealTimeInsights: e.target.checked
                  }))}
                />
              }
              label="Enable Real-time Insights"
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Confidence Threshold</Typography>
              <Slider
                value={configuration.confidenceThreshold}
                onChange={(_, value) => setConfiguration(prev => ({
                  ...prev,
                  confidenceThreshold: value as number
                }))}
                min={0.1}
                max={1}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Notification Level</InputLabel>
                <Select
                  value={configuration.notificationLevel}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    notificationLevel: e.target.value as 'all' | 'high' | 'critical'
                  }))}
                  label="Notification Level"
                >
                  <MenuItem value="all">All Insights</MenuItem>
                  <MenuItem value="high">High Priority Only</MenuItem>
                  <MenuItem value="critical">Critical Only</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configuration.enablePredictions}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev,
                      enablePredictions: e.target.checked
                    }))}
                  />
                }
                label="Enable Predictions"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configuration.enableRecommendations}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev,
                      enableRecommendations: e.target.checked
                    }))}
                  />
                }
                label="Enable Recommendations"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configuration.enableAnomalyDetection}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev,
                      enableAnomalyDetection: e.target.checked
                    }))}
                  />
                }
                label="Enable Anomaly Detection"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configuration.autoExecuteActions}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev,
                      autoExecuteActions: e.target.checked
                    }))}
                  />
                }
                label="Auto-execute Low-risk Actions"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Save configuration
              localStorage.setItem('ai-configuration', JSON.stringify(configuration));
              setConfigDialogOpen(false);
            }}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIInsightsEngine;