# User Profile API Documentation

## Overview

The User Profile API provides comprehensive endpoints for managing user profiles, goals, achievements, and settings within the Digame platform. This API follows RESTful conventions and requires JWT authentication for all endpoints.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Error Responses

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 401 | Unauthorized | `{"detail": "Not authenticated"}` |
| 403 | Forbidden | `{"detail": "Not enough permissions"}` |
| 404 | Not Found | `{"detail": "Resource not found"}` |
| 422 | Validation Error | `{"detail": [{"loc": ["field"], "msg": "error message", "type": "error_type"}]}` |

---

## User Profile Endpoints

### Get Current User Profile

Retrieve the authenticated user's complete profile information.

**Endpoint:** `GET /users/me/profile`

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "bio": "Software engineer passionate about AI and productivity",
  "contact_info": {
    "phone": "+1-555-0123",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.dev"
  },
  "profile_picture_url": "https://example.com/avatars/john_doe.jpg",
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "role": "developer",
  "experience_level": "senior",
  "skills": ["Python", "JavaScript", "Machine Learning", "React"],
  "interests": ["AI", "Productivity", "Open Source"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-06-22T14:20:00Z",
  "is_active": true,
  "preferences": {
    "theme": "dark",
    "notifications_enabled": true,
    "email_notifications": true,
    "privacy_level": "public"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: User profile not found

---

### Update User Profile

Update the authenticated user's profile information.

**Endpoint:** `PUT /users/me/profile`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "bio": "Senior software engineer specializing in AI and productivity tools",
  "contact_info": {
    "phone": "+1-555-0123",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.dev"
  },
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "experience_level": "senior",
  "skills": ["Python", "JavaScript", "Machine Learning", "React", "FastAPI"],
  "interests": ["AI", "Productivity", "Open Source", "Mentoring"]
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "bio": "Senior software engineer specializing in AI and productivity tools",
  "contact_info": {
    "phone": "+1-555-0123",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.dev"
  },
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "role": "developer",
  "experience_level": "senior",
  "skills": ["Python", "JavaScript", "Machine Learning", "React", "FastAPI"],
  "interests": ["AI", "Productivity", "Open Source", "Mentoring"],
  "updated_at": "2025-06-22T14:25:00Z"
}
```

**Validation Rules:**
- `full_name`: 1-100 characters
- `bio`: Maximum 500 characters
- `skills`: Maximum 20 skills, each 1-50 characters
- `interests`: Maximum 10 interests, each 1-50 characters
- `timezone`: Valid IANA timezone identifier

---

## Goals Management Endpoints

### Get User Goals

Retrieve all goals for the authenticated user.

**Endpoint:** `GET /users/me/goals`

**Query Parameters:**
- `status` (optional): Filter by goal status (`active`, `completed`, `paused`)
- `category` (optional): Filter by goal category (`career`, `learning`, `personal`, `health`)
- `limit` (optional): Number of goals to return (default: 50, max: 100)
- `offset` (optional): Number of goals to skip (default: 0)

**Response:**
```json
{
  "goals": [
    {
      "id": 1,
      "title": "Learn Advanced Machine Learning",
      "description": "Complete a comprehensive ML course and build 3 projects",
      "category": "learning",
      "status": "active",
      "priority": "high",
      "target_date": "2025-12-31",
      "created_at": "2025-06-01T10:00:00Z",
      "updated_at": "2025-06-22T14:00:00Z",
      "progress": {
        "percentage": 35,
        "milestones_completed": 2,
        "total_milestones": 6,
        "last_activity": "2025-06-20T16:30:00Z"
      },
      "milestones": [
        {
          "id": 1,
          "title": "Complete Course Module 1",
          "completed": true,
          "completed_at": "2025-06-10T14:00:00Z"
        },
        {
          "id": 2,
          "title": "Build First ML Project",
          "completed": true,
          "completed_at": "2025-06-18T18:30:00Z"
        },
        {
          "id": 3,
          "title": "Complete Course Module 2",
          "completed": false,
          "due_date": "2025-07-15T23:59:59Z"
        }
      ],
      "tags": ["machine-learning", "python", "career-development"]
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

### Create New Goal

Create a new goal for the authenticated user.

**Endpoint:** `POST /users/me/goals`

**Request Body:**
```json
{
  "title": "Master React Native Development",
  "description": "Learn React Native and build a mobile app",
  "category": "learning",
  "priority": "medium",
  "target_date": "2025-09-30",
  "milestones": [
    {
      "title": "Complete React Native Tutorial",
      "due_date": "2025-07-31"
    },
    {
      "title": "Build First Mobile App",
      "due_date": "2025-08-31"
    },
    {
      "title": "Deploy App to App Store",
      "due_date": "2025-09-30"
    }
  ],
  "tags": ["react-native", "mobile", "javascript"]
}
```

**Response:**
```json
{
  "id": 6,
  "title": "Master React Native Development",
  "description": "Learn React Native and build a mobile app",
  "category": "learning",
  "status": "active",
  "priority": "medium",
  "target_date": "2025-09-30",
  "created_at": "2025-06-22T14:30:00Z",
  "updated_at": "2025-06-22T14:30:00Z",
  "progress": {
    "percentage": 0,
    "milestones_completed": 0,
    "total_milestones": 3,
    "last_activity": null
  },
  "milestones": [
    {
      "id": 10,
      "title": "Complete React Native Tutorial",
      "completed": false,
      "due_date": "2025-07-31T23:59:59Z"
    },
    {
      "id": 11,
      "title": "Build First Mobile App",
      "completed": false,
      "due_date": "2025-08-31T23:59:59Z"
    },
    {
      "id": 12,
      "title": "Deploy App to App Store",
      "completed": false,
      "due_date": "2025-09-30T23:59:59Z"
    }
  ],
  "tags": ["react-native", "mobile", "javascript"]
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `description`: Optional, maximum 1000 characters
- `category`: Required, one of: `career`, `learning`, `personal`, `health`
- `priority`: Optional, one of: `low`, `medium`, `high` (default: `medium`)
- `target_date`: Optional, must be in the future
- `milestones`: Optional, maximum 20 milestones per goal
- `tags`: Optional, maximum 10 tags, each 1-30 characters

---

### Update Goal

Update an existing goal.

**Endpoint:** `PUT /users/me/goals/{goal_id}`

**Request Body:** Same as create goal, all fields optional

**Response:** Updated goal object (same format as create response)

---

### Delete Goal

Delete a goal and all its milestones.

**Endpoint:** `DELETE /users/me/goals/{goal_id}`

**Response:**
```json
{
  "message": "Goal deleted successfully"
}
```

---

## Achievements Endpoints

### Get User Achievements

Retrieve all achievements for the authenticated user.

**Endpoint:** `GET /users/me/achievements`

**Query Parameters:**
- `status` (optional): Filter by status (`earned`, `available`, `locked`)
- `category` (optional): Filter by category (`goals`, `learning`, `social`, `productivity`)
- `rarity` (optional): Filter by rarity (`common`, `uncommon`, `rare`, `epic`, `legendary`)

**Response:**
```json
{
  "achievements": [
    {
      "id": 1,
      "title": "Goal Setter",
      "description": "Create your first goal",
      "category": "goals",
      "rarity": "common",
      "status": "earned",
      "points": 10,
      "icon_url": "https://example.com/icons/goal-setter.png",
      "earned_at": "2025-06-01T10:15:00Z",
      "progress": {
        "current": 1,
        "required": 1,
        "percentage": 100
      }
    },
    {
      "id": 2,
      "title": "Learning Enthusiast",
      "description": "Complete 5 learning goals",
      "category": "learning",
      "rarity": "uncommon",
      "status": "available",
      "points": 25,
      "icon_url": "https://example.com/icons/learning-enthusiast.png",
      "earned_at": null,
      "progress": {
        "current": 2,
        "required": 5,
        "percentage": 40
      }
    },
    {
      "id": 3,
      "title": "Master Achiever",
      "description": "Earn 100 achievement points",
      "category": "productivity",
      "rarity": "epic",
      "status": "locked",
      "points": 100,
      "icon_url": "https://example.com/icons/master-achiever.png",
      "earned_at": null,
      "progress": {
        "current": 35,
        "required": 100,
        "percentage": 35
      },
      "unlock_requirements": "Earn 50 achievement points first"
    }
  ],
  "total_points": 35,
  "total_earned": 3,
  "total_available": 25
}
```

---

### Claim Achievement

Claim an available achievement.

**Endpoint:** `POST /users/me/achievements/{achievement_id}/claim`

**Response:**
```json
{
  "id": 2,
  "title": "Learning Enthusiast",
  "description": "Complete 5 learning goals",
  "category": "learning",
  "rarity": "uncommon",
  "status": "earned",
  "points": 25,
  "earned_at": "2025-06-22T14:35:00Z",
  "message": "Congratulations! You've earned the Learning Enthusiast achievement!"
}
```

**Error Responses:**
- `400 Bad Request`: Achievement already claimed or not available
- `404 Not Found`: Achievement not found

---

## Settings Management Endpoints

### Get User Settings

Retrieve user preferences and settings.

**Endpoint:** `GET /users/me/settings`

**Response:**
```json
{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "America/Los_Angeles",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h"
  },
  "notifications": {
    "email_notifications": true,
    "push_notifications": true,
    "goal_reminders": true,
    "achievement_alerts": true,
    "social_notifications": true,
    "marketing_emails": false
  },
  "privacy": {
    "profile_visibility": "public",
    "goal_visibility": "friends",
    "achievement_visibility": "public",
    "activity_visibility": "private"
  },
  "api_keys": {
    "openai_configured": true,
    "anthropic_configured": false,
    "google_configured": true
  }
}
```

---

### Update User Settings

Update user preferences and settings.

**Endpoint:** `PUT /users/me/settings`

**Request Body:**
```json
{
  "preferences": {
    "theme": "light",
    "language": "en",
    "timezone": "America/New_York"
  },
  "notifications": {
    "email_notifications": false,
    "goal_reminders": true
  },
  "privacy": {
    "profile_visibility": "friends"
  }
}
```

**Response:** Updated settings object (same format as get response)

---

### Manage API Keys

Store and manage API keys for third-party services.

**Endpoint:** `POST /users/me/settings/api-keys`

**Request Body:**
```json
{
  "service": "openai",
  "api_key": "sk-...",
  "description": "OpenAI API key for AI features"
}
```

**Response:**
```json
{
  "service": "openai",
  "configured": true,
  "description": "OpenAI API key for AI features",
  "created_at": "2025-06-22T14:40:00Z"
}
```

**Get API Keys:**
**Endpoint:** `GET /users/me/settings/api-keys`

**Response:**
```json
{
  "api_keys": [
    {
      "service": "openai",
      "configured": true,
      "description": "OpenAI API key for AI features",
      "created_at": "2025-06-22T14:40:00Z",
      "last_used": "2025-06-22T13:30:00Z"
    }
  ]
}
```

**Delete API Key:**
**Endpoint:** `DELETE /users/me/settings/api-keys/{service}`

---

## Social Features Endpoints

### Get Peer Matches

Find potential learning partners and collaborators.

**Endpoint:** `GET /users/me/peer-matches`

**Query Parameters:**
- `match_type` (optional): Type of matching (`skills`, `learning_partner`, `project`)
- `skills` (optional): Comma-separated list of skills to match
- `limit` (optional): Number of matches to return (default: 20)

**Response:**
```json
{
  "matches": [
    {
      "user_id": 42,
      "username": "jane_smith",
      "full_name": "Jane Smith",
      "profile_picture_url": "https://example.com/avatars/jane_smith.jpg",
      "bio": "Full-stack developer passionate about React and Node.js",
      "match_score": 0.85,
      "match_reasons": [
        "Shared skills: React, JavaScript, Node.js",
        "Similar experience level: Senior",
        "Common interests: Open Source, Mentoring"
      ],
      "shared_skills": ["React", "JavaScript", "Node.js"],
      "complementary_skills": ["Vue.js", "GraphQL"],
      "location": "San Francisco, CA",
      "experience_level": "senior",
      "connection_status": "not_connected"
    }
  ],
  "total": 15
}
```

---

### Send Connection Request

Send a connection request to another user.

**Endpoint:** `POST /users/me/connections/request`

**Request Body:**
```json
{
  "target_user_id": 42,
  "message": "Hi Jane! I'd love to connect and potentially collaborate on React projects."
}
```

**Response:**
```json
{
  "id": 123,
  "target_user_id": 42,
  "message": "Hi Jane! I'd love to connect and potentially collaborate on React projects.",
  "status": "pending",
  "created_at": "2025-06-22T14:45:00Z"
}
```

---

## Error Handling

### Common Error Responses

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "target_date"],
      "msg": "target date must be in the future",
      "type": "value_error.date"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "detail": "Not authenticated"
}
```

**Permission Error (403):**
```json
{
  "detail": "Not enough permissions"
}
```

**Not Found Error (404):**
```json
{
  "detail": "Resource not found"
}
```

**Rate Limit Error (429):**
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **General endpoints**: 100 requests per minute per user
- **Authentication endpoints**: 10 requests per minute per IP
- **File upload endpoints**: 20 requests per minute per user

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

**Request:**
```http
GET /users/me/goals?limit=10&offset=20
```

**Response includes pagination metadata:**
```json
{
  "goals": [...],
  "total": 45,
  "limit": 10,
  "offset": 20,
  "has_next": true,
  "has_previous": true
}
```

---

## Webhooks (Future Feature)

The API will support webhooks for real-time notifications:

**Supported Events:**
- `goal.created`
- `goal.completed`
- `achievement.earned`
- `connection.requested`
- `connection.accepted`

**Webhook Payload Example:**
```json
{
  "event": "goal.completed",
  "timestamp": "2025-06-22T14:50:00Z",
  "user_id": 1,
  "data": {
    "goal_id": 5,
    "title": "Learn Advanced Machine Learning",
    "completed_at": "2025-06-22T14:50:00Z"
  }
}
```

---

## SDK and Client Libraries

Official SDKs are available for:
- **JavaScript/TypeScript**: `@digame/api-client`
- **Python**: `digame-api-client`
- **React**: `@digame/react-hooks`

**Example Usage (JavaScript):**
```javascript
import { DigameClient } from '@digame/api-client';

const client = new DigameClient({
  baseURL: 'http://localhost:8000/api',
  token: 'your_jwt_token'
});

// Get user profile
const profile = await client.users.me.profile.get();

// Create a new goal
const goal = await client.users.me.goals.create({
  title: 'Learn TypeScript',
  category: 'learning',
  target_date: '2025-12-31'
});
```

This comprehensive API documentation provides developers with all the information needed to integrate with the Digame platform's user profile, goals, achievements, and social features.