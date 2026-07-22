from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)  # e.g., "node-01"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location_lat: Mapped[float] = mapped_column(Float, nullable=False)
    location_lon: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="online", nullable=False)  # online, offline, maintenance
    node_type: Mapped[str] = mapped_column(String(50), default="air_quality", nullable=False)  # air_quality, traffic, energy, weather
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
