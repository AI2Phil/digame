const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import services
const redisService = require('./services/redis');
const performanceMonitor = require('./services/performance');
const { cacheManager } = require('./services/cacheManager');

// Import routes and middleware
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const analyticsRoutes = require('./routes/analytics');
const aiToolsRoutes = require('./routes/ai-tools');
const platformOwnerRoutes = require('./routes/platform-owner');
const digitalTwinRoutes = require('./routes/digital-twin');
const workflowRoutes = require('./routes/workflow');
const teamCollaborationRoutes = require('./routes/team');
const careerRoutes = require('./routes/career');
const reportsRoutes = require('./routes/reports');
const guestRoutes = require('./routes/guest');
const onboardingRoutes = require('./routes/onboarding');
const securityRoutes = require('./routes/security');
const integrationRoutes = require('./routes/integration');
const adminRoutes = require('./routes/admin');
const enterpriseRoutes = require('./routes/enterprise');
const notificationsRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const healthRoutes = require('./routes/health');
const { detectDemoMode } = require('./middleware/auth');
const { getOptimalPort } = require('./utils/portDetection');
const ServiceDiscovery = require('./utils/serviceDiscovery');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware
app.use(performanceMonitor.requestMonitor());

// Global middleware
app.use(detectDemoMode);

// Health check endpoints (comprehensive)
app.use('/health', healthRoutes);

// Legacy health endpoint for backward compatibility
app.get('/health-legacy', async (req, res) => {
  try {
    const healthData = await performanceMonitor.getHealthCheck();
    const cacheHealth = await cacheManager.healthCheck();
    
    res.json({
      status: healthData.status,
      message: 'Digame Backend Server is running',
      timestamp: healthData.timestamp,
      version: '2.0.0',
      port: process.env.RUNTIME_PORT || 'unknown',
      uptime: healthData.uptime,
      performance: healthData.performance,
      database: healthData.database,
      cache: cacheHealth,
      redis: healthData.redis,
      alerts: healthData.alerts,
      features: {
        authentication: true,
        rbac: true,
        teamCollaboration: true,
        jwtTokens: true,
        dynamicPortDetection: true,
        extendedSchema: true,
        performanceMonitoring: true,
        redisIntegration: healthData.redis.status !== 'disabled',
        databaseAdapter: true,
        multiLayerCache: true,
        migrationTools: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Service discovery endpoint
app.get('/service-info', (req, res) => {
  const serviceDiscovery = new ServiceDiscovery();
  const serviceInfo = serviceDiscovery.getServiceInfo();
  
  if (serviceInfo && serviceInfo.backend) {
    // Return format expected by frontend
    res.json({
      port: serviceInfo.backend.port,
      url: serviceInfo.backend.url,
      status: serviceInfo.backend.status,
      startTime: serviceInfo.backend.startTime,
      pid: serviceInfo.backend.pid,
      lastUpdated: serviceInfo.lastUpdated
    });
  } else {
    res.status(404).json({
      error: 'Service information not available',
      message: 'Backend service discovery data not found'
    });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/ai-tools', aiToolsRoutes);
app.use('/platform-owner', platformOwnerRoutes);
app.use('/digital-twin', digitalTwinRoutes);
app.use('/workflow', workflowRoutes);
app.use('/team', teamCollaborationRoutes);
app.use('/career', careerRoutes);
app.use('/reports', reportsRoutes);
app.use('/guest', guestRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/security', securityRoutes);
app.use('/integration', integrationRoutes);
app.use('/admin', adminRoutes);
app.use('/enterprise', enterpriseRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server with dynamic port detection
const startServer = async () => {
  try {
    const PORT = await getOptimalPort();
    const serviceDiscovery = new ServiceDiscovery();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Digame Backend Server Started Successfully!');
      console.log('================================================');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`⚡ Performance: http://localhost:${PORT}/health/performance`);
      console.log(`🗃️  Database: http://localhost:${PORT}/health/database`);
      console.log(`🧠 Cache: http://localhost:${PORT}/health/cache`);
      console.log(`🔧 Migration: http://localhost:${PORT}/health/migration`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/auth/login`);
      console.log(`🎮 Demo endpoint: http://localhost:${PORT}/auth/demo`);
      console.log('================================================');
      console.log('');
      
      // Store the port for potential use by other modules
      process.env.RUNTIME_PORT = PORT;
      
      // Register service for discovery
      serviceDiscovery.registerService(PORT);
      
      // Setup graceful shutdown
      serviceDiscovery.setupGracefulShutdown();
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;