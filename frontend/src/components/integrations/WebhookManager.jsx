import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Webhook,
  Key,
  Activity,
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const WebhookManager = ({ connectionId, connectionName }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [newWebhook, setNewWebhook] = useState({
    webhook_url: '',
    events: [],
    webhook_secret: '',
    is_active: true
  });

  // Available events for different providers
  const availableEvents = {
    slack: [
      'message.posted', 'message.deleted', 'message.updated',
      'channel.created', 'channel.deleted', 'channel.updated',
      'user.joined', 'user.left', 'user.updated',
      'file.shared', 'file.deleted'
    ],
    google: [
      'file.created', 'file.modified', 'file.deleted',
      'calendar.event.created', 'calendar.event.updated', 'calendar.event.deleted',
      'email.received', 'email.sent'
    ],
    github: [
      'push', 'pull_request', 'issues', 'issue_comment',
      'release', 'fork', 'watch', 'star',
      'repository.created', 'repository.deleted'
    ],
    microsoft: [
      'file.created', 'file.modified', 'file.deleted',
      'calendar.event.created', 'calendar.event.updated',
      'email.received', 'teams.message.posted'
    ],
    trello: [
      'card.created', 'card.updated', 'card.deleted',
      'board.created', 'board.updated', 'board.deleted',
      'list.created', 'list.updated', 'list.deleted'
    ]
  };

  useEffect(() => {
    fetchWebhooks();
  }, [connectionId]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const mockWebhooks = [
        {
          id: 1,
          connection_id: connectionId,
          webhook_url: '/api/webhooks/slack/1',
          events: ['message.posted', 'channel.created', 'user.joined'],
          webhook_secret: 'wh_secret_123',
          is_active: true,
          total_triggers: 1847,
          successful_triggers: 1832,
          failed_triggers: 15,
          last_triggered_at: '2024-06-24T06:30:00Z',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];
      setWebhooks(mockWebhooks);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/v1/integrations/connections/${connectionId}/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWebhook)
      });

      if (response.ok) {
        const webhook = await response.json();
        setWebhooks([...webhooks, webhook]);
        setShowCreateDialog(false);
        setNewWebhook({
          webhook_url: '',
          events: [],
          webhook_secret: '',
          is_active: true
        });
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/v1/integrations/webhooks/${webhookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const toggleWebhook = async (webhookId, isActive) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/v1/integrations/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        setWebhooks(webhooks.map(w => 
          w.id === webhookId ? { ...w, is_active: isActive } : w
        ));
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const testWebhook = async (webhookId) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/v1/integrations/webhooks/${webhookId}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        // Show success message
        console.log('Webhook test successful');
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSuccessRate = (webhook) => {
    if (webhook.total_triggers === 0) return 0;
    return ((webhook.successful_triggers / webhook.total_triggers) * 100).toFixed(1);
  };

  const getStatusColor = (webhook) => {
    if (!webhook.is_active) return 'bg-gray-100 text-gray-800';
    const successRate = getSuccessRate(webhook);
    if (successRate >= 95) return 'bg-green-100 text-green-800';
    if (successRate >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (webhook) => {
    if (!webhook.is_active) return <Clock className="h-4 w-4 text-gray-500" />;
    const successRate = getSuccessRate(webhook);
    if (successRate >= 95) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (successRate >= 85) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Webhooks for {connectionName}</h3>
          <p className="text-sm text-gray-600">Manage real-time event notifications</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Set up a webhook to receive real-time notifications for events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <Input
                  placeholder="https://your-app.com/webhooks/digame"
                  value={newWebhook.webhook_url}
                  onChange={(e) => setNewWebhook({...newWebhook, webhook_url: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The URL where webhook events will be sent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret (Optional)</label>
                <Input
                  placeholder="Enter a secret for signature verification"
                  value={newWebhook.webhook_secret}
                  onChange={(e) => setNewWebhook({...newWebhook, webhook_secret: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used to verify webhook authenticity
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                  {(availableEvents.slack || []).map((event) => (
                    <label key={event} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event]
                            });
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter(e => e !== event)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createWebhook}
                  disabled={!newWebhook.webhook_url || newWebhook.events.length === 0}
                >
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Webhooks Configured</h3>
            <p className="text-gray-600 mb-4">
              Set up webhooks to receive real-time notifications when events occur in your connected services.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(webhook)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-semibold truncate">{webhook.webhook_url}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.webhook_url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created {formatDate(webhook.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(webhook)}>
                      {webhook.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Triggers</p>
                    <p className="text-xl font-bold">{webhook.total_triggers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-xl font-bold text-green-600">{getSuccessRate(webhook)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Triggered</p>
                    <p className="text-sm">{formatDate(webhook.last_triggered_at)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Subscribed Events</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {webhook.failed_triggers > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {webhook.failed_triggers} failed triggers in the last 30 days. 
                      Check your endpoint logs for details.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook.id)}
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWebhook(webhook.id, !webhook.is_active)}
                    >
                      {webhook.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Webhook Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Key className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Signature Verification</p>
                <p>Use the webhook secret to verify request authenticity using HMAC-SHA256</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Endpoint Requirements</p>
                <p>Your endpoint must respond with 2xx status code within 30 seconds</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RefreshCw className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Retry Policy</p>
                <p>Failed webhooks are retried up to 3 times with exponential backoff</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookManager;