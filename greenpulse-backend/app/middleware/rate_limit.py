import time
from typing import Dict, Tuple
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class TokenBucketRateLimiter:
    """
    In-memory Token Bucket rate limiter for WebSocket messages & connection attempts.
    """

    def __init__(self, rate: float, capacity: float):
        self.rate = rate  # tokens added per second
        self.capacity = capacity  # max tokens in bucket
        self.tokens: Dict[str, float] = {}
        self.last_update: Dict[str, float] = {}

    def consume(self, key: str, tokens_needed: float = 1.0) -> bool:
        now = time.time()
        if key not in self.tokens:
            self.tokens[key] = self.capacity
            self.last_update[key] = now

        # Replenish tokens based on elapsed time
        elapsed = now - self.last_update[key]
        self.tokens[key] = min(self.capacity, self.tokens[key] + elapsed * self.rate)
        self.last_update[key] = now

        if self.tokens[key] >= tokens_needed:
            self.tokens[key] -= tokens_needed
            return True
        return False


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding window rate limit middleware for REST API endpoints.
    """

    def __init__(self, app, requests_per_minute: int = settings.RATE_LIMIT_PER_MINUTE):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/metrics", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # Filter out timestamps older than 60 seconds
        self.requests[client_ip] = [ts for ts in self.requests[client_ip] if ts > window_start]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Rate limit exceeded."},
            )

        self.requests[client_ip].append(now)
        return await call_next(request)
