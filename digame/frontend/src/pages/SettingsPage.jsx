import React, { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Globe, Database, 
  Download, Trash2, Save, RotateCcw, Eye, Moon, Sun 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Switch } from '../components/ui/Switch';
import { Select } from '../components/ui/Select';
import { Slider } from '../components/ui/Slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Separator } from '../components/ui/Separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/AlertDialog';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { useToast } from '../components/ui/Toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: '',
      bio: 'Software developer passionate about productivity tools'
    },
    
    // Notification Settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      goalReminders: true,
      breakReminders: false,
      soundEnabled: true,
      notificationFrequency: 'normal'
    },
    
    // Privacy & Security
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsTracking: true,
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    
    // Appearance
    appearance: {
      theme: 'system',
      fontSize: 16,
      compactMode: false,
      animations: true,
      colorScheme: 'blue'
    },
    
    // Language & Region
    localization: {
      language: 'en',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      // toast.success('Settings saved successfully');
    } catch (error) {
      // toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false);
  };

  const handleExportData = () => {
    // Simulate data export
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'digame-settings.json';
    link.click();
  };

  const handleDeleteAccount = () => {
    alert('Account deletion would be implemented here');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Language</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={settings.profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Get weekly productivity summaries</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Goal Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for your productivity goals</p>
                  </div>
                  <Switch
                    checked={settings.notifications.goalReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'goalReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders to take breaks</p>
                  </div>
                  <Switch
                    checked={settings.notifications.breakReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'breakReminders', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Frequency */}
              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <Select
                  value={settings.notifications.notificationFrequency}
                  onValueChange={(value) => updateSetting('notifications', 'notificationFrequency', value)}
                >
                  <option value="minimal">Minimal</option>
                  <option value="normal">Normal</option>
                  <option value="frequent">Frequent</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy settings and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Privacy Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="team">Team Only</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data for product improvement</p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">Allow usage analytics collection</p>
                  </div>
                  <Switch
                    checked={settings.privacy.analyticsTracking}
                    onCheckedChange={(checked) => updateSetting('privacy', 'analyticsTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.privacy.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('privacy', 'twoFactorAuth', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Slider
                  value={[settings.privacy.sessionTimeout]}
                  onValueChange={([value]) => updateSetting('privacy', 'sessionTimeout', value)}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 min</span>
                  <span>{settings.privacy.sessionTimeout} min</span>
                  <span>120 min</span>
                </div>
              </div>

              <Separator />

              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map((theme) => (
                    <Button
                      key={theme}
                      variant={settings.appearance.theme === theme ? 'default' : 'outline'}
                      onClick={() => updateSetting('appearance', 'theme', theme)}
                      className="flex items-center space-x-2"
                    >
                      {theme === 'light' && <Sun className="h-4 w-4" />}
                      {theme === 'dark' && <Moon className="h-4 w-4" />}
                      {theme === 'system' && <Eye className="h-4 w-4" />}
                      <span className="capitalize">{theme}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[settings.appearance.fontSize]}
                  onValueChange={([value]) => updateSetting('appearance', 'fontSize', value)}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>12px</span>
                  <span>{settings.appearance.fontSize}px</span>
                  <span>24px</span>
                </div>
              </div>

              <Separator />

              {/* Interface Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact interface layout</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable interface animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) => updateSetting('appearance', 'animations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Settings */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>
                Configure language, timezone, and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.localization.language}
                    onValueChange={(value) => updateSetting('localization', 'language', value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.localization.timezone}
                    onValueChange={(value) => updateSetting('localization', 'timezone', value)}
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.localization.dateFormat}
                    onValueChange={(value) => updateSetting('localization', 'dateFormat', value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select
                    value={settings.localization.timeFormat}
                    onValueChange={(value) => updateSetting('localization', 'timeFormat', value)}
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;