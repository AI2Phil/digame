import React, { useState, useEffect } from 'react';
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/Tabs';
import {
  Button,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/components/ui';
import {
  Webhook,
  Clock,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  Code,
  Filter,
  Target,
  Timer,
  Bell,
  Link,
  Cpu,
  Monitor,
  FileText,
  GitBranch,
  Users,
  Mail,
  MessageSquare,
  Cloud,
  Server,
  Shield,
  Eye,
  Download,
  Upload,
  Save,
  Copy,
  ExternalLink,
  Info,
  Lightbulb,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Network,
  Workflow,
  Boxes,
  Cog,
  Power,
  PlayCircle,
  StopCircle,
  RotateCcw,
  FastForward,
  SkipForward,
  Repeat,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Star,
  Heart,
  Smile,
  Home,
  MapPin,
  Car,
  Plane,
  Phone,
  Camera,
  Music,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Package,
import {
  Box,
  Grid,
  List,
  Table,
  Chart,
  Graph,
  Map,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer as TimerIcon,
  Stopwatch,
  Alarm,
  Hourglass,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Umbrella,
  Snowflake,
  Flame,
  Droplet,
  Leaf,
  Tree,
  Flower,
  Seed,
  Sprout,
  Branch,
  Root,
  Fruit,
  Apple,
  Orange,
  Banana,
  Grape,
  Cherry,
  Strawberry,
  Lemon,
  Lime,
  Peach,
  Pear,
  Pineapple,
  Watermelon,
  Melon,
  Kiwi,
  Mango,
  Papaya,
  Coconut,
  Avocado,
  Tomato,
  Potato,
  Carrot,
  Onion,
  Garlic,
  Pepper,
  Cucumber,
  Lettuce,
  Spinach,
  Broccoli,
  Cauliflower,
  Cabbage,
  Corn,
  Peas,
  Beans,
  Rice,
  Wheat,
  Bread,
  Cheese,
  Milk,
  Egg,
  Meat,
  Fish,
  Chicken,
  Beef,
  Pork,
  Lamb,
  Turkey,
  Duck,
  Salmon,
  Tuna,
  Shrimp,
  Crab,
  Lobster,
  Oyster,
  Clam,
  Mussel,
  Squid,
  Octopus,
  Jellyfish,
  Shark,
  Whale,
  Dolphin,
  Seal,
  Penguin,
  Eagle,
  Hawk,
  Owl,
  Parrot,
  Peacock,
  Swan,
  Duck as DuckIcon,
  Goose,
  Chicken as ChickenIcon,
  Rooster,
  Turkey as TurkeyIcon,
  Ostrich,
  Flamingo,
  Pelican,
  Stork,
  Crane,
  Heron,
  Kingfisher,
  Woodpecker,
  Robin,
  Sparrow,
  Canary,
  Finch,
  Cardinal,
  BlueBird,
  Crow,
  Raven,
  Magpie,
  Jay,
  Pigeon,
  Dove,
  Hummingbird,
  Swallow,
  Swift,
  Martin,
  Lark,
  Nightingale,
  Thrush,
  Blackbird,
  Starling,
  Wren,
  Tit,
  Nuthatch,
  Treecreeper,
  Wagtail,
  Pipit,
  Bunting,
  Warbler,
  Flycatcher,
  Shrike,
  Vireo,
  Tanager,
  Grosbeak,
  Oriole,
  Blackbird as BlackbirdIcon,
  Grackle,
  Cowbird,
  Bobolink,
  Meadowlark,
  Redwing,
  Yellowhammer,
  Siskin,
  Goldfinch,
  Greenfinch,
  Linnet,
  Twite,
  Redpoll,
  Crossbill,
  Bullfinch,
  Hawfinch,
  Brambling,
  Chaffinch,
  Serin,
  Canary as CanaryIcon,
  Goldcrest,
  Firecrest,
  Wren as WrenIcon,
  Dipper,
  Nuthatch as NuthatchIcon,
  Treecreeper as TreecreeperIcon,
  Wallcreeper,
  Tichodroma,
  Certhia,
  Sitta,
  Poecile,
  Lophophanes,
  Periparus,
  Cyanistes,
  Parus,
  Aegithalos,
  Panurus,
  Remiz,
  Hirundo,
  Delichon,
  Riparia,
  Ptyonoprogne,
  Cecropis,
  Petrochelidon,
  Atticora,
  Neochelidon,
  Alopochelidon,
  Pygochelidon,
  Orochelidon,
  Haplochelidon,
  Atticora as AtticoraIcon,
  Progne,
  Tachycineta,
  Iridoprocne,
  Kalochelidon,
  Psalidoprocne,
  Pseudhirundo,
  Cheramoeca,
  Pseudochelidon,
  Eurochelidon,
  Ptyonoprogne as PtyonoprogneIcon
} from 'lucide-react';

const EnhancedWorkflowTriggers = () => {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [isLoading, setIsLoading] = useState(false);
  const [triggers, setTriggers] = useState({
    webhooks: [],
    schedules: [],
    events: [],
    conditions: []
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    setTriggers({
      webhooks: [
        {
          id: 1,
          name: 'GitHub Push Webhook',
          url: 'https://api.digame.ai/webhooks/github-push',
          method: 'POST',
          status: 'active',
          lastTriggered: '2 minutes ago',
          triggerCount: 47,
          workflows: ['Deploy to Staging', 'Run Tests'],
          headers: { 'X-GitHub-Event': 'push' },
          security: 'HMAC-SHA256'
        },
        {
          id: 2,
          name: 'Slack Command Webhook',
          url: 'https://api.digame.ai/webhooks/slack-command',
          method: 'POST',
          status: 'active',
          lastTriggered: '15 minutes ago',
          triggerCount: 23,
          workflows: ['Create Support Ticket', 'Generate Report'],
          headers: { 'Content-Type': 'application/json' },
          security: 'Bearer Token'
        },
        {
          id: 3,
          name: 'Payment Processing Webhook',
          url: 'https://api.digame.ai/webhooks/payment',
          method: 'POST',
          status: 'paused',
          lastTriggered: '2 hours ago',
          triggerCount: 156,
          workflows: ['Process Payment', 'Send Receipt', 'Update Inventory'],
          headers: { 'X-Stripe-Event': 'payment_intent.succeeded' },
          security: 'Webhook Secret'
        }
      ],
      schedules: [
        {
          id: 1,
          name: 'Daily Data Backup',
          schedule: '0 2 * * *',
          timezone: 'UTC',
          status: 'active',
          nextRun: 'Tomorrow at 2:00 AM',
          lastRun: 'Today at 2:00 AM',
          workflows: ['Backup Database', 'Sync to Cloud'],
          type: 'cron',
          description: 'Automated daily backup of all critical data'
        },
        {
          id: 2,
          name: 'Weekly Report Generation',
          schedule: '0 9 * * 1',
          timezone: 'America/New_York',
          status: 'active',
          nextRun: 'Monday at 9:00 AM EST',
          lastRun: 'Last Monday at 9:00 AM EST',
          workflows: ['Generate Analytics Report', 'Email to Stakeholders'],
          type: 'cron',
          description: 'Weekly performance and analytics report'
        },
        {
          id: 3,
          name: 'Hourly Health Check',
          schedule: '0 * * * *',
          timezone: 'UTC',
          status: 'active',
          nextRun: 'In 23 minutes',
          lastRun: '37 minutes ago',
          workflows: ['System Health Check', 'Alert if Issues'],
          type: 'interval',
          description: 'Continuous system monitoring and alerting'
        }
      ],
      events: [
        {
          id: 1,
          name: 'User Registration Event',
          eventType: 'user.created',
          source: 'Authentication Service',
          status: 'active',
          lastTriggered: '5 minutes ago',
          triggerCount: 12,
          workflows: ['Send Welcome Email', 'Create User Profile', 'Setup Defaults'],
          filters: { 'user.plan': 'premium' },
          description: 'Triggered when a new premium user registers'
        },
        {
          id: 2,
          name: 'File Upload Event',
          eventType: 'file.uploaded',
          source: 'Storage Service',
          status: 'active',
          lastTriggered: '1 hour ago',
          triggerCount: 89,
          workflows: ['Virus Scan', 'Generate Thumbnail', 'Index Content'],
          filters: { 'file.size': '>10MB' },
          description: 'Process large file uploads automatically'
        },
        {
          id: 3,
          name: 'Error Alert Event',
          eventType: 'system.error',
          source: 'Monitoring Service',
          status: 'active',
          lastTriggered: '3 hours ago',
          triggerCount: 7,
          workflows: ['Create Incident', 'Notify On-Call', 'Auto-Remediate'],
          filters: { 'error.severity': 'critical' },
          description: 'Immediate response to critical system errors'
        }
      ],
      conditions: [
        {
          id: 1,
          name: 'High CPU Usage Condition',
          condition: 'cpu_usage > 80%',
          evaluationInterval: '1 minute',
          status: 'active',
          lastTriggered: 'Never',
          triggerCount: 0,
          workflows: ['Scale Resources', 'Alert DevOps'],
          threshold: '80%',
          description: 'Auto-scale when CPU usage exceeds threshold'
        },
        {
          id: 2,
          name: 'Low Disk Space Condition',
          condition: 'disk_usage > 90%',
          evaluationInterval: '5 minutes',
          status: 'active',
          lastTriggered: '2 days ago',
          triggerCount: 3,
          workflows: ['Cleanup Temp Files', 'Archive Old Logs', 'Alert Admin'],
          threshold: '90%',
          description: 'Automated cleanup when disk space is low'
        },
        {
          id: 3,
          name: 'Failed Login Attempts',
          condition: 'failed_logins > 5 in 10 minutes',
          evaluationInterval: '1 minute',
          status: 'active',
          lastTriggered: '6 hours ago',
          triggerCount: 15,
          workflows: ['Block IP Address', 'Send Security Alert', 'Log Incident'],
          threshold: '5 attempts',
          description: 'Security response to potential brute force attacks'
        }
      ]
    });
  }, []);

  const refreshTriggers = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const toggleTriggerStatus = (triggerType, triggerId) => {
    setTriggers(prev => ({
      ...prev,
      [triggerType]: prev[triggerType].map(trigger =>
        trigger.id === triggerId
          ? { ...trigger, status: trigger.status === 'active' ? 'paused' : 'active' }
          : trigger
      )
    }));
  };

  const deleteTrigger = (triggerType, triggerId) => {
    setTriggers(prev => ({
      ...prev,
      [triggerType]: prev[triggerType].filter(trigger => trigger.id !== triggerId)
    }));
  };

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      {/* Webhooks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Webhooks</p>
                <p className="text-2xl font-bold">{triggers.webhooks.filter(w => w.status === 'active').length}</p>
              </div>
              <Webhook className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Triggers Today</p>
                <p className="text-2xl font-bold">226</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">98.7%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">127ms</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Triggers</CardTitle>
              <CardDescription>HTTP endpoints that trigger workflows when called</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      webhook.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Webhook className={`h-5 w-5 ${
                        webhook.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{webhook.name}</h3>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                      {webhook.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTriggerStatus('webhooks', webhook.id)}
                    >
                      {webhook.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTrigger('webhooks', webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Method & Security</p>
                    <p className="text-sm text-muted-foreground">{webhook.method} • {webhook.security}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Triggered</p>
                    <p className="text-sm text-muted-foreground">{webhook.lastTriggered}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Triggers</p>
                    <p className="text-sm text-muted-foreground">{webhook.triggerCount}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Connected Workflows</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.workflows.map((workflow, index) => (
                      <Badge key={index} variant="outline">{workflow}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Headers:</span> {Object.keys(webhook.headers).length} configured
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      {/* Schedules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">{triggers.schedules.filter(s => s.status === 'active').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Executions Today</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Execution</p>
                <p className="text-2xl font-bold">23m</p>
              </div>
              <Timer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">99.2%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scheduled Triggers</CardTitle>
              <CardDescription>Time-based workflow execution using cron expressions</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      schedule.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        schedule.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{schedule.name}</h3>
                      <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                      {schedule.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTriggerStatus('schedules', schedule.id)}
                    >
                      {schedule.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTrigger('schedules', schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Schedule Expression</p>
                    <p className="text-sm text-muted-foreground font-mono">{schedule.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Run</p>
                    <p className="text-sm text-muted-foreground">{schedule.nextRun}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Run</p>
                    <p className="text-sm text-muted-foreground">{schedule.lastRun}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Connected Workflows</p>
                  <div className="flex flex-wrap gap-2">
                    {schedule.workflows.map((workflow, index) => (
                      <Badge key={index} variant="outline">{workflow}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {schedule.type} • 
                    <span className="font-medium"> Timezone:</span> {schedule.timezone}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      {/* Events Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Event Triggers</p>
                <p className="text-2xl font-bold">{triggers.events.filter(e => e.status === 'active').length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events Today</p>
                <p className="text-2xl font-bold">108</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Rate</p>
                <p className="text-2xl font-bold">99.1%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold">89ms</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event-Based Triggers</CardTitle>
              <CardDescription>Workflows triggered by system events and external notifications</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event Trigger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.status === 'active' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        event.status === 'active' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTriggerStatus('events', event.id)}
                    >
                      {event.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTrigger('events', event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Event Type & Source</p>
                    <p className="text-sm text-muted-foreground">{event.eventType} • {event.source}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Triggered</p>
                    <p className="text-sm text-muted-foreground">{event.lastTriggered}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Triggers</p>
                    <p className="text-sm text-muted-foreground">{event.triggerCount}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Connected Workflows</p>
                  <div className="flex flex-wrap gap-2">
                    {event.workflows.map((workflow, index) => (
                      <Badge key={index} variant="outline">{workflow}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Filters:</span> {Object.keys(event.filters).length} configured
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Edit Filters
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Events
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConditionsTab = () => (
    <div className="space-y-6">
      {/* Conditions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Conditions</p>
                <p className="text-2xl font-bold">{triggers.conditions.filter(c => c.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Evaluations Today</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conditions Met</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Evaluation Time</p>
                <p className="text-2xl font-bold">12ms</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conditional Triggers</CardTitle>
              <CardDescription>Workflows triggered when specific conditions are met</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.conditions.map((condition) => (
              <div key={condition.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      condition.status === 'active' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Target className={`h-5 w-5 ${
                        condition.status === 'active' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{condition.name}</h3>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={condition.status === 'active' ? 'default' : 'secondary'}>
                      {condition.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTriggerStatus('conditions', condition.id)}
                    >
                      {condition.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTrigger('conditions', condition.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Condition Expression</p>
                    <p className="text-sm text-muted-foreground font-mono">{condition.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Evaluation Interval</p>
                    <p className="text-sm text-muted-foreground">{condition.evaluationInterval}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Triggered</p>
                    <p className="text-sm text-muted-foreground">{condition.lastTriggered}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Connected Workflows</p>
                  <div className="flex flex-wrap gap-2">
                    {condition.workflows.map((workflow, index) => (
                      <Badge key={index} variant="outline">{workflow}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Threshold:</span> {condition.threshold} •
                    <span className="font-medium"> Triggers:</span> {condition.triggerCount}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Metrics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Test Condition
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Workflow Triggers</h1>
          <p className="text-muted-foreground">
            Comprehensive trigger management for webhook, schedule, event, and condition-based workflow automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshTriggers} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Clock className="h-4 w-4 mr-2" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="events">
            <Zap className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="conditions">
            <Target className="h-4 w-4 mr-2" />
            Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {renderWebhooksTab()}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          {renderSchedulesTab()}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {renderEventsTab()}
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {renderConditionsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWorkflowTriggers;