from django.db import models
from django.utils import timezone


class Telemetry(models.Model):
    """
    Time-series telemetry reading model matching PostgreSQL / TimescaleDB 'telemetry' table.
    """
    time = models.DateTimeField(db_index=True)
    node_id = models.CharField(max_length=50, db_index=True)
    metric_name = models.CharField(max_length=50, db_index=True)
    value = models.FloatField()

    class Meta:
        db_table = "telemetry"
        managed = False
        indexes = [
            models.Index(fields=["node_id", "metric_name", "time"], name="idx_telemetry_node_metric_time"),
        ]

    def __str__(self):
        return f"{self.node_id} - {self.metric_name}: {self.value} @ {self.time}"


class Node(models.Model):
    """
    Smart-city infrastructure node model matching 'nodes' table.
    """
    id = models.CharField(max_length=50, primary_key=True)  # e.g., "node-01"
    name = models.CharField(max_length=100)
    location_lat = models.FloatField()
    location_lon = models.FloatField()
    status = models.CharField(max_length=20, default="online")
    node_type = models.CharField(max_length=50, default="air_quality")
    metadata_json = models.JSONField(null=True, blank=True, db_column="metadata_json")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "nodes"

    def __str__(self):
        return f"{self.name} ({self.id})"


class AlertRule(models.Model):
    """
    Alert rule definition model matching 'alert_rules' table.
    """
    id = models.AutoField(primary_key=True)
    node = models.ForeignKey(
        Node,
        on_delete=models.CASCADE,
        db_column="node_id",
        null=True,
        blank=True,
        related_name="alert_rules",
    )
    metric_name = models.CharField(max_length=50, db_index=True)
    condition = models.CharField(max_length=10)  # >, <, >=, <=, ==
    threshold = models.FloatField()
    severity = models.CharField(max_length=20, default="warning")  # warning, critical
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "alert_rules"

    def __str__(self):
        return f"Rule #{self.id}: {self.metric_name} {self.condition} {self.threshold}"


class Alert(models.Model):
    """
    Triggered alert model matching 'alerts' table.
    """
    id = models.AutoField(primary_key=True)
    rule = models.ForeignKey(
        AlertRule,
        on_delete=models.CASCADE,
        db_column="rule_id",
        related_name="alerts",
    )
    node_id = models.CharField(max_length=50, db_index=True)
    metric_name = models.CharField(max_length=50)
    value = models.FloatField()
    threshold = models.FloatField()
    severity = models.CharField(max_length=20)
    message = models.CharField(max_length=255)
    triggered_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "alerts"

    def __str__(self):
        return f"Alert #{self.id} [{self.severity}]: {self.message}"
