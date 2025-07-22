import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

import {
  Package,
  FileText,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Minimize2,
  Maximize2,
  Code,
  Image,
  FileCode,
  Layers
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';

interface BundleAsset {
  name: string;
  size: number;
  gzipSize: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  chunks: string[];
  modules: string[];
  isEntry: boolean;
  isInitial: boolean;
  optimizationScore: number;
  suggestions: string[];
}

interface BundleChunk {
  id: string;
  name: string;
  size: number;
  files: string[];
  modules: ModuleInfo[];
  isEntry: boolean;
  isInitial: boolean;
  parents: string[];
  children: string[];
}

interface ModuleInfo {
  id: string;
  name: string;
  size: number;
  chunks: string[];
  issuer: string | null;
  reasons: string[];
  type: 'module' | 'asset' | 'dependency';
  optimizable: boolean;
  duplicated: boolean;
}

interface BundleStats {
  totalSize: number;
  totalGzipSize: number;
  assetCount: number;
  chunkCount: number;
  moduleCount: number;
  duplicateModules: number;
  unusedAssets: number;
  compressionRatio: number;
  loadTime: number;
  parseTime: number;
}

interface OptimizationRecommendation {
  id: string;
  type: 'code_splitting' | 'tree_shaking' | 'compression' | 'lazy_loading' | 'asset_optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  savingsEstimate: number;
  implementation: string[];
}

interface BundleAnalyzerProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  className = '',
  autoRefresh = false,
  refreshInterval = 60000
}) => {
  const [assets, setAssets] = useState<BundleAsset[]>([]);
  const [chunks, setChunks] = useState<BundleChunk[]>([]);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'assets' | 'chunks' | 'modules' | 'recommendations'>('assets');
  const [sortBy, setSortBy] = useState<'size' | 'name' | 'type'>('size');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { success, error: showError, warning, info } = useToastHelpers();

  // Fetch bundle analysis data from database-driven API
  const fetchBundleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallbackData(false);

      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch bundle analysis data from database-driven API
      const response = await fetch(`${replaceApiUrl("")}/api/performance/bundle-analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
        setChunks(data.chunks || []);
        setStats(data.stats || null);
        setRecommendations(data.recommendations || []);
        success('Bundle analysis data loaded successfully');
      } else {
        throw new Error(`Failed to fetch bundle analysis data: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch bundle analysis data:', err);
      setUsingFallbackData(true);
      warning(`Using sample data: ${err.message}`);
      
      // Enhanced fallback data with realistic Digame platform bundle patterns
      const fallbackAssets: BundleAsset[] = [
        {
          name: 'digame-main.js',
          size: 387650,
          gzipSize: 98234,
          type: 'js',
          chunks: ['main'],
          modules: ['./src/index.tsx', './src/App.tsx', 'react', 'react-dom', '@tanstack/react-query'],
          isEntry: true,
          isInitial: true,
          optimizationScore: 6.8,
          suggestions: [
            'Consider code splitting for digital twin components',
            'Remove unused exports from utility modules',
            'Implement lazy loading for heavy dashboard components'
          ]
        },
        {
          name: 'vendor-core.js',
          size: 678920,
          gzipSize: 189456,
          type: 'js',
          chunks: ['vendor-core'],
          modules: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lucide-react'],
          isEntry: false,
          isInitial: true,
          optimizationScore: 5.2,
          suggestions: [
            'Split vendor chunk into framework and utilities',
            'Use tree shaking for lucide-react icons',
            'Consider replacing heavy dependencies with lighter alternatives',
            'Implement selective imports for large libraries'
          ]
        },
        {
          name: 'digital-twin.chunk.js',
          size: 298760,
          gzipSize: 76543,
          type: 'js',
          chunks: ['digital-twin'],
          modules: ['./src/components/digital-twin/**/*', 'd3', 'recharts', 'tensorflow'],
          isEntry: false,
          isInitial: false,
          optimizationScore: 4.9,
          suggestions: [
            'Lazy load TensorFlow.js only when AI features are used',
            'Split chart libraries into separate chunks',
            'Implement dynamic imports for complex visualizations',
            'Consider lighter alternatives to D3.js for simple charts'
          ]
        },
        {
          name: 'analytics-dashboard.chunk.js',
          size: 234890,
          gzipSize: 67234,
          type: 'js',
          chunks: ['analytics'],
          modules: ['./src/components/analytics/**/*', 'chart.js', 'date-fns', 'lodash'],
          isEntry: false,
          isInitial: false,
          optimizationScore: 6.3,
          suggestions: [
            'Use lodash-es for better tree shaking',
            'Lazy load chart.js components on demand',
            'Split analytics components by feature area'
          ]
        },
        {
          name: 'platform-styles.css',
          size: 145670,
          gzipSize: 34567,
          type: 'css',
          chunks: ['main'],
          modules: ['./src/styles/globals.css', './src/components/**/*.css', 'tailwindcss'],
          isEntry: false,
          isInitial: true,
          optimizationScore: 7.8,
          suggestions: [
            'Purge unused Tailwind CSS classes',
            'Consider CSS-in-JS for component-specific styles',
            'Optimize critical CSS for above-the-fold content'
          ]
        },
        {
          name: 'performance-monitoring.chunk.js',
          size: 167890,
          gzipSize: 45123,
          type: 'js',
          chunks: ['performance'],
          modules: ['./src/components/performance/**/*', 'web-vitals', 'performance-observer'],
          isEntry: false,
          isInitial: false,
          optimizationScore: 7.1,
          suggestions: [
            'Lazy load performance monitoring tools',
            'Split monitoring components by functionality'
          ]
        },
        {
          name: 'assets/platform-hero.webp',
          size: 234560,
          gzipSize: 234560,
          type: 'image',
          chunks: [],
          modules: [],
          isEntry: false,
          isInitial: false,
          optimizationScore: 8.2,
          suggestions: [
            'Implement responsive image loading',
            'Consider progressive JPEG for complex images'
          ]
        },
        {
          name: 'fonts/inter-variable.woff2',
          size: 89340,
          gzipSize: 89340,
          type: 'font',
          chunks: [],
          modules: [],
          isEntry: false,
          isInitial: false,
          optimizationScore: 9.1,
          suggestions: []
        }
      ];

      const fallbackChunks: BundleChunk[] = [
        {
          id: 'main',
          name: 'main',
          size: 533320,
          files: ['digame-main.js', 'platform-styles.css'],
          modules: [],
          isEntry: true,
          isInitial: true,
          parents: [],
          children: ['digital-twin', 'analytics', 'performance']
        },
        {
          id: 'vendor-core',
          name: 'vendor-core',
          size: 678920,
          files: ['vendor-core.js'],
          modules: [],
          isEntry: false,
          isInitial: true,
          parents: [],
          children: []
        },
        {
          id: 'digital-twin',
          name: 'digital-twin',
          size: 298760,
          files: ['digital-twin.chunk.js'],
          modules: [],
          isEntry: false,
          isInitial: false,
          parents: ['main'],
          children: []
        },
        {
          id: 'analytics',
          name: 'analytics',
          size: 234890,
          files: ['analytics-dashboard.chunk.js'],
          modules: [],
          isEntry: false,
          isInitial: false,
          parents: ['main'],
          children: []
        },
        {
          id: 'performance',
          name: 'performance',
          size: 167890,
          files: ['performance-monitoring.chunk.js'],
          modules: [],
          isEntry: false,
          isInitial: false,
          parents: ['main'],
          children: []
        }
      ];

      const fallbackStats: BundleStats = {
        totalSize: 2237230,
        totalGzipSize: 1045157,
        assetCount: 8,
        chunkCount: 5,
        moduleCount: 342,
        duplicateModules: 18,
        unusedAssets: 5,
        compressionRatio: 0.467,
        loadTime: 3.12,
        parseTime: 1.23
      };

      const fallbackRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec_001',
          type: 'code_splitting',
          priority: 'high',
          title: 'Implement Advanced Route-Based Code Splitting for Digital Twin Features',
          description: 'Split digital twin components by functionality to reduce initial bundle size and improve loading performance',
          impact: '35-45% reduction in initial load time for non-AI users',
          effort: 'medium',
          savingsEstimate: 298760,
          implementation: [
            'Use React.lazy() for digital twin dashboard components',
            'Implement Suspense boundaries with loading states',
            'Split AI/ML features into separate chunks',
            'Configure webpack splitChunks for optimal chunking strategy'
          ]
        },
        {
          id: 'rec_002',
          type: 'tree_shaking',
          priority: 'high',
          title: 'Optimize Heavy Dependencies and Library Usage',
          description: 'Replace heavy libraries with lighter alternatives and improve tree shaking',
          impact: '40-50% reduction in vendor bundle size',
          effort: 'medium',
          savingsEstimate: 267368,
          implementation: [
            'Replace TensorFlow.js with lighter ML alternatives for simple tasks',
            'Use lodash-es instead of lodash for better tree shaking',
            'Implement selective imports for D3.js and Chart.js',
            'Remove unused Lucide React icons'
          ]
        },
        {
          id: 'rec_003',
          type: 'lazy_loading',
          priority: 'high',
          title: 'Implement Smart Lazy Loading for Analytics and Performance Components',
          description: 'Lazy load analytics dashboards and performance monitoring tools based on user access patterns',
          impact: '25-35% improvement in initial page load',
          effort: 'low',
          savingsEstimate: 402780,
          implementation: [
            'Lazy load analytics dashboard components',
            'Implement intersection observer for performance monitoring widgets',
            'Use dynamic imports for chart libraries',
            'Load monitoring tools only when performance tab is accessed'
          ]
        },
        {
          id: 'rec_004',
          type: 'asset_optimization',
          priority: 'medium',
          title: 'Optimize Platform Assets and Images',
          description: 'Implement advanced image optimization and modern formats for better performance',
          impact: '60-70% reduction in image asset sizes',
          effort: 'low',
          savingsEstimate: 140736,
          implementation: [
            'Convert all images to WebP format with JPEG fallbacks',
            'Implement responsive image loading with srcset',
            'Use progressive JPEG for complex hero images',
            'Optimize font loading with font-display: swap'
          ]
        },
        {
          id: 'rec_005',
          type: 'compression',
          priority: 'medium',
          title: 'Enable Advanced Compression and Caching Strategies',
          description: 'Implement Brotli compression and optimize caching headers for better performance',
          impact: '15-20% additional size reduction with improved caching',
          effort: 'low',
          savingsEstimate: 156773,
          implementation: [
            'Configure Brotli compression on server for all text assets',
            'Implement service worker for intelligent caching',
            'Optimize cache headers for static assets',
            'Enable HTTP/2 push for critical resources'
          ]
        }
      ];

      setAssets(fallbackAssets);
      setChunks(fallbackChunks);
      setStats(fallbackStats);
      setRecommendations(fallbackRecommendations);
      setError(`Failed to load bundle analysis data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [success, warning]);

  useEffect(() => {
    fetchBundleData();

    if (autoRefresh) {
      const interval = setInterval(fetchBundleData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBundleData, autoRefresh, refreshInterval]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(asset => asset.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, filterType, searchTerm, sortBy]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'js':
        return <Code className="w-4 h-4 text-yellow-600" />;
      case 'css':
        return <FileCode className="w-4 h-4 text-blue-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-green-600" />;
      case 'font':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'code_splitting':
        return 'text-blue-600 bg-blue-100';
      case 'tree_shaking':
        return 'text-green-600 bg-green-100';
      case 'compression':
        return 'text-purple-600 bg-purple-100';
      case 'lazy_loading':
        return 'text-orange-600 bg-orange-100';
      case 'asset_optimization':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bundle Analyzer</h2>
              <p className="text-sm text-gray-600">Analyze and optimize your application bundle</p>
              {usingFallbackData && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  Demo Data
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchBundleData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bundle Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Size</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{formatSize(stats.totalSize)}</div>
              <div className="text-xs text-blue-700">
                {formatSize(stats.totalGzipSize)} gzipped ({(stats.compressionRatio * 100).toFixed(1)}%)
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Assets</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.assetCount}</div>
              <div className="text-xs text-green-700">{stats.chunkCount} chunks, {stats.moduleCount} modules</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Issues</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{stats.duplicateModules}</div>
              <div className="text-xs text-yellow-700">duplicate modules, {stats.unusedAssets} unused assets</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Load Time</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.loadTime}s</div>
              <div className="text-xs text-purple-700">{stats.parseTime}s parse time</div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'assets', label: 'Assets', icon: <Package className="w-4 h-4" /> },
              { id: 'chunks', label: 'Chunks', icon: <Layers className="w-4 h-4" /> },
              { id: 'recommendations', label: 'Recommendations', icon: <CheckCircle className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Assets View */}
        {selectedView === 'assets' && (
          <div>
            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="js">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="image">Images</option>
                  <option value="font">Fonts</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="size">Size</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {/* Assets List */}
            <div className="space-y-3">
              {filteredAssets.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getTypeIcon(asset.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{asset.name}</span>
                          {asset.isEntry && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Entry
                            </span>
                          )}
                          {asset.isInitial && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Initial
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {asset.chunks.length > 0 && `Chunks: ${asset.chunks.join(', ')}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatSize(asset.size)}</div>
                        <div className="text-xs text-gray-500">{formatSize(asset.gzipSize)} gzipped</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOptimizationColor(asset.optimizationScore)}`}>
                          {asset.optimizationScore.toFixed(1)}/10
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDetails(showDetails === asset.name ? null : asset.name)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showDetails === asset.name ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {showDetails === asset.name && asset.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-2">Optimization Suggestions:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {asset.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chunks View */}
        {selectedView === 'chunks' && (
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Bundle Chunks</h3>
            <div className="space-y-3">
              {chunks.map((chunk) => (
                <div key={chunk.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{chunk.name}</span>
                          {chunk.isEntry && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Entry
                            </span>
                          )}
                          {chunk.isInitial && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Initial
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Files: {chunk.files.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatSize(chunk.size)}</div>
                      <div className="text-xs text-gray-500">{chunk.files.length} files</div>
                    </div>
                  </div>
                  
                  {(chunk.parents.length > 0 || chunk.children.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                      {chunk.parents.length > 0 && (
                        <div>Parents: {chunk.parents.join(', ')}</div>
                      )}
                      {chunk.children.length > 0 && (
                        <div>Children: {chunk.children.join(', ')}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations View */}
        {selectedView === 'recommendations' && (
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Optimization Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(rec.type)}`}>
                          {rec.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Effort: {rec.effort}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Impact: {rec.impact} (Save ~{formatSize(rec.savingsEstimate)})
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Implementation Steps:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {rec.implementation.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleAnalyzer;