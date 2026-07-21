import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.node import Node
from app.models.alert import AlertRule, Alert


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# --- 1. Authentication Tests ---

@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, admin_user):
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens


@pytest.mark.asyncio
async def test_login_form(async_client: AsyncClient, admin_user):
    login_resp = await async_client.post(
        "/api/v1/auth/login/form",
        data={"username": "admin_test", "password": "admin123"},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient, admin_user):
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "wrongpassword"},
    )
    assert login_resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient, admin_user):
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    tokens = login_resp.json()

    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()


@pytest.mark.asyncio
async def test_logout(async_client: AsyncClient):
    resp = await async_client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Successfully logged out"


# --- 2. Users CRUD & Authorization Tests ---

@pytest.mark.asyncio
async def test_user_management_api(async_client: AsyncClient, admin_headers, operator_headers, analyst_headers):
    # Admin can list users
    admin_resp = await async_client.get("/api/v1/users", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert isinstance(admin_resp.json(), list)

    # Operator/Analyst cannot list users
    assert (await async_client.get("/api/v1/users", headers=operator_headers)).status_code == 403
    assert (await async_client.get("/api/v1/users", headers=analyst_headers)).status_code == 403

    # Admin creates user
    new_user_payload = {
        "username": "new_operator",
        "email": "new_op@test.com",
        "password": "password123",
        "role": "operator",
    }
    create_resp = await async_client.post("/api/v1/users", json=new_user_payload, headers=admin_headers)
    assert create_resp.status_code == 201
    user_id = create_resp.json()["id"]

    # Admin get single user
    get_resp = await async_client.get(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["username"] == "new_operator"

    # Admin update user
    update_resp = await async_client.put(
        f"/api/v1/users/{user_id}",
        json={"email": "updated_op@test.com"},
        headers=admin_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["email"] == "updated_op@test.com"

    # Admin delete user
    del_resp = await async_client.delete(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_user_not_found_handling(async_client: AsyncClient, admin_headers):
    assert (await async_client.get("/api/v1/users/99999", headers=admin_headers)).status_code == 404
    assert (await async_client.put("/api/v1/users/99999", json={"email": "a@b.com"}, headers=admin_headers)).status_code == 404
    assert (await async_client.delete("/api/v1/users/99999", headers=admin_headers)).status_code == 404


# --- 3. Nodes API Tests ---

@pytest.mark.asyncio
async def test_node_crud_api(async_client: AsyncClient, admin_headers, operator_headers):
    # Admin creates node
    node_payload = {
        "id": "node-grid-100",
        "name": "Central Substation Node",
        "location_lat": 37.78,
        "location_lon": -122.42,
        "status": "online",
        "node_type": "substation",
    }
    create_resp = await async_client.post("/api/v1/nodes", json=node_payload, headers=admin_headers)
    assert create_resp.status_code == 201
    assert create_resp.json()["id"] == "node-grid-100"

    # GET list
    list_resp = await async_client.get("/api/v1/nodes", headers=operator_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # GET single
    get_resp = await async_client.get("/api/v1/nodes/node-grid-100", headers=operator_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Central Substation Node"

    # PUT update node
    put_resp = await async_client.put(
        "/api/v1/nodes/node-grid-100",
        json={"name": "Updated Substation Node"},
        headers=admin_headers,
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["name"] == "Updated Substation Node"

    # PATCH status
    patch_resp = await async_client.patch(
        "/api/v1/nodes/node-grid-100",
        json={"status": "degraded"},
        headers=admin_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "degraded"

    # Delete node
    del_resp = await async_client.delete("/api/v1/nodes/node-grid-100", headers=admin_headers)
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_node_not_found_handling(async_client: AsyncClient, admin_headers):
    assert (await async_client.get("/api/v1/nodes/nonexistent-node-id", headers=admin_headers)).status_code == 404
    assert (await async_client.put("/api/v1/nodes/nonexistent-node-id", json={"status": "offline"}, headers=admin_headers)).status_code == 404
    assert (await async_client.delete("/api/v1/nodes/nonexistent-node-id", headers=admin_headers)).status_code == 404


# --- 4. Metrics API Tests ---

@pytest.mark.asyncio
async def test_historical_metrics_date_range(async_client: AsyncClient, admin_headers):
    from_iso = "2026-07-21T00:00:00Z"
    to_iso = "2026-07-21T12:00:00Z"
    resp = await async_client.get(
        f"/api/v1/metrics/historical?node_id=node-test-01&metric_name=voltage&from={from_iso}&to={to_iso}&resolution=1m",
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["resolution"] == "1m"


# --- 5. Alert Rules & Alerts Tests ---

@pytest.mark.asyncio
async def test_alert_rules_crud_and_resolve(async_client: AsyncClient, admin_headers, test_node: Node, db_session: AsyncSession):
    # Create rule
    rule_payload = {
        "node_id": test_node.id,
        "metric_name": "temperature",
        "condition": ">",
        "threshold": 80.0,
        "severity": "CRITICAL",
        "active": True,
    }
    create_resp = await async_client.post("/api/v1/alerts/rules", json=rule_payload, headers=admin_headers)
    assert create_resp.status_code == 201
    rule_id = create_resp.json()["id"]

    # List rules with node filter
    list_resp = await async_client.get(f"/api/v1/alerts/rules?node_id={test_node.id}", headers=admin_headers)
    assert list_resp.status_code == 200
    assert any(r["id"] == rule_id for r in list_resp.json())

    # Get rule by ID
    get_resp = await async_client.get(f"/api/v1/alerts/rules/{rule_id}", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["threshold"] == 80.0

    # Update rule
    put_resp = await async_client.put(
        f"/api/v1/alerts/rules/{rule_id}",
        json={"threshold": 85.0},
        headers=admin_headers,
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["threshold"] == 85.0

    # Create an alert record directly and test list triggered alerts & resolve API
    alert = Alert(
        rule_id=rule_id,
        node_id=test_node.id,
        metric_name="temperature",
        value=88.5,
        threshold=85.0,
        severity="CRITICAL",
        message="High temperature detected",
    )
    db_session.add(alert)
    await db_session.commit()
    await db_session.refresh(alert)

    # List alerts log with unresolved_only filter
    alerts_resp = await async_client.get(
        f"/api/v1/alerts?node_id={test_node.id}&unresolved_only=true&severity=CRITICAL",
        headers=admin_headers,
    )
    assert alerts_resp.status_code == 200
    assert len(alerts_resp.json()) == 1

    # Resolve alert
    resolve_resp = await async_client.patch(f"/api/v1/alerts/{alert.id}/resolve", headers=admin_headers)
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["resolved_at"] is not None

    # Delete rule
    del_resp = await async_client.delete(f"/api/v1/alerts/rules/{rule_id}", headers=admin_headers)
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_alert_rule_not_found(async_client: AsyncClient, admin_headers):
    assert (await async_client.get("/api/v1/alerts/rules/99999", headers=admin_headers)).status_code == 404
    assert (await async_client.put("/api/v1/alerts/rules/99999", json={"threshold": 10.0}, headers=admin_headers)).status_code == 404
    assert (await async_client.delete("/api/v1/alerts/rules/99999", headers=admin_headers)).status_code == 404
    assert (await async_client.patch("/api/v1/alerts/99999/resolve", headers=admin_headers)).status_code == 404
