import asyncio
import random
from datetime import datetime, timezone
from typing import Optional
from app.core.database import AsyncSessionLocal
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_processor import TelemetryProcessor
from app.core.logger import logger


class TelemetrySimulator:
    """
    Simulates realistic smart-city telemetry sensor stream during development or demo mode.
    """

    DEFAULT_NODES = [
        {"id": "node-01", "type": "air_quality", "metrics": ["aqi", "co2", "pm25"]},
        {"id": "node-02", "type": "weather", "metrics": ["temperature", "humidity", "pressure"]},
        {"id": "node-03", "type": "traffic", "metrics": ["vehicle_count", "average_speed"]},
        {"id": "node-04", "type": "energy", "metrics": ["grid_load_kw", "solar_output_kw"]},
    ]

    def __init__(self, interval_seconds: float = 2.0):
        self.interval_seconds = interval_seconds
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start() -> None:
        """
        Starts the background telemetry simulation task.
        """
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info("telemetry_simulator_started", interval=self.interval_seconds)

    async def _simulation_loop(self) -> None:
        """
        Loops continuously generating fake telemetry readings.
        """
        while self._running:
            try:
                node = random.choice(self.DEFAULT_NODES)
                metric = random.choice(node["metrics"])
                val = self._generate_metric_value(metric)

                telemetry = TelemetryCreate(
                    node_id=node["id"],
                    metric_name=metric,
                    value=val,
                    time=datetime.now(timezone.utc),
                )

                async with AsyncSessionLocal() as session:
                    await TelemetryProcessor.process_telemetry(session, telemetry)

            except Exception as e:
                logger.error("simulation_loop_error", error=str(e))

            await asyncio.sleep(self.interval_seconds)

    def _generate_metric_value(self, metric_name: str) -> float:
        if metric_name == "aqi":
            return round(random.uniform(20.0, 180.0), 2)
        elif metric_name == "co2":
            return round(random.uniform(350.0, 950.0), 1)
        elif metric_name == "pm25":
            return round(random.uniform(5.0, 75.0), 2)
        elif metric_name == "temperature":
            return round(random.uniform(15.0, 38.0), 1)
        elif metric_name == "humidity":
            return round(random.uniform(30.0, 90.0), 1)
        elif metric_name == "pressure":
            return round(random.uniform(995.0, 1025.0), 1)
        elif metric_name == "vehicle_count":
            return float(random.randint(10, 250))
        elif metric_name == "average_speed":
            return round(random.uniform(20.0, 80.0), 1)
        elif metric_name == "grid_load_kw":
            return round(random.uniform(100.0, 1500.0), 1)
        elif metric_name == "solar_output_kw":
            return round(random.uniform(0.0, 800.0), 1)
        return round(random.uniform(1.0, 100.0), 2)

    async def stop() -> None:
        """
        Stops the simulation gracefully.
        """
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("telemetry_simulator_stopped")
