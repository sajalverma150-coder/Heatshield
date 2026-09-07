import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { INDIAN_CITIES, CityData, findNearestIndianCity, generateDynamicCityData, calculateDistanceKm } from '../data/indiaCities';
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

  // Real-time suggestions on keystroke
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

  // Filter existing cities
  const filteredCities = INDIAN_CITIES.filter((city) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      city.name.toLowerCase().includes(term) ||
      city.state.toLowerCase().includes(term) ||
      city.region.toLowerCase().includes(term) ||
      city.climateZone.toLowerCase().includes(term)
    );
  });

  const handleSelectCity = (city: CityData) => {
    onSelectCity(city);
    onClose();
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

        // If distance is within 80km, use the matched city; otherwise create localized station data for exact coordinates
        let finalCity: CityData;
        if (distanceKm <= 80) {
          finalCity = {
            ...city,
            weather: {
              ...city.weather,
              stationName: `IMD AWS Near Lat: ${latitude.toFixed(3)}°, Lon: ${longitude.toFixed(3)}° (${city.name} Zone)`,
            }
          };
          setGpsSuccessMsg(
            `GPS Locked (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E). Matched nearest center: ${city.name} (${distanceKm} km away, accuracy ±${Math.round(accuracy)}m).`
          );
        } else {
          // Custom Indian coordinate
          finalCity = generateDynamicCityData(`GPS Location (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
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
          msg = 'Location access was denied. Please allow location permissions in your browser or select your city manually below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please select your Indian city from the list below.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS request timed out. Please try again or select your city.';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      id="city-search-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="city-search-dialog" 
        className="bg-[#0b1326] border border-[#2d3449] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-orange-950/30 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d3449] bg-[#060e20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Compass className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                <span>Select City or Auto-Detect GPS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                  ALL INDIA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Check thermal index, WBGT, active cooling stations & heatwave alerts for any Indian city
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
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Automatic GPS Location Button */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-950/30 via-[#171f33] to-amber-950/30 border border-orange-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Navigation className={`w-5 h-5 ${isDetectingGps ? 'animate-spin text-orange-400' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Automatic GPS Location Tracker</h3>
                  <p className="text-xs text-slate-300">
                    Pinpoint your exact coordinates via satellite GPS and load nearest IMD telemetry
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
                <span>{isDetectingGps ? 'Querying GPS...' : 'Use My GPS Location'}</span>
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

          {/* Search Input */}
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
              placeholder="Search any building, monument, area, or city across India (e.g., Bara Imambara, Taj Mahal, AIIMS, Lucknow)..."
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
                  <Sparkles className="w-3.5 h-3.5" /> LIVE SEARCH SUGGESTIONS (REAL-TIME)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click to jump instantly</span>
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

          {/* Quick Major Cities Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#a78b7d] uppercase tracking-wider">
                Popular Indian Metros & Telemetry
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                dataSourceMode === 'live_api'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
                {dataSourceMode === 'live_api' ? '● Real-Time Satellite Telemetry' : 'IMD Heatwave Drill Mode'}
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

          {/* Cities List */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#a78b7d] uppercase tracking-wider mb-2">
              <span>Matching Indian Stations ({filteredCities.length})</span>
              <span>Coordinates & WBGT</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {telemetry.risk}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* If user typed a custom city not in list */}
              {searchTerm.trim() && filteredCities.length === 0 && (
                <div className="p-4 rounded-xl bg-[#060e20] border border-dashed border-orange-500/40 text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-orange-400 mx-auto" />
                  <p className="text-sm text-white font-medium">
                    Analyze "{searchTerm}" with Real-Time Thermal Matrix
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click below to generate live biometeorological telemetry, WBGT heat stress calculation, ward-level heat risk, and emergency hospital triage beds for {searchTerm}.
                  </p>
                  <button
                    id="generate-custom-city-btn"
                    onClick={() => handleCustomSearchSubmit({ preventDefault: () => {} } as any)}
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <span>Load {searchTerm} City Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#060e20] border-t border-[#2d3449] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Currently Active: <strong className="text-white">{selectedCity.name}, {selectedCity.state}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#171f33] hover:bg-[#222a3d] text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
