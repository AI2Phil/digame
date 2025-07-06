# Admin Configuration System for Default/Fallback API Keys

## Overview

The Admin Configuration System provides a comprehensive solution for administrators to manage default/fallback API keys for AI services. This system enables easier AI feature setup in deployments where users may not have their own API keys, while maintaining security, usage tracking, and cost control.

## Features

### 🔑 **API Key Management**
- **Secure Storage**: API keys are encrypted using Fernet encryption
- **Service Support**: OpenAI, Anthropic, Google, Azure OpenAI, HuggingFace, Cohere
- **Usage Limits**: Per-user monthly limits to control costs
- **Endpoint Restrictions**: Granular control over which endpoints can be accessed
- **Active/Inactive States**: Easy enable/disable of fallback keys

### 📊 **Usage Tracking & Analytics**
- **Comprehensive Logging**: Track all API key usage with timestamps
- **Cost Monitoring**: Estimate and track API costs per user/service
- **Usage Statistics**: Detailed analytics for administrators
- **Performance Metrics**: Success rates, error tracking, token usage

### ⚙️ **System Configuration**
- **Flexible Settings**: Store any system-wide configuration
- **Type Safety**: Support for string, integer, boolean, and JSON values
- **Sensitive Data**: Automatic encryption for sensitive configurations
- **Categorization**: Organize configs by category (AI services, security, features, etc.)

### 🛡️ **Security & Access Control**
- **Admin-Only Management**: Only administrators can manage configurations
- **Encrypted Storage**: Sensitive data is encrypted at rest
- **Audit Trail**: Track who created/modified configurations
- **Usage Limits**: Prevent abuse with per-user limits

## Architecture

### Database Models

#### AdminAPIKeyConfig
```python
class AdminAPIKeyConfig(Base):
    id: int
    service_name: str  # 'openai', 'anthropic', etc.
    api_key: str  # Encrypted
    description: str
    is_active: bool
    usage_limit_per_user: int  # Monthly limit
    allowed_endpoints: List[str]  # JSON array
    created_at: datetime
    updated_at: datetime
    created_by: int  # Admin user ID
```

#### APIKeyUsageLog
```python
class APIKeyUsageLog(Base):
    id: int
    config_id: int  # Reference to AdminAPIKeyConfig
    user_id: int
    service_name: str
    endpoint: str
    tokens_used: int
    cost_estimate: str
    request_timestamp: datetime
    response_status: str  # 'success', 'error', 'rate_limited'
    error_message: str
```

#### AdminSystemConfig
```python
class AdminSystemConfig(Base):
    id: int
    config_key: str
    config_value: str  # Encrypted if sensitive
    config_type: str  # 'string', 'integer', 'boolean', 'json'
    description: str
    is_sensitive: bool
    category: str  # 'ai_services', 'security', etc.
    created_at: datetime
    updated_at: datetime
    created_by: int
```

### Service Layer

#### AdminConfigService
The main service class that handles all business logic:

```python
class AdminConfigService:
    def create_api_key_config(config, created_by) -> AdminAPIKeyConfig
    def get_fallback_api_key(service_name, user_id, endpoint) -> FallbackAPIKeyResponse
    def log_api_key_usage(service_name, user_id, endpoint, ...) -> APIKeyUsageLog
    def get_usage_stats(service_name, user_id, days) -> Dict
    def create_system_config(config, created_by) -> AdminSystemConfig
    def get_system_config_value(config_key, default) -> Any
```

### API Endpoints

#### API Key Configuration
- `POST /admin/config/api-keys` - Create new API key config
- `GET /admin/config/api-keys` - List all API key configs
- `GET /admin/config/api-keys/{id}` - Get specific config
- `PUT /admin/config/api-keys/{id}` - Update config
- `DELETE /admin/config/api-keys/{id}` - Delete config

#### Fallback API Key Access
- `POST /admin/config/fallback-api-key` - Get fallback API key for service
- `POST /admin/config/log-usage` - Log API key usage

#### Usage Analytics
- `GET /admin/config/usage-stats` - Get usage statistics
- `GET /admin/config/usage-stats/user/{id}` - Get user-specific stats

#### System Configuration
- `POST /admin/config/system` - Create system config
- `GET /admin/config/system` - List system configs
- `GET /admin/config/system/{key}/value` - Get config value

#### Dashboard
- `GET /admin/config/dashboard` - Get admin dashboard summary

## Usage Examples

### 1. Setting Up Fallback OpenAI API Key

```python
# Admin creates fallback OpenAI configuration
config = AdminAPIKeyConfigCreate(
    service_name=ServiceName.OPENAI,
    api_key="sk-your-openai-key-here",
    description="Fallback OpenAI key for all users",
    is_active=True,
    usage_limit_per_user=1000,  # 1000 requests per month per user
    allowed_endpoints=[
        "/chat/completions",
        "/embeddings",
        "/completions"
    ]
)

admin_service.create_api_key_config(config, admin_user_id)
```

### 2. User Requesting Fallback API Key

```python
# User's AI service requests fallback key
request = FallbackAPIKeyRequest(
    service_name=ServiceName.OPENAI,
    user_id=user.id,
    endpoint="/chat/completions"
)

response = admin_service.get_fallback_api_key(
    request.service_name,
    request.user_id,
    request.endpoint
)

if response.allowed and response.api_key:
    # Use the fallback API key
    openai_client = OpenAI(api_key=response.api_key)
    # Make API call...
    
    # Log usage
    admin_service.log_api_key_usage(
        service_name=ServiceName.OPENAI,
        user_id=user.id,
        endpoint="/chat/completions",
        tokens_used=150,
        cost_estimate="0.0003",
        response_status=ResponseStatus.SUCCESS
    )
```

### 3. Monitoring Usage

```python
# Get usage statistics
stats = admin_service.get_usage_stats(
    service_name=ServiceName.OPENAI,
    days=30
)

print(f"Total requests: {stats['total_requests']}")
print(f"Total cost: {stats['total_cost_estimate']}")
print(f"Top users: {stats['top_users']}")
```

## Integration with Existing AI Services

### Enhanced AI Integration Service

The existing `AIIntegrationService` can be enhanced to use fallback keys:

```python
class AIIntegrationService:
    def get_api_key(self, service_name: str, user_id: int, endpoint: str) -> Optional[str]:
        # First try user's personal API key
        user_key = self.get_user_api_key(user_id, service_name)
        if user_key:
            return user_key
        
        # Fall back to admin-configured key
        admin_service = get_admin_config_service(self.db)
        fallback_response = admin_service.get_fallback_api_key(
            ServiceName(service_name),
            user_id,
            endpoint
        )
        
        if fallback_response.allowed and fallback_response.api_key:
            return fallback_response.api_key
        
        return None
```

### Service Integration Examples

#### NotificationService
```python
class NotificationService:
    async def get_personalized_suggestions(self, user_id: int, context: dict):
        api_key = self.ai_integration.get_api_key("openai", user_id, "/chat/completions")
        if not api_key:
            return self.get_default_suggestions()
        
        # Use API key for OpenAI call
        # Log usage automatically
```

#### VoiceNLUService
```python
class VoiceNLUService:
    async def process_voice_command(self, user_id: int, transcript: str):
        api_key = self.ai_integration.get_api_key("openai", user_id, "/chat/completions")
        if not api_key:
            return self.get_fallback_nlu_response()
        
        # Process with OpenAI
        # Usage logged automatically
```

## Security Considerations

### Encryption
- **API Keys**: Encrypted using Fernet symmetric encryption
- **Sensitive Configs**: System configurations marked as sensitive are encrypted
- **Key Management**: Encryption key stored in environment variable `ADMIN_CONFIG_ENCRYPTION_KEY`

### Access Control
- **Admin Only**: Only users with admin role can manage configurations
- **User Restrictions**: Users can only access their own usage statistics
- **Endpoint Restrictions**: Granular control over which API endpoints are accessible

### Usage Limits
- **Per-User Limits**: Monthly request limits per user per service
- **Cost Control**: Track and limit API costs
- **Rate Limiting**: Prevent abuse with usage monitoring

## Deployment

### Environment Variables
```bash
# Required: Encryption key for sensitive data
ADMIN_CONFIG_ENCRYPTION_KEY=your-fernet-key-here

# Optional: Default admin API keys (for initial setup)
DEFAULT_OPENAI_API_KEY=sk-your-key
DEFAULT_ANTHROPIC_API_KEY=your-key
```

### Database Migration
```bash
# Run the migration to create admin config tables
alembic upgrade head
```

### Initial Setup
```python
# Create initial admin configurations
admin_service = get_admin_config_service(db)

# Set up OpenAI fallback
openai_config = AdminAPIKeyConfigCreate(
    service_name=ServiceName.OPENAI,
    api_key=os.getenv("DEFAULT_OPENAI_API_KEY"),
    description="Default OpenAI key for all users",
    is_active=True,
    usage_limit_per_user=500
)
admin_service.create_api_key_config(openai_config, admin_user_id)
```

## Monitoring & Analytics

### Usage Dashboard
The admin dashboard provides:
- **Total API Configurations**: Active and inactive counts
- **Usage Statistics**: Daily and monthly request counts
- **Cost Tracking**: Estimated costs per service
- **Top Services**: Most used AI services
- **Error Monitoring**: Failed requests and error rates

### Alerts & Notifications
- **Usage Limits**: Alert when users approach limits
- **Cost Thresholds**: Notify when costs exceed budgets
- **Error Rates**: Alert on high error rates
- **Key Expiration**: Notify when API keys need renewal

## Best Practices

### API Key Management
1. **Rotate Keys Regularly**: Update API keys periodically
2. **Monitor Usage**: Track costs and usage patterns
3. **Set Appropriate Limits**: Balance functionality with cost control
4. **Use Least Privilege**: Only allow necessary endpoints

### Security
1. **Secure Key Storage**: Use environment variables for encryption keys
2. **Regular Audits**: Review access logs and usage patterns
3. **Backup Configurations**: Maintain backups of critical configurations
4. **Monitor Access**: Track who accesses admin configurations

### Cost Management
1. **Set Usage Limits**: Implement per-user monthly limits
2. **Monitor Costs**: Track API costs across all services
3. **Optimize Usage**: Identify and optimize high-cost operations
4. **Budget Alerts**: Set up alerts for cost thresholds

## Future Enhancements

### Planned Features
- **API Key Templates**: Pre-configured templates for common services
- **Team Sharing**: Allow sharing API keys within teams
- **Advanced Analytics**: More detailed usage and cost analytics
- **Automated Rotation**: Automatic API key rotation
- **Integration Webhooks**: Notify external systems of usage events

### Scalability
- **Multi-Region**: Support for region-specific API keys
- **Load Balancing**: Distribute requests across multiple keys
- **Caching**: Cache frequently accessed configurations
- **Async Processing**: Background processing for usage logs

## Conclusion

The Admin Configuration System provides a robust, secure, and scalable solution for managing fallback API keys in the Digame platform. It enables easier deployment and setup while maintaining security, cost control, and comprehensive monitoring capabilities.

This system addresses the "Configuration & Administration" enhancement mentioned in the NEXT_STEPS.md document, providing administrators with the tools they need to manage AI service access effectively across their organization.