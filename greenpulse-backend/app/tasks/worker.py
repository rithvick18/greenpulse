from typing import Optional
from celery import Celery
from app.core.config import settings
from app.core.logger import logger

celery_app: Optional[Celery] = None

if settings.CELERY_BROKER_URL:
    celery_app = Celery(
        "greenpulse_tasks",
        broker=settings.CELERY_BROKER_URL,
        backend=settings.CELERY_RESULT_BACKEND or settings.CELERY_BROKER_URL,
    )

    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        beat_schedule={
            "aggregate-hourly-metrics": {
                "task": "app.tasks.analytics_tasks.aggregate_hourly_metrics_task",
                "schedule": 3600.0,  # Every hour
            },
            "generate-daily-report": {
                "task": "app.tasks.analytics_tasks.generate_daily_report_task",
                "schedule": 86400.0,  # Every 24 hours
            },
        },
    )
    logger.info("celery_app_initialized", broker=settings.CELERY_BROKER_URL)
else:
    logger.info("celery_broker_not_configured_using_asyncio_fallback")
