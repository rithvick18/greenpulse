from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertRuleBase(BaseModel):
    node_id: Optional[str] = None
    metric_name: str
    condition: str  # >, <, >=, <=, ==
    threshold: float
    severity: str = "warning"  # warning, critical
    active: bool = True


class AlertRuleCreate(AlertRuleBase):
    pass


class AlertRuleUpdate(BaseModel):
    node_id: Optional[str] = None
    metric_name: Optional[str] = None
    condition: Optional[str] = None
    threshold: Optional[float] = None
    severity: Optional[str] = None
    active: Optional[bool] = None


class AlertRuleResponse(AlertRuleBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertResponse(BaseModel):
    id: int
    rule_id: int
    node_id: str
    metric_name: str
    value: float
    threshold: float
    severity: str
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
