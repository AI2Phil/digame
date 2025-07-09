import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Fetch bundle analysis data
  const fetchBundleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate webpack bundle analysis
      const mockAssets: BundleAsset[] = [
        {
          name: 'main.js',
          size: 245760,
          gzipSize: 67890,
          type: 'js',
          chunks: ['main'],
          modules: ['./src/index.tsx', './src/App.tsx', 'react', 'react-dom'],
          isEntry: true,
          isInitial: true,
          optimizationScore: 7.2,
          suggestions: [
            'Consider code splitting for vendor libraries',
            'Remove unused exports from utility modules'
          ]
        },
        {
          name: 'vendor.js',
          size: 512340,
          gzipSize: 156780,
          type: 'js',
          chunks: ['vendor'],
          modules: ['react', 'react-dom', 'lodash', 'moment'],
          isEntry: false,
          isInitial: true,
          optimizationScore: 5.8,
          suggestions: [
            'Replace moment.js with date-fns for smaller bundle',
            'Use lodash-es for better tree shaking',
            'Consider splitting vendor chunk further'
          ]
        },
        {
          name: 'styles.css',
          size: 89340,
          gzipSize: 23450,
          type: 'css',
          chunks: ['main'],
          modules: ['./src/styles/main.css', './src/components/**/*.css'],
          isEntry: false,
          isInitial: true,
          optimizationScore: 8.5,
          suggestions: [
            'Consider CSS-in-JS for better tree shaking',
            'Optimize unused CSS rules'
          ]
        },
        {
          name: 'dashboard.chunk.js',
          size: 178920,
          gzipSize: 45670,
          type: 'js',
          chunks: ['dashboard'],
          modules: ['./src/pages/dashboard/**/*', 'chart.js'],
          isEntry: false,
          isInitial: false,
          optimizationScore: 6.9,
          suggestions: [
            'Lazy load chart.js only when needed',
            'Split dashboard components into smaller chunks'
          ]
        },
        {
          name: 'analytics.chunk.js',
          size: 234560,
          gzipSize: 67890,
          type: 'js',
          chunks: ['analytics'],
          modules: ['./src/pages/analytics/**/*', 'd3', 'recharts'],
          isEntry: false,
          isInitial: false,
          optimizationScore: 5.4,
          suggestions: [
            'Consider lighter charting library alternatives',
            'Implement dynamic imports for visualization components'
          ]
        },
        {
          name: 'images/hero.jpg',
          size: 456780,
          gzipSize: 456780,
          type: 'image',
          chunks: [],
          modules: [],
          isEntry: false,
          isInitial: false,
          optimizationScore: 4.2,
          suggestions: [
            'Optimize image compression',
            'Consider WebP format',
            'Implement responsive images'
          ]
        }
      ];

      const mockChunks: BundleChunk[] = [
        {
          id: 'main',
          name: 'main',
          size: 335100,
          files: ['main.js', 'styles.css'],
          modules: [],
          isEntry: true,
          isInitial: true,
          parents: [],
          children: ['dashboard', 'analytics']
        },
        {
          id: 'vendor',
          name: 'vendor',
          size: 512340,
          files: ['vendor.js'],
          modules: [],
          isEntry: false,
          isInitial: true,
          parents: [],
          children: []
        },
        {
          id: 'dashboard',
          name: 'dashboard',
          size: 178920,
          files: ['dashboard.chunk.js'],
          modules: [],
          isEntry: false,
          isInitial: false,
          parents: ['main'],
          children: []
        },
        {
          id: 'analytics',
          name: 'analytics',
          size: 234560,
          files: ['analytics.chunk.js'],
          modules: [],
          isEntry: false,
          isInitial: false,
          parents: ['main'],
          children: []
        }
      ];

      const mockStats: BundleStats = {
        totalSize: 1717100,
        totalGzipSize: 818660,
        assetCount: 6,
        chunkCount: 4,
        moduleCount: 247,
        duplicateModules: 12,
        unusedAssets: 3,
        compressionRatio: 0.477,
        loadTime: 2.34,
        parseTime: 0.89
      };

      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: '1',
          type: 'code_splitting',
          priority: 'high',
          title: 'Implement Route-Based Code Splitting',
          description: 'Split your application by routes to reduce initial bundle size',
          impact: '30-40% reduction in initial load time',
          effort: 'medium',
          savingsEstimate: 245760,
          implementation: [
            'Use React.lazy() for route components',
            'Implement Suspense boundaries',
            'Configure webpack splitChunks optimization'
          ]
        },
        {
          id: '2',
          type: 'tree_shaking',
          priority: 'high',
          title: 'Optimize Vendor Dependencies',
          description: 'Replace heavy libraries with lighter alternatives',
          impact: '25-35% reduction in vendor bundle size',
          effort: 'medium',
          savingsEstimate: 156780,
          implementation: [
            'Replace moment.js with date-fns',
            'Use lodash-es instead of lodash',
            'Remove unused library exports'
          ]
        },
        {
          id: '3',
          type: 'asset_optimization',
          priority: 'medium',
          title: 'Optimize Image Assets',
          description: 'Compress and modernize image formats',
          impact: '50-60% reduction in image sizes',
          effort: 'low',
          savingsEstimate: 228390,
          implementation: [
            'Convert images to WebP format',
            'Implement responsive images',
            'Use image compression tools'
          ]
        },
        {
          id: '4',
          type: 'lazy_loading',
          priority: 'medium',
          title: 'Implement Component Lazy Loading',
          description: 'Lazy load heavy components and libraries',
          impact: '15-25% improvement in initial load',
          effort: 'low',
          savingsEstimate: 89340,
          implementation: [
            'Lazy load chart libraries',
            'Implement intersection observer for below-fold components',
            'Use dynamic imports for heavy utilities'
          ]
        },
        {
          id: '5',
          type: 'compression',
          priority: 'low',
          title: 'Enable Advanced Compression',
          description: 'Implement Brotli compression for better compression ratios',
          impact: '10-15% additional size reduction',
          effort: 'low',
          savingsEstimate: 81866,
          implementation: [
            'Configure Brotli compression on server',
            'Enable compression for all text assets',
            'Optimize compression settings'
          ]
        }
      ];

      setAssets(mockAssets);
      setChunks(mockChunks);
      setStats(mockStats);
      setRecommendations(mockRecommendations);
    } catch (err) {
      setError('Failed to fetch bundle analysis data');
      console.error('Bundle analyzer error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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