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
import { WeatherTelemetry, LanguageCode } from '../types';

interface CitySearchSelectorProps {
  selectedCity: CityData;
  onSelectCity: (city: CityData) => void;
  isOpen: boolean;
  onClose: () => void;
  onGpsDetected?: (coords: { lat: number; lng: number; accuracy: number }) => void;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  citiesLiveWeather?: Record<string, CityLiveSummary>;
  activeWeather?: WeatherTelemetry;
  language?: LanguageCode;
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
  language = 'en',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<LocationSearchResult[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const isHindi = language === 'hi';

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
      className="fixed inset-0 z-50 bg-[#12304A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="city-search-modal-content"
        className="w-full max-w-4xl bg-white border-2 border-[#1E5A7A] rounded-2xl shadow-xl overflow-hidden text-[#263746]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D6E0E5] bg-[#12304A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                <span>{isHindi ? 'जिला / परीक्षण स्थल चुनें (अखिल भारतीय)' : 'Select District / Test Location (Pan-India)'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#317A5A] text-white font-semibold">
                  {isHindi ? '७५०+ जिले • २८ राज्य व ८ केंद्रशासित प्रदेश' : '750+ DISTRICTS • 28 STATES & 8 UTs'}
                </span>
              </h2>
              <p className="text-xs text-[#E8F1F5]/80">
                {isHindi 
                  ? 'अखिल भारतीय स्तर पर किसी भी जिले, अस्पताल ट्राइएज, शीतल आश्रय एवं टेलीमेट्री का परीक्षण करें'
                  : 'Seamlessly test any district, hospital triage bed, cooling shelter & heatwave telemetry across all of India'}
              </p>
            </div>
          </div>
          <button
            id="close-city-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto bg-[#F4F1EA]">
          
          {/* Automatic GPS Location Button */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D6E0E5] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8F1F5] border border-[#1E5A7A]/30 flex items-center justify-center text-[#1E5A7A] shrink-0">
                  <Navigation className={`w-5 h-5 ${isDetectingGps ? 'animate-spin text-[#C65D27]' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#12304A]">
                    {isHindi ? 'लाइव फील्ड जीपीएस भू-स्थान संसूचक' : 'Live Field GPS Geolocation Detector'}
                  </h3>
                  <p className="text-xs text-[#657783]">
                    {isHindi 
                      ? 'निकटतम भारतीय जिला मुख्यालय व आईएमडी मौसम केंद्र का स्वतः पता लगाएं'
                      : 'Auto-resolves your exact coordinate down to the nearest Indian District HQ & IMD Station'}
                  </p>
                </div>
              </div>

              <button
                id="auto-detect-gps-btn"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="px-4 py-2 rounded-lg bg-[#1E5A7A] hover:bg-[#164863] active:scale-95 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>
                  {isDetectingGps 
                    ? (isHindi ? 'जीपीएस लॉक हो रहा है...' : 'Locking GPS...') 
                    : (isHindi ? 'मेरे लाइव जीपीएस स्थान का उपयोग करें' : 'Use My Live GPS Location')}
                </span>
              </button>
            </div>

            {/* GPS Feedback message */}
            {gpsSuccessMsg && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#E8F1F5] border border-[#317A5A] text-xs text-[#317A5A] flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-[#317A5A] shrink-0" />
                <span>{gpsSuccessMsg}</span>
              </div>
            )}

            {gpsError && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#F8E9E8] border border-[#A63D40] text-xs text-[#A63D40] flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-[#A63D40] shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleCustomSearchSubmit} className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {isLoadingLive ? (
                <Loader2 className="w-4 h-4 text-[#C65D27] animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-[#657783]" />
              )}
            </div>
            <input
              id="city-search-input-field"
              type="text"
              placeholder={isHindi 
                ? 'भारत के किसी भी जिले, कस्बे, अस्पताल या पिनकोड की खोज करें (उदा. उन्नाव, बस्ती, झांसी, नागपुर, गया, अलवर)...'
                : 'Search any district, town, hospital, landmark, or PIN code in India (e.g., Unnao, Basti, Jhansi, Nagpur, Gaya, Alwar, Solapur)...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#D6E0E5] rounded-xl text-sm text-[#12304A] placeholder:text-[#657783] focus:outline-none focus:border-[#1E5A7A] focus:ring-1 focus:ring-[#1E5A7A] transition-colors"
            />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isHindi ? 'चुनें' : 'Select'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Real-Time Live Google Maps-Style Suggestions */}
          {liveResults.length > 0 && (
            <div className="p-3 bg-white rounded-xl border-2 border-[#1E5A7A] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#1E5A7A] font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {isHindi ? 'तात्कालिक भू-स्थान खोज परिणाम' : 'LIVE REVERSE-GEOCODED MATCHES (INSTANT)'}
                </span>
                <span className="text-[10px] text-[#657783] font-normal">
                  {isHindi ? 'जिले व आश्रय लोड करने हेतु क्लिक करें' : 'Click to load district & shelters'}
                </span>
              </div>
              <div className="divide-y divide-[#D6E0E5] max-h-48 overflow-y-auto pr-1">
                {liveResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocationResult(item)}
                    className="py-2 px-2.5 rounded-lg flex items-center justify-between gap-2.5 hover:bg-[#E8F1F5] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#E8F1F5] border border-[#D6E0E5] shrink-0 text-[#1E5A7A] group-hover:border-[#1E5A7A]">
                        {item.category === 'monument' ? (
                          <Compass className="w-3.5 h-3.5 text-[#C65D27]" />
                        ) : item.category === 'building' ? (
                          <Building2 className="w-3.5 h-3.5 text-[#1E5A7A]" />
                        ) : item.category === 'hospital' ? (
                          <Hospital className="w-3.5 h-3.5 text-[#A63D40]" />
                        ) : item.category === 'transit' ? (
                          <Train className="w-3.5 h-3.5 text-[#2F7F82]" />
                        ) : item.category === 'park' ? (
                          <Trees className="w-3.5 h-3.5 text-[#317A5A]" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-[#1E5A7A]" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#12304A] group-hover:text-[#1E5A7A] transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E8F1F5] text-[#263746] border border-[#D6E0E5] shrink-0">
                            {item.typeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#657783] truncate mt-0.5">
                          {item.secondaryText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.distanceKm !== undefined && (
                        <span className="text-[10px] font-mono text-[#1E5A7A] font-semibold">
                          {item.distanceKm} km
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-[#657783] group-hover:text-[#1E5A7A] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directory Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D6E0E5] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'popular'
                    ? 'bg-[#1E5A7A] text-white shadow-sm'
                    : 'bg-white text-[#263746] hover:bg-[#E8F1F5] border border-[#D6E0E5]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#C65D27]" />
                <span>{isHindi ? 'प्रमुख लू-प्रभावित केंद्र' : 'Major Heatwave Hubs'}</span>
              </button>

              <button
                onClick={() => setActiveTab('districts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'districts'
                    ? 'bg-[#1E5A7A] text-white shadow-sm'
                    : 'bg-white text-[#263746] hover:bg-[#E8F1F5] border border-[#D6E0E5]'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-[#2F7F82]" />
                <span>{isHindi ? 'सभी ७५०+ भारतीय जिले' : 'All 750+ Indian Districts'}</span>
              </button>
            </div>

            {activeTab === 'districts' && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#657783]" />
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="bg-white border border-[#D6E0E5] text-xs text-[#12304A] font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1E5A7A]"
                >
                  <option value="ALL">{isHindi ? 'सभी राज्य व केंद्रशासित प्रदेश (७५०+)' : 'All States & UTs (750+)'}</option>
                  {allStatesList.map((st) => (
                    <option key={st} value={st}>
                      {st} ({ALL_INDIAN_DISTRICTS.filter((d) => d.state === st).length} {isHindi ? 'जिले' : 'Districts'})
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
                  <span className="text-[11px] font-mono text-[#657783] uppercase tracking-wider font-semibold">
                    {isHindi ? 'त्वरित-पहुंच मौसम केंद्र' : 'Quick-Access Heatwave Hubs'}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    dataSourceMode === 'live_api'
                      ? 'bg-[#E8F1F5] text-[#2F7F82] border-[#2F7F82]/30'
                      : 'bg-[#F4F1EA] text-[#C65D27] border-[#C65D27]/30'
                  }`}>
                    {dataSourceMode === 'live_api' 
                      ? (isHindi ? '● वास्तविक समय आईएमडी टेलीमेट्री' : '● Real-Time IMD Telemetry') 
                      : (isHindi ? 'आईएमडी लू अभ्यास मोड' : 'IMD Heatwave Drill Mode')}
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
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors border cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E5A7A] text-white font-bold border-[#1E5A7A] shadow-sm'
                            : 'bg-white text-[#12304A] border-[#D6E0E5] hover:border-[#1E5A7A] hover:bg-[#E8F1F5]'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : telemetry.temp >= 40 
                              ? 'bg-[#F8E9E8] text-[#A63D40]' 
                              : telemetry.temp >= 32 
                                ? 'bg-[#FDF0E9] text-[#C65D27]' 
                                : 'bg-[#E8F1F5] text-[#2F7F82]'
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
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors border cursor-pointer ${
                        isSelected
                          ? 'bg-[#E8F1F5] border-2 border-[#1E5A7A] text-[#12304A] shadow-sm'
                          : 'bg-white hover:bg-[#F4F1EA] border-[#D6E0E5] text-[#263746]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? 'bg-[#1E5A7A] text-white' 
                            : 'bg-[#E8F1F5] text-[#1E5A7A]'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#12304A]">{city.name}</span>
                            <span className="text-xs text-[#657783]">• {city.state}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8F1F5] text-[#263746] border border-[#D6E0E5]">
                              {city.region}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#657783] font-mono mt-0.5">
                            {city.weather.stationName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-bold font-mono ${
                            telemetry.temp >= 40 
                              ? 'text-[#A63D40]' 
                              : telemetry.temp >= 32 
                                ? 'text-[#C65D27]' 
                                : 'text-[#317A5A]'
                          }`}>
                            {telemetry.temp}°C
                          </span>
                          <span className="text-xs font-mono text-[#657783]">
                            (WBGT {telemetry.wbgt}°)
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                          telemetry.risk === 'EXTREME'
                            ? 'bg-[#F8E9E8] text-[#A63D40] border-[#A63D40]/30'
                            : telemetry.risk === 'VERY_HIGH'
                              ? 'bg-[#FDF0E9] text-[#C65D27] border-[#C65D27]/30'
                              : telemetry.risk === 'HIGH'
                                ? 'bg-[#FDF0E9] text-[#C65D27] border-[#C65D27]/20'
                                : 'bg-[#E8F1F5] text-[#317A5A] border-[#317A5A]/30'
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
              <div className="flex items-center justify-between text-[11px] font-mono text-[#657783]">
                <span>
                  {isHindi 
                    ? `${filteredDistricts.length} जिले प्रदर्शित ${selectedStateFilter !== 'ALL' ? `(${selectedStateFilter})` : ''}`
                    : `Showing ${filteredDistricts.length} Indian Districts ${selectedStateFilter !== 'ALL' ? `in ${selectedStateFilter}` : ''}`}
                </span>
                <span className="text-[#1E5A7A] font-semibold">
                  {isHindi ? 'लाइव मानचित्र व आश्रय देखने हेतु जिला चुनें' : 'Click any district to test live map & shelters'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredDistricts.map((district) => {
                  const isCurrentActive = selectedCity?.name.toLowerCase() === district.name.toLowerCase();
                  return (
                    <button
                      key={`${district.state}-${district.name}`}
                      onClick={() => handleSelectDistrict(district)}
                      className={`p-3 rounded-xl text-left border transition-colors flex flex-col justify-between group cursor-pointer ${
                        isCurrentActive
                          ? 'bg-[#E8F1F5] border-2 border-[#1E5A7A] text-[#12304A] shadow-sm'
                          : 'bg-white hover:bg-[#F4F1EA] border-[#D6E0E5] hover:border-[#1E5A7A] text-[#263746]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-[#12304A] group-hover:text-[#1E5A7A] transition-colors truncate">
                            {district.name}
                          </span>
                          {isCurrentActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5A7A] shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#657783] flex items-center gap-1.5">
                          <span className="text-[#1E5A7A] font-medium truncate">{district.state}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#D6E0E5] flex items-center justify-between text-[9px] font-mono text-[#657783]">
                        <span>{district.lat.toFixed(2)}°N, {district.lng.toFixed(2)}°E</span>
                        <span className="text-[#1E5A7A] font-bold group-hover:translate-x-0.5 transition-transform">
                          {isHindi ? 'जांच करें →' : 'Test →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredDistricts.length === 0 && (
                <div className="p-8 text-center text-[#657783]">
                  <p className="text-sm">
                    {isHindi 
                      ? `"${searchTerm}" के लिए कोई जिला नहीं मिला।`
                      : `No districts matched "${searchTerm}" in ${selectedStateFilter}.`}
                  </p>
                  <p className="text-xs mt-1 text-[#657783]">
                    {isHindi ? 'कृपया बिना फ़िल्टर के खोजें या किसी अन्य कस्बे का नाम दर्ज करें।' : 'Try searching without filters or search any specific town name.'}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#12304A] text-white border-t border-[#1E5A7A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#317A5A]" />
            <span>
              {isHindi ? 'वर्तमान में सक्रिय: ' : 'Currently Active: '}
              <strong className="text-white font-bold">{selectedCity.name}, {selectedCity.state}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#1E5A7A] hover:bg-[#164863] text-white transition-colors text-xs font-semibold cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
