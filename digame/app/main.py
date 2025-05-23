from fastapi import FastAPI
# Adjust the import path according to your project structure
from .routers import predictive as predictive_router
from .routers import admin_rbac_router
from .routers import process_notes_router # Import the new Process Notes router
from .routers import behavior as behavior_router # Import the Behavior router
from .routers import pattern_recognition_router # Import the Pattern Recognition router
from .routers import job_router # Import the Job router for asynchronous processing

app = FastAPI(
    title="Digame API",
    description="API for the Digame - Digital Professional Twin Platform",
    version="0.1.0"
)

# Include routers
app.include_router(predictive_router.router, prefix="/predictive", tags=["Predictive Modeling"])
app.include_router(admin_rbac_router.router, prefix="/admin/rbac", tags=["Admin RBAC Management"])
app.include_router(process_notes_router.router, prefix="/process-notes", tags=["Process Notes"]) # Added Process Notes router
app.include_router(behavior_router.router, prefix="/behavior", tags=["Behavior Recognition"]) # Added Behavior router
app.include_router(pattern_recognition_router.router, prefix="/pattern-recognition", tags=["Pattern Recognition"]) # Added Pattern Recognition router
app.include_router(job_router.router, prefix="/api", tags=["Background Jobs"]) # Added Job router for asynchronous processing

# Optional: Add a root endpoint for basic health check or info
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Digame API"}

# If you plan to run this directly with uvicorn:
# import uvicorn
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
