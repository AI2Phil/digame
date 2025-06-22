import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, 
  BarChart3, PieChart, TrendingUp, Clock, Target,
  Users, Activity, Zap, Eye, Share2, Printer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Calendar as CalendarComponent } from '../components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { Checkbox } from '../components/ui/Checkbox';
import { Separator } from '../components/ui/Separator';
import { Chart } from '../components/ui/Chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [selectedReports, setSelectedReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample report data
  const availableReports = [
    {
      id: 'productivity-summary',
      name: 'Productivity Summary',
      description: 'Overall productivity metrics and trends',
      type: 'productivity',
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      size: '2.3 MB',
      status: 'ready'
    },
    {
      id: 'time-tracking',
      name: 'Time Tracking Report',
      description: 'Detailed time allocation and activity breakdown',
      type: 'time',
      icon: Clock,
      lastGenerated: '2024-01-14',
      size: '1.8 MB',
      status: 'ready'
    },
    {
      id: 'goal-progress',
      name: 'Goal Progress Report',
      description: 'Progress tracking for all active goals',
      type: 'goals',
      icon: Target,
      lastGenerated: '2024-01-13',
      size: '1.2 MB',
      status: 'ready'
    },
    {
      id: 'team-analytics',
      name: 'Team Analytics',
      description: 'Team performance and collaboration metrics',
      type: 'team',
      icon: Users,
      lastGenerated: '2024-01-12',
      size: '3.1 MB',
      status: 'generating'
    },
    {
      id: 'activity-patterns',
      name: 'Activity Patterns',
      description: 'Daily and weekly activity pattern analysis',
      type: 'activity',
      icon: Activity,
      lastGenerated: '2024-01-11',
      size: '2.7 MB',
      status: 'ready'
    },
    {
      id: 'performance-insights',
      name: 'Performance Insights',
      description: 'AI-powered performance recommendations',
      type: 'insights',
      icon: Zap,
      lastGenerated: '2024-01-10',
      size: '1.5 MB',
      status: 'ready'
    }
  ];

  // Sample chart data
  const productivityData = [
    { name: 'Mon', productivity: 85, focus: 78, efficiency: 92 },
    { name: 'Tue', productivity: 92, focus: 88, efficiency: 85 },
    { name: 'Wed', productivity: 78, focus: 82, efficiency: 88 },
    { name: 'Thu', productivity: 88, focus: 85, efficiency: 90 },
    { name: 'Fri', productivity: 95, focus: 92, efficiency: 87 },
    { name: 'Sat', productivity: 72, focus: 68, efficiency: 75 },
    { name: 'Sun', productivity: 65, focus: 62, efficiency: 70 }
  ];

  const filteredReports = availableReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleGenerateReport = async (reportId) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Report ${reportId} generated successfully!`);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report) => {
    // Simulate download
    alert(`Downloading ${report.name}...`);
  };

  const handleBulkDownload = () => {
    if (selectedReports.length === 0) {
      alert('Please select reports to download');
      return;
    }
    alert(`Downloading ${selectedReports.length} reports...`);
  };

  const handleScheduleReport = (reportId) => {
    alert(`Schedule setup for report ${reportId} would be implemented here`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'generating':
        return <Badge variant="warning">Generating</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and manage your productivity reports</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBulkDownload} disabled={selectedReports.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Selected ({selectedReports.length})
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Create Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Configure a custom report with your preferred metrics and date range
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input placeholder="Enter report name" />
                </div>
                
                <div className="space-y-2">
                  <Label>Metrics to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Productivity Score', 'Time Tracking', 'Goal Progress', 'Focus Time', 'Break Patterns', 'Activity Levels'].map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox id={metric} />
                        <Label htmlFor={metric} className="text-sm">{metric}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  {/* TODO: This might need to be a controlled component if dialog state is managed */}
                  <Select defaultValue="last-30-days" onValueChange={(value) => console.log('Dialog date range changed:', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-90-days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter by Type */}
            <div className="w-full md:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="time">Time Tracking</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="insights">Insights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Available Reports</TabsTrigger>
          <TabsTrigger value="analytics">Quick Analytics</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Available Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {filteredReports.map((report) => {
              const IconComponent = report.icon;
              const isSelected = selectedReports.includes(report.id);
              
              return (
                <Card key={report.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReports([...selectedReports, report.id]);
                            } else {
                              setSelectedReports(selectedReports.filter(id => id !== report.id));
                            }
                          }}
                        />
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{report.name}</h3>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Last generated: {report.lastGenerated}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Size: {report.size}
                              </span>
                              {getStatusBadge(report.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={isGenerating || report.status === 'generating'}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {report.status === 'generating' ? 'Generating...' : 'Generate'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleScheduleReport(report.id)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Quick Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productivity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last week</p>
                <Progress value={87} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2h</div>
                <p className="text-xs text-muted-foreground">+0.8h from yesterday</p>
                <Progress value={78} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12/15</div>
                <p className="text-xs text-muted-foreground">80% completion rate</p>
                <Progress value={80} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92</div>
                <p className="text-xs text-muted-foreground">+5 points this week</p>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Productivity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Productivity Trends</CardTitle>
              <CardDescription>
                Your productivity, focus, and efficiency metrics over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                type="line"
                data={productivityData}
                config={{
                  productivity: { label: 'Productivity', color: '#3b82f6' },
                  focus: { label: 'Focus', color: '#10b981' },
                  efficiency: { label: 'Efficiency', color: '#f59e0b' }
                }}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage your automated report generation schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Generation</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Weekly Productivity Summary</TableCell>
                    <TableCell>Weekly</TableCell>
                    <TableCell>Jan 22, 2024</TableCell>
                    <TableCell>john.doe@example.com</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Pause</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Goal Progress</TableCell>
                    <TableCell>Monthly</TableCell>
                    <TableCell>Feb 1, 2024</TableCell>
                    <TableCell>team@example.com</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Pause</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;