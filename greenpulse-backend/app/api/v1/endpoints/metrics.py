from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.schemas.telemetry import HistoricalMetricsResponse
from app.services.analytics import AnalyticsService
from app.utils.time import parse_iso_datetime

router = APIRouter()


@router.get("/historical", response_model=HistoricalMetricsResponse)
async def get_historical_metrics(
    node_id: str = Query(..., description="Target node ID (e.g. node-01)"),
    metric_name: str = Query(..., description="Target metric name (e.g. aqi, temperature, vehicle_count)"),
    from_time: Optional[str] = Query(None, alias="from", description="ISO start time"),
    to_time: Optional[str] = Query(None, alias="to", description="ISO end time"),
    resolution: str = Query("5m", description="Bucket resolution: raw, 1m, 5m, 1h, 1d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve aggregated historical telemetry metrics for a given node and metric within a time range.
    """
    now = datetime.now(timezone.utc)

    if from_time:
        start_dt = parse_iso_datetime(from_time)
        if not start_dt:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid 'from' timestamp format")
    else:
        start_dt = now - timedelta(hours=24)

    if to_time:
        end_dt = parse_iso_datetime(to_time)
        if not end_dt:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid 'to' timestamp format")
    else:
        end_dt = now

    if start_dt > end_dt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="'from' time cannot be after 'to' time")

    response = await AnalyticsService.get_historical_metrics(
        db=db,
        node_id=node_id,
        metric_name=metric_name,
        from_time=start_dt,
        to_time=end_dt,
        resolution=resolution,
    )

    return response
