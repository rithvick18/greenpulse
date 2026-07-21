import asyncio
import random
from datetime import datetime, timezone
from typing import Optional
from app.core.database import AsyncSessionLocal
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_processor import TelemetryProcessor
from app.core.redis import RedisManager
from app.websocket.manager import manager as ws_manager
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
        {"id": "node-05", "type": "substation", "metrics": ["load_pct", "voltage_kv"]},
        {"id": "node-06", "type": "structural", "metrics": ["vibration_hz", "stress_load_pct"]},
        {"id": "node-07", "type": "robotic", "metrics": ["thermal_c", "yield_pct"]},
    ]

    def __init__(self, interval_seconds: float = 2.0):
        self.interval_seconds = interval_seconds
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
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
        Loops continuously generating fake telemetry readings and broadcasting dashboard state.
        """
        step = 0
        while self._running:
            try:
                # 1. Generate single node metric reading for TimescaleDB / Alert engine
                node = random.choice(self.DEFAULT_NODES)
                metric = random.choice(node["metrics"])
                val = self._generate_metric_value(metric)

                telemetry = TelemetryCreate(
                    node_id=node["id"],
                    metric_name=metric,
                    value=val,
                    time=datetime.now(timezone.utc),
                )

                try:
                    async with AsyncSessionLocal() as session:
                        await TelemetryProcessor.process_telemetry(session, telemetry)
                except Exception as db_err:
                    logger.debug("simulation_db_bypass", error=str(db_err))

                # 2. Every 2 iterations, broadcast updated dashboard telemetry snapshot
                if step % 2 == 0:
                    snapshot_payload = self.generate_dashboard_snapshot()
                    message = {
                        "event": "telemetry_update",
                        "data": snapshot_payload,
                    }
                    try:
                        await RedisManager.publish(channel="telemetry:broadcast", message=message)
                    except Exception:
                        # Fallback to direct WebSocket broadcast if Redis is unavailable
                        await ws_manager.broadcast_to_local(message)

                step += 1

            except Exception as e:
                logger.error("simulation_loop_error", error=str(e))

            await asyncio.sleep(self.interval_seconds)

    def generate_dashboard_snapshot(self) -> dict:
        """
        Generates a full telemetry snapshot matching the frontend TelemetryContext data structure.
        """
        return {
            "cityHealthIndex": round(98.0 + random.uniform(-0.5, 0.6), 1),
            "totalPowerMW": round(840.0 + random.uniform(-15.0, 25.0), 1),
            "peakLoadMW": 980,
            "cleanEnergyPercent": round(78.0 + random.uniform(-1.5, 2.0), 1),
            "trafficCongestionPercent": round(34 + random.randint(-4, 5)),
            "airQualityAQI": round(24 + random.randint(-2, 3)),
            "batteryReserveMWh": round(420 + random.randint(-10, 15)),
            "gridFrequencyHz": round(50.0 + random.uniform(-0.04, 0.05), 2),
            "waterPressurePsi": round(62 + random.randint(-2, 3)),
            "seismicMv": round(0.02 + random.uniform(-0.005, 0.008), 3),
            "avCorridorFlow": round(8420 + random.randint(-120, 150)),
            "totalSensors": 14820,
            "meshHealthPct": round(99.8 + random.uniform(-0.2, 0.1), 1),
            "avgResponseEtaMinutes": round(3.8 + random.uniform(-0.3, 0.4), 1),
            "avVectorsActive": round(1420 + random.randint(-30, 40)),
            "substations": [
                {
                    "id": "SUB-01",
                    "name": "Downtown Central Substation",
                    "loadPct": round(78 + random.randint(-3, 4)),
                    "voltage": "138 kV",
                    "status": "NOMINAL",
                },
                {
                    "id": "SUB-02",
                    "name": "Harbor Industrial Substation",
                    "loadPct": round(91 + random.randint(-2, 3)),
                    "voltage": "230 kV",
                    "status": "HIGH_LOAD" if random.random() > 0.3 else "NOMINAL",
                },
            ],
            "energySources": [
                {
                    "name": "SOLAR ARRAY NORTH",
                    "type": "solar",
                    "outputMW": round(320 + random.uniform(-10, 15), 1),
                    "capacityMW": 400,
                    "efficiency": 94,
                    "status": "ONLINE",
                },
                {
                    "name": "OFFSHORE WIND PARK",
                    "type": "wind",
                    "outputMW": round(280 + random.uniform(-15, 20), 1),
                    "capacityMW": 350,
                    "efficiency": 89,
                    "status": "ONLINE",
                },
                {
                    "name": "HYDRO BASIN TURBINE",
                    "type": "hydro",
                    "outputMW": round(150 + random.uniform(-5, 5), 1),
                    "capacityMW": 180,
                    "efficiency": 97,
                    "status": "ONLINE",
                },
                {
                    "name": "GRID BESS RESERVE",
                    "type": "battery",
                    "outputMW": round(92.5 + random.uniform(-8, 10), 1),
                    "capacityMW": 150,
                    "efficiency": 99,
                    "status": "ONLINE",
                },
            ],
            "intersections": [
                {
                    "id": "INT-01",
                    "name": "Grand Ave & 4th St",
                    "congestion": round(68 + random.randint(-5, 5)),
                    "throughput": round(1420 + random.randint(-40, 50)),
                    "signalStatus": "OPTIMIZED",
                    "avDensity": 74,
                },
                {
                    "id": "INT-02",
                    "name": "Harbor Expressway Junction",
                    "congestion": round(84 + random.randint(-4, 4)),
                    "throughput": round(2100 + random.randint(-60, 60)),
                    "signalStatus": "CONGESTED",
                    "avDensity": 82,
                },
                {
                    "id": "INT-03",
                    "name": "Civic Center Boulevard",
                    "congestion": round(29 + random.randint(-3, 4)),
                    "throughput": round(980 + random.randint(-30, 30)),
                    "signalStatus": "OPTIMIZED",
                    "avDensity": 65,
                },
            ],
            "structuralNodes": [
                {
                    "id": "STR-8801",
                    "name": "Grand Suspension Bridge",
                    "type": "BRIDGE",
                    "stressLoad": round(42 + random.randint(-2, 3)),
                    "vibrationHz": round(1.2 + random.uniform(-0.1, 0.1), 1),
                    "status": "STABLE",
                },
                {
                    "id": "STR-8802",
                    "name": "Harbor Deep Transit Tunnel",
                    "type": "TUNNEL",
                    "stressLoad": round(68 + random.randint(-3, 3)),
                    "vibrationHz": round(2.8 + random.uniform(-0.2, 0.2), 1),
                    "status": "ELEVATED_STRESS",
                },
                {
                    "id": "STR-8803",
                    "name": "North Basin Aqueduct Reservoir",
                    "type": "RESERVOIR",
                    "stressLoad": round(29 + random.randint(-1, 2)),
                    "vibrationHz": round(0.4 + random.uniform(-0.05, 0.05), 2),
                    "status": "STABLE",
                },
                {
                    "id": "STR-8804",
                    "name": "High-Voltage Grid Tower 14",
                    "type": "GRID_TOWER",
                    "stressLoad": round(38 + random.randint(-2, 2)),
                    "vibrationHz": round(1.1 + random.uniform(-0.1, 0.1), 1),
                    "status": "STABLE",
                },
            ],
            "roboticCells": [
                {
                    "id": "ARM-01",
                    "location": "Assembly Line A (Precision Optics)",
                    "thermalC": round(48.2 + random.uniform(-1.0, 1.5), 1),
                    "maxC": 80,
                    "yieldPct": 99.8,
                    "status": "NOMINAL",
                },
                {
                    "id": "ARM-02",
                    "location": "Assembly Line B (Heavy Stamping)",
                    "thermalC": round(64.5 + random.uniform(-2.0, 2.5), 1),
                    "maxC": 85,
                    "yieldPct": 98.9,
                    "status": "ELEVATED_TEMP",
                },
                {
                    "id": "ARM-03",
                    "location": "Assembly Line C (Micro Electronics)",
                    "thermalC": round(41.0 + random.uniform(-0.8, 1.2), 1),
                    "maxC": 75,
                    "yieldPct": 99.9,
                    "status": "NOMINAL",
                },
                {
                    "id": "ARM-04",
                    "location": "Packaging & Automated Sorting",
                    "thermalC": round(38.5 + random.uniform(-0.5, 1.0), 1),
                    "maxC": 70,
                    "yieldPct": 99.5,
                    "status": "NOMINAL",
                },
            ],
        }

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
        elif metric_name == "load_pct":
            return round(random.uniform(40.0, 95.0), 1)
        elif metric_name == "voltage_kv":
            return round(random.uniform(130.0, 240.0), 1)
        elif metric_name == "vibration_hz":
            return round(random.uniform(0.5, 3.5), 2)
        elif metric_name == "stress_load_pct":
            return round(random.uniform(20.0, 85.0), 1)
        elif metric_name == "thermal_c":
            return round(random.uniform(35.0, 75.0), 1)
        elif metric_name == "yield_pct":
            return round(random.uniform(97.0, 99.9), 2)
        return round(random.uniform(1.0, 100.0), 2)

    async def stop(self) -> None:
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

