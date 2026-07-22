# backend/greenpulse_app/ui_manifest.py

GREENPULSE_UI_MANIFEST = {
    "OVERVIEW": {
        "title": "Core Command & Telemetry",
        "description": "Primary high-level situational awareness hub.",
        "components": [
            {"id": "city_health_card", "label": "City Health Index", "metric": "city_health_index", "type": "Gauge / Percentage"},
            {"id": "net_generation_card", "label": "Net Power Generation", "metric": "net_generation", "type": "Stat Display (MW)"},
            {"id": "traffic_congestion_card", "label": "Traffic Congestion Level", "metric": "traffic_congestion", "type": "Stat Display (%)"},
            {"id": "air_quality_card", "label": "Air Quality Index (AQI)", "metric": "air_quality_index", "type": "Badge / Value"},
            {"id": "grid_frequency_oscillation", "label": "Synchronous Frequency Waveform", "type": "Live Oscilloscope Chart"},
            {"id": "sector_diagnostics", "label": "Sector Diagnostics Panel", "metrics": ["water_pressure", "seismic_activity"], "type": "Sub-system Feed"},
        ],
    },
    "TRAFFIC": {
        "title": "AI Signal Matrix & AV Routing",
        "description": "Urban mobility, intersection signaling, and autonomous vehicle corridors.",
        "components": [
            {"id": "intersection_grid", "label": "Managed Intersections Matrix", "type": "Interactive Node Grid"},
            {"id": "av_corridor_feed", "label": "Autonomous Vehicle Corridor Stream", "type": "Live Telemetry Feed"},
            {"id": "congestion_heatmap", "label": "Sector Delay Reduction Tracker", "type": "Time-Series Chart"},
        ],
    },
    "ENERGY": {
        "title": "Smart Energy Grid & Load Shedding",
        "description": "High-voltage distribution, battery reserves, and emergency load management.",
        "components": [
            {"id": "substation_matrix", "label": "Substation Health & Load Matrix", "type": "Node Table"},
            {"id": "generation_breakdown_chart", "label": "Power Flow Breakdown", "type": "Bar / Donut Chart (Solar, Wind, Hydro)"},
            {"id": "automated_load_shed_control", "label": "Automated Load Shedding Toggle", "action": "trigger_load_shedding", "type": "Action Switch"},
            {"id": "battery_reserve_override", "label": "Inject Battery Reserve Power", "action": "inject_battery_reserve", "type": "Action Button"},
        ],
    },
    "INFRASTRUCTURE": {
        "title": "Structural Integrity & Environmental Sensor Mesh",
        "description": "Monitoring physical infrastructure, seismic activity, and municipal water grids.",
        "components": [
            {"id": "structural_nodes_table", "label": "Key Structural Strain Nodes", "type": "Data Table"},
            {"id": "registered_sensors_mesh", "label": "Registered Sensor Nodes", "type": "Active Node Status Table"},
            {"id": "seismic_vibration_feed", "label": "Seismic Stability Telemetry", "type": "Line Chart"},
        ],
    },
    "SAFETY": {
        "title": "Public Safety & Dispatch Surveillance",
        "description": "Emergency dispatch queue, surveillance feeds, and citywide alert overrides.",
        "components": [
            {"id": "active_incidents_queue", "label": "Active Incidents Dispatch Queue", "type": "Severity List"},
            {"id": "emergency_override_button", "label": "Emergency Override Control", "action": "execute_emergency_override", "type": "Action Button"},
        ],
    },
    "INDUSTRIAL": {
        "title": "Industrial Precision & Heavy Automation",
        "description": "Factory assembly line monitoring, robotic yield, and motor vibration diagnostics.",
        "components": [
            {"id": "robotic_cells_grid", "label": "Robotic Assembly Cells", "type": "Status Card Grid"},
            {"id": "yield_rate_tracker", "label": "Manufacturing Yield Percentage", "type": "Gauge"},
            {"id": "vibration_amplitude_chart", "label": "Motor Strain & Vibration Amplitude", "type": "Oscilloscope / Line Chart"},
        ],
    },
}
