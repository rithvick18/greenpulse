import pytest
from httpx import AsyncClient
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_processor import TelemetryProcessor


@pytest.mark.asyncio
async def test_full_smart_city_telemetry_flow(async_client: AsyncClient, db_session, admin_user):
    # 1. Login to retrieve access token
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register telemetry node
    node_resp = await async_client.post(
        "/api/v1/nodes",
        json={
            "id": "e2e-node-01",
            "name": "E2E Air Quality Station",
            "location_lat": 37.77,
            "location_lon": -122.41,
            "status": "online",
            "node_type": "air_quality",
        },
        headers=headers,
    )
    assert node_resp.status_code == 201

    # 3. Create Critical Alert Rule for AQI > 100
    rule_resp = await async_client.post(
        "/api/v1/alerts/rules",
        json={
            "node_id": "e2e-node-01",
            "metric_name": "aqi",
            "condition": ">",
            "threshold": 100.0,
            "severity": "critical",
            "active": True,
        },
        headers=headers,
    )
    assert rule_resp.status_code == 201
    rule_id = rule_resp.json()["id"]

    # 4. Ingest Telemetry point violating rule (AQI = 145.0)
    telemetry_payload = TelemetryCreate(
        node_id="e2e-node-01",
        metric_name="aqi",
        value=145.0,
    )
    await TelemetryProcessor.process_telemetry(db_session, telemetry_payload)

    # 5. Query triggered alerts log endpoint
    alerts_resp = await async_client.get("/api/v1/alerts?node_id=e2e-node-01", headers=headers)
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert len(alerts) == 1
    assert alerts[0]["rule_id"] == rule_id
    assert alerts[0]["value"] == 145.0
    assert alerts[0]["severity"] == "critical"

    # 6. Verify historical metrics point was stored
    metrics_resp = await async_client.get(
        "/api/v1/metrics/historical?node_id=e2e-node-01&metric_name=aqi&resolution=raw",
        headers=headers,
    )
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["avg_value"] == 145.0
