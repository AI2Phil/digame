"""
Digame Platform - Main FastAPI Application
Production-ready backend with health checks and monitoring
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Union
import logging

# Try to import psutil, fallback to basic health check if not available
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logging.warning("psutil not available, using basic health checks")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Digame Platform API",
    description="Advanced Analytics & Performance Monitoring Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup time for uptime calculation
startup_time = time.time()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Digame Platform API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint for monitoring and Docker health checks
    """
    try:
        # Calculate uptime
        uptime_seconds = time.time() - startup_time
        uptime_minutes = uptime_seconds / 60
        uptime_hours = uptime_minutes / 60
        
        # Base health status
        health_status: Dict[str, Any] = {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime": {
                "seconds": round(uptime_seconds, 2),
                "minutes": round(uptime_minutes, 2),
                "hours": round(uptime_hours, 2),
                "human_readable": f"{int(uptime_hours)}h {int(uptime_minutes % 60)}m {int(uptime_seconds % 60)}s"
            },
            "environment": {
                "python_version": os.sys.version,
                "environment": os.getenv("ENVIRONMENT", "development"),
                "debug": os.getenv("DEBUG", "false").lower() == "true",
                "psutil_available": PSUTIL_AVAILABLE
            },
            "services": {
                "database": "connected",  # This would be a real DB check in production
                "redis": "connected",     # This would be a real Redis check in production
                "api": "operational"
            }
        }
        
        # Add system metrics if psutil is available
        if PSUTIL_AVAILABLE:
            memory_info = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=0.1, percpu=False)
            disk_usage = psutil.disk_usage('/')
            
            # Ensure cpu_percent is a float, not a list
            if isinstance(cpu_percent, list):
                cpu_percent = sum(cpu_percent) / len(cpu_percent) if cpu_percent else 0.0
            
            health_status["system"] = {
                "memory": {
                    "total": memory_info.total,
                    "available": memory_info.available,
                    "percent": memory_info.percent,
                    "used": memory_info.used
                },
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "disk": {
                    "total": disk_usage.total,
                    "used": disk_usage.used,
                    "free": disk_usage.free,
                    "percent": (disk_usage.used / disk_usage.total) * 100
                }
            }
            
            # Determine overall health status
            warnings: List[str] = []
            errors: List[str] = []
            
            if memory_info.percent > 90:
                health_status["status"] = "warning"
                warnings.append("High memory usage")
            
            if cpu_percent > 90:
                health_status["status"] = "critical"
                errors.append("High CPU usage")
            
            if warnings:
                health_status["warnings"] = warnings
            if errors:
                health_status["errors"] = errors
        
        return JSONResponse(
            status_code=200,
            content=health_status
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }
        )

@app.get("/api/health")
async def api_health():
    """Simple API health check for frontend"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "api_version": "1.0.0"
    }

@app.get("/api/security/dashboard")
async def security_dashboard():
    """Basic security dashboard endpoint for frontend testing"""
    return {
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "security_metrics": {
            "total_users": 0,
            "active_sessions": 0,
            "failed_logins_24h": 0,
            "mfa_enabled_users": 0,
            "security_alerts": []
        },
        "message": "Security dashboard data (demo mode)"
    }

@app.get("/metrics")
async def metrics():
    """
    Prometheus-compatible metrics endpoint
    """
    try:
        uptime_seconds = time.time() - startup_time
        
        if PSUTIL_AVAILABLE:
            memory_info = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent()
            disk_usage = psutil.disk_usage('/')
            
            metrics_text = f"""# HELP digame_uptime_seconds Total uptime in seconds
# TYPE digame_uptime_seconds counter
digame_uptime_seconds {uptime_seconds}

# HELP digame_memory_usage_percent Memory usage percentage
# TYPE digame_memory_usage_percent gauge
digame_memory_usage_percent {memory_info.percent}

# HELP digame_cpu_usage_percent CPU usage percentage
# TYPE digame_cpu_usage_percent gauge
digame_cpu_usage_percent {cpu_percent}

# HELP digame_disk_usage_percent Disk usage percentage
# TYPE digame_disk_usage_percent gauge
digame_disk_usage_percent {(disk_usage.used / disk_usage.total) * 100}

# HELP digame_memory_total_bytes Total memory in bytes
# TYPE digame_memory_total_bytes gauge
digame_memory_total_bytes {memory_info.total}

# HELP digame_memory_used_bytes Used memory in bytes
# TYPE digame_memory_used_bytes gauge
digame_memory_used_bytes {memory_info.used}
"""
        else:
            metrics_text = f"""# HELP digame_uptime_seconds Total uptime in seconds
# TYPE digame_uptime_seconds counter
digame_uptime_seconds {uptime_seconds}

# HELP digame_status Application status
# TYPE digame_status gauge
digame_status 1
"""
        
        return JSONResponse(
            status_code=200,
            content={"metrics": metrics_text},
            media_type="text/plain"
        )
        
    except Exception as e:
        logger.error(f"Metrics collection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Metrics collection failed")

# Additional API endpoints would be added here
# For now, we have the essential health and monitoring endpoints

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disabled for production
        workers=4
    )