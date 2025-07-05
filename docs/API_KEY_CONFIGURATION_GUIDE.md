# API Key Configuration Guide for Digame Platform

## Overview
The Digame platform has a comprehensive API key management system that supports both user-level and admin-level API key configuration. Here's where and how to configure your API keys.

## 🔑 API Key Configuration Options

### 1. User-Level API Keys (Recommended for Individual Users)

**Location**: User Settings API endpoints
**Access**: Available to all authenticated users
**Storage**: Encrypted in user settings database

#### How to Configure:
The platform provides REST API endpoints for managing user API keys:

**Get API Keys:**
```bash
GET /settings/api-keys
Authorization: Bearer <your-jwt-token>
```

**Set/Update API Keys:**
```bash
POST /settings/api-keys
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "api_keys": {
    "openai_api_key": "sk-your-openai-key-here",
    "anthropic_api_key": "your-anthropic-key-here",
    "google_api_key": "your-google-key-here"
  }
}
```

**Delete Specific API Key:**
```bash
DELETE /settings/api-keys/openai_api_key
Authorization: Bearer <your-jwt-token>
```

### 2. Admin-Level API Keys (For System-Wide Fallback)

**Location**: Admin Configuration System
**Access**: Admin users only
**Storage**: Encrypted in admin configuration database

#### Supported Services:
- ✅ **OpenAI** (`openai`)
- ✅ **Anthropic** (`anthropic`) 
- ✅ **Google** (`google`)
- ✅ **Azure OpenAI** (`azure_openai`)
- ✅ **Hugging Face** (`huggingface`)
- ✅ **Cohere** (`cohere`)

#### Admin API Endpoints:
```bash
# Create admin API key
POST /admin/config/api-keys
{
  "service_name": "openai",
  "api_key": "sk-your-key-here",
  "description": "Primary OpenAI key for fallback",
  "usage_limit_per_user": 1000
}

# Get all admin API keys
GET /admin/config/api-keys

# Update admin API key
PUT /admin/config/api-keys/{config_id}

# Delete admin API key
DELETE /admin/config/api-keys/{config_id}
```

## 🖥️ Frontend User Interface

### Current Status:
Based on the codebase analysis, **there is currently no dedicated Settings page in the frontend** for users to manage their API keys through a UI. The system is designed with API endpoints, but the frontend interface needs to be created.

### What's Available:
- ✅ **Backend API endpoints** for user settings management
- ✅ **Admin configuration system** for system-wide keys
- ✅ **Comprehensive API key management** with encryption and masking
- ❌ **Frontend Settings page** (needs to be created)

### Recommended Frontend Implementation:
You would need to create a Settings page that includes:

1. **User Settings Page** (`/settings` or `/profile/settings`)
   - API Keys section
   - Form fields for each supported service
   - Save/Update functionality
   - Key masking for security

2. **Admin Configuration Page** (`/admin/config`)
   - System-wide API key management
   - Service configuration
   - Usage monitoring

## 🔧 How to Configure API Keys Right Now

### Option 1: Direct API Calls
Use the REST API endpoints directly:

```bash
# Example: Set your OpenAI API key
curl -X POST http://localhost:8000/settings/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_keys": {
      "openai_api_key": "sk-your-actual-openai-key-here"
    }
  }'
```

### Option 2: Environment Variables (For Testing)
For development/testing, you can set environment variables:

```bash
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_API_BASE_URL="https://api.openai.com/v1"
export OPENAI_MODEL_NAME="gpt-3.5-turbo"
```

### Option 3: Database Direct Insert (Admin Only)
For admin setup, you can insert directly into the database using the admin API key configuration system.

## 🎯 Services That Use API Keys

The following services in the platform require API keys:

1. **Writing Assistance Service** - Uses `openai_api_key`
2. **Meeting Insights Service** - Uses `openai_api_key`
3. **Language Learning Service** - Uses `openai_api_key`
4. **Email Analysis Service** - Uses `openai_api_key`
5. **Communication Style Service** - Uses `openai_api_key`
6. **Document Processing Service** - Uses `openai_api_key`
7. **Process NLP Service** - Uses `openai_api_key`
8. **Voice NLU Service** - Uses `openai_api_key`
9. **Behavior Service** - Uses `openai_api_key`

## 🔒 Security Features

### User-Level Security:
- ✅ API keys are encrypted in database
- ✅ Keys are masked in API responses
- ✅ Individual user control over their keys
- ✅ Redis caching with expiration

### Admin-Level Security:
- ✅ Encrypted storage with dedicated encryption service
- ✅ Usage tracking and logging
- ✅ Rate limiting per user
- ✅ Fallback mechanism when user keys unavailable

## 🚀 Testing Your API Keys

Use the provided testing script:

```bash
# Test with environment variable
python scripts/test_api_keys.py

# Test with specific key
python scripts/test_api_keys.py --openai-key "sk-your-key-here"

# Save results to file
python scripts/test_api_keys.py --output test_results.json
```

## 📋 Next Steps for Complete UI Implementation

To create a complete user-friendly API key management interface:

### 1. Create User Settings Page
```typescript
// frontend/src/pages/settings.tsx
// or
// frontend/src/pages/profile/settings.tsx
```

### 2. Add API Key Management Component
```typescript
// frontend/src/components/settings/APIKeySettings.tsx
```

### 3. Include Navigation Links
Update navigation components to include Settings page links.

### 4. Add Admin Configuration UI
Enhance admin dashboard with API key management interface.

## 🔍 Current Workaround

**Until a Settings UI is created**, you can:

1. **Use the API testing script** to verify connectivity
2. **Use direct API calls** to configure keys
3. **Set environment variables** for development
4. **Ask an admin** to configure system-wide fallback keys

## 📞 Support

If you need help configuring API keys:

1. **Check the API testing script results** for connectivity issues
2. **Verify your API key format** (OpenAI keys start with `sk-`)
3. **Ensure proper authentication** when calling the settings API
4. **Contact your system administrator** for admin-level configuration

---

**Note**: The platform has a robust API key management system in place, but the frontend Settings page needs to be implemented for a complete user experience.