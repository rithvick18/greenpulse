import pytest
from datetime import datetime, timezone
from app.utils.time import now_utc, parse_iso_datetime, format_iso
from app.utils.helpers import sanitize_string
from app.tasks.analytics_tasks import AsyncioTaskScheduler, _async_aggregate_hourly_metrics, _async_generate_daily_report


def test_time_utils():
    now = now_utc()
    formatted = format_iso(now)
    parsed = parse_iso_datetime(formatted)
    assert parsed is not None
    assert parsed.year == now.year

    assert parse_iso_datetime(None) is None
    assert parse_iso_datetime("invalid-date-string") is None


def test_helper_utils():
    assert sanitize_string("  hello world  ") == "hello world"
    assert sanitize_string(None) == ""


@pytest.mark.asyncio
async def test_asyncio_task_scheduler(db_session):
    scheduler = AsyncioTaskScheduler(hourly_interval=0.1)
    await scheduler.start()
    assert scheduler._running is True
    await scheduler.stop()
    assert scheduler._running is False


@pytest.mark.asyncio
async def test_async_tasks(db_session):
    await _async_aggregate_hourly_metrics()
    await _async_generate_daily_report()
