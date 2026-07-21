from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, nodes, metrics, alerts

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(nodes.router, prefix="/nodes", tags=["Telemetry Nodes"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Telemetry Metrics"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alert Rules & Logs"])
