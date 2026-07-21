import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_login_and_refresh(async_client: AsyncClient, admin_user):
    # Test Login
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Test Refresh
    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()


@pytest.mark.asyncio
async def test_node_crud_api(async_client: AsyncClient, admin_headers):
    # 1. Create Node
    node_payload = {
        "id": "node-test-01",
        "name": "Test Node",
        "location_lat": 37.77,
        "location_lon": -122.41,
        "status": "online",
        "node_type": "air_quality",
    }
    create_resp = await async_client.post("/api/v1/nodes", json=node_payload, headers=admin_headers)
    assert create_resp.status_code == 201
    assert create_resp.json()["id"] == "node-test-01"

    # 2. List Nodes
    list_resp = await async_client.get("/api/v1/nodes", headers=admin_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # 3. Get Single Node
    get_resp = await async_client.get("/api/v1/nodes/node-test-01", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Test Node"


@pytest.mark.asyncio
async def test_historical_metrics_endpoint(async_client: AsyncClient, admin_headers):
    resp = await async_client.get(
        "/api/v1/metrics/historical?node_id=node-test-01&metric_name=aqi&resolution=5m",
        headers=admin_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["node_id"] == "node-test-01"
    assert data["metric_name"] == "aqi"
