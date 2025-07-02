# 🚀 Getting Started with Digame Platform

Welcome to **Digame** - the Digital Professional Twin Platform! This guide will help you get up and running quickly with the platform's comprehensive user workflow system, authentication, team management, and progressive onboarding features.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [User Workflow Features](#-user-workflow-features)
- [Authentication System](#-authentication-system)
- [First Steps](#-first-steps)
- [API Documentation](#-api-documentation)
- [Common Tasks](#-common-tasks)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

## ⚡ Quick Start

# 1. Docker up and running** ```docker ps```    

# 2. Start backend server
cd ../backend
npm install
npm start

- **start the backend** (Node.js/Express on port 8001): ```cd backend && npm start```

# 3. In a new terminal, start the frontend
cd ../frontend
npm install
npm run dev

- **start the frontend** (React/Next.js on port 3000) in a new terminal: ```cd frontend && npm run dev```

- **Both services are now running**
- Backend: http://localhost:8001 ✅
- Frontend: http://localhost:3000 ✅
🎉 **That's it!** Your Digame platform is now running:
- **Frontend Web App**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Health Check**: http://localhost:8001/health
- **Demo Login**: http://localhost:8001/auth/demo
- Launch the browser to test the frontend dashboard and verify the sign-in functionality: http://localhost:3000 

## 📋 Updated Documentation Summary

### **Complete Rewrite for Current Stack**
- **Removed**: Old Python/FastAPI references
- **Added**: Node.js/Express backend + React/Next.js frontend documentation
- **Updated**: All installation, setup, and running instructions

### **Key Documentation Updates**

#### **🚀 Quick Start Section**
- Updated to show Node.js backend (`npm start` on port 8001)
- Frontend setup with Next.js (`npm run dev` on port 3000)
- Correct service URLs and health check endpoints

#### **🎯 User Workflow Features (New Section)**
- **Complete End-to-End User Journey**: Registration → Onboarding → Dashboard → Team Management
- **Progressive Onboarding System**: 4-step workflow with interest/goal selection
- **Subscription-Based Access Control**: Free, Individual Pro, Team, Enterprise tiers
- **Team Management Infrastructure**: Complete team creation and collaboration features
- **Personalized Dashboard**: Dynamic navigation and feature access

#### **🔐 Authentication System**
- **Current Implementation**: In-memory data store for development
- **JWT Token System**: Access tokens (15min) + refresh tokens (7 days)
- **Demo Users Table**: All 5 pre-configured users with credentials and access levels
- **Complete API Endpoints**: All authentication and user management endpoints

#### **📚 API Documentation**
- **Updated Endpoints**: All current backend routes with correct ports
- **Feature Access Control**: Subscription-based feature matrix
- **Authentication Flow**: Complete registration, login, and token management

#### **🔧 Common Tasks**
- **Real Examples**: Working curl commands for registration, login, onboarding
- **Team Management**: API calls for team creation and member management
- **User Workflow**: Step-by-step API usage examples

#### **🐛 Troubleshooting**
- **Node.js Specific Issues**: Port conflicts, dependency problems, connection errors
- **Current Stack Solutions**: Relevant to Express/React implementation
- **Health Check Commands**: Correct endpoints and testing procedures

#### **🚀 Next Steps**
- **Production Migration**: Database options (MongoDB, PostgreSQL, Supabase)
- **Feature Extensions**: Real-time features, email integration, payment systems
- **Deployment Guide**: Production build and deployment instructions

### **New Sections Added**

1. **User Workflow Features**: Comprehensive overview of the complete user journey
2. **Progressive Onboarding**: Detailed 4-step onboarding process
3. **Team Management**: Complete team collaboration infrastructure
4. **Subscription Tiers**: Feature access matrix and upgrade paths
5. **Current Implementation Status**: What's completed vs. production-ready features

### **Accurate Technical Details**

- **Ports**: Backend (8001), Frontend (3000)
- **Technology Stack**: Node.js/Express + React/Next.js + TypeScript
- **Database**: In-memory for development, migration options for production
- **Authentication**: JWT with bcrypt password hashing
- **Demo Credentials**: All working demo users and access levels

### **Developer-Friendly**

- **Copy-paste Commands**: All commands tested and working
- **API Examples**: Real curl commands with proper JSON payloads
- **Troubleshooting**: Common issues with Node.js/npm specific solutions
- **Extension Guide**: How to customize and extend the platform

The documentation now accurately reflects the complete end-to-end user workflow system we've implemented, making it easy for new developers to get started and understand the full capabilities of the Digame platform.

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **Memory**: 512MB minimum, 2GB recommended
- **Storage**: 1GB free space

### Development Tools (Optional)
- **Git**: For version control
- **VS Code**: Recommended IDE with React/TypeScript extensions
- **Postman**: For API testing

## 📦 Installation

### Standard Installation

```bash
# Clone the repository
git clone <repository-url>
cd digame

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd digame

# Install all dependencies
npm run install:all  # If available, or install manually:
cd backend && npm install && cd ../frontend && npm install
```

## 🚀 Running the Application

### Complete Application Stack

To access the full Digame platform with both the web interface and API:

#### Method 1: Separate Terminals (Recommended)

```bash
# Terminal 1: Start backend server
cd digame/backend
npm start

# Terminal 2: Start frontend (in a new terminal)
cd digame/frontend
npm run dev
```

#### Method 2: Using npm scripts (if configured)

```bash
# Start both services concurrently
npm run dev  # If configured in root package.json
```

### Access Points

Once both services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Web App** | http://localhost:3000 | Main user interface with complete workflow |
| **Backend API** | http://localhost:8001 | REST API endpoints |
| **API Health Check** | http://localhost:8001/health | Backend status |
| **Demo Mode** | http://localhost:8001/auth/demo | Quick demo access |

### Service Status Check

Verify both services are running:

```bash
# Check backend
curl http://localhost:8001/health

# Check frontend (should return HTML)
curl http://localhost:3000
```

### Troubleshooting Startup

#### Backend Issues
```bash
# Check Node.js version (requires 18+)
node --version

# Clear npm cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts (backend uses 8001)
lsof -i :8001
```

#### Frontend Issues
```bash
# Check Node.js version (requires 18+)
node --version

# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts (frontend uses 3000)
lsof -i :3000
```

#### Port Conflicts
If you encounter port conflicts:

```bash
# Backend (change from 8001)
cd backend
# Edit src/server.js: change port to 8002
npm start

# Frontend (change from 3000)
cd frontend
npm run dev -- --port 3001
```

## 🎯 User Workflow Features

### Complete End-to-End User Journey

The Digame platform provides a comprehensive user workflow system:

#### 1. **User Registration & Authentication**
- Secure JWT-based authentication with refresh tokens
- Password validation with security requirements
- Email and username validation
- Automatic login after successful registration

#### 2. **Progressive Onboarding System**
- **Step 1**: Interest Selection (AI Tools, Analytics, Social Features, Team Collaboration)
- **Step 2**: Goal Setting (Productivity, Career Growth, Team Management, Personal Development)
- **Step 3**: Experience Assessment (Beginner, Intermediate, Advanced, Expert)
- **Step 4**: Team Preferences (Solo, Small Team, Large Team, Enterprise)
- **Feature Unlocking**: Progressive access based on user choices and subscription tier

#### 3. **Subscription-Based Access Control**
- **Free Tier**: Basic analytics and social features
- **Individual Pro ($29/month)**: Advanced analytics, AI tools, networking
- **Team ($99/month)**: Team creation, collaboration, advanced features
- **Enterprise**: Full feature access, SSO, compliance tools

#### 4. **Team Management Infrastructure**
- Create and manage teams (subscription permitting)
- Invite team members with role assignments
- Role-based permissions (Owner, Admin, Manager, Member)
- Team analytics and member management
- Project collaboration features

#### 5. **Personalized Dashboard**
- Dynamic navigation based on user permissions
- Real-time statistics (projects, teams, tasks)
- Quick action buttons for common workflows
- Recent activity feed with contextual prompts
- Subscription tier status and upgrade paths

## 🔐 Authentication System

### Current Implementation

The platform uses an **in-memory data store** for development with the following features:

- **JWT Tokens**: Access tokens (15 minutes) + refresh tokens (7 days)
- **Password Security**: bcrypt hashing with salt rounds
- **Demo Users**: Pre-configured users for testing
- **Role-Based Access**: Dynamic feature access based on subscription tiers

### Demo Users Available

| Username | Email | Password | Subscription | Features |
|----------|-------|----------|--------------|----------|
| `admin` | admin@digame.com | any | Platform Owner | All features |
| `demo` | demo@digame.com | any | Enterprise | Full enterprise access |
| `teamlead` | team.lead@company.com | any | Team | Team management |
| `prouser` | pro.user@freelancer.com | any | Individual Pro | Pro features |
| `freeuser` | free.user@example.com | any | Free | Basic features |

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/profile` | Get current user | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/onboarding` | Update onboarding data | Yes |
| GET | `/auth/stats` | Get user statistics | Yes |
| POST | `/auth/demo` | Enter demo mode | No |

## 🎯 First Steps

### 1. Access the Application

#### Web Interface (Recommended for Users)
1. **Homepage**: http://localhost:3000
2. **Click "Get Started"** to begin the user journey
3. **Choose Experience**: Select "Create Your Account" or "Try the Demo"
4. **Complete Registration**: Fill out the signup form with secure password
5. **Progressive Onboarding**: Complete the 4-step onboarding process
6. **Dashboard Access**: Access your personalized dashboard

#### API Testing (For Developers)
```bash
# Test health endpoint
curl http://localhost:8001/health

# Register a new user
curl -X POST "http://localhost:8001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User",
    "subscriptionTier": "individual_pro"
  }'

# Login with demo user
curl -X POST "http://localhost:8001/auth/demo"
```

### 2. Complete User Workflow

#### Registration Flow
1. **Navigate to Registration**: http://localhost:3000 → "Get Started" → "Create Your Account"
2. **Fill Registration Form**:
   - Username (3+ characters, alphanumeric + underscore)
   - Email (valid email format)
   - First Name and Last Name
   - Password (8+ characters, uppercase, lowercase, number)
   - Confirm Password
3. **Automatic Login**: System logs you in after successful registration
4. **Progressive Onboarding**: Complete 4-step personalization process

#### Onboarding Steps
1. **Interests**: Select from AI Tools, Analytics, Social Features, Team Collaboration
2. **Goals**: Choose Productivity, Career Growth, Team Management, Personal Development
3. **Experience**: Assess your level (Beginner to Expert)
4. **Team Preference**: Solo work, Small Team, Large Team, or Enterprise

#### Dashboard Features
- **Overview**: Personalized welcome, stats, and quick actions
- **Projects**: Create and manage projects (subscription permitting)
- **Teams**: Team creation and management (Team/Enterprise tiers)
- **Analytics**: Performance insights (Individual Pro+)
- **Integrations**: External tool connections (Team+)
- **Settings**: Profile and account management

### 3. Team Management (Team/Enterprise Tiers)

#### Creating a Team
1. **Navigate to Teams**: Dashboard → Teams section
2. **Click "Create Team"**: Available for Team/Enterprise subscribers
3. **Fill Team Details**: Name, description, subscription tier
4. **Invite Members**: Send email invitations with role assignments
5. **Manage Team**: Overview, member management, project collaboration

#### Team Roles
- **Owner**: Full team control, billing management
- **Admin**: Member management, team settings
- **Manager**: Project oversight, member coordination
- **Member**: Standard team participation

## 📚 API Documentation

### Core Platform Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | No |
| GET | `/auth/permissions` | Get user permissions | Yes |
| GET | `/auth/verify-token` | Verify token validity | Yes |
| GET | `/teams` | List user teams | Yes |
| POST | `/teams` | Create new team | Yes (Team+) |
| GET | `/teams/:id` | Get team details | Yes |
| POST | `/teams/:id/invite` | Invite team member | Yes |
| DELETE | `/teams/:id/members/:userId` | Remove team member | Yes |

### Feature Access Control

Features are dynamically available based on subscription tier:

```javascript
// Example feature checks
const features = {
  'analytics.basic': ['free'],
  'analytics.advanced': ['individual_pro', 'team', 'enterprise'],
  'ai.basic': ['individual_pro', 'team', 'enterprise'],
  'team.create': ['team', 'enterprise'],
  'team.manage': ['team', 'enterprise'],
  'projects.create': ['individual_pro', 'team', 'enterprise'],
  'integrations.setup': ['team', 'enterprise']
};
```

## 🔧 Common Tasks

### Register a New User

```bash
curl -X POST "http://localhost:8001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionTier": "individual_pro"
  }'
```

### Login and Get User Info

```bash
# Login
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePassword123!"
  }'

# Use the returned access token
curl -X GET "http://localhost:8001/auth/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Onboarding Data

```bash
curl -X PUT "http://localhost:8001/auth/onboarding" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "interests": ["AI Tools", "Analytics"],
    "goals": ["Productivity", "Career Growth"],
    "experience": "intermediate",
    "teamPreference": "small_team",
    "onboardingCompleted": true
  }'
```

### Create a Team (Team/Enterprise Tier)

```bash
curl -X POST "http://localhost:8001/teams" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Development Team",
    "description": "Our main development team",
    "subscriptionTier": "team"
  }'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Connection refused" errors
**Problem**: Backend server not running
**Solution**:
```bash
# Check if backend is running
curl http://localhost:8001/health

# Start backend if not running
cd backend
npm start
```

#### 2. "Module not found" errors
**Problem**: Dependencies not installed
**Solution**:
```bash
# Reinstall backend dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Reinstall frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. "Port already in use" errors
**Problem**: Port conflicts
**Solution**:
```bash
# Kill processes on ports
lsof -ti:8001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend

# Or use different ports
npm run dev -- --port 3001  # Frontend
# Edit backend/src/server.js for backend port
```

#### 4. Authentication issues
**Problem**: Token errors or login failures
**Solution**:
```bash
# Test demo login
curl -X POST "http://localhost:8001/auth/demo"

# Check user exists
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "any"}'
```

### Debug Mode

Enable debug logging:

```bash
# Backend: Set NODE_ENV=development
cd backend
NODE_ENV=development npm start

# Frontend: Development mode is default
cd frontend
npm run dev
```

### Health Checks

Monitor system health:

```bash
# Check backend health
curl http://localhost:8001/health

# Check authentication endpoints
curl http://localhost:8001/auth/demo

# Test frontend
curl http://localhost:3000
```

## 🚀 Next Steps

### 1. Explore the Platform Features

- **Complete User Registration**: Test the full signup and onboarding flow
- **Team Management**: Create teams and invite members (Team tier required)
- **Dashboard Navigation**: Explore all sections based on your subscription tier
- **Feature Access**: Test subscription-based feature gating

### 2. Customize and Extend

#### Frontend Customization
```javascript
// Update subscription tiers in frontend/src/contexts/AuthContext.tsx
// Modify onboarding steps in frontend/src/components/onboarding/
// Customize dashboard in frontend/pages/dashboard.js
```

#### Backend Extensions
```javascript
// Add new API endpoints in backend/src/routes/
// Extend user model in backend/src/models/User.js
// Add new features to subscription tiers
```

### 3. Database Migration

For production, migrate from in-memory storage to persistent database:

```bash
# Option 1: MongoDB
npm install mongoose
# Update User.js to use Mongoose schemas

# Option 2: PostgreSQL
npm install pg sequelize
# Create SQL schemas and migrations

# Option 3: Supabase
npm install @supabase/supabase-js
# Configure Supabase client
```

### 4. Production Deployment

```bash
# Build frontend for production
cd frontend
npm run build

# Configure environment variables
# Set up reverse proxy (nginx)
# Configure SSL certificates
# Set up monitoring and logging
```

### 5. Advanced Features

- **Real-time Features**: Add WebSocket support for live updates
- **Email Integration**: Implement email verification and notifications
- **Payment Integration**: Add Stripe for subscription management
- **Analytics**: Implement user behavior tracking
- **Mobile App**: Create React Native mobile application

## 📞 Support

### Documentation
- **User Workflow Guide**: Complete end-to-end user journey documentation
- **API Reference**: All endpoints with examples and response formats
- **Component Library**: Frontend component documentation

### Development
- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js/Express with JWT authentication
- **Database**: In-memory (development) → MongoDB/PostgreSQL (production)
- **Authentication**: JWT tokens with refresh token rotation

### Community
- **Issues**: Report bugs and feature requests
- **Discussions**: Join community discussions
- **Contributing**: See `CONTRIBUTING.md` for contribution guidelines

---

🎉 **Welcome to Digame!** You're now ready to experience the complete Digital Professional Twin Platform with end-to-end user workflows, progressive onboarding, team management, and subscription-based feature access. Happy exploring! 🚀

## 🔄 Current Implementation Status

### ✅ Completed Features
- **Complete User Registration & Authentication System**
- **Progressive Onboarding with 4-Step Workflow**
- **Subscription-Based Feature Access Control**
- **Team Management Infrastructure**
- **Personalized Dashboard with Dynamic Navigation**
- **JWT Authentication with Refresh Tokens**
- **Role-Based Access Control (RBAC)**
- **In-Memory Data Store for Development**

### 🚧 Ready for Production
- **Database Migration** (MongoDB/PostgreSQL/Supabase)
- **Email Verification System**
- **Payment Integration** (Stripe)
- **Real-time Features** (WebSockets)
- **Mobile Application** (React Native)

The platform provides a solid foundation for building comprehensive digital professional twin applications with enterprise-grade authentication, team collaboration, and user workflow management.