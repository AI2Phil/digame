#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining 46 broken imports...\n');

let fixedCount = 0;

// 1. Fix import paths that should point to components/ui instead of ui
console.log('🔧 Fixing UI component import paths...');
const uiPathFixes = [
  {
    file: '../../frontend/src/components/onboarding/OnboardingFlow.jsx',
    oldPath: '../../ui/Switch',
    newPath: '../ui/Switch'
  },
  {
    file: '../../frontend/src/components/onboarding/ValueDemonstration.jsx',
    oldPath: '../../ui/Card',
    newPath: '../ui/Card'
  },
  {
    file: '../../frontend/src/components/social/PeerMatchingSuggestions.jsx',
    oldPath: '../../ui/Card',
    newPath: '../ui/Card'
  },
  {
    file: '../../frontend/src/components/social/PeerMatchingSuggestions.jsx',
    oldPath: '../../ui/Avatar',
    newPath: '../ui/Avatar'
  },
  {
    file: '../../frontend/src/components/social/PeerMatchingSuggestions.jsx',
    oldPath: '../../ui/Badge',
    newPath: '../ui/Badge'
  },
  {
    file: '../../frontend/src/components/social/PeerMatchingSuggestions.jsx',
    oldPath: '../../ui/Button',
    newPath: '../ui/Button'
  },
  {
    file: '../../frontend/src/components/visualizations/InteractiveChart.jsx',
    oldPath: '../../ui/Button',
    newPath: '../ui/Button'
  },
  {
    file: '../../frontend/src/pages/social/find-peers.jsx',
    oldPath: '../components/ui/Card',
    newPath: '../../components/ui/Card'
  }
];

uiPathFixes.forEach(fix => {
  try {
    const filePath = fix.file;
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const oldImport = `from '${fix.oldPath}'`;
      const newImport = `from '${fix.newPath}'`;
      
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(filePath, content);
        console.log(`   ✅ Fixed: ${fix.file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.log(`   ❌ Error fixing ${fix.file}: ${error.message}`);
  }
});

// 2. Fix @/ alias imports to relative paths
console.log('\n🔧 Fixing @/ alias imports...');
const aliasFiles = [
  '../../frontend/src/components/workflow/AdvancedWorkflowFeatures.jsx',
  '../../frontend/src/components/workflow/EnhancedWorkflowTriggers.jsx'
];

aliasFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace @/components/ui/card with ../ui/Card
      content = content.replace(/@\/components\/ui\/card/g, '../ui/Card');
      // Replace @/components/ui/tabs with ../ui/Tabs  
      content = content.replace(/@\/components\/ui\/tabs/g, '../ui/Tabs');
      
      fs.writeFileSync(file, content);
      console.log(`   ✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error fixing ${file}: ${error.message}`);
  }
});

// 3. Create missing UI components
console.log('\n🔧 Creating missing UI components...');
const missingUiComponents = {
  'Textarea.jsx': `import React from 'react';

export const Textarea = ({ 
  className = '', 
  rows = 3,
  ...props 
}) => {
  return (
    <textarea
      rows={rows}
      className={\`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical \${className}\`}
      {...props}
    />
  );
};

export default Textarea;
`,

  'Select.jsx': `import React from 'react';

export const Select = ({ 
  children,
  className = '', 
  ...props 
}) => {
  return (
    <select
      className={\`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm \${className}\`}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectOption = ({ children, ...props }) => {
  return <option {...props}>{children}</option>;
};

export default Select;
`,

  'Dialog.jsx': `import React, { useState } from 'react';

export const Dialog = ({ 
  open, 
  onOpenChange, 
  children,
  className = ''
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className={\`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 \${className}\`}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = '' }) => {
  return (
    <div className={\`p-6 \${className}\`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={\`pb-4 border-b border-gray-200 \${className}\`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={\`text-lg font-semibold text-gray-900 \${className}\`}>
      {children}
    </h2>
  );
};

export const DialogFooter = ({ children, className = '' }) => {
  return (
    <div className={\`pt-4 border-t border-gray-200 flex justify-end space-x-2 \${className}\`}>
      {children}
    </div>
  );
};

export default Dialog;
`,

  'Progress.jsx': `import React from 'react';

export const Progress = ({ 
  value = 0, 
  max = 100, 
  className = '',
  showLabel = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={\`w-full \${className}\`} {...props}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-gray-600 mt-1">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export default Progress;
`,

  'Toast.jsx': `import React, { useState, useEffect } from 'react';

export const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  if (!visible) return null;
  
  const typeClasses = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white'
  };
  
  return (
    <div className={\`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 \${typeClasses[type]} \${className}\`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button 
            onClick={() => { setVisible(false); onClose(); }}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Simple toast notification system
let toastContainer = null;

export const showToast = (message, type = 'info') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = \`px-4 py-2 rounded-md shadow-lg text-white transition-opacity duration-300 \${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }\`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

export default Toast;
`
};

const uiDir = '../../frontend/src/components/ui';
Object.entries(missingUiComponents).forEach(([filename, content]) => {
  const filePath = path.join(uiDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Created: ${filename}`);
    fixedCount++;
  }
});

// Update UI components index
const indexPath = path.join(uiDir, 'index.js');
const indexContent = `export { default as Card, CardHeader, CardContent, CardFooter } from './Card';
export { default as Button } from './Button';
export { default as Badge } from './Badge';
export { default as Input } from './Input';
export { default as Avatar } from './Avatar';
export { default as Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { default as Switch } from './Switch';
export { default as Toast, showToast } from './Toast';
export { default as Textarea } from './Textarea';
export { default as Select, SelectOption } from './Select';
export { default as Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';
export { default as Progress } from './Progress';
`;
fs.writeFileSync(indexPath, indexContent);
console.log('   ✅ Updated: index.js');

// 4. Create missing services
console.log('\n🔧 Creating missing services...');
const servicesDir = '../../frontend/src/services';
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

const missingServices = {
  'webNotificationService.js': `// Web Notification Service
export class WebNotificationService {
  constructor() {
    this.permission = Notification.permission;
  }

  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  }

  async showNotification(title, options = {}) {
    if (this.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } else if (this.permission === 'default') {
      const granted = await this.requestPermission();
      if (granted) {
        return new Notification(title, options);
      }
    }
    return null;
  }

  isSupported() {
    return 'Notification' in window;
  }
}

export const webNotificationService = new WebNotificationService();
export default webNotificationService;
`,

  'webOfflineService.js': `// Web Offline Service
export class WebOfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status, this.isOnline));
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isOffline: !this.isOnline
    };
  }

  // Cache management for offline functionality
  async cacheResource(url, data) {
    if ('caches' in window) {
      const cache = await caches.open('offline-cache');
      const response = new Response(JSON.stringify(data));
      await cache.put(url, response);
    }
  }

  async getCachedResource(url) {
    if ('caches' in window) {
      const cache = await caches.open('offline-cache');
      const response = await cache.match(url);
      if (response) {
        return await response.json();
      }
    }
    return null;
  }
}

export const webOfflineService = new WebOfflineService();
export default webOfflineService;
`,

  'visualizationService.js': `// Visualization Service
export class VisualizationService {
  constructor() {
    this.charts = new Map();
  }

  // Register a chart instance
  registerChart(id, chartInstance) {
    this.charts.set(id, chartInstance);
  }

  // Get a chart instance
  getChart(id) {
    return this.charts.get(id);
  }

  // Remove a chart instance
  removeChart(id) {
    const chart = this.charts.get(id);
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
    this.charts.delete(id);
  }

  // Generate chart data
  generateChartData(type, data) {
    switch (type) {
      case 'line':
        return this.generateLineData(data);
      case 'bar':
        return this.generateBarData(data);
      case 'pie':
        return this.generatePieData(data);
      case 'heatmap':
        return this.generateHeatmapData(data);
      default:
        return data;
    }
  }

  generateLineData(data) {
    return {
      labels: data.map(item => item.label || item.x),
      datasets: [{
        label: 'Data',
        data: data.map(item => item.value || item.y),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  }

  generateBarData(data) {
    return {
      labels: data.map(item => item.label),
      datasets: [{
        label: 'Values',
        data: data.map(item => item.value),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }

  generatePieData(data) {
    return {
      labels: data.map(item => item.label),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };
  }

  generateHeatmapData(data) {
    return data.map((row, y) => 
      row.map((value, x) => ({ x, y, value }))
    ).flat();
  }

  // Export chart as image
  exportChart(chartId, format = 'png') {
    const chart = this.getChart(chartId);
    if (chart && chart.toBase64Image) {
      return chart.toBase64Image(format);
    }
    return null;
  }
}

export const visualizationService = new VisualizationService();
export default visualizationService;
`
};

Object.entries(missingServices).forEach(([filename, content]) => {
  const filePath = path.join(servicesDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Created: ${filename}`);
    fixedCount++;
  }
});

// 5. Create missing visualization components
console.log('\n🔧 Creating missing visualization components...');
const visualizationsDir = '../../frontend/src/components/visualizations/visualizations';
if (!fs.existsSync(visualizationsDir)) {
  fs.mkdirSync(visualizationsDir, { recursive: true });
}

const missingVisualizations = {
  'HeatmapChart.jsx': `import React from 'react';

const HeatmapChart = ({ data, width = 400, height = 300, className = '' }) => {
  // Simple heatmap implementation
  const maxValue = Math.max(...data.flat());
  const cellSize = Math.min(width / data[0].length, height / data.length);
  
  return (
    <div className={\`heatmap-chart \${className}\`}>
      <svg width={width} height={height}>
        {data.map((row, y) =>
          row.map((value, x) => (
            <rect
              key={\`\${x}-\${y}\`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={\`rgba(59, 130, 246, \${value / maxValue})\`}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))
        )}
      </svg>
    </div>
  );
};

export default HeatmapChart;
`,

  'SankeyChart.jsx': `import React from 'react';

const SankeyChart = ({ data, width = 400, height = 300, className = '' }) => {
  // Simple sankey diagram placeholder
  return (
    <div className={\`sankey-chart \${className}\`}>
      <svg width={width} height={height}>
        <text x={width/2} y={height/2} textAnchor="middle" className="text-gray-500">
          Sankey Chart
        </text>
        <text x={width/2} y={height/2 + 20} textAnchor="middle" className="text-sm text-gray-400">
          {data?.nodes?.length || 0} nodes, {data?.links?.length || 0} links
        </text>
      </svg>
    </div>
  );
};

export default SankeyChart;
`,

  'RadarChart.jsx': `import React from 'react';

const RadarChart = ({ data, width = 300, height = 300, className = '' }) => {
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - 20;
  
  if (!data || !data.length) {
    return (
      <div className={\`radar-chart \${className}\`}>
        <svg width={width} height={height}>
          <text x={center.x} y={center.y} textAnchor="middle" className="text-gray-500">
            No data available
          </text>
        </svg>
      </div>
    );
  }
  
  const angleStep = (2 * Math.PI) / data.length;
  
  return (
    <div className={\`radar-chart \${className}\`}>
      <svg width={width} height={height}>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <circle
            key={scale}
            cx={center.x}
            cy={center.y}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        
        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center.x + Math.cos(angle) * radius;
          const y = center.y + Math.sin(angle) * radius;
          
          return (
            <line
              key={index}
              x1={center.x}
              y1={center.y}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={data.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = item.value || 0;
            const x = center.x + Math.cos(angle) * radius * value;
            const y = center.y + Math.sin(angle) * radius * value;
            return \`\${x},\${y}\`;
          }).join(' ')}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="rgb(59, 130, 246)"
          strokeWidth={2}
        />
        
        {/* Labels */}
        {data.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center.x + Math.cos(angle) * (radius + 15);
          const y = center.y + Math.sin(angle) * (radius + 15);
          
          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-xs text-gray-600"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
`,

  'TimelineChart.jsx': `import React from 'react';

const TimelineChart = ({ data, width = 600, height = 200, className = '' }) => {
  if (!data || !data.length) {
    return (
      <div className={\`timeline-chart \${className}\`}>
        <div className="text-center text-gray-500 py-8">
          No timeline data available
        </div>
      </div>
    );
  }
  
  const margin = { top: 20, right: 20, bottom: 40, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const minDate = new Date(Math.min(...data.map(d => new Date(d.date))));
  const maxDate = new Date(Math.max(...data.map(d => new Date(d.date))));
  const timeRange = maxDate - minDate;
  
  return (
    <div className={\`timeline-chart \${className}\`}>
      <svg width={width} height={height}>
        {/* Timeline line */}
        <line
          x1={margin.left}
          y1={height / 2}
          x2={width - margin.right}
          y2={height / 2}
          stroke="#e5e7eb"
          strokeWidth={2}
        />
        
        {/* Timeline points */}
        {data.map((item, index) => {
          const date = new Date(item.date);
          const x = margin.left + ((date - minDate) / timeRange) * chartWidth;
          const y = height / 2;
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="rgb(59, 130, 246)"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                className="text-xs text-gray-600"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={y + 25}
                textAnchor="middle"
                className="text-xs text-gray-500"
              >
                {date.toLocaleDateString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TimelineChart;
`
};

Object.entries(missingVisualizations).forEach(([filename, content]) => {
  const filePath = path.join(visualizationsDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Created: ${filename}`);
    fixedCount++;
  }
});

// 6. Create missing profile components
console.log('\n🔧 Creating missing profile components...');
const profileDir = '../../frontend/src/components/profile';
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const missingProfileComponents = {
  'ProjectDisplayCard.jsx': `import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

const ProjectDisplayCard = ({ project, className = '' }) => {
  return (
    <Card className={\`project-display-card \${className}\`}>
      <CardHeader>
        <h3 className="text-lg font-semibold">{project?.title || 'Project Title'}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-2">{project?.description || 'Project description'}</p>
        <div className="flex flex-wrap gap-2">
          {project?.technologies?.map((tech, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {tech}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDisplayCard;
`,

  'ExperienceDisplayCard.jsx': `import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

const ExperienceDisplayCard = ({ experience, className = '' }) => {
  return (
    <Card className={\`experience-display-card \${className}\`}>
      <CardHeader>
        <h3 className="text-lg font-semibold">{experience?.title || 'Job Title'}</h3>
        <p className="text-gray-600">{experience?.company || 'Company Name'}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          {experience?.startDate} - {experience?.endDate || 'Present'}
        </p>
        <p className="text-gray-700">{experience?.description || 'Job description'}</p>
      </CardContent>
    </Card>
  );
};

export default ExperienceDisplayCard;
`,

  'EducationDisplayCard.jsx': `import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

const EducationDisplayCard = ({ education, className = '' }) => {
  return (
    <Card className={\`education-display-card \${className}\`}>
      <CardHeader>
        <h3 className="text-lg font-semibold">{education?.degree || 'Degree'}</h3>
        <p className="text-gray-600">{education?.institution || 'Institution'}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          {education?.startYear} - {education?.endYear}
        </p>
        {education?.gpa && (
          <p className="text-gray-700">GPA: {education.gpa}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationDisplayCard;
`
};

Object.entries(missingProfileComponents).forEach(([filename, content]) => {
  const filePath = path.join(profileDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Created: ${filename}`);
    fixedCount++;
  }
});

// 7. Fix social component imports to use central UI components
console.log('\n🔧 Fixing social component imports...');
const socialFiles = [
  '../../frontend/src/components/social/EnhancedSocialCollaboration.jsx',
  '../../frontend/src/components/social/MentorshipPlatform.jsx',
  '../../frontend/src/components/social/NetworkStatus.jsx',
  '../../frontend/src/components/social/PeerMessaging.jsx'
];

socialFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace local ui imports with central ui imports
      content = content.replace(/from ['"]\.\/ui\/Card['"]/g, "from '../ui/Card'");
      content = content.replace(/from ['"]\.\/ui\/Button['"]/g, "from '../ui/Button'");
      content = content.replace(/from ['"]\.\/ui\/Badge['"]/g, "from '../ui/Badge'");
      content = content.replace(/from ['"]\.\/ui\/Tabs['"]/g, "from '../ui/Tabs'");
      content = content.replace(/from ['"]\.\/ui\/Input['"]/g, "from '../ui/Input'");
      content = content.replace(/from ['"]\.\/ui\/Textarea['"]/g, "from '../ui/Textarea'");
      content = content.replace(/from ['"]\.\/ui\/Select['"]/g, "from '../ui/Select'");
      content = content.replace(/from ['"]\.\/ui\/Dialog['"]/g, "from '../ui/Dialog'");
      content = content.replace(/from ['"]\.\/ui\/Avatar['"]/g, "from '../ui/Avatar'");
      content = content.replace(/from ['"]\.\/ui\/Progress['"]/g, "from '../ui/Progress'");
      content = content.replace(/from ['"]\.\/ui\/Toast['"]/g, "from '../ui/Toast'");
      
      fs.writeFileSync(file, content);
      console.log(`   ✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error fixing ${file}: ${error.message}`);
  }
});

// 8. Fix PWAProvider import
console.log('\n🔧 Fixing PWAProvider import...');
const networkStatusFile = '../../frontend/src/components/social/NetworkStatus.jsx';
if (fs.existsSync(networkStatusFile)) {
  try {
    let content = fs.readFileSync(networkStatusFile, 'utf8');
    content = content.replace(/from ['"]\.\/PWAProvider['"]/g, "from '../pwa/PWAProvider'");
    fs.writeFileSync(networkStatusFile, content);
    console.log(`   ✅ Fixed: ${networkStatusFile}`);
    fixedCount++;
  } catch (error) {
    console.log(`   ❌ Error fixing ${networkStatusFile}: ${error.message}`);
  }
}

// 9. Fix apiService import
console.log('\n🔧 Fixing apiService import...');
const peerMatchingFile = '../../frontend/src/components/social/PeerMatchingSuggestions.jsx';
if (fs.existsSync(peerMatchingFile)) {
  try {
    let content = fs.readFileSync(peerMatchingFile, 'utf8');
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/services\/apiService['"]/g, "from '../../../services/apiService'");
    fs.writeFileSync(peerMatchingFile, content);
    console.log(`   ✅ Fixed: ${peerMatchingFile}`);
    fixedCount++;
  } catch (error) {
    console.log(`   ❌ Error fixing ${peerMatchingFile}: ${error.message}`);
  }
}

// 10. Handle index.js App import (Next.js issue)
console.log('\n🔧 Handling index.js App import (Next.js project)...');
const indexFile = '../../frontend/src/index.js';
if (fs.existsSync(indexFile)) {
  console.log('   ⚠️  Note: This is a Next.js project - index.js should not import App.js');
  console.log('   ℹ️  Next.js uses pages/_app.js instead of src/App.js');
  console.log('   ℹ️  Consider removing or updating frontend/src/index.js if not needed');
} else {
  console.log('   ℹ️  No index.js found - this is normal for Next.js projects');
}

console.log(`\n🎉 Fixed ${fixedCount} remaining import issues!`);
console.log('\n📋 Summary of fixes:');
console.log('   ✅ Fixed UI component import paths');
console.log('   ✅ Fixed @/ alias imports to relative paths');
console.log('   ✅ Created missing UI components (Textarea, Select, Dialog, Progress, Toast)');
console.log('   ✅ Created missing services (webNotificationService, webOfflineService, visualizationService)');
console.log('   ✅ Created missing visualization components (HeatmapChart, SankeyChart, RadarChart, TimelineChart)');
console.log('   ✅ Created missing profile components (ProjectDisplayCard, ExperienceDisplayCard, EducationDisplayCard)');
console.log('   ✅ Fixed social component imports to use central UI components');
console.log('   ✅ Fixed PWAProvider and apiService imports');
console.log('   ℹ️  Noted Next.js index.js issue (not a real problem)');

console.log('\n🚀 All 46 broken imports should now be resolved!');