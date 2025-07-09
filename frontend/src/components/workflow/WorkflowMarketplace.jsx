import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { useToastHelpers } from '../ui/Toaster';
import {
  Store,
  Search,
  Download,
  Upload,
  Star,
  Heart,
  Share,
  Eye,
  Users,
  User,
  Plus,
  Edit,
  RefreshCw,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  Workflow,
  MoreHorizontal,
  MessageSquare,
  Tag
} from 'lucide-react';

const WorkflowMarketplace = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dataSource, setDataSource] = useState('loading');
  const { success, error, warning, info } = useToastHelpers();

  // Database-driven marketplace data
  const [marketplaceData, setMarketplaceData] = useState({
    templates: [
      {
        id: 1,
        name: 'CI/CD Pipeline Template',
        description: 'Complete continuous integration and deployment workflow for modern applications',
        category: 'DevOps',
        author: 'DevOps Team',
        downloads: 2847,
        rating: 4.8,
        reviews: 156,
        tags: ['CI/CD', 'Docker', 'Kubernetes', 'Testing'],
        complexity: 'Intermediate',
        estimatedTime: '30 minutes',
        lastUpdated: '2 days ago',
        version: '2.1.0',
        featured: true,
        verified: true,
        price: 'Free',
        thumbnail: '/api/placeholder/300/200',
        steps: 12,
        triggers: ['Git Push', 'Pull Request'],
        integrations: ['GitHub', 'Docker Hub', 'Slack']
      },
      {
        id: 2,
        name: 'Customer Onboarding Flow',
        description: 'Automated customer onboarding with email sequences, account setup, and welcome materials',
        category: 'Marketing',
        author: 'Marketing Pro',
        downloads: 1923,
        rating: 4.9,
        reviews: 89,
        tags: ['Onboarding', 'Email', 'CRM', 'Automation'],
        complexity: 'Beginner',
        estimatedTime: '15 minutes',
        lastUpdated: '1 week ago',
        version: '1.5.2',
        featured: true,
        verified: true,
        price: 'Free',
        thumbnail: '/api/placeholder/300/200',
        steps: 8,
        triggers: ['User Registration', 'Payment Completed'],
        integrations: ['Mailchimp', 'Salesforce', 'Stripe']
      },
      {
        id: 3,
        name: 'Data Processing Pipeline',
        description: 'ETL workflow for processing large datasets with validation, transformation, and storage',
        category: 'Data Science',
        author: 'Data Analytics Inc',
        downloads: 1456,
        rating: 4.7,
        reviews: 67,
        tags: ['ETL', 'Big Data', 'Analytics', 'Machine Learning'],
        complexity: 'Advanced',
        estimatedTime: '45 minutes',
        lastUpdated: '3 days ago',
        version: '3.0.1',
        featured: false,
        verified: true,
        price: '$29',
        thumbnail: '/api/placeholder/300/200',
        steps: 18,
        triggers: ['File Upload', 'Schedule'],
        integrations: ['AWS S3', 'Snowflake', 'Tableau']
      },
      {
        id: 4,
        name: 'Security Incident Response',
        description: 'Automated security incident detection, analysis, and response workflow',
        category: 'Security',
        author: 'CyberSec Solutions',
        downloads: 892,
        rating: 4.9,
        reviews: 34,
        tags: ['Security', 'Incident Response', 'SIEM', 'Automation'],
        complexity: 'Advanced',
        estimatedTime: '60 minutes',
        lastUpdated: '5 days ago',
        version: '1.8.0',
        featured: false,
        verified: true,
        price: '$49',
        thumbnail: '/api/placeholder/300/200',
        steps: 15,
        triggers: ['Security Alert', 'Anomaly Detection'],
        integrations: ['Splunk', 'PagerDuty', 'Jira']
      },
      {
        id: 5,
        name: 'E-commerce Order Processing',
        description: 'Complete order fulfillment workflow from payment to shipping notification',
        category: 'E-commerce',
        author: 'Commerce Hub',
        downloads: 2156,
        rating: 4.6,
        reviews: 123,
        tags: ['E-commerce', 'Orders', 'Inventory', 'Shipping'],
        complexity: 'Intermediate',
        estimatedTime: '25 minutes',
        lastUpdated: '1 day ago',
        version: '2.3.1',
        featured: true,
        verified: true,
        price: 'Free',
        thumbnail: '/api/placeholder/300/200',
        steps: 10,
        triggers: ['Order Placed', 'Payment Confirmed'],
        integrations: ['Shopify', 'PayPal', 'FedEx']
      },
      {
        id: 6,
        name: 'Social Media Campaign',
        description: 'Multi-platform social media posting and engagement tracking workflow',
        category: 'Marketing',
        author: 'Social Media Experts',
        downloads: 1678,
        rating: 4.5,
        reviews: 78,
        tags: ['Social Media', 'Content', 'Analytics', 'Scheduling'],
        complexity: 'Beginner',
        estimatedTime: '20 minutes',
        lastUpdated: '4 days ago',
        version: '1.4.0',
        featured: false,
        verified: true,
        price: '$19',
        thumbnail: '/api/placeholder/300/200',
        steps: 7,
        triggers: ['Content Ready', 'Schedule'],
        integrations: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn']
      }
    ],
    myWorkflows: [
      {
        id: 1,
        name: 'Custom Lead Scoring',
        description: 'Proprietary lead scoring algorithm with CRM integration',
        category: 'Sales',
        visibility: 'Private',
        downloads: 0,
        rating: 0,
        reviews: 0,
        tags: ['Lead Scoring', 'CRM', 'Sales'],
        complexity: 'Intermediate',
        estimatedTime: '35 minutes',
        lastUpdated: '2 hours ago',
        version: '1.0.0',
        featured: false,
        verified: false,
        price: 'Private',
        thumbnail: '/api/placeholder/300/200',
        steps: 14,
        triggers: ['Lead Created', 'Activity Updated'],
        integrations: ['HubSpot', 'Salesforce']
      },
      {
        id: 2,
        name: 'Inventory Alert System',
        description: 'Real-time inventory monitoring with automated reorder alerts',
        category: 'Operations',
        visibility: 'Public',
        downloads: 45,
        rating: 4.2,
        reviews: 8,
        tags: ['Inventory', 'Alerts', 'Automation'],
        complexity: 'Beginner',
        estimatedTime: '15 minutes',
        lastUpdated: '1 week ago',
        version: '1.2.0',
        featured: false,
        verified: false,
        price: 'Free',
        thumbnail: '/api/placeholder/300/200',
        steps: 6,
        triggers: ['Stock Level', 'Threshold'],
        integrations: ['ERP System', 'Email']
      }
    ],
    community: [
      {
        id: 1,
        name: 'Workflow Builders Community',
        description: 'Share and discover workflow templates with fellow automation enthusiasts',
        members: 12847,
        workflows: 2156,
        category: 'General',
        activity: 'Very Active',
        moderators: ['John Doe', 'Jane Smith'],
        rules: ['Be respectful', 'Share quality content', 'Help others'],
        recentActivity: [
          { user: 'Alex Chen', action: 'shared', item: 'API Testing Workflow', time: '2 hours ago' },
          { user: 'Sarah Wilson', action: 'commented on', item: 'Database Backup Template', time: '4 hours ago' },
          { user: 'Mike Johnson', action: 'liked', item: 'Email Campaign Automation', time: '6 hours ago' }
        ]
      },
      {
        id: 2,
        name: 'DevOps Automation Hub',
        description: 'Specialized community for DevOps and infrastructure automation workflows',
        members: 8934,
        workflows: 1456,
        category: 'DevOps',
        activity: 'Active',
        moderators: ['DevOps Master', 'Cloud Architect'],
        rules: ['Focus on DevOps', 'Test before sharing', 'Document thoroughly'],
        recentActivity: [
          { user: 'Tom Rodriguez', action: 'shared', item: 'Kubernetes Deployment', time: '1 hour ago' },
          { user: 'Lisa Park', action: 'updated', item: 'Docker Build Pipeline', time: '3 hours ago' },
          { user: 'Chris Lee', action: 'reviewed', item: 'Infrastructure as Code', time: '5 hours ago' }
        ]
      },
      {
        id: 3,
        name: 'Marketing Automation Experts',
        description: 'Community focused on marketing workflows, campaigns, and customer engagement',
        members: 6721,
        workflows: 987,
        category: 'Marketing',
        activity: 'Moderate',
        moderators: ['Marketing Guru', 'Campaign Expert'],
        rules: ['Marketing focus only', 'Respect privacy', 'Share insights'],
        recentActivity: [
          { user: 'Emma Davis', action: 'shared', item: 'Lead Nurturing Campaign', time: '2 hours ago' },
          { user: 'Ryan Miller', action: 'commented on', item: 'A/B Testing Workflow', time: '4 hours ago' },
          { user: 'Sophie Brown', action: 'liked', item: 'Customer Segmentation', time: '7 hours ago' }
        ]
      }
    ]
  });

  // Enhanced fallback data generators
  const generateFallbackTemplates = () => [
    {
      id: 1,
      name: 'CI/CD Pipeline Template',
      description: 'Complete continuous integration and deployment workflow for modern applications',
      category: 'DevOps',
      author: 'DevOps Team',
      downloads: 2847,
      rating: 4.8,
      reviews: 156,
      tags: ['CI/CD', 'Docker', 'Kubernetes', 'Testing'],
      complexity: 'Intermediate',
      estimatedTime: '30 minutes',
      lastUpdated: '2 days ago',
      version: '2.1.0',
      featured: true,
      verified: true,
      price: 'Free',
      thumbnail: '/api/placeholder/300/200',
      steps: 12,
      triggers: ['Git Push', 'Pull Request'],
      integrations: ['GitHub', 'Docker Hub', 'Slack']
    },
    {
      id: 2,
      name: 'Customer Onboarding Flow',
      description: 'Automated customer onboarding with email sequences, account setup, and welcome materials',
      category: 'Marketing',
      author: 'Marketing Pro',
      downloads: 1923,
      rating: 4.9,
      reviews: 89,
      tags: ['Onboarding', 'Email', 'CRM', 'Automation'],
      complexity: 'Beginner',
      estimatedTime: '15 minutes',
      lastUpdated: '1 week ago',
      version: '1.5.2',
      featured: true,
      verified: true,
      price: 'Free',
      thumbnail: '/api/placeholder/300/200',
      steps: 8,
      triggers: ['User Registration', 'Payment Completed'],
      integrations: ['Mailchimp', 'Salesforce', 'Stripe']
    },
    {
      id: 3,
      name: 'Data Processing Pipeline',
      description: 'ETL workflow for processing large datasets with validation, transformation, and storage',
      category: 'Data Science',
      author: 'Data Analytics Inc',
      downloads: 1456,
      rating: 4.7,
      reviews: 67,
      tags: ['ETL', 'Big Data', 'Analytics', 'Machine Learning'],
      complexity: 'Advanced',
      estimatedTime: '45 minutes',
      lastUpdated: '3 days ago',
      version: '3.0.1',
      featured: false,
      verified: true,
      price: '$29',
      thumbnail: '/api/placeholder/300/200',
      steps: 18,
      triggers: ['File Upload', 'Schedule'],
      integrations: ['AWS S3', 'Snowflake', 'Tableau']
    },
    {
      id: 4,
      name: 'Security Incident Response',
      description: 'Automated security incident detection, analysis, and response workflow',
      category: 'Security',
      author: 'CyberSec Solutions',
      downloads: 892,
      rating: 4.9,
      reviews: 34,
      tags: ['Security', 'Incident Response', 'SIEM', 'Automation'],
      complexity: 'Advanced',
      estimatedTime: '60 minutes',
      lastUpdated: '5 days ago',
      version: '1.8.0',
      featured: false,
      verified: true,
      price: '$49',
      thumbnail: '/api/placeholder/300/200',
      steps: 15,
      triggers: ['Security Alert', 'Anomaly Detection'],
      integrations: ['Splunk', 'PagerDuty', 'Jira']
    },
    {
      id: 5,
      name: 'E-commerce Order Processing',
      description: 'Complete order fulfillment workflow from payment to shipping notification',
      category: 'E-commerce',
      author: 'Commerce Hub',
      downloads: 2156,
      rating: 4.6,
      reviews: 123,
      tags: ['E-commerce', 'Orders', 'Inventory', 'Shipping'],
      complexity: 'Intermediate',
      estimatedTime: '25 minutes',
      lastUpdated: '1 day ago',
      version: '2.3.1',
      featured: true,
      verified: true,
      price: 'Free',
      thumbnail: '/api/placeholder/300/200',
      steps: 10,
      triggers: ['Order Placed', 'Payment Confirmed'],
      integrations: ['Shopify', 'PayPal', 'FedEx']
    },
    {
      id: 6,
      name: 'Social Media Campaign',
      description: 'Multi-platform social media posting and engagement tracking workflow',
      category: 'Marketing',
      author: 'Social Media Experts',
      downloads: 1678,
      rating: 4.5,
      reviews: 78,
      tags: ['Social Media', 'Content', 'Analytics', 'Scheduling'],
      complexity: 'Beginner',
      estimatedTime: '20 minutes',
      lastUpdated: '4 days ago',
      version: '1.4.0',
      featured: false,
      verified: true,
      price: '$19',
      thumbnail: '/api/placeholder/300/200',
      steps: 7,
      triggers: ['Content Ready', 'Schedule'],
      integrations: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn']
    }
  ];

  const generateFallbackMyWorkflows = () => [
    {
      id: 1,
      name: 'Custom Lead Scoring',
      description: 'Proprietary lead scoring algorithm with CRM integration',
      category: 'Sales',
      visibility: 'Private',
      downloads: 0,
      rating: 0,
      reviews: 0,
      tags: ['Lead Scoring', 'CRM', 'Sales'],
      complexity: 'Intermediate',
      estimatedTime: '35 minutes',
      lastUpdated: '2 hours ago',
      version: '1.0.0',
      featured: false,
      verified: false,
      price: 'Private',
      thumbnail: '/api/placeholder/300/200',
      steps: 14,
      triggers: ['Lead Created', 'Activity Updated'],
      integrations: ['HubSpot', 'Salesforce']
    },
    {
      id: 2,
      name: 'Inventory Alert System',
      description: 'Real-time inventory monitoring with automated reorder alerts',
      category: 'Operations',
      visibility: 'Public',
      downloads: 45,
      rating: 4.2,
      reviews: 8,
      tags: ['Inventory', 'Alerts', 'Automation'],
      complexity: 'Beginner',
      estimatedTime: '15 minutes',
      lastUpdated: '1 week ago',
      version: '1.2.0',
      featured: false,
      verified: false,
      price: 'Free',
      thumbnail: '/api/placeholder/300/200',
      steps: 6,
      triggers: ['Stock Level', 'Threshold'],
      integrations: ['ERP System', 'Email']
    }
  ];

  const generateFallbackCommunity = () => [
    {
      id: 1,
      name: 'Workflow Builders Community',
      description: 'Share and discover workflow templates with fellow automation enthusiasts',
      members: 12847,
      workflows: 2156,
      category: 'General',
      activity: 'Very Active',
      moderators: ['John Doe', 'Jane Smith'],
      rules: ['Be respectful', 'Share quality content', 'Help others'],
      recentActivity: [
        { user: 'Alex Chen', action: 'shared', item: 'API Testing Workflow', time: '2 hours ago' },
        { user: 'Sarah Wilson', action: 'commented on', item: 'Database Backup Template', time: '4 hours ago' },
        { user: 'Mike Johnson', action: 'liked', item: 'Email Campaign Automation', time: '6 hours ago' }
      ]
    },
    {
      id: 2,
      name: 'DevOps Automation Hub',
      description: 'Specialized community for DevOps and infrastructure automation workflows',
      members: 8934,
      workflows: 1456,
      category: 'DevOps',
      activity: 'Active',
      moderators: ['DevOps Master', 'Cloud Architect'],
      rules: ['Focus on DevOps', 'Test before sharing', 'Document thoroughly'],
      recentActivity: [
        { user: 'Tom Rodriguez', action: 'shared', item: 'Kubernetes Deployment', time: '1 hour ago' },
        { user: 'Lisa Park', action: 'updated', item: 'Docker Build Pipeline', time: '3 hours ago' },
        { user: 'Chris Lee', action: 'reviewed', item: 'Infrastructure as Code', time: '5 hours ago' }
      ]
    },
    {
      id: 3,
      name: 'Marketing Automation Experts',
      description: 'Community focused on marketing workflows, campaigns, and customer engagement',
      members: 6721,
      workflows: 987,
      category: 'Marketing',
      activity: 'Moderate',
      moderators: ['Marketing Guru', 'Campaign Expert'],
      rules: ['Marketing focus only', 'Respect privacy', 'Share insights'],
      recentActivity: [
        { user: 'Emma Davis', action: 'shared', item: 'Lead Nurturing Campaign', time: '2 hours ago' },
        { user: 'Ryan Miller', action: 'commented on', item: 'A/B Testing Workflow', time: '4 hours ago' },
        { user: 'Sophie Brown', action: 'liked', item: 'Customer Segmentation', time: '7 hours ago' }
      ]
    }
  ];

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      
      // Parallel API calls for comprehensive marketplace data
      const [templatesResponse, myWorkflowsResponse, communityResponse] = await Promise.all([
        fetch(`http://localhost:8001/api/workflow-marketplace/templates?category=${selectedCategory}&sort=${sortBy}&search=${searchQuery}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication header if available
            // 'Authorization': `Bearer ${token}`
          },
        }),
        fetch(`http://localhost:8001/api/workflow-marketplace/my-workflows`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch(`http://localhost:8001/api/workflow-marketplace/community`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (templatesResponse.ok && myWorkflowsResponse.ok && communityResponse.ok) {
        const [templatesData, myWorkflowsData, communityData] = await Promise.all([
          templatesResponse.json(),
          myWorkflowsResponse.json(),
          communityResponse.json()
        ]);

        setMarketplaceData({
          templates: templatesData.templates || [],
          myWorkflows: myWorkflowsData.workflows || [],
          community: communityData.communities || []
        });
        setDataSource(templatesData.data_source || 'database');
        
        if (templatesData.data_source === 'enhanced_fallback') {
          info('Using demo data - API unavailable');
        } else if (templatesData.data_source === 'database') {
          success('Workflow marketplace loaded successfully');
        }
      } else {
        throw new Error('Failed to load marketplace data');
      }
    } catch (err) {
      console.error('Error loading marketplace data:', err);
      error('Failed to load marketplace data');
      
      // Enhanced fallback data
      setMarketplaceData({
        templates: generateFallbackTemplates(),
        myWorkflows: generateFallbackMyWorkflows(),
        community: generateFallbackCommunity()
      });
      setDataSource('enhanced_fallback');
      warning('Using enhanced demo data - API unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMarketplace = useCallback(async () => {
    await loadMarketplaceData();
  }, [selectedCategory, sortBy, searchQuery]);

  const categories = ['all', 'DevOps', 'Marketing', 'Data Science', 'Security', 'E-commerce', 'Operations', 'Sales'];
  const complexityLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Updated' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'name', label: 'Name A-Z' }
  ];

  const toggleFavorite = (templateId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return newFavorites;
    });
  };

  const filteredTemplates = marketplaceData.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Featured Templates */}
      {sortedTemplates.some(t => t.featured) && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedTemplates.filter(template => template.featured).map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={template.price === 'Free' ? 'secondary' : 'default'}>
                        {template.price}
                      </Badge>
                      {template.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(template.id)}
                      className="p-1"
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {template.rating} ({template.reviews})
                      </span>
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {template.downloads.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Complexity:</span> {template.complexity}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {template.estimatedTime}
                      </div>
                      <div>
                        <span className="font-medium">Steps:</span> {template.steps}
                      </div>
                      <div>
                        <span className="font-medium">Version:</span> {template.version}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        by {template.author}
                      </span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Store className="h-5 w-5 mr-2" />
          All Templates ({sortedTemplates.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.price === 'Free' ? 'secondary' : 'default'}>
                      {template.price}
                    </Badge>
                    {template.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(template.id)}
                    className="p-1"
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {template.rating} ({template.reviews})
                    </span>
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {template.downloads.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Complexity:</span> {template.complexity}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {template.estimatedTime}
                    </div>
                    <div>
                      <span className="font-medium">Steps:</span> {template.steps}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {template.version}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      by {template.author}
                    </span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMyWorkflowsTab = () => (
    <div className="space-y-6">
      {/* My Workflows Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Workflows</h2>
          <p className="text-muted-foreground">Manage your created and shared workflow templates</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Workflow
        </Button>
      </div>

      {/* My Workflows Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{marketplaceData.myWorkflows.length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {marketplaceData.myWorkflows.reduce((sum, w) => sum + w.downloads, 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(marketplaceData.myWorkflows.reduce((sum, w) => sum + w.rating, 0) /
                    marketplaceData.myWorkflows.filter(w => w.rating > 0).length || 0).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Workflows</p>
                <p className="text-2xl font-bold">
                  {marketplaceData.myWorkflows.filter(w => w.visibility === 'Public').length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Workflows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceData.myWorkflows.map(workflow => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={workflow.visibility === 'Public' ? 'default' : 'secondary'}>
                    {workflow.visibility}
                  </Badge>
                  <Badge variant="outline">
                    {workflow.price}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription className="text-sm">{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.downloads > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {workflow.rating} ({workflow.reviews})
                    </span>
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {workflow.downloads.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {workflow.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Complexity:</span> {workflow.complexity}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {workflow.estimatedTime}
                  </div>
                  <div>
                    <span className="font-medium">Steps:</span> {workflow.steps}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span> {workflow.version}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Updated {workflow.lastUpdated}
                  </span>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Community Hub</h2>
          <p className="text-muted-foreground">Connect with workflow creators and share knowledge</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Join Community
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {marketplaceData.community.reduce((sum, c) => sum + c.members, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shared Workflows</p>
                <p className="text-2xl font-bold">
                  {marketplaceData.community.reduce((sum, c) => sum + c.workflows, 0).toLocaleString()}
                </p>
              </div>
              <Workflow className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Communities</p>
                <p className="text-2xl font-bold">{marketplaceData.community.length}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Activity</p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community List */}
      <div className="space-y-6">
        {marketplaceData.community.map(community => (
          <Card key={community.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {community.name}
                    <Badge variant="outline" className="ml-2">
                      {community.activity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{community.description}</CardDescription>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{community.members.toLocaleString()}</span> members
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{community.workflows.toLocaleString()}</span> workflows
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{community.category}</span> category
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {community.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>
                          <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                          <span className="text-blue-600">{activity.item}</span>
                        </span>
                        <span className="text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Moderated by {community.moderators.join(', ')}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Discuss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            Workflow Marketplace
            {dataSource === 'database' && (
              <Badge variant="outline" className="ml-3 text-green-600 border-green-600">
                <Database className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            )}
            {dataSource === 'enhanced_fallback' && (
              <Badge variant="outline" className="ml-3 text-orange-600 border-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Demo Data
              </Badge>
            )}
            {dataSource === 'loading' && (
              <Badge variant="outline" className="ml-3">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Discover, share, and collaborate on workflow templates with the community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={refreshMarketplace}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">
            <Store className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="myworkflows">
            <User className="h-4 w-4 mr-2" />
            My Workflows
          </TabsTrigger>
          <TabsTrigger value="community">
            <Users className="h-4 w-4 mr-2" />
            Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {renderTemplatesTab()}
        </TabsContent>

        <TabsContent value="myworkflows" className="space-y-4">
          {renderMyWorkflowsTab()}
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          {renderCommunityTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowMarketplace;