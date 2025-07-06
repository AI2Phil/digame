# Digame API Documentation

Welcome to the Digame Platform API documentation. This comprehensive guide provides everything you need to integrate with and extend the Digame Digital Professional Twin Platform.

## 🚀 API Overview

The Digame API is a RESTful API built with FastAPI that provides access to all platform features including user management, analytics, AI services, team collaboration, and workflow automation.

### Base URL
```
Production: https://api.digame.ai
Development: http://localhost:8000
```

### API Version
Current API Version: **v2**

All API endpoints are prefixed with `/api/` unless otherwise specified.

## 🔐 Authentication

The Digame API uses JWT (JSON Web Tokens) for authentication. All authenticated endpoints require a valid access token in the Authorization header.

### Authentication Flow
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 7200
}
```

### Using Access Tokens
Include the access token in the Authorization header for all authenticated requests:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token Refresh
Access tokens expire after 2 hours. Use the refresh token to obtain a new access token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 📊 API Endpoints Overview

### Core Services

| Service | Endpoint Prefix | Description |
|---------|----------------|-------------|
| [Authentication](authentication.md) | `/auth` | User authentication and authorization |
| [Users](users.md) | `/users` | User management and profiles |
| [Teams](teams.md) | `/teams` | Team collaboration and management |
| [Analytics](analytics.md) | `/analytics` | Analytics and reporting |
| [Notifications](notifications.md) | `/notifications` | Notification system |

### AI-Powered Services

| Service | Endpoint Prefix | Description |
|---------|----------------|-------------|
| [AI Services](ai_services.md) | `/ai` | AI-powered features and insights |
| [Behavioral Analysis](ai_services.md#behavioral-analysis) | `/behavior` | Behavioral pattern analysis |
| [Predictive Analytics](ai_services.md#predictive-analytics) | `/predictive` | Predictive modeling and forecasting |
| [Writing Assistance](ai_services.md#writing-assistance) | `/writing-assistance` | AI-powered writing tools |
| [Voice Processing](ai_services.md#voice-processing) | `/voice` | Voice recognition and NLU |

### Workflow & Automation

| Service | Endpoint Prefix | Description |
|---------|----------------|-------------|
| [Workflow Automation](workflow_automation.md) | `/workflow-automation` | Workflow templates and automation |
| [Task Management](workflow_automation.md#task-management) | `/tasks` | Task prioritization and management |
| [Process Optimization](workflow_automation.md#process-optimization) | `/process-optimization` | Process improvement recommendations |

### Integration & Enterprise

| Service | Endpoint Prefix | Description |
|---------|----------------|-------------|
| [Integrations](integrations.md) | `/integrations` | Third-party service integrations |
| [Admin](admin.md) | `/admin` | Administrative functions |
| [Enterprise](admin.md#enterprise) | `/enterprise` | Enterprise features and multi-tenancy |
| [Security](admin.md#security) | `/security` | Security management and policies |

## 📝 Request/Response Format

### Content Type
All requests should use `application/json` content type unless otherwise specified.

### Standard Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-12-24T13:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-12-24T13:00:00Z"
}
```

### Pagination
List endpoints support pagination using query parameters:

```http
GET /api/users?page=1&limit=20&sort=created_at&order=desc
```

**Pagination Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## 🔍 Filtering and Searching

### Query Parameters
Most list endpoints support filtering and searching:

```http
GET /api/users?search=john&role=developer&active=true&created_after=2025-01-01
```

### Common Filter Parameters
- `search` - Text search across relevant fields
- `sort` - Field to sort by
- `order` - Sort order (`asc` or `desc`)
- `limit` - Number of items per page (max 100)
- `page` - Page number (1-based)
- `fields` - Comma-separated list of fields to include

## ⚡ Rate Limiting

The API implements rate limiting to ensure fair usage:

### Rate Limits
- **Authenticated Users**: 1000 requests per hour
- **Anonymous Users**: 100 requests per hour
- **Enterprise Users**: 5000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "retry_after": 3600
  }
}
```

## 🚨 Error Handling

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

### Error Codes
| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | Authentication required |
| `INSUFFICIENT_PERMISSIONS` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## 🔧 Development Tools

### OpenAPI Specification
Interactive API documentation is available at:
- **Development**: http://localhost:8000/docs
- **Production**: https://api.digame.ai/docs

### Postman Collection
Download our Postman collection for easy API testing:
- [Digame API Postman Collection](../assets/Digame_API.postman_collection.json)

### SDKs and Libraries
Official SDKs are available for:
- **Python**: `pip install digame-python-sdk`
- **JavaScript/Node.js**: `npm install digame-js-sdk`
- **React**: `npm install digame-react-sdk`

## 📚 Code Examples

### Python Example
```python
import requests

# Authentication
response = requests.post('http://localhost:8000/auth/login', json={
    'email': 'user@example.com',
    'password': 'password'
})
token = response.json()['access_token']

# Make authenticated request
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/users/me', headers=headers)
user = response.json()['data']
```

### JavaScript Example
```javascript
// Authentication
const authResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const { access_token } = await authResponse.json();

// Make authenticated request
const userResponse = await fetch('http://localhost:8000/api/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const user = await userResponse.json();
```

### cURL Example
```bash
# Authentication
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Make authenticated request
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Testing

### Test Environment
A test environment is available for development and testing:
- **Base URL**: https://test-api.digame.ai
- **Test Credentials**: Available in developer portal

### Test Data
The test environment includes sample data for:
- Test users with various roles
- Sample teams and projects
- Mock analytics data
- Test integrations

## 📊 Monitoring and Analytics

### API Metrics
Monitor your API usage through the developer dashboard:
- Request volume and patterns
- Response times and error rates
- Rate limit usage
- Feature adoption metrics

### Health Checks
Monitor API health:
```http
GET /health
```

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-12-24T13:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_services": "healthy"
  }
}
```

## 🔄 Webhooks

The Digame API supports webhooks for real-time event notifications:

### Supported Events
- User registration and profile updates
- Team membership changes
- Workflow completion
- Analytics milestones
- Integration status changes

### Webhook Configuration
```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "url": "https://your-app.com/webhooks/digame",
  "events": ["user.created", "team.updated"],
  "secret": "your_webhook_secret"
}
```

## 📞 Support

### Getting Help
- **Documentation**: This comprehensive API documentation
- **Developer Portal**: Access to additional resources and tools
- **Community Forum**: Connect with other developers
- **Support Email**: api-support@digame.ai

### Reporting Issues
- **Bug Reports**: Use GitHub issues for bug reports
- **Feature Requests**: Submit through our feedback system
- **Security Issues**: Email security@digame.ai

---

## 📋 Quick Reference

### Essential Endpoints
```http
POST /auth/login                    # Authenticate user
GET  /api/users/me                  # Get current user
GET  /api/teams                     # List teams
GET  /api/analytics/dashboard       # Get dashboard data
POST /api/workflow-automation/templates  # Create workflow template
```

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
X-Tenant-ID: your_tenant_id  # For multi-tenant deployments
```

### Useful Query Parameters
```http
?page=1&limit=20                   # Pagination
?search=keyword                    # Text search
?sort=created_at&order=desc        # Sorting
?fields=id,name,email              # Field selection
```

---

**Last Updated**: December 24, 2025  
**API Version**: v2  
**Documentation Version**: 2.0.0

For the most up-to-date API reference, visit our [interactive documentation](http://localhost:8000/docs).