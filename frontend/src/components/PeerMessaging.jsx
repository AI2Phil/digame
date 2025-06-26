import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Paperclip, Smile, MoreVertical,
  Phone, Video, Info, Search, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Toast } from './ui/Toast';

const PeerMessaging = ({ peerId, peerName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem('userId') || '1');

  useEffect(() => {
    loadMessages();
    // Set up real-time message polling (in production, use WebSocket)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [peerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/social/messages/${peerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setConnectionStatus(data.connection_status || 'connected');
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/social/messages/${peerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text'
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        Toast.success('Message sent');
      } else {
        Toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (connectionStatus !== 'connected') {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Not Connected</h3>
            <p className="text-gray-600">You need to be connected with this user to send messages.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {peerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{peerName}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwn={message.sender_id === currentUserId}
              showTime={
                index === 0 ||
                new Date(message.created_at) - new Date(messages[index - 1].created_at) > 300000 // 5 minutes
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="p-1">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const MessageBubble = ({ message, isOwn, showTime }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {showTime && (
          <div className="text-xs text-gray-500 text-center mb-2">
            {new Date(message.created_at).toLocaleString()}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.message_type === 'project_invite' ? (
            <ProjectInviteMessage message={message} />
          ) : message.message_type === 'meeting_request' ? (
            <MeetingRequestMessage message={message} />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {isOwn && (
              <span className="ml-1">
                {message.is_read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectInviteMessage = ({ message }) => {
  const metadata = message.metadata || {};
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Project Invitation</p>
      <div className="bg-white bg-opacity-20 rounded p-2">
        <p className="font-medium">{metadata.project_name}</p>
        <p className="text-xs opacity-90">{metadata.project_description}</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="text-xs">
            View Project
          </Button>
          <Button size="sm" className="text-xs">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

const MeetingRequestMessage = ({ message }) => {
  const metadata = message.metadata || {};
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Meeting Request</p>
      <div className="bg-white bg-opacity-20 rounded p-2">
        <p className="font-medium">{metadata.meeting_title || 'Collaboration Meeting'}</p>
        <p className="text-xs opacity-90">
          {metadata.proposed_time && new Date(metadata.proposed_time).toLocaleString()}
        </p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="text-xs">
            Decline
          </Button>
          <Button size="sm" className="text-xs">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerMessaging;