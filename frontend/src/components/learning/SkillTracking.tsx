import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import {
  TrendingUp,
  School,
  Assessment,
  Timeline,
  Code,
  Language,
  Business,
  Palette,
  Psychology,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Star,
  CheckCircle,
  Schedule,
  TrendingDown,
  TrendingFlat,
  FilterList,
  Sort,
  Visibility,
  BarChart,
  PieChart,
  ShowChart,
  EmojiEvents,
  GpsFixed,
  Speed,
  Assignment,
  Group,
  Person,
  Computer,
  AutoAwesome
} from '@mui/icons-material';

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

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'business' | 'design';
  level: number;
  targetLevel: number;
  progress: number;
  lastAssessed: Date;
  assessmentType: 'self' | 'peer' | 'expert' | 'automated';
  endorsements: number;
  marketDemand: 'High' | 'Medium' | 'Low';
  salaryImpact: number;
  trending: 'up' | 'down' | 'stable';
  certifications: string[];
  relatedSkills: string[];
  learningResources: number;
}

interface Assessment {
  id: string;
  skillId: string;
  skillName: string;
  type: 'self' | 'peer' | 'expert' | 'automated';
  score: number;
  feedback: string;
  assessor: string;
  date: Date;
  improvements: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  skills: string[];
  reward: string;
  progress: number;
}

const SkillTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [skillsPerPage] = useState(6);

  // Mock data for skills
  const skills: Skill[] = [
    {
      id: '1',
      name: 'React.js',
      category: 'technical',
      level: 4,
      targetLevel: 5,
      progress: 78,
      lastAssessed: new Date('2025-01-08'),
      assessmentType: 'expert',
      endorsements: 12,
      marketDemand: 'High',
      salaryImpact: 15,
      trending: 'up',
      certifications: ['React Developer Certification'],
      relatedSkills: ['JavaScript', 'TypeScript', 'Redux'],
      learningResources: 25
    },
    {
      id: '2',
      name: 'TypeScript',
      category: 'technical',
      level: 3,
      targetLevel: 4,
      progress: 65,
      lastAssessed: new Date('2025-01-05'),
      assessmentType: 'self',
      endorsements: 8,
      marketDemand: 'High',
      salaryImpact: 12,
      trending: 'up',
      certifications: [],
      relatedSkills: ['JavaScript', 'React.js'],
      learningResources: 18
    },
    {
      id: '3',
      name: 'Leadership',
      category: 'soft',
      level: 3,
      targetLevel: 4,
      progress: 55,
      lastAssessed: new Date('2025-01-03'),
      assessmentType: 'peer',
      endorsements: 15,
      marketDemand: 'High',
      salaryImpact: 20,
      trending: 'stable',
      certifications: ['Leadership Fundamentals'],
      relatedSkills: ['Communication', 'Team Management'],
      learningResources: 12
    },
    {
      id: '4',
      name: 'Spanish',
      category: 'language',
      level: 2,
      targetLevel: 3,
      progress: 40,
      lastAssessed: new Date('2024-12-28'),
      assessmentType: 'automated',
      endorsements: 3,
      marketDemand: 'Medium',
      salaryImpact: 8,
      trending: 'stable',
      certifications: [],
      relatedSkills: ['English', 'Communication'],
      learningResources: 30
    }
  ];

  // Mock data for assessments
  const assessments: Assessment[] = [
    {
      id: '1',
      skillId: '1',
      skillName: 'React.js',
      type: 'expert',
      score: 78,
      feedback: 'Strong understanding of React concepts. Focus on advanced patterns and performance optimization.',
      assessor: 'Senior Developer',
      date: new Date('2025-01-08'),
      improvements: ['Learn React.memo', 'Master custom hooks', 'Understand React internals']
    },
    {
      id: '2',
      skillId: '2',
      skillName: 'TypeScript',
      type: 'self',
      score: 65,
      feedback: 'Good progress with basic types. Need to work on advanced type patterns.',
      assessor: 'Self Assessment',
      date: new Date('2025-01-05'),
      improvements: ['Generic types', 'Conditional types', 'Utility types']
    }
  ];

  // Mock data for milestones
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Frontend Expert',
      description: 'Master advanced frontend development skills',
      targetDate: new Date('2025-03-01'),
      completed: false,
      skills: ['React.js', 'TypeScript', 'Performance Optimization'],
      reward: 'Frontend Expert Badge',
      progress: 70
    },
    {
      id: '2',
      title: 'Team Leader',
      description: 'Develop leadership and management capabilities',
      targetDate: new Date('2025-04-15'),
      completed: false,
      skills: ['Leadership', 'Communication', 'Project Management'],
      reward: 'Leadership Certificate',
      progress: 45
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code />;
      case 'soft': return <Psychology />;
      case 'language': return <Language />;
      case 'business': return <Business />;
      case 'design': return <Palette />;
      default: return <School />;
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

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      case 'stable': return <TrendingFlat color="info" />;
      default: return <TrendingFlat />;
    }
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'self': return <Person />;
      case 'peer': return <Group />;
      case 'expert': return <Star />;
      case 'automated': return <Computer />;
      default: return <Assessment />;
    }
  };

  const filteredSkills = skills.filter(skill => 
    filterCategory === 'all' || skill.category === filterCategory
  );

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'progress':
        aValue = a.progress;
        bValue = b.progress;
        break;
      case 'level':
        aValue = a.level;
        bValue = b.level;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'marketDemand':
        const demandOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = demandOrder[a.marketDemand];
        bValue = demandOrder[b.marketDemand];
        break;
      default:
        aValue = a.progress;
        bValue = b.progress;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedSkills = sortedSkills.slice(
    (currentPage - 1) * skillsPerPage,
    currentPage * skillsPerPage
  );

  const totalPages = Math.ceil(sortedSkills.length / skillsPerPage);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assessment color="primary" sx={{ fontSize: 40 }} />
          Skill Tracking
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor your skill development progress and plan your learning journey
        </Typography>
      </Box>

      {/* Progress Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <School color="primary" />
                <Typography variant="h6">Total Skills</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">{skills.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Across {new Set(skills.map(s => s.category)).size} categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp color="success" />
                <Typography variant="h6">Avg Progress</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {Math.round(skills.reduce((acc, skill) => acc + skill.progress, 0) / skills.length)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall skill development
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Timeline color="warning" />
                <Typography variant="h6">Monthly Growth</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">+15%</Typography>
              <Typography variant="body2" color="text.secondary">
                Progress this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EmojiEvents color="secondary" />
                <Typography variant="h6">Endorsements</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {skills.reduce((acc, skill) => acc + skill.endorsements, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From peers and experts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="skill tracking tabs">
            <Tab icon={<School />} label="Skills Overview" />
            <Tab icon={<BarChart />} label="Progress Analytics" />
            <Tab icon={<Assessment />} label="Assessments" />
            <Tab icon={<GpsFixed />} label="Learning Path" />
          </Tabs>
        </Box>

        {/* Skills Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          {/* Filters and Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="progress">Progress</MenuItem>
                <MenuItem value="level">Level</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="marketDemand">Market Demand</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<Sort />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            
            <Button variant="contained" startIcon={<Add />}>
              Add Skill
            </Button>
          </Box>

          {/* Skills Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {paginatedSkills.map((skill) => (
              <Grid item xs={12} md={6} lg={4} key={skill.id}>
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setSelectedSkill(skill)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(skill.category)}
                        <Chip 
                          label={skill.category} 
                          size="small" 
                          color={getCategoryColor(skill.category) as any}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendingIcon(skill.trending)}
                        <Chip 
                          label={skill.marketDemand} 
                          size="small" 
                          color={skill.marketDemand === 'High' ? 'success' : skill.marketDemand === 'Medium' ? 'warning' : 'default'}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {skill.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Level {skill.level}/{skill.targetLevel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {skill.progress}% complete
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.progress} 
                      sx={{ mb: 2, height: 8, borderRadius: 4 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getAssessmentTypeIcon(skill.assessmentType)}
                        <Typography variant="caption" color="text.secondary">
                          Last: {skill.lastAssessed.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star fontSize="small" color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          {skill.endorsements} endorsements
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="caption">
                        +{skill.salaryImpact}% salary impact
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </TabPanel>

        {/* Progress Analytics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Skill Progress Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Progress Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChart sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Chart visualization would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Growth Over Time
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShowChart sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Time series chart would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Category Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    {['technical', 'soft', 'language', 'business', 'design'].map((category) => {
                      const categorySkills = skills.filter(s => s.category === category);
                      const avgProgress = categorySkills.length > 0 
                        ? categorySkills.reduce((acc, s) => acc + s.progress, 0) / categorySkills.length 
                        : 0;
                      
                      return (
                        <Grid item xs={12} sm={6} md={2.4} key={category}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            {getCategoryIcon(category)}
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', mt: 1 }}>
                              {category}
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {Math.round(avgProgress)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {categorySkills.length} skills
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Assessments Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Skill Assessments
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track your skill evaluations from various sources
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Skill</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Assessor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School />
                        {assessment.skillName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAssessmentTypeIcon(assessment.type)}
                        <Chip label={assessment.type} size="small" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary">
                          {assessment.score}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={assessment.score} 
                          sx={{ width: 60, height: 6 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{assessment.assessor}</TableCell>
                    <TableCell>{assessment.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Learning Path Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Learning Path Milestones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track your progress towards skill development goals
          </Typography>

          <Grid container spacing={3}>
            {milestones.map((milestone) => (
              <Grid item xs={12} md={6} key={milestone.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{milestone.title}</Typography>
                      <Chip 
                        icon={milestone.completed ? <CheckCircle /> : <Schedule />}
                        label={milestone.completed ? 'Completed' : 'In Progress'}
                        color={milestone.completed ? 'success' : 'primary'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {milestone.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{milestone.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={milestone.progress} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {milestone.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                    
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Reward:</strong> {milestone.reward}
                      </Typography>
                    </Alert>
                    
                    <Typography variant="caption" color="text.secondary">
                      Target: {milestone.targetDate.toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Skill Detail Dialog */}
      <Dialog 
        open={!!selectedSkill} 
        onClose={() => setSelectedSkill(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSkill && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getCategoryIcon(selectedSkill.category)}
                  <Typography variant="h6">{selectedSkill.name}</Typography>
                </Box>
                <Chip 
                  label={`Level ${selectedSkill.level}/${selectedSkill.targetLevel}`} 
                  color="primary"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedSkill.progress} 
                      sx={{ flexGrow: 1, height: 8 }}
                    />
                    <Typography variant="body2">{selectedSkill.progress}%</Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Market Information</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`${selectedSkill.marketDemand} Demand`} size="small" />
                    <Chip label={`+${selectedSkill.salaryImpact}% Salary`} size="small" color="success" />
                    {getTrendingIcon(selectedSkill.trending)}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Assessment Details</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getAssessmentTypeIcon(selectedSkill.assessmentType)}
                    <Typography variant="body2">
                      Last assessed: {selectedSkill.lastAssessed.toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Related Skills</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedSkill.relatedSkills.map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSkill(null)}>Close</Button>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit Skill
              </Button>
              <Button variant="contained" startIcon={<Assessment />}>
                Take Assessment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SkillTracking;