from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryCreate
from app.services.alert_engine import AlertEngine
from app.core.redis import RedisManager
from app.core.logger import logger


class TelemetryProcessor:
    """
    Processes incoming telemetry readings: stores in database, evaluates alerts,
    and publishes live updates to Redis Pub/Sub channel.
    """

    @staticmethod
    async def process_telemetry(db: AsyncSession, telemetry_data: TelemetryCreate) -> None:
        """
        Ingests a telemetry record.
        """
        timestamp = telemetry_data.time or datetime.now(timezone.utc)
        telemetry_record = Telemetry(
            time=timestamp,
            node_id=telemetry_data.node_id,
            metric_name=telemetry_data.metric_name,
            value=telemetry_data.value,
        )

        try:
            db.add(telemetry_record)
            await db.commit()

            # Evaluate alert conditions
            await AlertEngine.evaluate_telemetry(db, telemetry_data)

            # Broadcast update via Redis Pub/Sub
            payload = {
                "event": "telemetry_update",
                "data": {
                    "time": timestamp.isoformat(),
                    "node_id": telemetry_data.node_id,
                    "metric_name": telemetry_data.metric_name,
                    "value": telemetry_data.value,
                },
            }
            await RedisManager.publish(channel="telemetry:broadcast", message=payload)

        except Exception as e:
            logger.error("telemetry_processor_error", error=str(e), node_id=telemetry_data.node_id)
            await db.rollback()
