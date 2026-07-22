import json
import os
try:
    import redis
except ImportError:
    redis = None

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from greenpulse_app.models import Telemetry, Node, Alert
from greenpulse_app.serializers import TelemetrySerializer, NodeSerializer, AlertSerializer


def get_redis_client():
    """
    Utility to get Redis client connection with fast timeout for fallback handling.
    """
    if redis is None:
        return None
    redis_url = getattr(settings, "REDIS_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
    try:
        r = redis.from_url(redis_url, decode_responses=True, socket_timeout=1.0)
        r.ping()
        return r
    except Exception:
        return None


def build_composite_telemetry_payload(recent_records=None):
    """
    Constructs a complete, rich composite telemetry payload containing mock fields
    and live metric overrides for all 6 view modules in GreenPulse OS.
    All keys are provided in BOTH snake_case and camelCase.
    """
    payload = {
        # Overview View
        "city_health_index": 88.4,
        "cityHealthIndex": 88.4,
        "net_generation": 482.5,
        "netGeneration": 482.5,
        "totalPowerMW": 482.5,
        "total_power_mw": 482.5,
        "peakLoadMW": 520.0,
        "peak_load_mw": 520.0,
        "traffic_congestion": 28.2,
        "trafficCongestion": 28.2,
        "trafficCongestionPercent": 28.2,
        "traffic_congestion_percent": 28.2,
        "air_quality_index": 34.0,
        "airQualityIndex": 34.0,
        "airQualityAQI": 34.0,
        "air_quality_aqi": 34.0,
        "renewable_share": 68.5,
        "cleanEnergyPercent": 68.5,
        "clean_energy_percent": 68.5,

        # Traffic Control View
        "intersections": [
            {
                "id": "int-01",
                "name": "Central & 5th Ave",
                "signalStatus": "OPTIMIZED",
                "signal_status": "OPTIMIZED",
                "congestionLevel": 24,
                "congestion_level": 24,
                "congestion": 24,
                "avgWaitTimeSec": 18,
                "avg_wait_time_sec": 18,
                "flowRateVehMin": 140,
                "flow_rate_veh_min": 140,
                "throughput": 140,
                "avDensity": 45,
                "av_density": 45,
            },
            {
                "id": "int-02",
                "name": "North Plaza & Main",
                "signalStatus": "OPTIMIZED",
                "signal_status": "OPTIMIZED",
                "congestionLevel": 24,
                "congestion_level": 24,
                "congestion": 24,
                "avgWaitTimeSec": 18,
                "avg_wait_time_sec": 18,
                "flowRateVehMin": 140,
                "flow_rate_veh_min": 140,
                "throughput": 140,
                "avDensity": 40,
                "av_density": 40,
            },
            {
                "id": "int-03",
                "name": "East Expressway Hub",
                "signalStatus": "OPTIMIZED",
                "signal_status": "OPTIMIZED",
                "congestionLevel": 24,
                "congestion_level": 24,
                "congestion": 24,
                "avgWaitTimeSec": 18,
                "avg_wait_time_sec": 18,
                "flowRateVehMin": 140,
                "flow_rate_veh_min": 140,
                "throughput": 140,
                "avDensity": 50,
                "av_density": 50,
            },
            {
                "id": "int-04",
                "name": "West Tech Corridor",
                "signalStatus": "OPTIMIZED",
                "signal_status": "OPTIMIZED",
                "congestionLevel": 24,
                "congestion_level": 24,
                "congestion": 24,
                "avgWaitTimeSec": 18,
                "avg_wait_time_sec": 18,
                "flowRateVehMin": 140,
                "flow_rate_veh_min": 140,
                "throughput": 140,
                "avDensity": 42,
                "av_density": 42,
            },
        ],
        "total_intersections_managed": 42,
        "totalIntersectionsManaged": 42,
        "average_delay_reduction_pct": 14.8,
        "averageDelayReductionPct": 14.8,
        "av_corridor_flow": 1420,
        "avCorridorFlow": 1420,
        "av_vectors_active": 348,
        "avVectorsActive": 348,
        "traffic_cameras": [
            {"id": "CAM-101", "location": "Central & 5th Ave", "fps": 60, "status": "LIVE"},
            {"id": "CAM-102", "location": "North Plaza & Main", "fps": 60, "status": "LIVE"},
            {"id": "CAM-103", "location": "East Expressway Hub", "fps": 60, "status": "LIVE"},
        ],
        "trafficCameras": [
            {"id": "CAM-101", "location": "Central & 5th Ave", "fps": 60, "status": "LIVE"},
            {"id": "CAM-102", "location": "North Plaza & Main", "fps": 60, "status": "LIVE"},
            {"id": "CAM-103", "location": "East Expressway Hub", "fps": 60, "status": "LIVE"},
        ],

        # Smart Energy Grid View
        "substations": [
            {
                "id": "sub-01",
                "name": "Substation Alpha",
                "load_mw": 120.4,
                "loadMw": 120.4,
                "capacity_mw": 150,
                "capacityMw": 150,
                "status": "NOMINAL",
                "efficiency_pct": 98.2,
                "efficiencyPct": 98.2,
                "load_pct": 80.3,
                "loadPct": 80.3,
                "voltage": "230 kV",
            },
            {
                "id": "sub-02",
                "name": "Substation Beta",
                "load_mw": 120.4,
                "loadMw": 120.4,
                "capacity_mw": 150,
                "capacityMw": 150,
                "status": "NOMINAL",
                "efficiency_pct": 98.2,
                "efficiencyPct": 98.2,
                "load_pct": 80.3,
                "loadPct": 80.3,
                "voltage": "230 kV",
            },
            {
                "id": "sub-03",
                "name": "Substation Gamma",
                "load_mw": 120.4,
                "loadMw": 120.4,
                "capacity_mw": 150,
                "capacityMw": 150,
                "status": "NOMINAL",
                "efficiency_pct": 98.2,
                "efficiencyPct": 98.2,
                "load_pct": 80.3,
                "loadPct": 80.3,
                "voltage": "230 kV",
            },
            {
                "id": "sub-04",
                "name": "Substation Delta",
                "load_mw": 120.4,
                "loadMw": 120.4,
                "capacity_mw": 150,
                "capacityMw": 150,
                "status": "NOMINAL",
                "efficiency_pct": 98.2,
                "efficiencyPct": 98.2,
                "load_pct": 80.3,
                "loadPct": 80.3,
                "voltage": "230 kV",
            },
        ],
        "generation_breakdown": [
            {
                "name": "Solar",
                "type": "solar",
                "value": 180,
                "output_mw": 180,
                "outputMW": 180,
                "capacity_mw": 250,
                "capacityMW": 250,
                "efficiency": 94.5,
                "status": "ONLINE",
            },
            {
                "name": "Wind",
                "type": "wind",
                "value": 140,
                "output_mw": 140,
                "outputMW": 140,
                "capacity_mw": 200,
                "capacityMW": 200,
                "efficiency": 91.2,
                "status": "ONLINE",
            },
            {
                "name": "Hydro",
                "type": "hydro",
                "value": 120,
                "output_mw": 120,
                "outputMW": 120,
                "capacity_mw": 150,
                "capacityMW": 150,
                "efficiency": 96.0,
                "status": "ONLINE",
            },
            {
                "name": "Grid Storage",
                "type": "battery",
                "value": 42.5,
                "output_mw": 42.5,
                "outputMW": 42.5,
                "capacity_mw": 60,
                "capacityMW": 60,
                "efficiency": 98.5,
                "status": "ONLINE",
            },
        ],
        "generationBreakdown": [
            {
                "name": "Solar",
                "type": "solar",
                "value": 180,
                "output_mw": 180,
                "outputMW": 180,
                "capacity_mw": 250,
                "capacityMW": 250,
                "efficiency": 94.5,
                "status": "ONLINE",
            },
            {
                "name": "Wind",
                "type": "wind",
                "value": 140,
                "output_mw": 140,
                "outputMW": 140,
                "capacity_mw": 200,
                "capacityMW": 200,
                "efficiency": 91.2,
                "status": "ONLINE",
            },
            {
                "name": "Hydro",
                "type": "hydro",
                "value": 120,
                "output_mw": 120,
                "outputMW": 120,
                "capacity_mw": 150,
                "capacityMW": 150,
                "efficiency": 96.0,
                "status": "ONLINE",
            },
            {
                "name": "Grid Storage",
                "type": "battery",
                "value": 42.5,
                "output_mw": 42.5,
                "outputMW": 42.5,
                "capacity_mw": 60,
                "capacityMW": 60,
                "efficiency": 98.5,
                "status": "ONLINE",
            },
        ],
        "energy_sources": [
            {
                "name": "Solar",
                "type": "solar",
                "value": 180,
                "output_mw": 180,
                "outputMW": 180,
                "capacity_mw": 250,
                "capacityMW": 250,
                "efficiency": 94.5,
                "status": "ONLINE",
            },
            {
                "name": "Wind",
                "type": "wind",
                "value": 140,
                "output_mw": 140,
                "outputMW": 140,
                "capacity_mw": 200,
                "capacityMW": 200,
                "efficiency": 91.2,
                "status": "ONLINE",
            },
            {
                "name": "Hydro",
                "type": "hydro",
                "value": 120,
                "output_mw": 120,
                "outputMW": 120,
                "capacity_mw": 150,
                "capacityMW": 150,
                "efficiency": 96.0,
                "status": "ONLINE",
            },
            {
                "name": "Grid Storage",
                "type": "battery",
                "value": 42.5,
                "output_mw": 42.5,
                "outputMW": 42.5,
                "capacity_mw": 60,
                "capacityMW": 60,
                "efficiency": 98.5,
                "status": "ONLINE",
            },
        ],
        "energySources": [
            {
                "name": "Solar",
                "type": "solar",
                "value": 180,
                "output_mw": 180,
                "outputMW": 180,
                "capacity_mw": 250,
                "capacityMW": 250,
                "efficiency": 94.5,
                "status": "ONLINE",
            },
            {
                "name": "Wind",
                "type": "wind",
                "value": 140,
                "output_mw": 140,
                "outputMW": 140,
                "capacity_mw": 200,
                "capacityMW": 200,
                "efficiency": 91.2,
                "status": "ONLINE",
            },
            {
                "name": "Hydro",
                "type": "hydro",
                "value": 120,
                "output_mw": 120,
                "outputMW": 120,
                "capacity_mw": 150,
                "capacityMW": 150,
                "efficiency": 96.0,
                "status": "ONLINE",
            },
            {
                "name": "Grid Storage",
                "type": "battery",
                "value": 42.5,
                "output_mw": 42.5,
                "outputMW": 42.5,
                "capacity_mw": 60,
                "capacityMW": 60,
                "efficiency": 98.5,
                "status": "ONLINE",
            },
        ],
        "battery_reserve": 145.0,
        "batteryReserve": 145.0,
        "batteryReserveMWh": 145.0,
        "battery_reserve_mwh": 145.0,
        "grid_frequency": 60.0,
        "gridFrequency": 60.0,
        "gridFrequencyHz": 60.0,
        "grid_frequency_hz": 60.0,

        # Infrastructure & Environmental View
        "structural_nodes": [
            {
                "id": "node-s1",
                "name": "Metro Skybridge Alpha",
                "type": "BRIDGE",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
            {
                "id": "node-s2",
                "name": "Central Reservoir Dam",
                "type": "RESERVOIR",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
            {
                "id": "node-s3",
                "name": "Harbor Transit Tunnel",
                "type": "TUNNEL",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
        ],
        "structuralNodes": [
            {
                "id": "node-s1",
                "name": "Metro Skybridge Alpha",
                "type": "BRIDGE",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
            {
                "id": "node-s2",
                "name": "Central Reservoir Dam",
                "type": "RESERVOIR",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
            {
                "id": "node-s3",
                "name": "Harbor Transit Tunnel",
                "type": "TUNNEL",
                "strain_microstrain": 12.4,
                "strainMicrostrain": 12.4,
                "vibration_hz": 0.04,
                "vibrationHz": 0.04,
                "pressure_psi": 62.1,
                "pressurePsi": 62.1,
                "stress_load": 12.4,
                "stressLoad": 12.4,
                "status": "NOMINAL",
            },
        ],
        "water_pressure": 62.1,
        "waterPressure": 62.1,
        "waterPressurePsi": 62.1,
        "water_pressure_psi": 62.1,
        "seismic_activity": 0.01,
        "seismicActivity": 0.01,
        "seismicMv": 0.01,
        "seismic_mv": 0.01,
        "total_sensors": 12480,
        "totalSensors": 12480,
        "mesh_health_pct": 99.8,
        "meshHealthPct": 99.8,
        "maintenance_queue": [
            {"id": "MNT-402", "asset": "Substation 04 Transformer", "issue": "Coolant fluid level inspection", "priority": "MEDIUM", "assignedTech": "Tech Unit 7"},
            {"id": "MNT-405", "asset": "Water Pressure Main #12", "issue": "Flow meter calibration check", "priority": "LOW", "assignedTech": "Tech Unit 3"},
        ],
        "maintenanceQueue": [
            {"id": "MNT-402", "asset": "Substation 04 Transformer", "issue": "Coolant fluid level inspection", "priority": "MEDIUM", "assignedTech": "Tech Unit 7"},
            {"id": "MNT-405", "asset": "Water Pressure Main #12", "issue": "Flow meter calibration check", "priority": "LOW", "assignedTech": "Tech Unit 3"},
        ],

        # Public Safety View
        "active_incidents": [
            {
                "id": "inc-01",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Minor vehicle stall blocking Lane 2 in Sector 4",
                "priority": 3,
            },
            {
                "id": "inc-02",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Debris reported on Sector 4 northbound ramp",
                "priority": 3,
            },
            {
                "id": "inc-03",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Signal sync delay at Sector 4 junction",
                "priority": 3,
            },
        ],
        "activeIncidents": [
            {
                "id": "inc-01",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Minor vehicle stall blocking Lane 2 in Sector 4",
                "priority": 3,
            },
            {
                "id": "inc-02",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Debris reported on Sector 4 northbound ramp",
                "priority": 3,
            },
            {
                "id": "inc-03",
                "type": "Traffic Obstruction",
                "severity": "LOW",
                "location": "Sector 4",
                "status": "RESPONDING",
                "title": "Traffic Obstruction",
                "description": "Signal sync delay at Sector 4 junction",
                "priority": 3,
            },
        ],
        "emergency_response_avg_min": 4.2,
        "emergencyResponseAvgMin": 4.2,
        "avgResponseEtaMinutes": 4.2,
        "avg_response_eta_minutes": 4.2,
        "safety_units": [
            {"callsign": "PATROL-1", "type": "POLICE", "sector": "Sector 4", "status": "DISPATCHED", "etaMinutes": 4},
            {"callsign": "MED-2", "type": "MEDICAL", "sector": "Sector 2", "status": "STANDBY", "etaMinutes": 2},
            {"callsign": "FIRE-5", "type": "FIRE", "sector": "Sector 1", "status": "EN_ROUTE", "etaMinutes": 6},
        ],
        "safetyUnits": [
            {"callsign": "PATROL-1", "type": "POLICE", "sector": "Sector 4", "status": "DISPATCHED", "etaMinutes": 4},
            {"callsign": "MED-2", "type": "MEDICAL", "sector": "Sector 2", "status": "STANDBY", "etaMinutes": 2},
            {"callsign": "FIRE-5", "type": "FIRE", "sector": "Sector 1", "status": "EN_ROUTE", "etaMinutes": 6},
        ],

        # Industrial Precision View
        "robotic_cells": [
            {
                "id": "cell-01",
                "name": "Robotic Assembly Cell 1",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line A",
                "status": "OPERATIONAL",
            },
            {
                "id": "cell-02",
                "name": "Robotic Assembly Cell 2",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line B",
                "status": "OPERATIONAL",
            },
            {
                "id": "cell-03",
                "name": "Robotic Assembly Cell 3",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line C",
                "status": "OPERATIONAL",
            },
        ],
        "roboticCells": [
            {
                "id": "cell-01",
                "name": "Robotic Assembly Cell 1",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line A",
                "status": "OPERATIONAL",
            },
            {
                "id": "cell-02",
                "name": "Robotic Assembly Cell 2",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line B",
                "status": "OPERATIONAL",
            },
            {
                "id": "cell-03",
                "name": "Robotic Assembly Cell 3",
                "yield_rate_pct": 99.4,
                "yieldRatePct": 99.4,
                "yieldPct": 99.4,
                "yield_pct": 99.4,
                "vibration_amplitude": 0.02,
                "vibrationAmplitude": 0.02,
                "temperature_c": 38.5,
                "temperatureC": 38.5,
                "thermalC": 38.5,
                "thermal_c": 38.5,
                "maxC": 85,
                "max_c": 85,
                "location": "Sector 7 Line C",
                "status": "OPERATIONAL",
            },
        ],
        "line_status": "RUNNING",
        "lineStatus": "RUNNING",
        "metrics": [],
    }

    if recent_records:
        serialized_metrics = TelemetrySerializer(recent_records, many=True).data
        payload["metrics"] = serialized_metrics
        for record in recent_records:
            m_name = record.metric_name
            val = record.value
            if m_name == "congestion_index":
                payload["traffic_congestion"] = val
                payload["trafficCongestion"] = val
                payload["trafficCongestionPercent"] = val
                payload["traffic_congestion_percent"] = val
            elif m_name == "power_kw":
                payload["net_generation"] = val
                payload["netGeneration"] = val
                payload["totalPowerMW"] = val
                payload["total_power_mw"] = val
            elif m_name == "pressure":
                payload["water_pressure"] = val
                payload["waterPressure"] = val
                payload["waterPressurePsi"] = val
                payload["water_pressure_psi"] = val

    return payload


@api_view(["GET"])
@permission_classes([AllowAny])
def latest_telemetry(request):
    """
    DRF @api_view(['GET']) endpoint configured for 1-second interval polling.
    Pulls the latest telemetry snapshot from Redis cache or constructs a composite metrics
    payload from database fallback.
    """
    redis_client = get_redis_client()
    cached_payload = None

    if redis_client:
        try:
            # Check Redis cache keys for latest snapshot or reading
            for key in ["telemetry:latest", "latest_telemetry", "telemetry:broadcast"]:
                raw_val = redis_client.get(key)
                if raw_val:
                    try:
                        cached_payload = json.loads(raw_val)
                        break
                    except json.JSONDecodeError:
                        cached_payload = raw_val
                        break
        except Exception:
            cached_payload = None

    if cached_payload is not None:
        resp_data = {
            "status": "success",
            "source": "redis",
            "data": cached_payload
        }
    else:
        # Fallback to DB query: construct composite payload with key city metrics & recent telemetry
        try:
            try:
                recent_records = list(Telemetry.objects.order_by("-time")[:20])
            except Exception:
                recent_records = []

            composite_data = build_composite_telemetry_payload(recent_records)

            resp_data = {
                "status": "success",
                "source": "database",
                "data": composite_data
            }
        except Exception as db_err:
            resp_data = {
                "status": "fallback",
                "source": "empty",
                "data": None,
                "detail": str(db_err)
            }

    response = Response(resp_data, status=status.HTTP_200_OK)

    # HTTP response headers optimized for continuous 1-second polling
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def list_nodes(request):
    """
    Endpoint to retrieve active smart-city nodes.
    """
    try:
        nodes = Node.objects.all()
        serializer = NodeSerializer(nodes, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_alerts(request):
    """
    Endpoint to retrieve active alerts.
    """
    try:
        alerts = Alert.objects.filter(resolved_at__isnull=True).order_by("-triggered_at")
        serializer = AlertSerializer(alerts, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
