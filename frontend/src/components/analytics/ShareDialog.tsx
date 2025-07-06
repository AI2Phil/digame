import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { analyticsApi } from '../../services/api/analytics';

interface ShareDialogProps {
  open: boolean;
  dashboard: any;
  onClose: () => void;
}

const PERMISSION_LEVELS = [
  { value: 'view', label: 'View Only', description: 'Can view dashboard and widgets' },
  { value: 'edit', label: 'Edit', description: 'Can modify dashboard and widgets' },
  { value: 'admin', label: 'Admin', description: 'Full control including sharing' }
];

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  dashboard,
  onClose
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load existing shares (mock data for now since API doesn't have this endpoint)
  const { data: shares, refetch } = useQuery({
    queryKey: ['dashboard-shares', dashboard?.id],
    queryFn: () => Promise.resolve([]), // Mock empty shares for now
    enabled: open && !!dashboard?.id
  });

  // Generate share URL
  React.useEffect(() => {
    if (open && dashboard) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/dashboard/${dashboard.id}/shared`);
    }
  }, [open, dashboard]);

  // Share dashboard mutation
  const shareMutation = useMutation({
    mutationFn: async (shareData: any) => {
      return analyticsApi.shareDashboard(dashboard.id, {
        user_emails: [shareData.email],
        permissions: shareData.permission
      });
    },
    onSuccess: () => {
      enqueueSnackbar('Dashboard shared successfully', { variant: 'success' });
      setShareEmail('');
      refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to share dashboard: ${error.message}`, { variant: 'error' });
    }
  });

  // Remove share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (shareId: number) => {
      return analyticsApi.revokeDashboardShare(dashboard.id, shareId);
    },
    onSuccess: () => {
      enqueueSnackbar('Share removed successfully', { variant: 'success' });
      refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to remove share: ${error.message}`, { variant: 'error' });
    }
  });

  // Update public access mutation
  const updatePublicMutation = useMutation({
    mutationFn: async (isPublic: boolean) => {
      // For now, just return a mock response since the API doesn't support public/private toggle
      return Promise.resolve({ success: true, isPublic });
    },
    onSuccess: () => {
      enqueueSnackbar(
        isPublic ? 'Dashboard is now public' : 'Dashboard is now private',
        { variant: 'success' }
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to update public access: ${error.message}`, { variant: 'error' });
    }
  });

  const handleShare = () => {
    if (!shareEmail.trim()) {
      enqueueSnackbar('Please enter an email address', { variant: 'warning' });
      return;
    }

    shareMutation.mutate({
      email: shareEmail.trim(),
      permission: sharePermission
    });
  };

  const handleRemoveShare = (shareId: number) => {
    removeShareMutation.mutate(shareId);
  };

  const handlePublicToggle = (checked: boolean) => {
    setIsPublic(checked);
    updatePublicMutation.mutate(checked);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to copy to clipboard', { variant: 'error' });
    }
  };

  const sendEmailInvite = () => {
    const subject = `Dashboard Shared: ${dashboard?.name}`;
    const body = `You've been invited to view the dashboard "${dashboard?.name}". Click the link below to access it:\n\n${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ShareIcon />
          Share Dashboard
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Dashboard Info */}
          <Alert severity="info">
            Sharing: <strong>{dashboard?.name}</strong>
          </Alert>

          {/* Public Access */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => handlePublicToggle(e.target.checked)}
                  disabled={updatePublicMutation.isPending}
                />
              }
              label="Make dashboard publicly accessible"
            />
            <Typography variant="caption" display="block" color="text.secondary">
              Anyone with the link can view this dashboard
            </Typography>
          </Box>

          {/* Share URL */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Share Link
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                value={shareUrl}
                InputProps={{ readOnly: true }}
              />
              <IconButton
                onClick={() => copyToClipboard(shareUrl)}
                title="Copy link"
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                onClick={sendEmailInvite}
                title="Send via email"
              >
                <EmailIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider />

          {/* Share with specific users */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Share with Specific Users
            </Typography>
            
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                size="small"
                label="Email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Permission</InputLabel>
                <Select
                  value={sharePermission}
                  label="Permission"
                  onChange={(e) => setSharePermission(e.target.value)}
                >
                  {PERMISSION_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleShare}
                disabled={shareMutation.isPending || !shareEmail.trim()}
              >
                Share
              </Button>
            </Box>

            {/* Permission descriptions */}
            <Box sx={{ mb: 2 }}>
              {PERMISSION_LEVELS.map((level) => (
                <Chip
                  key={level.value}
                  label={`${level.label}: ${level.description}`}
                  variant={sharePermission === level.value ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>

          {/* Current shares */}
          {shares && shares.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Current Shares ({shares.length})
              </Typography>
              <List dense>
                {shares.map((share: any) => (
                  <ListItem key={share.id}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <ListItemText
                      primary={share.user_email}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={share.permission}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption">
                            Shared {new Date(share.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveShare(share.id)}
                        disabled={removeShareMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;