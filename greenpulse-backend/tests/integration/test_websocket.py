import pytest
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_websocket_authentication_failure():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # Missing token test
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/telemetry"):
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
        assert "nodes_summary" in data["data"]

        # Send ping control message
        websocket.send_json({"action": "ping"})
        response = websocket.receive_json()
        assert response["event"] == "pong"
