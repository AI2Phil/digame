from fastapi import FastAPI
from digame.app.routers import dashboard_router
from digame.app.routers import onboarding_router # Added import

app = FastAPI(title="Digame API")

app.include_router(dashboard_router.router)
app.include_router(onboarding_router.router) # Added router

@app.get("/health")
async def health_check():
    return {"status": "ok"}
