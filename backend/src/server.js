const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const { detectDemoMode } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8001;

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
    features: {
      authentication: true,
      rbac: true,
      teamCollaboration: true,
      jwtTokens: true
    }
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 Digame Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/auth/login`);
  console.log(`🎮 Demo endpoint: http://localhost:${PORT}/auth/demo`);
});

module.exports = app;