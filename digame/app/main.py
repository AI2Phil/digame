from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware # Added for GZip compression
import logging
from pythonjsonlogger import jsonlogger
import sys # Required for sys.stdout

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
from .routers import auth_router  # Import the new authentication router
from .routers import onboarding_router
from .routers import user_setting_router # Import the user setting router
from .routers import admin_simple_router # Import the admin dashboard router
from .routers import writing_assistance_router # Import the new writing assistance router
from .routers import task_router # Import the task management router
from .routers import enterprise_dashboard_router # Import the enterprise dashboard router
from .routers import market_intelligence_router # Import the market intelligence router
from .routers import workflow_automation_router # Import the workflow automation router
from .routers import integration_router # Import the integration router
from .routers import tenant_router # Import the tenant router
from .routers import notification_router # Import the notification router
from .routers import social_collaboration_router # Import the social collaboration router
from .routers import mobile_ai_router # Import the new mobile AI router

# Import authentication components
from .auth.middleware import configure_auth_middleware
from .auth.config import auth_settings, get_middleware_config

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
            "name": "Social Collaboration",
            "description": "Peer matching, user profiles, and social features"
        },
        {
            "name": "Mobile AI Features", # Broadened from "Mobile AI Notifications"
            "description": "AI-powered features for mobile clients (notifications, voice)"
        }
    ]
)

# Configure authentication middleware
logger.info("Configuring authentication middleware...")
middleware_config = get_middleware_config()
configure_auth_middleware(app, middleware_config)

# Add GZip middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)
logger.info("GZipMiddleware added with minimum_size=1000")

# Include authentication router first (no authentication required)
app.include_router(auth_router.router, tags=["Authentication"])

# Include other routers (these will be protected by authentication middleware)
app.include_router(user_setting_router.router)
app.include_router(writing_assistance_router.router)
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
app.include_router(onboarding_router.router, tags=["Onboarding"])
app.include_router(task_router.router, tags=["Task Management"])
app.include_router(enterprise_dashboard_router.router, tags=["Enterprise Dashboard"])
app.include_router(market_intelligence_router.router, tags=["Market Intelligence"])
app.include_router(workflow_automation_router.router, tags=["Workflow Automation"])
app.include_router(integration_router.router, tags=["Integrations"])
app.include_router(tenant_router.router) # Already tagged in its own file
app.include_router(notification_router.router, prefix="/api", tags=["Notifications"])
app.include_router(social_collaboration_router.router) # Add the social collaboration router
app.include_router(mobile_ai_router.router) # Add the new mobile_ai_router, already tagged in its file

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
            # Assuming get_db is a context manager or generator
            from .database import get_db_session_context # Or your actual get_db that yields a session
            
            # Correctly use the context manager or generator for the session
            async with get_db_session_context() if hasattr(get_db_session_context, "__aenter__") else next(get_db_session_context()) as db:
                 success = initialize_auth_database(db)

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
async def read_root():
    return {
        "message": "Welcome to the Digame API",
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
    return {"detail": f"Resource not found: {request.url.path}", "status_code": 404}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error on {request.method} {request.url}: {exc}", exc_info=True)
    return {"detail": "Internal Server Error", "status_code": 500}

# Development server runner
if __name__ == "__main__":
    import uvicorn
    logger.info("🔧 Starting development server...")
    uvicorn.run("digame.app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")

```
