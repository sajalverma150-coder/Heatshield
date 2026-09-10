import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Flame, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  Sparkles, 
  X, 
  Compass, 
  ArrowRight, 
  Building2, 
  Hospital, 
  Train, 
  Trees, 
  Loader2,
  Globe2,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { INDIAN_CITIES, CityData, findNearestIndianCity, generateDynamicCityData, calculateDistanceKm } from '../data/indiaCities';
import { ALL_INDIAN_DISTRICTS, getDistrictsGroupedByState, IndianDistrictInfo } from '../data/indiaDistricts';
import { searchGlobalLocations, LocationSearchResult } from '../services/locationSearch';
import { CityLiveSummary } from '../services/weatherApiService';
import { WeatherTelemetry } from '../types';

interface CitySearchSelectorProps {
  selectedCity: CityData;
  onSelectCity: (city: CityData) => void;
  isOpen: boolean;
  onClose: () => void;
  onGpsDetected?: (coords: { lat: number; lng: number; accuracy: number }) => void;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  citiesLiveWeather?: Record<string, CityLiveSummary>;
  activeWeather?: WeatherTelemetry;
}

export const CitySearchSelector: React.FC<CitySearchSelectorProps> = ({
  selectedCity,
  onSelectCity,
  isOpen,
  onClose,
  onGpsDetected,
  dataSourceMode = 'live_api',
  citiesLiveWeather,
  activeWeather,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<LocationSearchResult[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  // Tab mode: 'popular' (Metros & Major Hubs), 'districts' (State-wise 750+ Districts directory)
  const [activeTab, setActiveTab] = useState<'popular' | 'districts'>('popular');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');

  const stateGroups = useMemo(() => getDistrictsGroupedByState(), []);

  // List of all unique states for dropdown / chips
  const allStatesList = useMemo(() => {
    return Array.from(new Set(ALL_INDIAN_DISTRICTS.map((d) => d.state))).sort();
  }, []);

  const getCityTelemetry = (cityItem: CityData) => {
    if (selectedCity?.id === cityItem.id && activeWeather) {
      return {
        temp: activeWeather.dryBulbTemp,
        wbgt: activeWeather.wbgt,
        risk: activeWeather.riskLevel,
      };
    }
    if (dataSourceMode === 'live_api' && citiesLiveWeather && citiesLiveWeather[cityItem.id]) {
      const live = citiesLiveWeather[cityItem.id];
      return {
        temp: live.dryBulbTemp,
        wbgt: live.wbgt,
        risk: live.riskLevel,
      };
    }
    return {
      temp: cityItem.weather.dryBulbTemp,
      wbgt: cityItem.weather.wbgt,
      risk: cityItem.weather.riskLevel,
    };
  };

  // Real-time suggestions on keystroke (Global & India location geocoding)
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setLiveResults([]);
      setIsLoadingLive(false);
      return;
    }

    setIsLoadingLive(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalLocations(searchTerm, {
          lat: selectedCity?.lat,
          lng: selectedCity?.lng,
          limit: 6,
        });
        setLiveResults(results);
      } catch (err) {
        setLiveResults([]);
      } finally {
        setIsLoadingLive(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCity?.lat, selectedCity?.lng]);

  // Filter major cities
  const filteredCities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return INDIAN_CITIES;
    return INDIAN_CITIES.filter((city) => (
      city.name.toLowerCase().includes(term) ||
      city.state.toLowerCase().includes(term) ||
      city.region.toLowerCase().includes(term) ||
      city.climateZone.toLowerCase().includes(term)
    ));
  }, [searchTerm]);

  // Filter 750+ Indian Districts
  const filteredDistricts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return ALL_INDIAN_DISTRICTS.filter((d) => {
      const matchesState = selectedStateFilter === 'ALL' || d.state === selectedStateFilter;
      if (!matchesState) return false;
      if (!term) return true;
      return (
        d.name.toLowerCase().includes(term) ||
        d.state.toLowerCase().includes(term) ||
        d.zone.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, selectedStateFilter]);

  const handleSelectCity = (city: CityData) => {
    onSelectCity(city);
    onClose();
  };

  const handleSelectDistrict = (district: IndianDistrictInfo) => {
    // Check if directly matches one of our rich preconfigured cities
    const existing = INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === district.name.toLowerCase()
    );
    if (existing) {
      handleSelectCity(existing);
      return;
    }

    // Generate dynamic telemetry, hospitals, and cooling shelters for this exact district
    const dynamicCity = generateDynamicCityData(
      district.name,
      { lat: district.lat, lng: district.lng },
      district.state
    );
    handleSelectCity(dynamicCity);
  };

  const handleSelectLocationResult = (item: LocationSearchResult) => {
    // Check if directly matches one of our rich preconfigured cities
    const existing = INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === item.name.toLowerCase() || 
             (item.city && c.name.toLowerCase() === item.city.toLowerCase())
    );
    if (existing && item.category === 'area') {
      handleSelectCity(existing);
      return;
    }

    // Generate dynamic city data centered on this exact building, monument, or area
    const dynamicCity = generateDynamicCityData(
      item.name,
      { lat: item.lat, lng: item.lng },
      item.state
    );
    handleSelectCity(dynamicCity);
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (liveResults.length > 0) {
      handleSelectLocationResult(liveResults[0]);
      return;
    }

    // Check if matches an existing city
    const existing = INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (existing) {
      handleSelectCity(existing);
      return;
    }

    // Check if matches a known district
    const matchedDistrict = ALL_INDIAN_DISTRICTS.find(
      (d) => d.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    if (matchedDistrict) {
      handleSelectDistrict(matchedDistrict);
      return;
    }

    // Generate dynamic city data for any Indian city entered by user
    const dynamicCity = generateDynamicCityData(searchTerm.trim());
    handleSelectCity(dynamicCity);
  };

  const handleDetectLocation = () => {
    setIsDetectingGps(true);
    setGpsError(null);
    setGpsSuccessMsg(null);

    if (!navigator.geolocation) {
      setGpsError('GPS Geolocation is not supported by your browser.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const { city, distanceKm } = findNearestIndianCity(latitude, longitude);

        let finalCity: CityData;
        if (distanceKm <= 80) {
          finalCity = {
            ...city,
            weather: {
              ...city.weather,
              stationName: `IMD AWS Near Lat: ${latitude.toFixed(3)}°, Lon: ${longitude.toFixed(3)}° (${city.name} District)`,
            }
          };
          setGpsSuccessMsg(
            `GPS Locked (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E). Matched closest district: ${city.name}, ${city.state} (${distanceKm} km away, accuracy ±${Math.round(accuracy)}m).`
          );
        } else {
          // Custom Indian coordinate
          finalCity = generateDynamicCityData(`District AWS (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
          finalCity.lat = latitude;
          finalCity.lng = longitude;
          setGpsSuccessMsg(
            `GPS Coordinates detected: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E. Generated microclimate biometeorology station.`
          );
        }

        if (onGpsDetected) {
          onGpsDetected({ lat: latitude, lng: longitude, accuracy });
        }

        setTimeout(() => {
          setIsDetectingGps(false);
          onSelectCity(finalCity);
          onClose();
        }, 1200);
      },
      (error) => {
        setIsDetectingGps(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access was denied. Please allow location permissions in your browser or select your district manually below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please select your Indian district from the list below.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS request timed out. Please try again or select your district.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      id="city-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="city-search-modal-content"
        className="w-full max-w-4xl bg-[#0b1326] border border-[#2d3449] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d3449] bg-[#060e20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Globe2 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                <span>Select District / Test Location (Pan-India)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  750+ DISTRICTS • 28 STATES & 8 UTs
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Seamlessly test any district, hospital triage bed, cooling shelter & heatwave telemetry across all of India
              </p>
            </div>
          </div>
          <button
            id="close-city-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#171f33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          
          {/* Automatic GPS Location Button */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-950/30 via-[#171f33] to-amber-950/30 border border-orange-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Navigation className={`w-5 h-5 ${isDetectingGps ? 'animate-spin text-orange-400' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Live Field GPS Geolocation Detector</h3>
                  <p className="text-xs text-slate-300">
                    Auto-resolves your exact coordinate down to the nearest Indian District HQ & IMD Station
                  </p>
                </div>
              </div>

              <button
                id="auto-detect-gps-btn"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-md shadow-orange-900/30"
              >
                <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? 'Locking GPS...' : 'Use My Live GPS Location'}</span>
              </button>
            </div>

            {/* GPS Feedback message */}
            {gpsSuccessMsg && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{gpsSuccessMsg}</span>
              </div>
            )}

            {gpsError && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleCustomSearchSubmit} className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {isLoadingLive ? (
                <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <input
              id="city-search-input-field"
              type="text"
              placeholder="Search any district, town, hospital, landmark, or PIN code in India (e.g., Unnao, Basti, Jhansi, Nagpur, Gaya, Alwar, Solapur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-[#060e20] border border-[#2d3449] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Select</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Real-Time Live Google Maps-Style Suggestions */}
          {liveResults.length > 0 && (
            <div className="p-3 bg-[#060e20] rounded-xl border border-orange-500/50 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> LIVE REVERSE-GEOCODED MATCHES (INSTANT)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click to load district & shelters</span>
              </div>
              <div className="divide-y divide-[#1a233b] max-h-48 overflow-y-auto pr-1">
                {liveResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocationResult(item)}
                    className="py-2 px-2.5 rounded-lg flex items-center justify-between gap-2.5 hover:bg-[#131d33] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#0b1326] border border-[#2d3449] shrink-0 text-orange-400 group-hover:border-orange-500/50">
                        {item.category === 'monument' ? (
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                        ) : item.category === 'building' ? (
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        ) : item.category === 'hospital' ? (
                          <Hospital className="w-3.5 h-3.5 text-red-400" />
                        ) : item.category === 'transit' ? (
                          <Train className="w-3.5 h-3.5 text-emerald-400" />
                        ) : item.category === 'park' ? (
                          <Trees className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {item.typeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.secondaryText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.distanceKm !== undefined && (
                        <span className="text-[10px] font-mono text-orange-400 font-semibold">
                          {item.distanceKm} km
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directory Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-[#2d3449] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'popular'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-[#171f33] text-slate-400 hover:text-white border border-[#2d3449]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Major Heatwave Hubs</span>
              </button>

              <button
                onClick={() => setActiveTab('districts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'districts'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-[#171f33] text-slate-400 hover:text-white border border-[#2d3449]'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>All 750+ Indian Districts</span>
              </button>
            </div>

            {activeTab === 'districts' && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="bg-[#060e20] border border-[#2d3449] text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All States & UTs (750+)</option>
                  {allStatesList.map((st) => (
                    <option key={st} value={st}>
                      {st} ({ALL_INDIAN_DISTRICTS.filter((d) => d.state === st).length} Districts)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: Popular Major Metros & Telemetry */}
          {activeTab === 'popular' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#a78b7d] uppercase tracking-wider">
                    Quick-Access Heatwave Hubs
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    dataSourceMode === 'live_api'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold'
                      : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                  }`}>
                    {dataSourceMode === 'live_api' ? '● Real-Time IMD Telemetry' : 'IMD Heatwave Drill Mode'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_CITIES.map((c) => {
                    const isSelected = selectedCity?.id === c.id;
                    const telemetry = getCityTelemetry(c);
                    return (
                      <button
                        key={c.id}
                        id={`quick-city-${c.id}`}
                        onClick={() => handleSelectCity(c)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                          isSelected
                            ? 'bg-orange-500 text-white font-bold border-orange-400 shadow-md shadow-orange-950/30'
                            : 'bg-[#171f33] text-slate-300 border-[#2d3449] hover:border-orange-500/50 hover:text-white'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-black/30 text-white font-bold' 
                            : telemetry.temp >= 40 
                              ? 'bg-red-500/20 text-red-400' 
                              : telemetry.temp >= 32 
                                ? 'bg-orange-500/20 text-orange-300' 
                                : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {telemetry.temp}°C
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Major Cities List Cards */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isSelected = selectedCity?.id === city.id;
                  const telemetry = getCityTelemetry(city);
                  return (
                    <button
                      key={city.id}
                      id={`city-list-option-${city.id}`}
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-[#171f33] border-orange-500 text-white shadow-md'
                          : 'bg-[#060e20] hover:bg-[#131b2e] border-[#2d3449]/70 text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' 
                            : 'bg-[#171f33] text-slate-400'
                        }`}>
                          <MapPin className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{city.name}</span>
                            <span className="text-xs text-slate-400">• {city.state}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171f33] text-slate-400 border border-[#2d3449]">
                              {city.region}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {city.weather.stationName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-bold font-mono ${
                            telemetry.temp >= 40 
                              ? 'text-red-400' 
                              : telemetry.temp >= 32 
                                ? 'text-orange-400' 
                                : 'text-emerald-400'
                          }`}>
                            {telemetry.temp}°C
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            (WBGT {telemetry.wbgt}°)
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                          telemetry.risk === 'EXTREME'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : telemetry.risk === 'VERY_HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              : telemetry.risk === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {telemetry.risk}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: All 750+ Indian Districts by State */}
          {activeTab === 'districts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Showing {filteredDistricts.length} Indian Districts {selectedStateFilter !== 'ALL' ? `in ${selectedStateFilter}` : ''}</span>
                <span className="text-orange-400">Click any district to test live map & shelters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredDistricts.map((district) => {
                  const isCurrentActive = selectedCity?.name.toLowerCase() === district.name.toLowerCase();
                  return (
                    <button
                      key={`${district.state}-${district.name}`}
                      onClick={() => handleSelectDistrict(district)}
                      className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                        isCurrentActive
                          ? 'bg-orange-950/40 border-orange-500 text-white shadow-md ring-1 ring-orange-500'
                          : 'bg-[#060e20] hover:bg-[#131d33] border-[#2d3449] hover:border-orange-500/50 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-xs text-white group-hover:text-orange-300 transition-colors truncate">
                            {district.name}
                          </span>
                          {isCurrentActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span className="text-orange-400/90 font-medium truncate">{district.state}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#1a233b] flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>{district.lat.toFixed(2)}°N, {district.lng.toFixed(2)}°E</span>
                        <span className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          Test →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredDistricts.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm">No districts matched "{searchTerm}" in {selectedStateFilter}.</p>
                  <p className="text-xs mt-1 text-slate-500">Try searching without filters or search any specific town name.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#060e20] border-t border-[#2d3449] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Currently Active: <strong className="text-white">{selectedCity.name}, {selectedCity.state}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-slate-300 hover:text-white transition-colors text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
