import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  AvatarGroup,
  Chip,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Fab,
  Zoom,
  Slide,
  Collapse,
  Alert,
  LinearProgress,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  ScreenShare as ScreenShareIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Draw as DrawIcon,
  TextFields as TextFieldsIcon,
  Gesture as GestureIcon,
  ColorLens as ColorLensIcon,
  FormatShapes as ShapesIcon
} from '@mui/icons-material';
import { websocket } from '../../services/websocket/CollaborationSocket';
import { useAccessibility } from '../accessibility/AccessibilityEnhancements';

// Types for real-time collaboration
export interface CollaborationSession {
  id: string;
  name: string;
  type: 'document' | 'whiteboard' | 'meeting' | 'screen_share';
  status: 'active' | 'paused' | 'ended';
  participants: Participant[];
  owner: string;
  createdAt: number;
  lastActivity: number;
  settings: SessionSettings;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'busy' | 'offline';
  permissions: Permission[];
  cursor?: CursorPosition;
  selection?: Selection;
  isTyping: boolean;
  lastSeen: number;
}

export interface Permission {
  type: 'edit' | 'comment' | 'share' | 'admin';
  granted: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  timestamp: number;
}

export interface Selection {
  start: number;
  end: number;
  elementId: string;
  timestamp: number;
}

export interface SessionSettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxParticipants: number;
  enableChat: boolean;
  enableVoice: boolean;
  enableVideo: boolean;
  enableScreenShare: boolean;
  enableWhiteboard: boolean;
  autoSave: boolean;
  saveInterval: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  type: 'text' | 'system' | 'file' | 'reaction';
  replyTo?: string;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface WhiteboardElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  text?: string;
  color: string;
  strokeWidth: number;
  userId: string;
  timestamp: number;
}

export interface DocumentChange {
  id: string;
  type: 'insert' | 'delete' | 'format';
  position: number;
  content?: string;
  length?: number;
  attributes?: any;
  userId: string;
  timestamp: number;
}

// Real-Time Collaboration Provider
export const RealTimeCollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeConnection = async () => {
      try {
        const userId = localStorage.getItem('userId') || 'anonymous';
        const token = localStorage.getItem('accessToken') || '';
        
        await websocket.connect(userId, token);
        setIsConnected(true);

        // Listen for collaboration events
        websocket.on('session:created', (session: CollaborationSession) => {
          setSessions(prev => [...prev, session]);
        });

        websocket.on('session:updated', (session: CollaborationSession) => {
          setSessions(prev => prev.map(s => s.id === session.id ? session : s));
          if (activeSession?.id === session.id) {
            setActiveSession(session);
          }
        });

        websocket.on('session:ended', (sessionId: string) => {
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          if (activeSession?.id === sessionId) {
            setActiveSession(null);
          }
        });

      } catch (error) {
        console.error('Failed to initialize collaboration connection:', error);
      }
    };

    initializeConnection();

    return () => {
      websocket.disconnect();
    };
  }, [activeSession?.id]);

  return (
    <Box>
      {children}
      {/* Global collaboration status indicator */}
      {isConnected && (
        <Chip
          label={`${sessions.length} active sessions`}
          size="small"
          color="success"
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
        />
      )}
    </Box>
  );
};

// Collaborative Document Editor
export const CollaborativeDocumentEditor: React.FC<{
  sessionId: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}> = ({ sessionId, initialContent = '', onContentChange }) => {
  const [content, setContent] = useState(initialContent);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle text changes with operational transformation
  const handleContentChange = useCallback((newContent: string) => {
    const change: DocumentChange = {
      id: `change-${Date.now()}`,
      type: 'insert',
      position: editorRef.current?.selectionStart || 0,
      content: newContent,
      userId: localStorage.getItem('userId') || 'anonymous',
      timestamp: Date.now()
    };

    setContent(newContent);
    setChanges(prev => [...prev, change]);
    onContentChange?.(newContent);

    // Broadcast change to other participants
    websocket.sendMessage('document:change', {
      sessionId,
      change
    });

    // Handle typing indicators
    websocket.sendMessage('document:typing_start', { sessionId });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      websocket.sendMessage('document:typing_stop', { sessionId });
    }, 1000);
  }, [sessionId, onContentChange]);

  // Listen for remote changes
  useEffect(() => {
    const handleRemoteChange = (data: { sessionId: string; change: DocumentChange }) => {
      if (data.sessionId === sessionId) {
        setChanges(prev => [...prev, data.change]);
        // Apply operational transformation here
        applyRemoteChange(data.change);
      }
    };

    const handleTypingStart = (data: { sessionId: string; userId: string }) => {
      if (data.sessionId === sessionId) {
        setIsTyping(prev => ({ ...prev, [data.userId]: true }));
      }
    };

    const handleTypingStop = (data: { sessionId: string; userId: string }) => {
      if (data.sessionId === sessionId) {
        setIsTyping(prev => ({ ...prev, [data.userId]: false }));
      }
    };

    websocket.on('document:change', handleRemoteChange);
    websocket.on('document:typing_start', handleTypingStart);
    websocket.on('document:typing_stop', handleTypingStop);

    return () => {
      websocket.off('document:change', handleRemoteChange);
      websocket.off('document:typing_start', handleTypingStart);
      websocket.off('document:typing_stop', handleTypingStop);
    };
  }, [sessionId]);

  const applyRemoteChange = (change: DocumentChange) => {
    // Simplified operational transformation
    // In production, use a proper OT library like ShareJS or Yjs
    if (change.type === 'insert' && change.content) {
      setContent(prev => {
        const before = prev.substring(0, change.position);
        const after = prev.substring(change.position);
        return before + change.content + after;
      });
    }
  };

  const typingUsers = Object.entries(isTyping)
    .filter(([_, typing]) => typing)
    .map(([userId]) => participants.find(p => p.id === userId)?.name || userId);

  return (
    <Box>
      {/* Participants bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'grey.50' }}>
        <AvatarGroup max={5}>
          {participants.map((participant) => (
            <Tooltip key={participant.id} title={`${participant.name} (${participant.status})`}>
              <Avatar
                src={participant.avatar}
                sx={{
                  border: participant.status === 'online' ? '2px solid green' : '2px solid grey'
                }}
              >
                {participant.name.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        
        {typingUsers.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Typography>
        )}
      </Box>

      {/* Document editor */}
      <Paper sx={{ p: 2 }}>
        <TextField
          inputRef={editorRef}
          fullWidth
          multiline
          rows={20}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing to collaborate..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: '14px'
            }
          }}
        />
      </Paper>

      {/* Change history */}
      <Collapse in={changes.length > 0}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Changes ({changes.length})
          </Typography>
          <List dense>
            {changes.slice(-5).map((change) => (
              <ListItem key={change.id}>
                <ListItemText
                  primary={`${change.type} by ${change.userId}`}
                  secondary={new Date(change.timestamp).toLocaleTimeString()}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Box>
  );
};

// Real-Time Whiteboard
export const RealTimeWhiteboard: React.FC<{
  sessionId: string;
  width?: number;
  height?: number;
}> = ({ sessionId, width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      const element: WhiteboardElement = {
        id: `element-${Date.now()}`,
        type: 'line',
        x,
        y,
        points: [x, y],
        color: currentColor,
        strokeWidth,
        userId: localStorage.getItem('userId') || 'anonymous',
        timestamp: Date.now()
      };
      setElements(prev => [...prev, element]);
    }
  }, [currentTool, currentColor, strokeWidth]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      setElements(prev => {
        const newElements = [...prev];
        const lastElement = newElements[newElements.length - 1];
        if (lastElement && lastElement.type === 'line' && lastElement.points) {
          lastElement.points.push(x, y);
        }
        return newElements;
      });
    }
  }, [isDrawing, currentTool]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      // Broadcast the completed element
      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        websocket.sendMessage('whiteboard:element_added', {
          sessionId,
          element: lastElement
        });
      }
    }
  }, [isDrawing, elements, sessionId]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all elements
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';

      switch (element.type) {
        case 'line':
          if (element.points && element.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(element.points[0], element.points[1]);
            for (let i = 2; i < element.points.length; i += 2) {
              ctx.lineTo(element.points[i], element.points[i + 1]);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (element.width && element.height) {
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
          break;
        case 'circle':
          if (element.width) {
            ctx.beginPath();
            ctx.arc(element.x, element.y, element.width / 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
      }
    });
  }, [elements, width, height]);

  // Listen for remote whiteboard changes
  useEffect(() => {
    const handleElementAdded = (data: { sessionId: string; element: WhiteboardElement }) => {
      if (data.sessionId === sessionId) {
        setElements(prev => [...prev, data.element]);
      }
    };

    websocket.on('whiteboard:element_added', handleElementAdded);

    return () => {
      websocket.off('whiteboard:element_added', handleElementAdded);
    };
  }, [sessionId]);

  return (
    <Box>
      {/* Toolbar */}
      <Paper sx={{ p: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant={currentTool === 'pen' ? 'contained' : 'outlined'}
          onClick={() => setCurrentTool('pen')}
          startIcon={<DrawIcon />}
        >
          Pen
        </Button>
        <Button
          variant={currentTool === 'rectangle' ? 'contained' : 'outlined'}
          onClick={() => setCurrentTool('rectangle')}
          startIcon={<ShapesIcon />}
        >
          Rectangle
        </Button>
        <Button
          variant={currentTool === 'circle' ? 'contained' : 'outlined'}
          onClick={() => setCurrentTool('circle')}
          startIcon={<GestureIcon />}
        >
          Circle
        </Button>
        
        <Divider orientation="vertical" flexItem />
        
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
        />
        
        <Box sx={{ width: 100 }}>
          <Typography variant="caption">Stroke: {strokeWidth}px</Typography>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>
        
        <Button
          variant="outlined"
          onClick={() => setElements([])}
          color="error"
        >
          Clear
        </Button>
      </Paper>

      {/* Canvas */}
      <Paper sx={{ display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            border: '1px solid #ccc',
            cursor: currentTool === 'pen' ? 'crosshair' : 'default'
          }}
        />
      </Paper>

      {/* Participants cursors */}
      {participants.map(participant => (
        participant.cursor && (
          <Box
            key={participant.id}
            sx={{
              position: 'absolute',
              left: participant.cursor.x,
              top: participant.cursor.y,
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '12px solid red'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 15,
                left: -10,
                bgcolor: 'red',
                color: 'white',
                px: 1,
                borderRadius: 1,
                whiteSpace: 'nowrap'
              }}
            >
              {participant.name}
            </Typography>
          </Box>
        )
      ))}
    </Box>
  );
};

// Real-Time Chat
export const RealTimeChat: React.FC<{
  sessionId: string;
  height?: number;
}> = ({ sessionId, height = 400 }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: localStorage.getItem('userId') || 'anonymous',
      userName: localStorage.getItem('userName') || 'Anonymous',
      message: newMessage,
      timestamp: Date.now(),
      type: 'text',
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    websocket.sendMessage('chat:message', {
      sessionId,
      message
    });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    websocket.sendMessage('chat:typing_start', { sessionId });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      websocket.sendMessage('chat:typing_stop', { sessionId });
    }, 1000);
  };

  // Listen for chat events
  useEffect(() => {
    const handleMessage = (data: { sessionId: string; message: ChatMessage }) => {
      if (data.sessionId === sessionId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleTypingStart = (data: { sessionId: string; userId: string; userName: string }) => {
      if (data.sessionId === sessionId) {
        setIsTyping(prev => [...prev.filter(u => u !== data.userName), data.userName]);
      }
    };

    const handleTypingStop = (data: { sessionId: string; userId: string; userName: string }) => {
      if (data.sessionId === sessionId) {
        setIsTyping(prev => prev.filter(u => u !== data.userName));
      }
    };

    websocket.on('chat:message', handleMessage);
    websocket.on('chat:typing_start', handleTypingStart);
    websocket.on('chat:typing_stop', handleTypingStop);

    return () => {
      websocket.off('chat:message', handleMessage);
      websocket.off('chat:typing_start', handleTypingStart);
      websocket.off('chat:typing_stop', handleTypingStop);
    };
  }, [sessionId]);

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {message.userName.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {message.userName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {message.message}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
        
        {isTyping.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Main Real-Time Enhancements Component
export const RealTimeEnhancements: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<'document' | 'whiteboard' | 'chat'>('document');
  const [sessionId] = useState(`session-${Date.now()}`);
  const { settings } = useAccessibility();

  return (
    <RealTimeCollaborationProvider>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Real-Time Collaboration
        </Typography>

        {/* Feature tabs */}
        <Tabs
          value={activeFeature}
          onChange={(_, value) => setActiveFeature(value)}
          sx={{ mb: 3 }}
        >
          <Tab value="document" label="Document Editor" icon={<EditIcon />} />
          <Tab value="whiteboard" label="Whiteboard" icon={<DrawIcon />} />
          <Tab value="chat" label="Chat" icon={<ChatIcon />} />
        </Tabs>

        {/* Feature content */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={activeFeature === 'chat' ? 12 : 8}>
            {activeFeature === 'document' && (
              <CollaborativeDocumentEditor
                sessionId={sessionId}
                initialContent="# Welcome to Real-Time Collaboration\n\nStart typing to see real-time collaboration in action!"
              />
            )}
            
            {activeFeature === 'whiteboard' && (
              <RealTimeWhiteboard sessionId={sessionId} />
            )}
            
            {activeFeature === 'chat' && (
              <RealTimeChat sessionId={sessionId} height={600} />
            )}
          </Grid>
          
          {activeFeature !== 'chat' && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chat
                  </Typography>
                  <RealTimeChat sessionId={sessionId} height={400} />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </RealTimeCollaborationProvider>
  );
};

export default RealTimeEnhancements;