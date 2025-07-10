import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Palette as DesignIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface Skill {
  id: number;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'business' | 'design';
  currentLevel: number;
  targetLevel: number;
  progress: number;
  lastUpdated: string;
  assessments: SkillAssessment[];
  learningResources: LearningResource[];
  milestones: Milestone[];
  endorsements: number;
  verified: boolean;
  trending: boolean;
  marketDemand: 'high' | 'medium' | 'low';
  salaryImpact: number;
}

interface SkillAssessment {
  id: number;
  type: 'self' | 'peer' | 'expert' | 'automated';
  score: number;
  maxScore: number;
  date: string;
  feedback: string;
  assessor?: string;
  certificate?: string;
}

interface LearningResource {
  id: number;
  title: string;
  type: 'course' | 'book' | 'video' | 'practice' | 'project';
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  completed: boolean;
  progress: number;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  skillLevelRequired: number;
  reward?: string;
}

interface ProgressMetrics {
  totalSkills: number;
  skillsInProgress: number;
  skillsCompleted: number;
  averageProgress: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  skillsAboveTarget: number;
  endorsementsReceived: number;
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
      id={`skill-tracking-tabpanel-${index}`}
      aria-labelledby={`skill-tracking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SkillTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillDetailsOpen, setSkillDetailsOpen] = useState(false);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('progress');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchSkillData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setSkills([
          {
            id: 1,
            name: 'React.js',
            category: 'technical',
            currentLevel: 7,
            targetLevel: 9,
            progress: 78,
            lastUpdated: '2024-01-15',
            endorsements: 12,
            verified: true,
            trending: true,
            marketDemand: 'high',
            salaryImpact: 15,
            assessments: [
              {
                id: 1,
                type: 'expert',
                score: 85,
                maxScore: 100,
                date: '2024-01-10',
                feedback: 'Strong understanding of React patterns and hooks. Could improve on performance optimization.',
                assessor: 'Senior Developer',
                certificate: 'React Advanced Certification'
              }
            ],
            learningResources: [
              {
                id: 1,
                title: 'Advanced React Patterns',
                type: 'course',
                provider: 'TechEd',
                duration: '6 weeks',
                difficulty: 'advanced',
                rating: 4.8,
                completed: false,
                progress: 60
              }
            ],
            milestones: [
              {
                id: 1,
                title: 'Build Complex React Application',
                description: 'Create a full-featured React app with advanced patterns',
                targetDate: '2024-03-01',
                completed: false,
                skillLevelRequired: 8,
                reward: 'React Expert Badge'
              }
            ]
          },
          {
            id: 2,
            name: 'TypeScript',
            category: 'technical',
            currentLevel: 6,
            targetLevel: 8,
            progress: 65,
            lastUpdated: '2024-01-12',
            endorsements: 8,
            verified: false,
            trending: true,
            marketDemand: 'high',
            salaryImpact: 12,
            assessments: [
              {
                id: 2,
                type: 'self',
                score: 70,
                maxScore: 100,
                date: '2024-01-05',
                feedback: 'Good progress on type definitions and generics. Need more practice with advanced types.',
                assessor: 'Self Assessment'
              }
            ],
            learningResources: [
              {
                id: 2,
                title: 'TypeScript Deep Dive',
                type: 'book',
                provider: 'O\'Reilly',
                duration: '4 weeks',
                difficulty: 'intermediate',
                rating: 4.6,
                completed: true,
                progress: 100
              }
            ],
            milestones: [
              {
                id: 2,
                title: 'Convert Project to TypeScript',
                description: 'Migrate existing JavaScript project to TypeScript',
                targetDate: '2024-02-15',
                completed: true,
                completedDate: '2024-02-10',
                skillLevelRequired: 6,
                reward: 'TypeScript Practitioner Badge'
              }
            ]
          },
          {
            id: 3,
            name: 'Leadership',
            category: 'soft',
            currentLevel: 5,
            targetLevel: 7,
            progress: 45,
            lastUpdated: '2024-01-08',
            endorsements: 15,
            verified: true,
            trending: false,
            marketDemand: 'high',
            salaryImpact: 20,
            assessments: [
              {
                id: 3,
                type: 'peer',
                score: 75,
                maxScore: 100,
                date: '2024-01-01',
                feedback: 'Shows good potential in team leadership. Excellent communication skills.',
                assessor: 'Team Members'
              }
            ],
            learningResources: [
              {
                id: 3,
                title: 'Leadership in Tech',
                type: 'course',
                provider: 'Leadership Academy',
                duration: '8 weeks',
                difficulty: 'intermediate',
                rating: 4.7,
                completed: false,
                progress: 30
              }
            ],
            milestones: [
              {
                id: 3,
                title: 'Lead Team Project',
                description: 'Successfully lead a cross-functional team project',
                targetDate: '2024-04-01',
                completed: false,
                skillLevelRequired: 6,
                reward: 'Team Leader Badge'
              }
            ]
          },
          {
            id: 4,
            name: 'Node.js',
            category: 'technical',
            currentLevel: 4,
            targetLevel: 7,
            progress: 35,
            lastUpdated: '2024-01-05',
            endorsements: 5,
            verified: false,
            trending: true,
            marketDemand: 'high',
            salaryImpact: 18,
            assessments: [
              {
                id: 4,
                type: 'automated',
                score: 60,
                maxScore: 100,
                date: '2023-12-20',
                feedback: 'Basic understanding of Node.js concepts. Need to work on async programming and APIs.',
                assessor: 'Automated Assessment'
              }
            ],
            learningResources: [
              {
                id: 4,
                title: 'Node.js Complete Guide',
                type: 'course',
                provider: 'NodeAcademy',
                duration: '10 weeks',
                difficulty: 'intermediate',
                rating: 4.5,
                completed: false,
                progress: 25
              }
            ],
            milestones: [
              {
                id: 4,
                title: 'Build REST API',
                description: 'Create a complete REST API with authentication',
                targetDate: '2024-03-15',
                completed: false,
                skillLevelRequired: 6,
                reward: 'Backend Developer Badge'
              }
            ]
          }
        ]);

        setProgressMetrics({
          totalSkills: 4,
          skillsInProgress: 3,
          skillsCompleted: 1,
          averageProgress: 56,
          weeklyGrowth: 8,
          monthlyGrowth: 15,
          skillsAboveTarget: 0,
          endorsementsReceived: 40
        });
        
        setLoading(false);
      }, 1000);
    };

    fetchSkillData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillDetailsOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <CodeIcon />;
      case 'soft': return <PsychologyIcon />;
      case 'language': return <LanguageIcon />;
      case 'business': return <BusinessIcon />;
      case 'design': return <DesignIcon />;
      default: return <SchoolIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'primary';
      case 'soft': return 'secondary';
      case 'language': return 'success';
      case 'business': return 'warning';
      case 'design': return 'info';
      default: return 'default';
    }
  };

  const getMarketDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const filteredSkills = skills.filter(skill => 
    filterCategory === 'all' || skill.category === filterCategory
  );

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'progress': return b.progress - a.progress;
      case 'level': return b.currentLevel - a.currentLevel;
      case 'name': return a.name.localeCompare(b.name);
      case 'updated': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default: return 0;
    }
  });

  const paginatedSkills = sortedSkills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Skill Tracking</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Loading your skill progress and analytics...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">Skill Tracking</Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor your progress and plan your learning journey
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddSkillOpen(true)}
        >
          Add Skill
        </Button>
      </Box>

      {/* Progress Metrics */}
      {progressMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                <Typography variant="h4">{progressMetrics.totalSkills}</Typography>
                <Typography variant="body2" color="text.secondary">Total Skills</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TimelineIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                <Typography variant="h4">{progressMetrics.averageProgress}%</Typography>
                <Typography variant="body2" color="text.secondary">Average Progress</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                <Typography variant="h4">+{progressMetrics.monthlyGrowth}%</Typography>
                <Typography variant="body2" color="text.secondary">Monthly Growth</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
                <Typography variant="h4">{progressMetrics.endorsementsReceived}</Typography>
                <Typography variant="body2" color="text.secondary">Endorsements</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Skills Overview" />
          <Tab label="Progress Analytics" />
          <Tab label="Assessments" />
          <Tab label="Learning Path" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Filters and Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="soft">Soft Skills</MenuItem>
              <MenuItem value="language">Languages</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="design">Design</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="progress">Progress</MenuItem>
              <MenuItem value="level">Current Level</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="updated">Last Updated</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Skills Grid */}
        <Grid container spacing={3}>
          {paginatedSkills.map((skill) => (
            <Grid item xs={12} md={6} lg={4} key={skill.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => handleSkillClick(skill)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCategoryIcon(skill.category)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {skill.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {skill.trending && <Chip label="Trending" size="small" color="success" />}
                      {skill.verified && <CheckCircleIcon color="primary" fontSize="small" />}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Level {skill.currentLevel} → {skill.targetLevel}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {skill.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Market Demand
                      </Typography>
                      <Chip 
                        label={skill.marketDemand} 
                        size="small" 
                        color={getMarketDemandColor(skill.marketDemand) as any}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salary Impact
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +{skill.salaryImpact}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {skill.endorsements} endorsements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated {new Date(skill.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={sortedSkills.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Progress Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Progress chart visualization would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Skill Level Growth</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Growth timeline chart would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                <Grid container spacing={2}>
                  {['technical', 'soft', 'language', 'business', 'design'].map((category) => {
                    const categorySkills = skills.filter(skill => skill.category === category);
                    const avgProgress = categorySkills.length > 0 
                      ? categorySkills.reduce((sum, skill) => sum + skill.progress, 0) / categorySkills.length 
                      : 0;
                    
                    return (
                      <Grid item xs={12} md={2.4} key={category}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          {getCategoryIcon(category)}
                          <Typography variant="h6" sx={{ mt: 1, textTransform: 'capitalize' }}>
                            {category}
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {Math.round(avgProgress)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {categorySkills.length} skills
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {skills.map((skill) => (
            <Grid item xs={12} key={skill.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {getCategoryIcon(skill.category)}
                    <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
                      {skill.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {skill.assessments.length} assessments
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Assessor</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {skill.assessments.map((assessment) => (
                          <TableRow key={assessment.id}>
                            <TableCell>
                              <Chip 
                                label={assessment.type} 
                                size="small" 
                                color={getCategoryColor(assessment.type) as any}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2">
                                  {assessment.score}/{assessment.maxScore}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(assessment.score / assessment.maxScore) * 100}
                                  sx={{ ml: 2, width: 100, height: 6 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(assessment.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{assessment.assessor}</TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {skills.map((skill) => (
          <Card key={skill.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{skill.name} Learning Path</Typography>
              
              <Stepper orientation="vertical">
                {skill.milestones.map((milestone) => (
                  <Step key={milestone.id} active={!milestone.completed}>
                    <StepLabel 
                      StepIconComponent={() => 
                        milestone.completed ? 
                          <CheckCircleIcon color="success" /> : 
                          <AssignmentIcon color="primary" />
                      }
                    >
                      {milestone.title}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {milestone.description}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            Target Date: {new Date(milestone.targetDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            Required Level: {milestone.skillLevelRequired}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            Reward: {milestone.reward}
                          </Typography>
                        </Grid>
                      </Grid>
                      {!milestone.completed && (
                        <Button variant="contained" size="small" sx={{ mt: 2 }}>
                          Start Milestone
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Skill Details Dialog */}
      <Dialog 
        open={skillDetailsOpen} 
        onClose={() => setSkillDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSkill && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getCategoryIcon(selectedSkill.category)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedSkill.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Current Progress</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Level {selectedSkill.currentLevel} → {selectedSkill.targetLevel}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {selectedSkill.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedSkill.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Market Information</Typography>
                  <Typography variant="body2">
                    Demand: <Chip 
                      label={selectedSkill.marketDemand} 
                      size="small" 
                      color={getMarketDemandColor(selectedSkill.marketDemand) as any}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Salary Impact: +{selectedSkill.salaryImpact}%
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSkillDetailsOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<EditIcon />}>
                Edit Skill
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog
        open={addSkillOpen}
        onClose={() => setAddSkillOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Skill Name"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="soft">Soft Skills</MenuItem>
                <MenuItem value="language">Languages</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="design">Design</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Current Level (1-10)"
              type="number"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Target Level (1-10)"
              type="number"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSkillOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Skill</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillTracking;