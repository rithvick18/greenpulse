from datetime import datetime
from sqlalchemy import String, Float, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True, index=True)
    node_id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    metric_name: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        Index("idx_telemetry_node_metric_time", "node_id", "metric_name", "time"),
    )
