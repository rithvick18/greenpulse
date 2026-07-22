from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import datetime

from greenpulse_app.models import Telemetry, Node, AlertRule, Alert
from greenpulse_app.serializers import (
    TelemetrySerializer,
    NodeSerializer,
    AlertRuleSerializer,
    AlertSerializer,
)


class DjangoModelAndSerializerTests(TestCase):
    """
    Tests for GreenPulse Django models and DRF serializers.
    """

    def test_node_model_and_serializer(self):
        node = Node(
            id="node-test-01",
            name="Central Park AQI Node",
            location_lat=40.785091,
            location_lon=-73.968285,
            status="online",
            node_type="air_quality",
            metadata_json={"zone": "North"},
        )
        serializer = NodeSerializer(node)
        data = serializer.data
        self.assertEqual(data["id"], "node-test-01")
        self.assertEqual(data["name"], "Central Park AQI Node")
        self.assertEqual(data["location_lat"], 40.785091)
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["metadata_json"], {"zone": "North"})

    def test_telemetry_serializer(self):
        now = timezone.now()
        telemetry = Telemetry(
            time=now,
            node_id="node-test-01",
            metric_name="co2",
            value=412.5,
        )
        serializer = TelemetrySerializer(telemetry)
        data = serializer.data
        self.assertEqual(data["node_id"], "node-test-01")
        self.assertEqual(data["metric_name"], "co2")
        self.assertEqual(data["value"], 412.5)

    def test_alert_rule_and_alert_serializer(self):
        rule = AlertRule(
            id=1,
            metric_name="aqi",
            condition=">",
            threshold=150.0,
            severity="critical",
            active=True,
        )
        rule_data = AlertRuleSerializer(rule).data
        self.assertEqual(rule_data["id"], 1)
        self.assertEqual(rule_data["metric_name"], "aqi")
        self.assertEqual(rule_data["severity"], "critical")

        alert = Alert(
            id=10,
            rule=rule,
            node_id="node-test-01",
            metric_name="aqi",
            value=165.0,
            threshold=150.0,
            severity="critical",
            message="AQI exceeded threshold",
        )
        alert_data = AlertSerializer(alert).data
        self.assertEqual(alert_data["id"], 10)
        self.assertEqual(alert_data["message"], "AQI exceeded threshold")


class LatestTelemetryEndpointTests(TestCase):
    """
    Tests for DRF 1-second interval polling @api_view endpoint and CORS headers.
    """

    def setUp(self):
        self.client = APIClient()

    def test_latest_telemetry_polling_response(self):
        response = self.client.get("/api/telemetry/latest/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("status", response.data)
        self.assertIn("source", response.data)
        self.assertIn("data", response.data)

        # Check Cache-Control headers for 1-second interval polling
        self.assertIn("no-cache", response.headers.get("Cache-Control", ""))

    def test_cors_headers_allow_all_origins(self):
        response = self.client.get("/api/telemetry/latest/", HTTP_ORIGIN="http://localhost:5173")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")
