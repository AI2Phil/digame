# Team Collaboration API Endpoints

This document details the API endpoints for managing teams, team members, and accessing team collaboration insights.

**Base Path**: `/teams`

## Authentication

All endpoints require authentication. Users must provide a valid JWT Bearer token in the `Authorization` header. User permissions and roles within a team determine access to specific operations.

## Team Management

### 1. Create New Team

*   **Endpoint**: `POST /teams/`
*   **Description**: Creates a new team. The user making the request becomes the creator and an initial admin of the team.
*   **Request Body**: `schemas.TeamCreate`
    ```json
    {
        "name": "string (required, min_length=3, max_length=100)",
        "description": "string (optional, max_length=500)",
        "initial_members": [
            {
                "user_id": "integer (required)",
                "role": "string (optional, 'member'|'leader'|'coordinator'|'admin', defaults to 'member')",
                "custom_attributes": "object (optional)"
            }
        ]
        // created_by_user_id is set automatically from the authenticated user
    }
    ```
*   **Response**: `201 CREATED` - `schemas.Team` (includes team ID, timestamps, and creator as admin member)
*   **Permissions**: Authenticated user.

### 2. List All Teams

*   **Endpoint**: `GET /teams/`
*   **Description**: Retrieves a list of all teams in the system.
*   **Query Parameters**:
    *   `skip`: `integer (optional, default 0)` - Number of teams to skip.
    *   `limit`: `integer (optional, default 100)` - Maximum number of teams to return.
*   **Response**: `200 OK` - `List[schemas.Team]`
*   **Permissions**: Authenticated user (current implementation allows all users to list teams; could be restricted).

### 3. Get Team Details

*   **Endpoint**: `GET /teams/{team_id}`
*   **Description**: Retrieves detailed information about a specific team, including members, performance metrics, skill gaps, and workflows.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Response**: `200 OK` - `schemas.TeamWithFullDetails`
*   **Permissions**: Team member or system admin.

### 4. Update Team Details

*   **Endpoint**: `PUT /teams/{team_id}`
*   **Description**: Updates a team's name or description.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Request Body**: `schemas.TeamUpdate`
    ```json
    {
        "name": "string (optional, min_length=3, max_length=100)",
        "description": "string (optional, max_length=500)"
    }
    ```
*   **Response**: `200 OK` - `schemas.Team`
*   **Permissions**: Team Admin, Team Leader, or Team Creator.

### 5. Delete Team

*   **Endpoint**: `DELETE /teams/{team_id}`
*   **Description**: Deletes a team and all its associated data (members, metrics, etc.).
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Response**: `200 OK` - `{"message": "Team deleted successfully"}`
*   **Permissions**: Team Admin, Team Creator, or System Admin.

## Team Member Management

### 1. Add Member to Team

*   **Endpoint**: `POST /teams/{team_id}/members`
*   **Description**: Adds a user to a team with a specified role.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Request Body**: `schemas.TeamMemberAction`
    ```json
    {
        "user_id": "integer (required)",
        "role": "string (optional, 'member'|'leader'|'coordinator'|'admin', defaults to 'member')"
    }
    ```
*   **Response**: `201 CREATED` - `schemas.TeamMember`
*   **Permissions**: Team Admin or Team Leader.

### 2. List Team Members

*   **Endpoint**: `GET /teams/{team_id}/members`
*   **Description**: Retrieves a list of all members in a specific team.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Response**: `200 OK` - `List[schemas.TeamMember]`
*   **Permissions**: Team member or System Admin.

### 3. Update Team Member Details (Role/Attributes)

*   **Endpoint**: `PUT /teams/{team_id}/members/{user_id_to_update}`
*   **Description**: Updates a team member's role or custom attributes.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
    *   `user_id_to_update`: `integer (required)` - The ID of the user (member) to update.
*   **Request Body**: `schemas.TeamMemberUpdate`
    ```json
    {
        "role": "string (optional, 'member'|'leader'|'coordinator'|'admin')",
        "custom_attributes": "object (optional)"
    }
    ```
*   **Response**: `200 OK` - `schemas.TeamMember`
*   **Permissions**: Team Admin or Team Leader.

### 4. Remove Member from Team

*   **Endpoint**: `DELETE /teams/{team_id}/members/{user_id_to_remove}`
*   **Description**: Removes a user from a team.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
    *   `user_id_to_remove`: `integer (required)` - The ID of the user (member) to remove.
*   **Response**: `200 OK` - `{"message": "Team member removed successfully"}`
*   **Permissions**: User themselves, Team Admin, or Team Leader.

## Team Analytics & Insights

### 1. Get Team Analytics Dashboard

*   **Endpoint**: `GET /teams/{team_id}/analytics`
*   **Description**: Retrieves the analytics dashboard for a team, including performance metrics, collaboration patterns (placeholder), skill gaps, and workflow summaries.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Response**: `200 OK` - `schemas.TeamAnalyticsDashboard`
*   **Permissions**: Team member.

### 2. Team Development Plan (Placeholder)

*   **Endpoint**: `POST /teams/{team_id}/development-plan`
*   **Description**: Creates or updates a development plan for the team. (Service logic is currently a placeholder).
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Request Body**: `object` (example: `{"goal": "Improve Python skills", "actions": ["Online courses"]}`)
*   **Response**: `200 OK` - `object` (current response is a placeholder status message)
*   **Permissions**: Team Admin or Team Leader.

## Team Performance Metrics Management

### 1. Create Team Performance Metric

*   **Endpoint**: `POST /teams/{team_id}/metrics`
*   **Description**: Adds a performance metric record for a team.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Request Body**: `schemas.TeamPerformanceMetricCreate`
    ```json
    {
        "team_id": "integer (required, must match path parameter)",
        "metric_name": "string (required, max_length=100)",
        "metric_value": "object (required, e.g., {\"count\": 150, \"period\": \"weekly\"})",
        "notes": "string (optional, max_length=1000)"
    }
    ```
*   **Response**: `201 CREATED` - `schemas.TeamPerformanceMetric`
*   **Permissions**: Team Admin or Team Leader.

### 2. List Team Performance Metrics

*   **Endpoint**: `GET /teams/{team_id}/metrics`
*   **Description**: Retrieves all performance metrics for a specific team.
*   **Path Parameters**:
    *   `team_id`: `integer (required)` - The ID of the team.
*   **Query Parameters**:
    *   `skip`: `integer (optional, default 0)`
    *   `limit`: `integer (optional, default 100)`
*   **Response**: `200 OK` - `List[schemas.TeamPerformanceMetric]`
*   **Permissions**: Team member.

### 3. Get Specific Team Performance Metric

*   **Endpoint**: `GET /teams/metrics/{metric_id}`
*   **Description**: Retrieves a specific performance metric by its ID.
*   **Path Parameters**:
    *   `metric_id`: `integer (required)` - The ID of the metric.
*   **Response**: `200 OK` - `schemas.TeamPerformanceMetric`
*   **Permissions**: Team member of the associated team.

### 4. Update Team Performance Metric

*   **Endpoint**: `PUT /teams/metrics/{metric_id}`
*   **Description**: Updates an existing performance metric.
*   **Path Parameters**:
    *   `metric_id`: `integer (required)` - The ID of the metric.
*   **Request Body**: `schemas.TeamPerformanceMetricUpdate`
    ```json
    {
        "metric_name": "string (optional, max_length=100)",
        "metric_value": "object (optional)",
        "notes": "string (optional, max_length=1000)"
    }
    ```
*   **Response**: `200 OK` - `schemas.TeamPerformanceMetric`
*   **Permissions**: Team Admin or Team Leader of the associated team.

### 5. Delete Team Performance Metric

*   **Endpoint**: `DELETE /teams/metrics/{metric_id}`
*   **Description**: Deletes a performance metric.
*   **Path Parameters**:
    *   `metric_id`: `integer (required)` - The ID of the metric.
*   **Response**: `200 OK` - `{"message": "Metric deleted successfully"}`
*   **Permissions**: Team Admin or Team Leader of the associated team.

## Team Skill Gaps Management

(Similar CRUD endpoints as Performance Metrics, using `/teams/{team_id}/skillgaps` and `/teams/skillgaps/{skill_gap_id}`)

### 1. Create Team Skill Gap

*   **Endpoint**: `POST /teams/{team_id}/skillgaps`
*   **Request Body**: `schemas.TeamSkillGapCreate`
*   **Response**: `201 CREATED` - `schemas.TeamSkillGap`
*   **Permissions**: Team Admin or Team Leader.

### 2. List Team Skill Gaps

*   **Endpoint**: `GET /teams/{team_id}/skillgaps`
*   **Response**: `200 OK` - `List[schemas.TeamSkillGap]`
*   **Permissions**: Team member.

*(GET by ID, PUT, DELETE for skill gaps would follow a similar pattern to metrics, but are not explicitly detailed here for brevity. They are implemented in the router.)*

## Team Workflows Management

(Similar CRUD endpoints as Performance Metrics, using `/teams/{team_id}/workflows` and `/teams/workflows/{workflow_id}`)

### 1. Create Team Workflow

*   **Endpoint**: `POST /teams/{team_id}/workflows`
*   **Request Body**: `schemas.TeamWorkflowCreate`
*   **Response**: `201 CREATED` - `schemas.TeamWorkflow`
*   **Permissions**: Team Admin or Team Leader.

### 2. List Team Workflows

*   **Endpoint**: `GET /teams/{team_id}/workflows`
*   **Response**: `200 OK` - `List[schemas.TeamWorkflow]`
*   **Permissions**: Team member.

*(GET by ID, PUT, DELETE for workflows would follow a similar pattern to metrics, but are not explicitly detailed here for brevity. They are implemented in the router.)*
