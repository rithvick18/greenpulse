import pytest
import json
from unittest.mock import AsyncMock
from app.websocket.manager import ConnectionManager


@pytest.mark.asyncio
async def test_connection_manager_lifecycle():
    manager = ConnectionManager()
    ws_mock = AsyncMock()

    await manager.connect(ws_mock)
    assert len(manager.active_connections) == 1

    await manager.send_personal_message({"event": "test"}, ws_mock)
    ws_mock.send_text.assert_called_once_with(json.dumps({"event": "test"}))

    manager.update_subscriptions(ws_mock, ["node-01"])
    assert manager.active_connections[ws_mock] == {"node-01"}

    await manager.broadcast_to_local({"event": "telemetry_update", "data": {"node_id": "node-01"}})
    assert ws_mock.send_text.call_count == 2

    manager.disconnect(ws_mock)
    assert len(manager.active_connections) == 0
