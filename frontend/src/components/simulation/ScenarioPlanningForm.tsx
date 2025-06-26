import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean';
  min_value?: number;
  max_value?: number;
  current_value: number | string | boolean;
  description: string;
  unit?: string;
  categories?: string[];
}

interface ScenarioData {
  name: string;
  description: string;
  variables: Variable[];
  base_scenario: Record<string, any>;
  num_alternative_scenarios: number;
  variable_weights: Record<string, number>;
  tags: string[];
}

const steps = [
  'Basic Information',
  'Define Variables',
  'Base Scenario',
  'Configuration',
  'Review & Create'
];

export const ScenarioPlanningForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [scenarioData, setScenarioData] = useState<ScenarioData>({
    name: '',
    description: '',
    variables: [],
    base_scenario: {},
    num_alternative_scenarios: 3,
    variable_weights: {},
    tags: []
  });
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: '',
    type: 'numeric',
    description: '',
    current_value: 0
  });
  const [newTag, setNewTag] = useState('');
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddVariable = () => {
    if (!newVariable.name || !newVariable.description) return;

    const variable: Variable = {
      name: newVariable.name,
      type: newVariable.type || 'numeric',
      description: newVariable.description,
      current_value: newVariable.current_value || 0,
      min_value: newVariable.min_value,
      max_value: newVariable.max_value,
      unit: newVariable.unit,
      categories: newVariable.categories
    };

    setScenarioData(prev => ({
      ...prev,
      variables: [...prev.variables, variable],
      base_scenario: {
        ...prev.base_scenario,
        [variable.name]: variable.current_value
      },
      variable_weights: {
        ...prev.variable_weights,
        [variable.name]: 1.0
      }
    }));

    setNewVariable({
      name: '',
      type: 'numeric',
      description: '',
      current_value: 0
    });
    setVariableDialogOpen(false);
  };

  const handleRemoveVariable = (index: number) => {
    const variable = scenarioData.variables[index];
    setScenarioData(prev => {
      const newVariables = prev.variables.filter((_, i) => i !== index);
      const newBaseScenario = { ...prev.base_scenario };
      const newWeights = { ...prev.variable_weights };
      
      delete newBaseScenario[variable.name];
      delete newWeights[variable.name];
      
      return {
        ...prev,
        variables: newVariables,
        base_scenario: newBaseScenario,
        variable_weights: newWeights
      };
    });
  };

  const handleVariableValueChange = (variableName: string, value: any) => {
    setScenarioData(prev => ({
      ...prev,
      base_scenario: {
        ...prev.base_scenario,
        [variableName]: value
      }
    }));
  };

  const handleVariableWeightChange = (variableName: string, weight: number) => {
    setScenarioData(prev => ({
      ...prev,
      variable_weights: {
        ...prev.variable_weights,
        [variableName]: weight
      }
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setScenarioData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setScenarioData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Here you would make the API call to create the scenario planning simulation
      const response = await fetch('/api/simulation/scenario-planning?tenant_id=1&created_by=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenarioData),
      });

      if (!response.ok) {
        throw new Error('Failed to create scenario planning simulation');
      }

      const result = await response.json();
      
      // Redirect to simulation details or dashboard
      window.location.href = `/simulations/${result.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderVariableInput = (variable: Variable) => {
    const value = scenarioData.base_scenario[variable.name];

    switch (variable.type) {
      case 'numeric':
        return (
          <TextField
            type="number"
            value={value || 0}
            onChange={(e) => handleVariableValueChange(variable.name, parseFloat(e.target.value) || 0)}
            inputProps={{
              min: variable.min_value,
              max: variable.max_value,
              step: 0.01
            }}
            helperText={variable.unit ? `Unit: ${variable.unit}` : ''}
            fullWidth
          />
        );
      case 'categorical':
        return (
          <FormControl fullWidth>
            <Select
              value={value || ''}
              onChange={(e) => handleVariableValueChange(variable.name, e.target.value)}
            >
              {variable.categories?.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleVariableValueChange(variable.name, e.target.checked)}
              />
            }
            label={value ? 'Yes' : 'No'}
          />
        );
      default:
        return null;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Simulation Name"
              value={scenarioData.name}
              onChange={(e) => setScenarioData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={scenarioData.description}
              onChange={(e) => setScenarioData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              helperText="Describe the purpose and scope of this scenario planning simulation"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Variables</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setVariableDialogOpen(true)}
              >
                Add Variable
              </Button>
            </Box>

            {scenarioData.variables.length === 0 ? (
              <Alert severity="info">
                No variables defined yet. Add variables that will be analyzed in your scenarios.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {scenarioData.variables.map((variable, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {variable.name}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                              {variable.description}
                            </Typography>
                            <Chip
                              label={variable.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {variable.unit && (
                              <Chip
                                label={variable.unit}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveVariable(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Base Scenario Values
            </Typography>
            <Typography color="textSecondary" paragraph>
              Set the baseline values for each variable. These will be used as the reference point for generating alternative scenarios.
            </Typography>

            {scenarioData.variables.length === 0 ? (
              <Alert severity="warning">
                Please define variables first before setting base scenario values.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {scenarioData.variables.map((variable, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {variable.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {variable.description}
                        </Typography>
                        {renderVariableInput(variable)}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Scenario Generation
                    </Typography>
                    <Typography gutterBottom>
                      Number of Alternative Scenarios
                    </Typography>
                    <Slider
                      value={scenarioData.num_alternative_scenarios}
                      onChange={(_, value) => setScenarioData(prev => ({ 
                        ...prev, 
                        num_alternative_scenarios: value as number 
                      }))}
                      min={1}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {scenarioData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {scenarioData.variables.length > 0 && (
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Variable Weights (Advanced)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="textSecondary" paragraph>
                        Adjust the importance of each variable in scenario generation. Higher weights mean the variable will have more influence on the outcomes.
                      </Typography>
                      <Grid container spacing={2}>
                        {scenarioData.variables.map((variable) => (
                          <Grid item xs={12} md={6} key={variable.name}>
                            <Box>
                              <Typography gutterBottom>
                                {variable.name}
                              </Typography>
                              <Slider
                                value={scenarioData.variable_weights[variable.name] || 1.0}
                                onChange={(_, value) => handleVariableWeightChange(variable.name, value as number)}
                                min={0.1}
                                max={3.0}
                                step={0.1}
                                valueLabelDisplay="on"
                                marks={[
                                  { value: 0.5, label: 'Low' },
                                  { value: 1.0, label: 'Normal' },
                                  { value: 2.0, label: 'High' }
                                ]}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Scenario Planning Simulation
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography><strong>Name:</strong> {scenarioData.name}</Typography>
                    <Typography><strong>Description:</strong> {scenarioData.description}</Typography>
                    <Typography><strong>Variables:</strong> {scenarioData.variables.length}</Typography>
                    <Typography><strong>Alternative Scenarios:</strong> {scenarioData.num_alternative_scenarios}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Variables Summary
                    </Typography>
                    {scenarioData.variables.map((variable, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{variable.name}:</strong> {scenarioData.base_scenario[variable.name]} 
                          {variable.unit && ` ${variable.unit}`}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {scenarioData.tags.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {scenarioData.tags.map((tag, index) => (
                          <Chip key={index} label={tag} color="primary" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">
          Create Scenario Planning Simulation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(index)}
              <Box sx={{ mb: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                  sx={{ mr: 1 }}
                  disabled={loading || (index === 0 && !scenarioData.name)}
                  startIcon={index === steps.length - 1 ? <SaveIcon /> : undefined}
                >
                  {loading ? 'Creating...' : (index === steps.length - 1 ? 'Create Simulation' : 'Continue')}
                </Button>
                <Button
                  disabled={index === 0 || loading}
                  onClick={handleBack}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Variable Dialog */}
      <Dialog open={variableDialogOpen} onClose={() => setVariableDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Variable</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Variable Name"
                value={newVariable.name || ''}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newVariable.type || 'numeric'}
                  label="Type"
                  onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="numeric">Numeric</MenuItem>
                  <MenuItem value="categorical">Categorical</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newVariable.description || ''}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
                required
              />
            </Grid>
            {newVariable.type === 'numeric' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Current Value"
                    type="number"
                    value={newVariable.current_value || 0}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Min Value (Optional)"
                    type="number"
                    value={newVariable.min_value || ''}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, min_value: parseFloat(e.target.value) || undefined }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Max Value (Optional)"
                    type="number"
                    value={newVariable.max_value || ''}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, max_value: parseFloat(e.target.value) || undefined }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Unit (Optional)"
                    value={newVariable.unit || ''}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., USD, %, hours, etc."
                  />
                </Grid>
              </>
            )}
            {newVariable.type === 'categorical' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Categories (comma-separated)"
                  value={newVariable.categories?.join(', ') || ''}
                  onChange={(e) => setNewVariable(prev => ({ 
                    ...prev, 
                    categories: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariableDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddVariable}
            variant="contained"
            disabled={!newVariable.name || !newVariable.description}
          >
            Add Variable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScenarioPlanningForm;