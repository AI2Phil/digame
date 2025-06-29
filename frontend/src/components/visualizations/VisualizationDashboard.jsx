import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Button,
  CircularProgress,
  Alert,
  AlertTitle, // Added AlertTitle
  Tabs,
  Tab
} from '@mui/material';
import { 
  getHeatmapData, 
  getSankeyData, 
  getRadarData, 
  getTimelineData,
  getUserModels,
  publishModel // Imported publishModel
} from '../services/visualizationService';
import HeatmapChart from './visualizations/HeatmapChart';
import SankeyChart from './visualizations/SankeyChart';
import RadarChart from './visualizations/RadarChart';
import TimelineChart from './visualizations/TimelineChart';

/**
 * Dashboard component for behavioral pattern visualizations
 * @returns {JSX.Element} - Rendered component
 */
const VisualizationDashboard = () => {
  // State for user and model selection
  const [userId, setUserId] = useState(1); // Default to user 1
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [timeWindow, setTimeWindow] = useState(30); // Default to 30 days
  const [days, setDays] = useState(7); // Default to 7 days for timeline
  
  // State for visualization data
  const [heatmapData, setHeatmapData] = useState(null);
  const [sankeyData, setSankeyData] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false); 
  const [error, setError] = useState(null); // General error for data fetching
  const [activeTab, setActiveTab] = useState(0);
  const [publishSuccess, setPublishSuccess] = useState(null); // For publish success message
  const [publishError, setPublishError] = useState(null); // For publish error message
  
  // Fetch user models on component mount
  useEffect(() => {
    fetchUserModels();
  }, [userId]);
  
  // Fetch visualization data when model or time window changes
  useEffect(() => {
    if (selectedModel !== null || timeWindow !== null) {
      fetchVisualizationData();
    }
  }, [selectedModel, timeWindow, days]);
  
  /**
   * Fetch behavioral models for the current user
   */
  const fetchUserModels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const modelsData = await getUserModels(userId);
      setModels(modelsData);
      
      // Select the first model by default if available
      if (modelsData.length > 0 && selectedModel === null) {
        setSelectedModel(modelsData[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user models:', err);
      setError('Failed to fetch behavioral models. Please try again later.');
      setLoading(false);
    }
  };
  
  /**
   * Fetch all visualization data
   */
  const fetchVisualizationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all visualizations in parallel
      const [heatmap, sankey, radar, timeline] = await Promise.all([
        getHeatmapData(userId, selectedModel, timeWindow),
        getSankeyData(userId, selectedModel, timeWindow),
        getRadarData(userId, selectedModel),
        getTimelineData(userId, days, selectedModel)
      ]);
      
      setHeatmapData(heatmap);
      setSankeyData(sankey);
      setRadarData(radar);
      setTimelineData(timeline);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching visualization data:', err);
      setError('Failed to fetch visualization data. Please try again later.');
      setLoading(false);
    }
  };
  
  /**
   * Handle tab change
   * @param {Event} event - Event object
   * @param {number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  /**
   * Handle model change
   * @param {Event} event - Event object
   */
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };
  
  /**
   * Handle time window change
   * @param {Event} event - Event object
   */
  const handleTimeWindowChange = (event) => {
    setTimeWindow(event.target.value);
  };
  
  /**
   * Handle days change for timeline
   * @param {Event} event - Event object
   */
  const handleDaysChange = (event) => {
    setDays(event.target.value);
  };
  
  /**
   * Refresh visualization data
   */
  const handleRefresh = () => {
    fetchVisualizationData();
  };

  /**
   * Handle publishing the selected model
   */
  const handlePublishModel = async () => {
    if (!selectedModel) {
      setPublishError("No model selected to publish.");
      return;
    }
    setPublishing(true);
    setPublishSuccess(null);
    setPublishError(null);

    publishModel(selectedModel)
      .then(response => {
        setPublishSuccess(response.message || 'Model published successfully!');
        setPublishError(null);
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.detail) {
          setPublishError(err.response.data.detail);
        } else if (err.message) {
          setPublishError(err.message);
        } else {
          setPublishError('An unexpected error occurred while publishing.');
        }
        setPublishSuccess(null);
      })
      .finally(() => {
        setPublishing(false);
      });
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Behavioral Pattern Visualizations
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="model-select-label">Behavioral Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  id="model-select"
                  value={selectedModel || ''}
                  label="Behavioral Model"
                  onChange={handleModelChange}
                  disabled={loading || models.length === 0}
                >
                  {models.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name || `Model #${model.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="time-window-label">Time Window (days)</InputLabel>
                <Select
                  labelId="time-window-label"
                  id="time-window-select"
                  value={timeWindow}
                  label="Time Window (days)"
                  onChange={handleTimeWindowChange}
                  disabled={loading}
                >
                  <MenuItem value={7}>Last 7 days</MenuItem>
                  <MenuItem value={14}>Last 14 days</MenuItem>
                  <MenuItem value={30}>Last 30 days</MenuItem>
                  <MenuItem value={90}>Last 90 days</MenuItem>
                  <MenuItem value={180}>Last 180 days</MenuItem>
                  <MenuItem value={365}>Last year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="timeline-days"
                label="Timeline Days"
                type="number"
                value={days}
                onChange={handleDaysChange}
                InputProps={{ inputProps: { min: 1, max: 90 } }}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={1.5}> 
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                disabled={loading || selectedModel === null}
              >
                {loading ? <CircularProgress size={24} /> : 'Refresh Data'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={handlePublishModel}
                disabled={loading || publishing || selectedModel === null}
              >
                {publishing ? <CircularProgress size={24} /> : 'Publish Model'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* General error for data fetching */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}> 
            {error}
          </Alert>
        )}

        {/* Publish Success Alert */}
        {publishSuccess && (
          <Alert severity="success" onClose={() => setPublishSuccess(null)} sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>Success</AlertTitle>
            {publishSuccess}
          </Alert>
        )}

        {/* Publish Error Alert */}
        {publishError && (
          <Alert severity="error" onClose={() => setPublishError(null)} sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {publishError}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="visualization tabs"
          >
            <Tab label="All Visualizations" />
            <Tab label="Heatmap" />
            <Tab label="Sankey Diagram" />
            <Tab label="Radar Chart" />
            <Tab label="Timeline" />
          </Tabs>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* All Visualizations Tab */}
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                  <HeatmapChart data={heatmapData} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <RadarChart data={radarData} />
                </Grid>
                <Grid item xs={12}>
                  <SankeyChart data={sankeyData} />
                </Grid>
                <Grid item xs={12}>
                  <TimelineChart data={timelineData} />
                </Grid>
              </Grid>
            )}
            
            {/* Heatmap Tab */}
            {activeTab === 1 && (
              <HeatmapChart 
                data={heatmapData} 
                title={`Activity Patterns by Hour and Day (${timeWindow} day window)`} 
              />
            )}
            
            {/* Sankey Diagram Tab */}
            {activeTab === 2 && (
              <SankeyChart 
                data={sankeyData} 
                title={`Pattern Transitions (${timeWindow} day window)`} 
              />
            )}
            
            {/* Radar Chart Tab */}
            {activeTab === 3 && (
              <RadarChart 
                data={radarData} 
                title="Pattern Categories Distribution" 
              />
            )}
            
            {/* Timeline Tab */}
            {activeTab === 4 && (
              <TimelineChart 
                data={timelineData} 
                title={`Behavioral Patterns Timeline (${days} days)`} 
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default VisualizationDashboard;