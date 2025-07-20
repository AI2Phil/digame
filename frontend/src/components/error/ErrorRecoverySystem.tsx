import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Typography,
import {
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  NetworkCheck as NetworkCheckIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

// Types for error recovery
export interface ErrorInfo {
  id: string;
  type: 'network' | 'api' | 'validation' | 'permission' | 'timeout' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  timestamp: number;
  component?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  recoverable: boolean;
  autoRetryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  type: 'retry' | 'refresh' | 'navigate' | 'reset' | 'contact' | 'custom';
  icon?: React.ReactNode;
  primary?: boolean;
  action: () => Promise<void> | void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional: boolean;
  action?: () => Promise<boolean>;
}

export interface ErrorRecoveryProps {
  error: ErrorInfo | null;
  onRecover?: () => void;
  onDismiss?: () => void;
  onReport?: (error: ErrorInfo, userFeedback?: string) => void;
  showDetails?: boolean;
  autoRetry?: boolean;
  customActions?: RecoveryAction[];
}

// Error Recovery Hook
export const useErrorRecovery = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map());

  const addError = useCallback((error: Omit<ErrorInfo, 'id' | 'timestamp' | 'retryCount'>) => {
    const errorInfo: ErrorInfo = {
      ...error,
      id: generateErrorId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    setErrors(prev => [...prev, errorInfo]);
    return errorInfo.id;
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    setRetryAttempts(prev => {
      const newMap = new Map(prev);
      newMap.delete(errorId);
      return newMap;
    });
  }, []);

  const retryError = useCallback(async (errorId: string, retryAction: () => Promise<void>) => {
    const error = errors.find(e => e.id === errorId);
    if (!error) return false;

    const currentRetries = retryAttempts.get(errorId) || 0;
    if (currentRetries >= error.maxRetries) {
      return false;
    }

    try {
      setRetryAttempts(prev => new Map(prev).set(errorId, currentRetries + 1));
      await retryAction();
      removeError(errorId);
      return true;
    } catch (retryError) {
      if (currentRetries + 1 >= error.maxRetries) {
        // Update error to non-retryable
        setErrors(prev => prev.map(e => 
          e.id === errorId 
            ? { ...e, autoRetryable: false, recoverable: false }
            : e
        ));
      }
      return false;
    }
  }, [errors, retryAttempts, removeError]);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setRetryAttempts(new Map());
  }, []);

  return {
    errors,
    addError,
    removeError,
    retryError,
    clearAllErrors,
    hasErrors: errors.length > 0,
    criticalErrors: errors.filter(e => e.severity === 'critical'),
  };
};

// Auto-retry with exponential backoff
export const useAutoRetry = (
  error: ErrorInfo | null,
  retryAction: () => Promise<void>,
  enabled: boolean = true
) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  useEffect(() => {
    if (!error || !enabled || !error.autoRetryable || error.retryCount >= error.maxRetries) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, error.retryCount), 30000); // Max 30 seconds
    setNextRetryIn(delay);

    const timer = setTimeout(async () => {
      setIsRetrying(true);
      try {
        await retryAction();
      } catch (retryError) {
        console.error('Auto-retry failed:', retryError);
      } finally {
        setIsRetrying(false);
        setNextRetryIn(0);
      }
    }, delay);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setNextRetryIn(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [error, retryAction, enabled]);

  return { isRetrying, nextRetryIn: Math.ceil(nextRetryIn / 1000) };
};

// Error Recovery Component
export const ErrorRecoverySystem: React.FC<ErrorRecoveryProps> = ({
  error,
  onRecover,
  onDismiss,
  onReport,
  showDetails = false,
  autoRetry = true,
  customActions = []
}) => {
  const [expanded, setExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [recoverySteps, setRecoverySteps] = useState<RecoveryStep[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showRecoveryWizard, setShowRecoveryWizard] = useState(false);

  const { isRetrying, nextRetryIn } = useAutoRetry(
    error,
    async () => {
      if (onRecover) {
        await onRecover();
      }
    },
    autoRetry && error?.autoRetryable
  );

  useEffect(() => {
    if (error && error.recoverable) {
      setRecoverySteps(generateRecoverySteps(error));
    }
  }, [error]);

  if (!error) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
      default:
        return <InfoIcon />;
    }
  };

  const getDefaultActions = (): RecoveryAction[] => {
    const actions: RecoveryAction[] = [];

    if (error.autoRetryable && error.retryCount < error.maxRetries) {
      actions.push({
        id: 'retry',
        label: isRetrying ? 'Retrying...' : `Retry${nextRetryIn > 0 ? ` (${nextRetryIn}s)` : ''}`,
        description: 'Attempt to perform the action again',
        type: 'retry',
        icon: <RefreshIcon />,
        primary: true,
        action: async () => {
          if (onRecover) {
            await onRecover();
          }
        }
      });
    }

    if (error.type === 'network') {
      actions.push({
        id: 'check-connection',
        label: 'Check Connection',
        description: 'Verify your internet connection',
        type: 'custom',
        icon: <NetworkCheckIcon />,
        action: () => {
          window.open('https://www.google.com', '_blank');
        }
      });
    }

    if (error.recoverable && recoverySteps.length > 0) {
      actions.push({
        id: 'recovery-wizard',
        label: 'Recovery Wizard',
        description: 'Step-by-step recovery guidance',
        type: 'custom',
        icon: <SettingsIcon />,
        action: () => {
          setShowRecoveryWizard(true);
        }
      });
    }

    actions.push({
      id: 'refresh',
      label: 'Refresh Page',
      description: 'Reload the current page',
      type: 'refresh',
      icon: <RefreshIcon />,
      action: () => {
        window.location.reload();
      },
      requiresConfirmation: true,
      confirmationMessage: 'This will reload the page and you may lose unsaved changes.'
    });

    if (onReport) {
      actions.push({
        id: 'report',
        label: 'Report Issue',
        description: 'Send error details to support team',
        type: 'contact',
        icon: <BugReportIcon />,
        action: () => {
          setReportDialogOpen(true);
        }
      });
    }

    return actions;
  };

  const allActions = [...getDefaultActions(), ...customActions];

  const handleActionClick = async (action: RecoveryAction) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(action.confirmationMessage || 'Are you sure?');
      if (!confirmed) return;
    }

    try {
      await action.action();
    } catch (actionError) {
      console.error('Recovery action failed:', actionError);
    }
  };

  const handleReportSubmit = () => {
    if (onReport) {
      onReport(error, userFeedback);
    }
    setReportDialogOpen(false);
    setUserFeedback('');
  };

  const executeRecoveryStep = async (step: RecoveryStep) => {
    if (step.action) {
      try {
        const success = await step.action();
        if (success) {
          setRecoverySteps(prev => prev.map(s => 
            s.id === step.id ? { ...s, completed: true } : s
          ));
          setActiveStep(prev => prev + 1);
        }
      } catch (stepError) {
        console.error('Recovery step failed:', stepError);
      }
    }
  };

  return (
    <>
      <Alert 
        severity={getSeverityColor(error.severity) as any}
        icon={getSeverityIcon(error.severity)}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {allActions.slice(0, 2).map(action => (
              <Button
                key={action.id}
                color="inherit"
                size="small"
                onClick={() => handleActionClick(action)}
                disabled={action.id === 'retry' && isRetrying}
                startIcon={action.icon}
              >
                {action.label}
              </Button>
            ))}
            {onDismiss && (
              <IconButton
                color="inherit"
                size="small"
                onClick={onDismiss}
              >
                <CancelIcon />
              </IconButton>
            )}
          </Box>
        }
      >
        <AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {error.message}
            <Chip 
              label={error.type} 
              size="small" 
              variant="outlined" 
            />
            {error.retryCount > 0 && (
              <Chip 
                label={`Retry ${error.retryCount}/${error.maxRetries}`}
                size="small"
                color="warning"
              />
            )}
          </Box>
        </AlertTitle>

        {isRetrying && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              Attempting to recover...
            </Typography>
          </Box>
        )}

        {(showDetails || expanded) && (
          <Collapse in={expanded || showDetails}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Error Details:</strong>
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Time" 
                    secondary={new Date(error.timestamp).toLocaleString()} 
                  />
                </ListItem>
                
                {error.component && (
                  <ListItem>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Component" 
                      secondary={error.component} 
                    />
                  </ListItem>
                )}
                
                {error.url && (
                  <ListItem>
                    <ListItemIcon><NetworkCheckIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="URL" 
                      secondary={error.url} 
                    />
                  </ListItem>
                )}
              </List>

              {error.details && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Technical Details:
                  </Typography>
                  <Box 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200
                    }}
                  >
                    {JSON.stringify(error.details, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {allActions.slice(2).map(action => (
            <Button
              key={action.id}
              variant="outlined"
              size="small"
              onClick={() => handleActionClick(action)}
              startIcon={action.icon}
            >
              {action.label}
            </Button>
          ))}
          
          {!showDetails && (
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? 'Less' : 'More'} Details
            </Button>
          )}
        </Box>
      </Alert>

      {/* Recovery Wizard Dialog */}
      <Dialog 
        open={showRecoveryWizard} 
        onClose={() => setShowRecoveryWizard(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Error Recovery Wizard</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {recoverySteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel 
                  optional={step.optional ? <Typography variant="caption">Optional</Typography> : null}
                  StepIconComponent={() => 
                    step.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: index === activeStep ? 'primary.main' : 'grey.300',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem'
                      }}>
                        {index + 1}
                      </Box>
                  }
                >
                  {step.title}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" paragraph>
                    {step.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => executeRecoveryStep(step)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {step.completed ? 'Completed' : 'Execute'}
                    </Button>
                    {step.optional && (
                      <Button
                        onClick={() => setActiveStep(prev => prev + 1)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Skip
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecoveryWizard(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Report Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Error</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Help us improve by reporting this error. Your feedback is valuable for fixing issues.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe what you were doing when this error occurred"
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
              />
            }
            label="Include technical details (recommended)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReportSubmit}
            variant="contained"
            startIcon={<SendIcon />}
          >
            Send Report
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Utility functions
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateRecoverySteps = (error: ErrorInfo): RecoveryStep[] => {
  const steps: RecoveryStep[] = [];

  switch (error.type) {
    case 'network':
      steps.push(
        {
          id: 'check-connection',
          title: 'Check Internet Connection',
          description: 'Verify that your device is connected to the internet',
          completed: false,
          optional: false,
          action: async () => {
            // Simple connectivity check
            try {
              await fetch('/api/health', { method: 'HEAD' });
              return true;
            } catch {
              return false;
            }
          }
        },
        {
          id: 'clear-cache',
          title: 'Clear Browser Cache',
          description: 'Clear cached data that might be causing issues',
          completed: false,
          optional: true,
          action: async () => {
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            return true;
          }
        }
      );
      break;

    case 'api':
      steps.push(
        {
          id: 'retry-request',
          title: 'Retry API Request',
          description: 'Attempt to make the API request again',
          completed: false,
          optional: false
        },
        {
          id: 'check-permissions',
          title: 'Verify Permissions',
          description: 'Ensure you have the necessary permissions for this action',
          completed: false,
          optional: false
        }
      );
      break;

    default:
      steps.push({
        id: 'generic-recovery',
        title: 'Basic Recovery',
        description: 'Perform basic recovery steps',
        completed: false,
        optional: false
      });
  }

  return steps;
};

export default ErrorRecoverySystem;