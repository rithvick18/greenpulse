import pytest
import asyncio
from httpx import AsyncClient
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_processor import TelemetryProcessor


@pytest.mark.asyncio
async def test_high_concurrency_telemetry_ingestion(db_session):
    """
    Simulates high-throughput telemetry ingestion.
    """
    async def ingest_metric(index: int):
        telemetry = TelemetryCreate(
            node_id=f"perf-node-{(index % 5) + 1}",
            metric_name="power_mw",
            value=100.0 + index,
        )
        await TelemetryProcessor.process_telemetry(db_session, telemetry)

    for i in range(20):
        await ingest_metric(i)


@pytest.mark.asyncio
async def test_concurrent_api_requests(async_client: AsyncClient):
    """
    Simulates concurrent health check requests.
    """
    async def fetch_health():
        resp = await async_client.get("/health")
        return resp.status_code

    tasks = [fetch_health() for _ in range(30)]
    responses = await asyncio.gather(*tasks)

    assert all(code in (200, 429) for code in responses)
