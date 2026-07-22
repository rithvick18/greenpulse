from rest_framework import serializers
from greenpulse_app.models import Telemetry, Node, AlertRule, Alert


class TelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Telemetry
        fields = ["time", "node_id", "metric_name", "value"]


class TelemetryCreateSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Telemetry
        fields = ["node_id", "metric_name", "value", "time"]


class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = [
            "id",
            "name",
            "location_lat",
            "location_lon",
            "status",
            "node_type",
            "metadata_json",
            "created_at",
        ]


class NodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = [
            "id",
            "name",
            "location_lat",
            "location_lon",
            "status",
            "node_type",
            "metadata_json",
        ]


class NodeUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)
    location_lat = serializers.FloatField(required=False)
    location_lon = serializers.FloatField(required=False)
    status = serializers.CharField(required=False)
    node_type = serializers.CharField(required=False)
    metadata_json = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Node
        fields = [
            "name",
            "location_lat",
            "location_lon",
            "status",
            "node_type",
            "metadata_json",
        ]


class AlertRuleSerializer(serializers.ModelSerializer):
    node_id = serializers.CharField(source="node.id", read_only=True, allow_null=True)

    class Meta:
        model = AlertRule
        fields = [
            "id",
            "node_id",
            "metric_name",
            "condition",
            "threshold",
            "severity",
            "active",
            "created_at",
        ]


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            "id",
            "rule_id",
            "node_id",
            "metric_name",
            "value",
            "threshold",
            "severity",
            "message",
            "triggered_at",
            "resolved_at",
        ]
