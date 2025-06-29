const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Digame Backend Server is running' });
});

// Auth routes
app.post('/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { username, password } = req.body;
  
  // For demo purposes, accept any credentials
  if (username && password) {
    const token = 'demo-jwt-token-' + Date.now();
    const user = {
      id: 1,
      name: username === 'admin' ? 'Admin User' : 'Demo User',
      email: username === 'admin' ? 'admin@digame.com' : 'demo@digame.com',
      role: username === 'admin' ? 'admin' : 'user',
      username: username
    };
    
    console.log('Login successful for:', user);
    
    res.json({
      success: true,
      token,
      user
    });
  } else {
    console.log('Login failed: Missing credentials');
    res.status(401).json({ 
      success: false,
      error: 'Invalid credentials',
      message: 'Username and password are required'
    });
  }
});

// Demo mode endpoint
app.post('/auth/demo', (req, res) => {
  console.log('Demo mode access requested');
  
  const token = 'demo-mode-token-' + Date.now();
  const user = {
    id: 999,
    name: 'Demo User',
    email: 'demo@digame.com',
    role: 'admin',
    username: 'demo',
    isDemoMode: true
  };
  
  res.json({
    success: true,
    token,
    user,
    isDemoMode: true
  });
});

// User profile endpoint
app.get('/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For demo purposes, return user data based on token
  const token = authHeader.replace('Bearer ', '');
  
  if (token.includes('demo')) {
    res.json({
      success: true,
      user: {
        id: 999,
        name: 'Demo User',
        email: 'demo@digame.com',
        role: 'admin',
        username: 'demo',
        isDemoMode: true
      }
    });
  } else {
    res.json({
      success: true,
      user: {
        id: 1,
        name: 'Authenticated User',
        email: 'user@digame.com',
        role: 'user',
        username: 'user'
      }
    });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  console.log('Logout requested');
  res.json({ success: true, message: 'Logged out successfully' });
});

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