import pytest
import asyncio
from app.services.simulation import TelemetrySimulator


def test_simulation_generate_snapshot_schema():
    simulator = TelemetrySimulator()
    snapshot = simulator.generate_dashboard_snapshot()

    assert "cityHealthIndex" in snapshot
    assert "totalPowerMW" in snapshot
    assert "cleanEnergyPercent" in snapshot
    assert "trafficCongestionPercent" in snapshot
    assert "airQualityAQI" in snapshot
    assert "energySources" in snapshot
    assert "substations" in snapshot
    assert "intersections" in snapshot
    assert "structuralNodes" in snapshot
    assert "roboticCells" in snapshot

    assert isinstance(snapshot["cityHealthIndex"], (float, int))
    assert len(snapshot["energySources"]) > 0
    assert len(snapshot["intersections"]) > 0


def test_simulation_generate_metric_values():
    simulator = TelemetrySimulator()
    aqi = simulator._generate_metric_value("aqi")
    assert 20.0 <= aqi <= 180.0

    temp = simulator._generate_metric_value("temperature")
    assert 15.0 <= temp <= 38.0

    unknown = simulator._generate_metric_value("unknown_metric")
    assert 1.0 <= unknown <= 100.0


@pytest.mark.asyncio
async def test_simulation_lifecycle():
    simulator = TelemetrySimulator(interval_seconds=0.1)
    await simulator.start()
    assert simulator._running is True

    await asyncio.sleep(0.25)
    await simulator.stop()
    assert simulator._running is False
