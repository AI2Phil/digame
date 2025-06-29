import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Settings, 
  Edit3, 
  Trash2, 
  Download, 
  Share2,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

interface DigitalTwin {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version?: string;
  created_at: string;
  updated_at: string;
}

interface TwinSettingsProps {
  twin: DigitalTwin;
  onUpdate: () => void;
}

export const TwinSettings: React.FC<TwinSettingsProps> = ({ twin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(twin.name);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/v1/digital-twins/${twin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName.trim()
        })
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error('Failed to update twin');
      }
    } catch (error) {
      console.error('Error updating twin:', error);
      alert('Failed to update twin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(twin.name);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/digital-twins/${twin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (response.ok) {
        // Redirect to twins list or dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Failed to delete twin');
      }
    } catch (error) {
      console.error('Error deleting twin:', error);
      alert('Failed to delete twin. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      // This would typically export twin data
      const exportData = {
        twin: twin,
        exported_at: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${twin.name.replace(/\s+/g, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting twin:', error);
      alert('Failed to export twin data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'learning': return 'info';
      case 'initializing': return 'warning';
      case 'paused': return 'secondary';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Basic Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twin Name
            </label>
            {isEditing ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter twin name"
                />
                <Button onClick={handleSave} disabled={loading || !editedName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{twin.name}</span>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Badge
              variant={getStatusColor(twin.status)}
              icon={undefined}
              onRemove={undefined}
            >
              {twin.status.charAt(0).toUpperCase() + twin.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <span className="text-gray-600">
                {new Date(twin.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <span className="text-gray-600">
                {new Date(twin.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Learning Progress</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${twin.learning_progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{twin.learning_progress}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Accuracy Score</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${twin.accuracy_score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{twin.accuracy_score}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Twin Data</h4>
              <p className="text-sm text-gray-600">Download your twin's learning data and patterns</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Share Twin Access</h4>
              <p className="text-sm text-gray-600">Grant others access to view your twin's insights</p>
            </div>
            <Button variant="outline" disabled>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Confirm Deletion</h4>
                <p className="text-sm text-red-700 mb-4">
                  This action cannot be undone. This will permanently delete your digital twin 
                  and all associated data, patterns, and learning progress.
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDelete} 
                    disabled={loading}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete Twin'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Delete Digital Twin</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete this twin and all associated data
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwinSettings;