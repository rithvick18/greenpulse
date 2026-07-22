import asyncio
from datetime import datetime, timedelta, timezone
import random

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.node import Node
from app.models.alert import AlertRule
from app.models.telemetry import Telemetry
from app.core.logger import logger


async def seed():
    """
    Populates database with initial demo data (users, nodes, alert rules, and telemetry time-series).
    """
    logger.info("seed_data_script_started")

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Users
        users_data = [
            {"username": "admin", "email": "admin@greenpulse.io", "password": "admin123", "role": "admin"},
            {"username": "operator", "email": "operator@greenpulse.io", "password": "operator123", "role": "operator"},
            {"username": "analyst", "email": "analyst@greenpulse.io", "password": "analyst123", "role": "analyst"},
        ]

        for u in users_data:
            existing = await session.get(User, 1)  # simple query check
            # Check by username
            from sqlalchemy import select
            res = await session.execute(select(User).where(User.username == u["username"]))
            if not res.scalar_one_or_none():
                user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                )
                session.add(user)
                logger.info("seeded_user", username=u["username"], role=u["role"])

        # 2. Seed Telemetry Nodes
        nodes_data = [
            {
                "id": "node-01",
                "name": "Central Plaza Air Quality Sensor",
                "location_lat": 37.7749,
                "location_lon": -122.4194,
                "status": "online",
                "node_type": "air_quality",
                "metadata_json": {"vendor": "Sensirion", "firmware": "v2.1.0"},
            },
            {
                "id": "node-02",
                "name": "North District Weather Hub",
                "location_lat": 37.7833,
                "location_lon": -122.4167,
                "status": "online",
                "node_type": "weather",
                "metadata_json": {"vendor": "Vaisala", "firmware": "v1.4.2"},
            },
            {
                "id": "node-03",
                "name": "Highway 101 Traffic Monitor",
                "location_lat": 37.7500,
                "location_lon": -122.4000,
                "status": "online",
                "node_type": "traffic",
                "metadata_json": {"vendor": "Siemens", "firmware": "v3.0.1"},
            },
            {
                "id": "node-04",
                "name": "East Grid Solar Substation",
                "location_lat": 37.7600,
                "location_lon": -122.3900,
                "status": "online",
                "node_type": "energy",
                "metadata_json": {"vendor": "Schneider", "firmware": "v4.2.0"},
            },
        ]

        for n in nodes_data:
            existing_node = await session.get(Node, n["id"])
            if not existing_node:
                node = Node(
                    id=n["id"],
                    name=n["name"],
                    location_lat=n["location_lat"],
                    location_lon=n["location_lon"],
                    status=n["status"],
                    node_type=n["node_type"],
                    metadata_json=n["metadata_json"],
                )
                session.add(node)
                logger.info("seeded_node", node_id=n["id"])

        await session.commit()

        # 3. Seed Alert Rules
        rules_data = [
            {"node_id": "node-01", "metric_name": "aqi", "condition": ">", "threshold": 150.0, "severity": "critical"},
            {"node_id": "node-02", "metric_name": "temperature", "condition": ">", "threshold": 35.0, "severity": "warning"},
            {"node_id": None, "metric_name": "co2", "condition": ">", "threshold": 800.0, "severity": "warning"},
        ]

        for r in rules_data:
            from sqlalchemy import select, and_
            res = await session.execute(
                select(AlertRule).where(
                    and_(
                        AlertRule.node_id == r["node_id"],
                        AlertRule.metric_name == r["metric_name"],
                    )
                )
            )
            if not res.scalar_one_or_none():
                rule = AlertRule(
                    node_id=r["node_id"],
                    metric_name=r["metric_name"],
                    condition=r["condition"],
                    threshold=r["threshold"],
                    severity=r["severity"],
                    active=True,
                )
                session.add(rule)
                logger.info("seeded_alert_rule", metric=r["metric_name"])

        # 4. Seed Historical Telemetry (past 24 hours)
        now = datetime.now(timezone.utc)
        telemetry_batch = []
        metrics_map = {
            "node-01": [("aqi", 40, 160), ("co2", 400, 850), ("pm25", 10, 60)],
            "node-02": [("temperature", 18, 36), ("humidity", 40, 85)],
            "node-03": [("vehicle_count", 20, 220), ("average_speed", 25, 75)],
            "node-04": [("grid_load_kw", 300, 1200), ("solar_output_kw", 0, 750)],
        }

        for i in range(120):  # 120 points over 24 hours (every 12 mins)
            point_time = now - timedelta(minutes=12 * i)
            for node_id, metrics in metrics_map.items():
                for metric_name, min_v, max_v in metrics:
                    val = round(random.uniform(min_v, max_v), 2)
                    t = Telemetry(
                        time=point_time,
                        node_id=node_id,
                        metric_name=metric_name,
                        value=val,
                    )
                    telemetry_batch.append(t)

        session.add_all(telemetry_batch)
        await session.commit()
        logger.info("seeded_historical_telemetry_batch", total_records=len(telemetry_batch))

    logger.info("seed_data_script_completed_successfully")


if __name__ == "__main__":
    asyncio.run(seed())
