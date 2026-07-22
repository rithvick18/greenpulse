from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class WSControlMessage(BaseModel):
    action: str  # subscribe, unsubscribe, ping
    nodes: Optional[List[str]] = None
    metrics: Optional[List[str]] = None


class WSMessage(BaseModel):
    event: str  # telemetry_update, snapshot, alert_notification, pong
    data: Dict[str, Any]


class WSSnapshotMessage(BaseModel):
    event: str = "snapshot"
    nodes_summary: List[Dict[str, Any]]
    latest_telemetry: List[Dict[str, Any]]
    active_alerts: List[Dict[str, Any]]
