import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
  Search, Filter, SortAsc, SortDesc, Calendar, Clock,
import {
  User, FileText, Database, Settings, Tag, Star,
  TrendingUp, BarChart3, Activity, Shield, Zap,
  Building2, Users, MessageSquare, Code, Monitor,
  Brain, Smartphone, TestTube, GitBranch, Bell,
  ChevronDown, ChevronUp, X, Plus, Eye, Download,
  RefreshCw, Bookmark, Share, Archive, Trash2
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'document' | 'dashboard' | 'report' | 'alert' | 'workflow' | 'api' | 'log' | 'metric';
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author?: string;
  created_at: string;
  updated_at: string;
  relevance_score: number;
  metadata: Record<string, any>;
  url?: string;
}

interface SearchFilter {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'date' | 'range' | 'boolean';
  options?: { value: string; label: string; count?: number }[];
  value: any;
  enabled: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter[];
  created_at: string;
  last_used: string;
  usage_count: number;
  is_favorite: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'filter' | 'category';
  count: number;
  icon?: React.ComponentType<any>;
}

export const AdvancedSearchDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'filters' | 'saved' | 'analytics'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(20);
  
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title' | 'author'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const initializeSearchData = async () => {
      try {
        setLoading(true);
        
        // Initialize filters
        setFilters([
          {
            id: 'type',
            name: 'Content Type',
            type: 'multiselect',
            options: [
              { value: 'user', label: 'Users', count: 1247 },
              { value: 'document', label: 'Documents', count: 3456 },
              { value: 'dashboard', label: 'Dashboards', count: 17 },
              { value: 'report', label: 'Reports', count: 892 },
              { value: 'alert', label: 'Alerts', count: 234 },
              { value: 'workflow', label: 'Workflows', count: 156 },
              { value: 'api', label: 'API Endpoints', count: 50 },
              { value: 'log', label: 'Logs', count: 12456 },
              { value: 'metric', label: 'Metrics', count: 789 }
            ],
            value: [],
            enabled: false
          },
          {
            id: 'category',
            name: 'Category',
            type: 'select',
            options: [
              { value: 'security', label: 'Security', count: 456 },
              { value: 'analytics', label: 'Analytics', count: 789 },
              { value: 'workflow', label: 'Workflow', count: 234 },
              { value: 'platform', label: 'Platform', count: 567 },
              { value: 'integration', label: 'Integration', count: 123 },
              { value: 'performance', label: 'Performance', count: 345 }
            ],
            value: '',
            enabled: false
          },
          {
            id: 'date_range',
            name: 'Date Range',
            type: 'date',
            value: { start: '', end: '' },
            enabled: false
          },
          {
            id: 'author',
            name: 'Author',
            type: 'select',
            options: [
              { value: 'system', label: 'System', count: 5678 },
              { value: 'admin', label: 'Admin', count: 1234 },
              { value: 'user', label: 'Users', count: 3456 }
            ],
            value: '',
            enabled: false
          }
        ]);

        // Initialize saved searches
        setSavedSearches([
          {
            id: '1',
            name: 'Security Alerts',
            query: 'security alert critical',
            filters: [],
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_used: new Date(Date.now() - 3600000).toISOString(),
            usage_count: 23,
            is_favorite: true
          },
          {
            id: '2',
            name: 'Performance Issues',
            query: 'performance slow response time',
            filters: [],
            created_at: new Date(Date.now() - 172800000).toISOString(),
            last_used: new Date(Date.now() - 7200000).toISOString(),
            usage_count: 15,
            is_favorite: false
          },
          {
            id: '3',
            name: 'User Analytics',
            query: 'user behavior analytics dashboard',
            filters: [],
            created_at: new Date(Date.now() - 259200000).toISOString(),
            last_used: new Date(Date.now() - 14400000).toISOString(),
            usage_count: 8,
            is_favorite: true
          }
        ]);

        // Initialize suggestions
        setSuggestions([
          { id: '1', text: 'security alerts', type: 'query', count: 234, icon: Shield },
          { id: '2', text: 'performance metrics', type: 'query', count: 456, icon: Activity },
          { id: '3', text: 'user analytics', type: 'query', count: 789, icon: Users },
          { id: '4', text: 'workflow automation', type: 'query', count: 123, icon: Zap },
          { id: '5', text: 'api documentation', type: 'query', count: 345, icon: Code }
        ]);

        setError(null);
      } catch (err) {
        setError('Failed to initialize search data');
        console.error('Error initializing search:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSearchData();
  }, []);

  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'alert',
          title: 'Critical Security Alert: Unusual Login Activity',
          description: 'Multiple failed login attempts detected from suspicious IP addresses',
          content: 'Security monitoring system has detected unusual login activity...',
          category: 'security',
          tags: ['security', 'alert', 'login', 'critical'],
          author: 'Security System',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          relevance_score: 0.95,
          metadata: { severity: 'critical', source: 'auth_monitor' },
          url: '/security/alerts/1'
        },
        {
          id: '2',
          type: 'dashboard',
          title: 'Revenue Analytics Dashboard',
          description: 'ML-powered revenue predictions and churn analysis',
          content: 'Comprehensive revenue analytics with machine learning predictions...',
          category: 'analytics',
          tags: ['analytics', 'revenue', 'ml', 'dashboard'],
          author: 'Analytics Team',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString(),
          relevance_score: 0.89,
          metadata: { views: 1247, last_accessed: new Date().toISOString() },
          url: '/analytics/revenue'
        },
        {
          id: '3',
          type: 'workflow',
          title: 'Data Processing Workflow',
          description: 'Automated data processing and transformation pipeline',
          content: 'Workflow for processing incoming data through multiple stages...',
          category: 'workflow',
          tags: ['workflow', 'automation', 'data', 'processing'],
          author: 'DevOps Team',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          relevance_score: 0.82,
          metadata: { executions: 156, success_rate: 98.5 },
          url: '/workflows/data-processing'
        },
        {
          id: '4',
          type: 'document',
          title: 'API Documentation - Authentication',
          description: 'Complete guide to API authentication and authorization',
          content: 'This document covers all aspects of API authentication...',
          category: 'documentation',
          tags: ['api', 'documentation', 'auth', 'guide'],
          author: 'Technical Writer',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 129600000).toISOString(),
          relevance_score: 0.76,
          metadata: { downloads: 234, rating: 4.8 },
          url: '/docs/api/auth'
        },
        {
          id: '5',
          type: 'metric',
          title: 'System Performance Metrics',
          description: 'Real-time system performance and health metrics',
          content: 'Current system performance indicators and trends...',
          category: 'performance',
          tags: ['metrics', 'performance', 'monitoring', 'system'],
          author: 'Monitoring System',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 300000).toISOString(),
          relevance_score: 0.71,
          metadata: { cpu_usage: 67.5, memory_usage: 78.2 },
          url: '/monitoring/metrics'
        }
      ];

      // Apply filters
      let filteredResults = mockResults;
      activeFilters.forEach(filter => {
        if (filter.enabled && filter.value) {
          switch (filter.id) {
            case 'type':
              if (Array.isArray(filter.value) && filter.value.length > 0) {
                filteredResults = filteredResults.filter(result => 
                  filter.value.includes(result.type)
                );
              }
              break;
            case 'category':
              if (filter.value) {
                filteredResults = filteredResults.filter(result => 
                  result.category === filter.value
                );
              }
              break;
          }
        }
      });

      // Apply sorting
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'relevance':
            comparison = b.relevance_score - a.relevance_score;
            break;
          case 'date':
            comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'author':
            comparison = (a.author || '').localeCompare(b.author || '');
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setSearchResults(filteredResults);
      setTotalResults(filteredResults.length);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleFilterChange = (filterId: string, value: any, enabled: boolean) => {
    setActiveFilters(prev => {
      const existing = prev.find(f => f.id === filterId);
      if (existing) {
        return prev.map(f => 
          f.id === filterId ? { ...f, value, enabled } : f
        );
      } else {
        const filter = filters.find(f => f.id === filterId);
        if (filter) {
          return [...prev, { ...filter, value, enabled }];
        }
      }
      return prev;
    });
  };

  const clearFilters = () => {
    setActiveFilters([]);
    performSearch(searchQuery);
  };

  const saveSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchQuery.slice(0, 50),
      query: searchQuery,
      filters: activeFilters,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      usage_count: 1,
      is_favorite: false
    };
    
    setSavedSearches(prev => [newSearch, ...prev]);
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setActiveFilters(savedSearch.filters);
    performSearch(savedSearch.query);
    
    // Update usage
    setSavedSearches(prev => prev.map(s => 
      s.id === savedSearch.id 
        ? { ...s, last_used: new Date().toISOString(), usage_count: s.usage_count + 1 }
        : s
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return User;
      case 'document': return FileText;
      case 'dashboard': return BarChart3;
      case 'report': return FileText;
      case 'alert': return Bell;
      case 'workflow': return Zap;
      case 'api': return Code;
      case 'log': return Database;
      case 'metric': return Activity;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'document': return 'text-gray-600 bg-gray-100';
      case 'dashboard': return 'text-green-600 bg-green-100';
      case 'report': return 'text-purple-600 bg-purple-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'workflow': return 'text-orange-600 bg-orange-100';
      case 'api': return 'text-teal-600 bg-teal-100';
      case 'log': return 'text-indigo-600 bg-indigo-100';
      case 'metric': return 'text-cyan-600 bg-cyan-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderSearchTab = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search across all platform data..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <Button size="sm" variant="ghost" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={() => handleSearch(searchQuery)}>
              Search
            </Button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon || Search;
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      setSearchQuery(suggestion.text);
                      handleSearch(suggestion.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{suggestion.text}</span>
                    <span className="text-xs text-gray-500">{suggestion.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {activeFilters.filter(f => f.enabled).length} filters active
            </span>
            {activeFilters.filter(f => f.enabled).length > 0 && (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {searchQuery && (
            <Button size="sm" variant="outline" onClick={saveSearch}>
              <Bookmark className="h-3 w-3 mr-1" />
              Save Search
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => handleSearch(searchQuery)}>Try Again</Button>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {totalResults.toLocaleString()} results found
            </p>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
            </div>
          </div>

          <div className="space-y-3">
            {searchResults.map((result) => {
              const TypeIcon = getTypeIcon(result.type);
              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 hover:text-blue-600">
                              {result.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                              {Math.round(result.relevance_score * 100)}% match
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span>Type: {result.type}</span>
                          <span>Category: {result.category}</span>
                          {result.author && <span>By: {result.author}</span>}
                          <span>Updated: {new Date(result.updated_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" size="xs" icon={null} onRemove={() => {}}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalResults > resultsPerPage && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => performSearch(searchQuery, currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= Math.ceil(totalResults / resultsPerPage)}
                onClick={() => performSearch(searchQuery, currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No results found for "{searchQuery}"</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Enter a search query to get started</p>
          <p className="text-sm text-gray-500 mt-2">Search across users, documents, dashboards, and more</p>
        </div>
      )}
    </div>
  );

  const renderFiltersTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
      
      <div className="space-y-4">
        {filters.map((filter) => {
          const activeFilter = activeFilters.find(f => f.id === filter.id);
          const isEnabled = activeFilter?.enabled || false;
          const currentValue = activeFilter?.value || filter.value;
          
          return (
            <Card key={filter.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{filter.name}</h4>
                  <Button
                    size="sm"
                    variant={isEnabled ? 'primary' : 'outline'}
                    onClick={() => handleFilterChange(filter.id, currentValue, !isEnabled)}
                  >
                    {isEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
                
                {filter.type === 'select' && filter.options && (
                  <select
                    value={currentValue}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value, isEnabled)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    disabled={!isEnabled}
                  >
                    <option value="">All {filter.name}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.count && `(${option.count})`}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'multiselect' && filter.options && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(currentValue) && currentValue.includes(option.value)}
                          onChange={(e) => {
                            const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
                            if (e.target.checked) {
                              newValue.push(option.value);
                            } else {
                              const index = newValue.indexOf(option.value);
                              if (index > -1) newValue.splice(index, 1);
                            }
                            handleFilterChange(filter.id, newValue, isEnabled);
                          }}
                          disabled={!isEnabled}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {option.label} {option.count && `(${option.count})`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderSavedTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Saved Searches</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </div>
      
      <div className="space-y-3">
        {savedSearches.map((savedSearch) => (
          <Card key={savedSearch.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{savedSearch.name}</h4>
                    {savedSearch.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">"{savedSearch.query}"</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {new Date(savedSearch.created_at).toLocaleDateString()}</span>
                    <span>Last used: {new Date(savedSearch.last_used).toLocaleDateString()}</span>
                    <span>Used {savedSearch.usage_count} times</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSavedSearches(prev => prev.map(s =>
                        s.id === savedSearch.id ? { ...s, is_favorite: !s.is_favorite } : s
                      ));
                    }}
                  >
                    <Star className={`h-3 w-3 ${savedSearch.is_favorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" onClick={() => loadSavedSearch(savedSearch)}>
                    Load
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Search Analytics</h3>
      
      {/* Search Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-blue-600">12,456</p>
                <p className="text-xs text-gray-500 mt-1">+23% this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Results</p>
                <p className="text-2xl font-bold text-green-600">47.3</p>
                <p className="text-xs text-gray-500 mt-1">per search</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-purple-600">68.4%</p>
                <p className="text-xs text-gray-500 mt-1">result clicks</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Searches</p>
                <p className="text-2xl font-bold text-orange-600">{savedSearches.length}</p>
                <p className="text-xs text-gray-500 mt-1">active saves</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Bookmark className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Search Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { term: 'security alerts', count: 1247, trend: '+15%' },
              { term: 'performance metrics', count: 892, trend: '+8%' },
              { term: 'user analytics', count: 756, trend: '+23%' },
              { term: 'workflow automation', count: 634, trend: '+12%' },
              { term: 'api documentation', count: 523, trend: '+5%' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.term}</h4>
                  <p className="text-sm text-gray-600">{item.count} searches</p>
                </div>
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  {item.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Search trends chart</p>
              <p className="text-sm text-gray-500">Search volume and patterns over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading && !searchResults.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Search</h1>
            <p className="text-gray-600">Intelligent search across all platform data</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'search', label: 'Search', icon: Search },
                { id: 'filters', label: 'Filters', icon: Filter },
                { id: 'saved', label: 'Saved', icon: Bookmark },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'filters' && renderFiltersTab()}
          {activeTab === 'saved' && renderSavedTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedResult.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedResult.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedResult.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Type</h4>
                  <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                    {selectedResult.type}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                  <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                    {selectedResult.category}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Author</h4>
                  <p className="text-gray-600">{selectedResult.author || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Relevance</h4>
                  <p className="text-gray-600">{Math.round(selectedResult.relevance_score * 100)}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedResult.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm" icon={null} onRemove={() => {}}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedResult(null)}>
                  Close
                </Button>
                {selectedResult.url && (
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};