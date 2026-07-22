import asyncio
import json
from typing import Dict, List, Set, Optional
from fastapi import WebSocket
from app.core.redis import get_redis_client
from app.core.logger import logger


class ConnectionManager:
    """
    Manages active WebSocket connections across server instances using Redis Pub/Sub.
    """

    def __init__(self):
        # Map websocket connection to subscribed node_ids set
        self.active_connections: Dict[WebSocket, Set[str]] = {}
        self._pubsub_task: Optional[asyncio.Task] = None
        self._running = False

    async def start_pubsub_listener(self) -> None:
        """
        Starts listening to Redis Pub/Sub channel for cluster-wide broadcasts.
        """
        if self._running:
            return

        self._running = True
        self._pubsub_task = asyncio.create_task(self._redis_pubsub_loop())
        logger.info("websocket_redis_pubsub_listener_started")

    async def connect(self, websocket: WebSocket) -> None:
        """
        Accepts and registers a new WebSocket connection.
        """
        await websocket.accept()
        self.active_connections[websocket] = set()  # empty set means all nodes
        logger.info("websocket_client_connected", active_total=len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """
        Removes connection upon client disconnect.
        """
        if websocket in self.active_connections:
            del self.active_connections[websocket]
            logger.info("websocket_client_disconnected", active_total=len(self.active_connections))

    def update_subscriptions(self, websocket: WebSocket, nodes: List[str]) -> None:
        """
        Updates node filter subscriptions for a specific connection.
        """
        if websocket in self.active_connections:
            self.active_connections[websocket] = set(nodes)

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        """
        Sends direct message to a single client.
        """
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning("websocket_send_personal_error", error=str(e))

    async def broadcast_to_local(self, message: dict) -> None:
        """
        Broadcasts message to local clients based on node filter.
        """
        if not self.active_connections:
            return

        data = message.get("data", {})
        node_id = data.get("node_id")

        disconnected: List[WebSocket] = []
        for connection, node_filter in list(self.active_connections.items()):
            try:
                # If node_filter is empty or contains the target node_id, send update
                if not node_filter or (node_id and node_id in node_filter):
                    await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning("websocket_broadcast_client_error", error=str(e))
                disconnected.append(connection)

        for ws in disconnected:
            self.disconnect(ws)

    async def _redis_pubsub_loop(self) -> None:
        """
        Redis Pub/Sub subscription loop.
        """
        while self._running:
            try:
                redis = await get_redis_client()
                pubsub = redis.pubsub()
                await pubsub.subscribe("telemetry:broadcast")

                async for message in pubsub.listen():
                    if not self._running:
                        break
                    if message["type"] == "message":
                        try:
                            payload = json.loads(message["data"])
                            await self.broadcast_to_local(payload)
                        except Exception as e:
                            logger.error("websocket_pubsub_payload_error", error=str(e))

            except Exception as e:
                logger.warning("websocket_redis_pubsub_reconnecting", error=str(e), retry_in=5)
                await asyncio.sleep(5)

    async def stop(self) -> None:
        """
        Stops Redis Pub/Sub listener.
        """
        self._running = False
        if self._pubsub_task:
            self._pubsub_task.cancel()
            try:
                await self._pubsub_task
            except asyncio.CancelledError:
                pass


manager = ConnectionManager()
