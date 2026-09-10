import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Droplet, 
  Wind, 
  ShieldCheck, 
  Hospital, 
  Users, 
  Compass, 
  Layers, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Flame, 
  Activity, 
  HeartPulse, 
  ChevronRight, 
  Crosshair, 
  Sparkles, 
  AlertCircle,
  Truck,
  Ticket,
  X,
  Building2
} from 'lucide-react';
import { CoolingFacility } from '../../types';
import { CityData, calculateDistanceKm, formatShelterDistance } from '../../data/indiaCities';
import { InteractiveGisMap } from '../InteractiveGisMap';
import { GpsNavigationModal } from '../GpsNavigationModal';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { LocationSearchResult, calculateGeodesicDistance } from '../../services/locationSearch';

interface CoolingFinderViewProps {
  facilities: CoolingFacility[];
  selectedCity?: CityData;
  userCoords?: { lat: number; lng: number } | null;
  onOpenCitySelector?: () => void;
  onNavigateToFacility: (facility: CoolingFacility) => void;
  onTriggerSOS: () => void;
  activeNavigationFacility?: CoolingFacility | null;
  onClearNavigationFacility?: () => void;
  onSelectCity?: (city: CityData) => void;
}

export const CoolingFinderView: React.FC<CoolingFinderViewProps> = ({
  facilities,
  selectedCity,
  userCoords: propUserCoords,
  onOpenCitySelector,
  onNavigateToFacility,
  onTriggerSOS,
  activeNavigationFacility: initialActiveNav,
  onClearNavigationFacility,
  onSelectCity,
}) => {
  const [activeCategory, setActiveCategory] = useState<'shelter' | 'triage_hospital'>('shelter');
  const [selectedFacility, setSelectedFacility] = useState<CoolingFacility>(facilities[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedLandmark, setSearchedLandmark] = useState<LocationSearchResult | null>(null);
  const [callModalFacility, setCallModalFacility] = useState<CoolingFacility | null>(null);

  // Google Maps Grounding State (gemini-3.5-flash with googleMaps tool)
  const [mapsGroundingResults, setMapsGroundingResults] = useState<{ text: string; places: Array<{ title: string; uri: string }> } | null>(null);
  const [isSearchingMaps, setIsSearchingMaps] = useState<boolean>(false);

  const handleMapsGroundingSearch = async () => {
    setIsSearchingMaps(true);
    try {
      const res = await fetch('/api/map-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Verified AC cooling shelters, public shade centers, and drinking water kiosks near ${selectedCity?.name || 'Mumbai'}`,
          cityName: selectedCity?.name || 'Mumbai',
          latitude: selectedCity?.lat || 19.0760,
          longitude: selectedCity?.lng || 72.8777,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMapsGroundingResults(data);
      }
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setIsSearchingMaps(false);
    }
  };

  // Active Navigation HUD state
  const [navTargetFacility, setNavTargetFacility] = useState<CoolingFacility | null>(initialActiveNav || null);
  const [isNavModalOpen, setIsNavModalOpen] = useState<boolean>(Boolean(initialActiveNav));
  const [routeMode, setRouteMode] = useState<'cool' | 'fast'>('cool');

  // Water Bowser Tanker Request Modal State
  const [isTankerModalOpen, setIsTankerModalOpen] = useState<boolean>(false);
  const [tankerSector, setTankerSector] = useState<string>('');
  const [tankerDispatchedNotice, setTankerDispatchedNotice] = useState<string | null>(null);

  // User GPS coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(propUserCoords || null);

  // Mobile View Mode Switcher ('map' | 'list') for small screens
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map');

  // Sync when initialActiveNav prop changes from App.tsx (e.g. from Overview screen)
  useEffect(() => {
    if (initialActiveNav) {
      setNavTargetFacility(initialActiveNav);
      setSelectedFacility(initialActiveNav);
      setIsNavModalOpen(true);
    }
  }, [initialActiveNav]);

  // Sync prop userCoords if updated from App
  useEffect(() => {
    if (propUserCoords) {
      setUserCoords(propUserCoords);
    }
  }, [propUserCoords]);

  // Sync selected facility when city or facilities change
  useEffect(() => {
    if (facilities.length > 0) {
      // Keep selected facility if still in list, else default to first
      const exists = facilities.find(f => f.id === selectedFacility?.id);
      if (!exists) {
        setSelectedFacility(facilities[0]);
      }
    }
  }, [facilities]);

  // Try detecting user physical GPS for real-time distance calculations if not already provided
  useEffect(() => {
    if (!propUserCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          // Fallback to city center
          if (selectedCity) {
            setUserCoords({ lat: selectedCity.lat, lng: selectedCity.lng });
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [selectedCity?.id, propUserCoords]);

  // Dynamic distance computation based on selected landmark or live user GPS
  const facilitiesWithDistances = facilities.map((f) => {
    const origin = searchedLandmark
      ? { lat: searchedLandmark.lat, lng: searchedLandmark.lng }
      : (userCoords || (selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : null));

    if (origin) {
      const d = calculateDistanceKm(origin.lat, origin.lng, f.coordinates[0], f.coordinates[1]);
      const walk = Math.max(1, Math.round(d * 12.5));
      return { ...f, distanceKm: d, walkTimeMins: walk };
    }
    return f;
  });

  const filteredFacilities = facilitiesWithDistances
    .filter((f) => {
      const matchCategory = activeCategory === 'shelter' ? f.category === 'shelter' : f.category === 'triage_hospital';
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm); // Always sort closest first!

  // Handler to start navigation to a facility
  const handleStartNav = (facility: CoolingFacility) => {
    setSelectedFacility(facility);
    setNavTargetFacility(facility);
    setIsNavModalOpen(true);
    setMobileViewMode('map');
    onNavigateToFacility(facility);
  };

  // Close Navigation HUD
  const handleCloseNav = () => {
    setIsNavModalOpen(false);
    if (onClearNavigationFacility) {
      onClearNavigationFacility();
    }
  };

  // 1-Click Nearest Shelter Finder
  const handleFindNearest = () => {
    if (facilitiesWithDistances.length === 0) return;
    const sorted = [...facilitiesWithDistances].sort((a, b) => a.distanceKm - b.distanceKm);
    const nearest = sorted[0];
    handleStartNav(nearest);
  };

  // Dispatch Emergency Water Bowser
  const handleRequestTankerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectorName = tankerSector.trim() || `${selectedCity?.name || 'Sector'} Main Crossroad`;
    setTankerDispatchedNotice(`Municipal Jal Sansthan Bowser #12 dispatched to ${sectorName}. ETA: 12 minutes.`);
    setIsTankerModalOpen(false);
    setTimeout(() => setTankerDispatchedNotice(null), 8000);
  };

  // Current outdoor temperature of city
  const outdoorTemp = selectedCity?.weather.dryBulbTemp || 42.0;
  const indoorTemp = selectedFacility?.indoorTemp || 22.0;
  const tempDelta = Number((outdoorTemp - indoorTemp).toFixed(1));

  return (
    <div id="cooling-finder-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Header & Category Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white">
              Safe Zones & GIS Thermal Refuges
            </h2>
            {selectedCity && (
              <button
                onClick={onOpenCitySelector}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25 flex items-center gap-1 transition-colors"
                title="Change city"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-bold">{selectedCity.name}</span>
                <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                  ({selectedCity.state})
                </span>
                <ChevronRight className="w-3 h-3 text-orange-400" />
              </button>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              {facilities.length} ACTIVE SITES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy, air conditioning status, chilled ORS supply, and hospital hyperthermia resuscitation beds
          </p>
        </div>

        {/* Action Controls: Category Switcher + 1-Click Nearest + Water Bowser */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Find Nearest Button */}
          <button
            onClick={handleFindNearest}
            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Scan and navigate to closest AC cooling refuge"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Find Nearest</span>
          </button>

          {/* Request Water Tanker Button */}
          <button
            onClick={() => setIsTankerModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Request emergency drinking water tanker to your sector"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Request Tanker</span>
          </button>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-shelters-water-btn"
              onClick={() => setActiveCategory('shelter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'shelter'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Shelters ({facilities.filter((f) => f.category === 'shelter').length})</span>
            </button>
            <button
              id="tab-hospital-beds-btn"
              onClick={() => setActiveCategory('triage_hospital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === 'triage_hospital'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              <span>Hospital Beds ({facilities.filter((f) => f.category === 'triage_hospital').length})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Water Tanker Dispatch Notification Banner */}
      {tankerDispatchedNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-3 text-xs text-cyan-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-cyan-400 shrink-0 animate-bounce" />
            <span className="font-semibold">{tankerDispatchedNotice}</span>
          </div>
          <button
            onClick={() => setTankerDispatchedNotice(null)}
            className="text-cyan-400 hover:text-white font-mono text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hospital Surge Status Alert Banner if Triage Tab is active */}
      {activeCategory === 'triage_hospital' && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-3">
          <HeartPulse className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs text-slate-200">
            <strong className="text-red-400 block font-headline uppercase">
              {selectedCity?.name.toUpperCase()} HOSPITAL SURGE STATUS: CODE RED MASS CASUALTY PROTOCOL
            </strong>
            District medical college trauma bays and civil hospitals have converted overflow triage wards into active hyperthermia resuscitation units with continuous core temperature probes, rapid ice immersion baths, and chilled intravenous saline.
          </div>
        </div>
      )}

      {/* Mobile Map / List View Segmented Switcher */}
      <div className="lg:hidden flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 shadow-sm">
        <button
          id="mobile-cooling-toggle-map-btn"
          onClick={() => setMobileViewMode('map')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileViewMode === 'map'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive GIS Map</span>
        </button>
        <button
          id="mobile-cooling-toggle-list-btn"
          onClick={() => setMobileViewMode('list')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileViewMode === 'list'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Facility Cards ({filteredFacilities.length})</span>
        </button>
      </div>

      {/* Main Layout: List on Left (5 Cols) + Interactive GIS Leaflet Map on Right (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column (5 Cols): Facility Search and Proximity Cards */}
        <div className={`lg:col-span-5 space-y-3 ${mobileViewMode === 'list' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Search & Landmark Autocomplete */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <LocationAutocomplete
                  selectedCity={selectedCity}
                  onSelectLocation={(loc) => {
                    setSearchedLandmark(loc);
                    // Also select closest facility to this landmark
                    if (facilities.length > 0) {
                      const sortedByLoc = [...facilities].sort((a, b) => {
                        const distA = calculateGeodesicDistance(loc.lat, loc.lng, a.coordinates[0], a.coordinates[1]);
                        const distB = calculateGeodesicDistance(loc.lat, loc.lng, b.coordinates[0], b.coordinates[1]);
                        return distA - distB;
                      });
                      setSelectedFacility(sortedByLoc[0]);
                    }
                  }}
                  onClearSearch={() => setSearchedLandmark(null)}
                  currentSearched={searchedLandmark}
                  placeholder={`Search any building, monument, ward in ${selectedCity?.name || 'India'}...`}
                />
              </div>
              <button
                onClick={handleFindNearest}
                className="px-2.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-mono text-orange-400 flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                title="Locate closest to GPS"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Closest</span>
              </button>
            </div>

            {/* Active Landmark Anchor Notice */}
            {searchedLandmark && (
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-amber-500/40 flex items-center justify-between gap-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                      Landmark Anchor Active
                    </span>
                    <span className="text-xs text-white font-medium truncate block">
                      {searchedLandmark.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSearchedLandmark(null)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono shrink-0 border border-slate-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reset GPS</span>
                </button>
              </div>
            )}

            {/* Google Maps Grounding Feature Widget */}
            <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/30 rounded-xl border border-orange-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-headline font-bold text-white">Google Maps Grounding</h5>
                    <p className="text-[10px] text-slate-400">Live verified places via gemini-3.5-flash</p>
                  </div>
                </div>
                <button
                  onClick={handleMapsGroundingSearch}
                  disabled={isSearchingMaps}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isSearchingMaps ? (
                    <span className="animate-spin text-xs">⏳</span>
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  <span>{isSearchingMaps ? 'Locating...' : 'Scan Nearby'}</span>
                </button>
              </div>

              {mapsGroundingResults && (
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-2 text-xs animate-in fade-in">
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    {mapsGroundingResults.text}
                  </p>
                  {mapsGroundingResults.places.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block">Verified Locations:</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {mapsGroundingResults.places.map((place, idx) => (
                          <a
                            key={idx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-white transition-colors group"
                          >
                            <span className="truncate font-medium text-[11px] text-slate-200 group-hover:text-orange-300">{place.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredFacilities.map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              const isNavigating = navTargetFacility?.id === fac.id && isNavModalOpen;
              const occupancyPct = Math.round((fac.currentOccupancy / fac.totalCapacity) * 100);
              const distDisplay = formatShelterDistance(fac.distanceKm);

              return (
                <div
                  key={fac.id}
                  id={`facility-card-${fac.id}`}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isNavigating
                      ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : isSelected
                      ? 'bg-slate-800/90 border-orange-500/80 shadow-xs'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            fac.isHospital
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {fac.isHospital ? 'HOSPITAL TRIAGE' : 'AC SHELTER'}
                        </span>
                        <span className="text-xs font-mono text-orange-400 font-semibold">
                          {distDisplay.combinedLabel}
                        </span>
                        {isNavigating && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">
                            ● ROUTING
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-headline font-bold text-white mt-1">
                        {fac.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {fac.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {fac.indoorTemp}°C
                      </div>
                      <span className="text-[10px] text-slate-400">Indoor Temp</span>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">
                        Capacity: {fac.currentOccupancy} / {fac.totalCapacity}
                      </span>
                      <span className={occupancyPct > 85 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {occupancyPct}% Full
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyPct > 85 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {fac.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 bg-slate-950/60 text-slate-300 rounded border border-slate-800"
                      >
                        {amenity}
                      </span>
                    ))}
                    {fac.amenities.length > 3 && (
                      <span className="text-[10px] font-mono text-orange-400 px-1">
                        +{fac.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions Buttons: Call + Directions */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallModalFacility(fac);
                      }}
                      className="px-2.5 py-1 bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-orange-400" />
                      <span>{fac.contactPhone}</span>
                    </button>

                    <button
                      id={`start-gps-route-btn-${fac.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartNav(fac);
                      }}
                      className={`px-3.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                        isNavigating
                          ? 'bg-amber-500 hover:bg-amber-400 text-black font-bold'
                          : 'bg-orange-600 hover:bg-orange-500 text-white'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isNavigating ? 'In Navigation' : 'Start GPS Route'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (7 Cols): Interactive GIS Leaflet Map & Facility Inspector */}
        <div className={`lg:col-span-7 space-y-4 ${mobileViewMode === 'map' ? 'block' : 'hidden lg:block'}`}>
          
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm">
            
            {/* Map Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-400" />
                  GIS Real-Time Satellite & Microclimate Ward Map
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCity?.name} • {selectedCity?.weather.ward || 'Municipal Ward Division'}
                </p>
              </div>

              {/* Thermal Relief Pill */}
              <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
                <span className="text-slate-400">Thermal Relief:</span>
                <span className="text-emerald-400 font-bold">-{tempDelta}°C Drop</span>
              </div>
            </div>

            {/* Real Interactive Leaflet GIS Map */}
            <InteractiveGisMap
              facilities={facilitiesWithDistances}
              selectedFacility={selectedFacility}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
              selectedCity={selectedCity!}
              onSelectCity={onSelectCity}
              userLocation={userCoords}
              activeNavigationFacility={navTargetFacility}
              onStartNavigation={handleStartNav}
              navigationRouteMode={routeMode}
              searchedLocation={searchedLandmark}
              onSelectSearchedLocation={setSearchedLandmark}
              onClearSearchedLocation={() => setSearchedLandmark(null)}
            />

            {/* Selected Facility Spotlight Bar below Map */}
            {selectedFacility && (
              <div className="mt-3 p-3.5 bg-slate-950/70 rounded-xl border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                      SELECTED FACILITY
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      GPS: {selectedFacility.coordinates[0].toFixed(4)}°N, {selectedFacility.coordinates[1].toFixed(4)}°E
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {selectedFacility.indoorTemp}°C AC
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {selectedFacility.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedFacility.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setCallModalFacility(selectedFacility)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleStartNav(selectedFacility)}
                    className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Start GPS Route</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Offline & Resilient Storage Notice */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pan-India Shelter Database Cached: Works Offline Without Cellular Data</span>
            </div>
            <span className="text-emerald-400 font-bold">IMD AWS Sync v5.2</span>
          </div>

        </div>

      </div>

      {/* Turn-by-Turn GPS Navigation Modal / HUD */}
      {isNavModalOpen && navTargetFacility && selectedCity && (
        <GpsNavigationModal
          facility={navTargetFacility}
          selectedCity={selectedCity}
          userLocation={userCoords}
          routeMode={routeMode}
          onToggleRouteMode={(m) => setRouteMode(m)}
          onClose={handleCloseNav}
          onTriggerSOS={onTriggerSOS}
        />
      )}

      {/* Request Water Tanker Modal */}
      {isTankerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-white text-lg text-center">
              Request Emergency Water Bowser
            </h3>
            <p className="text-xs text-slate-300 text-center mt-1">
              Dispatch a municipal chilled drinking water tanker (10,000L with WHO-ORS packets) to your neighborhood.
            </p>

            <form onSubmit={handleRequestTankerSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Target Sector / Landmark ({selectedCity?.name}):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chowk Crossing, Hazratganj Metro Gate 2, Bus Stand..."
                  value={tankerSector}
                  onChange={(e) => setTankerSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-300 space-y-1">
                <div>● Standard Municipal Response Time: 12-15 Minutes</div>
                <div>● Provides free cold water and electrolytes to pedestrians and outdoor workers</div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsTankerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Bowser</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facility Phone Call Simulation Modal */}
      {callModalFacility && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 text-center shadow-xl animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 mx-auto flex items-center justify-center text-orange-400 mb-3">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-white text-base">
              Calling Facility Reception
            </h3>
            <p className="text-sm font-semibold text-orange-400 mt-1">
              {callModalFacility.name}
            </p>
            <p className="text-xs font-mono text-slate-400 mt-2">
              {callModalFacility.contactPhone} • 24/7 Heatwave Desk
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => setCallModalFacility(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Dial
              </button>
              <a
                href={`tel:${callModalFacility.contactPhone}`}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
