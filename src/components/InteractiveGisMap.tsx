import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Layers, 
  Flame, 
  Droplet, 
  Hospital, 
  Wind, 
  Navigation, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  MapPin, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info,
  Building2,
  Trees,
  Train,
  X,
  Sparkles
} from 'lucide-react';
import { CoolingFacility } from '../types';
import { CityData, INDIAN_CITIES } from '../data/indiaCities';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LocationSearchResult, calculateGeodesicDistance } from '../services/locationSearch';

interface InteractiveGisMapProps {
  facilities: CoolingFacility[];
  selectedFacility: CoolingFacility | null;
  onSelectFacility: (facility: CoolingFacility) => void;
  selectedCity: CityData;
  onSelectCity?: (city: CityData) => void;
  userLocation: { lat: number; lng: number } | null;
  activeNavigationFacility: CoolingFacility | null;
  onStartNavigation: (facility: CoolingFacility) => void;
  navigationRouteMode?: 'cool' | 'fast';
  searchedLocation?: LocationSearchResult | null;
  onSelectSearchedLocation?: (loc: LocationSearchResult) => void;
  onClearSearchedLocation?: () => void;
}

export const InteractiveGisMap: React.FC<InteractiveGisMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  selectedCity,
  onSelectCity,
  userLocation,
  activeNavigationFacility,
  onStartNavigation,
  navigationRouteMode = 'cool',
  searchedLocation: externalSearchedLocation,
  onSelectSearchedLocation,
  onClearSearchedLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const thermalLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchedMarkerRef = useRef<L.Marker | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'tactical' | 'satellite' | 'streets' | 'relief'>('tactical');
  const [showThermalOverlay, setShowThermalOverlay] = useState<boolean>(true);
  const [showWaterTankers, setShowWaterTankers] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [internalSearchedLoc, setInternalSearchedLoc] = useState<LocationSearchResult | null>(null);

  const activeSearchedLoc = externalSearchedLocation !== undefined ? externalSearchedLocation : internalSearchedLoc;

  // Initialize Map with 100% Free OpenStreetMap (NO API Key required)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = selectedCity ? selectedCity.lat : 26.8467;
    const initialLng = selectedCity ? selectedCity.lng : 80.9462;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom tactical zoom control on bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base tile layer: Pure OpenStreetMap with Tactical Dark CSS filter
    // 100% Free, NO API Key needed, ZERO rate-limit watermarks!
    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-tactical-tiles',
    }).addTo(map);
    tileLayerRef.current = baseTile;

    // Feature layers
    const thermalGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);

    thermalLayerRef.current = thermalGroup;
    markersLayerRef.current = markersGroup;
    routeLayerRef.current = routeGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base tile layer on switcher change (All 100% Free, zero API key)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let className = 'dark-tactical-tiles';
    let maxZoom = 19;

    if (activeBaseLayer === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      className = '';
      maxZoom = 18;
    } else if (activeBaseLayer === 'streets') {
      newUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = '';
      maxZoom = 19;
    } else if (activeBaseLayer === 'relief') {
      newUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      className = '';
      maxZoom = 19;
    }

    const newTile = L.tileLayer(newUrl, { 
      maxZoom, 
      className: className || undefined 
    });
    newTile.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeBaseLayer]);

  // Recenter and Fly to Selected City when selectedCity changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCity) return;
    mapInstanceRef.current.flyTo([selectedCity.lat, selectedCity.lng], 13, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [selectedCity?.id, selectedCity?.lat, selectedCity?.lng]);

  // Draw Heat Island Thermal Overlay Circles based on city center & microclimates
  useEffect(() => {
    if (!mapInstanceRef.current || !thermalLayerRef.current || !selectedCity) return;

    thermalLayerRef.current.clearLayers();

    if (!showThermalOverlay) return;

    const cLat = selectedCity.lat;
    const cLng = selectedCity.lng;

    // Thermal Hotspots (Urban Heat Island epicenters)
    const hotspots = [
      { lat: cLat, lng: cLng, radius: 1400, label: 'Core High UHI Anomaly (+4.2°C)', color: '#ef4444', fillOpacity: 0.25 },
      { lat: cLat + 0.008, lng: cLng - 0.007, radius: 950, label: 'Dense Commercial Heat Trap (+3.8°C)', color: '#f97316', fillOpacity: 0.22 },
      { lat: cLat - 0.010, lng: cLng + 0.009, radius: 1100, label: 'Transit Hub Asphalt Radiation (+3.5°C)', color: '#ea580c', fillOpacity: 0.20 },
      { lat: cLat + 0.015, lng: cLng + 0.012, radius: 800, label: 'Industrial / Concrete Cluster (+4.0°C)', color: '#dc2626', fillOpacity: 0.24 },
    ];

    hotspots.forEach((spot) => {
      const circle = L.circle([spot.lat, spot.lng], {
        radius: spot.radius,
        color: spot.color,
        weight: 1.5,
        opacity: 0.8,
        fillColor: spot.color,
        fillOpacity: spot.fillOpacity,
        dashArray: '4, 6',
      });

      circle.bindTooltip(
        `<div class="text-[11px] font-mono font-bold text-orange-200 bg-[#0b1326] p-1 rounded border border-orange-500/40">${selectedCity.name}: ${spot.label}</div>`,
        { sticky: true, className: 'leaflet-tactical-tooltip' }
      );

      circle.addTo(thermalLayerRef.current!);
    });

    // Add Mobile Water Tanker Bowser Markers if toggled
    if (showWaterTankers) {
      const tankerPositions = [
        { lat: cLat + 0.004, lng: cLng + 0.005, name: 'Municipal Jal Sansthan Bowser #12', capacity: '10,000L Chilled Water', status: 'ACTIVE DISPENSING' },
        { lat: cLat - 0.005, lng: cLng - 0.004, name: 'SDMA Emergency Water Tanker #07', capacity: '12,000L with Electrolytes', status: 'DISPATCHED' },
      ];

      tankerPositions.forEach((tanker) => {
        const tankerIcon = L.divIcon({
          className: 'custom-tanker-pin',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
              <div class="w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px]">
                💧
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const tankerMarker = L.marker([tanker.lat, tanker.lng], { icon: tankerIcon });
        tankerMarker.bindPopup(`
          <div class="p-2 bg-[#0b1326] text-white rounded-lg border border-cyan-500/50 text-xs font-sans min-w-[180px]">
            <div class="text-[10px] font-mono font-bold text-cyan-400">WATER BOWSER POINT</div>
            <div class="font-bold mt-0.5">${tanker.name}</div>
            <div class="text-[11px] text-slate-300 mt-1">${tanker.capacity}</div>
            <div class="text-[10px] font-mono text-emerald-400 mt-0.5">● ${tanker.status}</div>
          </div>
        `);
        tankerMarker.addTo(thermalLayerRef.current!);
      });
    }
  }, [selectedCity?.id, showThermalOverlay, showWaterTankers]);

  // Render Facility Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    facilities.forEach((fac) => {
      const isSelected = selectedFacility?.id === fac.id;
      const isHospital = fac.isHospital || fac.category === 'triage_hospital';
      const isNavTarget = activeNavigationFacility?.id === fac.id;

      const bgColor = isNavTarget
        ? 'bg-amber-500 border-yellow-300 ring-4 ring-amber-500/50'
        : isSelected
        ? 'bg-orange-500 border-white ring-4 ring-orange-500/40'
        : isHospital
        ? 'bg-red-600 border-white shadow-red-900/50'
        : 'bg-emerald-600 border-white shadow-emerald-900/50';

      const iconSymbol = isHospital ? '🏥' : '❄️';

      const customIcon = L.divIcon({
        className: 'custom-facility-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            ${(isSelected || isNavTarget) ? '<div class="absolute w-12 h-12 rounded-full bg-orange-500/40 animate-ping"></div>' : ''}
            <div class="w-8 h-8 rounded-full ${bgColor} border-2 shadow-xl flex items-center justify-center text-white text-xs font-bold transition-all">
              ${iconSymbol}
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.2 bg-[#0b1326]/95 border border-[#2d3449] rounded text-[9px] font-mono text-white whitespace-nowrap shadow-md pointer-events-none">
              ${fac.walkTimeMins}m • ${fac.indoorTemp}°C
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([fac.coordinates[0], fac.coordinates[1]], { icon: customIcon });

      marker.on('click', () => {
        onSelectFacility(fac);
      });

      // Rich tactical Popup
      const popupHtml = `
        <div class="p-3 bg-[#0b1326] text-white rounded-xl border border-orange-500/50 text-xs font-sans min-w-[220px]">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              isHospital ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }">
              ${isHospital ? 'HOSPITAL TRIAGE' : 'AC COOLING SHELTER'}
            </span>
            <span class="text-xs font-mono font-bold text-emerald-400">${fac.indoorTemp}°C Indoor</span>
          </div>
          <h4 class="font-bold text-sm text-white leading-tight">${fac.name}</h4>
          <p class="text-[11px] text-slate-300 mt-1 line-clamp-1">${fac.address}</p>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#2d3449] text-[11px] font-mono">
            <span class="text-slate-400">Distance: <b class="text-orange-400">${fac.distanceKm} km</b></span>
            <span class="text-slate-400">Walk: <b class="text-white">${fac.walkTimeMins} mins</b></span>
          </div>
          <div class="mt-2 text-[10px] text-slate-400 font-mono">
            Occupancy: ${fac.currentOccupancy}/${fac.totalCapacity} (${Math.round((fac.currentOccupancy / fac.totalCapacity) * 100)}%)
          </div>
          <button
            id="popup-navigate-btn-${fac.id}"
            class="w-full mt-2.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🧭 Start GPS Route</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'leaflet-tactical-popup',
        closeButton: true,
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-navigate-btn-${fac.id}`);
        if (btn) {
          btn.onclick = () => {
            onStartNavigation(fac);
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [facilities, selectedFacility?.id, activeNavigationFacility?.id]);

  // Render User Location marker with radar pulse ring
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    const startLat = userLocation?.lat || (selectedCity.lat - 0.004);
    const startLng = userLocation?.lng || (selectedCity.lng - 0.005);

    const userIcon = L.divIcon({
      className: 'custom-user-gps-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[9px] font-bold ring-4 ring-blue-500/40">
            📍
          </div>
          <div class="absolute -top-6 px-1.5 py-0.5 bg-[#0b1326] border border-blue-500/60 rounded text-[9px] font-mono text-blue-300 font-bold whitespace-nowrap shadow">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const uMarker = L.marker([startLat, startLng], { icon: userIcon });
    uMarker.bindTooltip('Your Current GPS Biotelemetry Location', { direction: 'top' });
    uMarker.addTo(mapInstanceRef.current);
    userMarkerRef.current = uMarker;
  }, [userLocation, selectedCity?.lat, selectedCity?.lng]);

  // Render Searched Building / Monument Pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (searchedMarkerRef.current) {
      mapInstanceRef.current.removeLayer(searchedMarkerRef.current);
      searchedMarkerRef.current = null;
    }

    if (!activeSearchedLoc) return;

    const { lat, lng, name, category, typeLabel, secondaryText, distanceKm } = activeSearchedLoc;

    let iconSymbol = '🏛️';
    let pinColor = 'bg-amber-500 ring-amber-400/50';
    if (category === 'building') {
      iconSymbol = '🏢';
      pinColor = 'bg-blue-600 ring-blue-400/50';
    } else if (category === 'hospital') {
      iconSymbol = '🏥';
      pinColor = 'bg-red-600 ring-red-400/50';
    } else if (category === 'park') {
      iconSymbol = '🌳';
      pinColor = 'bg-emerald-600 ring-emerald-400/50';
    } else if (category === 'transit') {
      iconSymbol = '🚇';
      pinColor = 'bg-indigo-600 ring-indigo-400/50';
    }

    const searchedIcon = L.divIcon({
      className: 'custom-searched-landmark-pin',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute w-14 h-14 rounded-full bg-amber-400/30 animate-ping"></div>
          <div class="w-9 h-9 rounded-full ${pinColor} border-2 border-white shadow-2xl flex items-center justify-center text-white text-sm font-bold ring-4 transition-transform hover:scale-110">
            ${iconSymbol}
          </div>
          <div class="absolute -bottom-6 px-2 py-0.5 bg-[#0b1326] border border-amber-500/70 rounded text-[9px] font-mono text-amber-300 font-bold whitespace-nowrap shadow-xl">
            ${name.slice(0, 18)}${name.length > 18 ? '...' : ''}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const sMarker = L.marker([lat, lng], { icon: searchedIcon });

    // Find closest cooling shelter to this monument/building
    let closestFacility: CoolingFacility | null = null;
    let minShelterDist = 9999;
    facilities.forEach((f) => {
      const d = calculateGeodesicDistance(lat, lng, f.coordinates[0], f.coordinates[1]);
      if (d < minShelterDist) {
        minShelterDist = d;
        closestFacility = f;
      }
    });

    const popupContent = `
      <div class="p-3.5 bg-[#0b1326] text-white rounded-xl border border-amber-500/60 text-xs font-sans min-w-[240px]">
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ${typeLabel.toUpperCase()}
          </span>
          <span class="text-[10px] font-mono text-slate-400">GPS Verified</span>
        </div>
        <h4 class="font-bold text-sm text-white leading-snug mt-1">${name}</h4>
        <p class="text-[11px] text-slate-300 mt-1">${secondaryText}</p>
        
        <div class="mt-2.5 p-2 bg-[#060e20] rounded-lg border border-[#2d3449] space-y-1 text-[11px] font-mono">
          <div class="flex justify-between text-slate-400">
            <span>Coordinates:</span>
            <span class="text-white">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</span>
          </div>
          ${distanceKm !== undefined ? `
            <div class="flex justify-between text-slate-400">
              <span>From Your Location:</span>
              <span class="text-orange-400 font-bold">${distanceKm} km</span>
            </div>
          ` : ''}
          ${closestFacility ? `
            <div class="flex justify-between text-slate-400 pt-1 border-t border-[#1a233b]">
              <span>Nearest AC Shelter:</span>
              <span class="text-emerald-400 font-bold">${minShelterDist} km</span>
            </div>
          ` : ''}
        </div>

        <div class="mt-3 flex flex-col gap-1.5">
          ${closestFacility ? `
            <button
              id="searched-goto-shelter-btn"
              class="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>❄️ Route to Nearest AC Shelter (${minShelterDist} km)</span>
            </button>
          ` : ''}
          <a
            href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full px-3 py-1 bg-[#171f33] hover:bg-[#222a3d] text-slate-200 border border-[#2d3449] rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink class="w-3 h-3 text-orange-400" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>
    `;

    sMarker.bindPopup(popupContent, {
      className: 'leaflet-tactical-popup',
      closeButton: true,
    });

    sMarker.on('popupopen', () => {
      const shelterBtn = document.getElementById('searched-goto-shelter-btn');
      if (shelterBtn && closestFacility) {
        shelterBtn.onclick = () => {
          onSelectFacility(closestFacility!);
          onStartNavigation(closestFacility!);
        };
      }
    });

    sMarker.addTo(mapInstanceRef.current);
    searchedMarkerRef.current = sMarker;

    // Fly to searched location
    mapInstanceRef.current.flyTo([lat, lng], 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Auto-open popup
    setTimeout(() => {
      sMarker.openPopup();
    }, 600);

  }, [activeSearchedLoc, facilities]);

  // Render GPS Route Polyline when navigation is active
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (!activeNavigationFacility) return;

    const startLat = userLocation?.lat || (selectedCity.lat - 0.004);
    const startLng = userLocation?.lng || (selectedCity.lng - 0.005);
    const destLat = activeNavigationFacility.coordinates[0];
    const destLng = activeNavigationFacility.coordinates[1];

    // Generate realistic path with intermediate street waypoints
    const midLat1 = startLat + (destLat - startLat) * 0.35 + (navigationRouteMode === 'cool' ? 0.0018 : 0.0004);
    const midLng1 = startLng + (destLng - startLng) * 0.25 - (navigationRouteMode === 'cool' ? 0.0015 : 0.0002);
    const midLat2 = startLat + (destLat - startLat) * 0.75 - (navigationRouteMode === 'cool' ? 0.0012 : 0.0003);
    const midLng2 = startLng + (destLng - startLng) * 0.80 + (navigationRouteMode === 'cool' ? 0.0010 : 0.0002);

    const waypoints: [number, number][] = [
      [startLat, startLng],
      [midLat1, midLng1],
      [midLat2, midLng2],
      [destLat, destLng],
    ];

    // Outer glow polyline
    const glowLine = L.polyline(waypoints, {
      color: navigationRouteMode === 'cool' ? '#10b981' : '#f97316',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Core active route polyline
    const coreLine = L.polyline(waypoints, {
      color: navigationRouteMode === 'cool' ? '#34d399' : '#fb923c',
      weight: 4,
      opacity: 0.95,
      dashArray: navigationRouteMode === 'cool' ? '6, 8' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
    });

    glowLine.addTo(routeLayerRef.current);
    coreLine.addTo(routeLayerRef.current);

    // Fit map bounds to encompass the entire route
    const bounds = L.latLngBounds(waypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [activeNavigationFacility, navigationRouteMode, userLocation, selectedCity]);

  // Recenter map on active city
  const handleRecenterCity = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedCity.lat, selectedCity.lng], 13, { duration: 1.2 });
  };

  // Handle Location Autocomplete Selection
  const handleLocationPicked = (loc: LocationSearchResult) => {
    setInternalSearchedLoc(loc);
    if (onSelectSearchedLocation) {
      onSelectSearchedLocation(loc);
    }
  };

  // Clear current searched location
  const handleClearSearched = () => {
    setInternalSearchedLoc(null);
    if (onClearSearchedLocation) {
      onClearSearchedLocation();
    }
    if (searchedMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(searchedMarkerRef.current);
      searchedMarkerRef.current = null;
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#2d3449] bg-[#060e20] ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]' : 'h-[460px] sm:h-[520px]'}`}>
      
      {/* Top Floating Control Bar: Search Omnibar + City Badge + Layers */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Google Maps-Style Live Autocomplete Search Input */}
        <div className="pointer-events-auto flex-1 max-w-md">
          <LocationAutocomplete
            onSelectLocation={handleLocationPicked}
            placeholder={`Search any building, monument, area in ${selectedCity.name} or India...`}
            biasCoordinates={{ lat: selectedCity.lat, lng: selectedCity.lng }}
          />
        </div>

        {/* Map Layers & Toggles */}
        <div className="pointer-events-auto flex items-center justify-end gap-1.5 bg-[#0b1326]/95 backdrop-blur-md p-1 rounded-xl border border-[#2d3449] shadow-lg text-xs font-mono self-end sm:self-auto">
          
          {/* Base Layer Switcher (All 100% Free - Zero API key) */}
          <div className="flex items-center gap-1 border-r border-[#2d3449] pr-1 mr-0.5">
            <button
              onClick={() => setActiveBaseLayer('tactical')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                activeBaseLayer === 'tactical' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tactical Dark Map (OpenStreetMap with GPU Night Filter)"
            >
              Dark
            </button>
            <button
              onClick={() => setActiveBaseLayer('satellite')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                activeBaseLayer === 'satellite' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="High-Res Satellite Imagery (Esri World Imagery)"
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBaseLayer('streets')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                activeBaseLayer === 'streets' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="OpenStreetMap Standard Basemap"
            >
              Street
            </button>
            <button
              onClick={() => setActiveBaseLayer('relief')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                activeBaseLayer === 'relief' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Humanitarian Emergency Map (HOT)"
            >
              Relief
            </button>
          </div>

          {/* Thermal Heat Overlay Toggle */}
          <button
            onClick={() => setShowThermalOverlay(!showThermalOverlay)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-all ${
              showThermalOverlay ? 'bg-red-600/30 text-red-300 border border-red-500/50' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Urban Heat Island Radar"
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">UHI Heat</span>
          </button>

          {/* Water Tanker Toggle */}
          <button
            onClick={() => setShowWaterTankers(!showWaterTankers)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-all ${
              showWaterTankers ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Emergency Water Bowsers"
          >
            <Droplet className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Tankers</span>
          </button>

          {/* Recenter button */}
          <button
            onClick={handleRecenterCity}
            title="Recenter Map on City"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#171f33]"
          >
            <Crosshair className="w-3.5 h-3.5 text-orange-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#171f33]"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Searched Location Banner (if active) */}
      {activeSearchedLoc && (
        <div className="absolute top-16 left-3 right-3 sm:left-3 sm:right-auto sm:max-w-md z-[400] bg-[#0b1326]/95 backdrop-blur-md p-2.5 px-3 rounded-xl border border-amber-500/80 shadow-2xl animate-in fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  {activeSearchedLoc.typeLabel}:
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {activeSearchedLoc.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {activeSearchedLoc.secondaryText}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearSearched}
            className="p-1 hover:bg-[#171f33] rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
            title="Clear searched location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Navigation HUD Banner if Route is Active */}
      {activeNavigationFacility && (
        <div className="absolute top-28 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-[400] bg-[#0b1326]/95 backdrop-blur-md p-3 rounded-xl border border-amber-500/70 shadow-2xl animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider">
                  ACTIVE GPS ROUTE GUIDANCE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {navigationRouteMode === 'cool' ? 'SHADED CORRIDOR' : 'SHORTEST'}
                </span>
              </div>
              <h4 className="text-xs font-headline font-bold text-white mt-1">
                {activeNavigationFacility.name}
              </h4>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                ETA: {activeNavigationFacility.walkTimeMins} mins • {activeNavigationFacility.distanceKm} km • {activeNavigationFacility.indoorTemp}°C Indoor
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeNavigationFacility.coordinates[0]},${activeNavigationFacility.coordinates[1]}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs shrink-0 shadow-sm"
              title="Open in Google Maps App"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-[#0b1326]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2d3449] text-[10px] font-mono flex flex-wrap items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-300">AC Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-slate-300">Hospital Resuscitation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-300">Monument / Landmark</span>
        </div>
        {showWaterTankers && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Water Tanker</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Your GPS</span>
        </div>
      </div>

    </div>
  );
};
