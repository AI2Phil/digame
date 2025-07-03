const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const analyticsRoutes = require('./routes/analytics');
const aiToolsRoutes = require('./routes/ai-tools');
const platformOwnerRoutes = require('./routes/platform-owner');
const digitalTwinRoutes = require('./routes/digital-twin');
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

// Global middleware
app.use(detectDemoMode);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Digame Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    port: process.env.RUNTIME_PORT || 'unknown',
    features: {
      authentication: true,
      rbac: true,
      teamCollaboration: true,
      jwtTokens: true,
      dynamicPortDetection: true
    }
  });
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