import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
// Note: Treemap visualization would require additional charting library
// For now, we'll use the existing chart.js components

interface BundleModule {
  name: string;
  size: number;
  gzipSize: number;
  parsedSize: number;
  path: string;
  type: 'js' | 'css' | 'asset' | 'chunk';
  isEntry: boolean;
  isDynamic: boolean;
  dependencies: string[];
  duplicates?: string[];
}

interface BundleChunk {
  id: string;
  name: string;
  size: number;
  modules: BundleModule[];
  isEntry: boolean;
  isDynamic: boolean;
  parents: string[];
  children: string[];
}

interface BundleAnalysis {
  totalSize: number;
  totalGzipSize: number;
  totalParsedSize: number;
  chunks: BundleChunk[];
  modules: BundleModule[];
  duplicateModules: BundleModule[];
  largestModules: BundleModule[];
  recommendations: string[];
  performance: {
    score: number;
    metrics: {
      bundleSize: number;
      chunkCount: number;
      duplicateCount: number;
      unusedCode: number;
    };
  };
  treemapData: any;
}

const BundleAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<BundleChunk | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'chunks' | 'modules' | 'duplicates'>('overview');

  // Mock data for demonstration - in real implementation, this would come from webpack-bundle-analyzer
  const generateMockAnalysis = (): BundleAnalysis => {
    const modules: BundleModule[] = [
      {
        name: 'react',
        size: 42000,
        gzipSize: 13000,
        parsedSize: 42000,
        path: 'node_modules/react/index.js',
        type: 'js',
        isEntry: false,
        isDynamic: false,
        dependencies: [],
      },
      {
        name: 'react-dom',
        size: 120000,
        gzipSize: 38000,
        parsedSize: 120000,
        path: 'node_modules/react-dom/index.js',
        type: 'js',
        isEntry: false,
        isDynamic: false,
        dependencies: ['react'],
      },
      {
        name: '@mui/material',
        size: 280000,
        gzipSize: 85000,
        parsedSize: 280000,
        path: 'node_modules/@mui/material/index.js',
        type: 'js',
        isEntry: false,
        isDynamic: false,
        dependencies: ['react', 'react-dom'],
      },
      {
        name: 'chart.js',
        size: 180000,
        gzipSize: 55000,
        parsedSize: 180000,
        path: 'node_modules/chart.js/dist/chart.js',
        type: 'js',
        isEntry: false,
        isDynamic: true,
        dependencies: [],
      },
      {
        name: 'lodash',
        size: 70000,
        gzipSize: 25000,
        parsedSize: 70000,
        path: 'node_modules/lodash/index.js',
        type: 'js',
        isEntry: false,
        isDynamic: false,
        dependencies: [],
        duplicates: ['lodash/debounce', 'lodash/throttle'],
      },
      {
        name: 'main.js',
        size: 45000,
        gzipSize: 12000,
        parsedSize: 45000,
        path: 'src/index.js',
        type: 'js',
        isEntry: true,
        isDynamic: false,
        dependencies: ['react', 'react-dom'],
      },
    ];

    const chunks: BundleChunk[] = [
      {
        id: 'main',
        name: 'main',
        size: 487000,
        modules: modules.filter(m => !m.isDynamic),
        isEntry: true,
        isDynamic: false,
        parents: [],
        children: ['vendors', 'charts'],
      },
      {
        id: 'vendors',
        name: 'vendors',
        size: 442000,
        modules: modules.filter(m => m.path.includes('node_modules') && !m.isDynamic),
        isEntry: false,
        isDynamic: false,
        parents: ['main'],
        children: [],
      },
      {
        id: 'charts',
        name: 'charts',
        size: 180000,
        modules: modules.filter(m => m.isDynamic),
        isEntry: false,
        isDynamic: true,
        parents: ['main'],
        children: [],
      },
    ];

    const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
    const totalGzipSize = modules.reduce((sum, m) => sum + m.gzipSize, 0);

    return {
      totalSize,
      totalGzipSize,
      totalParsedSize: totalSize,
      chunks,
      modules,
      duplicateModules: modules.filter(m => m.duplicates && m.duplicates.length > 0),
      largestModules: modules.sort((a, b) => b.size - a.size).slice(0, 10),
      recommendations: [
        'Consider code splitting for @mui/material to reduce main bundle size',
        'Implement tree shaking for lodash to eliminate unused functions',
        'Use dynamic imports for chart.js to improve initial load time',
        'Remove duplicate lodash utilities and use a single import',
        'Consider using React.lazy() for heavy components',
        'Optimize images and assets with proper compression',
      ],
      performance: {
        score: 75,
        metrics: {
          bundleSize: totalSize,
          chunkCount: chunks.length,
          duplicateCount: 1,
          unusedCode: 15,
        },
      },
      treemapData: {
        datasets: [{
          tree: modules.map(m => ({
            name: m.name,
            value: m.size,
            color: m.type === 'js' ? 'rgba(33, 150, 243, 0.6)' : 
                   m.type === 'css' ? 'rgba(76, 175, 80, 0.6)' : 
                   'rgba(255, 152, 0, 0.6)',
          })),
        }],
      },
    };
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call webpack-bundle-analyzer API
      const mockAnalysis = generateMockAnalysis();
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Failed to analyze bundle');
      console.error('Bundle analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getSizeColor = (size: number) => {
    if (size < 50000) return 'success';
    if (size < 200000) return 'warning';
    return 'error';
  };

  const handleChunkDetails = (chunk: BundleChunk) => {
    setSelectedChunk(chunk);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing Bundle...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={runAnalysis}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return <Alert severity="info">No bundle analysis data available</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Bundle Analyzer
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewMode}
              label="View"
              onChange={(e) => setViewMode(e.target.value as any)}
            >
              <MenuItem value="overview">Overview</MenuItem>
              <MenuItem value="chunks">Chunks</MenuItem>
              <MenuItem value="modules">Modules</MenuItem>
              <MenuItem value="duplicates">Duplicates</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={runAnalysis}
            disabled={loading}
          >
            Re-analyze
          </Button>
        </Box>
      </Box>

      {/* Performance Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <SpeedIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" color={getPerformanceColor(analysis.performance.score)}>
                  {analysis.performance.score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performance Score
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={analysis.performance.score}
                color={getPerformanceColor(analysis.performance.score) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box textAlign="right">
              <Typography variant="body2" color="text.secondary">
                {analysis.performance.score >= 90 ? 'Excellent' :
                 analysis.performance.score >= 70 ? 'Good' : 'Needs Improvement'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <StorageIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {formatSize(analysis.totalSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bundle Size
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
                <DownloadIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {formatSize(analysis.totalGzipSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gzipped Size
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
                <CodeIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {analysis.chunks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chunks
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
                <WarningIcon color={analysis.duplicateModules.length > 0 ? 'warning' : 'success'} />
                <Box>
                  <Typography variant="h6">
                    {analysis.duplicateModules.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duplicate Modules
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <>
          {/* Largest Modules */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Largest Modules
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Size</TableCell>
                      <TableCell align="right">Gzipped</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysis.largestModules.slice(0, 10).map((module) => (
                      <TableRow key={module.name}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {module.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {module.path}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={module.type.toUpperCase()} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={getSizeColor(module.size)}>
                            {formatSize(module.size)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatSize(module.gzipSize)}
                        </TableCell>
                        <TableCell>
                          {module.isDynamic ? (
                            <Chip label="Dynamic" color="success" size="small" />
                          ) : module.isEntry ? (
                            <Chip label="Entry" color="primary" size="small" />
                          ) : (
                            <Chip label="Static" color="default" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimization Recommendations
              </Typography>
              <List>
                {analysis.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <LightbulbIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === 'chunks' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bundle Chunks
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Chunk Name</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Modules</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.chunks.map((chunk) => (
                    <TableRow key={chunk.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {chunk.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={getSizeColor(chunk.size)}>
                          {formatSize(chunk.size)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {chunk.modules.length}
                      </TableCell>
                      <TableCell>
                        {chunk.isEntry ? (
                          <Chip label="Entry" color="primary" size="small" />
                        ) : chunk.isDynamic ? (
                          <Chip label="Dynamic" color="success" size="small" />
                        ) : (
                          <Chip label="Vendor" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleChunkDetails(chunk)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {viewMode === 'duplicates' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Duplicate Modules
            </Typography>
            {analysis.duplicateModules.length === 0 ? (
              <Alert severity="success">
                <CheckCircleIcon sx={{ mr: 1 }} />
                No duplicate modules found! Your bundle is well optimized.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="right">Size</TableCell>
                      <TableCell>Duplicates</TableCell>
                      <TableCell>Impact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysis.duplicateModules.map((module) => (
                      <TableRow key={module.name}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {module.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatSize(module.size)}
                        </TableCell>
                        <TableCell>
                          {module.duplicates?.map((dup, index) => (
                            <Chip key={index} label={dup} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip label="High" color="error" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chunk Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chunk Details: {selectedChunk?.name}
        </DialogTitle>
        <DialogContent>
          {selectedChunk && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Size
                  </Typography>
                  <Typography variant="h6">
                    {formatSize(selectedChunk.size)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Module Count
                  </Typography>
                  <Typography variant="h6">
                    {selectedChunk.modules.length}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Modules in this Chunk
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="right">Size</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedChunk.modules.map((module) => (
                      <TableRow key={module.name}>
                        <TableCell>
                          <Typography variant="body2">
                            {module.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatSize(module.size)}
                        </TableCell>
                        <TableCell>
                          <Chip label={module.type.toUpperCase()} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BundleAnalyzer;