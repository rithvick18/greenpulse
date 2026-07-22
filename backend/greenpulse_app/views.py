import json
import os
import redis
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from greenpulse_app.models import Telemetry, Node, Alert
from greenpulse_app.serializers import TelemetrySerializer, NodeSerializer, AlertSerializer


def get_redis_client():
    """
    Utility to get Redis client connection with fast timeout for fallback handling.
    """
    redis_url = getattr(settings, "REDIS_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
    try:
        r = redis.from_url(redis_url, decode_responses=True, socket_timeout=1.0)
        r.ping()
        return r
    except Exception:
        return None


@api_view(["GET"])
@permission_classes([AllowAny])
def latest_telemetry(request):
    """
    DRF @api_view(['GET']) endpoint configured for 1-second interval polling.
    Pulls the latest telemetry record/snapshot from Redis cache or falls back to the database.
    """
    redis_client = get_redis_client()
    cached_payload = None

    if redis_client:
        try:
            # Check Redis cache keys for latest snapshot or reading
            for key in ["telemetry:latest", "latest_telemetry", "telemetry:broadcast"]:
                raw_val = redis_client.get(key)
                if raw_val:
                    try:
                        cached_payload = json.loads(raw_val)
                        break
                    except json.JSONDecodeError:
                        cached_payload = raw_val
                        break
        except Exception:
            cached_payload = None

    if cached_payload is not None:
        resp_data = {
            "status": "success",
            "source": "redis",
            "data": cached_payload
        }
    else:
        # Fallback to DB query: fetch the most recent telemetry record by time
        try:
            latest_record = Telemetry.objects.order_by("-time").first()
            if latest_record:
                serializer = TelemetrySerializer(latest_record)
                data = serializer.data
            else:
                data = None
            resp_data = {
                "status": "success",
                "source": "database",
                "data": data
            }
        except Exception as db_err:
            resp_data = {
                "status": "fallback",
                "source": "empty",
                "data": None,
                "detail": str(db_err)
            }

    response = Response(resp_data, status=status.HTTP_200_OK)

    # HTTP response headers optimized for continuous 1-second polling
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def list_nodes(request):
    """
    Endpoint to retrieve active smart-city nodes.
    """
    try:
        nodes = Node.objects.all()
        serializer = NodeSerializer(nodes, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_alerts(request):
    """
    Endpoint to retrieve active alerts.
    """
    try:
        alerts = Alert.objects.filter(resolved_at__isnull=True).order_by("-triggered_at")
        serializer = AlertSerializer(alerts, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
