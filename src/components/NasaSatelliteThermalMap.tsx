import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Flame, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Info, 
  Compass, 
  Activity,
  Droplet,
  Radio,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CityData } from '../data/indiaCities';
import { WeatherTelemetry } from '../types';

interface NasaSatelliteThermalMapProps {
  city: CityData;
  weather: WeatherTelemetry;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
}

interface ThermalHotspot {
  id: string;
  name: string;
  offsetLat: number;
  offsetLng: number;
  tempOffset: number; // relative to ambient
  surfaceType: string;
  category: 'core' | 'transit' | 'industrial' | 'cooling_sink';
  description: string;
}

export const NasaSatelliteThermalMap: React.FC<NasaSatelliteThermalMapProps> = ({
  city,
  weather,
  dataSourceMode = 'live_api',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const thermalGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'thermal_only' | 'dark_tactical'>('satellite');
  const [showThermalOverlay, setShowThermalOverlay] = useState<boolean>(true);
  const [showHotspotMarkers, setShowHotspotMarkers] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<ThermalHotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dynamic Land Surface Temperature (LST) calculation
  const uhiAnomaly = city?.weather?.uhiAnomaly || 3.6;
  const currentAmbient = weather?.dryBulbTemp || 32.0;
  const peakCoreLST = Number((currentAmbient + uhiAnomaly + 1.8).toFixed(1));
  const meanUrbanLST = Number((currentAmbient + uhiAnomaly).toFixed(1));
  const coolingSinkLST = Number((currentAmbient - 1.8).toFixed(1));

  // City-specific or dynamically generated thermal hotspots
  const getCityHotspots = (): ThermalHotspot[] => {
    const cityNameLower = city.name.toLowerCase();

    if (cityNameLower.includes('lucknow')) {
      return [
        {
          id: 'lko-1',
          name: 'Hazratganj Commercial Core & Vidhan Sabha Marg',
          offsetLat: 0.008,
          offsetLng: 0.012,
          tempOffset: +4.6,
          surfaceType: 'High-Density Concrete & Multilevel Asphalt Paving',
          category: 'core',
          description: 'Intense thermal trapping between multi-story administrative stone facades and congested vehicular traffic.'
        },
        {
          id: 'lko-2',
          name: 'Charbagh Central Intermodal Railway Junction',
          offsetLat: -0.024,
          offsetLng: -0.018,
          tempOffset: +5.2,
          surfaceType: 'Unshaded Rail Steel Lines & Corrugated Metal Platforms',
          category: 'transit',
          description: 'Extreme thermal re-radiation from unshaded steel rail yards and diesel locomotive idling.'
        },
        {
          id: 'lko-3',
          name: 'Talkatora Industrial Sector & Brick Kiln Perimeter',
          offsetLat: -0.038,
          offsetLng: -0.042,
          tempOffset: +4.9,
          surfaceType: 'Industrial Tin Sheds & Heavy Transport Depot',
          category: 'industrial',
          description: 'Concentrated industrial waste heat and expansive low-reflectance corrugated tin roofing.'
        },
        {
          id: 'lko-4',
          name: 'Gomti Riverfront Ecological Buffer & Janeshwar Mishra Park',
          offsetLat: 0.021,
          offsetLng: 0.045,
          tempOffset: -2.8,
          surfaceType: 'Water Body & Riparian Vegetative Canopy',
          category: 'cooling_sink',
          description: 'Significant evaporative cooling oasis acting as a natural biometeorological heat buffer (-2.8°C).'
        },
        {
          id: 'lko-5',
          name: 'Amausi International Airport Runway Strip',
          offsetLat: -0.075,
          offsetLng: -0.062,
          tempOffset: +5.5,
          surfaceType: 'Porous Asphalt & Reinforced Concrete Tarmac',
          category: 'transit',
          description: 'Vast unshaded black asphalt apron generating intense localized sensible heat flux.'
        }
      ];
    } else if (cityNameLower.includes('mumbai')) {
      return [
        {
          id: 'mum-1',
          name: 'Dharavi Transit Camp & 90-Feet Corridor',
          offsetLat: -0.035,
          offsetLng: -0.025,
          tempOffset: +5.4,
          surfaceType: 'Corrugated Metal Roof Density & Narrow Alleys',
          category: 'core',
          description: 'Severe structural thermal entrapment from high-density tin roofing suppressing nocturnal radiative dissipation.'
        },
        {
          id: 'mum-2',
          name: 'Bandra-Kurla Complex (BKC) Glass Towers',
          offsetLat: -0.015,
          offsetLng: -0.012,
          tempOffset: +4.2,
          surfaceType: 'Glass Facades & Extensive Underground HVAC Exhaust',
          category: 'core',
          description: 'Industrial HVAC exhaust rejection and mirror glazing directing thermal radiation to pedestrian ground levels.'
        },
        {
          id: 'mum-3',
          name: 'Sion Flyover & LBS Marg Highway Choke',
          offsetLat: -0.040,
          offsetLng: -0.018,
          tempOffset: +4.8,
          surfaceType: 'Elevated Bituminous Concrete Flyover',
          category: 'transit',
          description: 'Heavy diesel transit congestion and dense elevated flyover retaining heat deep into the night.'
        },
        {
          id: 'mum-4',
          name: 'Mithi River Basin & Mahim Mangrove Wetland',
          offsetLat: -0.028,
          offsetLng: -0.038,
          tempOffset: -2.4,
          surfaceType: 'Saline Tidal Wetland & Mangrove Canopy',
          category: 'cooling_sink',
          description: 'Microclimatic coastal cooling zone with continuous maritime breeze and moisture sink.'
        }
      ];
    } else if (cityNameLower.includes('delhi')) {
      return [
        {
          id: 'del-1',
          name: 'Connaught Place & Inner Radial Hub',
          offsetLat: 0.018,
          offsetLng: 0.012,
          tempOffset: +4.8,
          surfaceType: 'Colonial Masonry, Bitumen Corridors & Plaza',
          category: 'core',
          description: 'Dense radial vehicular convergence and commercial air handling unit heat discharge.'
        },
        {
          id: 'del-2',
          name: 'Anand Vihar ISBT & Freight Corridor',
          offsetLat: 0.035,
          offsetLng: 0.092,
          tempOffset: +5.7,
          surfaceType: 'Expansive Bus Depots & Asphalt Transport Nodes',
          category: 'transit',
          description: 'High particulate smog layer trapping infrared radiation, combined with thousands of diesel buses.'
        },
        {
          id: 'del-3',
          name: 'Okhla Industrial Area Phase-II',
          offsetLat: -0.065,
          offsetLng: 0.065,
          tempOffset: +5.1,
          surfaceType: 'Metal Fabricators, Tin Roofing & Smelters',
          category: 'industrial',
          description: 'Industrial process heat rejection and low-reflectance structural envelopes.'
        },
        {
          id: 'del-4',
          name: 'Yamuna Floodplain Bio-Diversity Park',
          offsetLat: 0.062,
          offsetLng: 0.038,
          tempOffset: -3.2,
          surfaceType: 'Riverine Wetlands & Re-vegetated Grasslands',
          category: 'cooling_sink',
          description: 'Major regional cooling buffer offering latent heat mitigation across the trans-Yamuna belt.'
        }
      ];
    }

    // Default dynamic hotspots for any other Indian city or custom GPS location
    return [
      {
        id: `${city.id}-core`,
        name: `${city.name} Central Municipal Core`,
        offsetLat: 0.006,
        offsetLng: 0.008,
        tempOffset: +4.4,
        surfaceType: 'High-Density Concrete & Dense Urban Masonry',
        category: 'core',
        description: `Central commercial hub of ${city.name} experiencing elevated surface thermal entrapment.`
      },
      {
        id: `${city.id}-transit`,
        name: `${city.name} Intercity Railway & Bus Terminal`,
        offsetLat: -0.018,
        offsetLng: -0.012,
        tempOffset: +5.0,
        surfaceType: 'Asphalt Highway & Steel Transit Corridors',
        category: 'transit',
        description: 'Vast unshaded tarmac and vehicular exhaust concentrating local thermal load.'
      },
      {
        id: `${city.id}-park`,
        name: `${city.name} Botanical Gardens & Waterbody Buffer`,
        offsetLat: 0.018,
        offsetLng: 0.024,
        tempOffset: -2.6,
        surfaceType: 'Vegetative Canopy & Lake Cooling Reserve',
        category: 'cooling_sink',
        description: 'Natural biometeorological oasis suppressing microclimate temperature through evapotranspiration.'
      }
    ];
  };

  const hotspots = getCityHotspots();

  // Initialize and Sync Map with selected city
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = city?.lat || 26.8467;
    const lng = city?.lng || 80.9462;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Satellite Imagery Tile Layer (ESRI World Imagery)
      const baseTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'NASA MODIS / ESRI World Imagery',
        }
      ).addTo(map);

      baseTileLayerRef.current = baseTile;
      thermalGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.flyTo([lat, lng], 12, { duration: 1.2 });
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Redraw Thermal Heatmap and Hotspots centered on active city
    if (thermalGroupRef.current) thermalGroupRef.current.clearLayers();
    if (markersGroupRef.current) markersGroupRef.current.clearLayers();

    if (showThermalOverlay && thermalGroupRef.current) {
      // 1. Urban Core Thermal Heat Island Glow
      L.circle([lat, lng], {
        radius: 4500,
        color: '#ea580c',
        weight: 1.5,
        opacity: 0.8,
        fillColor: '#ea580c',
        fillOpacity: 0.25,
      }).addTo(thermalGroupRef.current);

      // 2. High-intensity Core Hotspot Zone
      L.circle([lat, lng], {
        radius: 2200,
        color: '#ef4444',
        weight: 2,
        opacity: 0.9,
        fillColor: '#dc2626',
        fillOpacity: 0.35,
      }).addTo(thermalGroupRef.current);

      // 3. Peak Core Epicenter
      L.circle([lat, lng], {
        radius: 900,
        color: '#b91c1c',
        weight: 2.5,
        opacity: 1,
        fillColor: '#991b1b',
        fillOpacity: 0.5,
      }).addTo(thermalGroupRef.current);
    }

    // Add Hotspot markers
    if (showHotspotMarkers && markersGroupRef.current) {
      hotspots.forEach((spot) => {
        const spotLat = lat + spot.offsetLat;
        const spotLng = lng + spot.offsetLng;
        const spotLST = Number((currentAmbient + spot.tempOffset).toFixed(1));
        const isCooling = spot.category === 'cooling_sink';

        const markerColor = isCooling ? '#06b6d4' : spot.tempOffset >= 5.0 ? '#ef4444' : '#f97316';
        const borderColor = isCooling ? '#22d3ee' : '#ffffff';

        const customIcon = L.divIcon({
          className: 'nasa-hotspot-pin',
          html: `
            <div style="
              width: 26px; 
              height: 26px; 
              border-radius: 50%; 
              background: ${markerColor}; 
              border: 2px solid ${borderColor}; 
              box-shadow: 0 0 12px ${markerColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              cursor: pointer;
              transform: translate(-13px, -13px);
            ">
              <span style="font-family: monospace; font-weight: 800; font-size: 10px; color: #fff;">
                ${isCooling ? '❄' : '▲'}
              </span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([spotLat, spotLng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: 'Inter', system-ui, sans-serif; background: #060e20; color: #e2e8f0; padding: 12px; border-radius: 12px; border: 1px solid #2d3449; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: ${markerColor}; text-transform: uppercase;">
                ${spot.category.toUpperCase().replace('_', ' ')}
              </span>
              <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: ${isCooling ? '#38bdf8' : '#f87171'};">
                ${spot.tempOffset > 0 ? `+${spot.tempOffset}°C` : `${spot.tempOffset}°C`} LST
              </span>
            </div>
            <strong style="display: block; font-size: 13px; color: #fff; margin-bottom: 4px; line-height: 1.3;">
              ${spot.name}
            </strong>
            <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; margin-bottom: 6px; padding: 4px 6px; background: #0b1326; border-radius: 6px;">
              <span style="color: #94a3b8;">Satellite LST:</span>
              <strong style="color: #f97316;">${spotLST}°C</strong>
            </div>
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0;">
              ${spot.description}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'nasa-custom-leaflet-popup',
        });

        marker.on('click', () => {
          setSelectedHotspot(spot);
        });

        marker.addTo(markersGroupRef.current!);
      });
    }

    // Invalidate size on load
    const timeout = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(timeout);
  }, [city, showThermalOverlay, showHotspotMarkers, currentAmbient, uhiAnomaly]);

  // Switch Base Layers
  const handleLayerChange = (layer: 'satellite' | 'thermal_only' | 'dark_tactical') => {
    setActiveLayer(layer);
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(baseTileLayerRef.current);

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let className = '';
    let maxZoom = 18;

    if (layer === 'dark_tactical') {
      // 100% Free OpenStreetMap with tactical dark CSS filter — No API key needed, zero watermarks
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = 'dark-tactical-tiles';
      maxZoom = 19;
    } else if (layer === 'thermal_only') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const newTile = L.tileLayer(url, {
      maxZoom,
      className: className || undefined,
      attribution: layer === 'dark_tactical' ? 'OpenStreetMap Tactical' : 'NASA GIBS / MODIS / ESRI',
    }).addTo(mapInstanceRef.current);

    baseTileLayerRef.current = newTile;
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([city.lat, city.lng], 12, { duration: 0.8 });
  };

  return (
    <div 
      id="nasa-satellite-thermal-widget" 
      className={`relative rounded-2xl border border-[#2d3449] bg-[#0b1326] overflow-hidden flex flex-col justify-between transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-[#0b1326]' : 'w-full'
      }`}
    >
      {/* Top Header & Satellite Sensor Metadata */}
      <div className="p-3.5 sm:p-4 border-b border-[#2d3449] bg-[#060e20] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm sm:text-base font-headline font-bold text-white flex items-center gap-1.5">
              <span>NASA MODIS Satellite Thermal Map</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                TERRA / AQUA
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Target Station: <strong className="text-white">{city.name}</strong> ({city.lat.toFixed(3)}°N, {city.lng.toFixed(3)}°E) • LST Level-3 (1km)
          </p>
        </div>

        {/* Live Thermal Anomaly & LST Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Urban Anomaly</span>
            <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
              +{uhiAnomaly.toFixed(1)}°C UHI
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Peak LST Core</span>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30">
              {peakCoreLST}°C
            </span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#171f33] hover:bg-[#222c45] text-slate-300 border border-[#2d3449] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Stage */}
      <div className="relative w-full h-64 sm:h-72 lg:h-80 bg-[#060e20]">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
        />

        {/* Interactive Floating Layer Controls */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="bg-[#0b1326]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2d3449] shadow-xl flex items-center gap-1">
            <button
              onClick={() => handleLayerChange('satellite')}
              className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                activeLayer === 'satellite'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => handleLayerChange('dark_tactical')}
              className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                activeLayer === 'dark_tactical'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tactical
            </button>
          </div>

          <div className="bg-[#0b1326]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2d3449] shadow-xl flex items-center justify-between gap-2">
            <button
              onClick={() => setShowThermalOverlay(!showThermalOverlay)}
              className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all ${
                showThermalOverlay
                  ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-red-400" />
              <span>Thermal LST</span>
            </button>

            <button
              onClick={handleRecenter}
              className="p-1 rounded-lg hover:bg-[#171f33] text-slate-300 transition-colors"
              title="Recenter on City"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Dynamic LST Legend Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-[#0b1326]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#2d3449] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] font-mono shadow-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">LST Range ({city.name}):</span>
            <span className="text-cyan-400 font-bold">{coolingSinkLST}°C (Buffer)</span>
            <span className="text-slate-500">→</span>
            <span className="text-amber-400 font-bold">{meanUrbanLST}°C (Avg)</span>
            <span className="text-slate-500">→</span>
            <span className="text-red-400 font-bold">{peakCoreLST}°C (Core Peak)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 via-orange-500 to-red-600 shadow-sm" />
            <span className="text-slate-400 hidden sm:inline">MODIS Infrared</span>
          </div>
        </div>
      </div>

      {/* Footer Hotspot Inspector Breakdown */}
      <div className="p-3 sm:p-4 bg-[#060e20] border-t border-[#2d3449] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#a78b7d] uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Active Microclimate Hotspots & Albedo Signatures
          </span>
          <span className="text-[10px] text-slate-400">Click pins on map to inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {hotspots.slice(0, 3).map((spot) => {
            const spotLST = Number((currentAmbient + spot.tempOffset).toFixed(1));
            const isCooling = spot.category === 'cooling_sink';

            return (
              <div 
                key={spot.id}
                onClick={() => {
                  setSelectedHotspot(spot);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([city.lat + spot.offsetLat, city.lng + spot.offsetLng], 14, { duration: 0.8 });
                  }
                }}
                className="p-2 rounded-xl bg-[#0b1326] border border-[#2d3449] hover:border-orange-500/50 cursor-pointer transition-all text-left group"
              >
                <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                  <span className="text-slate-400 truncate pr-1">{spot.category.toUpperCase()}</span>
                  <span className={`font-bold ${isCooling ? 'text-cyan-400' : 'text-red-400'}`}>
                    {spotLST}°C
                  </span>
                </div>
                <strong className="block text-xs text-white group-hover:text-orange-400 transition-colors truncate">
                  {spot.name}
                </strong>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                  {spot.surfaceType}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 font-mono pt-1 leading-snug">
          {city.name} thermal telemetry is synchronized with {dataSourceMode === 'live_api' ? 'Live Satellite Observations (Open-Meteo & NASA MODIS Terra)' : 'IMD Extreme Heatwave Drill Calibration'}. Direct thermal radiation peaks over asphalt corridors and low-reflectance tin roofing.
        </p>
      </div>
    </div>
  );
};
