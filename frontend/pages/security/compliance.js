import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download, 
  Upload, 
  Settings, 
  Users,
  Database,
  Lock,
  Eye,
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", size = "default", variant = "default", onClick, disabled }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8"
  };
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700",
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const ComplianceCenter = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      overallScore: 87,
      totalFrameworks: 6,
      compliantFrameworks: 4,
      pendingActions: 23,
      lastAssessment: "2024-03-10T14:30:00",
      nextAudit: "2024-06-15T09:00:00",
      certificationsActive: 8
    },
    frameworks: [
      {
        id: 1,
        name: "GDPR",
        fullName: "General Data Protection Regulation",
        description: "EU data protection and privacy regulation",
        status: "compliant",
        score: 94,
        lastAssessment: "2024-03-01T10:00:00",
        nextReview: "2024-06-01T10:00:00",
        requirements: 156,
        compliantRequirements: 147,
        pendingActions: 3,
        riskLevel: "low",
        region: "EU",
        mandatory: true
      },
      {
        id: 2,
        name: "SOX",
        fullName: "Sarbanes-Oxley Act",
        description: "Financial reporting and corporate governance",
        status: "compliant",
        score: 91,
        lastAssessment: "2024-02-15T14:00:00",
        nextReview: "2024-05-15T14:00:00",
        requirements: 89,
        compliantRequirements: 81,
        pendingActions: 2,
        riskLevel: "low",
        region: "US",
        mandatory: true
      },
      {
        id: 3,
        name: "HIPAA",
        fullName: "Health Insurance Portability and Accountability Act",
        description: "Healthcare data protection standards",
        status: "partial",
        score: 78,
        lastAssessment: "2024-02-28T11:00:00",
        nextReview: "2024-04-28T11:00:00",
        requirements: 67,
        compliantRequirements: 52,
        pendingActions: 8,
        riskLevel: "medium",
        region: "US",
        mandatory: false
      },
      {
        id: 4,
        name: "ISO 27001",
        fullName: "Information Security Management",
        description: "International information security standard",
        status: "compliant",
        score: 89,
        lastAssessment: "2024-03-05T09:00:00",
        nextReview: "2024-09-05T09:00:00",
        requirements: 114,
        compliantRequirements: 101,
        pendingActions: 4,
        riskLevel: "low",
        region: "Global",
        mandatory: false
      },
      {
        id: 5,
        name: "PCI DSS",
        fullName: "Payment Card Industry Data Security Standard",
        description: "Credit card data protection requirements",
        status: "non-compliant",
        score: 65,
        lastAssessment: "2024-01-20T13:00:00",
        nextReview: "2024-04-20T13:00:00",
        requirements: 78,
        compliantRequirements: 51,
        pendingActions: 12,
        riskLevel: "high",
        region: "Global",
        mandatory: true
      },
      {
        id: 6,
        name: "CCPA",
        fullName: "California Consumer Privacy Act",
        description: "California privacy rights and consumer protection",
        status: "partial",
        score: 82,
        lastAssessment: "2024-02-10T16:00:00",
        nextReview: "2024-05-10T16:00:00",
        requirements: 45,
        compliantRequirements: 37,
        pendingActions: 3,
        riskLevel: "medium",
        region: "US-CA",
        mandatory: true
      }
    ],
    actions: [
      {
        id: 1,
        framework: "PCI DSS",
        title: "Implement Network Segmentation",
        description: "Isolate cardholder data environment from other networks",
        priority: "high",
        dueDate: "2024-04-01T00:00:00",
        assignee: "Security Team",
        status: "in_progress",
        estimatedEffort: "40 hours",
        requirement: "Req 1.3.1"
      },
      {
        id: 2,
        framework: "HIPAA",
        title: "Update Data Encryption Policies",
        description: "Ensure all PHI is encrypted at rest and in transit",
        priority: "high",
        dueDate: "2024-03-25T00:00:00",
        assignee: "IT Security",
        status: "pending",
        estimatedEffort: "24 hours",
        requirement: "164.312(a)(2)(iv)"
      },
      {
        id: 3,
        framework: "GDPR",
        title: "Data Retention Policy Review",
        description: "Review and update data retention schedules",
        priority: "medium",
        dueDate: "2024-04-15T00:00:00",
        assignee: "Legal Team",
        status: "pending",
        estimatedEffort: "16 hours",
        requirement: "Art. 5(1)(e)"
      },
      {
        id: 4,
        framework: "ISO 27001",
        title: "Security Awareness Training",
        description: "Conduct quarterly security awareness training",
        priority: "medium",
        dueDate: "2024-03-30T00:00:00",
        assignee: "HR Department",
        status: "scheduled",
        estimatedEffort: "8 hours",
        requirement: "A.7.2.2"
      }
    ],
    reports: [
      {
        id: 1,
        name: "GDPR Compliance Report Q1 2024",
        framework: "GDPR",
        type: "quarterly",
        generatedDate: "2024-03-01T10:00:00",
        status: "completed",
        score: 94,
        fileSize: "2.4 MB"
      },
      {
        id: 2,
        name: "SOX Controls Assessment",
        framework: "SOX",
        type: "annual",
        generatedDate: "2024-02-15T14:00:00",
        status: "completed",
        score: 91,
        fileSize: "5.1 MB"
      },
      {
        id: 3,
        name: "ISO 27001 Gap Analysis",
        framework: "ISO 27001",
        type: "assessment",
        generatedDate: "2024-03-05T09:00:00",
        status: "completed",
        score: 89,
        fileSize: "3.7 MB"
      }
    ],
    analytics: {
      complianceHistory: [
        { month: "Jan", score: 82 },
        { month: "Feb", score: 85 },
        { month: "Mar", score: 87 }
      ],
      frameworkScores: [
        { framework: "GDPR", score: 94, trend: "up" },
        { framework: "SOX", score: 91, trend: "stable" },
        { framework: "ISO 27001", score: 89, trend: "up" },
        { framework: "CCPA", score: 82, trend: "up" },
        { framework: "HIPAA", score: 78, trend: "down" },
        { framework: "PCI DSS", score: 65, trend: "down" }
      ],
      riskDistribution: {
        low: 4,
        medium: 2,
        high: 1,
        critical: 0
      }
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleGenerateReport = (frameworkId) => {
    console.log('Generating compliance report for framework:', frameworkId);
  };

  const handleActionUpdate = (actionId, status) => {
    console.log('Updating action:', actionId, 'to status:', status);
  };

  const handleFrameworkAssessment = (frameworkId) => {
    console.log('Starting assessment for framework:', frameworkId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case 'stable': return <div className="w-3 h-0.5 bg-blue-600" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
            <p className="text-gray-600 mt-2">Monitor and manage regulatory compliance across all frameworks</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="mt-6">
          <Card className={`${currentData.overview.overallScore >= 85 ? 'bg-green-50 border-green-200' : currentData.overview.overallScore >= 70 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentData.overview.overallScore >= 85 ? 'bg-green-100' : currentData.overview.overallScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    <Shield className={`h-8 w-8 ${currentData.overview.overallScore >= 85 ? 'text-green-600' : currentData.overview.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Overall Compliance Score</h2>
                    <p className="text-gray-600">
                      {currentData.overview.compliantFrameworks} of {currentData.overview.totalFrameworks} frameworks compliant
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-bold ${getScoreColor(currentData.overview.overallScore)}`}>
                    {currentData.overview.overallScore}
                  </div>
                  <div className="text-lg text-gray-600">/ 100</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentData.overview.compliantFrameworks}</div>
          <div className="text-sm text-gray-600">Compliant</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{currentData.overview.totalFrameworks - currentData.overview.compliantFrameworks}</div>
          <div className="text-sm text-gray-600">Non-Compliant</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{currentData.overview.pendingActions}</div>
          <div className="text-sm text-gray-600">Pending Actions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.overview.certificationsActive}</div>
          <div className="text-sm text-gray-600">Certifications</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.ceil((new Date(currentData.overview.nextAudit) - new Date()) / (1000 * 60 * 60 * 24))}</div>
          <div className="text-sm text-gray-600">Days to Audit</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{currentData.reports.length}</div>
          <div className="text-sm text-gray-600">Reports</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'frameworks', label: 'Frameworks', icon: FileText },
            { id: 'actions', label: 'Action Items', icon: Clock },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Framework Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Framework Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.frameworks.slice(0, 4).map((framework) => (
                  <div key={framework.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(framework.status)}>
                        {framework.status}
                      </Badge>
                      <span className="font-medium">{framework.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(framework.score)}`}>
                        {framework.score}%
                      </span>
                      {getTrendIcon(framework.score >= 85 ? 'up' : framework.score >= 70 ? 'stable' : 'down')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.actions.slice(0, 4).map((action) => (
                  <div key={action.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-gray-600">{action.framework}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'frameworks' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Frameworks</option>
              <option value="compliant">Compliant</option>
              <option value="partial">Partial Compliance</option>
              <option value="non-compliant">Non-Compliant</option>
            </select>
          </div>

          {/* Frameworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentData.frameworks.map((framework) => (
              <Card key={framework.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{framework.name}</h3>
                          {framework.mandatory && (
                            <Badge variant="destructive" className="text-xs">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{framework.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{framework.description}</p>
                      </div>
                      <Badge className={getStatusColor(framework.status)}>
                        {framework.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className={`font-bold ${getScoreColor(framework.score)}`}>
                          {framework.score}%
                        </span>
                      </div>
                      <Progress value={framework.score} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Requirements</div>
                        <div className="font-medium">
                          {framework.compliantRequirements}/{framework.requirements}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Pending Actions</div>
                        <div className="font-medium">{framework.pendingActions}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Risk Level</div>
                        <Badge className={getRiskColor(framework.riskLevel)} variant="outline">
                          {framework.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-gray-600">Region</div>
                        <div className="font-medium">{framework.region}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Last assessment: {new Date(framework.lastAssessment).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleFrameworkAssessment(framework.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Assess
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateReport(framework.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {currentData.actions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{action.title}</h4>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority} priority
                      </Badge>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Framework</div>
                        <div className="font-medium">{action.framework}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Due Date</div>
                        <div className="font-medium">{new Date(action.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Assignee</div>
                        <div className="font-medium">{action.assignee}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Effort</div>
                        <div className="font-medium">{action.estimatedEffort}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Requirement: {action.requirement}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => handleActionUpdate(action.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {currentData.reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{report.name}</h4>
                      <div className="flex items-center gap-3 mt-1 mb-2">
                        <Badge variant="outline">{report.framework}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Generated</div>
                          <div className="font-medium">{new Date(report.generatedDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Score</div>
                          <div className={`font-medium ${getScoreColor(report.score)}`}>{report.score}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">File Size</div>
                          <div className="font-medium">{report.fileSize}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Type</div>
                          <div className="font-medium capitalize">{report.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Score Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.analytics.frameworkScores.map((framework, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{framework.framework}</span>
                      {getTrendIcon(framework.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${framework.score}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getScoreColor(framework.score)}`}>
                        {framework.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.riskDistribution.low}</div>
                  <div className="text-sm text-gray-600">Low Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{currentData.analytics.riskDistribution.medium}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.analytics.riskDistribution.high}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentData.analytics.riskDistribution.critical}</div>
                  <div className="text-sm text-gray-600">Critical Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Compliance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  Compliance score trend over the last 3 months
                </div>
                <div className="flex items-end justify-center gap-8 h-32">
                  {currentData.analytics.complianceHistory.map((month, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-600 rounded-t w-8 transition-all duration-300"
                        style={{ height: `${month.score}px` }}
                      />
                      <div className="text-xs text-gray-600 mt-2">{month.month}</div>
                      <div className="text-xs font-medium">{month.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComplianceCenter;