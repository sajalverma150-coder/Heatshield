import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  X, 
  Radio, 
  Pause, 
  Play,
  FileText
} from 'lucide-react';
import { CityData, INDIAN_CITIES } from '../data/indiaCities';
import { WeatherTelemetry } from '../types';
import { CityLiveSummary } from '../services/weatherApiService';

export interface CityHeadline {
  cityId: string;
  cityName: string;
  state: string;
  temp: number;
  heatIndex: number;
  wbgt?: number;
  severity: 'EXTREME' | 'CRITICAL' | 'HIGH' | 'MODERATE';
  grapStage: string;
  headline: string;
  updateTime: string;
}

export const CRUCIAL_CITY_HEADLINES: CityHeadline[] = [
  {
    cityId: 'delhi',
    cityName: 'New Delhi (Safdarjung)',
    state: 'NCT Delhi',
    temp: 47.8,
    heatIndex: 51.4,
    wbgt: 34.6,
    severity: 'EXTREME',
    grapStage: 'GRAP IV CURFEW',
    headline: 'IMD Red Alert Drill: 47.8°C at Safdarjung. Severe Loo winds; outdoor labor halted.',
    updateTime: '14:15 IST',
  },
  {
    cityId: 'phalodi',
    cityName: 'Phalodi',
    state: 'Rajasthan',
    temp: 49.6,
    heatIndex: 52.8,
    wbgt: 35.1,
    severity: 'EXTREME',
    grapStage: 'RED ALERT',
    headline: 'Peak Summer Record Drill: 49.6°C breached. 108 Mobile Resuscitation Ambulances active.',
    updateTime: '14:20 IST',
  },
  {
    cityId: 'nagpur',
    cityName: 'Nagpur',
    state: 'Maharashtra',
    temp: 46.2,
    heatIndex: 49.8,
    wbgt: 33.9,
    severity: 'CRITICAL',
    grapStage: 'ORANGE ALERT',
    headline: 'Vidarbha thermal stress drill. NMC activates 85 misting shelters and cold ORS booths.',
    updateTime: '13:55 IST',
  },
  {
    cityId: 'ahmedabad',
    cityName: 'Ahmedabad',
    state: 'Gujarat',
    temp: 45.8,
    heatIndex: 49.2,
    wbgt: 33.6,
    severity: 'CRITICAL',
    grapStage: 'HEAT ACTION PLAN',
    headline: 'AMC activates Cool Roof protocols and distributes cool water tankers across slum clusters.',
    updateTime: '14:05 IST',
  },
  {
    cityId: 'patna',
    cityName: 'Patna',
    state: 'Bihar',
    temp: 45.1,
    heatIndex: 49.5,
    wbgt: 33.5,
    severity: 'CRITICAL',
    grapStage: 'DISASTER NOTICE',
    headline: 'Bihar Disaster Management Heat Notice. Outdoor coaching centers shut.',
    updateTime: '14:18 IST',
  }
];

interface RollingHeadlinesTickerProps {
  selectedCity?: CityData;
  cities?: CityData[];
  onSelectCity: (city: CityData) => void;
  onOpenReport?: () => void;
  onOpenHealthReport?: () => void;
  onOpenPushSettings?: () => void;
  weather?: WeatherTelemetry;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  citiesLiveWeather?: Record<string, CityLiveSummary>;
}

export const RollingHeadlinesTicker: React.FC<RollingHeadlinesTickerProps> = ({
  selectedCity,
  cities = INDIAN_CITIES,
  onSelectCity,
  onOpenHealthReport,
  weather,
  dataSourceMode = 'live_api',
  citiesLiveWeather,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Dynamic headlines list: current selected city is item #0
  const activeHeadlines = useMemo(() => {
    const list: CityHeadline[] = [];
    const activeCurrentWeather = weather || selectedCity?.weather;

    if (selectedCity && activeCurrentWeather) {
      list.push({
        cityId: selectedCity.id,
        cityName: `${selectedCity.name} (Current)`,
        state: selectedCity.state,
        temp: activeCurrentWeather.dryBulbTemp,
        heatIndex: activeCurrentWeather.heatIndex,
        wbgt: activeCurrentWeather.wbgt,
        severity: (activeCurrentWeather.riskLevel as any) || 'MODERATE',
        grapStage: activeCurrentWeather.grapStage,
        headline: dataSourceMode === 'live_api'
          ? `Live station telemetry: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Humidity: ${activeCurrentWeather.humidity}% • Status: ${activeCurrentWeather.grapStage}`
          : `IMD Heatwave Drill: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Status: ${activeCurrentWeather.grapStage}`,
        updateTime: activeCurrentWeather.lastUpdated,
      });
    }

    CRUCIAL_CITY_HEADLINES.forEach((h) => {
      // Avoid exact duplicate
      if (!selectedCity || selectedCity.id !== h.cityId) {
        if (dataSourceMode === 'live_api' && citiesLiveWeather && citiesLiveWeather[h.cityId]) {
          const live = citiesLiveWeather[h.cityId];
          list.push({
            ...h,
            temp: live.dryBulbTemp,
            heatIndex: live.heatIndex,
            wbgt: live.wbgt,
            severity: (live.riskLevel as any) || 'MODERATE',
            headline: `Live satellite telemetry: ${h.cityName} is at ${live.dryBulbTemp}°C (WBGT ${live.wbgt}°C) • Humidity: ${live.humidity}% • Status: Advisory Active`,
          });
        } else {
          list.push(h);
        }
      }
    });

    return list;
  }, [selectedCity, weather, dataSourceMode, citiesLiveWeather]);

  // Auto-advance through alerts gently every 8 seconds
  useEffect(() => {
    if (!isAutoPlay || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeHeadlines.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isDismissed, activeHeadlines.length]);

  if (isDismissed || activeHeadlines.length === 0) return null;

  const currentItem = activeHeadlines[currentIndex] || activeHeadlines[0];

  const handleCityClick = () => {
    const found = (cities || INDIAN_CITIES).find(
      (c) => c.id.toLowerCase() === currentItem.cityId.toLowerCase() || 
             c.name.toLowerCase().includes(currentItem.cityName.toLowerCase().split(' ')[0])
    );
    if (found) {
      onSelectCity(found);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeHeadlines.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeHeadlines.length) % activeHeadlines.length);
  };

  const isCurrentActiveCity = selectedCity && currentItem.cityId === selectedCity.id;

  return (
    <aside 
      id="permanent-rolling-headlines-ticker"
      aria-label="National Heatwave Alerts Banner"
      className="bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 py-2 text-xs select-none transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: IMD Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-[10px] font-bold ${
            isCurrentActiveCity 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCurrentActiveCity ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span>{isCurrentActiveCity ? 'CURRENT LIVE' : 'IMD ALERT'}</span>
          </div>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            {currentIndex + 1} of {activeHeadlines.length}
          </span>
        </div>

        {/* Center: Current Headline (Clickable) */}
        <div 
          onClick={handleCityClick}
          className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 cursor-pointer group justify-start text-left overflow-hidden"
          title={`Click to view data for ${currentItem.cityName}`}
        >
          <strong className="text-white font-semibold text-[11px] sm:text-xs group-hover:text-orange-400 transition-colors shrink-0">
            <span className="sm:hidden">{currentItem.cityName.split(' ')[0]}</span>
            <span className="hidden sm:inline">{currentItem.cityName}</span>
            <span className="ml-1 text-orange-400 font-mono">({currentItem.temp}°C)</span>:
          </strong>
          <span className="text-slate-300 text-[11px] sm:text-xs truncate max-w-xl group-hover:text-slate-100 transition-colors">
            {currentItem.headline}
          </span>
          <span className="hidden lg:inline text-[10px] font-mono text-orange-400/80 group-hover:underline shrink-0">
            {isCurrentActiveCity ? 'Active Station ✓' : 'Switch to City →'}
          </span>
        </div>

        {/* Right: Controls & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous alert"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isAutoPlay ? 'Pause auto-cycle' : 'Play auto-cycle'}
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next alert"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors ml-1"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
