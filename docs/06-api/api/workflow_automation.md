# Workflow Automation API

The Workflow Automation API provides comprehensive workflow management capabilities including template creation, visual workflow design, automation rules, and real-time monitoring.

## 📋 Overview

The Workflow Automation system enables users to:
- Create and manage reusable workflow templates
- Design workflows with a visual interface
- Set up automation rules with triggers and conditions
- Monitor workflow execution in real-time
- Analyze workflow performance and optimization

## 🔗 Base Endpoints

All workflow automation endpoints are prefixed with `/api/workflow-automation`.

## 🎯 Workflow Templates

### List Workflow Templates
```http
GET /api/workflow-automation/templates
```

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `is_active` (boolean, optional) - Filter by active status
- `is_public` (boolean, optional) - Filter by public visibility
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "name": "Employee Onboarding",
      "description": "Complete employee onboarding workflow",
      "category": "HR",
      "version": "1.0.0",
      "workflow_definition": {
        "start_step": "welcome",
        "steps": [
          {
            "id": "welcome",
            "name": "Welcome Email",
            "type": "notification",
            "config": {
              "template": "welcome_email",
              "recipients": ["new_employee", "manager"]
            },
            "connections": ["setup_accounts"]
          }
        ]
      },
      "complexity_level": "medium",
      "estimated_duration": 480,
      "tags": ["onboarding", "hr", "automation"],
      "is_public": true,
      "is_active": true,
      "usage_count": 25,
      "success_rate": 94.5,
      "avg_execution_time": 420,
      "created_at": "2025-12-01T10:00:00Z",
      "created_by": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Workflow Template
```http
GET /api/workflow-automation/templates/{template_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Employee Onboarding",
    "description": "Complete employee onboarding workflow",
    "workflow_definition": {
      "start_step": "welcome",
      "steps": [...],
      "variables": {
        "employee_name": "string",
        "department": "string",
        "start_date": "date"
      },
      "settings": {
        "timeout": 86400,
        "retry_attempts": 3
      }
    },
    "input_schema": {
      "type": "object",
      "properties": {
        "employee_name": {"type": "string"},
        "employee_email": {"type": "string", "format": "email"},
        "department": {"type": "string"},
        "manager_email": {"type": "string", "format": "email"}
      },
      "required": ["employee_name", "employee_email", "department"]
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "onboarding_completed": {"type": "boolean"},
        "completion_date": {"type": "string", "format": "date-time"},
        "tasks_completed": {"type": "integer"}
      }
    }
  }
}
```

### Create Workflow Template
```http
POST /api/workflow-automation/templates
```

**Request Body:**
```json
{
  "name": "Customer Support Ticket",
  "description": "Automated customer support ticket processing",
  "category": "Support",
  "workflow_definition": {
    "start_step": "classify_ticket",
    "steps": [
      {
        "id": "classify_ticket",
        "name": "Classify Ticket",
        "type": "action",
        "description": "Automatically classify the support ticket",
        "config": {
          "action_type": "ai_classification",
          "model": "ticket_classifier",
          "confidence_threshold": 0.8
        },
        "connections": ["route_ticket"]
      },
      {
        "id": "route_ticket",
        "name": "Route to Team",
        "type": "condition",
        "description": "Route ticket based on classification",
        "conditions": [
          {
            "field": "classification",
            "operator": "equals",
            "value": "technical",
            "next_step": "assign_technical"
          },
          {
            "field": "classification",
            "operator": "equals",
            "value": "billing",
            "next_step": "assign_billing"
          }
        ]
      }
    ],
    "variables": {
      "ticket_id": "string",
      "customer_tier": "string",
      "priority": "string"
    }
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "ticket_content": {"type": "string"},
      "customer_id": {"type": "integer"},
      "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
    },
    "required": ["ticket_content", "customer_id"]
  },
  "estimated_duration": 300,
  "tags": ["support", "automation", "ai"],
  "is_public": false,
  "requires_approval": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "Customer Support Ticket",
    "version": "1.0.0",
    "created_at": "2025-12-24T13:00:00Z",
    "created_by": 5
  },
  "message": "Workflow template created successfully"
}
```

### Update Workflow Template
```http
PUT /api/workflow-automation/templates/{template_id}
```

**Request Body:** (Same as create, all fields optional)

### Delete Workflow Template
```http
DELETE /api/workflow-automation/templates/{template_id}
```

### Initialize Default Templates
```http
POST /api/workflow-automation/templates/1/initialize-defaults
```

Creates a set of default workflow templates for common use cases.

## 🚀 Workflow Instances

### List Workflow Instances
```http
GET /api/workflow-automation/instances
```

**Query Parameters:**
- `template_id` (integer, optional) - Filter by template
- `status` (string, optional) - Filter by status (draft, active, paused, completed, failed, cancelled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "template_id": 1,
      "name": "John Doe Onboarding",
      "status": "active",
      "input_data": {
        "employee_name": "John Doe",
        "employee_email": "john.doe@company.com",
        "department": "Engineering"
      },
      "progress_percentage": 65,
      "steps_completed": 4,
      "steps_total": 6,
      "current_step_id": "setup_development_environment",
      "execution_start_time": "2025-12-24T09:00:00Z",
      "execution_duration": 3600,
      "priority": 5,
      "created_at": "2025-12-24T08:30:00Z"
    }
  ]
}
```

### Get Workflow Instance
```http
GET /api/workflow-automation/instances/{instance_id}
```

### Create Workflow Instance
```http
POST /api/workflow-automation/templates/{template_id}/instances
```

**Query Parameters:**
- `triggered_by` (string, optional) - Who/what triggered the instance (default: "manual")

**Request Body:**
```json
{
  "name": "Jane Smith Onboarding",
  "description": "Onboarding workflow for Jane Smith",
  "input_data": {
    "employee_name": "Jane Smith",
    "employee_email": "jane.smith@company.com",
    "department": "Marketing",
    "manager_email": "manager@company.com"
  },
  "priority": 7
}
```

### Execute Workflow Instance
```http
POST /api/workflow-automation/instances/{instance_id}/execute
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Workflow execution started",
    "instance_id": 101,
    "execution_id": "exec_abc123"
  }
}
```

### Get Workflow Instance Steps
```http
GET /api/workflow-automation/instances/{instance_id}/steps
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "workflow_instance_id": 101,
      "step_id": "welcome",
      "step_name": "Welcome Email",
      "step_type": "notification",
      "status": "completed",
      "execution_order": 1,
      "start_time": "2025-12-24T09:00:00Z",
      "end_time": "2025-12-24T09:01:30Z",
      "execution_duration": 90,
      "input_data": {
        "employee_name": "John Doe",
        "template": "welcome_email"
      },
      "output_data": {
        "email_sent": true,
        "message_id": "msg_xyz789"
      }
    }
  ]
}
```

## ⚡ Automation Rules

### List Automation Rules
```http
GET /api/workflow-automation/automation-rules
```

**Query Parameters:**
- `trigger_type` (string, optional) - Filter by trigger type
- `is_active` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Auto-assign Urgent Tickets",
      "description": "Automatically assign urgent support tickets to senior agents",
      "trigger_type": "event_based",
      "trigger_config": {
        "event_type": "ticket_created",
        "event_source": "support_system"
      },
      "conditions": [
        {
          "field": "priority",
          "operator": "equals",
          "value": "urgent"
        }
      ],
      "workflow_template_id": 5,
      "action_config": {
        "assign_to_team": "senior_support",
        "notify_manager": true
      },
      "is_active": true,
      "priority": 8,
      "rate_limit": 50,
      "total_executions": 127,
      "successful_executions": 121,
      "success_rate": 95.3,
      "last_execution": "2025-12-24T12:30:00Z"
    }
  ]
}
```

### Create Automation Rule
```http
POST /api/workflow-automation/automation-rules
```

**Request Body:**
```json
{
  "name": "New Employee Onboarding",
  "description": "Trigger onboarding workflow when new employee is added",
  "trigger_type": "event_based",
  "trigger_config": {
    "event_type": "employee_created",
    "event_source": "hr_system"
  },
  "conditions": [
    {
      "field": "department",
      "operator": "not_equals",
      "value": "contractor"
    },
    {
      "field": "employment_type",
      "operator": "equals",
      "value": "full_time"
    }
  ],
  "workflow_template_id": 1,
  "action_config": {
    "auto_start": true,
    "notify_manager": true,
    "priority": 7
  },
  "is_active": true,
  "priority": 5,
  "rate_limit": 10
}
```

### Trigger Automation Rule
```http
POST /api/workflow-automation/automation-rules/{rule_id}/trigger
```

**Request Body:**
```json
{
  "test_mode": false,
  "trigger_data": {
    "employee_name": "Alice Johnson",
    "department": "Engineering",
    "employment_type": "full_time"
  }
}
```

## 📊 Analytics

### Get Workflow Analytics
```http
GET /api/workflow-automation/analytics
```

**Query Parameters:**
- `start_date` (string, optional) - Start date (ISO format)
- `end_date` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2025-12-01T00:00:00Z",
      "end_date": "2025-12-24T23:59:59Z"
    },
    "workflow_instances": {
      "total": 245,
      "completed": 231,
      "failed": 8,
      "success_rate": 94.3
    },
    "automation_rules": {
      "total_executions": 1250,
      "successful_executions": 1198,
      "success_rate": 95.8
    },
    "performance": {
      "avg_execution_duration": 420,
      "avg_execution_duration_minutes": 7.0
    }
  }
}
```

## 🏥 Health Check

### Get Health Status
```http
GET /api/workflow-automation/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "workflow_automation",
    "timestamp": "2025-12-24T13:00:00Z",
    "features": [
      "template_management",
      "workflow_execution",
      "automation_rules",
      "real_time_monitoring"
    ]
  }
}
```

## 🔧 Workflow Step Types

### Available Step Types

| Type | Description | Configuration |
|------|-------------|---------------|
| `action` | Execute an action or API call | `action_type`, `endpoint`, `parameters` |
| `condition` | Conditional branching logic | `conditions`, `default_next_step` |
| `human_task` | Requires human intervention | `assignee`, `due_date`, `instructions` |
| `approval` | Approval workflow step | `approvers`, `approval_type`, `timeout` |
| `notification` | Send notifications | `template`, `recipients`, `channels` |
| `integration` | Third-party service integration | `service`, `operation`, `credentials` |
| `loop` | Iterate over data | `iteration_data`, `loop_steps` |
| `parallel` | Execute steps in parallel | `parallel_steps`, `join_condition` |

### Step Configuration Examples

#### Action Step
```json
{
  "id": "send_email",
  "name": "Send Welcome Email",
  "type": "action",
  "config": {
    "action_type": "email",
    "template": "welcome_template",
    "to": "{{employee_email}}",
    "subject": "Welcome to {{company_name}}!",
    "variables": {
      "employee_name": "{{employee_name}}",
      "start_date": "{{start_date}}"
    }
  }
}
```

#### Condition Step
```json
{
  "id": "check_department",
  "name": "Route by Department",
  "type": "condition",
  "conditions": [
    {
      "field": "department",
      "operator": "equals",
      "value": "Engineering",
      "next_step": "tech_setup"
    },
    {
      "field": "department",
      "operator": "equals",
      "value": "Sales",
      "next_step": "sales_setup"
    }
  ],
  "config": {
    "default_next_step": "general_setup"
  }
}
```

#### Human Task Step
```json
{
  "id": "manager_review",
  "name": "Manager Review",
  "type": "human_task",
  "config": {
    "assignee": "{{manager_email}}",
    "due_date": "{{add_days(start_date, 1)}}",
    "instructions": "Please review the new employee setup and approve access permissions.",
    "form_fields": [
      {
        "name": "access_level",
        "type": "select",
        "options": ["basic", "standard", "advanced"],
        "required": true
      }
    ]
  }
}
```

## 🔄 Trigger Types

### Event-Based Triggers
```json
{
  "trigger_type": "event_based",
  "trigger_config": {
    "event_type": "user_registered",
    "event_source": "auth_service",
    "filters": {
      "user_type": "employee"
    }
  }
}
```

### Scheduled Triggers
```json
{
  "trigger_type": "scheduled",
  "trigger_config": {
    "cron_expression": "0 9 * * MON",
    "timezone": "UTC",
    "description": "Every Monday at 9 AM"
  }
}
```

### Webhook Triggers
```json
{
  "trigger_type": "webhook",
  "trigger_config": {
    "webhook_url": "https://api.digame.ai/webhooks/workflow/abc123",
    "secret_key": "webhook_secret_key",
    "allowed_ips": ["192.168.1.0/24"]
  }
}
```

## 📝 Best Practices

### Template Design
- Use descriptive names and clear descriptions
- Define comprehensive input/output schemas
- Include error handling steps
- Set appropriate timeouts and retry logic
- Use variables for reusability

### Automation Rules
- Start with simple conditions and expand gradually
- Set appropriate rate limits to prevent overload
- Monitor rule performance and adjust as needed
- Use test mode before activating rules
- Document rule logic and expected behavior

### Performance Optimization
- Minimize the number of steps in critical workflows
- Use parallel execution where possible
- Implement proper error handling and retries
- Monitor execution times and optimize bottlenecks
- Cache frequently used data

## 🚨 Error Handling

### Common Error Codes
- `TEMPLATE_NOT_FOUND` - Workflow template not found
- `INSTANCE_NOT_FOUND` - Workflow instance not found
- `INVALID_WORKFLOW_DEFINITION` - Invalid workflow structure
- `EXECUTION_FAILED` - Workflow execution failed
- `RULE_VALIDATION_ERROR` - Automation rule validation failed
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_FAILED",
    "message": "Workflow execution failed at step 'send_email'",
    "details": {
      "step_id": "send_email",
      "error_type": "SMTP_ERROR",
      "error_message": "Failed to connect to SMTP server"
    }
  }
}
```

---

**Last Updated**: December 24, 2025  
**API Version**: v2  
**Workflow Automation Version**: 1.0.0

For interactive API testing, visit the [Swagger documentation](http://localhost:8000/docs#/workflow-automation).