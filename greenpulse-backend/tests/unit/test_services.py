from app.services.alert_engine import AlertEngine
from app.services.analytics import AnalyticsService
from app.models.telemetry import Telemetry
from datetime import datetime, timezone, timedelta


def test_alert_condition_checker():
    assert AlertEngine._check_condition(155.0, ">", 150.0) is True
    assert AlertEngine._check_condition(145.0, ">", 150.0) is False
    assert AlertEngine._check_condition(15.0, "<", 20.0) is True
    assert AlertEngine._check_condition(20.0, "<=", 20.0) is True
    assert AlertEngine._check_condition(100.0, "==", 100.0) is True


def test_analytics_bucket_grouping():
    now = datetime.now(timezone.utc)
    records = [
        Telemetry(time=now - timedelta(minutes=4), node_id="node-01", metric_name="aqi", value=50.0),
        Telemetry(time=now - timedelta(minutes=3), node_id="node-01", metric_name="aqi", value=70.0),
        Telemetry(time=now - timedelta(minutes=1), node_id="node-01", metric_name="aqi", value=90.0),
    ]

    points = AnalyticsService._group_into_buckets(records, resolution="5m")
    assert len(points) >= 1
    point = points[0]
    assert point.avg_value == 70.0
    assert point.min_value == 50.0
    assert point.max_value == 90.0
    assert point.count == 3
