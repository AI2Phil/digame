/**
 * Integration Marketplace - Phase 2B Implementation
 * Priority 2: Integration Ecosystem Completion (85% → 95%)
 * 
 * Comprehensive marketplace for discovering, installing, and managing integrations
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Verified as VerifiedIcon,
  GetApp as InstallIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Types
interface Integration {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  complexity: string;
  status: string;
  icon_url: string;
  banner_url?: string;
  tags: string[];
  features: string[];
  use_cases: string[];
  setup_time_minutes: number;
  popularity_score: number;
  rating: number;
  review_count: number;
  installation_count: number;
  last_updated: string;
  version: string;
  pricing_model: string;
  free_tier_available: boolean;
  enterprise_features: string[];
}

interface MarketplaceData {
  integrations: Integration[];
  total_count: number;
  filtered_count: number;
  has_more: boolean;
  featured_integrations: Integration[];
  trending_integrations: Integration[];
  marketplace_stats: {
    total_integrations: number;
    categories: number;
    total_installations: number;
    avg_rating: number;
    enterprise_integrations: number;
  };
  categories: string[];
  complexity_levels: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  integration_count: number;
}

const IntegrationMarketplace: React.FC = () => {
  const router = useRouter();
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);

  // Fetch marketplace data
  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedComplexity && { complexity: selectedComplexity }),
        ...(searchQuery && { search: searchQuery }),
        sort_by: sortBy,
        limit: '50',
        offset: '0'
      });

      const response = await fetch(`/api/v1/integrations/marketplace/catalog?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch marketplace data');
      }

      const result = await response.json();
      setMarketplaceData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/integrations/marketplace/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      setCategories(result.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Get integration details
  const getIntegrationDetails = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/v1/integrations/marketplace/integrations/${integrationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch integration details');
      }

      const result = await response.json();
      setSelectedIntegration(result.data.integration);
      setDetailsDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get details');
    }
  };

  // Install integration
  const installIntegration = async (integrationId: string, configuration: any) => {
    try {
      const response = await fetch(`/api/v1/integrations/marketplace/integrations/${integrationId}/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configuration)
      });

      if (!response.ok) {
        throw new Error('Failed to install integration');
      }

      const result = await response.json();
      
      if (result.success) {
        setInstallDialogOpen(false);
        // Navigate to configuration wizard
        router.push(`/integrations/configure/${integrationId}`);
      } else {
        throw new Error(result.data.error || 'Installation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
    fetchCategories();
  }, [selectedCategory, selectedComplexity, searchQuery, sortBy]);

  // Helper functions
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'moderate': return 'warning';
      case 'advanced': return 'error';
      case 'enterprise': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'beta': return 'warning';
      case 'deprecated': return 'error';
      case 'coming_soon': return 'info';
      default: return 'default';
    }
  };

  const formatInstallCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

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
        <Button color="inherit" size="small" onClick={fetchMarketplaceData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!marketplaceData) {
    return <Alert severity="info">No marketplace data available</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Integration Marketplace
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMarketplaceData}
        >
          Refresh
        </Button>
      </Box>

      {/* Marketplace Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {marketplaceData.marketplace_stats.total_integrations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Integrations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {marketplaceData.marketplace_stats.categories}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {formatInstallCount(marketplaceData.marketplace_stats.total_installations)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Installs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {marketplaceData.marketplace_stats.avg_rating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {marketplaceData.marketplace_stats.enterprise_integrations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Enterprise
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {marketplaceData.categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Complexity</InputLabel>
              <Select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                label="Complexity"
              >
                <MenuItem value="">All Levels</MenuItem>
                {marketplaceData.complexity_levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="popularity">Popularity</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="installations">Installations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSelectedCategory('');
                setSelectedComplexity('');
                setSearchQuery('');
                setSortBy('popularity');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="All Integrations" />
          <Tab label="Featured" />
          <Tab label="Trending" />
          <Tab label="Categories" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {marketplaceData.integrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={integration.banner_url || '/default-banner.jpg'}
                  alt={integration.display_name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={integration.icon_url}
                      alt={integration.display_name}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="h6" component="h3" noWrap>
                      {integration.display_name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {integration.description.length > 100 
                      ? `${integration.description.substring(0, 100)}...`
                      : integration.description
                    }
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Rating value={integration.rating} readOnly size="small" />
                    <Typography variant="body2" color="textSecondary" ml={1}>
                      ({integration.review_count})
                    </Typography>
                  </Box>
                  
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      size="small"
                      label={integration.complexity}
                      color={getComplexityColor(integration.complexity) as any}
                    />
                    <Chip
                      size="small"
                      label={integration.status}
                      color={getStatusColor(integration.status) as any}
                    />
                    {integration.free_tier_available && (
                      <Chip size="small" label="Free Tier" color="success" />
                    )}
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {formatInstallCount(integration.installation_count)} installs
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {integration.setup_time_minutes}min setup
                    </Typography>
                  </Box>
                  
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      onClick={() => getIntegrationDetails(integration.id)}
                      sx={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<InstallIcon />}
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setInstallDialogOpen(true);
                      }}
                      sx={{ flex: 1 }}
                    >
                      Install
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {marketplaceData.featured_integrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={integration.id}>
              <Card sx={{ position: 'relative' }}>
                <Badge
                  badgeContent="Featured"
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: 16,
                      top: 16,
                      position: 'absolute'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={integration.banner_url || '/default-banner.jpg'}
                    alt={integration.display_name}
                  />
                </Badge>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {integration.display_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {integration.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Rating value={integration.rating} readOnly size="small" />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<InstallIcon />}
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setInstallDialogOpen(true);
                      }}
                    >
                      Install
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {marketplaceData.trending_integrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={integration.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {integration.display_name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {integration.description}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={integration.popularity_score}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Popularity: {integration.popularity_score.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedTab(0);
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" component="div" mb={1}>
                    {category.icon}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {category.description}
                  </Typography>
                  <Chip
                    label={`${category.integration_count} integrations`}
                    color="primary"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Integration Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedIntegration?.display_name}
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedIntegration.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {selectedIntegration.features.map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Use Cases
              </Typography>
              <ul>
                {selectedIntegration.use_cases.map((useCase, index) => (
                  <li key={index}>
                    <Typography variant="body2">{useCase}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<InstallIcon />}
            onClick={() => {
              setDetailsDialogOpen(false);
              setInstallDialogOpen(true);
            }}
          >
            Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* Installation Dialog */}
      <Dialog
        open={installDialogOpen}
        onClose={() => setInstallDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Install {selectedIntegration?.display_name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            This will install {selectedIntegration?.display_name} for your organization.
            Setup time: approximately {selectedIntegration?.setup_time_minutes} minutes.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            You'll be guided through the configuration process after installation.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstallDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedIntegration) {
                installIntegration(selectedIntegration.id, {
                  connection_name: `My ${selectedIntegration.display_name}`,
                  auto_configure: true
                });
              }
            }}
          >
            Install Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationMarketplace;