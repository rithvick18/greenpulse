import json
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy import select

from app.core.config import settings
from app.core.security import decode_token
from app.core.database import AsyncSessionLocal
from app.websocket.manager import manager
from app.websocket.dto import WSControlMessage
from app.models.node import Node
from app.models.alert import Alert
from app.services.simulation import TelemetrySimulator
from app.core.logger import logger
from app.middleware.rate_limit import TokenBucketRateLimiter

router = APIRouter()
ws_rate_limiter = TokenBucketRateLimiter(rate=10, capacity=20)  # max 10 msg/sec


@router.websocket("/ws/telemetry")
@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time telemetry streaming.
    Supports token authentication with fallback for local development/simulation mode.
    """
    user_id = "anonymous"
    if token and token != "dev-token":
        try:
            payload = decode_token(token)
            user_id = payload.get("sub", "user")
        except Exception:
            if not settings.DEBUG and settings.ENVIRONMENT != "development":
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token")
                return
    elif not token and not settings.DEBUG and settings.ENVIRONMENT != "development":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing authentication token")
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
    Fetches initial state summary and simulated telemetry snapshot for connecting clients.
    """
    snapshot_data = TelemetrySimulator().generate_dashboard_snapshot()

    try:
        async with AsyncSessionLocal() as db:
            # Fetch active nodes if available in DB
            node_result = await db.execute(select(Node))
            nodes = node_result.scalars().all()
            if nodes:
                snapshot_data["nodes_summary"] = [
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

            # Fetch active alerts if available in DB
            alert_result = await db.execute(select(Alert).where(Alert.resolved_at.is_(None)))
            alerts = alert_result.scalars().all()
            if alerts:
                snapshot_data["activeAlerts"] = [
                    {
                        "id": f"ALT-{a.id}",
                        "timestamp": a.triggered_at.strftime("%H:%M:%S"),
                        "level": a.severity,
                        "sector": f"NODE-{a.node_id}",
                        "message": a.message,
                        "status": "ACTIVE",
                    }
                    for a in alerts
                ]
    except Exception as db_err:
        logger.debug("snapshot_db_fetch_bypass", error=str(db_err))

    return {
        "event": "snapshot",
        "data": snapshot_data,
    }

