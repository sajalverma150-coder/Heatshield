import React, { useState, useEffect } from 'react';
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

export interface CityHeadline {
  cityId: string;
  cityName: string;
  state: string;
  temp: number;
  heatIndex: number;
  wbgt?: number;
  severity: 'EXTREME' | 'CRITICAL' | 'HIGH';
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
    headline: 'IMD Red Alert: 47.8°C at Safdarjung. Severe Loo winds; outdoor construction halted.',
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
    headline: 'All-Time Heatwave Record: 49.6°C breached. 108 Mobile Resuscitation Ambulances active.',
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
    headline: 'Vidarbha thermal stress spike. NMC activates 85 misting shelters and cold ORS booths.',
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
    headline: 'Bihar Disaster Management Statewide Red Heatwave Notice. Outdoor coaching centers shut.',
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
}

export const RollingHeadlinesTicker: React.FC<RollingHeadlinesTickerProps> = ({
  selectedCity,
  cities = INDIAN_CITIES,
  onSelectCity,
  onOpenHealthReport,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Auto-advance through alerts gently every 8 seconds
  useEffect(() => {
    if (!isAutoPlay || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CRUCIAL_CITY_HEADLINES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isDismissed]);

  if (isDismissed) return null;

  const currentItem = CRUCIAL_CITY_HEADLINES[currentIndex];

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
    setCurrentIndex((prev) => (prev + 1) % CRUCIAL_CITY_HEADLINES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CRUCIAL_CITY_HEADLINES.length) % CRUCIAL_CITY_HEADLINES.length);
  };

  return (
    <aside 
      id="permanent-rolling-headlines-ticker"
      aria-label="National Heatwave Alerts Banner"
      className="bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 py-2 text-xs select-none transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: IMD Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>IMD ALERT</span>
          </div>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            {currentIndex + 1} of {CRUCIAL_CITY_HEADLINES.length}
          </span>
        </div>

        {/* Center: Current Headline (Clickable) */}
        <div 
          onClick={handleCityClick}
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer group justify-center text-center sm:text-left"
          title={`Click to view data for ${currentItem.cityName}`}
        >
          <strong className="text-white font-semibold text-xs group-hover:text-orange-400 transition-colors shrink-0">
            {currentItem.cityName} ({currentItem.temp}°C):
          </strong>
          <span className="text-slate-300 text-xs truncate max-w-xl group-hover:text-slate-100 transition-colors">
            {currentItem.headline}
          </span>
          <span className="hidden lg:inline text-[10px] font-mono text-orange-400/80 group-hover:underline shrink-0">
            View Station →
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
            className="p-1 ml-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Dismiss alert banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
