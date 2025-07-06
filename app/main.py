from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware # Added for GZip compression
from fastapi.responses import JSONResponse
import logging
from pythonjsonlogger import jsonlogger
import sys # Required for sys.stdout
from datetime import datetime, timezone

# Import authentication utilities
from .auth.middleware import configure_auth_middleware
from .auth.config import auth_settings

# Import i18n utilities
from .i18n import LocaleMiddleware, _ as i18n_gettext # Restore original alias

# Import routers
from .routers import predictive as predictive_router
from .routers import admin_rbac_router
from .routers import admin_router
from .routers import analytics_router
from .routers import process_notes_router
from .routers import behavior as behavior_router
from .routers import pattern_recognition_router
from .routers import job_router
from .routers import publish_router
from .routers.auth_router import router as auth_router  # Import the new authentication router
from .routers import onboarding_router
from .routers import enhanced_onboarding_router
from .routers import user_setting_router # Import the user setting router
from .routers import admin_simple_router # Import the admin dashboard router
from .routers import writing_assistance_router # Import the new writing assistance router
from .routers import task_router # Import the task management router
from .routers import enterprise_dashboard_router # Import the enterprise dashboard router
from .routers import market_intelligence_router # Import the market intelligence router
from .routers import workflow_automation_router # Import the workflow automation router
from .routers import integration_router # Import the integration router
# from .routers import tenant_router # Import the tenant router - temporarily disabled due to UserRole conflicts
from .routers import notification_router # Import the notification router
from .routers import voice_router # Import the voice NLU router
from .routers import advanced_mobile_router # Import the advanced mobile AI router
from .routers import social_collaboration as social_collaboration_router # Import the social collaboration router
from .routers import mobile_ai_router # Import the new mobile AI router
from .routers import communication_style_router # Import the new communication style router
from .routers import meeting_insights_router # Import the new meeting insights router
from .routers import email_analysis_router # Import the new email analysis router
from .routers import language_learning_router # Import the new language learning router
from .routers import task_prioritization_router # Import the new task prioritization router
from .routers import user_profile_router # Import the new user profile router
from .routers import dashboard_router # Import the dashboard router
from .routers import team_router # Import the new team router
from .routers import advanced_analytics_router # Import the new advanced analytics router
from .routers import document_processing_router # Import the new document processing router
# from .routers import security_router # Import the security router - temporarily disabled
from .api import gamification # Import the gamification API
from .routers import guest_auth_router # Import the guest authentication router
from .routers import digital_twin_onboarding_router # Import the digital twin onboarding router
from .routers import guest_experience_router # Import the guest experience router
from .routers import guest_analytics_router # Import the guest analytics router
from .routers import guest_integrations_router # Import the guest integrations router
from .routers import platform_management_router # Import the platform management router
from .routers import platform_analytics_router # Import the platform analytics router
from .routers import notifications_router # Import the notifications router
from .routers import mfa_router # Import the MFA router
from .routers import advanced_analytics_router # Import the advanced analytics router
from .routers import aco_router # Import the ACO integration router
from .routers import digital_twin_router # Import the digital twin router
from .routers import simulation_router # Import the simulation router
from .routers import intelligence_router # Import the intelligence router
from .routers import platform_owner_router # Import the platform owner router
from .routers import advanced_behavioral_analysis_router # Import the advanced behavioral analysis router
from .routers import advanced_nlp_router # Import the advanced NLP router
from .api.v1 import advanced_tenant_management # Import the advanced tenant management router
from .api.v1 import enterprise_security_enhancement # Import the enterprise security enhancement router
from .api.v1 import enterprise_integration # Import the enterprise integration router
from .api.v1 import performance_optimization # Import the performance optimization router
from .api.v1 import testing_quality_assurance # Import the testing quality assurance router

# Configure JSON logging
logger = logging.getLogger("digame_app") # Use a specific name for the main app logger
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler(sys.stdout) # Output to stdout
formatter = jsonlogger.JsonFormatter(
    fmt="%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(lineno)d %(message)s"
)
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Create FastAPI application with enhanced metadata
app = FastAPI(
    title="Digame API",
    description="""
    ## Digame - Digital Professional Twin Platform
    
    A comprehensive platform for behavioral analysis, predictive modeling, and professional development.
    
    ### Features:
    - 🔐 **Authentication & Authorization**: JWT-based auth with RBAC
    - 🧠 **Behavioral Analysis**: Advanced behavior modeling and pattern recognition
    - 📊 **Predictive Modeling**: Machine learning-powered predictions
    - 📝 **Process Notes**: Comprehensive documentation system
    - 🔄 **Background Jobs**: Asynchronous task processing
    - 📤 **Publishing**: Model and data publishing capabilities
    
    ### Authentication:
    - Register at `/auth/register`
    - Login at `/auth/login`
    - Use Bearer token in Authorization header for protected endpoints
    """,
    version="1.0.0",
    contact={
        "name": "Digame Platform",
        "email": "support@digame.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User authentication and authorization endpoints"
        },
        {
            "name": "Predictive Modeling",
            "description": "Machine learning and predictive analytics"
        },
        {
            "name": "Behavior Recognition",
            "description": "Behavioral analysis and pattern recognition"
        },
        {
            "name": "Process Notes",
            "description": "Documentation and process management"
        },
        {
            "name": "Admin RBAC Management",
            "description": "Role-based access control administration"
        },
        {
            "name": "Background Jobs",
            "description": "Asynchronous task processing"
        },
        {
            "name": "Publishing",
            "description": "Model and data publishing"
        },
        {
            "name": "Task Management",
            "description": "AI-powered task suggestions and management"
        },
        {
            "name": "Enterprise Dashboard",
            "description": "Enterprise-wide dashboard and feature management"
        },
        {
            "name": "Market Intelligence",
            "description": "Market analysis and intelligence reporting"
        },
        {
            "name": "Workflow Automation",
            "description": "Automated workflow and process management"
        },
        {
            "name": "Integrations",
            "description": "Third-party service integrations and APIs"
        },
        {
            "name": "Tenant Management",
            "description": "Multi-tenant organization management"
        },
        {
            "name": "Advanced Mobile AI Features",
            "description": "Endpoints for AI-driven advanced mobile functionalities like voice NLU and notification personalization."
        },
        {
            "name": "Social Collaboration",
            "description": "Peer matching, user profiles, and social features"
        },
        {
            "name": "Mobile AI Features",
            "description": "AI-powered features for mobile clients (notifications, voice)"
        },
        {
            "name": "Gamification",
            "description": "Achievement tracking, streaks, points, and leaderboards"
        },
        {
            "name": "Teams",
            "description": "Team collaboration, performance analytics, and insights"
        },
        {
            "name": "Security",
            "description": "Advanced security features including MFA, threat detection, and policy management"
        },
        {
            "name": "Guest Analytics",
            "description": "Advanced analytics and insights for guest user behavior and conversion tracking"
        },
        {
            "name": "Guest Integrations",
            "description": "External integrations and mobile-responsive features for guest users"
        },
        {
            "name": "Platform Management",
            "description": "Platform Owner management, analytics, and tenant oversight capabilities"
        },
        {
            "name": "Platform Analytics",
            "description": "Comprehensive analytics dashboard and insights for Platform Owners"
        },
        {
            "name": "Notifications",
            "description": "Platform Owner notification system for alerts, security events, and business insights"
        },
        {
            "name": "Multi-Factor Authentication",
            "description": "MFA device management, IP restrictions, and advanced security features"
        },
        {
            "name": "Advanced Analytics",
            "description": "ML-based predictions, anomaly detection, behavioral analysis, and intelligent insights"
        },
        {
            "name": "ACO Integration",
            "description": "Automated Customer Operations including subscription management, revenue tracking, and founding member program"
        },
        {
            "name": "Digital Twins",
            "description": "Digital twin creation, management, and AI-powered productivity insights"
        },
        {
            "name": "Intelligence",
            "description": "Pattern recognition, predictive analytics, and AI-powered insights"
        },
        {
            "name": "Platform Owner",
            "description": "Platform owner management, settings, and testing capabilities"
        },
        {
            "name": "Advanced Behavioral Analysis",
            "description": "Deep learning behavioral models, temporal pattern analysis, and predictive behavioral insights"
        },
        {
            "name": "Advanced NLP",
            "description": "Advanced natural language processing including conversation management, document analysis, sentiment analysis, content generation, and intelligent suggestions"
        },
        {
            "name": "Advanced Tenant Management",
            "description": "Enterprise multi-tenant management with resource allocation, analytics, billing, and customization features"
        },
        {
            "name": "Enterprise Security Enhancement",
            "description": "Advanced security features including threat detection, policy management, incident response, and compliance monitoring"
        },
        {
            "name": "Enterprise Integration",
            "description": "Advanced enterprise integration features including LDAP/AD, enhanced SSO, API gateway, and monitoring"
        },
        {
            "name": "Performance Optimization",
            "description": "Comprehensive performance optimization including database optimization, caching strategies, API performance tuning, and frontend optimization"
        },
        {
            "name": "Testing & Quality Assurance",
            "description": "Comprehensive testing, quality assurance, monitoring, and documentation for production readiness"
        }
    ]
)

# Add LocaleMiddleware - should be early in the stack but after CORS if CORS is very broad
# It needs to run before routes and other middleware that might need translated messages.
# If auth middleware also needs translated messages for errors, LocaleMiddleware should be before it.
logger.info("Configuring LocaleMiddleware for i18n...")
app.add_middleware(LocaleMiddleware)

# Configure authentication middleware
logger.info("Configuring authentication middleware...")
from .auth.config import get_middleware_config
middleware_config = get_middleware_config()
configure_auth_middleware(app, middleware_config)

# Add GZip middleware for response compression
# Note: Temporarily commented out due to type issues
# app.add_middleware(GZipMiddleware, minimum_size=1000)
logger.info("GZipMiddleware configuration skipped due to type compatibility")

# Include authentication router first (no authentication required)
app.include_router(auth_router, tags=["Authentication"])
app.include_router(guest_auth_router.router, prefix="/api/guest", tags=["Guest Authentication"])
app.include_router(digital_twin_onboarding_router.router, prefix="/api", tags=["Digital Twin Onboarding"])
app.include_router(guest_experience_router.router, prefix="/api", tags=["Guest Experience"])
app.include_router(guest_analytics_router.router, tags=["Guest Analytics"])
app.include_router(guest_integrations_router.router, tags=["Guest Integrations"])
app.include_router(platform_management_router.router, prefix="/api/v1", tags=["Platform Management"])
app.include_router(platform_analytics_router.router, tags=["Platform Analytics"])
app.include_router(notifications_router.router, tags=["Notifications"])
app.include_router(mfa_router.router, tags=["Multi-Factor Authentication"])
app.include_router(advanced_analytics_router.router, tags=["Advanced Analytics"])
app.include_router(aco_router.router, tags=["ACO Integration"])

# Include dashboard and onboarding routers
app.include_router(dashboard_router.router, tags=["Dashboard"])
app.include_router(onboarding_router.router, tags=["Onboarding"])
app.include_router(enhanced_onboarding_router.router, prefix="/api/v1", tags=["Enhanced Onboarding"])

# Include other routers (these will be protected by authentication middleware)
app.include_router(user_setting_router) # Add user setting router
app.include_router(writing_assistance_router.router) # Add the writing assistance router
app.include_router(communication_style_router.router) # Add the communication style router
app.include_router(meeting_insights_router.router) # Add the meeting insights router
app.include_router(email_analysis_router.router) # Add the email analysis router
app.include_router(language_learning_router.router) # Add the language learning router
app.include_router(task_prioritization_router.router) # Add the task prioritization router
app.include_router(admin_simple_router.router, tags=["Admin Dashboard"])
app.include_router(predictive_router.router, prefix="/predictive", tags=["Predictive Modeling"])
app.include_router(admin_rbac_router.router, prefix="/admin/rbac", tags=["Admin RBAC Management"])
app.include_router(admin_router.router, prefix="/api", tags=["Admin Dashboard"]) # Consider if this duplicates admin_simple_router tag
app.include_router(analytics_router.router, prefix="/api", tags=["Analytics"])
app.include_router(process_notes_router.router, prefix="/process-notes", tags=["Process Notes"])
app.include_router(behavior_router.router, prefix="/behavior", tags=["Behavior Recognition"])
app.include_router(pattern_recognition_router.router, prefix="/pattern-recognition", tags=["Pattern Recognition"])
app.include_router(job_router.router, prefix="/api", tags=["Background Jobs"])
app.include_router(publish_router.router, prefix="/publish", tags=["Publishing"])
app.include_router(task_router.router, tags=["Task Management"])
app.include_router(enterprise_dashboard_router.router, tags=["Enterprise Dashboard"])
app.include_router(market_intelligence_router.router, tags=["Market Intelligence"])
app.include_router(workflow_automation_router.router, tags=["Workflow Automation"])
app.include_router(integration_router.router, tags=["Integrations"])
# app.include_router(tenant_router.router, tags=["Tenant Management"]) # Temporarily disabled
app.include_router(notification_router.router, prefix="/api", tags=["Notifications"])
app.include_router(voice_router.router) # Add voice NLU router, prefix is in the router file
app.include_router(advanced_mobile_router.router) # Add advanced mobile AI router, tags are in the router
app.include_router(social_collaboration_router.router) # Add the social collaboration router
app.include_router(mobile_ai_router.router) # Add the new mobile_ai_router, already tagged in its file
app.include_router(user_profile_router.router) # Add user profile router, prefix and tags are in the router itself
app.include_router(gamification.router, tags=["Gamification"]) # Add gamification router
app.include_router(team_router.router, prefix="/api", tags=["Teams"]) # Add team router with API prefix
app.include_router(advanced_analytics_router.router) # Add advanced analytics router, prefix and tags are in the router itself
app.include_router(document_processing_router.router) # Add document processing router, prefix and tags are in router
# app.include_router(security_router.router, prefix="/api", tags=["Security"]) # Add security router - temporarily disabled
app.include_router(digital_twin_router.router, tags=["Digital Twins"]) # Add digital twin router
app.include_router(simulation_router.router, tags=["Simulation"]) # Add simulation router
app.include_router(intelligence_router.router, tags=["Intelligence"]) # Add intelligence router
app.include_router(platform_owner_router.router, tags=["Platform Owner"]) # Add platform owner router
app.include_router(advanced_behavioral_analysis_router.router, tags=["Advanced Behavioral Analysis"]) # Add advanced behavioral analysis router
app.include_router(advanced_nlp_router.router, tags=["Advanced NLP"]) # Add advanced NLP router
app.include_router(advanced_tenant_management.router, prefix="/api/v1", tags=["Advanced Tenant Management"]) # Add advanced tenant management router
app.include_router(enterprise_security_enhancement.router, prefix="/api/v1", tags=["Enterprise Security Enhancement"]) # Add enterprise security enhancement router
app.include_router(enterprise_integration.router, prefix="/api/v1", tags=["Enterprise Integration"]) # Add enterprise integration router
app.include_router(performance_optimization.router, prefix="/api/v1", tags=["Performance Optimization"]) # Add performance optimization router
app.include_router(testing_quality_assurance.router, prefix="/api/v1", tags=["Testing & Quality Assurance"]) # Add testing quality assurance router


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Digame API...")
    logger.info(f"📊 API Version: {app.version}")
    logger.info(f"🔐 Authentication: {'Enabled' if auth_settings.auth_middleware_enabled else 'Disabled'}")
    logger.info(f"🛡️  Rate Limiting: {'Enabled' if auth_settings.rate_limit_enabled else 'Disabled'}")
    logger.info(f"🌐 CORS: {'Enabled' if auth_settings.cors_enabled else 'Disabled'}")
    
    if auth_settings.create_default_roles:
        try:
            from .auth.init_auth_db import initialize_auth_database
            from .db import get_db
            
            db = next(get_db())
            success = initialize_auth_database(db)
            db.close()

            if success:
                logger.info("✅ Authentication database initialized successfully")
            else:
                logger.warning("⚠️  Authentication database initialization failed")
        except Exception as e:
            logger.error(f"❌ Authentication database initialization error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down Digame API...")

# Health check endpoints
@app.get("/", tags=["Health"])
async def read_root(request: Request): # Add request: Request
    # Runtime translation using imported i18n_gettext (aliased from i18n._)
    # The string "Welcome to the Digame API" is manually maintained in .po files due to extraction issues.
    welcome_message = i18n_gettext(request, "Welcome to the Digame API")
    return {
        "message": welcome_message,
        "version": app.version,
        "title": app.title,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "digame-api",
        "version": app.version,
        "timestamp": datetime.now(timezone.utc).isoformat() # Use current time
    }

@app.get("/service-info", tags=["Health"])
async def service_info():
    return {
        "service": "digame-api",
        "version": app.version,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "auth": "/auth",
            "docs": "/docs",
            "platform_owner": "/platform-owner"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Request context middleware for debugging
@app.middleware("http")
async def add_request_context(request: Request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    if process_time > 1.0:
        logger.warning(f"Slow request: {request.method} {request.url} took {process_time:.2f}s")
    return response

# Exception handlers (simplified, assuming they are defined elsewhere or basic for now)
# Custom 404 and 500 handlers were in the original, kept them simplified here.
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Resource not found: {request.url.path}", "status_code": 404}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "status_code": 500}
    )

# Development server runner
if __name__ == "__main__":
    import uvicorn
    logger.info("🔧 Starting development server...")
    uvicorn.run("digame.app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
