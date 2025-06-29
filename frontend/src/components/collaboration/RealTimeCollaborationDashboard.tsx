import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Users, MessageSquare, Video, Phone, Share2, Edit3,
  Send, Paperclip, Smile, MoreHorizontal, Settings,
  UserPlus, UserMinus, Crown, Shield, Eye, EyeOff,
  Clock, CheckCircle, AlertCircle, Circle, Mic,
  MicOff, Camera, CameraOff, Monitor, Volume2,
  VolumeX, Maximize, Minimize, Copy, Download,
  Star, Pin, Archive, Trash2, Search, Filter,
  Bell, BellOff, Hash, Lock, Globe, Calendar
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'admin' | 'moderator' | 'member' | 'guest';
  last_seen: string;
  is_typing?: boolean;
}

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system' | 'code' | 'link';
  timestamp: string;
  edited_at?: string;
  reactions: { emoji: string; users: string[]; count: number }[];
  replies?: Message[];
  is_pinned?: boolean;
  attachments?: { id: string; name: string; size: number; type: string; url: string }[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  created_at: string;
  last_message?: Message;
  unread_count: number;
  is_muted: boolean;
  is_archived: boolean;
}

interface ActiveSession {
  id: string;
  type: 'voice' | 'video' | 'screen_share';
  channel_id: string;
  participants: User[];
  started_at: string;
  is_recording: boolean;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  channels: Channel[];
  members: User[];
  created_at: string;
  settings: {
    allow_guests: boolean;
    require_approval: boolean;
    message_retention: number;
    file_sharing: boolean;
  };
}

export const RealTimeCollaborationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'channels' | 'calls' | 'workspace'>('chat');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls and WebSocket connections
  useEffect(() => {
    const initializeCollaboration = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockWorkspace: Workspace = {
          id: '1',
          name: 'Digame Team',
          description: 'Main collaboration workspace for the Digame platform team',
          channels: [
            {
              id: '1',
              name: 'general',
              description: 'General team discussions',
              type: 'public',
              members: ['1', '2', '3', '4', '5'],
              created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
              unread_count: 3,
              is_muted: false,
              is_archived: false
            },
            {
              id: '2',
              name: 'development',
              description: 'Development team coordination',
              type: 'public',
              members: ['1', '2', '3'],
              created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
              unread_count: 7,
              is_muted: false,
              is_archived: false
            },
            {
              id: '3',
              name: 'design',
              description: 'Design discussions and reviews',
              type: 'public',
              members: ['1', '4', '5'],
              created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
              unread_count: 0,
              is_muted: true,
              is_archived: false
            },
            {
              id: '4',
              name: 'alerts',
              description: 'System alerts and notifications',
              type: 'public',
              members: ['1', '2', '3', '4', '5'],
              created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
              unread_count: 12,
              is_muted: false,
              is_archived: false
            }
          ],
          members: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@digame.com',
              status: 'online',
              role: 'admin',
              last_seen: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@digame.com',
              status: 'online',
              role: 'moderator',
              last_seen: new Date(Date.now() - 300000).toISOString()
            },
            {
              id: '3',
              name: 'Mike Johnson',
              email: 'mike@digame.com',
              status: 'away',
              role: 'member',
              last_seen: new Date(Date.now() - 1800000).toISOString()
            },
            {
              id: '4',
              name: 'Sarah Wilson',
              email: 'sarah@digame.com',
              status: 'busy',
              role: 'member',
              last_seen: new Date(Date.now() - 600000).toISOString()
            },
            {
              id: '5',
              name: 'Alex Brown',
              email: 'alex@digame.com',
              status: 'offline',
              role: 'member',
              last_seen: new Date(Date.now() - 7200000).toISOString()
            }
          ],
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          settings: {
            allow_guests: true,
            require_approval: false,
            message_retention: 90,
            file_sharing: true
          }
        };

        setWorkspace(mockWorkspace);
        setSelectedChannel(mockWorkspace.channels[0]);
        setOnlineUsers(mockWorkspace.members.filter(u => u.status === 'online'));

        // Mock messages for selected channel
        const mockMessages: Message[] = [
          {
            id: '1',
            user_id: '2',
            user_name: 'Jane Smith',
            content: 'Good morning team! Ready for the sprint planning?',
            type: 'text',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            reactions: [
              { emoji: '👍', users: ['1', '3'], count: 2 },
              { emoji: '☕', users: ['4'], count: 1 }
            ]
          },
          {
            id: '2',
            user_id: '1',
            user_name: 'John Doe',
            content: 'Absolutely! I\'ve prepared the backlog items. Let me share the dashboard.',
            type: 'text',
            timestamp: new Date(Date.now() - 3300000).toISOString(),
            reactions: []
          },
          {
            id: '3',
            user_id: '3',
            user_name: 'Mike Johnson',
            content: 'The new monitoring dashboard looks great! 🚀',
            type: 'text',
            timestamp: new Date(Date.now() - 2700000).toISOString(),
            reactions: [
              { emoji: '🚀', users: ['1', '2', '4'], count: 3 }
            ],
            is_pinned: true
          },
          {
            id: '4',
            user_id: '4',
            user_name: 'Sarah Wilson',
            content: 'I\'ve uploaded the latest design mockups for review.',
            type: 'file',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            reactions: [],
            attachments: [
              {
                id: '1',
                name: 'dashboard-mockups-v2.figma',
                size: 2456789,
                type: 'application/figma',
                url: '/files/dashboard-mockups-v2.figma'
              }
            ]
          },
          {
            id: '5',
            user_id: '1',
            user_name: 'John Doe',
            content: 'System alert: New deployment completed successfully ✅',
            type: 'system',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            reactions: []
          }
        ];

        setMessages(mockMessages);

        // Mock active sessions
        setActiveSessions([
          {
            id: '1',
            type: 'video',
            channel_id: '2',
            participants: mockWorkspace.members.slice(0, 3),
            started_at: new Date(Date.now() - 1800000).toISOString(),
            is_recording: false
          }
        ]);

        setError(null);
      } catch (err) {
        setError('Failed to load collaboration data');
        console.error('Error loading collaboration:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeCollaboration();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate typing indicators
      if (Math.random() > 0.8) {
        setTypingUsers(['2']);
        setTimeout(() => setTypingUsers([]), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: Date.now().toString(),
      user_id: '1',
      user_name: 'John Doe',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes('1')) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter(u => u !== '1'), count: r.count - 1 }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, '1'], count: r.count + 1 }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: ['1'], count: 1 }]
          };
        }
      }
      return msg;
    }));
  };

  const startCall = (type: 'voice' | 'video') => {
    setIsCallActive(true);
    setIsCameraOn(type === 'video');
    // Simulate call setup
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'moderator': return Shield;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderChatTab = () => (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Channels</h3>
        </div>
        <div className="overflow-y-auto">
          {workspace?.channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 ${
                selectedChannel?.id === channel.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <Hash className="h-4 w-4 text-gray-400" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{channel.name}</span>
                  {channel.unread_count > 0 && (
                    <Badge variant="error" size="xs" icon={null} onRemove={() => {}}>
                      {channel.unread_count}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{channel.description}</p>
              </div>
              {channel.is_muted && <BellOff className="h-3 w-3 text-gray-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="font-medium text-gray-900">{selectedChannel?.name}</h2>
                <p className="text-sm text-gray-500">{selectedChannel?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => startCall('voice')}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => startCall('video')}>
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {message.user_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{message.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.is_pinned && <Pin className="h-3 w-3 text-yellow-500" />}
                    {message.edited_at && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  
                  {message.type === 'text' && (
                    <p className="text-gray-700">{message.content}</p>
                  )}
                  
                  {message.type === 'system' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm">{message.content}</p>
                    </div>
                  )}
                  
                  {message.type === 'file' && message.attachments && (
                    <div className="space-y-2">
                      <p className="text-gray-700">{message.content}</p>
                      {message.attachments.map((file) => (
                        <div key={file.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                            reaction.users.includes('1')
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => addReaction(message.id, '👍')}
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Smile className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>Jane is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => {
                // Handle file upload
                console.log('Files selected:', e.target.files);
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message #${selectedChannel?.name}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Users Sidebar */}
      <div className="w-64 border-l border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Online ({onlineUsers.length})</h3>
        </div>
        <div className="overflow-y-auto">
          {workspace?.members.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    {RoleIcon && <RoleIcon className="h-3 w-3 text-yellow-500" />}
                  </div>
                  <p className="text-xs text-gray-500">{user.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderChannelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Channels</h3>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workspace?.channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-gray-400" />
                  {channel.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {channel.type === 'private' && <Lock className="h-4 w-4 text-gray-400" />}
                  {channel.is_muted && <BellOff className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{channel.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members: {channel.members.length}</span>
                <span className="text-gray-600">
                  Created: {new Date(channel.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {channel.unread_count > 0 && (
                <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                  {channel.unread_count} unread messages
                </Badge>
              )}
              
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button size="sm" onClick={() => setSelectedChannel(channel)}>
                  Open
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  {channel.is_muted ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCallsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Active Calls</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => startCall('voice')}>
            <Phone className="h-4 w-4 mr-2" />
            Voice Call
          </Button>
          <Button onClick={() => startCall('video')}>
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
        </div>
      </div>

      {/* Active Call Interface */}
      {isCallActive && (
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Call in Progress</h3>
              <p className="text-gray-300">3 participants • 15:42</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {onlineUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="text-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <p className="text-sm">{user.name}</p>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                size="sm"
                variant={isMuted ? 'danger' : 'outline'}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant={isCameraOn ? 'primary' : 'outline'}
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant={isScreenSharing ? 'primary' : 'outline'}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="danger" onClick={endCall}>
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <div className="space-y-4">
        {activeSessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.type === 'video' ? (
                    <Video className="h-5 w-5 text-blue-600" />
                  ) : session.type === 'voice' ? (
                    <Phone className="h-5 w-5 text-green-600" />
                  ) : (
                    <Monitor className="h-5 w-5 text-purple-600" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {session.type === 'video' ? 'Video Call' :
                       session.type === 'voice' ? 'Voice Call' : 'Screen Share'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {session.participants.length} participants •
                      Started {new Date(session.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.is_recording && (
                    <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                      Recording
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {session.participants.slice(0, 5).map((participant) => (
                  <div key={participant.id} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {participant.name.charAt(0)}
                  </div>
                ))}
                {session.participants.length > 5 && (
                  <span className="text-sm text-gray-500">+{session.participants.length - 5} more</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {activeSessions.length === 0 && (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active calls</p>
            <p className="text-sm text-gray-500 mt-2">Start a voice or video call to collaborate with your team</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderWorkspaceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Workspace Settings</h3>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Edit Settings
        </Button>
      </div>

      {workspace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{workspace.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-600">{workspace.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-600">{new Date(workspace.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                <p className="text-gray-600">{workspace.members.length} total members</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Allow Guests</h4>
                  <p className="text-sm text-gray-600">Let non-members join channels</p>
                </div>
                <Badge
                  variant={workspace.settings.allow_guests ? 'success' : 'secondary'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {workspace.settings.allow_guests ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Require Approval</h4>
                  <p className="text-sm text-gray-600">New members need approval</p>
                </div>
                <Badge
                  variant={workspace.settings.require_approval ? 'warning' : 'secondary'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {workspace.settings.require_approval ? 'Required' : 'Not Required'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">File Sharing</h4>
                  <p className="text-sm text-gray-600">Allow file uploads</p>
                </div>
                <Badge
                  variant={workspace.settings.file_sharing ? 'success' : 'secondary'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {workspace.settings.file_sharing ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Message Retention</h4>
                  <p className="text-sm text-gray-600">How long to keep messages</p>
                </div>
                <span className="text-gray-600">{workspace.settings.message_retention} days</span>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Members ({workspace.members.length})</CardTitle>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workspace.members.map((member) => {
                  const RoleIcon = getRoleIcon(member.role);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            {RoleIcon && <RoleIcon className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            {member.status === 'online' ? 'Online' : `Last seen ${new Date(member.last_seen).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                          {member.role}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Collaboration</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
            <p className="text-gray-600">Real-time communication and collaboration workspace</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'channels', label: 'Channels', icon: Hash },
                { id: 'calls', label: 'Calls', icon: Phone },
                { id: 'workspace', label: 'Workspace', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'channels' && renderChannelsTab()}
          {activeTab === 'calls' && renderCallsTab()}
          {activeTab === 'workspace' && renderWorkspaceTab()}
        </div>
      </div>
    </div>
  );
};