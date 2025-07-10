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
  LinearProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

interface MentorshipProgram {
  id: number;
  title: string;
  description: string;
  duration: string;
  skillsRequired: string[];
  skillsOffered: string[];
  mentorId?: number;
  menteeId?: number;
  status: 'active' | 'pending' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  meetingFrequency: string;
  goals: string[];
  achievements: string[];
}

interface MentorProfile {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string;
  expertise: string[];
  experience: number;
  rating: number;
  totalMentees: number;
  successRate: number;
  availability: string;
  bio: string;
  mentorshipStyle: string[];
}

interface MenteeProfile {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string;
  learningGoals: string[];
  currentLevel: string;
  preferredMentorType: string;
  availability: string;
  bio: string;
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
      id={`mentorship-tabpanel-${index}`}
      aria-labelledby={`mentorship-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const MentorshipHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [mentees, setMentees] = useState<MenteeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createProgramOpen, setCreateProgramOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);
  const [programDetailsOpen, setProgramDetailsOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchMentorshipData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setPrograms([
          {
            id: 1,
            title: 'Product Management Mentorship',
            description: 'Learn advanced product management strategies and leadership skills',
            duration: '6 months',
            skillsRequired: ['Basic PM knowledge', 'Communication'],
            skillsOffered: ['Strategic Planning', 'Team Leadership', 'Data Analysis'],
            mentorId: 1,
            menteeId: 1,
            status: 'active',
            progress: 65,
            startDate: '2024-01-01',
            meetingFrequency: 'Weekly',
            goals: ['Master product roadmapping', 'Improve stakeholder communication', 'Learn data-driven decision making'],
            achievements: ['Completed PM fundamentals course', 'Led first product launch']
          },
          {
            id: 2,
            title: 'Software Engineering Career Growth',
            description: 'Advance from mid-level to senior software engineer',
            duration: '4 months',
            skillsRequired: ['3+ years experience', 'Full-stack development'],
            skillsOffered: ['System Design', 'Code Review', 'Technical Leadership'],
            mentorId: 2,
            status: 'pending',
            progress: 0,
            startDate: '2024-02-01',
            meetingFrequency: 'Bi-weekly',
            goals: ['Learn system design patterns', 'Improve code quality', 'Develop leadership skills'],
            achievements: []
          }
        ]);

        setMentors([
          {
            id: 1,
            name: 'Sarah Chen',
            title: 'Senior Product Manager',
            company: 'TechCorp Inc.',
            avatar: '/api/placeholder/60/60',
            expertise: ['Product Strategy', 'User Research', 'Data Analysis', 'Team Leadership'],
            experience: 8,
            rating: 4.9,
            totalMentees: 15,
            successRate: 92,
            availability: 'Weekends',
            bio: 'Passionate about helping aspiring product managers grow their careers through hands-on mentorship.',
            mentorshipStyle: ['Hands-on', 'Goal-oriented', 'Supportive']
          },
          {
            id: 2,
            name: 'Michael Rodriguez',
            title: 'Engineering Manager',
            company: 'StartupXYZ',
            avatar: '/api/placeholder/60/60',
            expertise: ['Software Architecture', 'Team Management', 'Code Review', 'Career Development'],
            experience: 12,
            rating: 4.8,
            totalMentees: 23,
            successRate: 89,
            availability: 'Evenings',
            bio: 'Experienced engineering leader focused on helping developers advance their technical and leadership skills.',
            mentorshipStyle: ['Technical', 'Structured', 'Challenging']
          }
        ]);

        setMentees([
          {
            id: 1,
            name: 'Alex Johnson',
            title: 'Junior Product Manager',
            company: 'Growth Startup',
            avatar: '/api/placeholder/60/60',
            learningGoals: ['Product Strategy', 'Stakeholder Management', 'Data Analysis'],
            currentLevel: 'Junior',
            preferredMentorType: 'Senior PM with startup experience',
            availability: 'Flexible',
            bio: 'Eager to learn and grow in product management with focus on user-centric design.'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchMentorshipData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProgramClick = (program: MentorshipProgram) => {
    setSelectedProgram(program);
    setProgramDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'primary';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'completed': return <EmojiEventsIcon />;
      case 'paused': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Mentorship Hub</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Loading mentorship programs...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mentorship Hub</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateProgramOpen(true)}
        >
          Create Program
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{programs.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Programs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{mentors.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Available Mentors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PsychologyIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{mentees.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Seeking Mentors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">89%</Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="My Programs" />
          <Tab label="Find Mentors" />
          <Tab label="Find Mentees" />
          <Tab label="Program Templates" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} md={6} key={program.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => handleProgramClick(program)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{program.title}</Typography>
                    <Chip
                      icon={getStatusIcon(program.status)}
                      label={program.status}
                      color={getStatusColor(program.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {program.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progress: {program.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={program.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {program.duration}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Frequency: {program.meetingFrequency}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {program.skillsOffered.slice(0, 3).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                    {program.skillsOffered.length > 3 && (
                      <Chip label={`+${program.skillsOffered.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<VideoCallIcon />}>
                      Schedule Meeting
                    </Button>
                    <Button size="small" startIcon={<MessageIcon />}>
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
          {mentors.map((mentor) => (
            <Grid item xs={12} md={6} lg={4} key={mentor.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={mentor.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{mentor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mentor.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mentor.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={mentor.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {mentor.rating} ({mentor.totalMentees} mentees)
                    </Typography>
                  </Box>

                  <Typography variant="body2" paragraph>
                    {mentor.bio}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Expertise</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {mentor.experience} years
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate: {mentor.successRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available: {mentor.availability}
                    </Typography>
                  </Box>

                  <Button variant="contained" fullWidth>
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {mentees.map((mentee) => (
            <Grid item xs={12} md={6} lg={4} key={mentee.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={mentee.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{mentee.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mentee.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mentee.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" paragraph>
                    {mentee.bio}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Learning Goals</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mentee.learningGoals.map((goal, index) => (
                        <Chip key={index} label={goal} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Level: {mentee.currentLevel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Preferred Mentor: {mentee.preferredMentorType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available: {mentee.availability}
                    </Typography>
                  </Box>

                  <Button variant="contained" fullWidth>
                    Offer Mentorship
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" gutterBottom>Program Templates</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose from pre-designed mentorship program templates to get started quickly.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Career Development Program</Typography>
                <Typography variant="body2" paragraph>
                  A comprehensive 6-month program focused on career advancement and leadership skills.
                </Typography>
                <Button variant="outlined">Use Template</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Technical Skills Mentorship</Typography>
                <Typography variant="body2" paragraph>
                  A 3-month intensive program for developing specific technical competencies.
                </Typography>
                <Button variant="outlined">Use Template</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Program Details Dialog */}
      <Dialog 
        open={programDetailsOpen} 
        onClose={() => setProgramDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProgram && (
          <>
            <DialogTitle>{selectedProgram.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Goals</Typography>
                  <List dense>
                    {selectedProgram.goals.map((goal, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={goal} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Achievements</Typography>
                  <List dense>
                    {selectedProgram.achievements.map((achievement, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={achievement} />
                        <CheckCircleIcon color="success" />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProgramDetailsOpen(false)}>Close</Button>
              <Button variant="contained">Edit Program</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog 
        open={createProgramOpen} 
        onClose={() => setCreateProgramOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Mentorship Program</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Program Title"
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
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select label="Duration">
                    <MenuItem value="1 month">1 month</MenuItem>
                    <MenuItem value="3 months">3 months</MenuItem>
                    <MenuItem value="6 months">6 months</MenuItem>
                    <MenuItem value="12 months">12 months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Meeting Frequency</InputLabel>
                  <Select label="Meeting Frequency">
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProgramOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Program</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorshipHub;