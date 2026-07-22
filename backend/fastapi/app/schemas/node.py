from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class NodeBase(BaseModel):
    name: str
    location_lat: float
    location_lon: float
    status: str = "online"  # online, offline, maintenance
    node_type: str = "air_quality"  # air_quality, traffic, energy, weather
    metadata_json: Optional[Dict[str, Any]] = None


class NodeCreate(NodeBase):
    id: str


class NodeUpdate(BaseModel):
    name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    status: Optional[str] = None
    node_type: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class NodeResponse(NodeBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
