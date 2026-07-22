import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Video, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity, 
  Radio, 
  Car, 
  ShieldAlert,
  Globe
} from 'lucide-react';
import { IntersectionData, TrafficCamera } from '../../types/dashboard';

interface TrafficMapProps {
  intersections: IntersectionData[];
  trafficCameras: TrafficCamera[];
  activeCameraId?: string;
  onSelectCamera?: (id: string) => void;
  signalMode?: 'AI_ADAPTIVE' | 'MANUAL' | 'EMERGENCY_CORRIDOR';
}

// Real geographical latitude/longitude anchors for smart city telemetry
const INTERSECTION_GEO: Record<string, { lat: number; lng: number; code: string }> = {
  'Central Hub Matrix': { lat: 37.7749, lng: -122.4194, code: 'INT-01' },
  'North Express Arterial': { lat: 37.7920, lng: -122.4100, code: 'INT-02' },
  'South Tech Corridor': { lat: 37.7580, lng: -122.4180, code: 'INT-03' },
  'East Industrial Grid': { lat: 37.7720, lng: -122.3900, code: 'INT-04' },
  'West Port Highway': { lat: 37.7780, lng: -122.4450, code: 'INT-05' },
};

const CAMERA_GEO: Record<string, { lat: number; lng: number }> = {
  'CAM-01': { lat: 37.7900, lng: -122.4080 },
  'CAM-02': { lat: 37.7755, lng: -122.4180 },
  'CAM-03': { lat: 37.7700, lng: -122.3940 },
  'CAM-04': { lat: 37.7790, lng: -122.4400 },
};

export const TrafficMap: React.FC<TrafficMapProps> = ({
  intersections,
  trafficCameras,
  activeCameraId,
  onSelectCamera,
  signalMode = 'AI_ADAPTIVE'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map view & tile settings
  const [mapType, setMapType] = useState<'osm' | 'satellite' | 'hybrid' | 'dark'>('osm');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIntersections, setShowIntersections] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showAVVectors, setShowAVVectors] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 13,
      minZoom: 3,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
    });

    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Invalidate size after DOM mount to ensure full tile rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'osm') {
      // OpenStreetMap Standard Free Tile Layer
      const osmTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
        { 
          maxZoom: 19, 
          noWrap: true,
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; OpenStreetMap contributors' 
        }
      );
      osmTile.addTo(map);
    } else if (mapType === 'satellite' || mapType === 'hybrid') {
      // Esri World Imagery Free Satellite Tiles
      const satelliteTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, noWrap: true, attribution: 'Esri World Imagery' }
      );
      satelliteTile.addTo(map);

      if (mapType === 'hybrid') {
        // Transportation & labels overlay
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, noWrap: true }
        ).addTo(map);
      }
    } else {
      // CartoDB Dark Matter free map tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png',
        { maxZoom: 19, noWrap: true, attribution: 'CartoDB' }
      ).addTo(map);
    }

    map.invalidateSize();
  }, [mapType]);

  // Update Markers & Overlays when telemetry or filters change
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Congestion Heatmap Polylines
    if (showHeatmap) {
      const nsColor = signalMode === 'EMERGENCY_CORRIDOR' ? '#ef4444' : '#10b981';
      const nsCorridor = L.polyline(
        [
          [37.7920, -122.4100],
          [37.7749, -122.4194],
          [37.7580, -122.4180]
        ],
        { color: nsColor, weight: 6, opacity: 0.85, dashArray: signalMode === 'EMERGENCY_CORRIDOR' ? '8, 8' : undefined }
      );
      layerGroup.addLayer(nsCorridor);

      const ewCorridor = L.polyline(
        [
          [37.7780, -122.4450],
          [37.7749, -122.4194],
          [37.7720, -122.3900]
        ],
        { color: '#f59e0b', weight: 6, opacity: 0.85 }
      );
      layerGroup.addLayer(ewCorridor);
    }

    // 2. Intersection Markers
    if (showIntersections) {
      intersections.forEach((int, idx) => {
        const fallback = { lat: 37.7749 + (idx * 0.01 - 0.02), lng: -122.4194 + (idx * 0.015 - 0.02), code: `INT-0${idx + 1}` };
        const geo = INTERSECTION_GEO[int.name] || fallback;

        const isCongested = int.congestion > 70;
        const statusColor = isCongested ? '#ef4444' : int.signalStatus === 'OPTIMIZED' ? '#10b981' : '#f59e0b';

        const customHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              background: rgba(15, 23, 42, 0.9); 
              border: 2px solid ${statusColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 0 10px ${statusColor};
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
            </div>
            <div style="
              position: absolute; 
              top: -20px; 
              white-space: nowrap; 
              background: rgba(0,0,0,0.85); 
              color: #f8fafc; 
              font-family: monospace; 
              font-size: 10px; 
              font-weight: bold;
              padding: 2px 6px; 
              border: 1px solid ${statusColor};
            ">
              ${int.name} (${int.congestion}%)
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-intersection-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([geo.lat, geo.lng], { icon });
        const popupContent = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px; color: #0f172a;">
            <strong style="color: #0284c7;">${int.name}</strong><br/>
            <span>THROUGHPUT: <strong>${int.throughput} V/min</strong></span><br/>
            <span>CONGESTION: <strong style="color: ${statusColor};">${int.congestion}%</strong></span><br/>
            <span>AV SHARE: <strong>${int.avDensity}%</strong></span><br/>
            <span>STATUS: <strong>${int.signalStatus}</strong></span>
          </div>
        `;
        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // 3. Traffic Camera Markers
    if (showCameras) {
      trafficCameras.forEach((cam, idx) => {
        const fallback = { lat: 37.7780 + (idx * 0.008), lng: -122.4100 + (idx * 0.01) };
        const geo = CAMERA_GEO[cam.id] || fallback;
        const isActive = activeCameraId === cam.id;

        const customHtml = `
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: ${isActive ? '#0284c7' : '#1e293b'}; 
            border: 2px solid ${isActive ? '#38bdf8' : '#64748b'}; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            color: white;
            font-size: 11px;
            cursor: pointer;
            box-shadow: ${isActive ? '0 0 12px #38bdf8' : 'none'};
          ">
            📷
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-camera-pin',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([geo.lat, geo.lng], { icon });
        marker.on('click', () => {
          if (onSelectCamera) onSelectCamera(cam.id);
        });

        const popupContent = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px; color: #0f172a;">
            <strong style="color: #0284c7;">${cam.id}</strong><br/>
            <span>LOCATION: ${cam.location}</span><br/>
            <span>STATUS: <strong style="color: #10b981;">${cam.status}</strong> (${cam.fps} FPS)</span><br/>
            <button id="cam-select-${cam.id}" style="
              margin-top: 6px; 
              width: 100%; 
              background: #0284c7; 
              color: white; 
              border: none; 
              padding: 4px; 
              font-family: monospace; 
              font-size: 10px; 
              font-weight: bold; 
              cursor: pointer;
            ">
              SELECT OPTICS FEED
            </button>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`cam-select-${cam.id}`);
          if (btn && onSelectCamera) {
            btn.onclick = () => onSelectCamera(cam.id);
          }
        });

        layerGroup.addLayer(marker);
      });
    }

    // 4. AV Patrol Vectors
    if (showAVVectors) {
      const avCoords: [number, number][] = [
        [37.7850, -122.4150],
        [37.7650, -122.4180],
        [37.7760, -122.4300],
        [37.7730, -122.3980]
      ];

      avCoords.forEach((coords) => {
        const circle = L.circleMarker(coords, {
          radius: 5,
          color: '#c084fc',
          fillColor: '#a855f7',
          fillOpacity: 0.9,
          weight: 2
        });
        layerGroup.addLayer(circle);
      });
    }

  }, [intersections, trafficCameras, activeCameraId, signalMode, showHeatmap, showIntersections, showCameras, showAVVectors]);

  // Zoom control helpers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetZoom = () => mapRef.current?.setView([37.7749, -122.4194], 13);

  return (
    <div className="p-4 bg-surface border border-outline-variant space-y-3 font-mono relative overflow-hidden">
      {/* Header & Satellite Viewport Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-outline-variant/60 pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-primary animate-spin-slow" />
          <div>
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase">
              HIGH-RESOLUTION SATELLITE TRANSIT TELEMETRY MAP
            </h2>
            <p className="text-[10px] text-outline">
              Esri World Imagery satellite map (100% Free - Zero API key requirements)
            </p>
          </div>
        </div>

        {/* Viewport Controls & Map Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* OpenStreetMap vs Satellite vs Hybrid vs Dark Toggle */}
          <div className="flex items-center bg-surface-container-low border border-outline-variant p-1 space-x-1">
            <button
              onClick={() => setMapType('osm')}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                mapType === 'osm' 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-transparent text-outline border-transparent hover:text-on-surface'
              }`}
            >
              OPENSTREETMAP
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                mapType === 'satellite' 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-transparent text-outline border-transparent hover:text-on-surface'
              }`}
            >
              SATELLITE
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                mapType === 'hybrid' 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-transparent text-outline border-transparent hover:text-on-surface'
              }`}
            >
              HYBRID
            </button>
            <button
              onClick={() => setMapType('dark')}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                mapType === 'dark' 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-transparent text-outline border-transparent hover:text-on-surface'
              }`}
            >
              VECTOR DARK
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-surface-container-low border border-outline-variant p-1 space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors border-l border-outline-variant ml-1 pl-1.5"
              title="Reset View"
              aria-label="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Layer Filter Controls */}
          <div className="flex items-center space-x-1 bg-surface-container-low border border-outline-variant p-1">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                showHeatmap 
                  ? 'bg-amber-950/80 border-amber-500 text-amber-400' 
                  : 'bg-transparent border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>HEATMAP</span>
            </button>

            <button
              onClick={() => setShowIntersections(!showIntersections)}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                showIntersections 
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' 
                  : 'bg-transparent border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>NODES ({intersections.length})</span>
            </button>

            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                showCameras 
                  ? 'bg-sky-950/80 border-sky-500 text-sky-400' 
                  : 'bg-transparent border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>CAMERAS ({trafficCameras.length})</span>
            </button>

            <button
              onClick={() => setShowAVVectors(!showAVVectors)}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                showAVVectors 
                  ? 'bg-purple-950/80 border-purple-400 text-purple-300' 
                  : 'bg-transparent border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>AV PATROL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Satellite Map Container */}
      <div className="relative aspect-[16/9] w-full bg-black border-2 border-outline-variant overflow-hidden group">
        {/* Signal Mode Active Header HUD Overlay */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-2 bg-black/80 px-2.5 py-1 border border-outline-variant text-[10px]">
          <span className="text-outline">MODE:</span>
          <span className={`font-bold ${
            signalMode === 'EMERGENCY_CORRIDOR' ? 'text-red-500 animate-pulse' :
            signalMode === 'MANUAL' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {signalMode}
          </span>
          {signalMode === 'EMERGENCY_CORRIDOR' && (
            <span className="text-red-400 font-bold flex items-center space-x-1 ml-2">
              <ShieldAlert className="w-3 h-3" />
              <span>GREEN WAVE ACTIVE</span>
            </span>
          )}
        </div>

        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-outline pt-1 border-t border-outline-variant/40">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OPTIMIZED NODE</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>MODERATE TRAFFIC</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>CONGESTED BOTTLE-NECK</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>LIVE TRAFFIC CAMERA</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>AV PATROL VECTOR</span>
          </span>
        </div>
        <div className="text-right">
          <span>TILE SOURCE: ESRI WORLD IMAGERY | 0$ API COST</span>
        </div>
      </div>
    </div>
  );
};
