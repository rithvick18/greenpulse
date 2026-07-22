import json
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings
from app.core.logger import logger

redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """
    Returns or initializes the global Redis connection pool.
    """
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_timeout=5.0,
        )
    return redis_client


async def close_redis_client() -> None:
    """
    Closes the global Redis connection pool.
    """
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None


class RedisManager:
    """
    Helper for caching and Pub/Sub functionality.
    """

    @staticmethod
    async def publish(channel: str, message: dict) -> None:
        """
        Publishes a JSON payload to a Redis Pub/Sub channel.
        """
        try:
            client = await get_redis_client()
            await client.publish(channel, json.dumps(message))
        except Exception as e:
            logger.warning("redis_publish_failed", channel=channel, error=str(e))

    @staticmethod
    async def set_cache(key: str, value: Any, expire_seconds: int = 300) -> None:
        """
        Stores key-value pair in Redis cache with TTL.
        """
        try:
            client = await get_redis_client()
            payload = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
            await client.setex(key, expire_seconds, payload)
        except Exception as e:
            logger.warning("redis_cache_set_failed", key=key, error=str(e))

    @staticmethod
    async def get_cache(key: str) -> Optional[Any]:
        """
        Retrieves cached value from Redis.
        """
        try:
            client = await get_redis_client()
            data = await client.get(key)
            if data is not None:
                try:
                    return json.loads(data)
                except json.JSONDecodeError:
                    return data
        except Exception as e:
            logger.warning("redis_cache_get_failed", key=key, error=str(e))
        return None
