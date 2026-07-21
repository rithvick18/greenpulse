import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.alert_engine import AlertEngine
from app.services.analytics import AnalyticsService
from app.services.telemetry_processor import TelemetryProcessor
from app.schemas.telemetry import TelemetryCreate
from app.models.telemetry import Telemetry
from app.models.node import Node
from app.models.alert import AlertRule, Alert


def test_alert_condition_checker():
    assert AlertEngine._check_condition(155.0, ">", 150.0) is True
    assert AlertEngine._check_condition(145.0, ">", 150.0) is False
    assert AlertEngine._check_condition(15.0, "<", 20.0) is True
    assert AlertEngine._check_condition(20.0, "<=", 20.0) is True
    assert AlertEngine._check_condition(100.0, "==", 100.0) is True
    assert AlertEngine._check_condition(50.0, "invalid", 50.0) is False


def test_analytics_bucket_grouping():
    # Base timestamp at exact hour boundary (e.g. 10:00:00)
    base_time = datetime(2026, 7, 21, 10, 0, 0, tzinfo=timezone.utc)
    records = [
        Telemetry(time=base_time + timedelta(minutes=1), node_id="node-01", metric_name="aqi", value=50.0),
        Telemetry(time=base_time + timedelta(minutes=2), node_id="node-01", metric_name="aqi", value=70.0),
        Telemetry(time=base_time + timedelta(minutes=3), node_id="node-01", metric_name="aqi", value=90.0),
    ]

    points = AnalyticsService._group_into_buckets(records, resolution="5m")
    assert len(points) == 1
    point = points[0]
    assert point.avg_value == 70.0
    assert point.min_value == 50.0
    assert point.max_value == 90.0
    assert point.count == 3


@pytest.mark.asyncio
async def test_alert_engine_evaluate_telemetry(db_session: AsyncSession, test_node: Node):
    rule = AlertRule(
        metric_name="aqi",
        condition=">",
        threshold=100.0,
        severity="CRITICAL",
        active=True,
        node_id=test_node.id,
    )
    db_session.add(rule)
    await db_session.commit()

    telemetry = TelemetryCreate(
        node_id=test_node.id,
        metric_name="aqi",
        value=125.0,
        time=datetime.now(timezone.utc),
    )

    alerts = await AlertEngine.evaluate_telemetry(db_session, telemetry)
    assert len(alerts) == 1
    assert alerts[0].severity == "CRITICAL"
    assert alerts[0].value == 125.0


@pytest.mark.asyncio
async def test_telemetry_processor_ingest(db_session: AsyncSession):
    telemetry_data = TelemetryCreate(
        node_id="NODE-TEST-02",
        metric_name="power_mw",
        value=450.5,
        time=datetime.now(timezone.utc),
    )

    await TelemetryProcessor.process_telemetry(db_session, telemetry_data)

    from sqlalchemy import select
    result = await db_session.execute(
        select(Telemetry).where(Telemetry.node_id == "NODE-TEST-02")
    )
    records = result.scalars().all()
    assert len(records) == 1
    assert records[0].value == 450.5
