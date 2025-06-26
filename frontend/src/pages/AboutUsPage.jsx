import React from 'react';
import { 
  Award, Users, Target, Zap, Heart, Globe, 
  Linkedin, Twitter, Mail, ExternalLink,
  TrendingUp, Shield, Clock, Lightbulb,
  Code, Database, Smartphone, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';

const AboutUsPage = () => {
  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Goals Achieved', value: '2.5M+', icon: Target },
    { label: 'Hours Tracked', value: '10M+', icon: Clock },
    { label: 'Countries', value: '120+', icon: Globe }
  ];

  const values = [
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'We believe everyone deserves to reach their full potential through better productivity habits.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is yours. We prioritize security and transparency in everything we build.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push the boundaries of what productivity software can achieve.'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Every feature is designed with our users\' needs and feedback at the center.'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'The Vision',
      description: 'Phil O\'Shea conceptualized Digame after recognizing the need for intelligent productivity tracking.'
    },
    {
      year: '2021',
      title: 'Foundation',
      description: 'Development began with a focus on creating an intuitive, data-driven productivity platform.'
    },
    {
      year: '2022',
      title: 'Beta Launch',
      description: 'First beta version released to a select group of productivity enthusiasts and early adopters.'
    },
    {
      year: '2023',
      title: 'Public Release',
      description: 'Digame officially launched to the public with core features and mobile applications.'
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Advanced AI-powered insights and recommendations were integrated into the platform.'
    },
    {
      year: '2025',
      title: 'Global Expansion',
      description: 'Reaching users worldwide with enhanced team collaboration and enterprise features.'
    }
  ];

  const technologies = [
    { name: 'React', category: 'Frontend', icon: Code },
    { name: 'Python', category: 'Backend', icon: Database },
    { name: 'FastAPI', category: 'API', icon: Zap },
    { name: 'PostgreSQL', category: 'Database', icon: Database },
    { name: 'React Native', category: 'Mobile', icon: Smartphone },
    { name: 'Machine Learning', category: 'AI/ML', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">About Digame</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Empowering individuals and teams to achieve their highest potential through 
            intelligent productivity tracking and data-driven insights.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">
              <Mail className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
            <Button variant="outline" size="lg">
              <ExternalLink className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Founder Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Founder</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The visionary behind Digame's mission to revolutionize productivity
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/api/placeholder/128/128" alt="Phil O'Shea" />
                    <AvatarFallback className="text-2xl">PO</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2">Phil O'Shea</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                      <Badge variant="primary" className="px-3 py-1">Founder</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Software Pioneer</Badge>
                      <Badge variant="outline" className="px-3 py-1">C.E.O.</Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Phil O'Shea is a visionary software pioneer and the founder and CEO of Digame. 
                    With over two decades of experience in software development and product innovation, 
                    Phil recognized the critical need for intelligent productivity solutions in our 
                    increasingly complex digital world.
                  </p>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    His passion for helping individuals and teams unlock their potential led to the 
                    creation of Digame - a platform that combines cutting-edge technology with 
                    human-centered design to deliver actionable productivity insights.
                  </p>
                  
                  <div className="flex justify-center md:justify-start space-x-4">
                    <Button variant="outline" size="sm">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission & Vision */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To empower individuals and teams worldwide with intelligent productivity tools 
                  that transform how they work, learn, and achieve their goals. We believe that 
                  everyone deserves access to data-driven insights that help them reach their 
                  full potential.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To create a world where productivity is not about working harder, but working 
                  smarter. We envision a future where technology seamlessly integrates with human 
                  potential to create meaningful, sustainable, and fulfilling work experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at Digame
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to global platform - the Digame story
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-0.5"></div>
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1.5 md:-translate-x-1.5 z-10"></div>
                  
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-0 ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{item.year}</Badge>
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by cutting-edge technologies to deliver the best user experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="mx-auto w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{tech.name}</h4>
                    <p className="text-xs text-muted-foreground">{tech.category}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Awards & Recognition</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Honored to be recognized by industry leaders and users worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Best Productivity App 2024',
                organization: 'TechCrunch Awards',
                description: 'Recognized for innovation in productivity software'
              },
              {
                title: 'User Choice Award',
                organization: 'Product Hunt',
                description: 'Voted by users as the top productivity tool'
              },
              {
                title: 'Innovation Excellence',
                organization: 'SaaS Awards',
                description: 'Outstanding achievement in software innovation'
              }
            ].map((award, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{award.title}</h3>
                  <p className="text-sm text-primary mb-2">{award.organization}</p>
                  <p className="text-xs text-muted-foreground">{award.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of users who have already discovered the power of intelligent 
                productivity tracking with Digame.
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;