import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
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
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { performanceApi } from '../../services/performanceApi';

interface QueryOptimizationRecommendation {
  query_hash: string;
  query_text: string;
  query_type: string;
  frequency: number;
  avg_execution_time_ms: number;
  max_execution_time_ms: number;
  impact_score: number;
  tables: string[];
  optimization_suggestions: string[];
  priority: string;
}

interface QueryRowProps {
  recommendation: QueryOptimizationRecommendation;
  onViewDetails: (recommendation: QueryOptimizationRecommendation) => void;
}

const QueryRow: React.FC<QueryRowProps> = ({ recommendation, onViewDetails }) => {
  const [open, setOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const truncateQuery = (query: string, maxLength: number = 100) => {
    return query.length > maxLength ? `${query.substring(0, maxLength)}...` : query;
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Chip
            label={recommendation.priority}
            color={getPriorityColor(recommendation.priority) as any}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontFamily="monospace">
            {truncateQuery(recommendation.query_text)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip label={recommendation.query_type} variant="outlined" size="small" />
        </TableCell>
        <TableCell align="right">{recommendation.frequency}</TableCell>
        <TableCell align="right">
          {formatDuration(recommendation.avg_execution_time_ms)}
        </TableCell>
        <TableCell align="right">
          {formatDuration(recommendation.max_execution_time_ms)}
        </TableCell>
        <TableCell align="right">
          {recommendation.impact_score.toFixed(1)}
        </TableCell>
        <TableCell>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewDetails(recommendation)}
            startIcon={<AssessmentIcon />}
          >
            Details
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Query Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Full Query:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2" fontFamily="monospace" style={{ whiteSpace: 'pre-wrap' }}>
                      {recommendation.query_text}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Affected Tables:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {recommendation.tables.map((table, index) => (
                      <Chip key={index} label={table} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Optimization Suggestions:
                  </Typography>
                  <List dense>
                    {recommendation.optimization_suggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <LightbulbIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface QueryDetailsDialogProps {
  open: boolean;
  recommendation: QueryOptimizationRecommendation | null;
  onClose: () => void;
}

const QueryDetailsDialog: React.FC<QueryDetailsDialogProps> = ({ open, recommendation, onClose }) => {
  if (!recommendation) return null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CodeIcon />
          Query Optimization Details
          <Chip
            label={recommendation.priority}
            color={recommendation.priority === 'critical' ? 'error' : 'warning'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Execution Frequency
                  </Typography>
                  <Typography variant="h6">
                    {recommendation.frequency.toLocaleString()} times
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Execution Time
                  </Typography>
                  <Typography variant="h6">
                    {formatDuration(recommendation.avg_execution_time_ms)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Maximum Execution Time
                  </Typography>
                  <Typography variant="h6">
                    {formatDuration(recommendation.max_execution_time_ms)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Impact Score
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">
                      {recommendation.impact_score.toFixed(1)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(recommendation.impact_score * 10, 100)}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      color={recommendation.impact_score > 10 ? 'error' : recommendation.impact_score > 5 ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Query Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Query Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Query Type
                  </Typography>
                  <Chip label={recommendation.query_type} variant="outlined" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Query Hash
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {recommendation.query_hash}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Affected Tables
                  </Typography>
                  <Box>
                    {recommendation.tables.map((table, index) => (
                      <Chip key={index} label={table} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Full Query */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SQL Query
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                  <Typography variant="body2" fontFamily="monospace" style={{ whiteSpace: 'pre-wrap' }}>
                    {recommendation.query_text}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Optimization Suggestions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Optimization Suggestions
                </Typography>
                {recommendation.optimization_suggestions.map((suggestion, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LightbulbIcon color="primary" fontSize="small" />
                        <Typography variant="body1">
                          Suggestion {index + 1}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        {suggestion}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>
          Create Optimization Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const QueryOptimization: React.FC = () => {
  const [recommendations, setRecommendations] = useState<QueryOptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<QueryOptimizationRecommendation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await performanceApi.getQueryOptimizationRecommendations(50);
      setRecommendations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch query optimization recommendations');
      console.error('Query optimization fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleViewDetails = (recommendation: QueryOptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedRecommendation(null);
  };

  const getSummaryStats = () => {
    if (recommendations.length === 0) return null;

    const totalQueries = recommendations.reduce((sum, rec) => sum + rec.frequency, 0);
    const avgImpactScore = recommendations.reduce((sum, rec) => sum + rec.impact_score, 0) / recommendations.length;
    const criticalCount = recommendations.filter(rec => rec.priority === 'critical').length;
    const highCount = recommendations.filter(rec => rec.priority === 'high').length;

    return {
      totalQueries,
      avgImpactScore,
      criticalCount,
      highCount,
      totalRecommendations: recommendations.length
    };
  };

  const stats = getSummaryStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchRecommendations}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Query Optimization
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRecommendations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Stats */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <SpeedIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {stats.totalRecommendations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Recommendations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {stats.totalQueries.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Query Executions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AssessmentIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {stats.avgImpactScore.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Impact Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon color="error" />
                  <Box>
                    <Typography variant="h6">
                      {stats.criticalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Critical Priority
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h6">
                      {stats.highCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recommendations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Query Optimization Recommendations
          </Typography>
          
          {recommendations.length === 0 ? (
            <Alert severity="info">
              No query optimization recommendations available. This could mean your queries are already well-optimized!
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Priority</TableCell>
                    <TableCell>Query</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Frequency</TableCell>
                    <TableCell align="right">Avg Time</TableCell>
                    <TableCell align="right">Max Time</TableCell>
                    <TableCell align="right">Impact Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((recommendation) => (
                    <QueryRow
                      key={recommendation.query_hash}
                      recommendation={recommendation}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Query Details Dialog */}
      <QueryDetailsDialog
        open={detailsDialogOpen}
        recommendation={selectedRecommendation}
        onClose={handleCloseDetails}
      />
    </Box>
  );
};

export default QueryOptimization;