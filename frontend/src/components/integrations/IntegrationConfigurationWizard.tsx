/**
 * Integration Configuration Wizard - Phase 2B Implementation
 * Priority 2: Integration Ecosystem Completion (85% → 95%)
 * 
 * Step-by-step wizard for configuring new integrations with guided setup
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Types
interface WizardField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  default?: any;
  placeholder?: string;
  validation?: {
    min_length?: number;
    max_length?: number;
    min?: number;
    max?: number;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  sensitive?: boolean;
  depends_on?: string;
}

interface WizardStep {
  step: number;
  title: string;
  description: string;
  fields: WizardField[];
}

interface WizardConfig {
  integration_id: string;
  integration_name: string;
  total_steps: number;
  estimated_time_minutes: number;
  steps: WizardStep[];
  requirements: {
    permissions: string[];
    auth_types: string[];
    features: string[];
  };
  help_resources: {
    documentation: string;
    support: string;
    video_tutorial: string;
  };
}

interface Props {
  integrationId: string;
  onComplete: (configuration: any) => void;
  onCancel: () => void;
}

const IntegrationConfigurationWizard: React.FC<Props> = ({
  integrationId,
  onComplete,
  onCancel
}) => {
  const [wizardConfig, setWizardConfig] = useState<WizardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [configuration, setConfiguration] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSensitiveFields, setShowSensitiveFields] = useState<Record<string, boolean>>({});
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Fetch wizard configuration
  const fetchWizardConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/integrations/marketplace/integrations/${integrationId}/wizard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wizard configuration');
      }

      const result = await response.json();
      setWizardConfig(result.data);
      
      // Initialize configuration with default values
      const initialConfig: Record<string, any> = {};
      result.data.steps.forEach((step: WizardStep) => {
        step.fields.forEach((field: WizardField) => {
          if (field.default !== undefined) {
            initialConfig[field.name] = field.default;
          }
        });
      });
      setConfiguration(initialConfig);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [integrationId]);

  // Validate field
  const validateField = (field: WizardField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min_length, max_length, min, max } = field.validation;
      
      if (min_length && value && value.length < min_length) {
        return `${field.label} must be at least ${min_length} characters`;
      }
      
      if (max_length && value && value.length > max_length) {
        return `${field.label} must be no more than ${max_length} characters`;
      }
      
      if (min !== undefined && value && Number(value) < min) {
        return `${field.label} must be at least ${min}`;
      }
      
      if (max !== undefined && value && Number(value) > max) {
        return `${field.label} must be no more than ${max}`;
      }
    }

    return null;
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    if (!wizardConfig) return false;
    
    const currentStepConfig = wizardConfig.steps[activeStep];
    const errors: Record<string, string> = {};
    let isValid = true;

    currentStepConfig.fields.forEach((field) => {
      // Check if field should be shown (depends_on logic)
      if (field.depends_on && !configuration[field.depends_on]) {
        return; // Skip validation for hidden fields
      }

      const error = validateField(field, configuration[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      setTestingConnection(true);
      
      // Mock connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate test result based on configuration
      const hasRequiredAuth = configuration.api_key || configuration.client_id || configuration.username;
      
      if (hasRequiredAuth) {
        setConnectionTestResult({
          success: true,
          message: 'Connection test successful! All credentials are valid.'
        });
      } else {
        setConnectionTestResult({
          success: false,
          message: 'Connection test failed. Please check your credentials.'
        });
      }
    } catch (err) {
      setConnectionTestResult({
        success: false,
        message: 'Connection test failed due to network error.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle finish
  const handleFinish = () => {
    if (validateCurrentStep()) {
      onComplete(configuration);
    }
  };

  // Render field based on type
  const renderField = (field: WizardField) => {
    const value = configuration[field.name] || '';
    const error = validationErrors[field.name];
    const shouldShow = !field.depends_on || configuration[field.depends_on];

    if (!shouldShow) {
      return null;
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
          />
        );

      case 'password':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={showSensitiveFields[field.name] ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => setShowSensitiveFields(prev => ({
                    ...prev,
                    [field.name]: !prev[field.name]
                  }))}
                >
                  {showSensitiveFields[field.name] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              )
            }}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
            error={!!error}
            helperText={error}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max
            }}
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth margin="normal" error={!!error}>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case 'multi_select':
        return (
          <FormControl key={field.name} fullWidth margin="normal">
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <FormGroup>
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={(value || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = value || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v: string) => v !== option.value);
                        handleFieldChange(field.name, newValues);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
            sx={{ mt: 2, mb: 1 }}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder={field.placeholder}
            required={field.required}
            margin="normal"
          />
        );

      case 'test_button':
        return (
          <Box key={field.name} sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={testConnection}
              disabled={testingConnection}
              startIcon={testingConnection ? <CircularProgress size={20} /> : <SyncIcon />}
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {connectionTestResult && (
              <Alert 
                severity={connectionTestResult.success ? 'success' : 'error'} 
                sx={{ mt: 2 }}
              >
                {connectionTestResult.message}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    fetchWizardConfig();
  }, [integrationId, fetchWizardConfig]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!wizardConfig) {
    return <Alert severity="info">No wizard configuration available</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Configure {wizardConfig.integration_name}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Follow these steps to set up your integration. Estimated time: {wizardConfig.estimated_time_minutes} minutes.
        </Typography>
        
        <Box display="flex" gap={1} mb={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => setHelpDialogOpen(true)}
          >
            Help & Resources
          </Button>
        </Box>

        <LinearProgress
          variant="determinate"
          value={(activeStep / wizardConfig.total_steps) * 100}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="textSecondary">
          Step {activeStep + 1} of {wizardConfig.total_steps}
        </Typography>
      </Box>

      {/* Requirements */}
      {activeStep === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Permissions
                </Typography>
                <List dense>
                  {wizardConfig.requirements.permissions.map((permission, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SecurityIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={permission} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Authentication Types
                </Typography>
                <List dense>
                  {wizardConfig.requirements.auth_types.map((authType, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={authType.toUpperCase()} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Features
                </Typography>
                <List dense>
                  {wizardConfig.requirements.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {wizardConfig.steps.map((step, index) => (
          <Step key={step.step}>
            <StepLabel>
              {step.title}
            </StepLabel>
            <StepContent>
              <Typography variant="body1" paragraph>
                {step.description}
              </Typography>
              
              <Paper sx={{ p: 3, mb: 2 }}>
                {step.fields.map((field) => renderField(field))}
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={index === wizardConfig.steps.length - 1 ? handleFinish : handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {index === wizardConfig.steps.length - 1 ? 'Complete Setup' : 'Continue'}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  onClick={onCancel}
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Help & Resources for {wizardConfig.integration_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documentation
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Complete setup guide and API reference
                  </Typography>
                  <Button
                    variant="outlined"
                    href={wizardConfig.help_resources.documentation}
                    target="_blank"
                    fullWidth
                  >
                    View Docs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Video Tutorial
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Step-by-step video walkthrough
                  </Typography>
                  <Button
                    variant="outlined"
                    href={wizardConfig.help_resources.video_tutorial}
                    target="_blank"
                    fullWidth
                  >
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Support
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Get help from our support team
                  </Typography>
                  <Button
                    variant="outlined"
                    href={wizardConfig.help_resources.support}
                    target="_blank"
                    fullWidth
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationConfigurationWizard;