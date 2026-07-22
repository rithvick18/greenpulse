from datetime import datetime, timezone
from typing import List
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import AlertRule, Alert
from app.schemas.telemetry import TelemetryCreate
from app.core.logger import logger


class AlertEngine:
    """
    Evaluates incoming telemetry metrics against active Alert Rules.
    """

    @staticmethod
    async def evaluate_telemetry(db: AsyncSession, telemetry: TelemetryCreate) -> List[Alert]:
        """
        Evaluates rules applicable for the node & metric and creates Alert if violated.
        """
        triggered_alerts: List[Alert] = []

        try:
            # Query active rules matching metric_name and either matching node_id or global (node_id IS NULL)
            query = select(AlertRule).where(
                and_(
                    AlertRule.active == True,  # noqa: E712
                    AlertRule.metric_name == telemetry.metric_name,
                    or_(AlertRule.node_id == telemetry.node_id, AlertRule.node_id.is_(None)),
                )
            )
            result = await db.execute(query)
            rules = result.scalars().all()

            for rule in rules:
                is_violated = AlertEngine._check_condition(
                    value=telemetry.value,
                    condition=rule.condition,
                    threshold=rule.threshold,
                )

                if is_violated:
                    msg = (
                        f"Alert triggered on node '{telemetry.node_id}' for metric '{telemetry.metric_name}': "
                        f"value {telemetry.value} {rule.condition} threshold {rule.threshold}"
                    )

                    alert = Alert(
                        rule_id=rule.id,
                        node_id=telemetry.node_id,
                        metric_name=telemetry.metric_name,
                        value=telemetry.value,
                        threshold=rule.threshold,
                        severity=rule.severity,
                        message=msg,
                        triggered_at=telemetry.time or datetime.now(timezone.utc),
                    )
                    db.add(alert)
                    triggered_alerts.append(alert)
                    logger.warning(
                        "alert_rule_triggered",
                        rule_id=rule.id,
                        node_id=telemetry.node_id,
                        metric=telemetry.metric_name,
                        value=telemetry.value,
                        threshold=rule.threshold,
                    )

            if triggered_alerts:
                await db.commit()

        except Exception as e:
            logger.error("alert_engine_evaluation_error", error=str(e), node_id=telemetry.node_id)
            await db.rollback()

        return triggered_alerts

    @staticmethod
    def _check_condition(value: float, condition: str, threshold: float) -> bool:
        if condition == ">":
            return value > threshold
        elif condition == "<":
            return value < threshold
        elif condition == ">=":
            return value >= threshold
        elif condition == "<=":
            return value <= threshold
        elif condition == "==":
            return abs(value - threshold) < 1e-6
        return False
