import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_processor import TelemetryProcessor


@pytest.mark.asyncio
async def test_full_smart_city_telemetry_flow(async_client: AsyncClient, db_session, admin_user):
    # 1. Authenticate admin user
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create node
    node_resp = await async_client.post(
        "/api/v1/nodes",
        json={
            "id": "e2e-full-01",
            "name": "Full Flow Node",
            "location_lat": 37.77,
            "location_lon": -122.41,
            "status": "online",
            "node_type": "power",
        },
        headers=headers,
    )
    assert node_resp.status_code == 201

    # 3. Create threshold rule
    rule_resp = await async_client.post(
        "/api/v1/alerts/rules",
        json={
            "node_id": "e2e-full-01",
            "metric_name": "voltage",
            "condition": ">",
            "threshold": 240.0,
            "severity": "CRITICAL",
            "active": True,
        },
        headers=headers,
    )
    assert rule_resp.status_code == 201
    rule_id = rule_resp.json()["id"]

    # 4. Ingest sensor reading triggering rule
    telemetry = TelemetryCreate(
        node_id="e2e-full-01",
        metric_name="voltage",
        value=255.0,
    )
    await TelemetryProcessor.process_telemetry(db_session, telemetry)

    # 5. Verify alert generated
    alerts_resp = await async_client.get("/api/v1/alerts?node_id=e2e-full-01", headers=headers)
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert len(alerts) == 1
    assert alerts[0]["value"] == 255.0

    # 6. Resolve alert
    alert_id = alerts[0]["id"]
    resolve_resp = await async_client.patch(f"/api/v1/alerts/{alert_id}/resolve", headers=headers)
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["resolved_at"] is not None
