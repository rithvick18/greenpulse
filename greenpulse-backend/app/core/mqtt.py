import asyncio
import json
from typing import Callable, Optional
import aiomqtt
from app.core.config import settings
from app.core.logger import logger


class MQTTListener:
    """
    MQTT Subscription Listener that forwards sensor telemetry to database & Redis.
    """

    def __init__(self, callback: Optional[Callable] = None):
        self.callback = callback
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """
        Starts the MQTT listener task.
        """
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._listen_loop())
        logger.info("mqtt_listener_started", host=settings.MQTT_BROKER_HOST, topic=settings.MQTT_TOPIC_SUB)

    async def _listen_loop(self) -> None:
        """
        Background loop connecting to MQTT broker and handling incoming messages.
        """
        while self._running:
            try:
                if not settings.MQTT_BROKER_HOST:
                    logger.info("mqtt_broker_host_not_configured_skipping")
                    break

                async with aiomqtt.Client(
                    hostname=settings.MQTT_BROKER_HOST,
                    port=settings.MQTT_BROKER_PORT,
                    timeout=5,
                ) as client:
                    logger.info("mqtt_client_connected", host=settings.MQTT_BROKER_HOST)
                    await client.subscribe(settings.MQTT_TOPIC_SUB)

                    async for message in client.messages:
                        if not self._running:
                            break
                        try:
                            payload = json.loads(message.payload.decode("utf-8"))
                            topic = str(message.topic)
                            if self.callback:
                                await self.callback(topic, payload)
                        except json.JSONDecodeError:
                            logger.error("mqtt_payload_json_decode_error", topic=str(message.topic))
                        except Exception as e:
                            logger.error("mqtt_message_handler_error", error=str(e))

            except Exception as e:
                logger.warning(
                    "mqtt_connection_failed_retrying",
                    error=str(e),
                    retry_in=10,
                )
                await asyncio.sleep(10)

    async def stop(self) -> None:
        """
        Stops the MQTT listener gracefully.
        """
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("mqtt_listener_stopped")
