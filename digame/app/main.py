from fastapi import FastAPI
from digame.app.routers import dashboard_router

app = FastAPI(title="Digame API")

app.include_router(dashboard_router.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
