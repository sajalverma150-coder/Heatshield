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
import { WeatherTelemetry, LanguageCode } from '../types';
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
  language?: LanguageCode;
}

export const RollingHeadlinesTicker: React.FC<RollingHeadlinesTickerProps> = ({
  selectedCity,
  cities = INDIAN_CITIES,
  onSelectCity,
  onOpenHealthReport,
  weather,
  dataSourceMode = 'live_api',
  citiesLiveWeather,
  language = 'en',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const isHindi = language === 'hi';

  // Dynamic headlines list: current selected city is item #0
  const activeHeadlines = useMemo(() => {
    const list: CityHeadline[] = [];
    const activeCurrentWeather = weather || selectedCity?.weather;

    if (selectedCity && activeCurrentWeather) {
      list.push({
        cityId: selectedCity.id,
        cityName: isHindi ? `${selectedCity.name} (वर्तमान)` : `${selectedCity.name} (Current)`,
        state: selectedCity.state,
        temp: activeCurrentWeather.dryBulbTemp,
        heatIndex: activeCurrentWeather.heatIndex,
        wbgt: activeCurrentWeather.wbgt,
        severity: (activeCurrentWeather.riskLevel as any) || 'MODERATE',
        grapStage: activeCurrentWeather.grapStage,
        headline: dataSourceMode === 'live_api'
          ? (isHindi 
              ? `लाइव टेलीमेट्री: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • आर्द्रता: ${activeCurrentWeather.humidity}% • स्थिति: ${activeCurrentWeather.grapStage}`
              : `Live station telemetry: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Humidity: ${activeCurrentWeather.humidity}% • Status: ${activeCurrentWeather.grapStage}`)
          : (isHindi 
              ? `आईएमडी हीटवेव ड्रिल: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • स्थिति: ${activeCurrentWeather.grapStage}`
              : `IMD Heatwave Drill: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Status: ${activeCurrentWeather.grapStage}`),
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
            headline: isHindi 
              ? `लाइव उपग्रह टेलीमेट्री: ${h.cityName} पर तापमान ${live.dryBulbTemp}°C (WBGT ${live.wbgt}°C) • आर्द्रता: ${live.humidity}%`
              : `Live satellite telemetry: ${h.cityName} is at ${live.dryBulbTemp}°C (WBGT ${live.wbgt}°C) • Humidity: ${live.humidity}% • Status: Advisory Active`,
          });
        } else {
          list.push(h);
        }
      }
    });

    return list;
  }, [selectedCity, weather, dataSourceMode, citiesLiveWeather, isHindi]);

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
      className="bg-[#E8F1F5] border-b border-[#D6E0E5] px-3 sm:px-6 py-1.5 text-xs select-none text-[#263746]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Indicator Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
            currentItem.severity === 'severe'
              ? 'bg-[#F8E9E8] border-[#A63D40] text-[#A63D40]'
              : currentItem.severity === 'high'
              ? 'bg-[#FFF4D6] border-[#C65D27] text-[#C65D27]'
              : 'bg-[#FFFFFF] border-[#317A5A] text-[#317A5A]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>
              {currentItem.severity === 'severe' 
                ? (isHindi ? 'आपातकाल' : 'EMERGENCY') 
                : currentItem.severity === 'high' 
                ? (isHindi ? 'चेतावनी' : 'WARNING') 
                : (isHindi ? 'बुलेटिन' : 'BULLETIN')}
            </span>
          </div>
          <span className="text-[#657783] hidden sm:inline text-[10px] font-mono">
            {currentIndex + 1}/{activeHeadlines.length}
          </span>
        </div>

        {/* Center: Current Headline (Clickable) */}
        <div 
          onClick={handleCityClick}
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer group justify-start text-left overflow-hidden"
          title={isHindi ? `${currentItem.cityName} पर स्विच करने हेतु क्लिक करें` : `Click to switch to ${currentItem.cityName}`}
        >
          <span className="text-[#12304A] font-semibold text-xs group-hover:text-[#1E5A7A] transition-colors shrink-0">
            <span className="sm:hidden">{currentItem.cityName.split(' ')[0]}</span>
            <span className="hidden sm:inline">{currentItem.cityName}</span>
            <span className="ml-1 text-[#C65D27] font-mono">({currentItem.temp}°C)</span>
          </span>
          <span className="text-[#657783] text-xs truncate max-w-2xl group-hover:text-[#263746] transition-colors">
            — {currentItem.headline}
          </span>
        </div>

        {/* Right: Controls & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 rounded text-[#657783] hover:text-[#12304A] hover:bg-[#D6E0E5] transition-colors"
            title={isHindi ? 'पिछली चेतावनी' : 'Previous alert'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1 rounded text-[#657783] hover:text-[#12304A] hover:bg-[#D6E0E5] transition-colors"
            title={isAutoPlay ? (isHindi ? 'रोकें' : 'Pause') : (isHindi ? 'चलाएं' : 'Play')}
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#1E5A7A]" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded text-[#657783] hover:text-[#12304A] hover:bg-[#D6E0E5] transition-colors"
            title={isHindi ? 'अगली चेतावनी' : 'Next alert'}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-[#657783] hover:text-[#12304A] transition-colors ml-0.5"
            title={isHindi ? 'बैनर बंद करें' : 'Dismiss banner'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
