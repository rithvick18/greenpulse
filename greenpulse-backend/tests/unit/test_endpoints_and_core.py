import pytest
from unittest.mock import AsyncMock
from app.core.redis import RedisManager
from app.core.exceptions import (
    BaseCustomException,
    NotFoundException,
    CredentialsException,
    PermissionDeniedException,
    RateLimitException,
)


@pytest.mark.asyncio
async def test_custom_exceptions():
    exc1 = NotFoundException(detail="Resource missing")
    assert exc1.status_code == 404
    assert exc1.detail == "Resource missing"

    exc2 = CredentialsException(detail="Bad credentials")
    assert exc2.status_code == 401

    exc3 = PermissionDeniedException()
    assert exc3.status_code == 403

    exc4 = RateLimitException()
    assert exc4.status_code == 429


@pytest.mark.asyncio
async def test_redis_manager_cache(monkeypatch):
    fake_redis = AsyncMock()
    fake_redis.get.return_value = '{"foo": "bar"}'

    async def _mock_get_redis():
        return fake_redis

    monkeypatch.setattr("app.core.redis.get_redis_client", _mock_get_redis)

    await RedisManager.set_cache("key1", {"foo": "bar"}, expire_seconds=60)
    fake_redis.setex.assert_called_once()

    val = await RedisManager.get_cache("key1")
    assert val == {"foo": "bar"}
