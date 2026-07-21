from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.core.config import settings
from app.core.logger import logger
from app.core.exceptions import global_exception_handler, http_exception_handler
from app.core.redis import close_redis_client
from app.core.database import engine
from app.core.mqtt import MQTTListener
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.metrics import PrometheusMetricsMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.api.v1.router import api_router
from app.websocket.telemetry import router as ws_router
from app.websocket.manager import manager as ws_manager
from app.services.simulation import TelemetrySimulator
from app.tasks.analytics_tasks import AsyncioTaskScheduler

# Service singletons for application lifecycle
simulator = TelemetrySimulator()
mqtt_listener = MQTTListener()
asyncio_scheduler = AsyncioTaskScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager handling startup & shutdown procedures.
    """
    logger.info("application_startup_sequence_initiated", app=settings.APP_NAME)

    # 1. Start WebSocket Redis Pub/Sub listener
    await ws_manager.start_pubsub_listener()

    # 2. Start MQTT Listener if broker host configured
    if settings.MQTT_BROKER_HOST:
        await mqtt_listener.start()

    # 3. Start Telemetry Simulation if enabled
    if settings.SIMULATION_ENABLED:
        await simulator.start()

    # 4. Start fallback Asyncio Task Scheduler if Celery is not active
    if not settings.CELERY_BROKER_URL:
        await asyncio_scheduler.start()

    logger.info("application_startup_completed")

    yield

    logger.info("application_shutdown_sequence_initiated")

    # Graceful shutdown sequence
    await simulator.stop()
    await mqtt_listener.stop()
    await asyncio_scheduler.stop()
    await ws_manager.stop()
    await close_redis_client()
    await engine.dispose()

    logger.info("application_shutdown_completed")


def create_application() -> FastAPI:
    """
    FastAPI Application Factory.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description="Production-grade Smart City Telemetry Backend",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom Middlewares
    app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)
    app.add_middleware(PrometheusMetricsMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # Exception Handlers
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)

    # Include REST API & WebSocket Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)
    app.include_router(ws_router)

    # Prometheus Metrics Endpoint
    @app.get("/metrics", tags=["Observability"])
    async def metrics_endpoint():
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

    @app.get("/health", tags=["Observability"])
    async def health_check():
        return {"status": "ok", "app": settings.APP_NAME, "environment": settings.ENVIRONMENT}

    return app


app = create_application()
