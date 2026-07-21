from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.api.v1.dependencies import get_current_user, require_role
from app.models.alert import AlertRule, Alert
from app.models.user import User
from app.schemas.alert import (
    AlertRuleCreate,
    AlertRuleUpdate,
    AlertRuleResponse,
    AlertResponse,
)

router = APIRouter()
operator_required = require_role(["admin", "operator"])


# --- Alert Rules CRUD ---

@router.get("/rules", response_model=List[AlertRuleResponse])
async def list_alert_rules(
    skip: int = 0,
    limit: int = 100,
    node_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all configured alert rules.
    """
    query = select(AlertRule).offset(skip).limit(limit)
    if node_id:
        query = query.where(AlertRule.node_id == node_id)

    result = await db.execute(query)
    rules = result.scalars().all()
    return rules


@router.post("/rules", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(operator_required)])
async def create_alert_rule(
    rule_in: AlertRuleCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new alert threshold rule (Admin or Operator).
    """
    rule = AlertRule(
        node_id=rule_in.node_id,
        metric_name=rule_in.metric_name,
        condition=rule_in.condition,
        threshold=rule_in.threshold,
        severity=rule_in.severity,
        active=rule_in.active,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.get("/rules/{rule_id}", response_model=AlertRuleResponse)
async def get_alert_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get single alert rule by ID.
    """
    result = await db.execute(select(AlertRule).where(AlertRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise NotFoundException(detail=f"Alert rule with ID {rule_id} not found")
    return rule


@router.put("/rules/{rule_id}", response_model=AlertRuleResponse, dependencies=[Depends(operator_required)])
async def update_alert_rule(
    rule_id: int,
    rule_in: AlertRuleUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update alert rule (Admin or Operator).
    """
    result = await db.execute(select(AlertRule).where(AlertRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise NotFoundException(detail=f"Alert rule with ID {rule_id} not found")

    if rule_in.node_id is not None:
        rule.node_id = rule_in.node_id
    if rule_in.metric_name is not None:
        rule.metric_name = rule_in.metric_name
    if rule_in.condition is not None:
        rule.condition = rule_in.condition
    if rule_in.threshold is not None:
        rule.threshold = rule_in.threshold
    if rule_in.severity is not None:
        rule.severity = rule_in.severity
    if rule_in.active is not None:
        rule.active = rule_in.active

    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(operator_required)])
async def delete_alert_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete alert rule (Admin or Operator).
    """
    result = await db.execute(select(AlertRule).where(AlertRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise NotFoundException(detail=f"Alert rule with ID {rule_id} not found")

    await db.delete(rule)
    await db.commit()
    return None


# --- Triggered Alerts Log ---

@router.get("", response_model=List[AlertResponse])
async def list_triggered_alerts(
    skip: int = 0,
    limit: int = 100,
    node_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    unresolved_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List triggered alert notifications log.
    """
    query = select(Alert).order_by(Alert.triggered_at.desc()).offset(skip).limit(limit)

    if node_id:
        query = query.where(Alert.node_id == node_id)
    if severity:
        query = query.where(Alert.severity == severity)
    if unresolved_only:
        query = query.where(Alert.resolved_at.is_(None))

    result = await db.execute(query)
    alerts = result.scalars().all()
    return alerts
