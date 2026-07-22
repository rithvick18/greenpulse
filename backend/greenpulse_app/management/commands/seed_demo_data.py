"""Seed the GreenPulse dashboard with a small, realistic demo dataset."""

import json
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils import timezone

from greenpulse_app.models import Alert, AlertRule, Node, Telemetry


DEMO_NODES = [
    {
        "id": "traffic-alpha",
        "name": "Traffic Intersection Alpha",
        "location_lat": 12.9716,
        "location_lon": 77.5946,
        "status": "degraded",
        "node_type": "traffic_control",
        "metadata_json": {"district": "CBD", "lanes": 6},
        "metric": "congestion_index",
        "values": [48.2, 52.8, 57.1, 63.4, 71.6, 78.4],
    },
    {
        "id": "solar-04",
        "name": "Solar Substation 04",
        "location_lat": 12.9352,
        "location_lon": 77.6245,
        "status": "online",
        "node_type": "energy",
        "metadata_json": {"district": "South Grid", "capacity_kw": 850},
        "metric": "power_kw",
        "values": [382.0, 405.5, 428.3, 451.7, 476.2, 492.8],
    },
    {
        "id": "water-grid",
        "name": "Water Pipeline Grid",
        "location_lat": 12.9981,
        "location_lon": 77.5731,
        "status": "warning",
        "node_type": "water",
        "metadata_json": {"district": "North Utility", "pipe_diameter_mm": 900},
        "metric": "pressure",
        "values": [4.8, 4.7, 4.6, 4.4, 4.1, 3.8],
    },
    {
        "id": "assembly-cell-1",
        "name": "Robotic Assembly Cell 1",
        "location_lat": 12.9141,
        "location_lon": 77.6387,
        "status": "online",
        "node_type": "industrial_automation",
        "metadata_json": {"district": "East Industrial", "line": "A1"},
        "metric": "temperature",
        "values": [34.1, 35.0, 36.2, 37.1, 38.0, 38.7],
    },
    {
        "id": "ev-hub-central",
        "name": "Central EV Charging Hub",
        "location_lat": 12.9768,
        "location_lon": 77.6029,
        "status": "online",
        "node_type": "ev_charging",
        "metadata_json": {"district": "Central", "chargers": 24},
        "metric": "voltage",
        "values": [230.8, 231.2, 230.6, 229.9, 230.4, 231.0],
    },
    {
        "id": "river-sensor-07",
        "name": "River Monitoring Station 07",
        "location_lat": 13.0112,
        "location_lon": 77.6118,
        "status": "online",
        "node_type": "environmental",
        "metadata_json": {"district": "Riverside", "sensor_package": "hydro-v2"},
        "metric": "temperature",
        "values": [27.4, 27.7, 28.0, 28.3, 28.1, 27.9],
    },
]


class Command(BaseCommand):
    help = "Clear and seed GreenPulse smart-city dashboard demo data."

    def handle(self, *args, **options):
        self._ensure_telemetry_table()
        node_ids = [node["id"] for node in DEMO_NODES]
        now = timezone.now().replace(microsecond=0)

        with transaction.atomic():
            # Only remove records belonging to this seed set, never unrelated city data.
            Alert.objects.filter(node_id__in=node_ids).delete()
            AlertRule.objects.filter(node_id__in=node_ids).delete()
            Telemetry.objects.filter(node_id__in=node_ids).delete()
            Node.objects.filter(id__in=node_ids).delete()

            nodes = {
                item["id"]: Node.objects.create(
                    **{key: value for key, value in item.items() if key not in {"metric", "values"}}
                )
                for item in DEMO_NODES
            }

            telemetry = []
            for item in DEMO_NODES:
                for index, value in enumerate(item["values"]):
                    telemetry.append(
                        Telemetry(
                            time=now - timedelta(minutes=(len(item["values"]) - 1 - index) * 5),
                            node_id=item["id"],
                            metric_name=item["metric"],
                            value=value,
                        )
                    )
            Telemetry.objects.bulk_create(telemetry)

            self._create_alerts(nodes, now)

        latest = max(telemetry, key=lambda row: row.time)
        payload = {
            "time": latest.time.isoformat(),
            "node_id": latest.node_id,
            "metric_name": latest.metric_name,
            "value": latest.value,
        }
        self._write_latest_to_redis(payload)
        self.stdout.write(
            self.style.SUCCESS(
                "Seeded 6 nodes, 5 alerts, and {} telemetry readings.".format(len(telemetry))
            )
        )

    def _ensure_telemetry_table(self):
        """Create the unmanaged telemetry table for a fresh local SQLite database."""
        if Telemetry._meta.db_table not in connection.introspection.table_names():
            with connection.schema_editor() as schema_editor:
                schema_editor.create_model(Telemetry)
            self.stdout.write("Created missing telemetry table.")

    def _create_alerts(self, nodes, now):
        alert_definitions = [
            ("traffic-alpha", "congestion_index", ">=", 75.0, 78.4, "critical", "Traffic congestion is critical at Intersection Alpha."),
            ("water-grid", "pressure", "<", 4.0, 3.8, "critical", "Pipeline pressure is below the safe operating range."),
            ("assembly-cell-1", "temperature", ">=", 38.0, 38.7, "warning", "Assembly cell temperature is approaching its limit."),
            ("solar-04", "power_kw", "<", 500.0, 492.8, "warning", "Solar output is slightly below the current generation target."),
            ("river-sensor-07", "temperature", ">=", 27.5, 27.9, "info", "River temperature trend is being monitored."),
        ]
        for offset, (node_id, metric, condition, threshold, value, severity, message) in enumerate(alert_definitions):
            rule = AlertRule.objects.create(
                node=nodes[node_id], metric_name=metric, condition=condition,
                threshold=threshold, severity=severity,
            )
            Alert.objects.create(
                rule=rule, node_id=node_id, metric_name=metric, value=value,
                threshold=threshold, severity=severity, message=message,
                triggered_at=now - timedelta(minutes=offset * 3),
            )

    def _write_latest_to_redis(self, payload):
        try:
            import redis

            client = redis.from_url(
                settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1.0, socket_timeout=1.0
            )
            client.set("telemetry:latest", json.dumps(payload))
            self.stdout.write("Wrote latest telemetry to Redis key telemetry:latest.")
        except Exception as exc:
            # The API gracefully falls back to the database when Redis is unavailable.
            self.stderr.write(self.style.WARNING(f"Redis unavailable; database fallback will be used ({exc})."))
