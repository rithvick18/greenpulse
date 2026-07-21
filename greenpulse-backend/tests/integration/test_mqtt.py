import pytest
from unittest.mock import AsyncMock
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.mqtt import MQTTListener
from app.services.telemetry_processor import TelemetryProcessor
from app.schemas.telemetry import TelemetryCreate


@pytest.mark.asyncio
async def test_mqtt_callback_processing(db_session: AsyncSession):
    received_messages = []

    async def mock_callback(topic: str, payload: dict):
        received_messages.append((topic, payload))
        telemetry = TelemetryCreate(
            node_id=payload["node_id"],
            metric_name=payload["metric_name"],
            value=payload["value"],
        )
        await TelemetryProcessor.process_telemetry(db_session, telemetry)

    listener = MQTTListener(callback=mock_callback)
    topic = "sensors/node-mqtt-01/telemetry"
    payload = {"node_id": "node-mqtt-01", "metric_name": "voltage_kv", "value": 230.5}

    await listener.callback(topic, payload)

    assert len(received_messages) == 1
    assert received_messages[0][0] == topic
    assert received_messages[0][1]["value"] == 230.5

    from sqlalchemy import select
    from app.models.telemetry import Telemetry
    result = await db_session.execute(select(Telemetry).where(Telemetry.node_id == "node-mqtt-01"))
    records = result.scalars().all()
    assert len(records) == 1
    assert records[0].value == 230.5
