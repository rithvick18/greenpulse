import json
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy import select

from app.core.security import decode_token
from app.core.database import AsyncSessionLocal
from app.websocket.manager import manager
from app.websocket.dto import WSControlMessage
from app.models.node import Node
from app.models.alert import Alert
from app.core.logger import logger
from app.middleware.rate_limit import TokenBucketRateLimiter

router = APIRouter()
ws_rate_limiter = TokenBucketRateLimiter(rate=10, capacity=20)  # max 10 msg/sec


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time telemetry streaming.
    Requires token parameter for authentication before upgrading.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing authentication token")
        return

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        role = payload.get("role")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token")
        return

    client_ip = websocket.client.host if websocket.client else "unknown"
    await manager.connect(websocket)

    try:
        # Send immediate dashboard snapshot upon connection
        snapshot = await _fetch_dashboard_snapshot()
        await manager.send_personal_message(snapshot, websocket)

        # Receive incoming client messages (control & ping)
        while True:
            data = await websocket.receive_text()

            # Check rate limiting per client
            if not ws_rate_limiter.consume(client_ip):
                await manager.send_personal_message(
                    {"event": "error", "data": {"message": "Rate limit exceeded for control messages"}},
                    websocket,
                )
                continue

            try:
                msg_dict = json.loads(data)
                control = WSControlMessage(**msg_dict)

                if control.action == "ping":
                    await manager.send_personal_message({"event": "pong", "data": {}}, websocket)

                elif control.action == "subscribe" and control.nodes is not None:
                    manager.update_subscriptions(websocket, control.nodes)
                    await manager.send_personal_message(
                        {"event": "subscribed", "data": {"nodes": control.nodes}},
                        websocket,
                    )

                elif control.action == "unsubscribe":
                    manager.update_subscriptions(websocket, [])
                    await manager.send_personal_message(
                        {"event": "unsubscribed", "data": {}},
                        websocket,
                    )

            except Exception as e:
                logger.warning("websocket_invalid_client_message", error=str(e))
                await manager.send_personal_message(
                    {"event": "error", "data": {"message": "Invalid control message format"}},
                    websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("websocket_disconnected_normal", user_id=user_id)
    except Exception as e:
        manager.disconnect(websocket)
        logger.error("websocket_connection_error", user_id=user_id, error=str(e))


async def _fetch_dashboard_snapshot() -> dict:
    """
    Fetches initial state summary for connecting clients.
    """
    async with AsyncSessionLocal() as db:
        # Fetch active nodes
        node_result = await db.execute(select(Node))
        nodes = node_result.scalars().all()

        nodes_summary = [
            {
                "id": n.id,
                "name": n.name,
                "status": n.status,
                "type": n.node_type,
                "lat": n.location_lat,
                "lon": n.location_lon,
            }
            for n in nodes
        ]

        # Fetch active alerts
        alert_result = await db.execute(select(Alert).where(Alert.resolved_at.is_(None)))
        alerts = alert_result.scalars().all()

        active_alerts = [
            {
                "id": a.id,
                "node_id": a.node_id,
                "metric_name": a.metric_name,
                "severity": a.severity,
                "message": a.message,
                "triggered_at": a.triggered_at.isoformat(),
            }
            for a in alerts
        ]

        return {
            "event": "snapshot",
            "data": {
                "nodes_summary": nodes_summary,
                "active_alerts": active_alerts,
            },
        }
