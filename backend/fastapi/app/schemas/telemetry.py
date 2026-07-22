from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TelemetryCreate(BaseModel):
    node_id: str
    metric_name: str
    value: float
    time: Optional[datetime] = None


class TelemetryResponse(BaseModel):
    time: datetime
    node_id: str
    metric_name: str
    value: float

    model_config = ConfigDict(from_attributes=True)


class MetricAggPoint(BaseModel):
    timestamp: datetime
    avg_value: float
    min_value: float
    max_value: float
    count: int


class HistoricalMetricsQuery(BaseModel):
    node_id: str
    metric_name: str
    from_time: datetime
    to_time: datetime
    resolution: str = "5m"  # raw, 1m, 5m, 1h, 1d


class HistoricalMetricsResponse(BaseModel):
    node_id: str
    metric_name: str
    resolution: str
    data: List[MetricAggPoint]
