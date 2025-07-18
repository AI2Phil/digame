import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/Avatar';
import { Progress } from '../../src/components/ui/Progress';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Star,
  Heart,
  ExternalLink,
  Filter,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Bookmark,
  Share2,
  Eye,
  Send,
  FileText,
  Target,
  Zap,
  Globe,
  Home,
  Car,
  Coffee,
  GraduationCap,
  Award,
  Code,
  Palette,
  BarChart3,
  MessageSquare,
  Shield,
  Rocket,
  Brain,
  Lightbulb,
} from 'lucide-react';

const CareerJobs: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommended');
  const [jobsData, setJobsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: 'all',
    salary: 'all',
    experience: 'all',
    remote: 'all',
    company: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());

  useEffect(() => {
    fetchJobsData();
  }, [filters]);

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/career/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ filters, search: searchTerm }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobsData(data);
      }
    } catch (error) {
      console.error('Error fetching jobs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockJobsData = {
    recommended: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        logo: 'TC',
        location: 'San Francisco, CA',
        remote: 'Hybrid',
        salary: '$120,000 - $160,000',
        posted: '2 days ago',
        matchScore: 95,
        description:
          'Join our engineering team to build scalable web applications using React, Node.js, and AWS.',
        requirements: ['5+ years experience', 'React/Node.js', 'AWS', 'Team leadership'],
        benefits: ['Health insurance', 'Stock options', 'Flexible hours', '401k'],
        companySize: '500-1000',
        industry: 'Technology',
        type: 'Full-time',
        experience: 'Senior',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Leadership'],
        applicationDeadline: '2024-02-15',
        quickApply: true,
        saved: false,
        applied: false,
        companyRating: 4.5,
        workLifeBalance: 4.2,
        careerGrowth: 4.6,
        compensation: 4.4,
      },
      {
        id: 2,
        title: 'Technical Lead',
        company: 'InnovateLabs',
        logo: 'IL',
        location: 'Austin, TX',
        remote: 'Remote',
        salary: '$130,000 - $170,000',
        posted: '1 week ago',
        matchScore: 88,
        description: 'Lead a team of engineers in developing cutting-edge AI-powered applications.',
        requirements: [
          '7+ years experience',
          'Team leadership',
          'System design',
          'AI/ML knowledge',
        ],
        benefits: ['Remote work', 'Unlimited PTO', 'Learning budget', 'Health insurance'],
        companySize: '100-500',
        industry: 'AI/ML',
        type: 'Full-time',
        experience: 'Senior',
        skills: ['Leadership', 'System Design', 'Python', 'AI/ML', 'Architecture'],
        applicationDeadline: '2024-02-20',
        quickApply: false,
        saved: true,
        applied: false,
        companyRating: 4.7,
        workLifeBalance: 4.8,
        careerGrowth: 4.5,
        compensation: 4.3,
      },
      {
        id: 3,
        title: 'Principal Engineer',
        company: 'CloudScale',
        logo: 'CS',
        location: 'Seattle, WA',
        remote: 'On-site',
        salary: '$150,000 - $200,000',
        posted: '3 days ago',
        matchScore: 82,
        description:
          'Drive technical strategy and architecture for our cloud infrastructure platform.',
        requirements: [
          '10+ years experience',
          'Cloud architecture',
          'Distributed systems',
          'Technical leadership',
        ],
        benefits: [
          'Stock options',
          'Health insurance',
          'Relocation assistance',
          'Professional development',
        ],
        companySize: '1000+',
        industry: 'Cloud Computing',
        type: 'Full-time',
        experience: 'Principal',
        skills: ['Cloud Architecture', 'Distributed Systems', 'Leadership', 'Strategy'],
        applicationDeadline: '2024-02-25',
        quickApply: true,
        saved: false,
        applied: false,
        companyRating: 4.3,
        workLifeBalance: 4.0,
        careerGrowth: 4.7,
        compensation: 4.8,
      },
      {
        id: 4,
        title: 'Engineering Manager',
        company: 'StartupX',
        logo: 'SX',
        location: 'New York, NY',
        remote: 'Hybrid',
        salary: '$140,000 - $180,000',
        posted: '5 days ago',
        matchScore: 75,
        description: 'Manage and grow our engineering team while contributing to product strategy.',
        requirements: [
          'Management experience',
          'Technical background',
          'Product mindset',
          'Team building',
        ],
        benefits: ['Equity package', 'Health insurance', 'Flexible schedule', 'Team events'],
        companySize: '50-100',
        industry: 'Fintech',
        type: 'Full-time',
        experience: 'Manager',
        skills: ['Management', 'Product Strategy', 'Team Building', 'Technical Leadership'],
        applicationDeadline: '2024-02-18',
        quickApply: false,
        saved: false,
        applied: true,
        companyRating: 4.1,
        workLifeBalance: 4.4,
        careerGrowth: 4.2,
        compensation: 4.0,
      },
    ],
    applied: [
      {
        id: 4,
        title: 'Engineering Manager',
        company: 'StartupX',
        status: 'Under Review',
        appliedDate: '2024-01-10',
        lastUpdate: '2024-01-12',
        stage: 'Initial Review',
        nextStep: 'Phone Screen',
        estimatedResponse: '3-5 days',
        recruiterContact: 'sarah.recruiter@startupx.com',
      },
      {
        id: 5,
        title: 'Senior Developer',
        company: 'WebFlow Inc',
        status: 'Interview Scheduled',
        appliedDate: '2024-01-08',
        lastUpdate: '2024-01-14',
        stage: 'Technical Interview',
        nextStep: 'Technical Interview on Jan 18',
        estimatedResponse: 'Scheduled',
        recruiterContact: 'mike.hr@webflow.com',
      },
      {
        id: 6,
        title: 'Full Stack Engineer',
        company: 'DataCorp',
        status: 'Rejected',
        appliedDate: '2024-01-05',
        lastUpdate: '2024-01-11',
        stage: 'Final Decision',
        nextStep: 'None',
        estimatedResponse: 'Complete',
        feedback: 'Strong technical skills, but looking for more experience with data pipelines.',
      },
    ],
    saved: [
      {
        id: 2,
        title: 'Technical Lead',
        company: 'InnovateLabs',
        savedDate: '2024-01-12',
        expiresIn: '18 days',
        notes: 'Great remote culture, interesting AI projects',
      },
      {
        id: 7,
        title: 'Solutions Architect',
        company: 'CloudTech',
        savedDate: '2024-01-10',
        expiresIn: '20 days',
        notes: 'Good compensation, need to research company culture',
      },
    ],
    insights: {
      marketTrends: {
        averageSalary: '$125,000',
        salaryGrowth: '+8.5%',
        demandGrowth: '+15%',
        topSkills: ['React', 'AWS', 'Python', 'Leadership', 'System Design'],
        hotLocations: ['San Francisco', 'Seattle', 'Austin', 'New York', 'Remote'],
      },
      personalStats: {
        profileViews: 156,
        applicationsSent: 12,
        responseRate: '25%',
        interviewRate: '15%',
        avgMatchScore: 78,
      },
      recommendations: [
        {
          type: 'Skill Gap',
          message: 'Learning Kubernetes could increase your match score by 12%',
          action: 'Start Learning',
          priority: 'High',
        },
        {
          type: 'Application Strategy',
          message: 'Apply to 3-5 jobs per week for optimal results',
          action: 'Set Reminder',
          priority: 'Medium',
        },
        {
          type: 'Profile Optimization',
          message: 'Add portfolio projects to increase profile views',
          action: 'Update Profile',
          priority: 'Medium',
        },
      ],
    },
    filters: {
      locations: ['San Francisco', 'Seattle', 'Austin', 'New York', 'Remote', 'Los Angeles'],
      salaryRanges: ['$80k-$100k', '$100k-$120k', '$120k-$150k', '$150k+'],
      experienceLevels: ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'],
      remoteOptions: ['On-site', 'Remote', 'Hybrid'],
      companies: ['TechCorp', 'InnovateLabs', 'CloudScale', 'StartupX', 'WebFlow Inc'],
    },
  };

  const currentData = jobsData || mockJobsData;

  const getMatchScoreColor = score => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Interview Scheduled':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Offer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveJob = async jobId => {
    try {
      const response = await fetch(`/api/career/jobs/${jobId}/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApplyJob = async jobId => {
    try {
      const response = await fetch(`/api/career/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Handle success
        fetchJobsData();
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const filteredJobs = currentData.recommended.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filters.location === 'all' || job.location.includes(filters.location);
    const matchesRemote = filters.remote === 'all' || job.remote === filters.remote;
    const matchesExperience = filters.experience === 'all' || job.experience === filters.experience;

    return matchesSearch && matchesLocation && matchesRemote && matchesExperience;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Job Opportunities"
        subtitle="AI-powered job matching and career opportunities"
        icon={<Briefcase className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Career', href: '/career' },
          { label: 'Jobs', href: '/career/jobs' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Job Alert
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommended'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Recommended
        </button>
        <button
          onClick={() => setActiveTab('applied')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'applied'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="h-4 w-4 inline mr-2" />
          Applied ({currentData.applied.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bookmark className="h-4 w-4 inline mr-2" />
          Saved ({currentData.saved.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Market Insights
        </button>
      </div>

      {activeTab === 'recommended' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filters.location}
              onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {currentData.filters.locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <select
              value={filters.remote}
              onChange={e => setFilters(prev => ({ ...prev, remote: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {currentData.filters.remoteOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{job.logo}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-medium text-lg">{job.title}</h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            {job.remote}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.posted}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{job.companyRating}</span>
                          </div>
                          <div className="text-sm text-gray-600">{job.companySize} employees</div>
                          <div className="text-sm text-gray-600">{job.industry}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}
                      >
                        {job.matchScore}% match
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveJob(job.id)}
                          disabled={job.saved || savedJobs.has(job.id)}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${job.saved || savedJobs.has(job.id) ? 'fill-current' : ''}`}
                          />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {job.quickApply ? (
                          <Button
                            size="sm"
                            onClick={() => handleApplyJob(job.id)}
                            disabled={job.applied}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {job.applied ? 'Applied' : 'Quick Apply'}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applied' && (
        <div className="space-y-4">
          {currentData.applied.map(application => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{application.title}</h3>
                      <p className="text-gray-600">{application.company}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Applied</div>
                        <div className="font-medium">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Last Update</div>
                        <div className="font-medium">
                          {new Date(application.lastUpdate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Current Stage</div>
                        <div className="font-medium">{application.stage}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Next Step</div>
                        <div className="font-medium">{application.nextStep}</div>
                      </div>
                    </div>

                    {application.feedback && (
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <div className="text-sm font-medium text-red-800 mb-1">Feedback</div>
                        <div className="text-sm text-red-700">{application.feedback}</div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      Contact: {application.recruiterContact}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Response: {application.estimatedResponse}
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {currentData.saved.map(job => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>Saved: {new Date(job.savedDate).toLocaleDateString()}</div>
                      <div>Expires in: {job.expiresIn}</div>
                    </div>

                    {job.notes && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-1">Notes</div>
                        <div className="text-sm text-blue-700">{job.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.insights.marketTrends.averageSalary}
                  </div>
                  <div className="text-sm text-gray-600">Average Salary</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.insights.marketTrends.salaryGrowth}
                  </div>
                  <div className="text-sm text-gray-600">Salary Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentData.insights.marketTrends.demandGrowth}
                  </div>
                  <div className="text-sm text-gray-600">Demand Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentData.insights.personalStats.avgMatchScore}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Match Score</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top Skills in Demand</h4>
                  <div className="space-y-2">
                    {currentData.insights.marketTrends.topSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{skill}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={90 - index * 10} className="h-2 w-20" />
                          <span className="text-xs text-gray-600">{90 - index * 10}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Hot Locations</h4>
                  <div className="space-y-2">
                    {currentData.insights.marketTrends.hotLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{location}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85 - index * 15} className="h-2 w-20" />
                          <span className="text-xs text-gray-600">{85 - index * 15}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Job Search Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.insights.personalStats.profileViews}
                  </div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.insights.personalStats.applicationsSent}
                  </div>
                  <div className="text-sm text-gray-600">Applications Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentData.insights.personalStats.responseRate}
                  </div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentData.insights.personalStats.interviewRate}
                  </div>
                  <div className="text-sm text-gray-600">Interview Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {currentData.insights.personalStats.avgMatchScore}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Match Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.insights.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{rec.type}</span>
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{rec.message}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareerJobs;
