import React, { useState, useEffect } from 'react';
import {
  Box,
  Skeleton,
  LinearProgress,
  CircularProgress,
  Typography,
import {
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  Slide,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Types for loading states
export interface LoadingConfig {
  type: 'skeleton' | 'progress' | 'spinner' | 'custom';
  message?: string;
  showProgress?: boolean;
  showETA?: boolean;
  showCancel?: boolean;
  animated?: boolean;
  variant?: 'determinate' | 'indeterminate';
}

export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  eta?: number;
  speed?: number;
  stage?: string;
}

export interface LoadingStateProps {
  loading: boolean;
  config?: LoadingConfig;
  progress?: ProgressInfo;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

// Skeleton Loading Components
export const SkeletonCard: React.FC<{ lines?: number; showAvatar?: boolean }> = ({ 
  lines = 3, 
  showAvatar = false 
}) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </Box>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="text" 
          width={index === lines - 1 ? '80%' : '100%'} 
          height={16}
          sx={{ mb: 0.5 }}
        />
      ))}
    </CardContent>
  </Card>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <Box>
    {/* Table Header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50' }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" width="100%" height={20} />
      ))}
    </Box>
    
    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1, p: 2 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width="100%" 
            height={16}
            animation={rowIndex % 2 === 0 ? 'wave' : 'pulse'}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const SkeletonChart: React.FC<{ type?: 'bar' | 'line' | 'pie' }> = ({ type = 'bar' }) => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      
      {type === 'pie' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Skeleton variant="circular" width={150} height={150} />
        </Box>
      ) : (
        <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton 
              key={index}
              variant="rectangular" 
              width="100%" 
              height={Math.random() * 150 + 50}
              animation="wave"
            />
          ))}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="text" width="20%" height={16} />
      </Box>
    </CardContent>
  </Card>
);

// Progressive Loading Component
export const ProgressiveLoader: React.FC<{
  stages: string[];
  currentStage: number;
  progress?: number;
  showDetails?: boolean;
}> = ({ stages, currentStage, progress, showDetails = true }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Loading...
      </Typography>
      
      {/* Overall Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            Stage {currentStage + 1} of {stages.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTime(elapsedTime)}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant={progress !== undefined ? 'determinate' : 'indeterminate'}
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
        
        {progress !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Math.round(progress)}% complete
          </Typography>
        )}
      </Box>

      {/* Stage Details */}
      {showDetails && (
        <Box>
          {stages.map((stage, index) => (
            <Fade key={index} in={index <= currentStage} timeout={500}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {index < currentStage ? (
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                ) : index === currentStage ? (
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                ) : (
                  <Box sx={{ width: 20, height: 20, mr: 2 }} />
                )}
                
                <Typography 
                  variant="body2" 
                  color={index <= currentStage ? 'text.primary' : 'text.secondary'}
                  sx={{ 
                    fontWeight: index === currentStage ? 'medium' : 'normal',
                    textDecoration: index < currentStage ? 'line-through' : 'none'
                  }}
                >
                  {stage}
                </Typography>
              </Box>
            </Fade>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Streaming Data Loader
export const StreamingLoader: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loadingMessage?: string;
  batchSize?: number;
}> = ({ items, renderItem, loadingMessage = 'Loading more...', batchSize = 10 }) => {
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setVisibleItems(items.slice(0, batchSize));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [items, batchSize]);

  const loadMore = () => {
    if (visibleItems.length >= items.length) return;

    setIsLoading(true);
    setTimeout(() => {
      const nextBatch = items.slice(0, visibleItems.length + batchSize);
      setVisibleItems(nextBatch);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Box>
      {visibleItems.map((item, index) => (
        <Grow key={index} in timeout={300 + index * 50}>
          <Box>{renderItem(item, index)}</Box>
        </Grow>
      ))}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            {loadingMessage}
          </Typography>
        </Box>
      )}
      
      {!isLoading && visibleItems.length < items.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Button onClick={loadMore} variant="outlined">
            Load More ({items.length - visibleItems.length} remaining)
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Performance Metrics Display
export const PerformanceMetrics: React.FC<{
  metrics: {
    loadTime?: number;
    apiCalls?: number;
    cacheHits?: number;
    dataSize?: number;
  };
  showDetails?: boolean;
}> = ({ metrics, showDetails = false }) => {
  if (!showDetails) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Slide direction="up" in={showDetails} mountOnEnter unmountOnExit>
      <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Performance Metrics
          </Typography>
          
          <Grid container spacing={2}>
            {metrics.loadTime && (
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {metrics.loadTime}ms
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {metrics.apiCalls && (
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {metrics.apiCalls} calls
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {metrics.cacheHits !== undefined && (
              <Grid item xs={3}>
                <Chip 
                  label={`${metrics.cacheHits}% cached`}
                  size="small"
                  color={metrics.cacheHits > 80 ? 'success' : 'default'}
                />
              </Grid>
            )}
            
            {metrics.dataSize && (
              <Grid item xs={3}>
                <Typography variant="caption">
                  {formatBytes(metrics.dataSize)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Slide>
  );
};

// Main Advanced Loading Component
export const AdvancedLoadingState: React.FC<LoadingStateProps> = ({
  loading,
  config = { type: 'skeleton' },
  progress,
  error,
  onRetry,
  onCancel,
  children
}) => {
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [loadStartTime] = useState(Date.now());

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        {error}
      </Alert>
    );
  }

  if (!loading) {
    const loadTime = Date.now() - loadStartTime;
    return (
      <>
        {children}
        <PerformanceMetrics 
          metrics={{ loadTime }}
          showDetails={showPerformanceMetrics}
        />
        {process.env.NODE_ENV === 'development' && (
          <Tooltip title="Show performance metrics">
            <IconButton 
              size="small" 
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  }

  const renderLoadingContent = () => {
    switch (config.type) {
      case 'progress':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {config.message && (
              <Typography variant="h6" gutterBottom>
                {config.message}
              </Typography>
            )}
            
            <CircularProgress 
              variant={config.variant || 'indeterminate'}
              value={progress?.percentage}
              size={60}
              sx={{ mb: 2 }}
            />
            
            {progress && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {progress.current} of {progress.total} items
                </Typography>
                
                {progress.eta && (
                  <Typography variant="caption" color="text.secondary">
                    ETA: {Math.round(progress.eta / 1000)}s
                  </Typography>
                )}
                
                {progress.stage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {progress.stage}
                  </Typography>
                )}
              </Box>
            )}
            
            {config.showCancel && onCancel && (
              <Button onClick={onCancel} sx={{ mt: 2 }}>
                Cancel
              </Button>
            )}
          </Box>
        );

      case 'spinner':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            {config.message && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                {config.message}
              </Typography>
            )}
          </Box>
        );

      case 'skeleton':
      default:
        return (
          <Box>
            <SkeletonCard lines={3} showAvatar />
            <SkeletonCard lines={2} />
            <SkeletonTable rows={3} columns={4} />
          </Box>
        );
    }
  };

  return (
    <Fade in={loading} timeout={300}>
      <Box>
        {renderLoadingContent()}
      </Box>
    </Fade>
  );
};

// Hook for managing loading states
export const useAdvancedLoading = (initialLoading: boolean = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | undefined>();

  const startLoading = (message?: string) => {
    setLoading(true);
    setError(null);
    setProgress(undefined);
  };

  const stopLoading = () => {
    setLoading(false);
    setProgress(undefined);
  };

  const setLoadingError = (errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
    setProgress(undefined);
  };

  const updateProgress = (current: number, total: number, stage?: string) => {
    const percentage = (current / total) * 100;
    setProgress({
      current,
      total,
      percentage,
      stage
    });
  };

  const retry = () => {
    setError(null);
    setLoading(true);
  };

  return {
    loading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    updateProgress,
    retry
  };
};

export default AdvancedLoadingState;