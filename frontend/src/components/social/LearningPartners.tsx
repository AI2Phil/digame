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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Message as MessageIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Handshake as HandshakeIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface LearningPartner {
  id: number;
  name: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  timezone: string;
  learningGoals: string[];
  currentSkills: string[];
  targetSkills: string[];
  learningStyle: string[];
  availability: string[];
  preferredLanguages: string[];
  experience: string;
  partnershipType: 'study-buddy' | 'skill-exchange' | 'project-partner' | 'accountability-partner';
  compatibilityScore: number;
  mutualGoals: string[];
  isOnline: boolean;
  lastActive: string;
  studyStreak: number;
  completedProjects: number;
  rating: number;
  bio: string;
}

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  topic: string;
  members: number;
  maxMembers: number;
  schedule: string;
  duration: string;
  difficulty: string;
  tags: string[];
  createdBy: string;
  nextSession: string;
  isPublic: boolean;
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
      id={`partners-tabpanel-${index}`}
      aria-labelledby={`partners-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const LearningPartners: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [partners, setPartners] = useState<LearningPartner[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<LearningPartner | null>(null);
  const [partnerDetailsOpen, setPartnerDetailsOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  // Filter states
  const [skillFilter, setSkillFilter] = useState('');
  const [partnershipTypeFilter, setPartnershipTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [compatibilityRange, setCompatibilityRange] = useState<number[]>([70, 100]);
  const [onlineOnlyFilter, setOnlineOnlyFilter] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchLearningPartnersData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setPartners([
          {
            id: 1,
            name: 'Emma Wilson',
            avatar: '/api/placeholder/60/60',
            title: 'Frontend Developer',
            company: 'WebTech Solutions',
            location: 'Seattle, WA',
            timezone: 'PST',
            learningGoals: ['React Advanced Patterns', 'TypeScript', 'System Design'],
            currentSkills: ['JavaScript', 'React', 'CSS', 'HTML'],
            targetSkills: ['TypeScript', 'Node.js', 'GraphQL'],
            learningStyle: ['Visual', 'Hands-on', 'Collaborative'],
            availability: ['Evenings', 'Weekends'],
            preferredLanguages: ['English'],
            experience: '3 years',
            partnershipType: 'study-buddy',
            compatibilityScore: 92,
            mutualGoals: ['React Advanced Patterns', 'TypeScript'],
            isOnline: true,
            lastActive: '2 hours ago',
            studyStreak: 15,
            completedProjects: 8,
            rating: 4.8,
            bio: 'Passionate frontend developer looking to advance skills in modern React patterns and TypeScript. Love collaborative learning and building projects together.'
          },
          {
            id: 2,
            name: 'David Chen',
            avatar: '/api/placeholder/60/60',
            title: 'Data Scientist',
            company: 'Analytics Corp',
            location: 'San Francisco, CA',
            timezone: 'PST',
            learningGoals: ['Machine Learning', 'Python Advanced', 'Data Visualization'],
            currentSkills: ['Python', 'SQL', 'Statistics', 'Pandas'],
            targetSkills: ['TensorFlow', 'PyTorch', 'MLOps'],
            learningStyle: ['Analytical', 'Project-based', 'Peer-review'],
            availability: ['Mornings', 'Weekends'],
            preferredLanguages: ['English', 'Mandarin'],
            experience: '5 years',
            partnershipType: 'skill-exchange',
            compatibilityScore: 85,
            mutualGoals: ['Python Advanced'],
            isOnline: false,
            lastActive: '1 day ago',
            studyStreak: 22,
            completedProjects: 12,
            rating: 4.9,
            bio: 'Experienced data scientist eager to share knowledge and learn advanced ML techniques. Open to teaching Python fundamentals in exchange for ML expertise.'
          },
          {
            id: 3,
            name: 'Sarah Rodriguez',
            avatar: '/api/placeholder/60/60',
            title: 'Product Manager',
            company: 'StartupXYZ',
            location: 'Austin, TX',
            timezone: 'CST',
            learningGoals: ['Product Strategy', 'Data Analysis', 'User Research'],
            currentSkills: ['Project Management', 'Agile', 'Stakeholder Management'],
            targetSkills: ['SQL', 'Analytics', 'A/B Testing'],
            learningStyle: ['Case-study', 'Discussion', 'Practical'],
            availability: ['Lunch breaks', 'Early mornings'],
            preferredLanguages: ['English', 'Spanish'],
            experience: '4 years',
            partnershipType: 'accountability-partner',
            compatibilityScore: 78,
            mutualGoals: ['Data Analysis'],
            isOnline: true,
            lastActive: '30 minutes ago',
            studyStreak: 8,
            completedProjects: 5,
            rating: 4.6,
            bio: 'Product manager transitioning to more data-driven role. Looking for accountability partner to stay consistent with learning analytics and SQL.'
          }
        ]);

        setStudyGroups([
          {
            id: 1,
            name: 'React Advanced Patterns Study Group',
            description: 'Weekly sessions covering advanced React patterns, hooks, and performance optimization',
            topic: 'React',
            members: 8,
            maxMembers: 12,
            schedule: 'Saturdays 10 AM PST',
            duration: '2 hours',
            difficulty: 'Intermediate',
            tags: ['React', 'JavaScript', 'Frontend', 'Patterns'],
            createdBy: 'Alex Johnson',
            nextSession: '2024-01-13 10:00',
            isPublic: true
          },
          {
            id: 2,
            name: 'Machine Learning Book Club',
            description: 'Reading and discussing "Hands-On Machine Learning" with practical exercises',
            topic: 'Machine Learning',
            members: 15,
            maxMembers: 20,
            schedule: 'Sundays 2 PM EST',
            duration: '1.5 hours',
            difficulty: 'Beginner to Intermediate',
            tags: ['Machine Learning', 'Python', 'Data Science', 'Book Club'],
            createdBy: 'Maria Garcia',
            nextSession: '2024-01-14 14:00',
            isPublic: true
          },
          {
            id: 3,
            name: 'System Design Interview Prep',
            description: 'Practice system design interviews with peer feedback and mock sessions',
            topic: 'System Design',
            members: 6,
            maxMembers: 8,
            schedule: 'Weekdays 7 PM EST',
            duration: '1 hour',
            difficulty: 'Advanced',
            tags: ['System Design', 'Interviews', 'Architecture', 'Practice'],
            createdBy: 'Kevin Liu',
            nextSession: '2024-01-12 19:00',
            isPublic: false
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchLearningPartnersData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePartnerClick = (partner: LearningPartner) => {
    setSelectedPartner(partner);
    setPartnerDetailsOpen(true);
  };

  const handleConnectPartner = (partnerId: number) => {
    console.log('Connect with partner:', partnerId);
    // Implement connection logic
  };

  const handleJoinGroup = (groupId: number) => {
    console.log('Join study group:', groupId);
    // Implement join group logic
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.learningGoals.some(goal => goal.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         partner.currentSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSkill = !skillFilter || 
                        partner.learningGoals.some(goal => goal.toLowerCase().includes(skillFilter.toLowerCase())) ||
                        partner.currentSkills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    const matchesType = partnershipTypeFilter === 'all' || partner.partnershipType === partnershipTypeFilter;
    
    const matchesCompatibility = partner.compatibilityScore >= compatibilityRange[0] && 
                                partner.compatibilityScore <= compatibilityRange[1];
    
    const matchesOnline = !onlineOnlyFilter || partner.isOnline;
    
    return matchesSearch && matchesSkill && matchesType && matchesCompatibility && matchesOnline;
  });

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case 'study-buddy': return 'primary';
      case 'skill-exchange': return 'success';
      case 'project-partner': return 'warning';
      case 'accountability-partner': return 'info';
      default: return 'default';
    }
  };

  const getPartnershipTypeIcon = (type: string) => {
    switch (type) {
      case 'study-buddy': return <SchoolIcon fontSize="small" />;
      case 'skill-exchange': return <HandshakeIcon fontSize="small" />;
      case 'project-partner': return <GroupIcon fontSize="small" />;
      case 'accountability-partner': return <EmojiEventsIcon fontSize="small" />;
      default: return <GroupIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Learning Partners</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Finding your perfect learning partners...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Learning Partners</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateGroupOpen(true)}
        >
          Create Study Group
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{partners.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Available Partners
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{studyGroups.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Study Groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HandshakeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">24</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Partnerships
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">87%</Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name, skills, or learning goals..."
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
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDialogOpen(true)}
              >
                Advanced Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Find Partners" />
          <Tab label="Study Groups" />
          <Tab label="My Partnerships" />
          <Tab label="Recommendations" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {filteredPartners.map((partner) => (
            <Grid item xs={12} md={6} lg={4} key={partner.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => handlePartnerClick(partner)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      color={partner.isOnline ? 'success' : 'default'}
                      variant="dot"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar src={partner.avatar} sx={{ width: 50, height: 50 }} />
                    </Badge>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="h6">{partner.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {partner.title}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {partner.compatibilityScore}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Match
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getPartnershipTypeIcon(partner.partnershipType)}
                      label={partner.partnershipType.replace('-', ' ')}
                      color={getPartnershipTypeColor(partner.partnershipType) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {partner.location}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Mutual Learning Goals</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {partner.mutualGoals.slice(0, 2).map((goal, index) => (
                        <Chip key={index} label={goal} size="small" variant="outlined" />
                      ))}
                      {partner.mutualGoals.length > 2 && (
                        <Chip label={`+${partner.mutualGoals.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {partner.studyStreak} day streak
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon fontSize="small" color="warning" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {partner.rating}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectPartner(partner.id);
                      }}
                    >
                      Connect
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<MessageIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle message
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
        <Grid container spacing={3}>
          {studyGroups.map((group) => (
            <Grid item xs={12} md={6} key={group.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{group.name}</Typography>
                    <Chip 
                      label={group.isPublic ? 'Public' : 'Private'} 
                      size="small" 
                      color={group.isPublic ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {group.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <GroupIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {group.members}/{group.maxMembers} members
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {group.schedule}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Next: {new Date(group.nextSession).toLocaleDateString()}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.members >= group.maxMembers}
                    >
                      {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>My Active Partnerships</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your current learning partnerships and track progress.
        </Typography>
        {/* My partnerships content */}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" gutterBottom>Recommended Partners</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          AI-powered recommendations based on your learning goals and preferences.
        </Typography>
        {/* Recommendations content */}
      </TabPanel>

      {/* Partner Details Dialog */}
      <Dialog 
        open={partnerDetailsOpen} 
        onClose={() => setPartnerDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPartner && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedPartner.avatar} 
                  sx={{ width: 60, height: 60, mr: 2 }} 
                />
                <Box>
                  <Typography variant="h6">{selectedPartner.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPartner.title} at {selectedPartner.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPartner.location} • {selectedPartner.timezone}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedPartner.bio}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Learning Goals</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedPartner.learningGoals.map((goal, index) => (
                      <Chip key={index} label={goal} size="small" color="primary" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Current Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedPartner.currentSkills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Availability</Typography>
                  <Typography variant="body2">
                    {selectedPartner.availability.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Learning Style</Typography>
                  <Typography variant="body2">
                    {selectedPartner.learningStyle.join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPartnerDetailsOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<MessageIcon />}
                onClick={() => handleConnectPartner(selectedPartner.id)}
              >
                Connect
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Advanced Filters Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Skill Filter"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Partnership Type</InputLabel>
              <Select
                value={partnershipTypeFilter}
                onChange={(e) => setPartnershipTypeFilter(e.target.value)}
                label="Partnership Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="study-buddy">Study Buddy</MenuItem>
                <MenuItem value="skill-exchange">Skill Exchange</MenuItem>
                <MenuItem value="project-partner">Project Partner</MenuItem>
                <MenuItem value="accountability-partner">Accountability Partner</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Compatibility Score Range</Typography>
              <Slider
                value={compatibilityRange}
                onChange={(e, newValue) => setCompatibilityRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={onlineOnlyFilter}
                  onChange={(e) => setOnlineOnlyFilter(e.target.checked)}
                />
              }
              label="Show only online partners"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Study Group Dialog */}
      <Dialog 
        open={createGroupOpen} 
        onClose={() => setCreateGroupOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Study Group</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Group Name"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              margin="normal"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Topic"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Members"
                  type="number"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Group</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningPartners;