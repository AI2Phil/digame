import React, { useState } from 'react';
import { 
  Search, Book, MessageCircle, Mail, Phone, 
  ChevronRight, ExternalLink, Download, Star,
  HelpCircle, FileText, Video, Headphones,
  Users, Settings, BarChart3, Target, Clock,
  Zap, Shield, Globe, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import { Separator } from '../components/ui/Separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/Command';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Help categories and articles
  const helpCategories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      articles: [
        { id: '1', title: 'Welcome to Digame', type: 'guide', readTime: '5 min', rating: 4.8 },
        { id: '2', title: 'Setting up your first goals', type: 'tutorial', readTime: '10 min', rating: 4.9 },
        { id: '3', title: 'Understanding the dashboard', type: 'guide', readTime: '8 min', rating: 4.7 },
        { id: '4', title: 'Quick start checklist', type: 'checklist', readTime: '3 min', rating: 4.6 }
      ]
    },
    {
      id: 'productivity',
      name: 'Productivity Features',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      articles: [
        { id: '5', title: 'Time tracking best practices', type: 'guide', readTime: '12 min', rating: 4.8 },
        { id: '6', title: 'Setting SMART goals', type: 'tutorial', readTime: '15 min', rating: 4.9 },
        { id: '7', title: 'Using focus sessions', type: 'guide', readTime: '7 min', rating: 4.7 },
        { id: '8', title: 'Break reminders and wellness', type: 'guide', readTime: '6 min', rating: 4.5 }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      articles: [
        { id: '9', title: 'Understanding your productivity score', type: 'guide', readTime: '10 min', rating: 4.8 },
        { id: '10', title: 'Generating custom reports', type: 'tutorial', readTime: '12 min', rating: 4.7 },
        { id: '11', title: 'Interpreting analytics data', type: 'guide', readTime: '15 min', rating: 4.6 },
        { id: '12', title: 'Sharing reports with your team', type: 'tutorial', readTime: '8 min', rating: 4.5 }
      ]
    },
    {
      id: 'team',
      name: 'Team Collaboration',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      articles: [
        { id: '13', title: 'Inviting team members', type: 'tutorial', readTime: '5 min', rating: 4.9 },
        { id: '14', title: 'Team productivity insights', type: 'guide', readTime: '10 min', rating: 4.7 },
        { id: '15', title: 'Managing team permissions', type: 'guide', readTime: '8 min', rating: 4.6 },
        { id: '16', title: 'Collaborative goal setting', type: 'tutorial', readTime: '12 min', rating: 4.8 }
      ]
    },
    {
      id: 'settings',
      name: 'Settings & Customization',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      articles: [
        { id: '17', title: 'Personalizing your workspace', type: 'guide', readTime: '7 min', rating: 4.5 },
        { id: '18', title: 'Notification preferences', type: 'tutorial', readTime: '5 min', rating: 4.6 },
        { id: '19', title: 'Privacy and security settings', type: 'guide', readTime: '10 min', rating: 4.8 },
        { id: '20', title: 'Data export and backup', type: 'tutorial', readTime: '8 min', rating: 4.4 }
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      icon: Smartphone,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      articles: [
        { id: '21', title: 'Installing the mobile app', type: 'tutorial', readTime: '3 min', rating: 4.9 },
        { id: '22', title: 'Syncing data across devices', type: 'guide', readTime: '6 min', rating: 4.7 },
        { id: '23', title: 'Mobile notifications setup', type: 'tutorial', readTime: '5 min', rating: 4.6 },
        { id: '24', title: 'Offline mode features', type: 'guide', readTime: '8 min', rating: 4.5 }
      ]
    }
  ];

  // FAQ data
  const faqData = [
    {
      question: 'How do I get started with Digame?',
      answer: 'Getting started is easy! First, complete the onboarding process to set up your profile and initial goals. Then, explore the dashboard to familiarize yourself with the interface. We recommend starting with time tracking and setting 2-3 simple goals to begin building your productivity habits.'
    },
    {
      question: 'Can I use Digame on multiple devices?',
      answer: 'Yes! Digame syncs your data across all your devices. You can access your account from any web browser, and we also offer mobile apps for iOS and Android. All your data, goals, and progress will be automatically synchronized.'
    },
    {
      question: 'How is my productivity score calculated?',
      answer: 'Your productivity score is calculated using a combination of factors including time spent on focused work, goal completion rate, consistency of habits, and overall activity patterns. The algorithm adapts to your personal work style and improves its accuracy over time.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Absolutely. We take data security very seriously. All data is encrypted in transit and at rest, we never share your personal information with third parties, and you have full control over your data including the ability to export or delete it at any time.'
    },
    {
      question: 'Can I collaborate with my team?',
      answer: 'Yes! Digame offers robust team collaboration features. You can invite team members, share goals, view team productivity insights, and generate collaborative reports. Team admins can manage permissions and access levels for different members.'
    },
    {
      question: 'What happens if I forget my password?',
      answer: 'If you forget your password, click the "Forgot Password" link on the login page. We\'ll send you a secure reset link via email. For additional security, you can also enable two-factor authentication in your account settings.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. Go to Settings > Billing > Cancel Subscription. Your account will remain active until the end of your current billing period, and you\'ll retain access to all your data.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data at any time. Go to Settings > Privacy & Security > Export Data. You\'ll receive a comprehensive file containing all your goals, time tracking data, reports, and settings in a standard format.'
    }
  ];

  // Contact options
  const contactOptions = [
    {
      type: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      available: true,
      responseTime: 'Usually responds in minutes'
    },
    {
      type: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'Send Email',
      available: true,
      responseTime: 'Usually responds within 24 hours'
    },
    {
      type: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      action: 'Call Now',
      available: false,
      responseTime: 'Available Mon-Fri 9AM-5PM PST'
    },
    {
      type: 'Video Call',
      description: 'Schedule a screen-sharing session',
      icon: Video,
      action: 'Schedule Call',
      available: true,
      responseTime: 'Available for premium users'
    }
  ];

  // Filter articles based on search and category
  const filteredArticles = helpCategories.flatMap(category => 
    category.articles.map(article => ({ ...article, category: category.name, categoryId: category.id }))
  ).filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactAction = (type) => {
    switch (type) {
      case 'Live Chat':
        alert('Live chat would open here');
        break;
      case 'Email Support':
        window.location.href = 'mailto:support@digame.com';
        break;
      case 'Phone Support':
        alert('Phone support is currently unavailable');
        break;
      case 'Video Call':
        alert('Video call scheduling would open here');
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Find answers, get support, and learn how to make the most of Digame
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, and tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {contactOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card key={option.type} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{option.type}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                  <Button
                    variant={option.available ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleContactAction(option.type)}
                    disabled={!option.available}
                    className="w-full"
                  >
                    {option.action}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">{option.responseTime}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Help</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Video Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        {/* Browse Help */}
        <TabsContent value="browse" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {helpCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Search Results or Categories */}
          {searchTerm ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Search Results ({filteredArticles.length})
              </h2>
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or browse our help categories below.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{article.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{article.type}</span>
                              <span>{article.readTime}</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                <span>{article.rating}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {helpCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.bgColor}`}>
                          <IconComponent className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div>
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription>
                            {category.articles.length} articles
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {category.articles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{article.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="capitalize">{article.type}</span>
                                <span>{article.readTime}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                                  <span>{article.rating}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to the most common questions about Digame
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Guides */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with Digame', duration: '5:32', views: '12.5K', thumbnail: '/api/placeholder/300/200' },
              { title: 'Setting Up Your First Goals', duration: '8:15', views: '9.2K', thumbnail: '/api/placeholder/300/200' },
              { title: 'Understanding Analytics', duration: '12:45', views: '7.8K', thumbnail: '/api/placeholder/300/200' },
              { title: 'Team Collaboration Features', duration: '10:20', views: '6.1K', thumbnail: '/api/placeholder/300/200' },
              { title: 'Mobile App Overview', duration: '6:55', views: '8.9K', thumbnail: '/api/placeholder/300/200' },
              { title: 'Advanced Settings Guide', duration: '15:30', views: '4.3K', thumbnail: '/api/placeholder/300/200' }
            ].map((video, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{video.duration}</span>
                    <span>{video.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Support */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Describe your issue and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md">
                    <option>General Question</option>
                    <option>Technical Issue</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                    <option>Bug Report</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>
                
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Support Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="mr-2 h-4 w-4" />
                    User Manual
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Community Forum
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Download Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>API Status</span>
                      <Badge variant="success">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge variant="success">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mobile Apps</span>
                      <Badge variant="success">Operational</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Status Page
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage;