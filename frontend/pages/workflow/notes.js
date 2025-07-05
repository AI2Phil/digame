import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Input } from '../../src/components/ui/input';
import { Textarea } from '../../src/components/ui/textarea';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star,
  Clock,
  Tag,
  User,
  Bookmark,
  Share,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Link,
  Archive
} from 'lucide-react';

const WorkflowNotes = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [activeTab]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflow/notes?category=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await fetch('/api/workflow/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });
      
      if (response.ok) {
        fetchNotes(); // Refresh notes
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const mockNotes = [
    {
      id: 1,
      title: 'Daily Report Automation Setup',
      content: 'Detailed notes on configuring the daily report automation workflow. Key steps include:\n\n1. Data source configuration\n2. Report template setup\n3. Email distribution list\n4. Scheduling parameters\n\nImportant: Remember to test with sample data before going live.',
      category: 'documentation',
      tags: ['automation', 'reports', 'setup'],
      workflowId: 1,
      workflowName: 'Daily Report Generation',
      author: 'John Doe',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      isStarred: true,
      isShared: false,
      attachments: ['report_template.xlsx', 'config_guide.pdf'],
      comments: 3,
      views: 15
    },
    {
      id: 2,
      title: 'Troubleshooting Email Delivery Issues',
      content: 'Common issues and solutions for email delivery problems in workflows:\n\n**Issue 1: Emails not sending**\n- Check SMTP configuration\n- Verify authentication credentials\n- Test with simple email first\n\n**Issue 2: Emails going to spam**\n- Review email content for spam triggers\n- Check sender reputation\n- Implement SPF/DKIM records',
      category: 'troubleshooting',
      tags: ['email', 'troubleshooting', 'smtp'],
      workflowId: 2,
      workflowName: 'Email Campaign',
      author: 'Sarah Johnson',
      createdAt: '2024-01-09T15:20:00Z',
      updatedAt: '2024-01-09T16:45:00Z',
      isStarred: false,
      isShared: true,
      attachments: ['smtp_config.txt'],
      comments: 7,
      views: 28
    },
    {
      id: 3,
      title: 'Performance Optimization Best Practices',
      content: 'Best practices for optimizing workflow performance:\n\n• Use parallel processing where possible\n• Implement proper error handling\n• Cache frequently accessed data\n• Monitor execution times\n• Set appropriate timeouts\n\nMeasured improvements:\n- 45% faster execution with parallel processing\n- 30% reduction in errors with better handling',
      category: 'best_practices',
      tags: ['performance', 'optimization', 'best-practices'],
      workflowId: null,
      workflowName: null,
      author: 'Mike Chen',
      createdAt: '2024-01-08T09:15:00Z',
      updatedAt: '2024-01-08T11:30:00Z',
      isStarred: true,
      isShared: true,
      attachments: ['performance_metrics.png'],
      comments: 12,
      views: 45
    },
    {
      id: 4,
      title: 'API Integration Notes',
      content: 'Notes on integrating external APIs into workflows:\n\n**Salesforce Integration:**\n- API endpoint: https://api.salesforce.com/v1/\n- Authentication: OAuth 2.0\n- Rate limits: 1000 calls/hour\n- Required fields: account_id, contact_name\n\n**Slack Integration:**\n- Webhook URL: https://hooks.slack.com/...\n- Channel: #notifications\n- Message format: JSON with text and attachments',
      category: 'integration',
      tags: ['api', 'salesforce', 'slack', 'integration'],
      workflowId: 3,
      workflowName: 'CRM Sync',
      author: 'Lisa Brown',
      createdAt: '2024-01-07T13:45:00Z',
      updatedAt: '2024-01-07T15:20:00Z',
      isStarred: false,
      isShared: false,
      attachments: ['api_docs.pdf', 'integration_diagram.png'],
      comments: 5,
      views: 22
    },
    {
      id: 5,
      title: 'Meeting Notes: Workflow Review Session',
      content: 'Meeting notes from the weekly workflow review session:\n\n**Attendees:** John, Sarah, Mike, Lisa\n**Date:** January 5, 2024\n\n**Key Decisions:**\n- Implement new error handling for email workflows\n- Upgrade to latest API version for Salesforce integration\n- Schedule performance optimization review\n\n**Action Items:**\n- John: Update error handling by Jan 15\n- Sarah: Test new email templates\n- Mike: Prepare performance report',
      category: 'meeting_notes',
      tags: ['meeting', 'review', 'decisions', 'action-items'],
      workflowId: null,
      workflowName: null,
      author: 'John Doe',
      createdAt: '2024-01-05T16:00:00Z',
      updatedAt: '2024-01-05T16:30:00Z',
      isStarred: false,
      isShared: true,
      attachments: ['meeting_agenda.pdf'],
      comments: 8,
      views: 18
    }
  ];

  const currentNotes = notes.length > 0 ? notes : mockNotes;

  const filteredNotes = currentNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'starred' && note.isStarred) ||
                      (activeTab === 'shared' && note.isShared) ||
                      note.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const noteCategories = [
    { value: 'all', label: 'All Notes', icon: <FileText className="h-4 w-4" /> },
    { value: 'starred', label: 'Starred', icon: <Star className="h-4 w-4" /> },
    { value: 'shared', label: 'Shared', icon: <Share className="h-4 w-4" /> },
    { value: 'documentation', label: 'Documentation', icon: <FileText className="h-4 w-4" /> },
    { value: 'troubleshooting', label: 'Troubleshooting', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'best_practices', label: 'Best Practices', icon: <Star className="h-4 w-4" /> },
    { value: 'integration', label: 'Integration', icon: <Link className="h-4 w-4" /> },
    { value: 'meeting_notes', label: 'Meeting Notes', icon: <User className="h-4 w-4" /> }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Workflow Notes"
        subtitle="Document processes, troubleshooting guides, and best practices"
        icon={<FileText className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Workflow', href: '/workflow' },
          { label: 'Notes', href: '/workflow/notes' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {noteCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setActiveTab(category.value)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      activeTab === category.value ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    {category.icon}
                    <span>{category.label}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {category.value === 'all' ? currentNotes.length :
                       category.value === 'starred' ? currentNotes.filter(n => n.isStarred).length :
                       category.value === 'shared' ? currentNotes.filter(n => n.isShared).length :
                       currentNotes.filter(n => n.category === category.value).length}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Notes</span>
                <span className="font-medium">{currentNotes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Starred</span>
                <span className="font-medium">{currentNotes.filter(n => n.isStarred).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shared</span>
                <span className="font-medium">{currentNotes.filter(n => n.isShared).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Views</span>
                <span className="font-medium">{currentNotes.reduce((acc, n) => acc + n.views, 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{note.author}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {note.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {note.isShared && <Share className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Content Preview */}
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {note.content.substring(0, 150)}...
                    </p>

                    {/* Workflow Association */}
                    {note.workflowName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Link className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">Linked to: </span>
                        <Badge variant="outline" className="text-xs">
                          {note.workflowName}
                        </Badge>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Attachments */}
                    {note.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-3 w-3" />
                        <span>{note.attachments.length} attachment{note.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{note.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{note.comments}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {note.category.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first workflow note to get started'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Note title" />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select category</option>
                {noteCategories.slice(3).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Textarea placeholder="Note content" rows={10} />
              <Input placeholder="Tags (comma separated)" />
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={() => createNote({})}>
                  Create Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowNotes;