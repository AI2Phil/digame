import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Divider,
  Paper,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';

interface Connection {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  connectionType: 'professional' | 'mentor' | 'mentee' | 'colleague';
  mutualConnections: number;
  skills: string[];
  industry: string;
  connectedAt: string;
  lastInteraction: string;
  connectionStrength: number;
  isOnline: boolean;
}

interface NetworkStats {
  totalConnections: number;
  newThisMonth: number;
  mutualConnections: number;
  industryDiversity: number;
  networkGrowthRate: number;
  engagementScore: number;
}

interface TabPanelProps {
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
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfessionalNetwork: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setNetworkStats({
          totalConnections: 247,
          newThisMonth: 12,
          mutualConnections: 89,
          industryDiversity: 15,
          networkGrowthRate: 8.5,
          engagementScore: 78
        });

        setConnections([
          {
            id: 1,
            name: 'Sarah Chen',
            title: 'Senior Product Manager',
            company: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            avatar: '/api/placeholder/40/40',
            connectionType: 'professional',
            mutualConnections: 23,
            skills: ['Product Management', 'UX Design', 'Data Analysis'],
            industry: 'Technology',
            connectedAt: '2024-01-15',
            lastInteraction: '2024-01-20',
            connectionStrength: 85,
            isOnline: true
          },
          {
            id: 2,
            name: 'Michael Rodriguez',
            title: 'Engineering Manager',
            company: 'StartupXYZ',
            location: 'Austin, TX',
            avatar: '/api/placeholder/40/40',
            connectionType: 'mentor',
            mutualConnections: 15,
            skills: ['Leadership', 'Software Engineering', 'Team Management'],
            industry: 'Technology',
            connectedAt: '2023-11-08',
            lastInteraction: '2024-01-18',
            connectionStrength: 92,
            isOnline: false
          },
          {
            id: 3,
            name: 'Emily Johnson',
            title: 'Marketing Director',
            company: 'Global Marketing Solutions',
            location: 'New York, NY',
            avatar: '/api/placeholder/40/40',
            connectionType: 'colleague',
            mutualConnections: 8,
            skills: ['Digital Marketing', 'Brand Strategy', 'Analytics'],
            industry: 'Marketing',
            connectedAt: '2024-01-10',
            lastInteraction: '2024-01-19',
            connectionStrength: 67,
            isOnline: true
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchNetworkData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConnectionClick = (connection: Connection) => {
    setSelectedConnection(connection);
    setProfileDialogOpen(true);
  };

  const handleSendMessage = (connectionId: number) => {
    console.log('Send message to connection:', connectionId);
    // Implement message functionality
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connection.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connection.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || connection.connectionType === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedConnections = [...filteredConnections].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'strength':
        return b.connectionStrength - a.connectionStrength;
      case 'recent':
      default:
        return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
    }
  });

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'mentor': return 'primary';
      case 'mentee': return 'secondary';
      case 'colleague': return 'success';
      default: return 'default';
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'mentor': return <StarIcon fontSize="small" />;
      case 'mentee': return <SchoolIcon fontSize="small" />;
      case 'colleague': return <WorkIcon fontSize="small" />;
      default: return <PersonAddIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Professional Network</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Loading your professional network...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Professional Network
      </Typography>

      {/* Network Statistics */}
      {networkStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{networkStats.totalConnections}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{networkStats.newThisMonth}</Typography>
                <Typography variant="body2" color="text.secondary">
                  New This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">{networkStats.industryDiversity}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Industries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{networkStats.networkGrowthRate}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Growth Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{networkStats.engagementScore}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Engagement Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{networkStats.mutualConnections}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mutual Connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<FilterListIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              >
                Filter: {selectedFilter === 'all' ? 'All' : selectedFilter}
              </Button>
              <Button
                startIcon={<SortIcon />}
                onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              >
                Sort: {sortBy}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Connections" />
          <Tab label="Recent Activity" />
          <Tab label="Mutual Connections" />
          <Tab label="Network Insights" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={2}>
          {sortedConnections.map((connection) => (
            <Grid item xs={12} sm={6} md={4} key={connection.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => handleConnectionClick(connection)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      color={connection.isOnline ? 'success' : 'default'}
                      variant="dot"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar src={connection.avatar} sx={{ width: 50, height: 50 }} />
                    </Badge>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="h6">{connection.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {connection.title}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {connection.company}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {connection.location}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getConnectionTypeIcon(connection.connectionType)}
                      label={connection.connectionType}
                      color={getConnectionTypeColor(connection.connectionType) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {connection.mutualConnections} mutual
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Connection Strength
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={connection.connectionStrength} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<MessageIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendMessage(connection.id);
                      }}
                    >
                      Message
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>Recent Network Activity</Typography>
        <List>
          {sortedConnections.slice(0, 5).map((connection) => (
            <ListItem key={connection.id}>
              <ListItemAvatar>
                <Avatar src={connection.avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={`${connection.name} updated their profile`}
                secondary={`${connection.company} • ${connection.lastInteraction}`}
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>Mutual Connections</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Connections you share with other professionals in your network.
        </Typography>
        {/* Mutual connections content */}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" gutterBottom>Network Insights</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Industry Distribution</Typography>
                {/* Add chart component here */}
                <Typography variant="body2" color="text.secondary">
                  Technology: 45% • Marketing: 20% • Finance: 15% • Other: 20%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Connection Growth</Typography>
                {/* Add chart component here */}
                <Typography variant="body2" color="text.secondary">
                  Your network has grown by 8.5% this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Connection Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedConnection && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedConnection.avatar} 
                  sx={{ width: 60, height: 60, mr: 2 }} 
                />
                <Box>
                  <Typography variant="h6">{selectedConnection.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedConnection.title} at {selectedConnection.company}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedConnection.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Connection Details</Typography>
                  <Typography variant="body2">
                    Connected: {selectedConnection.connectedAt}
                  </Typography>
                  <Typography variant="body2">
                    Last interaction: {selectedConnection.lastInteraction}
                  </Typography>
                  <Typography variant="body2">
                    Mutual connections: {selectedConnection.mutualConnections}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<MessageIcon />}
                onClick={() => handleSendMessage(selectedConnection.id)}
              >
                Send Message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSelectedFilter('all'); setFilterMenuAnchor(null); }}>
          All Connections
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter('professional'); setFilterMenuAnchor(null); }}>
          Professional
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter('mentor'); setFilterMenuAnchor(null); }}>
          Mentors
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter('mentee'); setFilterMenuAnchor(null); }}>
          Mentees
        </MenuItem>
        <MenuItem onClick={() => { setSelectedFilter('colleague'); setFilterMenuAnchor(null); }}>
          Colleagues
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('recent'); setSortMenuAnchor(null); }}>
          Recent Activity
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('name'); setSortMenuAnchor(null); }}>
          Name
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('company'); setSortMenuAnchor(null); }}>
          Company
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('strength'); setSortMenuAnchor(null); }}>
          Connection Strength
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfessionalNetwork;