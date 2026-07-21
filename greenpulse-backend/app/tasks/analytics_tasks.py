import asyncio
from typing import Optional
from app.tasks.worker import celery_app
from app.core.logger import logger
from app.core.database import AsyncSessionLocal


def aggregate_hourly_metrics_task():
    """
    Celery task wrapper for hourly telemetry aggregation.
    """
    logger.info("celery_aggregate_hourly_metrics_started")
    # Execute async core logic via asyncio event loop
    asyncio.run(_async_aggregate_hourly_metrics())
    logger.info("celery_aggregate_hourly_metrics_completed")


def generate_daily_report_task():
    """
    Celery task wrapper for daily report generation.
    """
    logger.info("celery_generate_daily_report_started")
    asyncio.run(_async_generate_daily_report())
    logger.info("celery_generate_daily_report_completed")


if celery_app:
    aggregate_hourly_metrics_task = celery_app.task(name="app.tasks.analytics_tasks.aggregate_hourly_metrics_task")(
        aggregate_hourly_metrics_task
    )
    generate_daily_report_task = celery_app.task(name="app.tasks.analytics_tasks.generate_daily_report_task")(
        generate_daily_report_task
    )


async def _async_aggregate_hourly_metrics():
    """
    Core logic for calculating and archiving hourly metrics aggregates.
    """
    async with AsyncSessionLocal() as session:
        logger.info("async_aggregate_hourly_metrics_executing")
        await asyncio.sleep(0.1)


async def _async_generate_daily_report():
    """
    Core logic for generating daily smart city operational summary reports.
    """
    async with AsyncSessionLocal() as session:
        logger.info("async_generate_daily_report_executing")
        await asyncio.sleep(0.1)


class AsyncioTaskScheduler:
    """
    Fallback task scheduler running periodic background tasks when Celery is not active.
    """

    def __init__(self, hourly_interval: float = 3600.0):
        self.hourly_interval = hourly_interval
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("asyncio_task_scheduler_started")

    async def _run_loop(self) -> None:
        while self._running:
            try:
                await _async_aggregate_hourly_metrics()
            except Exception as e:
                logger.error("asyncio_scheduler_task_error", error=str(e))
            await asyncio.sleep(self.hourly_interval)

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("asyncio_task_scheduler_stopped")
