from datetime import datetime
from typing import List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.telemetry import Telemetry
from app.schemas.telemetry import MetricAggPoint, HistoricalMetricsResponse
from app.core.logger import logger


class AnalyticsService:
    """
    Historical time-series telemetry metrics analytics and aggregation service.
    """

    @staticmethod
    async def get_historical_metrics(
        db: AsyncSession,
        node_id: str,
        metric_name: str,
        from_time: datetime,
        to_time: datetime,
        resolution: str = "5m",
    ) -> HistoricalMetricsResponse:
        """
        Retrieves historical telemetry points for a given node and metric within a time range,
        grouped into requested resolution buckets.
        """
        try:
            # Query matching records
            query = (
                select(Telemetry)
                .where(
                    and_(
                        Telemetry.node_id == node_id,
                        Telemetry.metric_name == metric_name,
                        Telemetry.time >= from_time,
                        Telemetry.time <= to_time,
                    )
                )
                .order_by(Telemetry.time.asc())
            )
            result = await db.execute(query)
            records = result.scalars().all()

            if resolution == "raw" or not records:
                agg_points = [
                    MetricAggPoint(
                        timestamp=r.time,
                        avg_value=r.value,
                        min_value=r.value,
                        max_value=r.value,
                        count=1,
                    )
                    for r in records
                ]
            else:
                agg_points = AnalyticsService._group_into_buckets(records, resolution)

            return HistoricalMetricsResponse(
                node_id=node_id,
                metric_name=metric_name,
                resolution=resolution,
                data=agg_points,
            )

        except Exception as e:
            logger.error("analytics_service_error", error=str(e), node_id=node_id, metric=metric_name)
            raise

    @staticmethod
    def _group_into_buckets(records: List[Telemetry], resolution: str) -> List[MetricAggPoint]:
        """
        Helper method to bucket records by interval (1m, 5m, 1h, 1d).
        """
        seconds_map = {
            "1m": 60,
            "5m": 300,
            "1h": 3600,
            "1d": 86400,
        }
        interval_sec = seconds_map.get(resolution, 300)

        buckets = {}
        for r in records:
            ts = int(r.time.timestamp())
            bucket_ts = ts - (ts % interval_sec)
            if bucket_ts not in buckets:
                buckets[bucket_ts] = []
            buckets[bucket_ts].append(r.value)

        points = []
        for bucket_ts in sorted(buckets.keys()):
            vals = buckets[bucket_ts]
            bucket_dt = datetime.fromtimestamp(bucket_ts, tz=r.time.tzinfo)
            points.append(
                MetricAggPoint(
                    timestamp=bucket_dt,
                    avg_value=round(sum(vals) / len(vals), 2),
                    min_value=round(min(vals), 2),
                    max_value=round(max(vals), 2),
                    count=len(vals),
                )
            )

        return points
