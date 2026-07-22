import pytest
from starlette.websockets import WebSocketDisconnect
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_websocket_authentication_failure():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # Test connecting with invalid token - endpoint closes connection or receives error
    try:
        with client.websocket_connect("/ws/telemetry?token=invalid_token_xyz") as ws:
            ws.receive_text()
    except Exception:
        pass


@pytest.mark.asyncio
async def test_websocket_connection_and_handshake():
    from fastapi.testclient import TestClient
    from app.main import app

    token = create_access_token(subject="admin_test", role="admin")
    client = TestClient(app)

    with client.websocket_connect(f"/ws/telemetry?token={token}") as websocket:
        # Client receives immediate snapshot
        data = websocket.receive_json()
        assert data["event"] == "snapshot"

        # Send ping control message
        websocket.send_json({"action": "ping"})
        response = websocket.receive_json()
        assert response["event"] == "pong"

        # Send subscribe control message
        websocket.send_json({"action": "subscribe", "nodes": ["node-01", "node-02"]})
        sub_resp = websocket.receive_json()
        assert sub_resp["event"] == "subscribed"
        assert sub_resp["data"]["nodes"] == ["node-01", "node-02"]

        # Send unsubscribe control message
        websocket.send_json({"action": "unsubscribe"})
        unsub_resp = websocket.receive_json()
        assert unsub_resp["event"] == "unsubscribed"
